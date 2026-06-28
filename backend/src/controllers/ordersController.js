import { prisma } from '../utils/db.js';
import Decimal from 'decimal.js';
import { createNotification } from '../services/notificationService.js';
import { alpaca, submitOrder as submitAlpacaOrder, getOrder as getAlpacaOrder, cancelOrder as cancelAlpacaOrder } from '../services/alpacaService.js';
import logger from '../utils/logger.js';

// POST /api/orders
export async function placeOrder(req, res) {
  const { assetId, side, orderType = 'MARKET', quantity, limitPrice, stopPrice } = req.body;

  const account = await prisma.investmentAccount.findFirst({
    where: { userId: req.user.id, isPrimary: true, isActive: true },
    include: { balances: true },
  });
  if (!account) return res.status(404).json({ error: 'No active account found.' });

  const asset = await prisma.asset.findUnique({ where: { id: assetId }, include: { price: true } });
  if (!asset || !asset.isActive) return res.status(404).json({ error: 'Asset not found or inactive.' });

  const price = asset.price?.price ? new Decimal(asset.price.price.toString()) : null;
  if (!price) return res.status(400).json({ error: 'No price available for this asset.' });

  const qty = new Decimal(quantity);
  const estimatedTotal = price.mul(qty);
  const fee = estimatedTotal.mul(0.001);

  if (side === 'BUY') {
    const balance = account.balances.find(b => b.currency === asset.currency);
    const available = balance ? new Decimal(balance.available.toString()) : new Decimal(0);
    if (available.lt(estimatedTotal.plus(fee))) {
      return res.status(400).json({ error: 'Insufficient funds.', required: estimatedTotal.plus(fee).toFixed(2), available: available.toFixed(2), currency: asset.currency });
    }
  } else {
    const position = await prisma.position.findUnique({ where: { accountId_assetId: { accountId: account.id, assetId } } });
    if (!position || new Decimal(position.quantity.toString()).lt(qty)) {
      return res.status(400).json({ error: 'Insufficient shares to sell.' });
    }
  }

  // Submit to Alpaca for US equities
  let brokerOrderId = null;
  const isUsEquity = ['NYSE', 'NASDAQ'].includes(asset.exchange);
  if (isUsEquity && alpaca.ENABLED) {
    try {
      const alpacaOrder = await submitAlpacaOrder({
        symbol: asset.symbol, qty: qty.toFixed(asset.isFractional ? 6 : 0).toString(),
        side: side.toLowerCase(), type: orderType.toLowerCase(),
        limitPrice: limitPrice ? new Decimal(limitPrice).toFixed(2) : undefined,
        clientOrderId: `capa-${Date.now()}`,
      });
      brokerOrderId = alpacaOrder.id;
    } catch (err) { logger.error('Alpaca submit failed', { error: err.message }); }
  }

  const result = await prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: { accountId: account.id, assetId, side, orderType, quantity: qty.toFixed(6),
        limitPrice: limitPrice ? new Decimal(limitPrice).toFixed(6) : null,
        stopPrice: stopPrice ? new Decimal(stopPrice).toFixed(6) : null,
        estimatedTotal: estimatedTotal.toFixed(6), fee: fee.toFixed(6),
        currency: asset.currency, status: 'PENDING', brokerOrderId },
      include: { asset: { select: { symbol: true, name: true } } },
    });
    if (side === 'BUY' && orderType === 'MARKET') {
      await tx.accountBalance.updateMany({
        where: { accountId: account.id, currency: asset.currency },
        data: { available: { decrement: estimatedTotal.plus(fee).toNumber() }, reserved: { increment: estimatedTotal.plus(fee).toNumber() } },
      });
    }
    return order;
  });

  if (orderType === 'MARKET') {
    setTimeout(() => fillOrder(result.id, price.toNumber()), isUsEquity && alpaca.ENABLED ? 3000 : 1500);
  }
  res.status(201).json({ order: result, message: 'Order placed successfully.' });
}

