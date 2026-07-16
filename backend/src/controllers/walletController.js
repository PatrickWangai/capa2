import { prisma } from '../utils/db.js';
import Decimal from 'decimal.js';
import { convertAsync, ExchangeRateService, SUPPORTED_CURRENCIES } from '../services/fxService.js';
import { getSupportedPairs } from '../services/fxService.js';
import { mpesaProvider, bankProvider } from '../providers/paymentProvider.js';

// ── helpers ───────────────────────────────────────────────────────────────────
async function getPrimaryAccount(userId) {
  const account = await prisma.investmentAccount.findFirst({
    where: { userId, isPrimary: true, isActive: true },
    include: { balances: true },
  });
  if (!account) throw Object.assign(new Error('No active investment account found.'), { status: 404 });
  return account;
}

/** Ensure every supported currency has a balance row for the account. */
async function ensureAllWallets(accountId) {
  await prisma.$transaction(
    SUPPORTED_CURRENCIES.map(currency =>
      prisma.accountBalance.upsert({
        where:  { accountId_currency: { accountId, currency } },
        create: { accountId, currency, available: 0, reserved: 0 },
        update: {},
      })
    )
  );
}

function formatBalance(bal) {
  return {
    currency:  bal.currency,
    available: Number(bal.available).toFixed(2),
    reserved:  Number(bal.reserved).toFixed(2),
    total:     (Number(bal.available) + Number(bal.reserved)).toFixed(2),
  };
}

// ── GET /api/wallets ──────────────────────────────────────────────────────────
export async function getWallets(req, res) {
  const account = await getPrimaryAccount(req.user.id);

  // Guarantee every currency row exists
  await ensureAllWallets(account.id);

  // Re-fetch with all balances
  const balances = await prisma.accountBalance.findMany({
    where: { accountId: account.id },
    orderBy: { currency: 'asc' },
  });

  const rates = await ExchangeRateService.getAllRates('USD');

  res.json({
    account: {
      id:            account.id,
      accountNumber: account.accountNumber,
      baseCurrency:  account.baseCurrency,
    },
    balances: balances.map(formatBalance),
    rates,
    supportedCurrencies: SUPPORTED_CURRENCIES,
  });
}

// ── GET /api/wallets/fx-rates ─────────────────────────────────────────────────
export async function getFxRates(req, res) {
  const { base = 'USD' } = req.query;
  const rates = await ExchangeRateService.getAllRates(base);
  const pairs = getSupportedPairs();
  res.json({ rates, pairs, base });
}

