/**
 * Redis caching service for analytics and frequently accessed data
 * Falls back gracefully if Redis is unavailable
 */

const Redis = require('ioredis');
const logger = require('./logger');
const cfg = require('../config/env');

let redisClient = null;
let isAvailable = false;

const getRedisClient = () => {
  if (redisClient) return redisClient;

  try {
    redisClient = new Redis(cfg.redisURL, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 3) {
          logger.warn('Redis connection failed after 3 retries — caching disabled');
          return null; // Stop retrying
        }
        return Math.min(times * 200, 2000);
      },
      lazyConnect: true,
    });

    redisClient.on('connect', () => {
      isAvailable = true;
      logger.info('Redis connected successfully');
    });

    redisClient.on('error', (err) => {
      isAvailable = false;
      logger.warn(`Redis error: ${err.message}`);
    });

    redisClient.on('close', () => {
      isAvailable = false;
    });
  } catch (err) {
    logger.warn(`Redis init error: ${err.message}`);
    return null;
  }

  return redisClient;
};

// Attempt initial connection (non-blocking)
setTimeout(async () => {
  try {
    const client = getRedisClient();
    if (client) await client.connect();
  } catch {
    // Silently fail — app works without Redis
  }
}, 0);

/**
 * Get cached data by key
 */
const getCache = async (key) => {
  try {
    if (!isAvailable || !redisClient) return null;
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

/**
 * Set cached data with TTL (default 5 minutes)
 */
const setCache = async (key, data, ttlSeconds = 300) => {
  try {
    if (!isAvailable || !redisClient) return;
    await redisClient.setex(key, ttlSeconds, JSON.stringify(data));
  } catch {
    // Silently fail
  }
};

/**
 * Invalidate cache by pattern (e.g., "analytics:*")
 */
const invalidateCache = async (pattern) => {
  try {
    if (!isAvailable || !redisClient) return;
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(...keys);
    }
  } catch {
    // Silently fail
  }
};

/**
 * Clear all cache
 */
const clearAllCache = async () => {
  try {
    if (!isAvailable || !redisClient) return;
    await redisClient.flushall();
    logger.info('Redis cache cleared');
  } catch {
    // Silently fail
  }
};

module.exports = { getCache, setCache, invalidateCache, clearAllCache, getRedisClient };