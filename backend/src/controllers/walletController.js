import { prisma } from '../utils/db.js';
import Decimal from 'decimal.js';
import { convert, getSupportedPairs, ExchangeRateService } from '../services/fxService.js';

// ── helpers ───────────────────────────────────────────────────
async function getPrimaryAccount(userId) {
  const account = await prisma.investmentAccount.findFirst({
    where: { userId, isPrimary: true, isActive: true },
    include: { balances: true },
  });
  if (!account) throw Object.assign(new Error('No active investment account found.'), { status: 404 });
  return account;
}

function getBalance(account, currency) {
  const bal = account.balances.find(b => b.currency === currency);
  return bal ? new Decimal(bal.available.toString()) : new Decimal(0);
}

// ── GET /api/wallets ──────────────────────────────────────────
export async function getWallets(req, res) {
  const account = await getPrimaryAccount(req.user.id);

  const KES_CURRENCIES = ['KES'];
  const USD_CURRENCIES = ['USD'];

  const fmt = (bal) => ({
    currency:  bal.currency,
    available: Number(bal.available).toFixed(2),
    reserved:  Number(bal.reserved).toFixed(2),
    total:     (Number(bal.available) + Number(bal.reserved)).toFixed(2),
  });

  const allBalances = account.balances.map(fmt);
  const rates       = await ExchangeRateService.getAllRates();

  // Ensure KES and USD rows always exist even if zero
  const ensure = (currency) => {
    if (!allBalances.find(b => b.currency === currency)) {
      allBalances.push({ currency, available: '0.00', reserved: '0.00', total: '0.00' });
    }
  };
  ensure('KES');
  ensure('USD');

  res.json({
    account: {
      id:            account.id,
      accountNumber: account.accountNumber,
      baseCurrency:  account.baseCurrency,
    },
    balances: allBalances,
    rates,
  });
}

// ── POST /api/wallets/convert ─────────────────────────────────
export async function convertCurrency(req, res) {
  const { fromCurrency, toCurrency, amount } = req.body;

  if (fromCurrency === toCurrency) {
    return res.status(400).json({ error: 'Cannot convert a currency to itself.' });
  }

  const { rate, fee, net } = convert(Number(amount), fromCurrency, toCurrency);
  const fromAmount = new Decimal(amount);
  const toAmount   = new Decimal(net);
  const feeAmount  = new Decimal(fee);

  // Atomic: check balance → debit from → credit to → record conversion
  const result = await prisma.$transaction(async (db) => {
    const account = await db.investmentAccount.findFirst({
      where: { userId: req.user.id, isPrimary: true, isActive: true },
      include: { balances: true },
    });
    if (!account) throw Object.assign(new Error('Account not found.'), { status: 404 });

    const fromBal = account.balances.find(b => b.currency === fromCurrency);
    const avail   = fromBal ? new Decimal(fromBal.available.toString()) : new Decimal(0);
    if (avail.lt(fromAmount)) {
      throw Object.assign(
        new Error(`Insufficient ${fromCurrency} balance. Available: ${avail.toFixed(2)}, required: ${fromAmount.toFixed(2)}.`),
        { status: 400 }
      );
    }

    // Debit source
    await db.accountBalance.upsert({
      where: { accountId_currency: { accountId: account.id, currency: fromCurrency } },
      create: { accountId: account.id, currency: fromCurrency, available: fromAmount.negated(), reserved: 0 },
      update: { available: { decrement: fromAmount.toNumber() } },
    });

    // Credit destination
    await db.accountBalance.upsert({
      where: { accountId_currency: { accountId: account.id, currency: toCurrency } },
      create: { accountId: account.id, currency: toCurrency, available: toAmount, reserved: 0 },
      update: { available: { increment: toAmount.toNumber() } },
    });

    // Persist FX event
    const conversion = await db.currencyConversion.create({
      data: {
        accountId:    account.id,
        fromCurrency,
        toCurrency,
        fromAmount,
        toAmount,
        rate,
        fee:          feeAmount,
        feeCurrency:  toCurrency,
      },
    });

    // Audit transaction record (FX_CONVERSION type)
    await db.transaction.create({
      data: {
        accountId:   account.id,
        type:        'FX_CONVERSION',
        status:      'COMPLETED',
        amount:      fromAmount,
        currency:    fromCurrency,
        fxRate:      rate,
        fee:         feeAmount,
        description: `FX ${fromCurrency} → ${toCurrency} @ ${rate}`,
        reference:   conversion.id,
        metadata:    { conversionId: conversion.id, toCurrency, toAmount: toAmount.toNumber() },
      },
    });

    return { conversion, account };
  });

  res.json({
    message: `Converted ${fromCurrency} ${Number(amount).toFixed(2)} → ${toCurrency} ${toAmount.toFixed(2)}`,
    conversion: {
      id:           result.conversion.id,
      from:         { currency: fromCurrency, amount: Number(amount).toFixed(2) },
      to:           { currency: toCurrency,   amount: toAmount.toFixed(2)       },
      rate,
      fee:          feeAmount.toFixed(4),
      feeCurrency:  toCurrency,
      createdAt:    result.conversion.createdAt,
    },
  });
}

