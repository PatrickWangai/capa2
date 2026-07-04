import { prisma } from '../utils/db.js';
import { initiateMpesaSTKPush, checkMpesaStatus } from '../services/mpesaService.js';
import { createNotification } from '../services/notificationService.js';
import Decimal from 'decimal.js';

// POST /api/deposits/mpesa
export async function mpesaDeposit(req, res) {
  const { amount, phone, currency = 'KES' } = req.body;
  const account = await prisma.investmentAccount.findFirst({ where: { userId: req.user.id, isPrimary: true } });

  const tx = await prisma.transaction.create({
    data: { accountId: account.id, type: 'DEPOSIT', status: 'PENDING', amount, currency, description: 'M-Pesa deposit' },
  });

  const mpesaRes = await initiateMpesaSTKPush({ phone, amount, reference: tx.id });

  await prisma.paymentInstruction.create({
    data: { transactionId: tx.id, paymentMethod: 'MPESA', direction: 'in', amount, currency, phoneNumber: phone, providerRef: mpesaRes.CheckoutRequestID, metadata: mpesaRes },
  });

  res.json({ transaction: tx, checkoutRequestId: mpesaRes.CheckoutRequestID, message: 'STK push sent. Enter PIN on your phone.' });
}

// POST /api/deposits/bank
export async function bankDeposit(req, res) {
  const { amount, currency = 'USD', bankName, bankAccount } = req.body;
  const account = await prisma.investmentAccount.findFirst({ where: { userId: req.user.id, isPrimary: true } });

  const tx = await prisma.transaction.create({
    data: { accountId: account.id, type: 'DEPOSIT', status: 'PENDING', amount, currency, description: 'Bank transfer deposit' },
  });

  await prisma.paymentInstruction.create({
    data: { transactionId: tx.id, paymentMethod: 'BANK_TRANSFER', direction: 'in', amount, currency, bankName, bankAccount, providerRef: `BT-${tx.id.slice(0, 8).toUpperCase()}` },
  });

  res.json({
    transaction: tx,
    bankDetails: {
      bankName:      process.env.BANK_NAME        || 'Capa Custodian Bank',
      accountName:   process.env.BANK_ACCOUNT_NAME || 'Capa Investments Ltd',
      accountNumber: process.env.BANK_ACCOUNT_NO   || 'XXXXXXXXXXXX',
      branch:        process.env.BANK_BRANCH        || '',
      paybill:       process.env.BANK_PAYBILL       || '',
      reference: `BT-${tx.id.slice(0, 8).toUpperCase()}`,
      amount,
      currency,
    },
    message: 'Transfer instructions sent. Funds arrive in 1-3 business days.',
  });
}

// POST /api/deposits/confirm (called by webhook or admin)
export async function confirmDeposit(req, res) {
  const { transactionId } = req.body;
  const tx = await prisma.transaction.findUnique({ where: { id: transactionId }, include: { account: true, paymentInstruction: true } });
  if (!tx) return res.status(404).json({ error: 'Transaction not found.' });
  if (tx.status === 'COMPLETED') return res.json({ message: 'Already completed.' });

  await prisma.$transaction(async (db) => {
    await db.transaction.update({ where: { id: tx.id }, data: { status: 'COMPLETED' } });
    await db.paymentInstruction.update({ where: { transactionId: tx.id }, data: { status: 'COMPLETED', confirmedAt: new Date() } });
    await db.accountBalance.upsert({
      where: { accountId_currency: { accountId: tx.accountId, currency: tx.currency } },
      create: { accountId: tx.accountId, currency: tx.currency, available: tx.amount },
      update: { available: { increment: Number(tx.amount) } },
    });
  });

  await createNotification({ userId: tx.account.userId, type: 'DEPOSIT', title: 'Deposit Confirmed', body: `${tx.currency} ${Number(tx.amount).toFixed(2)} has been added to your account.`, metadata: { transactionId } });
  res.json({ message: 'Deposit confirmed and balance updated.' });
}

// POST /api/deposits/withdraw
export async function withdraw(req, res) {
  const { amount, currency, method, phone, bankAccount, bankName } = req.body;
  const account = await prisma.investmentAccount.findFirst({ where: { userId: req.user.id, isPrimary: true }, include: { balances: true } });
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
  const transactions = await prisma.transaction.findMany({
    where: { accountId: account.id, type: { in: ['DEPOSIT', 'WITHDRAWAL'] } },
    include: { paymentInstruction: true },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  res.json({ transactions });
}
