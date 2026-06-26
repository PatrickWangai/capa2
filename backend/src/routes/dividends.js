import { Router } from 'express';
import auth from '../middleware/authenticate.js';
import requireAdmin from '../middleware/requireAdmin.js';
import { prisma } from '../utils/db.js';
import { processDividends } from '../jobs/dividendJob.js';

const router = Router();

// GET /api/dividends — upcoming dividends for assets the user holds
router.get('/', auth, async (req, res) => {
  const account = await prisma.investmentAccount.findFirst({ where: { userId: req.user.id, isPrimary: true }, include: { positions: { select: { assetId: true } } } });
  if (!account) return res.json({ dividends: [] });

  const assetIds = account.positions.map(p => p.assetId);
  const dividends = await prisma.dividend.findMany({
    where: { assetId: { in: assetIds }, payDate: { gte: new Date() } },
    include: { asset: { select: { symbol: true, name: true, currency: true } } },
    orderBy: { payDate: 'asc' },
    take: 20,
  });
  res.json({ dividends });
});

// GET /api/dividends/history — paid dividends for this user
router.get('/history', auth, async (req, res) => {
  const account = await prisma.investmentAccount.findFirst({ where: { userId: req.user.id, isPrimary: true } });
  if (!account) return res.json({ payments: [] });
  const payments = await prisma.dividendPayment.findMany({
    where: { accountId: account.id },
    include: { dividend: { include: { asset: { select: { symbol: true, name: true } } } } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  res.json({ payments });
});

// ADMIN: POST /api/dividends — create a dividend
router.post('/', auth, requireAdmin('OPERATIONS', 'SUPERADMIN'), async (req, res) => {
  const { assetId, exDividendDate, recordDate, payDate, amountPerShare, currency, dividendType = 'regular' } = req.body;
  const dividend = await prisma.dividend.create({
    data: { assetId, exDividendDate: new Date(exDividendDate), recordDate: recordDate ? new Date(recordDate) : null, payDate: payDate ? new Date(payDate) : null, amountPerShare, currency, dividendType },
    include: { asset: { select: { symbol: true } } },
  });
  res.status(201).json({ dividend, message: 'Dividend created. It will be processed on pay date.' });
});

// ADMIN: POST /api/dividends/:id/process — manually trigger processing
router.post('/:id/process', auth, requireAdmin('OPERATIONS', 'SUPERADMIN'), async (req, res) => {
  await processDividends();
  res.json({ message: 'Dividend processing triggered.' });
});

export default router;
