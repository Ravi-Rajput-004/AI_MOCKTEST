/**
 * Cache utility built on top of Redis config.
 * Provides higher-level caching operations like memoization and invalidation.
 */
import { cacheGet, cacheSet, cacheDel } from '../config/redis.js';
import crypto from 'crypto';

/**
 * Generate a deterministic cache key from a prefix and data.
 * @param {string} prefix - Cache namespace
 * @param {*} data - Data to hash (string, object, etc.)
 * @returns {string} Cache key
 */
export function makeCacheKey(prefix, data) {
  const hash = crypto
    .createHash('md5')
    .update(typeof data === 'string' ? data : JSON.stringify(data))
    .digest('hex');
  return `${prefix}:${hash}`;
}

/**
 * Get-or-set cache pattern.
 * Returns cached value if available, otherwise executes the callback,
 * caches the result, and returns it.
 *
 * @param {string} key - Cache key
 * @param {Function} fn - Async function to produce the value
 * @param {number} [ttlSeconds=3600] - TTL in seconds
 * @returns {Promise<*>} Cached or fresh value
 */
export async function cacheWrap(key, fn, ttlSeconds = 3600) {
  const cached = await cacheGet(key);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      return cached;
    }
  }

  const result = await fn();
  const serialized = typeof result === 'string' ? result : JSON.stringify(result);
  await cacheSet(key, serialized, ttlSeconds);
  return result;
}

/**
 * Invalidate all cache keys matching a prefix pattern.
 * Note: Only works with real Redis (uses KEYS command — use sparingly).
 * In-memory store deletes by exact key only.
 *
 * @param {string} key - Exact cache key to delete
 */
export async function invalidateCache(key) {
  await cacheDel(key);
}
