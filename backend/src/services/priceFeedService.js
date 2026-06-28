import axios from 'axios';
import YahooFinance from 'yahoo-finance2';
import { prisma } from '../utils/db.js';
import { broadcastPrice } from './socketService.js';
import logger from '../utils/logger.js';

const yf = new YahooFinance({ suppressNotices: ['yahooSurvey'] });
const POLL_INTERVAL_MS = 15_000;
const NSE_REFRESH_MS = 15 * 60_000;  // re-fetch NSE every 15 minutes
const NSE_FAIL_BACKOFF_MS = 60 * 60_000; // back off 1 hr after consecutive failures

// Yahoo Finance suffix per exchange
const YAHOO_SUFFIX = { LSE: '.L', NYSE: '', NASDAQ: '' };

// NSE symbols that differ from AFX's listing (our DB symbol → AFX symbol)
const NSE_SYMBOL_MAP = { BATK: 'BAT' };

// ── NSE individual-page scraper ──────────────────────────────
// Fetches afx.kwayisi.org/nse/{symbol}.html for each stock.
// The main listing page (afx.kwayisi.org/nseke/) times out from
// Render's Frankfurt IPs; individual pages are lighter and work.
let nseCache = {};
let nseCacheAt = 0;
let nseFailedAt = 0; // timestamp of last total failure, 0 = never failed

