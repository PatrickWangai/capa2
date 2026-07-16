import logger from '../utils/logger.js';

// TODO: Replace with a live FX provider (e.g. Open Exchange Rates, Fixer.io, or a
// Kenyan bank API) by implementing ExchangeRateService interface below.

// ── Configuration ─────────────────────────────────────────────
const BASE_USD_KES   = parseFloat(process.env.FX_RATE_USD_KES  || '130');
const FX_FEE_PERCENT = parseFloat(process.env.FX_FEE_PERCENT   || '1');   // 1 % default

// Supported pairs. Extend as more currencies are added.
const RATES = {
  USD_KES: BASE_USD_KES,
  KES_USD: 1 / BASE_USD_KES,
};

// ── ExchangeRateService interface ─────────────────────────────
// TODO: Implement this interface against a real provider.
export const ExchangeRateService = {
  /** Returns spot rate for the pair (fromCurrency → toCurrency). */
  async getRate(fromCurrency, toCurrency) {
    return getRate(fromCurrency, toCurrency);
  },
  /** Returns all supported spot rates keyed as "FROM_TO". */
  async getAllRates() {
    return { ...RATES, updatedAt: new Date().toISOString(), source: 'mock' };
  },
};

// ── Core helpers ──────────────────────────────────────────────
export function getRate(from, to) {
  if (from === to) return 1;
  const key = `${from}_${to}`;
  const rate = RATES[key];
  if (!rate) throw new Error(`FX pair not supported: ${from} → ${to}`);
  return rate;
}

/**
 * Convert `fromAmount` from `from` to `to`.
 * Returns gross, fee (deducted from the received amount), and net.
 */
export function convert(fromAmount, from, to) {
  const rate    = getRate(from, to);
  const gross   = parseFloat((fromAmount * rate).toFixed(6));
  const fee     = parseFloat((gross * FX_FEE_PERCENT / 100).toFixed(6));
  const net     = parseFloat((gross - fee).toFixed(6));
  return { rate, gross, fee, net, feeCurrency: to };
}

export function getSupportedPairs() {
  return Object.keys(RATES).map(key => {
    const [from, to] = key.split('_');
    return { from, to, rate: RATES[key] };
  });
}

logger.info(`FX service loaded (mock) — 1 USD = ${BASE_USD_KES} KES, fee ${FX_FEE_PERCENT}%`);
