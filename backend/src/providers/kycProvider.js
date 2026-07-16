/**
 * KYCProvider Interface
 *
 * Swap MockKYCProvider for a real vendor (Smile Identity, Onfido, Jumio,
 * Sumsub, ComplyAdvantage) without changing business logic.
 *
 * TODO: Integrate a licensed KYC/AML provider before allowing live trading.
 *       Required for compliance with Kenya's Capital Markets (Licensing)
 *       Regulations and AML/CFT obligations.
 */

export class KYCProvider {
  /**
   * Submit identity documents for verification.
   * @param {{userId, documentType, documentUrl, selfieUrl, metadata}} data
   * @returns {Promise<{submissionId, status, message}>}
   */
  async submit(data) { throw new Error('Not implemented'); }

  /**
   * Check the status of a KYC submission.
   * @param {string} submissionId
   * @returns {Promise<{status: 'pending'|'approved'|'rejected', reason?: string}>}
   */
  async verify(submissionId) { throw new Error('Not implemented'); }

  /**
   * Retrieve the full KYC status and risk score for a user.
   * @param {string} userId
   * @returns {Promise<{status, riskScore, flags: string[]}>}
   */
  async status(userId) { throw new Error('Not implemented'); }

  /**
   * Run AML/sanctions screening.
   * @param {{name, dateOfBirth, nationality}} identity
   * @returns {Promise<{clear: boolean, hits: any[]}>}
   */
  async screenAML(identity) { throw new Error('Not implemented'); }
}

// ── Mock KYC Provider ─────────────────────────────────────────────────────────
// TODO: Replace with Smile Identity (recommended for Kenya/Africa) or Onfido.
// Smile Identity docs: https://docs.smileidentity.com
// Onfido docs: https://documentation.onfido.com

export class MockKYCProvider extends KYCProvider {
  async submit({ userId, documentType, documentUrl }) {
    console.log(`[MOCK KYC] Submit → user:${userId}, doc:${documentType}`);
    return {
      submissionId: `KYC-${Date.now()}`,
      status:       'pending',
      message:      '[MOCK] KYC submitted. In production, review takes 24-48 hours.',
    };
  }

  async verify(submissionId) {
    console.log(`[MOCK KYC] Verify → ${submissionId}`);
    return {
      status: 'approved',
      reason: null,
    };
  }

  async status(userId) {
    return {
      status:    'approved',
      riskScore: 0,
      flags:     [],
    };
  }

  async screenAML({ name }) {
    console.log(`[MOCK AML] Screen → ${name}`);
    return { clear: true, hits: [] };
  }
}

export default new MockKYCProvider();
