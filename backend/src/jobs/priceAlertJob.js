import { prisma } from '../utils/db.js';
import { createNotification } from '../services/notificationService.js';
import Decimal from 'decimal.js';
import logger from '../utils/logger.js';

async function checkPriceAlerts() {
  const alerts = await prisma.priceAlert.findMany({
    where: { isActive: true, triggeredAt: null },
    include: { asset: { include: { price: true } } },
  });

  for (const alert of alerts) {
    if (!alert.asset.price) continue;
    const current = new Decimal(alert.asset.price.price.toString());
    const target = alert.targetPrice ? new Decimal(alert.targetPrice.toString()) : null;
    let triggered = false;

    if (alert.condition === 'above' && target && current.gte(target)) triggered = true;
    if (alert.condition === 'below' && target && current.lte(target)) triggered = true;
    if (alert.condition === 'percent_change' && alert.percentChange) {
      const pct = new Decimal(alert.asset.price.changePercent?.toString() || '0');
      if (pct.abs().gte(new Decimal(alert.percentChange.toString()))) triggered = true;
    }

    if (triggered) {
      await prisma.priceAlert.update({ where: { id: alert.id }, data: { isActive: false, triggeredAt: new Date() } });
      await createNotification({
        userId: alert.userId,
        type: 'PRICE_ALERT',
        title: `Price Alert — ${alert.asset.symbol}`,
        body: `${alert.asset.symbol} is now ${alert.asset.currency} ${current.toFixed(2)} (${alert.condition} ${target?.toFixed(2) || alert.percentChange + '%'})`,
        metadata: { assetId: alert.assetId, price: current.toFixed(2), condition: alert.condition },
      });
    }
  }
}

export default { checkPriceAlerts }

if (require.main === module) {
  checkPriceAlerts()
    .then(() => process.exit(0))
    .catch(e => { logger.error(e.message); process.exit(1); });
}
