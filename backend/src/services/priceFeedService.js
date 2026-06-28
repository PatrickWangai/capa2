import axios from 'axios';
import YahooFinance from 'yahoo-finance2';
import { prisma } from '../utils/db.js';
import { broadcastPrice } from './socketService.js';
import logger from '../utils/logger.js';

const yf = new YahooFinance({ suppressNotices: ['yahooSurvey'] });
const POLL_INTERVAL_MS = 15_000;

// Yahoo Finance suffix per exchange (LSE/NYSE/NASDAQ only)
const YAHOO_SUFFIX = { LSE: '.L', NYSE: '', NASDAQ: '' };

// NSE symbols that differ between our DB and AFX
const NSE_SYMBOL_MAP = { BATK: 'BAT' };

// ── NSE scraper (afx.kwayisi.org) ────────────────────────────
let nseCache = {};
let nseCacheAt = 0;

async function fetchNsePrices() {
  if (Date.now() - nseCacheAt < 14_000) return nseCache;
  try {
    const { data } = await axios.get('https://afx.kwayisi.org/nseke/', {
      timeout: 10_000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
      },
    });
    const re = /([A-Z0-9]+)<\/a><td><a[^>]+>[^<]+<\/a><td>[\d,]+<td>([\d.]+)<td[^>]*>([\+\-][\d.]+)/g;
    const prices = {};
    let m;
    while ((m = re.exec(data)) !== null) {
      prices[m[1]] = { price: parseFloat(m[2]), change: parseFloat(m[3]) };
    }
    nseCache = prices;
    nseCacheAt = Date.now();
    return prices;
  } catch (err) {
    logger.warn('NSE scrape failed, using cached/simulated data', { error: err.message });
    return nseCache;
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

// ── Simulation fallback ───────────────────────────────────────
function simulatePrice(asset, existing) {
  const base = existing ? Number(existing.price) : 100;
  const change = (Math.random() - 0.495) * base * 0.005;
  const price = Math.max(0.01, base + change);
  const prevClose = existing?.price ? Number(existing.price) : price * 0.99;
  return {
    price,
    open: prevClose * (1 + (Math.random() - 0.5) * 0.01),
    high: price * (1 + Math.random() * 0.008),
    low: price * (1 - Math.random() * 0.008),
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

    const nsePrices = assets.some(a => a.exchange === 'NSE') ? await fetchNsePrices() : {};

    for (const asset of assets) {
      let priceData = null;

      if (asset.exchange === 'NSE') {
        const afxSymbol = NSE_SYMBOL_MAP[asset.symbol] ?? asset.symbol;
        const live = nsePrices[afxSymbol];
        if (live) {
          const prev = asset.price?.price ? Number(asset.price.price) : live.price;
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
  logger.info('Price feed started — NSE: afx.kwayisi.org | US/UK: Yahoo Finance');
  updatePrices();
  setInterval(updatePrices, POLL_INTERVAL_MS);
}
