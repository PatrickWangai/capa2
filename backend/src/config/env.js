import logger from '../utils/logger.js';

/**
 * Boot-time configuration check.
 *
 * index.js already warned about three unset variables; this generalises that
 * and adds the part that was missing — in production, missing configuration
 * stops the process instead of logging and carrying on.
 *
 * The reason is depositsController: every field of the bank-transfer
 * instructions it returns to customers has a fallback, so an unset
 * BANK_ACCOUNT_NO does not fail, it quietly tells someone to wire money to
 * "XXXXXXXXXXXX". Configuration that is wrong in a way the app cannot detect
 * at runtime has to be caught before the app serves a single request.
 *
 * Written as a plain list rather than with a schema library: it is a fixed set
 * of names and a few conditionals, and a money-handling service does not need
 * another dependency to express that.
 */

/**
 * Without these the process cannot function at all, in any environment.
 * Entries may list aliases: config/jwt.js accepts ACCESS_TOKEN_SECRET and
 * REFRESH_TOKEN_SECRET in place of the JWT_* names, so this check has to as
 * well — otherwise it refuses to start a correctly configured server.
 */
const REQUIRED_ALWAYS = [
  ['DATABASE_URL'],
  ['REDIS_URL'],
  ['JWT_SECRET', 'ACCESS_TOKEN_SECRET'],
  ['JWT_REFRESH_SECRET', 'REFRESH_TOKEN_SECRET'],
];

/** Safe to omit locally; unacceptable in production. */
const REQUIRED_IN_PRODUCTION = [
  'CORS_ORIGINS',
  'FRONTEND_URL',
  'MFA_ENCRYPTION_KEY',
  'ADMIN_PASSWORD',
  'ADMIN2_PASSWORD',
  'BANK_NAME',
  'BANK_ACCOUNT_NAME',
  'BANK_ACCOUNT_NO',
];

/** Values that are obviously stand-ins. Present but meaningless is still missing. */
const PLACEHOLDERS = new Set(['xxxxxxxxxxxx', 'changeme', 'change-me', 'todo', 'placeholder', 'secret', '']);

/** Turning a mock off is worthless if the credentials it needs are absent. */
const WHEN_ENABLED = [
  {
    label: 'M-Pesa is live (MPESA_LIVE=true)',
    active: () => process.env.MPESA_LIVE === 'true',
    needs: ['MPESA_CONSUMER_KEY', 'MPESA_CONSUMER_SECRET', 'MPESA_PASSKEY', 'MPESA_SHORTCODE', 'MPESA_CALLBACK_URL', 'MPESA_WEBHOOK_SECRET'],
  },
  {
    label: 'payments are live (PAYMENT_MOCK=false)',
    active: () => process.env.PAYMENT_MOCK === 'false',
    needs: ['BANK_ACCOUNT_NO', 'BANK_PAYBILL'],
  },
  {
    label: 'Alpaca trading is pointed at live',
    active: () => (process.env.ALPACA_BASE_URL || '').includes('api.alpaca.markets') && !(process.env.ALPACA_BASE_URL || '').includes('paper'),
    needs: ['ALPACA_API_KEY', 'ALPACA_SECRET_KEY'],
  },
];

const isBlank = (name) => {
  const value = process.env[name];
  return value === undefined || PLACEHOLDERS.has(String(value).trim().toLowerCase());
};

export function checkEnvironment({ exitOnFailure = true } = {}) {
  const production = process.env.NODE_ENV === 'production';
  const errors = [];
  const warnings = [];

  for (const names of REQUIRED_ALWAYS) {
    if (names.every(isBlank)) {
      errors.push(names.length > 1 ? `${names[0]} is required (or ${names.slice(1).join(' / ')}).` : `${names[0]} is required.`);
    }
  }

  for (const name of REQUIRED_IN_PRODUCTION) {
    if (!isBlank(name)) continue;
    (production ? errors : warnings).push(
      production ? `${name} is required in production.` : `${name} is not set — fine locally, required in production.`,
    );
  }

  for (const rule of WHEN_ENABLED) {
    if (!rule.active()) continue;
    const missing = rule.needs.filter(isBlank);
    if (missing.length) errors.push(`${rule.label}, but ${missing.join(', ')} ${missing.length === 1 ? 'is' : 'are'} not set.`);
  }

  warnings.forEach((w) => logger.warn(w));

  if (errors.length) {
    const message = ['Configuration is incomplete:', ...errors.map((e) => `  - ${e}`)].join('\n');
    if (!exitOnFailure) throw new Error(message);
    logger.error(message);
    // Refusing to start is the point: a half-configured money service that
    // answers requests is worse than one that is plainly down.
    process.exit(1);
  }

  return { errors, warnings };
}
