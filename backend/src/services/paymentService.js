import logger from '../utils/logger.js';

// TODO: Connect each method to its real provider when ready.
// M-Pesa:  set MPESA_LIVE=true and wire up mpesaService.js
// Bank:    implement bank webhook verification
// Withdrawal: integrate bank transfer or mobile money disbursement API

const MOCK = process.env.PAYMENT_MOCK !== 'false'; // mock unless explicitly disabled

// ── PaymentService interface ──────────────────────────────────

export const PaymentService = {
  /**
   * Initiate a KES deposit via mobile money (M-Pesa/Airtel).
   * Returns { providerRef, message } on success.
   * TODO: Route to mpesaService.initiateMpesaSTKPush in production.
   */
  async initiateKesDeposit({ userId, amount, phone, reference }) {
    if (MOCK) {
      logger.info('PaymentService.initiateKesDeposit (mock)', { userId, amount, phone, reference });
      return {
        providerRef: `MOCK-DEP-${reference.slice(0, 8).toUpperCase()}`,
        message:     'Mock KES deposit initiated — balance credited immediately.',
        confirmed:   true,  // mock: instant confirmation
      };
    }
    // TODO: call real M-Pesa STK push
    throw new Error('Live KES deposit not yet configured.');
  },

  /**
   * Initiate a USD → KES withdrawal to mobile money or bank.
   * Returns { providerRef, estimatedArrival } on success.
   * TODO: Integrate with bank transfer API or M-Pesa B2C.
   */
  async initiateWithdrawal({ userId, amount, currency, phone, bankAccount, bankName, reference }) {
    if (MOCK) {
      logger.info('PaymentService.initiateWithdrawal (mock)', { userId, amount, currency, reference });
      return {
        providerRef:       `MOCK-WD-${reference.slice(0, 8).toUpperCase()}`,
        estimatedArrival:  '1-2 business days (mock)',
        confirmed:         false, // withdrawals stay pending until admin confirms
      };
    }
    throw new Error('Live withdrawal not yet configured.');
  },

  /**
   * Verify a callback/webhook from the payment provider.
   * TODO: Validate HMAC/signature from real provider.
   */
  async verifyCallback(payload) {
    if (MOCK) return { verified: true, transactionId: payload.reference, status: 'COMPLETED' };
    throw new Error('Live callback verification not yet configured.');
  },
};
