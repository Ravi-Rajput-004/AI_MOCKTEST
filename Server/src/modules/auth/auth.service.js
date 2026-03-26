/**
 * Auth service — business logic for authentication.
 * Handles JWT generation, password hashing, token refresh, and user lookup.
 */
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { prisma } from '../../config/database.js';
import { env } from '../../config/env.js';
import { cacheSet, cacheGet, cacheDel } from '../../config/redis.js';
import { ApiError } from '../../utils/ApiError.js';

const BCRYPT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

/**
 * Hash a plaintext password.
 * @param {string} password
 * @returns {Promise<string>}
 */
export async function hashPassword(password) {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

/**
 * Compare a plaintext password against a hash.
 * @param {string} password
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Generate an access token (short-lived, 15min).
 * @param {{ userId: string, email: string }} payload
 * @returns {string}
 */
export function generateAccessToken(payload) {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

/**
 * Generate a refresh token (long-lived, 7 days) and store in Redis.
 * @param {{ userId: string }} payload
 * @returns {Promise<string>}
 */
export async function generateRefreshToken(payload) {
  const token = jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
  // Store in Redis for revocation capability (TTL 7 days)
  await cacheSet(`refresh:${payload.userId}`, token, 7 * 24 * 60 * 60);
  return token;
}

/**
 * Verify and decode a refresh token.
 * Also checks if the token is still valid in Redis (not revoked).
 * @param {string} token
 * @returns {Promise<{ userId: string }>}
 */
export async function verifyRefreshToken(token) {
  try {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);
    
    // Check if it's the current refresh token
    const currentToken = await cacheGet(`refresh:${decoded.userId}`);
    if (currentToken === token) return decoded;

    // Check if it's a recently rotated token (grace period)
    const prevToken = await cacheGet(`refresh:${decoded.userId}:prev`);
    if (prevToken === token) {
      return decoded;
    }

    throw ApiError.unauthorized('Refresh token has been revoked');
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw ApiError.unauthorized('Invalid refresh token');
  }
}

/**
 * Verify a socket.io JWT token (access token).
 * @param {string} token
 * @returns {Promise<{ id: string, email: string, name: string }>}
 */
export async function verifySocketToken(token) {
  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, plan: true, isAdmin: true },
    });
    if (!user) throw new Error('User not found');
    return user;
  } catch {
    throw new Error('Invalid token');
  }
}

/**
 * Register a new user.
 * @param {{ name: string, email: string, password: string }} data
 * @returns {Promise<{ user: object, accessToken: string, refreshToken: string }>}
 */
export async function registerUser({ name, email, password }) {
  // Check if user already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw ApiError.conflict('An account with this email already exists');
  }

  const passwordHash = await hashPassword(password);

  // Check if the email is in the admin list
  const adminEmails = env.ADMIN_EMAILS.split(',').map((e) => e.trim().toLowerCase());
  const isAdmin = adminEmails.includes(email.toLowerCase());

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      isAdmin,
      // Admin users get PREMIUM plan automatically
      plan: isAdmin ? 'PREMIUM' : 'FREE',
      profile: { create: {} },
    },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      level: true,
      role: true,
      plan: true,
      isAdmin: true,
      createdAt: true,
    },
  });

  const accessToken = generateAccessToken({ userId: user.id, email: user.email });
  const refreshToken = await generateRefreshToken({ userId: user.id });

  return { user, accessToken, refreshToken };
}

/**
 * Login an existing user.
 * @param {{ email: string, password: string }} data
 * @returns {Promise<{ user: object, accessToken: string, refreshToken: string }>}
 */
export async function loginUser({ email, password }) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      passwordHash: true,
      level: true,
      role: true,
      plan: true,
      planExpiry: true,
      isAdmin: true,
      provider: true,
    },
  });

  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  // Can't login with password if registered via Google
  if (user.provider !== 'email' && !user.passwordHash) {
    throw ApiError.badRequest(`This account uses ${user.provider} login. Please use that method.`);
  }

  const isValid = await comparePassword(password, user.passwordHash);
  if (!isValid) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  // Remove passwordHash from response
  const { passwordHash: _, ...userWithoutPassword } = user;

  const accessToken = generateAccessToken({ userId: user.id, email: user.email });
  const refreshToken = await generateRefreshToken({ userId: user.id });

  return { user: userWithoutPassword, accessToken, refreshToken };
}

/**
 * Refresh access token using a valid refresh token.
 * @param {string} refreshToken
 * @returns {Promise<{ accessToken: string, refreshToken: string }>}
 */
export async function refreshTokens(refreshToken) {
  const decoded = await verifyRefreshToken(refreshToken);

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: { id: true, email: true },
  });

  if (!user) {
    throw ApiError.unauthorized('User not found');
  }

  // Gracefully transition: store the current token as 'previous' before generating new one
  const currentToken = await cacheGet(`refresh:${user.id}`);
  if (currentToken) {
    await cacheSet(`refresh:${user.id}:prev`, currentToken, 30); // 30s grace period
  }

  const newAccessToken = generateAccessToken({ userId: user.id, email: user.email });
  const newRefreshToken = await generateRefreshToken({ userId: user.id });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

/**
 * Logout — revoke the refresh token.
 * @param {string} userId
 */
export async function logoutUser(userId) {
  await cacheDel(`refresh:${userId}`);
}
