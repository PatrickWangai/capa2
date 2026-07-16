/**
 * FX Service
 *
 * Business logic layer for currency conversion.
 * Delegates to the FXProvider (currently MockFXProvider / open.er-api.com).
 * Swap the provider without touching this file.
 */

import fxProvider from '../providers/fxProvider.js';
import logger from '../utils/logger.js';

// Re-export the provider so walletController can use ExchangeRateService shape
export const ExchangeRateService = {
  async getRate(from, to) {
    if (from === to) return 1;
    const q = await fxProvider.quote(from, to);
    return q.clientRate;
  },

  async getAllRates(base = 'USD') {
    const rates     = await fxProvider.getRates(base);
    const supported = ['USD','GBP','KES','EUR','CAD','AUD','JPY','CHF','HKD','SGD','ZAR'];
    const out       = {};
    for (const ccy of supported) {
      if (ccy !== base) out[`${base}_${ccy}`] = rates[ccy] ?? null;
    }
    // also expose the reciprocals so frontend can do KES_USD etc.
    const baseRate = rates[base] ?? 1;
    for (const ccy of supported) {
      if (ccy !== base) {
        const r      = rates[ccy] ?? 1;
        out[`${ccy}_${base}`] = parseFloat((baseRate / r).toFixed(8));
      }
    }
    out.updatedAt = new Date().toISOString();
    out.source    = 'live';
    return out;
  },
};

/**
 * Convert fromAmount from one currency to another.
 * Returns the full FXConvertResult from the provider.
 */
export async function convertAsync(fromAmount, from, to) {
  if (from === to) {
    return { fromAmount, toAmount: fromAmount, rate: 1, midRate: 1, fee: 0, spread: 0, reference: null, provider: 'identity' };
  }
  const result = await fxProvider.convert(fromAmount, from, to);
  logger.info(`FX convert ${from}→${to}: ${fromAmount} → ${result.toAmount} (rate ${result.rate})`);
  return result;
}

export async function quoteAsync(from, to) {
  return fxProvider.quote(from, to);
}

export function getSupportedPairs() {
  const currencies = ['USD','GBP','KES','EUR','CAD','AUD','JPY','CHF','HKD','SGD','ZAR'];
  const pairs = [];
  for (const from of currencies) {
    for (const to of currencies) {
      if (from !== to) pairs.push({ from, to });
    }
  }
  return pairs;
}

export const SUPPORTED_CURRENCIES = ['USD','GBP','KES','EUR','CAD','AUD','JPY','CHF','HKD','SGD','ZAR'];

// Backwards-compatible sync wrapper (uses cached rates only — not recommended for new code)
export function convert(fromAmount, from, to) {
  // Delegate to async path but return synchronously with a rough approximation
  // Only used in legacy places; prefer convertAsync for new code.
  logger.warn('fxService.convert() sync called — use convertAsync() instead');
  const fallbackRates = { USD:1,GBP:0.79,KES:129.37,EUR:0.92,CAD:1.37,AUD:1.53,JPY:157.4,CHF:0.90,HKD:7.78,SGD:1.35,ZAR:18.15 };
  const feePercent = parseFloat(process.env.FX_FEE_PERCENT || '1');
  const spread     = parseFloat(process.env.FX_SPREAD      || '0.005');
  const fromUsd    = fallbackRates[from] ?? 1;
  const toUsd      = fallbackRates[to]   ?? 1;
  const midRate    = toUsd / fromUsd;
  const clientRate = midRate * (1 - spread);
  const gross      = fromAmount * clientRate;
  const fee        = gross * feePercent / 100;
  const net        = gross - fee;
  return { rate: clientRate, gross, fee, net, feeCurrency: to, spread };
}

logger.info('FX service ready (live rates via open.er-api.com, 1h cache)');
