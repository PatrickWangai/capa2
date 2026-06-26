/**
 * Alpaca Markets broker integration
 * Docs: https://docs.alpaca.markets/reference/
 * Handles US equities (NYSE + NASDAQ)
 */
import axios from 'axios';
import logger from '../utils/logger.js';

const BASE_URL = process.env.ALPACA_BASE_URL || 'https://paper-api.alpaca.markets';
const DATA_URL = 'https://data.alpaca.markets';

export const alpaca = axios.create({
  baseURL: BASE_URL,
  headers: {
    'APCA-API-KEY-ID': process.env.ALPACA_API_KEY || '',
    'APCA-API-SECRET-KEY': process.env.ALPACA_SECRET_KEY || '',
    'Content-Type': 'application/json',
  },
  timeout: 10_000,
});

const alpacaData = axios.create({
  baseURL: DATA_URL,
  headers: {
    'APCA-API-KEY-ID': process.env.ALPACA_API_KEY || '',
    'APCA-API-SECRET-KEY': process.env.ALPACA_SECRET_KEY || '',
  },
  timeout: 10_000,
});

const ENABLED = !!(process.env.ALPACA_API_KEY && process.env.ALPACA_SECRET_KEY);

function logDisabled(fn) {
  logger.warn(`Alpaca not configured — ${fn} skipped (paper trading mode)`);
}

/**
 * Submit a market or limit order to Alpaca
 */
export async function submitOrder({ symbol, qty, side, type = 'market', limitPrice, clientOrderId }) {
  if (!ENABLED) { logDisabled('submitOrder'); return { id: `mock-${Date.now()}`, status: 'accepted' }; }

  const body = {
    symbol,
    qty: String(qty),
    side: side.toLowerCase(),
    type,
    time_in_force: type === 'market' ? 'day' : 'gtc',
    ...(type === 'limit' && { limit_price: String(limitPrice) }),
    ...(clientOrderId && { client_order_id: clientOrderId }),
  }

  const { data } = await alpaca.post('/v2/orders', body);
  logger.info('Alpaca order submitted', { id: data.id, symbol, side, qty });
  return data;
}

/**
 * Cancel an open order on Alpaca
 */
export async function cancelOrder(alpacaOrderId) {
  if (!ENABLED) { logDisabled('cancelOrder'); return; }
  await alpaca.delete(`/v2/orders/${alpacaOrderId}`);
  logger.info('Alpaca order cancelled', { id: alpacaOrderId });
}

/**
 * Get an order's current status
 */
export async function getOrder(alpacaOrderId) {
  if (!ENABLED) return { id: alpacaOrderId, status: 'filled', filled_avg_price: '150.00', filled_qty: '1' }
  const { data } = await alpaca.get(`/v2/orders/${alpacaOrderId}`);
  return data;
}

/**
 * Get latest quote for a symbol
 */
export async function getLatestQuote(symbol) {
  if (!ENABLED) return null;
  try {
    const { data } = await alpacaData.get(`/v2/stocks/${symbol}/quotes/latest`);
    return data.quote;
  } catch (e) {
    logger.warn(`Alpaca quote failed for ${symbol}`, { error: e.message });
    return null;
  }
}

/**
 * Get OHLCV bars for a symbol
 */
export async function getBars(symbol, { timeframe = '1Day', start, end, limit = 365 } = {}) {
  if (!ENABLED) return [];
  try {
    const { data } = await alpacaData.get(`/v2/stocks/${symbol}/bars`, {
      params: { timeframe, start, end, limit, feed: 'iex' },
    });
    return data.bars || [];
  } catch (e) {
    logger.warn(`Alpaca bars failed for ${symbol}`, { error: e.message });
    return [];
  }
}

/**
 * Get account positions (for reconciliation)
 */
export async function getPositions() {
  if (!ENABLED) return [];
  const { data } = await alpaca.get('/v2/positions');
  return data;
}

/**
 * Get account info
 */
export async function getAccount() {
  if (!ENABLED) return { status: 'ACTIVE', buying_power: '100000', portfolio_value: '0', paper: true }
  const { data } = await alpaca.get('/v2/account');
  return data;
}

/**
 * Check if market is open
 */
export async function getClock() {
  if (!ENABLED) {
    const now = new Date();
    const day = now.getDay();
    const h = now.getHours();
    return { is_open: day >= 1 && day <= 5 && h >= 9 && h < 17, next_open: null }
  }
  const { data } = await alpaca.get('/v2/clock');
  return data;
}

exports.ENABLED = ENABLED;
