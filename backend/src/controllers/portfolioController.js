import { prisma } from '../utils/db.js';
import Decimal from 'decimal.js';

// GET /api/portfolio
export async function getPortfolio(req, res) {
  const account = await prisma.investmentAccount.findFirst({
    where: { userId: req.user.id, isPrimary: true },
    include: {
      balances: true,
      positions: {
        where: { quantity: { gt: 0 } },
        include: {
          asset: { include: { price: true } },
        },
      },
    },
  });

  if (!account) return res.status(404).json({ error: 'Account not found.' });

  let totalValue = new Decimal(0);
  let totalInvested = new Decimal(0);
  let totalGainLoss = new Decimal(0);
  let dailyChange = new Decimal(0);

  const positions = account.positions.map(pos => {
    const qty = new Decimal(pos.quantity.toString());
    const avgCost = new Decimal(pos.avgCostPrice.toString());
    const invested = new Decimal(pos.totalInvested.toString());
    const currentPrice = pos.asset.price ? new Decimal(pos.asset.price.price.toString()) : avgCost;
    const prevClose = pos.asset.price?.previousClose ? new Decimal(pos.asset.price.previousClose.toString()) : currentPrice;
    const marketValue = qty.mul(currentPrice);
    const gainLoss = marketValue.minus(invested);
    const gainLossPct = invested.gt(0) ? gainLoss.div(invested).mul(100) : new Decimal(0);
    const dayGainLoss = qty.mul(currentPrice.minus(prevClose));

    totalValue = totalValue.plus(marketValue);
    totalInvested = totalInvested.plus(invested);
    totalGainLoss = totalGainLoss.plus(gainLoss);
    dailyChange = dailyChange.plus(dayGainLoss);

    return {
      id: pos.id,
      assetId: pos.assetId,
      symbol: pos.asset.symbol,
      name: pos.asset.name,
      exchange: pos.asset.exchange,
      logoUrl: pos.asset.logoUrl,
      quantity: qty.toFixed(6),
      avgCostPrice: avgCost.toFixed(4),
      currentPrice: currentPrice.toFixed(4),
      marketValue: marketValue.toFixed(2),
      totalInvested: invested.toFixed(2),
      gainLoss: gainLoss.toFixed(2),
      gainLossPct: gainLossPct.toFixed(2),
      dayGainLoss: dayGainLoss.toFixed(2),
      currency: pos.asset.currency,
      allocation: 0, // filled below
    }
  });

  // Calculate allocations
  positions.forEach(p => {
    p.allocation = totalValue.gt(0)
      ? new Decimal(p.marketValue).div(totalValue).mul(100).toFixed(2)
      : '0.00';
  });

  const cashBalances = account.balances.map(b => ({
    currency: b.currency,
    available: new Decimal(b.available.toString()).toFixed(2),
    reserved: new Decimal(b.reserved.toString()).toFixed(2),
  }));

  res.json({
    account: {
      id: account.id,
      accountNumber: account.accountNumber,
      baseCurrency: account.baseCurrency,
    },
    summary: {
      totalValue: totalValue.toFixed(2),
      totalInvested: totalInvested.toFixed(2),
      totalGainLoss: totalGainLoss.toFixed(2),
      totalGainLossPct: totalInvested.gt(0) ? totalGainLoss.div(totalInvested).mul(100).toFixed(2) : '0.00',
      dailyChange: dailyChange.toFixed(2),
      dailyChangePct: totalValue.gt(0) ? dailyChange.div(totalValue).mul(100).toFixed(2) : '0.00',
    },
    positions,
    cashBalances,
  });
}

// GET /api/portfolio/history
export async function getPortfolioHistory(req, res) {
  const { period = '1M' } = req.query;

  const periodMap = { '1W': 7, '1M': 30, '3M': 90, '6M': 180, '1Y': 365, 'ALL': 3650 }
  const days = periodMap[period] || 30;
  const from = new Date(Date.now() - days * 86_400_000);

  const account = await prisma.investmentAccount.findFirst({ where: { userId: req.user.id, isPrimary: true } });

  const txs = await prisma.transaction.findMany({
    where: { accountId: account.id, createdAt: { gte: from }, status: 'COMPLETED' },
    orderBy: { createdAt: 'asc' },
  });

  // Simplified: return transaction-based chart points
  let runningValue = 0;
  const history = txs.map(tx => {
    const amount = Number(tx.amount);
    if (['DEPOSIT', 'BUY'].includes(tx.type)) runningValue += amount;
    if (['WITHDRAWAL', 'SELL'].includes(tx.type)) runningValue -= amount;
    return { date: tx.createdAt, value: runningValue.toFixed(2) }
  });

  res.json({ history, period });
}

// GET /api/portfolio/dividends
export async function getDividends(req, res) {
  const account = await prisma.investmentAccount.findFirst({ where: { userId: req.user.id, isPrimary: true } });

  const payments = await prisma.dividendPayment.findMany({
    where: { accountId: account.id },
    include: { dividend: { include: { asset: { select: { symbol: true, name: true } } } } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const total = payments
    .filter(p => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + Number(p.netAmount), 0);

  res.json({ payments, totalDividends: total.toFixed(2) });
}