// ── POST /api/wallets/convert ─────────────────────────────────────────────────
export async function convertCurrency(req, res) {
  const { fromCurrency, toCurrency, amount } = req.body;

  if (fromCurrency === toCurrency) {
    return res.status(400).json({ error: 'Cannot convert a currency to itself.' });
  }
  if (!SUPPORTED_CURRENCIES.includes(fromCurrency) || !SUPPORTED_CURRENCIES.includes(toCurrency)) {
    return res.status(400).json({ error: 'Unsupported currency.' });
  }

  // Get live quote before entering transaction
  const fxResult = await convertAsync(Number(amount), fromCurrency, toCurrency);
  const fromAmt  = new Decimal(amount);
  const toAmt    = new Decimal(fxResult.toAmount);
  const feeAmt   = new Decimal(fxResult.fee);

  const result = await prisma.$transaction(async (db) => {
    const account = await db.investmentAccount.findFirst({
      where:   { userId: req.user.id, isPrimary: true, isActive: true },
      include: { balances: true },
    });
    if (!account) throw Object.assign(new Error('Account not found.'), { status: 404 });

    const fromBal = account.balances.find(b => b.currency === fromCurrency);
    const avail   = fromBal ? new Decimal(fromBal.available.toString()) : new Decimal(0);
    if (avail.lt(fromAmt)) {
      throw Object.assign(
        new Error(`Insufficient ${fromCurrency}. Available: ${avail.toFixed(2)}, required: ${fromAmt.toFixed(2)}.`),
        { status: 400 }
      );
    }

    // Debit source
    await db.accountBalance.upsert({
      where:  { accountId_currency: { accountId: account.id, currency: fromCurrency } },
      create: { accountId: account.id, currency: fromCurrency, available: fromAmt.negated(), reserved: 0 },
      update: { available: { decrement: fromAmt.toNumber() } },
    });

    // Credit destination
    await db.accountBalance.upsert({
      where:  { accountId_currency: { accountId: account.id, currency: toCurrency } },
      create: { accountId: account.id, currency: toCurrency, available: toAmt, reserved: 0 },
      update: { available: { increment: toAmt.toNumber() } },
    });

    // Persist FX record
    const conversion = await db.currencyConversion.create({
      data: {
        accountId:    account.id,
        fromCurrency,
        toCurrency,
        fromAmount:   fromAmt,
        toAmount:     toAmt,
        rate:         fxResult.rate,
        midRate:      fxResult.midRate,
        spread:       fxResult.spread,
        fee:          feeAmt,
        feeCurrency:  toCurrency,
        reference:    fxResult.reference,
        provider:     fxResult.provider,
      },
    });

    // Audit trail
    await db.transaction.create({
      data: {
        accountId:   account.id,
        type:        'FX_CONVERSION',
        status:      'COMPLETED',
        amount:      fromAmt,
        currency:    fromCurrency,
        fxRate:      fxResult.rate,
        fee:         feeAmt,
        description: `FX ${fromCurrency}→${toCurrency} @ ${fxResult.rate.toFixed(6)}`,
        reference:   conversion.id,
        metadata:    { conversionId: conversion.id, toCurrency, toAmount: toAmt.toNumber(), spread: fxResult.spread, midRate: fxResult.midRate },
      },
    });

    return conversion;
  });

  res.json({
    message:    `Converted ${fromCurrency} ${Number(amount).toFixed(2)} → ${toCurrency} ${toAmt.toFixed(2)}`,
    conversion: {
      id:          result.id,
      reference:   result.reference,
      from:        { currency: fromCurrency, amount: Number(amount).toFixed(2) },
      to:          { currency: toCurrency,   amount: toAmt.toFixed(2) },
      rate:        fxResult.rate,
      midRate:     fxResult.midRate,
      spread:      fxResult.spread,
      fee:         feeAmt.toFixed(6),
      feeCurrency: toCurrency,
      provider:    fxResult.provider,
      createdAt:   result.createdAt,
    },
  });
}

// ── GET /api/wallets/conversions ──────────────────────────────────────────────
export async function getConversions(req, res) {
  const { limit = 50, offset = 0 } = req.query;
  const account = await getPrimaryAccount(req.user.id);

  const [conversions, total] = await Promise.all([
    prisma.currencyConversion.findMany({
      where:   { accountId: account.id },
      orderBy: { createdAt: 'desc' },
      take:    Math.min(Number(limit), 200),
      skip:    Number(offset),
    }),
    prisma.currencyConversion.count({ where: { accountId: account.id } }),
  ]);

  res.json({ conversions, total, limit: Number(limit), offset: Number(offset) });
}

// ── GET /api/wallets/transactions ─────────────────────────────────────────────
export async function getWalletTransactions(req, res) {
  const { currency, type, limit = 50, offset = 0 } = req.query;
  const account = await getPrimaryAccount(req.user.id);

  const transactions = await prisma.transaction.findMany({
    where: {
      accountId: account.id,
      ...(currency ? { currency } : {}),
      ...(type     ? { type }     : {}),
    },
    orderBy: { createdAt: 'desc' },
    take:    Math.min(Number(limit), 200),
    skip:    Number(offset),
    include: { paymentInstruction: true },
  });

  res.json({ transactions });
}

