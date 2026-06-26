import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { prisma } from '../utils/db.js';
import { redis } from '../utils/redis.js';
import logger from '../utils/logger.js';
import { sendEmail } from '../services/emailService.js';

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

  const passwordHash = await bcrypt.hash(password, Number(process.env.BCRYPT_ROUNDS) || 12);
  const referralCode = Math.random().toString(36).slice(2, 10).toUpperCase();

  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      passwordHash,
      firstName,
      lastName,
      phone,
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

  const { access, refresh } = issueTokens(user.id, user.email);
  await saveRefreshToken(user.id, refresh, req);

  sendEmail({
    to: user.email,
    subject: 'Welcome to Capa!',
    html: `<h1>Hi ${user.firstName},</h1><p>Your account is ready. Complete KYC to start investing.</p>`,
  }).catch(e => logger.warn('Welcome email failed', { error: e.message }));

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

  const { access, refresh } = issueTokens(user.id, user.email);
  await saveRefreshToken(user.id, refresh, req);

  res.json({
    user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, kycStatus: user.kycStatus, status: user.status },
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
