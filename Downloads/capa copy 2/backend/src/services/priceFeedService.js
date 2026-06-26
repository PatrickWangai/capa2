import axios from 'axios';
import { prisma } from '../utils/db.js';
import { broadcastPrice } from './socketService.js';
import logger from '../utils/logger.js';

const POLYGON_KEY = process.env.POLYGON_API_KEY;
const POLL_INTERVAL_MS = 15_000; // 15 seconds

// Simulated prices for development (when no API key)
function simulatePrice(asset, existing) {
  const base = existing ? Number(existing.price) : 100;
  const change = (Math.random() - 0.495) * base * 0.005; // ±0.5%
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
  }
}

async function fetchPolygonPrice(symbol) {
  try {
    const { data } = await axios.get(
      `https://api.polygon.io/v2/last/trade/${symbol}?apiKey=${POLYGON_KEY}`,
      { timeout: 5000 }
    );
    return data.results?.p || null;
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
      let priceData;

      if (POLYGON_KEY && asset.exchange !== 'NSE') {
        const live = await fetchPolygonPrice(asset.symbol);
        if (live) {
          const prev = asset.price?.price ? Number(asset.price.price) : live;
          priceData = {
            price: live,
            previousClose: prev,
            changeAmount: live - prev,
            changePercent: ((live - prev) / prev) * 100,
          }
        }
      }

      if (!priceData) {
        priceData = simulatePrice(asset, asset.price);
      }

      await prisma.assetPrice.upsert({
        where: { assetId: asset.id },
        create: { assetId: asset.id, ...Object.fromEntries(Object.entries(priceData).map(([k, v]) => [k, v])) },
        update: { ...Object.fromEntries(Object.entries(priceData).map(([k, v]) => [k, v])), fetchedAt: new Date() },
      });

      // Add to price history (1m candle)
      await prisma.priceHistory.upsert({
        where: { assetId_interval_openTime: { assetId: asset.id, interval: '1m', openTime: roundToMinute(new Date()) } },
        create: {
          assetId: asset.id,
          interval: '1m',
          openTime: roundToMinute(new Date()),
          open: priceData.open || priceData.price,
          high: priceData.high || priceData.price,
          low: priceData.low || priceData.price,
          close: priceData.price,
          volume: priceData.volume || 0,
        },
        update: {
          high: { set: Math.max(priceData.high || priceData.price, Number(priceData.price)) },
          low: { set: Math.min(priceData.low || priceData.price, Number(priceData.price)) },
          close: priceData.price,
          volume: priceData.volume || 0,
        },
      }).catch(() => {}); // ignore unique conflicts

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
  logger.info('Price feed started');
  updatePrices(); // immediate first run
  setInterval(updatePrices, POLL_INTERVAL_MS);
}