async function fetchOneNseStock(dbSymbol) {
  const afxSym = (NSE_SYMBOL_MAP[dbSymbol] ?? dbSymbol).toLowerCase();
  try {
    const { data } = await axios.get(`https://afx.kwayisi.org/nse/${afxSym}.html`, {
      timeout: 8_000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36' },
    });
    const m = data.match(/>([\d.]+)\s*<span class=(hi|lo)>[^(]*([\d.]+)\s*\(/);
    if (!m) return null;
    const price = parseFloat(m[1]);
    const change = parseFloat(m[3]) * (m[2] === 'lo' ? -1 : 1);
    return { price, change };
  } catch {
    return null;
  }
}

async function refreshNsePrices(nseSymbols) {
  const now = Date.now();
  // Skip if cache is fresh
  if (now - nseCacheAt < NSE_REFRESH_MS) return;
  // Back off for 1 hour after a total failure so we don't spam logs
  if (nseFailedAt && now - nseFailedAt < NSE_FAIL_BACKOFF_MS) return;

  logger.info(`NSE: refreshing ${nseSymbols.length} stocks via AFX`);
  const results = await Promise.allSettled(
    nseSymbols.map(async sym => ({ sym, data: await fetchOneNseStock(sym) }))
  );
  const prices = {};
  for (const r of results) {
    if (r.status === 'fulfilled' && r.value.data) {
      prices[r.value.sym] = r.value.data;
    }
  }
  if (Object.keys(prices).length > 0) {
    nseCache = prices;
    nseCacheAt = now;
    nseFailedAt = 0;
    logger.info(`NSE: cached ${Object.keys(prices).length}/${nseSymbols.length} live prices`);
  } else {
    nseFailedAt = now;
    logger.warn('NSE: live prices unavailable — using seed prices with simulation until next retry in 1 hr');
  }
}

// ── Yahoo Finance (US/UK stocks) ─────────────────────────────
async function fetchYahooPrice(symbol, exchange) {
  const suffix = YAHOO_SUFFIX[exchange];
  if (suffix === undefined) return null;
  try {
    const q = await yf.quote(symbol + suffix);
    if (!q?.regularMarketPrice) return null;
    return {
      price: q.regularMarketPrice,
      open: q.regularMarketOpen ?? q.regularMarketPrice,
      high: q.regularMarketDayHigh ?? q.regularMarketPrice,
      low: q.regularMarketDayLow ?? q.regularMarketPrice,
      previousClose: q.regularMarketPreviousClose ?? q.regularMarketPrice,
      changeAmount: q.regularMarketChange ?? 0,
      changePercent: q.regularMarketChangePercent ?? 0,
      volume: q.regularMarketVolume ?? 0,
      marketCap: q.marketCap ?? null,
      peRatio: q.trailingPE ?? null,
      weekHigh52: q.fiftyTwoWeekHigh ?? null,
      weekLow52: q.fiftyTwoWeekLow ?? null,
    };
  } catch {
    return null;
  }
}

// ── Simulation fallback (very small drift so seed prices stay accurate) ──
function simulatePrice(asset, existing) {
  const base = existing ? Number(existing.price) : 100;
  const drift = (Math.random() - 0.495) * base * 0.0005; // ±0.05% per tick
  const price = Math.max(0.01, base + drift);
  const prevClose = existing?.previousClose ? Number(existing.previousClose) : price * 0.99;
  return {
    price,
    open: prevClose,
    high: Math.max(price, Number(existing?.high ?? price)),
    low: Math.min(price, Number(existing?.low ?? price)),
    previousClose: prevClose,
    changeAmount: price - prevClose,
    changePercent: ((price - prevClose) / prevClose) * 100,
    volume: Math.floor(Math.random() * 5_000_000) + 100_000,
  };
}

// ── Main update loop ──────────────────────────────────────────
async function updatePrices() {
  try {
    const assets = await prisma.asset.findMany({ where: { isActive: true }, include: { price: true } });

    const nseSymbols = assets.filter(a => a.exchange === 'NSE').map(a => a.symbol);
    if (nseSymbols.length > 0) {
      await refreshNsePrices(nseSymbols); // no-op if cache is fresh
    }

    for (const asset of assets) {
      let priceData = null;

      if (asset.exchange === 'NSE') {
        const live = nseCache[asset.symbol];
        if (live) {
          const prev = asset.price?.previousClose
            ? Number(asset.price.previousClose)
            : asset.price?.price
            ? Number(asset.price.price)
            : live.price;
          priceData = {
            price: live.price,
            open: prev,
            high: Math.max(live.price, prev),
            low: Math.min(live.price, prev),
            previousClose: prev,
            changeAmount: live.change,
            changePercent: prev > 0 ? (live.change / prev) * 100 : 0,
            volume: 0,
          };
        }
      } else {
        priceData = await fetchYahooPrice(asset.symbol, asset.exchange);
      }

      if (!priceData) {
        priceData = simulatePrice(asset, asset.price);
      }

      await prisma.assetPrice.upsert({
        where: { assetId: asset.id },
        create: { assetId: asset.id, ...priceData },
        update: { ...priceData, fetchedAt: new Date() },
      });

      await prisma.priceHistory.upsert({
        where: { assetId_interval_openTime: { assetId: asset.id, interval: '1m', openTime: roundToMinute(new Date()) } },
        create: {
          assetId: asset.id, interval: '1m', openTime: roundToMinute(new Date()),
          open: priceData.open ?? priceData.price,
          high: priceData.high ?? priceData.price,
          low: priceData.low ?? priceData.price,
          close: priceData.price, volume: priceData.volume ?? 0,
        },
        update: {
          high: { set: Math.max(priceData.high ?? priceData.price, priceData.price) },
          low: { set: Math.min(priceData.low ?? priceData.price, priceData.price) },
          close: priceData.price, volume: priceData.volume ?? 0,
        },
      }).catch(() => {});

      broadcastPrice(asset.id, {
        symbol: asset.symbol, price: priceData.price,
        changePercent: priceData.changePercent, changeAmount: priceData.changeAmount,
        volume: priceData.volume, fetchedAt: new Date().toISOString(),
      });
    }
  } catch (err) {
    logger.error('Price feed update error', { error: err.message });
  }
}

function roundToMinute(date) {
  return new Date(Math.floor(date.getTime() / 60_000) * 60_000);
}

export function startPriceFeed(io) {
  logger.info('Price feed started — NSE: AFX individual pages (5 min refresh) | US/UK: Yahoo Finance');
  updatePrices();
  setInterval(updatePrices, POLL_INTERVAL_MS);
}
