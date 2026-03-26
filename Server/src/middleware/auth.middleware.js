/**
 * JWT Authentication middleware.
 * Verifies access token from Authorization header.
 * Attaches decoded user to req.user on success.
 */
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { prisma } from '../config/database.js';

/**
 * Require authentication — verifies JWT access token.
 * Extracts token from: Authorization: Bearer <token>
 */
export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Access token is required');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw ApiError.unauthorized('Access token is required');
    }

    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);

    // Fetch user from DB to get latest data (plan, admin status, etc.)
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        level: true,
        role: true,
        plan: true,
        planExpiry: true,
        isAdmin: true,
      },
    });

    if (!user) {
      throw ApiError.unauthorized('User not found');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(ApiError.unauthorized('Access token expired'));
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return next(ApiError.unauthorized('Invalid access token'));
    }
    next(error);
  }
};

/**
 * Optional auth — attaches user if token present, but doesn't fail if absent.
 * Useful for endpoints that work differently for authenticated vs anonymous users.
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    if (!token) return next();

    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, plan: true, isAdmin: true },
    });

    if (user) req.user = user;
    next();
  } catch {
    // Silently continue without auth
    next();
  }
};

/**
 * Require admin role.
 * Must be used AFTER requireAuth middleware.
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user?.isAdmin) {
    return next(ApiError.forbidden('Admin access required'));
  }
  next();
};

/**
 * Check if the user has an active paid plan (or is admin for bypass).
 * Must be used AFTER requireAuth middleware.
 * @param {string[]} allowedPlans - Plans that have access (e.g., ['PRO', 'PREMIUM'])
 */
export const requirePlan = (allowedPlans = ['PRO', 'PREMIUM', 'TEAM']) => {
  return (req, res, next) => {
    // Admin bypass — admins get all features for free
    if (req.user?.isAdmin) {
      return next();
    }

    const userPlan = req.user?.plan;
    if (!allowedPlans.includes(userPlan)) {
      return next(ApiError.forbidden(`This feature requires one of: ${allowedPlans.join(', ')}`));
    }

    // Check plan expiry
    if (req.user.planExpiry && new Date(req.user.planExpiry) < new Date()) {
      return next(ApiError.forbidden('Your plan has expired. Please renew.'));
    }

    next();
  };
};
