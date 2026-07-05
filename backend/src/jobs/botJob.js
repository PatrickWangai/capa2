import Decimal from 'decimal.js';
import { prisma } from '../utils/db.js';
import { fillOrder } from '../controllers/ordersController.js';
import logger from '../utils/logger.js';

const BOT_INTERVAL_MS = 30_000;

// ── RSI calculation from price history ───────────────────────────
function calcRsi(closes, period = 14) {
  if (closes.length < period + 1) return null;
  const recent = closes.slice(-period - 1);
  let gains = 0, losses = 0;
  for (let i = 1; i < recent.length; i++) {
    const diff = recent[i] - recent[i - 1];
    if (diff > 0) gains += diff; else losses -= diff;
  }
  if (losses === 0) return 100;
  const rs = gains / losses;
  return 100 - (100 / (1 + rs));
}

// ── Simple Moving Average ─────────────────────────────────────────
function calcSma(closes, period) {
  if (closes.length < period) return null;
  const slice = closes.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

// ── Execute a bot trade ───────────────────────────────────────────
async function executeBotTrade(bot, side, price, reason) {
  try {
    const account = await prisma.investmentAccount.findFirst({
      where: { userId: bot.userId, isPrimary: true, isActive: true },
      include: { balances: true },
    });
    if (!account) return;

    const asset = await prisma.asset.findUnique({ where: { id: bot.assetId } });
    const qty = new Decimal(bot.quantity.toString());
    const total = qty.mul(price);
    const fee = total.mul(0.001);

    if (side === 'BUY') {
      const bal = account.balances.find(b => b.currency === asset.currency);
      const available = bal ? new Decimal(bal.available.toString()) : new Decimal(0);
      if (available.lt(total.plus(fee))) {
        logger.warn(`Bot ${bot.id}: insufficient funds for BUY`);
        return;
      }
    } else {
      const position = await prisma.position.findUnique({
        where: { accountId_assetId: { accountId: account.id, assetId: bot.assetId } },
      });
      if (!position || new Decimal(position.quantity.toString()).lt(qty)) {
        logger.warn(`Bot ${bot.id}: insufficient shares for SELL`);
        return;
      }
    }

    const order = await prisma.$transaction(async (tx) => {
      const o = await tx.order.create({
        data: {
          accountId: account.id, assetId: bot.assetId,
          side, orderType: 'MARKET', quantity: qty.toFixed(6),
          estimatedTotal: total.toFixed(6), fee: fee.toFixed(6),
          currency: asset.currency, status: 'PENDING',
          notes: `Bot: ${reason}`,
        },
      });
      if (side === 'BUY') {
        await tx.accountBalance.updateMany({
          where: { accountId: account.id, currency: asset.currency },
          data: { available: { decrement: total.plus(fee).toNumber() }, reserved: { increment: total.plus(fee).toNumber() } },
        });
      }
      return o;
    });

    await fillOrder(order.id, price);

    await prisma.botTrade.create({
      data: { botId: bot.id, orderId: order.id, side, quantity: qty.toFixed(6), price: new Decimal(price).toFixed(6), reason },
    });

    await prisma.tradingBot.update({
      where: { id: bot.id },
      data: { tradesCount: { increment: 1 }, lastRunAt: new Date() },
    });

    logger.info(`Bot ${bot.name}: ${side} ${qty} ${asset.symbol} @ ${price} — ${reason}`);
  } catch (err) {
    logger.error(`Bot ${bot.id} trade error`, { error: err.message });
  }
}

// ── Strategy evaluators ───────────────────────────────────────────
async function evalPriceThreshold(bot, currentPrice, hasPosition) {
  const { buyBelow, sellAbove } = bot.params;
  if (!hasPosition && buyBelow && currentPrice <= Number(buyBelow)) {
    await executeBotTrade(bot, 'BUY', currentPrice, `Price ${currentPrice} ≤ buyBelow ${buyBelow}`);
  } else if (hasPosition && sellAbove && currentPrice >= Number(sellAbove)) {
    await executeBotTrade(bot, 'SELL', currentPrice, `Price ${currentPrice} ≥ sellAbove ${sellAbove}`);
  }
}

async function evalRsi(bot, closes, currentPrice, hasPosition) {
  const { period = 14, oversold = 30, overbought = 70 } = bot.params;
  const rsi = calcRsi(closes, Number(period));
  if (rsi === null) return;
  if (!hasPosition && rsi < Number(oversold)) {
    await executeBotTrade(bot, 'BUY', currentPrice, `RSI ${rsi.toFixed(1)} < oversold ${oversold}`);
  } else if (hasPosition && rsi > Number(overbought)) {
    await executeBotTrade(bot, 'SELL', currentPrice, `RSI ${rsi.toFixed(1)} > overbought ${overbought}`);
  }
}

async function evalMaCrossover(bot, closes, currentPrice, hasPosition) {
  const { shortPeriod = 9, longPeriod = 21 } = bot.params;
  if (closes.length < Number(longPeriod) + 2) return;

  const shortNow  = calcSma(closes, Number(shortPeriod));
  const longNow   = calcSma(closes, Number(longPeriod));
  const shortPrev = calcSma(closes.slice(0, -1), Number(shortPeriod));
  const longPrev  = calcSma(closes.slice(0, -1), Number(longPeriod));

  if (!shortNow || !longNow || !shortPrev || !longPrev) return;

  const goldenCross = shortPrev <= longPrev && shortNow > longNow;
  const deathCross  = shortPrev >= longPrev && shortNow < longNow;

  if (!hasPosition && goldenCross) {
    await executeBotTrade(bot, 'BUY', currentPrice, `Golden cross: MA${shortPeriod} crossed above MA${longPeriod}`);
  } else if (hasPosition && deathCross) {
    await executeBotTrade(bot, 'SELL', currentPrice, `Death cross: MA${shortPeriod} crossed below MA${longPeriod}`);
  }
}

async function evalStopLossTp(bot, currentPrice, hasPosition, position) {
  if (!hasPosition || !position) return;
  const { stopLossPercent = 5, takeProfitPercent = 10 } = bot.params;
  const avgCost = Number(position.avgCostPrice);
  const pctChange = ((currentPrice - avgCost) / avgCost) * 100;

  if (pctChange <= -Number(stopLossPercent)) {
    await executeBotTrade(bot, 'SELL', currentPrice, `Stop loss triggered: ${pctChange.toFixed(1)}% drop`);
  } else if (pctChange >= Number(takeProfitPercent)) {
    await executeBotTrade(bot, 'SELL', currentPrice, `Take profit triggered: +${pctChange.toFixed(1)}%`);
  }
}

// ── Main bot runner ───────────────────────────────────────────────
async function runBots() {
  try {
    const bots = await prisma.tradingBot.findMany({
      where: { status: 'ACTIVE' },
      include: { asset: { include: { price: true } } },
    });
    if (!bots.length) return;

    for (const bot of bots) {
      try {
        const currentPrice = bot.asset.price?.price ? Number(bot.asset.price.price) : null;
        if (!currentPrice) continue;

        const account = await prisma.investmentAccount.findFirst({
          where: { userId: bot.userId, isPrimary: true },
        });
        if (!account) continue;

        const position = await prisma.position.findUnique({
          where: { accountId_assetId: { accountId: account.id, assetId: bot.assetId } },
        });
        const hasPosition = position && new Decimal(position.quantity.toString()).gt(0);

        let closes = [];
        if (['RSI', 'MA_CROSSOVER'].includes(bot.strategy)) {
          const history = await prisma.priceHistory.findMany({
            where: { assetId: bot.assetId, interval: '1d' },
            orderBy: { openTime: 'asc' },
            take: 60,
            select: { close: true },
          });
          closes = history.map(h => Number(h.close));
          closes.push(currentPrice);
        }

        switch (bot.strategy) {
          case 'PRICE_THRESHOLD': await evalPriceThreshold(bot, currentPrice, hasPosition); break;
          case 'RSI':             await evalRsi(bot, closes, currentPrice, hasPosition); break;
          case 'MA_CROSSOVER':    await evalMaCrossover(bot, closes, currentPrice, hasPosition); break;
          case 'STOP_LOSS_TP':    await evalStopLossTp(bot, currentPrice, hasPosition, position); break;
        }

        await prisma.tradingBot.update({ where: { id: bot.id }, data: { lastRunAt: new Date() } });
      } catch (err) {
        logger.error(`Bot ${bot.id} eval error`, { error: err.message });
      }
    }
  } catch (err) {
    logger.error('Bot job error', { error: err.message });
  }
}

export function startBotJob() {
  logger.info('Trading bot job started (checking every 30s)');
  setInterval(runBots, BOT_INTERVAL_MS);
}
