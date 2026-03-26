/**
 * Rate limiting middleware using express-rate-limit.
 * Uses Redis store when available, falls back to memory store.
 * Different limits for different endpoint categories.
 */
import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

/**
 * Create a rate limiter with given options.
 * @param {Object} options
 * @param {number} options.windowMs - Time window in ms
 * @param {number} options.max - Max requests per window
 * @param {string} options.message - Error message
 * @returns {import('express-rate-limit').RateLimitRequestHandler}
 */
function createLimiter({ windowMs, max, message }) {
  return rateLimit({
    windowMs,
    max,
    message: { success: false, message },
    standardHeaders: true,
    legacyHeaders: false,
    // Skip rate limiting for admin users
    skip: (req) => req.user?.isAdmin === true,
    keyGenerator: (req) => {
      // Use user ID for authenticated requests, IP for anonymous
      return req.user?.id || req.ip;
    },
  });
}

/** Auth endpoints: 10 requests per 15 minutes per IP */
export const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many auth attempts. Please try again in 15 minutes.',
});

/** Answer submission: 30 requests per hour per user */
export const answerLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 30,
  message: 'Answer submission limit reached. Please try again later.',
});

/** Hint requests: 15 per hour per user */
export const hintLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 15,
  message: 'Hint request limit reached. Please try again later.',
});

/** AI endpoints: 50/hour for free, checked at controller level for paid */
export const aiLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 50,
  message: 'AI evaluation limit reached. Upgrade to Pro for higher limits.',
});

/** General API: 100 requests per minute */
export const generalLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 100,
  message: 'Too many requests. Please slow down.',
});
