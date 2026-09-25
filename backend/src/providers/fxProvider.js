/**
 * FXProvider Interface
 *
 * Swap MockFXProvider for a real provider (Bloomberg, Refinitiv, XE, Currencybeacon)
 * without touching business logic.
 *
 * TODO: Connect real FX provider when live FX licensing is in place.
 */

const FX_FEE_PERCENT = parseFloat(process.env.FX_FEE_PERCENT || '1');   // 1% default
const FX_SPREAD      = parseFloat(process.env.FX_SPREAD      || '0.005'); // 0.5% spread

/**
 * @typedef {Object} FXQuote
 * @property {string} from
 * @property {string} to
 * @property {number} midRate     - interbank mid rate
 * @property {number} clientRate  - rate offered to client (mid + spread)
 * @property {number} spread      - spread fraction
 * @property {number} fee         - flat fee amount in `to` currency
 * @property {string} provider
 * @property {string} expiresAt   - ISO timestamp
 */

/**
 * @typedef {Object} FXConvertResult
 * @property {number} fromAmount
 * @property {number} toAmount
 * @property {number} rate        - client rate used
 * @property {number} midRate
 * @property {number} fee
 * @property {number} spread
 * @property {string} reference
 * @property {string} provider
 */

export class FXProvider {
  /** @param {string} from @param {string} to @returns {Promise<FXQuote>} */
  async quote(from, to) { throw new Error('Not implemented'); }

  /** @param {number} amount @param {string} from @param {string} to @returns {Promise<FXConvertResult>} */
  async convert(amount, from, to) { throw new Error('Not implemented'); }

  /** @returns {Promise<Record<string, number>>} rates keyed as "FROM_TO" */
  async getRates(base) { throw new Error('Not implemented'); }
}

// ── Mock FX Provider ──────────────────────────────────────────────────────────
// Uses open.er-api.com free API for real rates, applies configurable spread + fee.
// TODO: Replace with a regulated FX provider (Bloomberg, XE, Currencybeacon, etc.)

const CACHE_TTL = 60 * 60 * 1000; // 1 hour
let _rateCache  = { data: null, fetchedAt: 0 };

async function fetchUSDRates() {
  const now = Date.now();
  if (_rateCache.data && now - _rateCache.fetchedAt < CACHE_TTL) return _rateCache.data;
  try {
    const res  = await fetch('https://open.er-api.com/v6/latest/USD', { signal: AbortSignal.timeout(8000) });
    const json = await res.json();
    if (json.result !== 'success') throw new Error('API error');
    _rateCache = { data: json.rates, fetchedAt: now };
    return json.rates;
  } catch {
    // Fallback hardcoded rates — updated 2026-07
    const fallback = {
      USD:1,GBP:0.79,KES:129.37,EUR:0.92,CAD:1.37,AUD:1.53,
      JPY:157.4,CHF:0.90,HKD:7.78,SGD:1.35,ZAR:18.15,
    };
    _rateCache = { data: fallback, fetchedAt: now - CACHE_TTL + 5 * 60 * 1000 };
    return fallback;
  }
}

let _refCounter = 1;
function genRef() {
  const ts   = new Date().toISOString().slice(0,10).replace(/-/g,'');
  const seq  = String(_refCounter++).padStart(5,'0');
  return `FX-${ts}-${seq}`;
}

export class MockFXProvider extends FXProvider {
  async quote(from, to) {
    const rates   = await fetchUSDRates();
    const midRate = this._crossRate(rates, from, to);
    const spread  = FX_SPREAD;
    const clientRate = parseFloat((midRate * (1 - spread)).toFixed(8));
    return {
      from, to, midRate, clientRate, spread,
      fee:      0, // fee calculated at convert time
      provider: 'mock-fx',
      expiresAt: new Date(Date.now() + 30_000).toISOString(),
    };
  }

  async convert(amount, from, to) {
    const q        = await this.quote(from, to);
    const gross    = parseFloat((amount * q.clientRate).toFixed(6));
    const fee      = parseFloat((gross * FX_FEE_PERCENT / 100).toFixed(6));
    const net      = parseFloat((gross - fee).toFixed(6));
    return {
      fromAmount: amount,
      toAmount:   net,
      rate:       q.clientRate,
      midRate:    q.midRate,
      fee,
      spread:     q.spread,
      reference:  genRef(),
      provider:   'mock-fx',
    };
  }

  async getRates(base = 'USD') {
    const rates    = await fetchUSDRates();
    const baseRate = rates[base] ?? 1;
    const result   = {};
    for (const [ccy, rate] of Object.entries(rates)) {
      result[ccy] = parseFloat((rate / baseRate).toFixed(8));
    }
    return result;
  }

  _crossRate(rates, from, to) {
    if (from === to) return 1;
    const fromUsd = rates[from] ?? 1;
    const toUsd   = rates[to]   ?? 1;
    return parseFloat((toUsd / fromUsd).toFixed(8));
  }
}

export default new MockFXProvider();
