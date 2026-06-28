import { prisma } from '../utils/db.js';
import { redis } from '../utils/redis.js';

// GET /api/assets
export async function listAssets(req, res) {
  const { exchange, assetClass, search, limit = 50, offset = 0 } = req.query;

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
    take: Number(limit),
    skip: Number(offset),
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
  const cached = await redis.get(cacheKey);
  if (cached) return res.json(JSON.parse(cached));

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
  await redis.setex(cacheKey, 60, JSON.stringify(response));
  res.json(response);
}

// GET /api/assets/watchlist
export async function getWatchlist(req, res) {
  const watchlist = await prisma.watchlist.findFirst({
    where: { userId: req.user.id, isDefault: true },
    include: { items: { include: { asset: { include: { price: true } } } } },
  });
  res.json({ watchlist });
}

// POST /api/assets/watchlist/:assetId
export async function addToWatchlist(req, res) {
  const watchlist = await prisma.watchlist.findFirst({ where: { userId: req.user.id, isDefault: true } });
  await prisma.watchlistItem.upsert({
    where: { watchlistId_assetId: { watchlistId: watchlist.id, assetId: req.params.assetId } },
    create: { watchlistId: watchlist.id, assetId: req.params.assetId },
    update: {},
  });
  res.json({ message: 'Added to watchlist.' });
}

// DELETE /api/assets/watchlist/:assetId
export async function removeFromWatchlist(req, res) {
  const watchlist = await prisma.watchlist.findFirst({ where: { userId: req.user.id, isDefault: true } });
  await prisma.watchlistItem.deleteMany({
    where: { watchlistId: watchlist.id, assetId: req.params.assetId },
  });
  res.json({ message: 'Removed from watchlist.' });
}
