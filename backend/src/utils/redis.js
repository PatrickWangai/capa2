import Redis from 'ioredis';
import logger from './logger.js';

let redis;

if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    retryStrategy: times => Math.min(times * 100, 3000),
  });
  let consecutiveErrors = 0;
  redis.on('connect', () => { consecutiveErrors = 0; logger.info('Redis connected'); });
  redis.on('error', err => {
    consecutiveErrors++;
    // Log the first few attempts so real outages are visible, then go quiet
    // instead of spamming error-level logs on every retry (retries every <=3s).
    if (consecutiveErrors <= 3) logger.error('Redis error', { error: err.message });
    else if (consecutiveErrors === 4) logger.error('Redis still unreachable — suppressing further retry logs until it reconnects', { error: err.message });
  });
} else {
  // No-op stub so callers work without Redis
  logger.warn('REDIS_URL not set — token blacklisting disabled');
  redis = {
    get: async () => null,
    setex: async () => null,
    del: async () => null,
    set: async () => null,
    quit: async () => null,
  };
}

export { redis };
