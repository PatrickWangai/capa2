import { Router } from 'express';
const router = Router();
import { prisma } from '../utils/db.js';
import logger from '../utils/logger.js';

router.post('/mpesa', async (req, res) => {
  // Daraja lets you register a callback URL with a secret query param — set
  // MPESA_CALLBACK_URL to include ?key=<MPESA_WEBHOOK_SECRET> and configure
  // the same value here so this endpoint can't be triggered/replayed by anyone
  // who guesses the URL. Without a configured secret this check is skipped
  // (loudly logged) rather than breaking an already-live callback URL.
  if (process.env.MPESA_WEBHOOK_SECRET) {
    if (req.query.key !== process.env.MPESA_WEBHOOK_SECRET) {
      logger.error('M-Pesa webhook rejected: invalid or missing secret key');
      return res.status(401).json({ ResultCode: 1, ResultDesc: 'Unauthorized' });
    }
  } else {
    logger.warn('M-Pesa webhook has no MPESA_WEBHOOK_SECRET configured — endpoint accepts unauthenticated callbacks');
  }

  try {
    const body = JSON.parse(req.body.toString());
    const cb = body.Body && body.Body.stkCallback;
    if (!cb) return res.json({ ResultCode: 0 });

    const instruction = await prisma.paymentInstruction.findFirst({ where: { providerRef: cb.CheckoutRequestID } });
    // Guard against replay: only act once, on a still-pending instruction.
    if (instruction && instruction.status !== 'COMPLETED' && cb.ResultCode === 0) {
      await prisma.$transaction(async (db) => {
        const tx = await db.transaction.update({ where: { id: instruction.transactionId }, data: { status: 'COMPLETED' } });
        const updated = await db.paymentInstruction.updateMany({
          where: { id: instruction.id, status: { not: 'COMPLETED' } },
          data: { status: 'COMPLETED', confirmedAt: new Date() },
        });
        if (updated.count === 0) return; // already completed by a concurrent callback — skip crediting again
        await db.accountBalance.upsert({
          where: { accountId_currency: { accountId: tx.accountId, currency: tx.currency } },
          create: { accountId: tx.accountId, currency: tx.currency, available: tx.amount },
          update: { available: { increment: Number(tx.amount) } },
        });
      });
    }
    res.json({ ResultCode: 0 });
  } catch (e) {
    logger.error('M-Pesa webhook error', { error: e.message });
    res.json({ ResultCode: 0 });
  }
});
export default router;
