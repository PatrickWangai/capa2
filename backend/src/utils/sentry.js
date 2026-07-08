import * as Sentry from '@sentry/node';
import logger from './logger.js';

const enabled = Boolean(process.env.SENTRY_DSN);

export function initSentry() {
  if (!enabled) {
    logger.info('SENTRY_DSN not set — error monitoring disabled');
    return;
  }
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: 0.1,
  });
  logger.info('Sentry error monitoring enabled');
}

export { Sentry, enabled as sentryEnabled };
