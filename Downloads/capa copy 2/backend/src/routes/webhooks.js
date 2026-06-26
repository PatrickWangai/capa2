import { Router } from 'express';
const router = Router();
import { prisma } from '../utils/db.js';
import logger from '../utils/logger.js';

router.post('/mpesa', async (req, res) => {
  try {
    const body = JSON.parse(req.body.toString());
    const cb = body.Body && body.Body.stkCallback;
    if (!cb) return res.json({ ResultCode: 0 });
    const instruction = await prisma.paymentInstruction.findFirst({ where: { providerRef: cb.CheckoutRequestID } });
    if (instruction && cb.ResultCode === 0) {
      const tx = await prisma.transaction.update({ where: { id: instruction.transactionId }, data: { status: 'COMPLETED' } });
      await prisma.paymentInstruction.update({ where: { id: instruction.id }, data: { status: 'COMPLETED', confirmedAt: new Date() } });
      await prisma.accountBalance.upsert({
        where: { accountId_currency: { accountId: tx.accountId, currency: tx.currency } },
        create: { accountId: tx.accountId, currency: tx.currency, available: tx.amount },
        update: { available: { increment: Number(tx.amount) } },
      });
    }
    res.json({ ResultCode: 0 });
  } catch (e) {
    logger.error('M-Pesa webhook error', { error: e.message });
    res.json({ ResultCode: 0 });
  }
});
export default router;
