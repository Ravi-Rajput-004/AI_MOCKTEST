/**
 * Upstash Redis client via ioredis.
 * Gracefully handles missing REDIS_URL — falls back to in-memory Map for development.
 */
import { env } from './env.js';

/** @type {import('ioredis').Redis | null} */
let redis = null;

/** @type {Map<string, { value: string, expiry: number | null }>} */
const memoryStore = new Map();

/**
 * Initialize Redis connection.
 * Returns null if REDIS_URL is not configured — cache utilities use in-memory fallback.
 */
async function initRedis() {
  if (!env.REDIS_URL) {
    console.warn('⚠️  REDIS_URL not set — using in-memory cache (development only)');
    return null;
  }

  try {
    const Redis = (await import('ioredis')).default;
    redis = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => Math.min(times * 200, 3000),
      lazyConnect: true,
    });

    await redis.connect();
    console.log('✅ Redis connected');
    return redis;
  } catch (error) {
    console.error('❌ Redis connection failed:', error.message);
    return null;
  }
}

/**
 * Get a value from Redis or in-memory fallback.
 * @param {string} key
 * @returns {Promise<string | null>}
 */
async function cacheGet(key) {
  if (redis) {
    return redis.get(key);
  }
  const entry = memoryStore.get(key);
  if (!entry) return null;
  if (entry.expiry && Date.now() > entry.expiry) {
    memoryStore.delete(key);
    return null;
  }
  return entry.value;
}

/**
 * Set a value in Redis or in-memory fallback.
 * @param {string} key
 * @param {string} value
 * @param {number} [ttlSeconds] — TTL in seconds
 */
async function cacheSet(key, value, ttlSeconds) {
  if (redis) {
    if (ttlSeconds) {
      return redis.set(key, value, 'EX', ttlSeconds);
    }
    return redis.set(key, value);
  }
  memoryStore.set(key, {
    value,
    expiry: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null,
  });
}

/**
 * Delete a key from Redis or in-memory fallback.
 * @param {string} key
 */
async function cacheDel(key) {
  if (redis) {
    return redis.del(key);
  }
  memoryStore.delete(key);
}

export { redis, initRedis, cacheGet, cacheSet, cacheDel };
