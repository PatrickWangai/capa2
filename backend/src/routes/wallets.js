import { Router } from 'express';
import auth from '../middleware/authenticate.js';
import { prisma } from '../utils/db.js';
import validate from '../middleware/validate.js';
import { walletConvertSchema } from '../validation/schemas.js';
const router = Router();

// GET /api/wallets — return all balances for the primary account
router.get('/', auth, async (req, res) => {
  const account = await prisma.investmentAccount.findFirst({
    where: { userId: req.user.id, isPrimary: true },
    include: {
      balances: true,
      _count: { select: { positions: true, orders: true } },
    },
  });
  if (!account) return res.status(404).json({ error: 'Account not found.' });

  const balances = account.balances.map(b => ({
    currency: b.currency,
    available: Number(b.available).toFixed(6),
    reserved: Number(b.reserved).toFixed(6),
    total: (Number(b.available) + Number(b.reserved)).toFixed(6),
  }));

  res.json({
    account: {
      id: account.id,
      accountNumber: account.accountNumber,
      baseCurrency: account.baseCurrency,
      positionCount: account._count.positions,
      orderCount: account._count.orders,
    },
    balances,
  });
});

// POST /api/wallets/convert — FX conversion between currencies (stub)
router.post('/convert', auth, validate(walletConvertSchema), async (req, res) => {
  const { fromCurrency, toCurrency, amount } = req.body;
  // Placeholder FX rates (production: use live FX API)
  const rates = { USD_KES: 129.5, KES_USD: 1 / 129.5, USD_GBP: 0.79, GBP_USD: 1 / 0.79, KES_GBP: 0.0061, GBP_KES: 163 }
  const key = `${fromCurrency}_${toCurrency}`;
  const rate = rates[key];
  if (!rate) return res.status(400).json({ error: `Conversion ${key} not supported.` });

  const converted = (Number(amount) * rate).toFixed(2);
  res.json({ from: { currency: fromCurrency, amount }, to: { currency: toCurrency, amount: converted }, rate, fee: (Number(amount) * 0.005).toFixed(4) });
});

export default router;
