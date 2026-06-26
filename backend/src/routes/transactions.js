// transactions.js
import { Router } from 'express';
const router = Router();
import auth from '../middleware/authenticate.js';
import { prisma } from '../utils/db.js';
router.get('/', auth, async (req, res) => {
  const { limit = 50, offset = 0 } = req.query;
  const account = await prisma.investmentAccount.findFirst({ where: { userId: req.user.id, isPrimary: true } });
  if (!account) return res.json({ transactions: [] });
  const transactions = await prisma.transaction.findMany({ where: { accountId: account.id }, orderBy: { createdAt: 'desc' }, take: Number(limit), skip: Number(offset) });
  res.json({ transactions });
});
export default router;
