import { prisma } from '../utils/db.js';
import Decimal from 'decimal.js';
import logger from '../utils/logger.js';

async function takeSnapshots() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const accounts = await prisma.investmentAccount.findMany({
    where: { isPrimary: true, isActive: true },
    include: {
      balances: true,
      positions: {
        where: { quantity: { gt: 0 } },
        include: { asset: { include: { price: true } } },
      },
    },
  });

  let saved = 0;
  for (const account of accounts) {
    try {
      const existing = await prisma.portfolioSnapshot.findFirst({
        where: { accountId: account.id, snapshotAt: { gte: today } },
      });
      if (existing) continue;

      let equityValue = new Decimal(0);
      for (const pos of account.positions) {
        const price = pos.asset.price
          ? new Decimal(pos.asset.price.price.toString())
          : new Decimal(pos.avgCostPrice.toString());
        equityValue = equityValue.plus(price.mul(new Decimal(pos.quantity.toString())));
      }

      let cashValue = new Decimal(0);
      for (const bal of account.balances) {
        cashValue = cashValue.plus(new Decimal(bal.available.toString()));
      }

      await prisma.portfolioSnapshot.create({
        data: {
          accountId:   account.id,
          totalValue:  equityValue.plus(cashValue),
          cashValue,
          equityValue,
          currency:    account.baseCurrency,
          snapshotAt:  new Date(),
        },
      });
      saved++;
    } catch (err) {
      logger.error('Portfolio snapshot error', { accountId: account.id, error: err.message });
    }
  }
  if (saved > 0) logger.info(`Portfolio snapshots saved: ${saved}`);
}

export function startPortfolioSnapshotJob() {
  takeSnapshots();
  setInterval(takeSnapshots, 24 * 60 * 60 * 1000);
  logger.info('Portfolio snapshot job started (daily)');
}
