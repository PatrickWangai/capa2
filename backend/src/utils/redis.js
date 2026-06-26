import Redis from 'ioredis';
import logger from './logger.js';

let redis;

if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    retryStrategy: times => Math.min(times * 100, 3000),
  });
  redis.on('connect', () => logger.info('Redis connected'));
  redis.on('error', err => logger.error('Redis error', { error: err.message }));
} else {
  // No-op stub so callers work without Redis
  logger.warn('REDIS_URL not set — token blacklisting disabled');
  redis = {
    get: async () => null,
    setex: async () => null,
    del: async () => null,
    set: async () => null,
  };
}

export { redis };
