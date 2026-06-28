import { prisma } from '../utils/db.js';
import { fillOrder } from '../controllers/ordersController.js';
import logger from '../utils/logger.js';

const CHECK_INTERVAL_MS = 30_000;

async function checkLimitOrders() {
  try {
    const orders = await prisma.order.findMany({
      where: {
        status: { in: ['PENDING', 'OPEN'] },
        orderType: { in: ['LIMIT', 'STOP', 'STOP_LIMIT'] },
      },
      include: { asset: { include: { price: true } } },
    });

    for (const order of orders) {
      const currentPrice = order.asset.price?.price ? Number(order.asset.price.price) : null;
      if (!currentPrice) continue;

      const limitPrice = order.limitPrice ? Number(order.limitPrice) : null;
      const stopPrice = order.stopPrice ? Number(order.stopPrice) : null;

      let shouldFill = false;
      let fillPrice = currentPrice;

      if (order.orderType === 'LIMIT') {
        if (order.side === 'BUY' && limitPrice && currentPrice <= limitPrice) {
          shouldFill = true;
          fillPrice = limitPrice;
        } else if (order.side === 'SELL' && limitPrice && currentPrice >= limitPrice) {
          shouldFill = true;
          fillPrice = limitPrice;
        }
      } else if (order.orderType === 'STOP') {
        if (order.side === 'BUY' && stopPrice && currentPrice >= stopPrice) {
          shouldFill = true;
        } else if (order.side === 'SELL' && stopPrice && currentPrice <= stopPrice) {
          shouldFill = true;
        }
      } else if (order.orderType === 'STOP_LIMIT') {
        // Triggered by stop, filled at limit
        if (stopPrice && limitPrice) {
          const triggered =
            (order.side === 'BUY' && currentPrice >= stopPrice) ||
            (order.side === 'SELL' && currentPrice <= stopPrice);
          const fillable =
            (order.side === 'BUY' && currentPrice <= limitPrice) ||
            (order.side === 'SELL' && currentPrice >= limitPrice);
          if (triggered && fillable) {
            shouldFill = true;
            fillPrice = limitPrice;
          }
        }
      }

      if (shouldFill) {
        await fillOrder(order.id, fillPrice);
        logger.info('Limit/stop order filled', { orderId: order.id, type: order.orderType, side: order.side, fillPrice });
      }
    }
  } catch (err) {
    logger.error('Limit order job error', { error: err.message });
  }
}

export function startLimitOrderJob() {
  setInterval(checkLimitOrders, CHECK_INTERVAL_MS);
  logger.info('Limit order job started (checking every 30s)');
}