// ── POST /api/wallets/deposit ─────────────────────────────────────────────────
export async function deposit(req, res) {
  const { amount, currency = 'KES', method = 'MPESA', phone, bankAccount, bankCode, description } = req.body;

  if (!amount || Number(amount) <= 0) return res.status(400).json({ error: 'Amount must be positive.' });
  if (!SUPPORTED_CURRENCIES.includes(currency)) return res.status(400).json({ error: 'Unsupported currency.' });

  // Call mock provider
  let providerResult;
  try {
    if (method === 'MPESA') {
      providerResult = await mpesaProvider.deposit({ amount, currency, phone, accountRef: `CAPA-DEP-${Date.now()}` });
    } else {
      providerResult = await bankProvider.deposit({ amount, currency, bankAccount, bankCode });
    }
  } catch (err) {
    return res.status(502).json({ error: 'Payment provider unavailable. Try again later.' });
  }

  const result = await prisma.$transaction(async (db) => {
    const account = await db.investmentAccount.findFirst({
      where: { userId: req.user.id, isPrimary: true, isActive: true },
    });
    if (!account) throw Object.assign(new Error('Account not found.'), { status: 404 });

    // Credit balance immediately for mock; real flow awaits webhook
    await db.accountBalance.upsert({
      where:  { accountId_currency: { accountId: account.id, currency } },
      create: { accountId: account.id, currency, available: Number(amount), reserved: 0 },
      update: { available: { increment: Number(amount) } },
    });

    const tx = await db.transaction.create({
      data: {
        accountId:   account.id,
        type:        'DEPOSIT',
        status:      'COMPLETED', // mock always succeeds instantly
        amount:      Number(amount),
        currency,
        description: description ?? `${method} Deposit`,
        reference:   providerResult.providerRef,
        metadata:    { method, mock: true, providerMessage: providerResult.message },
      },
    });

    await db.paymentInstruction.create({
      data: {
        transactionId: tx.id,
        paymentMethod: method === 'MPESA' ? 'MPESA' : 'BANK_TRANSFER',
        direction:     'in',
        amount:        Number(amount),
        currency,
        status:        'COMPLETED',
        providerRef:   providerResult.providerRef,
        phoneNumber:   phone ?? null,
        bankAccount:   bankAccount ?? null,
        bankCode:      bankCode ?? null,
        confirmedAt:   new Date(),
        metadata:      { mock: true },
      },
    });

    return tx;
  });

  res.json({
    message:     `${currency} ${Number(amount).toFixed(2)} deposited successfully.`,
    transaction: result,
    provider:    providerResult,
  });
}

// ── POST /api/wallets/withdraw ────────────────────────────────────────────────
export async function withdraw(req, res) {
  const { amount, currency = 'KES', method = 'MPESA', phone, bankAccount, bankCode } = req.body;

  if (!amount || Number(amount) <= 0) return res.status(400).json({ error: 'Amount must be positive.' });
  if (!SUPPORTED_CURRENCIES.includes(currency)) return res.status(400).json({ error: 'Unsupported currency.' });

  const result = await prisma.$transaction(async (db) => {
    const account = await db.investmentAccount.findFirst({
      where:   { userId: req.user.id, isPrimary: true, isActive: true },
      include: { balances: true },
    });
    if (!account) throw Object.assign(new Error('Account not found.'), { status: 404 });

    const bal   = account.balances.find(b => b.currency === currency);
    const avail = bal ? new Decimal(bal.available.toString()) : new Decimal(0);
    if (avail.lt(Number(amount))) {
      throw Object.assign(new Error(`Insufficient ${currency}. Available: ${avail.toFixed(2)}`), { status: 400 });
    }

    // Reserve funds while withdrawal is pending
    await db.accountBalance.updateMany({
      where: { accountId: account.id, currency },
      data:  { available: { decrement: Number(amount) }, reserved: { increment: Number(amount) } },
    });

    const tx = await db.transaction.create({
      data: {
        accountId:   account.id,
        type:        'WITHDRAWAL',
        status:      'PENDING',
        amount:      Number(amount),
        currency,
        description: `${method} Withdrawal`,
        reference:   `WD-${Date.now()}`,
        metadata:    { method, phone: phone ?? null, bankAccount: bankAccount ?? null, mock: true },
      },
    });

    await db.paymentInstruction.create({
      data: {
        transactionId: tx.id,
        paymentMethod: method === 'MPESA' ? 'MPESA' : 'BANK_TRANSFER',
        direction:     'out',
        amount:        Number(amount),
        currency,
        status:        'PENDING',
        phoneNumber:   phone ?? null,
        bankAccount:   bankAccount ?? null,
        bankCode:      bankCode ?? null,
        metadata:      { mock: true },
      },
    });

    return tx;
  });

  // Call mock provider (non-blocking for mock; real flow would be async via webhook)
  if (method === 'MPESA') {
    mpesaProvider.withdraw({ amount, currency, phone }).catch(() => {});
  } else {
    bankProvider.withdraw({ amount, currency, bankAccount, bankCode }).catch(() => {});
  }

  res.json({
    message:     'Withdrawal request submitted. Funds will arrive in 1–2 business days.',
    transaction: result,
  });
}

// ── Legacy endpoints (kept for backwards compat) ──────────────────────────────
export async function depositKes(req, res) {
  req.body.currency = 'KES';
  req.body.method   = 'MPESA';
  return deposit(req, res);
}

export async function withdrawKes(req, res) {
  req.body.currency = 'KES';
  req.body.method   = req.body.method ?? 'MPESA';
  return withdraw(req, res);
}
