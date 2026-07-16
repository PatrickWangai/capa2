import logger from '../utils/logger.js';

// ── Configuration ─────────────────────────────────────────────
const FX_FEE_PERCENT  = parseFloat(process.env.FX_FEE_PERCENT || '1'); // 1% default
const FALLBACK_RATE   = parseFloat(process.env.FX_RATE_USD_KES || '130'); // used if API fails
const CACHE_TTL_MS    = 60 * 60 * 1000; // 1 hour
const FX_API_BASE     = 'https://open.er-api.com/v6/latest';

// ── In-memory rate cache ──────────────────────────────────────
let _cache = {
  rates:     null,   // { USD_KES: number, KES_USD: number, ... }
  fetchedAt: 0,
  source:    'none',
};

async function fetchLiveRates() {
  const res  = await fetch(`${FX_API_BASE}/USD`, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`FX API returned ${res.status}`);
  const data = await res.json();
  if (data.result !== 'success') throw new Error('FX API result not success');

  const r = data.rates;
  return {
    USD_KES: r.KES,
    KES_USD: 1 / r.KES,
    USD_USD: 1,
    KES_KES: 1,
    updatedAt: data.time_last_update_utc,
  };
}

async function getRates() {
  const now = Date.now();
  if (_cache.rates && now - _cache.fetchedAt < CACHE_TTL_MS) {
    return _cache.rates;
  }

  try {
    const rates = await fetchLiveRates();
    _cache = { rates, fetchedAt: now, source: 'live' };
    logger.info(`FX rates refreshed — 1 USD = ${rates.USD_KES.toFixed(4)} KES`);
    return rates;
  } catch (err) {
    logger.warn(`FX API fetch failed (${err.message}), using fallback rate ${FALLBACK_RATE}`);
    const fallback = {
      USD_KES: FALLBACK_RATE,
      KES_USD: 1 / FALLBACK_RATE,
      USD_USD: 1,
      KES_KES: 1,
      updatedAt: new Date().toISOString(),
    };
    // Cache fallback for 5 minutes so we retry sooner
    _cache = { rates: fallback, fetchedAt: now - CACHE_TTL_MS + 5 * 60 * 1000, source: 'fallback' };
    return fallback;
  }
}

// ── ExchangeRateService interface ─────────────────────────────
export const ExchangeRateService = {
  async getRate(fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) return 1;
    const rates = await getRates();
    const key   = `${fromCurrency}_${toCurrency}`;
    if (!(key in rates)) throw new Error(`FX pair not supported: ${fromCurrency} → ${toCurrency}`);
    return rates[key];
  },

  async getAllRates() {
    const rates = await getRates();
    return {
      USD_KES:   rates.USD_KES,
      KES_USD:   rates.KES_USD,
      updatedAt: rates.updatedAt,
      source:    _cache.source,
    };
  },
};

// ── Sync rate getter (uses cache; throws if not yet loaded) ───
export function getRate(from, to) {
  if (from === to) return 1;
  const key   = `${from}_${to}`;
  const rates = _cache.rates;
  if (!rates) throw new Error('FX rates not yet loaded. Use ExchangeRateService.getRate() instead.');
  if (!(key in rates)) throw new Error(`FX pair not supported: ${from} → ${to}`);
  return rates[key];
}

/**
 * Convert `fromAmount` from `from` to `to` using cached rates.
 * For atomic transactions, call ExchangeRateService.getRate() first and pass rate in.
 */
export async function convertAsync(fromAmount, from, to) {
  const rate  = await ExchangeRateService.getRate(from, to);
  const gross = parseFloat((fromAmount * rate).toFixed(6));
  const fee   = parseFloat((gross * FX_FEE_PERCENT / 100).toFixed(6));
  const net   = parseFloat((gross - fee).toFixed(6));
  return { rate, gross, fee, net, feeCurrency: to };
}

// Sync version (uses cache only — used inside prisma.$transaction)
export function convert(fromAmount, from, to) {
  const rate  = getRate(from, to);
  const gross = parseFloat((fromAmount * rate).toFixed(6));
  const fee   = parseFloat((gross * FX_FEE_PERCENT / 100).toFixed(6));
  const net   = parseFloat((gross - fee).toFixed(6));
  return { rate, gross, fee, net, feeCurrency: to };
}

export function getSupportedPairs() {
  const rates = _cache.rates ?? { USD_KES: FALLBACK_RATE, KES_USD: 1 / FALLBACK_RATE };
  return ['USD_KES', 'KES_USD'].map(key => {
    const [from, to] = key.split('_');
    return { from, to, rate: rates[key] };
  });
}

// Warm up cache on startup
getRates().then(rates => {
  logger.info(`FX service ready (${_cache.source}) — 1 USD = ${rates.USD_KES.toFixed(4)} KES, fee ${FX_FEE_PERCENT}%`);
}).catch(() => {});
