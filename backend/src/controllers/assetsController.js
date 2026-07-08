import { prisma } from '../utils/db.js';
import { redis } from '../utils/redis.js';
import logger from '../utils/logger.js';
import { clampLimit, clampOffset } from '../utils/pagination.js';

// GET /api/assets
export async function listAssets(req, res) {
  const { exchange, assetClass, search } = req.query;

  const assets = await prisma.asset.findMany({
    where: {
      isActive: true,
      ...(exchange && { exchange }),
      ...(assetClass && { assetClass }),
      ...(search && {
        OR: [
          { symbol: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
        ],
      }),
    },
    include: { price: true },
    orderBy: [{ exchange: 'asc' }, { symbol: 'asc' }],
    take: clampLimit(req.query.limit, 50),
    skip: clampOffset(req.query.offset),
  });

  // Batch-fetch 31 days of daily candles to compute weekly/monthly changes
  const assetIds = assets.map(a => a.id);
  const cutoff = new Date(Date.now() - 32 * 86_400_000);
  const history = await prisma.priceHistory.findMany({
    where: { assetId: { in: assetIds }, interval: '1d', openTime: { gte: cutoff } },
    select: { assetId: true, openTime: true, close: true },
    orderBy: { openTime: 'asc' },
  });

  const histMap = {};
  for (const h of history) {
    if (!histMap[h.assetId]) histMap[h.assetId] = [];
    histMap[h.assetId].push({ t: h.openTime.getTime(), close: Number(h.close) });
  }

  const now = Date.now();
  const enriched = assets.map(asset => {
    const candles = histMap[asset.id] || [];
    const current = asset.price ? Number(asset.price.price) : null;
    let changeWeekly = null, changeMonthly = null;

    if (current !== null && candles.length > 0) {
      const t7  = now - 7  * 86_400_000;
      const t30 = now - 30 * 86_400_000;
      const weekCandle  = [...candles].reverse().find(c => c.t <= t7);
      const monthCandle = candles.find(c => c.t <= t30) || candles[0];
      if (weekCandle)  changeWeekly  = ((current - weekCandle.close)  / weekCandle.close)  * 100;
      if (monthCandle) changeMonthly = ((current - monthCandle.close) / monthCandle.close) * 100;
    }

    return { ...asset, changeWeekly, changeMonthly };
  });

  res.json({ assets: enriched });
}

// GET /api/assets/:id
export async function getAsset(req, res) {
  const asset = await prisma.asset.findUnique({
    where: { id: req.params.id },
    include: { price: true },
  });
  if (!asset) return res.status(404).json({ error: 'Asset not found.' });
  res.json({ asset });
}

// GET /api/assets/:id/history
export async function getPriceHistory(req, res) {
  const { interval = '1d', from, to } = req.query;
  const cacheKey = `price_history:${req.params.id}:${interval}`;
  try {
    const cached = await redis.get(cacheKey);
    if (cached) return res.json(JSON.parse(cached));
  } catch (e) {
    logger.warn('Price history cache read failed — falling back to DB', { error: e.message });
  }

  const history = await prisma.priceHistory.findMany({
    where: {
      assetId: req.params.id,
      interval,
      ...(from && { openTime: { gte: new Date(from) } }),
      ...(to && { openTime: { lte: new Date(to) } }),
    },
    orderBy: { openTime: 'asc' },
    take: 500,
  });

  const response = { history }
  try {
    await redis.setex(cacheKey, 60, JSON.stringify(response));
  } catch (e) {
    logger.warn('Price history cache write failed', { error: e.message });
  }
  res.json(response);
}

// GET /api/assets/movers?type=gainers|losers|active&exchange=NSE&limit=10
export async function getMovers(req, res) {
  const { type = 'gainers', exchange, limit = 10 } = req.query;

  const assets = await prisma.asset.findMany({
    where: {
      isActive: true,
      ...(exchange && { exchange }),
    },
    include: { price: true },
    take: 500,
  });

  const withPrice = assets.filter(a => a.price?.changePercent != null);

  let sorted;
  switch (type) {
    case 'gainers':
      sorted = [...withPrice].sort((a, b) => Number(b.price.changePercent) - Number(a.price.changePercent));
      break;
    case 'losers':
      sorted = [...withPrice].sort((a, b) => Number(a.price.changePercent) - Number(b.price.changePercent));
      break;
    case 'active':
      sorted = [...withPrice].sort((a, b) => Number(b.price.volume || 0) - Number(a.price.volume || 0));
      break;
    default:
      sorted = withPrice;
  }

  res.json({ assets: sorted.slice(0, Number(limit)) });
}

// GET /api/assets/watchlist
export async function getWatchlist(req, res) {
  const watchlist = await prisma.watchlist.findFirst({
    where: { userId: req.user.id, isDefault: true },
    include: { items: { include: { asset: { include: { price: true } } } } },
  });
  res.json({ watchlist });
}

async function getOrCreateWatchlist(userId) {
  const existing = await prisma.watchlist.findFirst({ where: { userId, isDefault: true } });
  if (existing) return existing;
  return prisma.watchlist.create({ data: { userId, name: 'My Watchlist', isDefault: true } });
}

// POST /api/assets/watchlist/:assetId
export async function addToWatchlist(req, res) {
  const watchlist = await getOrCreateWatchlist(req.user.id);
  await prisma.watchlistItem.upsert({
    where: { watchlistId_assetId: { watchlistId: watchlist.id, assetId: req.params.assetId } },
    create: { watchlistId: watchlist.id, assetId: req.params.assetId },
    update: {},
  });
  res.json({ message: 'Added to watchlist.' });
}

// DELETE /api/assets/watchlist/:assetId
export async function removeFromWatchlist(req, res) {
  const watchlist = await getOrCreateWatchlist(req.user.id);
  await prisma.watchlistItem.deleteMany({
    where: { watchlistId: watchlist.id, assetId: req.params.assetId },
  });
  res.json({ message: 'Removed from watchlist.' });
}
