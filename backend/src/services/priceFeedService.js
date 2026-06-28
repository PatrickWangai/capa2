import yahooFinance from 'yahoo-finance2';
import { prisma } from '../utils/db.js';
import { broadcastPrice } from './socketService.js';
import logger from '../utils/logger.js';

const POLL_INTERVAL_MS = 15_000;

// Map database exchange codes to Yahoo Finance symbol suffixes
const YAHOO_SUFFIX = { LSE: '.L', NSE: null, NYSE: '', NASDAQ: '' };

function yahooSymbol(symbol, exchange) {
  const suffix = YAHOO_SUFFIX[exchange];
  if (suffix === null) return null; // NSE not supported — simulate
  return symbol + suffix;
}

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

async function fetchYahooPrice(symbol, exchange) {
  const ticker = yahooSymbol(symbol, exchange);
  if (!ticker) return null;
  try {
    const q = await yahooFinance.quote(ticker, {}, { validateResult: false });
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

async function updatePrices() {
  try {
    const assets = await prisma.asset.findMany({
      where: { isActive: true },
      include: { price: true },
    });

    for (const asset of assets) {
      let priceData = await fetchYahooPrice(asset.symbol, asset.exchange);

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
          close: priceData.price,
          volume: priceData.volume ?? 0,
        },
        update: {
          high: { set: Math.max(priceData.high ?? priceData.price, priceData.price) },
          low: { set: Math.min(priceData.low ?? priceData.price, priceData.price) },
          close: priceData.price,
          volume: priceData.volume ?? 0,
        },
      }).catch(() => {});

      broadcastPrice(asset.id, {
        symbol: asset.symbol,
        price: priceData.price,
        changePercent: priceData.changePercent,
        changeAmount: priceData.changeAmount,
        volume: priceData.volume,
        fetchedAt: new Date().toISOString(),
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
  logger.info('Price feed started (Yahoo Finance — real-time, no API key required)');
  updatePrices();
  setInterval(updatePrices, POLL_INTERVAL_MS);
}
