import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { prisma } from '../utils/db.js';
import { redis } from '../utils/redis.js';
import logger from '../utils/logger.js';
import { sendEmail, sendPasswordResetEmail, sendVerifyEmail } from '../services/emailService.js';

const ACCESS_TTL = process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_DAYS = 30;
const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || process.env.ACCESS_TOKEN_SECRET || 'dev-access-secret';
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || process.env.REFRESH_TOKEN_SECRET || 'dev-refresh-secret';

const sign = (sub, secret, expiresIn) =>
  jwt.sign({ sub }, secret, { expiresIn });

async function saveRefreshToken(userId, token, req) {
  const hash = await bcrypt.hash(token, 8);
  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hash,
      expiresAt: new Date(Date.now() + REFRESH_DAYS * 86_400_000),
      ipAddress: req.ip,
      deviceInfo: req.get('user-agent'),
    },
  });
}

function issueTokens(userId, email) {
  const access = sign(userId, ACCESS_TOKEN_SECRET, ACCESS_TTL);
  const refresh = sign(userId, REFRESH_TOKEN_SECRET, `${REFRESH_DAYS}d`);
  return { access, refresh }
}

// POST /api/auth/register
export async function register(req, res) {
  const { email, password, firstName, lastName, phone, country } = req.body;

  const exists = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (exists) return res.status(409).json({ error: 'Email already registered.' });

  if (phone) {
    const phoneExists = await prisma.user.findUnique({ where: { phone } });
    if (phoneExists) return res.status(409).json({ error: 'Phone number already registered.' });
  }

  const passwordHash = await bcrypt.hash(password, Number(process.env.BCRYPT_ROUNDS) || 12);
  const referralCode = Math.random().toString(36).slice(2, 10).toUpperCase();

  let user;
  try {
    user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        firstName,
        lastName,
        phone: phone || null,
        countryOfResidence: country,
        referralCode,
        accounts: {
          create: {
            accountNumber: 'IG' + Date.now().toString().slice(-8),
            isPrimary: true,
            baseCurrency: country === 'KE' ? 'KES' : country === 'GB' ? 'GBP' : 'USD',
            balances: {
              create: [
                { currency: 'USD', available: 0 },
                { currency: 'KES', available: 0 },
                { currency: 'GBP', available: 0 },
              ],
            },
          },
        },
        watchlists: { create: { name: 'My Watchlist', isDefault: true } },
      },
      select: { id: true, email: true, firstName: true, lastName: true, kycStatus: true, status: true },
    });
  } catch (err) {
    if (err.cause?.originalCode === '23505') {
      const field = err.cause.constraint?.fields?.[0] || 'field';
      return res.status(409).json({ error: `${field === 'phone' ? 'Phone number' : 'Email'} already registered.` });
    }
    throw err;
  }

  const { access, refresh } = issueTokens(user.id, user.email);
  await saveRefreshToken(user.id, refresh, req);

  // Send email verification
  const verifyToken = crypto.randomBytes(32).toString('hex');
  await redis.setex(`verify:${verifyToken}`, 86400, user.id); // 24h
  sendVerifyEmail(user.email, verifyToken, user.firstName)
    .catch(e => logger.warn('Verification email failed', { error: e.message }));

  res.status(201).json({ user, accessToken: access, refreshToken: refresh });
}

// POST /api/auth/login
export async function login(req, res) {
  const { email, password, mfaCode } = req.body;

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  const delay = 200 + Math.random() * 200;

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    await new Promise(r => setTimeout(r, delay));
    return res.status(401).json({ error: 'Invalid email or password.' });
  }
  if (user.status === 'SUSPENDED') return res.status(403).json({ error: 'Account suspended. Contact support.' });
  if (user.status === 'CLOSED') return res.status(403).json({ error: 'Account closed.' });

  if (user.mfaEnabled) {
    if (!mfaCode) return res.status(200).json({ requiresMfa: true });
    const valid = speakeasy.totp.verify({ secret: user.mfaSecret, encoding: 'base32', token: mfaCode, window: 1 });
    if (!valid) return res.status(401).json({ error: 'Invalid MFA code.' });
  }

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  const adminRole = await prisma.userRole.findUnique({ where: { userId: user.id }, select: { role: true } });

  const { access, refresh } = issueTokens(user.id, user.email);
  await saveRefreshToken(user.id, refresh, req);

  res.json({
    user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, kycStatus: user.kycStatus, status: user.status, adminRole: adminRole?.role ?? null },
    accessToken: access,
    refreshToken: refresh,
  });
}

// POST /api/auth/refresh
export async function refresh(req, res) {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'Refresh token required.' });

  let payload;
  try { payload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET); }
  catch { return res.status(401).json({ error: 'Invalid refresh token.' }); }

  const stored = await prisma.refreshToken.findMany({
    where: { userId: payload.sub, revokedAt: null, expiresAt: { gt: new Date() } },
  });

  let match = null;
  for (const t of stored) {
    if (await bcrypt.compare(refreshToken, t.tokenHash)) { match = t; break; }
  }
  if (!match) return res.status(401).json({ error: 'Refresh token not valid.' });

  await prisma.refreshToken.update({ where: { id: match.id }, data: { revokedAt: new Date() } });

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  const { access, refresh: newRefresh } = issueTokens(user.id, user.email);
  await saveRefreshToken(user.id, newRefresh, req);

  res.json({ accessToken: access, refreshToken: newRefresh });
}