export async function fillOrder(orderId, estimatedPrice) {
  try {
    const order = await prisma.order.findUnique({ where: { id: orderId }, include: { asset: true, account: { include: { user: true } } } });
    if (!order || order.status !== 'PENDING') return;

    let fillPrice = estimatedPrice;
    if (order.brokerOrderId && alpaca.ENABLED) {
      try {
        const ao = await getAlpacaOrder(order.brokerOrderId);
        if (ao.filled_avg_price) fillPrice = Number(ao.filled_avg_price);
      } catch (e) { logger.warn('Alpaca fill price fetch failed', { error: e.message }); }
    }

    const qty = new Decimal(order.quantity.toString());
    const price = new Decimal(fillPrice);
    const total = qty.mul(price);
    const fee = total.mul(0.001);

    await prisma.$transaction(async (tx) => {
      await tx.order.update({ where: { id: orderId }, data: { status: 'FILLED', filledQuantity: qty.toFixed(6), avgFillPrice: price.toFixed(6), filledTotal: total.toFixed(6), filledAt: new Date() } });

      if (order.side === 'BUY') {
        await tx.accountBalance.updateMany({ where: { accountId: order.accountId, currency: order.currency }, data: { reserved: { decrement: total.plus(fee).toNumber() } } });
        const existing = await tx.position.findUnique({ where: { accountId_assetId: { accountId: order.accountId, assetId: order.assetId } } });
        if (existing) {
          const newQty = new Decimal(existing.quantity.toString()).plus(qty);
          const newInvested = new Decimal(existing.totalInvested.toString()).plus(total);
          await tx.position.update({ where: { id: existing.id }, data: { quantity: newQty.toFixed(6), avgCostPrice: newInvested.div(newQty).toFixed(6), totalInvested: newInvested.toFixed(6) } });
        } else {
          await tx.position.create({ data: { accountId: order.accountId, assetId: order.assetId, quantity: qty.toFixed(6), avgCostPrice: price.toFixed(6), totalInvested: total.toFixed(6) } });
        }
      } else {
        await tx.accountBalance.updateMany({ where: { accountId: order.accountId, currency: order.currency }, data: { available: { increment: total.minus(fee).toNumber() } } });
        const pos = await tx.position.findUnique({ where: { accountId_assetId: { accountId: order.accountId, assetId: order.assetId } } });
        if (pos) {
          const newQty = new Decimal(pos.quantity.toString()).minus(qty);
          const realizedPnl = total.minus(new Decimal(pos.avgCostPrice.toString()).mul(qty)).minus(fee);
          if (newQty.lte(0)) { await tx.position.delete({ where: { id: pos.id } }); }
          else { await tx.position.update({ where: { id: pos.id }, data: { quantity: newQty.toFixed(6), realizedPnl: { increment: realizedPnl.toNumber() } } }); }
        }
      }

      await tx.transaction.create({ data: { accountId: order.accountId, orderId: order.id, type: order.side === 'BUY' ? 'BUY' : 'SELL', status: 'COMPLETED', amount: total.toFixed(6), currency: order.currency, fee: fee.toFixed(6), description: `${order.side} ${qty.toFixed(4)} ${order.asset.symbol} @ ${order.currency} ${price.toFixed(2)}` } });
    });

    await createNotification({ userId: order.account.userId, type: 'ORDER_FILLED', title: `Order Filled — ${order.asset.symbol}`, body: `Your ${order.side} order for ${qty.toFixed(4)} ${order.asset.symbol} filled at ${order.currency} ${price.toFixed(2)}.`, metadata: { orderId } });
  } catch (err) { logger.error('fillOrder error', { orderId, error: err.message }); }
}

export async function getOrders(req, res) {
  const { status, limit = 20, offset = 0 } = req.query;
  const account = await prisma.investmentAccount.findFirst({ where: { userId: req.user.id, isPrimary: true } });
  if (!account) return res.json({ orders: [] });
  const orders = await prisma.order.findMany({ where: { accountId: account.id, ...(status && { status }) }, include: { asset: { select: { symbol: true, name: true, logoUrl: true, exchange: true } } }, orderBy: { createdAt: 'desc' }, take: Number(limit), skip: Number(offset) });
  res.json({ orders });
}

export async function cancelOrder(req, res) {
  const account = await prisma.investmentAccount.findFirst({ where: { userId: req.user.id, isPrimary: true } });
  const order = await prisma.order.findFirst({ where: { id: req.params.id, accountId: account.id } });
  if (!order) return res.status(404).json({ error: 'Order not found.' });
  if (!['PENDING', 'OPEN'].includes(order.status)) return res.status(400).json({ error: `Cannot cancel order with status ${order.status}.` });
  if (order.brokerOrderId && alpaca.ENABLED) {
    try { await cancelAlpacaOrder(order.brokerOrderId); } catch (e) { logger.warn('Alpaca cancel failed', { error: e.message }); }
  }
  await prisma.$transaction(async (tx) => {
    await tx.order.update({ where: { id: order.id }, data: { status: 'CANCELLED', cancelledAt: new Date() } });
    if (order.side === 'BUY' && order.estimatedTotal) {
      const total = new Decimal(order.estimatedTotal.toString()).plus(new Decimal(order.fee.toString()));
      await tx.accountBalance.updateMany({ where: { accountId: account.id, currency: order.currency }, data: { available: { increment: total.toNumber() }, reserved: { decrement: total.toNumber() } } });
    }
  });
  res.json({ message: 'Order cancelled.' });
}
