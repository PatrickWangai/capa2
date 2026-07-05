import { prisma } from '../utils/db.js';

const VALID_STRATEGIES = ['PRICE_THRESHOLD', 'RSI', 'MA_CROSSOVER', 'STOP_LOSS_TP'];

export async function createBot(req, res) {
  const { name, assetId, strategy, params, quantity } = req.body;
  if (!VALID_STRATEGIES.includes(strategy))
    return res.status(400).json({ error: `Invalid strategy. Must be one of: ${VALID_STRATEGIES.join(', ')}` });
  const asset = await prisma.asset.findUnique({ where: { id: assetId } });
  if (!asset) return res.status(404).json({ error: 'Asset not found.' });
  const bot = await prisma.tradingBot.create({
    data: { userId: req.user.id, name, assetId, strategy, params: params || {}, quantity, status: 'ACTIVE' },
    include: { asset: { select: { symbol: true, name: true, exchange: true, currency: true } } },
  });
  res.status(201).json({ bot });
}

export async function getBots(req, res) {
  const bots = await prisma.tradingBot.findMany({
    where: { userId: req.user.id },
    include: {
      asset: { select: { symbol: true, name: true, exchange: true, currency: true } },
      trades: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ bots });
}

export async function getBot(req, res) {
  const bot = await prisma.tradingBot.findFirst({
    where: { id: req.params.id, userId: req.user.id },
    include: {
      asset: { select: { symbol: true, name: true, exchange: true, currency: true } },
      trades: { orderBy: { createdAt: 'desc' }, take: 20 },
    },
  });
  if (!bot) return res.status(404).json({ error: 'Bot not found.' });
  res.json({ bot });
}

export async function updateBot(req, res) {
  const { name, status, params, quantity } = req.body;
  const bot = await prisma.tradingBot.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!bot) return res.status(404).json({ error: 'Bot not found.' });
  const updated = await prisma.tradingBot.update({
    where: { id: bot.id },
    data: {
      ...(name     !== undefined && { name }),
      ...(status   !== undefined && { status }),
      ...(params   !== undefined && { params }),
      ...(quantity !== undefined && { quantity }),
    },
    include: { asset: { select: { symbol: true, name: true, exchange: true, currency: true } } },
  });
  res.json({ bot: updated });
}

export async function deleteBot(req, res) {
  const bot = await prisma.tradingBot.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!bot) return res.status(404).json({ error: 'Bot not found.' });
  await prisma.tradingBot.delete({ where: { id: bot.id } });
  res.json({ message: 'Bot deleted.' });
}

export async function getBotTrades(req, res) {
  const bot = await prisma.tradingBot.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!bot) return res.status(404).json({ error: 'Bot not found.' });
  const trades = await prisma.botTrade.findMany({
    where: { botId: bot.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  res.json({ trades });
}

export async function adminGetAllBots(req, res) {
  const bots = await prisma.tradingBot.findMany({
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true } },
      asset: { select: { symbol: true, name: true, exchange: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ bots });
}
