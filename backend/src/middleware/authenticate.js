import jwt from 'jsonwebtoken';
import { redis } from '../utils/redis.js';
import { prisma } from '../utils/db.js';
import { ACCESS_TOKEN_SECRET } from '../config/jwt.js';
import logger from '../utils/logger.js';

export default async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'No token provided.' });

  const token = auth.slice(7);

  // Blacklist is defense-in-depth on top of short-lived JWTs — if Redis is
  // temporarily down, fail open here rather than locking out every session.
  let blacklisted = false;
  try {
    blacklisted = await redis.get(`blacklist:${token}`);
  } catch (err) {
    logger.warn('Blacklist check failed (Redis unavailable) — proceeding without it', { error: err.message });
  }
  if (blacklisted) return res.status(401).json({ error: 'Token revoked.' });

  try {
    const payload = jwt.verify(token, ACCESS_TOKEN_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, status: true, kycStatus: true, mfaEnabled: true },
    });
    if (!user || user.status === 'CLOSED') return res.status(401).json({ error: 'Account not found.' });
    if (user.status === 'SUSPENDED') return res.status(403).json({ error: 'Account suspended.' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}
