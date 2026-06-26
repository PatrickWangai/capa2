import { prisma } from '../utils/db.js';
import { createNotification } from '../services/notificationService.js';
import Decimal from 'decimal.js';
import logger from '../utils/logger.js';

/**
 * Run daily: find dividends with pay_date = today, credit all holders
 */
async function processDividends() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dividends = await prisma.dividend.findMany({
    where: {
      payDate: { gte: today, lt: tomorrow },
      payments: { none: { status: 'COMPLETED' } },
    },
    include: { asset: true },
  });

  logger.info(`Processing ${dividends.length} dividends for ${today.toDateString()}`);

  for (const dividend of dividends) {
    const positions = await prisma.position.findMany({
      where: { assetId: dividend.assetId, quantity: { gt: 0 } },
      include: { account: { include: { user: true } } },
    });

    for (const position of positions) {
      const sharesHeld = new Decimal(position.quantity.toString());
      const amountPerShare = new Decimal(dividend.amountPerShare.toString());
      const gross = sharesHeld.mul(amountPerShare);
      const taxRate = position.account.user.countryOfResidence === 'US' ? 0 : 0.15; // 15% withholding
      const taxWithheld = gross.mul(taxRate);
      const net = gross.minus(taxWithheld);

      await prisma.$transaction(async (tx) => {
        const payment = await tx.dividendPayment.create({
          data: {
            dividendId: dividend.id,
            accountId: position.accountId,
            positionId: position.id,
            sharesHeld: sharesHeld.toFixed(6),
            grossAmount: gross.toFixed(6),
            taxWithheld: taxWithheld.toFixed(6),
            netAmount: net.toFixed(6),
            currency: dividend.currency,
            status: 'COMPLETED',
            paidAt: new Date(),
          },
        });

        await tx.accountBalance.upsert({
          where: { accountId_currency: { accountId: position.accountId, currency: dividend.currency } },
          create: { accountId: position.accountId, currency: dividend.currency, available: net.toFixed(6) },
          update: { available: { increment: net.toNumber() } },
        });

        await tx.transaction.create({
          data: {
            accountId: position.accountId,
            type: 'DIVIDEND',
            status: 'COMPLETED',
            amount: net.toFixed(6),
            currency: dividend.currency,
            description: `Dividend from ${dividend.asset.symbol} — ${sharesHeld.toFixed(4)} shares @ ${amountPerShare.toFixed(4)}`,
            metadata: { dividendId: dividend.id, paymentId: payment.id },
          },
        });
      });

      await createNotification({
        userId: position.account.userId,
        type: 'DIVIDEND',
        title: `Dividend Received — ${dividend.asset.symbol}`,
        body: `You received a dividend of ${dividend.currency} ${net.toFixed(2)} (${sharesHeld.toFixed(4)} shares × ${dividend.currency} ${amountPerShare.toFixed(4)}).`,
        metadata: { dividendId: dividend.id, assetId: dividend.assetId, amount: net.toFixed(2) },
      });
    }

    logger.info(`Dividend processed: ${dividend.asset.symbol} — ${positions.length} holders`);
  }
}

export default { processDividends }

// Run directly: node src/jobs/dividendJob.js
if (require.main === module) {
  processDividends()
    .then(() => { logger.info('Dividend job complete'); process.exit(0); })
    .catch(e => { logger.error('Dividend job failed', { error: e.message }); process.exit(1); });
}