// POST /api/auth/logout
export async function me(req, res) {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, email: true, firstName: true, lastName: true, kycStatus: true, status: true },
  });
  if (!user) return res.status(404).json({ error: 'User not found.' });
  const adminRole = await prisma.userRole.findUnique({ where: { userId: user.id }, select: { role: true } });
  res.json({ user: { ...user, adminRole: adminRole?.role ?? null } });
}

export async function logout(req, res) {
  const token = req.headers.authorization?.slice(7);
  if (token) {
    const decoded = jwt.decode(token);
    const ttl = (decoded?.exp || 0) - Math.floor(Date.now() / 1000);
    if (ttl > 0) await redis.setex(`blacklist:${token}`, ttl, '1');
  }
  const { refreshToken } = req.body;
  if (refreshToken) {
    const stored = await prisma.refreshToken.findMany({ where: { userId: req.user.id, revokedAt: null } });
    for (const t of stored) {
      if (await bcrypt.compare(refreshToken, t.tokenHash)) {
        await prisma.refreshToken.update({ where: { id: t.id }, data: { revokedAt: new Date() } });
        break;
      }
    }
  }
  res.json({ message: 'Logged out.' });
}

// POST /api/auth/mfa/setup
export async function mfaSetup(req, res) {
  const secret = speakeasy.generateSecret({ name: `Capa:${req.user.email}`, length: 20 });
  await prisma.user.update({ where: { id: req.user.id }, data: { mfaSecret: secret.base32 } });
  const qrCode = await QRCode.toDataURL(secret.otpauth_url);
  res.json({ secret: secret.base32, qrCode });
}

// POST /api/auth/mfa/verify
export async function mfaVerify(req, res) {
  const { code } = req.body;
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  const valid = speakeasy.totp.verify({ secret: user.mfaSecret, encoding: 'base32', token: code, window: 1 });
  if (!valid) return res.status(400).json({ error: 'Invalid code.' });
  await prisma.user.update({ where: { id: req.user.id }, data: { mfaEnabled: true } });
  res.json({ message: 'MFA enabled successfully.' });
}

// POST /api/auth/forgot-password
export async function forgotPassword(req, res) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required.' });
  // Always return 200 to prevent email enumeration
  res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } }).catch(() => null);
  if (!user) return;
  const token = crypto.randomBytes(32).toString('hex');
  await redis.setex(`reset:${token}`, 3600, user.id); // 1 hour
  sendPasswordResetEmail(user.email, token).catch(e => logger.warn('Reset email failed', { error: e.message }));
}

// POST /api/auth/reset-password
export async function resetPassword(req, res) {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ error: 'Token and new password required.' });
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  const userId = await redis.get(`reset:${token}`);
  if (!userId) return res.status(400).json({ error: 'Invalid or expired reset link.' });
  const passwordHash = await bcrypt.hash(password, Number(process.env.BCRYPT_ROUNDS) || 12);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  await redis.del(`reset:${token}`);
  // Revoke all refresh tokens for security
  await prisma.refreshToken.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } });
  res.json({ message: 'Password reset successfully. Please log in.' });
}

// POST /api/auth/verify-email
export async function verifyEmail(req, res) {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'Verification token required.' });
  const userId = await redis.get(`verify:${token}`);
  if (!userId) return res.status(400).json({ error: 'Invalid or expired verification link.' });
  await prisma.user.update({ where: { id: userId }, data: { status: 'ACTIVE' } });
  await redis.del(`verify:${token}`);
  res.json({ message: 'Email verified successfully.' });
}

// POST /api/auth/resend-verification
export async function resendVerification(req, res) {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) return res.status(404).json({ error: 'User not found.' });
  if (user.status === 'ACTIVE') return res.json({ message: 'Email already verified.' });
  const token = crypto.randomBytes(32).toString('hex');
  await redis.setex(`verify:${token}`, 86400, user.id);
  sendVerifyEmail(user.email, token, user.firstName).catch(e => logger.warn('Resend verify failed', { error: e.message }));
  res.json({ message: 'Verification email sent.' });
}

// PUT /api/auth/profile
export async function updateProfile(req, res) {
  const { firstName, lastName, phone, dateOfBirth, addressLine1, addressLine2, city, postalCode } = req.body;
  const updated = await prisma.user.update({
    where: { id: req.user.id },
    data: { firstName, lastName, phone: phone || null, dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined, addressLine1, addressLine2, city, postalCode },
    select: { id: true, email: true, firstName: true, lastName: true, phone: true, dateOfBirth: true, addressLine1: true, addressLine2: true, city: true, postalCode: true, kycStatus: true, status: true, createdAt: true },
  });
  res.json(updated);
}

// PUT /api/auth/change-password
export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Both passwords required.' });
  if (newPassword.length < 8) return res.status(400).json({ error: 'New password must be at least 8 characters.' });
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
    return res.status(400).json({ error: 'Current password is incorrect.' });
  }
  const passwordHash = await bcrypt.hash(newPassword, Number(process.env.BCRYPT_ROUNDS) || 12);
  await prisma.user.update({ where: { id: req.user.id }, data: { passwordHash } });
  res.json({ message: 'Password changed successfully.' });
}
