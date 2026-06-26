import jwt from 'jsonwebtoken';
import { redis } from '../utils/redis.js';
import { prisma } from '../utils/db.js';

const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || process.env.ACCESS_TOKEN_SECRET || 'dev-access-secret';

export default async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'No token provided.' });

  const token = auth.slice(7);
  try {
    // Check blacklist
    const blacklisted = await redis.get(`blacklist:${token}`);
    if (blacklisted) return res.status(401).json({ error: 'Token revoked.' });

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
