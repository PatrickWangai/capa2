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

  res.json({ assets });
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
