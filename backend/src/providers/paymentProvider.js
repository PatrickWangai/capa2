/**
 * PaymentProvider Interface
 *
 * Swap Mock providers for real M-Pesa / bank integrations without
 * changing any business logic.
 *
 * TODO: Wire MockMpesaProvider to Safaricom Daraja API after M-Pesa go-live approval.
 * TODO: Wire MockBankProvider to your banking partner's API after bank partnership.
 */

// ── Abstract interface ────────────────────────────────────────────────────────

export class PaymentProvider {
  /**
   * Initiate an inbound payment (deposit).
   * @returns {Promise<{providerRef, status, message}>}
   */
  async deposit({ amount, currency, phone, accountRef, callbackUrl }) {
    throw new Error('Not implemented');
  }

  /**
   * Initiate an outbound payment (withdrawal / disbursement).
   * @returns {Promise<{providerRef, status, message}>}
   */
  async withdraw({ amount, currency, phone, bankAccount, bankCode }) {
    throw new Error('Not implemented');
  }

  /**
   * Verify the status of a payment by provider reference.
   * @returns {Promise<{status: 'pending'|'completed'|'failed', amount, currency}>}
   */
  async verify(providerRef) {
    throw new Error('Not implemented');
  }
}

// ── Mock M-Pesa Provider ──────────────────────────────────────────────────────
// TODO: Replace with real Daraja STK Push integration.
// Endpoint: POST https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest
// Auth: OAuth2 via https://sandbox.safaricom.co.ke/oauth/v1/generate

export class MockMpesaProvider extends PaymentProvider {
  async deposit({ amount, currency = 'KES', phone, accountRef }) {
    console.log(`[MOCK M-Pesa] STK Push → ${phone}, KES ${amount}, ref: ${accountRef}`);
    return {
      providerRef: `MP-${Date.now()}`,
      status:      'completed',
      message:     '[MOCK] M-Pesa STK Push initiated. In production, user will see a prompt on their phone.',
    };
  }

  async withdraw({ amount, currency = 'KES', phone }) {
    console.log(`[MOCK M-Pesa] B2C → ${phone}, KES ${amount}`);
    return {
      providerRef: `MPW-${Date.now()}`,
      status:      'pending',
      message:     '[MOCK] B2C disbursement queued. In production, funds arrive within minutes.',
    };
  }

  async verify(providerRef) {
    return { status: 'completed', amount: null, currency: 'KES' };
  }
}

// ── Mock Bank Transfer Provider ───────────────────────────────────────────────
// TODO: Replace with real bank API (PesaLink, RTGS, SWIFT, SEPA, etc.).

export class MockBankProvider extends PaymentProvider {
  async deposit({ amount, currency, bankAccount, bankCode }) {
    console.log(`[MOCK Bank] Deposit → ${bankAccount}, ${currency} ${amount}`);
    return {
      providerRef: `BNK-${Date.now()}`,
      status:      'pending',
      message:     '[MOCK] Bank transfer initiated. In production, takes 1-3 business days.',
    };
  }

  async withdraw({ amount, currency, bankAccount, bankCode }) {
    console.log(`[MOCK Bank] Withdrawal → ${bankAccount}, ${currency} ${amount}`);
    return {
      providerRef: `BNKW-${Date.now()}`,
      status:      'pending',
      message:     '[MOCK] Bank withdrawal queued. In production, takes 1-2 business days.',
    };
  }

  async verify(providerRef) {
    return { status: 'completed', amount: null, currency: null };
  }
}

export const mpesaProvider = new MockMpesaProvider();
export const bankProvider  = new MockBankProvider();
