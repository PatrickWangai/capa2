import axios from 'axios';
import { prisma } from '../utils/db.js';
import { broadcastPrice } from './socketService.js';
import logger from '../utils/logger.js';

const POLYGON_KEY = process.env.POLYGON_API_KEY;
const POLL_INTERVAL_MS = 15_000;

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

async function fetchPolygonSnapshot(symbol) {
  try {
    const { data } = await axios.get(
      `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers/${symbol}`,
      { params: { apiKey: POLYGON_KEY }, timeout: 8000 }
    );
    const t = data?.ticker;
    if (!t) return null;

    const price = t.lastTrade?.p ?? t.day?.c ?? null;
    if (!price) return null;

    return {
      price,
      open: t.day?.o ?? price,
      high: t.day?.h ?? price,
      low: t.day?.l ?? price,
      previousClose: t.prevDay?.c ?? price,
      changeAmount: t.todaysChange ?? 0,
      changePercent: t.todaysChangePerc ?? 0,
      volume: t.day?.v ?? 0,
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
      let priceData = null;

      const isUsExchange = ['NYSE', 'NASDAQ'].includes(asset.exchange);
      if (POLYGON_KEY && isUsExchange) {
        priceData = await fetchPolygonSnapshot(asset.symbol);
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
  if (POLYGON_KEY) {
    logger.info('Price feed started with Polygon.io live data');
  } else {
    logger.info('Price feed started with simulated prices (set POLYGON_API_KEY for live data)');
  }
  updatePrices();
  setInterval(updatePrices, POLL_INTERVAL_MS);
}
