import { prisma } from '../utils/db.js';

// GET /api/alerts
export async function getAlerts(req, res) {
  const alerts = await prisma.priceAlert.findMany({
    where: { userId: req.user.id },
    include: {
      asset: { select: { id: true, symbol: true, name: true, currency: true, price: { select: { price: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ alerts });
}

// POST /api/alerts
export async function createAlert(req, res) {
  const { assetId, condition, targetPrice, percentChange } = req.body;
  if (!assetId || !condition) return res.status(400).json({ error: 'assetId and condition are required.' });
  if (condition !== 'percent_change' && !targetPrice) return res.status(400).json({ error: 'targetPrice is required for this condition.' });

  const asset = await prisma.asset.findUnique({ where: { id: assetId } });
  if (!asset) return res.status(404).json({ error: 'Asset not found.' });

  const alert = await prisma.priceAlert.create({
    data: {
      userId: req.user.id,
      assetId,
      condition,
      targetPrice: targetPrice ? parseFloat(targetPrice) : null,
      percentChange: percentChange ? parseFloat(percentChange) : null,
      isActive: true,
    },
    include: { asset: { select: { symbol: true, name: true } } },
  });
  res.status(201).json({ alert, message: `Alert set for ${asset.symbol}.` });
}

// DELETE /api/alerts/:id
export async function deleteAlert(req, res) {
  await prisma.priceAlert.deleteMany({
    where: { id: req.params.id, userId: req.user.id },
  });
  res.json({ message: 'Alert deleted.' });
}

// PATCH /api/alerts/:id/toggle
export async function toggleAlert(req, res) {
  const alert = await prisma.priceAlert.findFirst({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!alert) return res.status(404).json({ error: 'Alert not found.' });
  const updated = await prisma.priceAlert.update({
    where: { id: req.params.id },
    data: { isActive: !alert.isActive },
  });
  res.json({ alert: updated });
}
