// transactions.js
import { Router } from 'express';
const router = Router();
import auth from '../middleware/authenticate.js';
import { prisma } from '../utils/db.js';
import { clampLimit, clampOffset } from '../utils/pagination.js';
router.get('/', auth, async (req, res) => {
  const limit = clampLimit(req.query.limit, 50);
  const offset = clampOffset(req.query.offset);
  const account = await prisma.investmentAccount.findFirst({ where: { userId: req.user.id, isPrimary: true } });
  if (!account) return res.json({ transactions: [] });
  const transactions = await prisma.transaction.findMany({ where: { accountId: account.id }, orderBy: { createdAt: 'desc' }, take: limit, skip: offset });
  res.json({ transactions });
});
export default router;
