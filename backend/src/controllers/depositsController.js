import crypto from 'crypto';
import { prisma } from '../utils/db.js';
import { initiateMpesaSTKPush } from '../services/mpesaService.js';
import Decimal from 'decimal.js';
import logger from '../utils/logger.js';

/**
 * The customer is told where to send their money, so a fallback here means
 * telling them to wire it to a placeholder. Returns null rather than inventing
 * an account number; the caller refuses the request instead.
 */
function configuredBankDetails() {
  const bankName = process.env.BANK_NAME;
  const accountName = process.env.BANK_ACCOUNT_NAME;
  const accountNumber = process.env.BANK_ACCOUNT_NO;
  const unusable = (v) => !v || !v.trim() || /^x+$/i.test(v.trim());
  if (unusable(bankName) || unusable(accountName) || unusable(accountNumber)) return null;
  return {
    bankName,
    accountName,
    accountNumber,
    branch: process.env.BANK_BRANCH || '',
    paybill: process.env.BANK_PAYBILL || '',
  };
}

// POST /api/deposits/mpesa
export async function mpesaDeposit(req, res) {
  const { amount, phone, currency = 'KES' } = req.body;
  const account = await prisma.investmentAccount.findFirst({ where: { userId: req.user.id, isPrimary: true } });
  if (!account) return res.status(404).json({ error: 'No active account found.' });

  // Call M-Pesa first — only persist if the STK push succeeds, avoiding dangling PENDING records
  const reference = crypto.randomUUID();
  const mpesaRes = await initiateMpesaSTKPush({ phone, amount, reference });

  const tx = await prisma.transaction.create({
    data: { accountId: account.id, type: 'DEPOSIT', status: 'PENDING', amount, currency, description: 'M-Pesa deposit' },
  });

  await prisma.paymentInstruction.create({
    data: { transactionId: tx.id, paymentMethod: 'MPESA', direction: 'in', amount, currency, phoneNumber: phone, providerRef: mpesaRes.CheckoutRequestID, metadata: mpesaRes },
  });

  res.json({ transaction: tx, checkoutRequestId: mpesaRes.CheckoutRequestID, message: 'STK push sent. Enter PIN on your phone.' });
}

// POST /api/deposits/bank
export async function bankDeposit(req, res) {
  const { amount, currency = 'USD', bankName, bankAccount } = req.body;

  // Checked before anything is written: without real instructions to hand back
  // there is no point creating a PENDING transaction the customer cannot act on.
  const bank = configuredBankDetails();
  if (!bank) {
    logger.error('Bank transfer deposit refused — BANK_NAME / BANK_ACCOUNT_NAME / BANK_ACCOUNT_NO are not configured');
    return res.status(503).json({ error: 'Bank transfer deposits are temporarily unavailable. Please use M-Pesa, or contact support.' });
  }

  const account = await prisma.investmentAccount.findFirst({ where: { userId: req.user.id, isPrimary: true } });
  if (!account) return res.status(404).json({ error: 'No active account found.' });

  const tx = await prisma.transaction.create({
    data: { accountId: account.id, type: 'DEPOSIT', status: 'PENDING', amount, currency, description: 'Bank transfer deposit' },
  });

  await prisma.paymentInstruction.create({
    data: { transactionId: tx.id, paymentMethod: 'BANK_TRANSFER', direction: 'in', amount, currency, bankName, bankAccount, providerRef: `BT-${tx.id.slice(0, 8).toUpperCase()}` },
  });

  res.json({
    transaction: tx,
    bankDetails: {
      ...bank,
      reference: `BT-${tx.id.slice(0, 8).toUpperCase()}`,
      amount,
      currency,
    },
    message: 'Transfer instructions sent. Funds arrive in 1-3 business days.',
  });
}

// POST /api/deposits/withdraw
export async function withdraw(req, res) {
  const { amount, currency, method, phone, bankAccount, bankName } = req.body;
  const account = await prisma.investmentAccount.findFirst({ where: { userId: req.user.id, isPrimary: true }, include: { balances: true } });
  if (!account) return res.status(404).json({ error: 'No active account found.' });
  const balance = account.balances.find(b => b.currency === currency);
  if (!balance || new Decimal(balance.available.toString()).lt(amount)) {
    return res.status(400).json({ error: 'Insufficient balance.' });
  }

  const tx = await prisma.$transaction(async (db) => {
    const t = await db.transaction.create({ data: { accountId: account.id, type: 'WITHDRAWAL', status: 'PENDING', amount, currency, description: `Withdrawal via ${method}` } });
    await db.paymentInstruction.create({ data: { transactionId: t.id, paymentMethod: method, direction: 'out', amount, currency, phoneNumber: phone, bankAccount, bankName } });
    await db.accountBalance.updateMany({ where: { accountId: account.id, currency }, data: { available: { decrement: Number(amount) }, reserved: { increment: Number(amount) } } });
    return t;
  });

  res.json({ transaction: tx, message: 'Withdrawal request submitted. Processing in 1-2 business days.' });
}

// GET /api/deposits/history
export async function getHistory(req, res) {
  const account = await prisma.investmentAccount.findFirst({ where: { userId: req.user.id, isPrimary: true } });
  if (!account) return res.json({ transactions: [] });
  const transactions = await prisma.transaction.findMany({
    where: { accountId: account.id, type: { in: ['DEPOSIT', 'WITHDRAWAL'] } },
    include: { paymentInstruction: true },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  res.json({ transactions });
}
