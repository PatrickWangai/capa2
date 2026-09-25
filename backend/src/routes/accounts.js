import { Router } from 'express';
const router = Router();
import auth from '../middleware/authenticate.js';
import { prisma } from '../utils/db.js';
router.get('/', auth, async (req, res) => {
  const accounts = await prisma.investmentAccount.findMany({ where: { userId: req.user.id }, include: { balances: true } });
  res.json({ accounts });
});
export default router;