// ── GET /api/wallets/conversions ──────────────────────────────
export async function getConversions(req, res) {
  const { limit = 50, offset = 0 } = req.query;
  const account = await getPrimaryAccount(req.user.id);

  const [conversions, total] = await Promise.all([
    prisma.currencyConversion.findMany({
      where:   { accountId: account.id },
      orderBy: { createdAt: 'desc' },
      take:    Math.min(Number(limit), 100),
      skip:    Number(offset),
    }),
    prisma.currencyConversion.count({ where: { accountId: account.id } }),
  ]);

  res.json({ conversions, total, limit: Number(limit), offset: Number(offset) });
}

// ── GET /api/wallets/transactions ─────────────────────────────
export async function getWalletTransactions(req, res) {
  const { currency, limit = 50 } = req.query;
  const account = await getPrimaryAccount(req.user.id);

  const where = {
    accountId: account.id,
    ...(currency ? { currency } : {}),
  };

  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take:    Math.min(Number(limit), 100),
  });

  res.json({ transactions });
}

// ── GET /api/wallets/fx-rates ─────────────────────────────────
export async function getFxRates(req, res) {
  const rates  = await ExchangeRateService.getAllRates();
  const pairs  = getSupportedPairs();
  res.json({ rates, pairs });
}

// ── POST /api/wallets/deposit-kes ─────────────────────────────
// Mock KES deposit — credits balance immediately (no real M-Pesa call).
export async function depositKes(req, res) {
  const { amount, description = 'KES Deposit' } = req.body;
  if (!amount || Number(amount) <= 0) {
    return res.status(400).json({ error: 'Amount must be positive.' });
  }

  const result = await prisma.$transaction(async (db) => {
    const account = await db.investmentAccount.findFirst({
      where: { userId: req.user.id, isPrimary: true, isActive: true },
    });
    if (!account) throw Object.assign(new Error('Account not found.'), { status: 404 });

    // Credit KES balance
    await db.accountBalance.upsert({
      where:  { accountId_currency: { accountId: account.id, currency: 'KES' } },
      create: { accountId: account.id, currency: 'KES', available: Number(amount), reserved: 0 },
      update: { available: { increment: Number(amount) } },
    });

    // Record transaction
    const tx = await db.transaction.create({
      data: {
        accountId:   account.id,
        type:        'DEPOSIT',
        status:      'COMPLETED',
        amount:      Number(amount),
        currency:    'KES',
        description,
        reference:   `KES-DEP-${Date.now()}`,
        metadata:    { mock: true, note: 'TODO: Replace with real M-Pesa webhook confirmation' },
      },
    });

    return { tx, accountId: account.id };
  });

  res.json({
    message: `KES ${Number(amount).toFixed(2)} deposited successfully.`,
    transaction: result.tx,
    // TODO: In production, return providerRef and await M-Pesa confirmation webhook
  });
}

// ── POST /api/wallets/withdraw-kes ────────────────────────────
// Mock KES withdrawal — debits balance and creates PENDING withdrawal.
export async function withdrawKes(req, res) {
  const { amount, phone, description = 'KES Withdrawal' } = req.body;
  if (!amount || Number(amount) <= 0) {
    return res.status(400).json({ error: 'Amount must be positive.' });
  }

  const result = await prisma.$transaction(async (db) => {
    const account = await db.investmentAccount.findFirst({
      where:   { userId: req.user.id, isPrimary: true, isActive: true },
      include: { balances: true },
    });
    if (!account) throw Object.assign(new Error('Account not found.'), { status: 404 });

    const kesBal = account.balances.find(b => b.currency === 'KES');
    const avail  = kesBal ? new Decimal(kesBal.available.toString()) : new Decimal(0);
    if (avail.lt(Number(amount))) {
      throw Object.assign(
        new Error(`Insufficient KES balance. Available: ${avail.toFixed(2)}`),
        { status: 400 }
      );
    }

    await db.accountBalance.updateMany({
      where: { accountId: account.id, currency: 'KES' },
      data:  { available: { decrement: Number(amount) }, reserved: { increment: Number(amount) } },
    });

    const tx = await db.transaction.create({
      data: {
        accountId:   account.id,
        type:        'WITHDRAWAL',
        status:      'PENDING',
        amount:      Number(amount),
        currency:    'KES',
        description,
        reference:   `KES-WD-${Date.now()}`,
        metadata:    { phone, mock: true, note: 'TODO: Replace with real M-Pesa B2C disbursement' },
      },
    });

    return { tx };
  });

  res.json({
    message: 'Withdrawal request submitted. Funds will arrive in 1-2 business days.',
    transaction: result.tx,
  });
}
