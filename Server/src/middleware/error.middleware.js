/**
 * Global error handling middleware.
 * Catches all errors thrown in the app and sends a standardized JSON response.
 * Differentiates between operational errors (ApiError) and unexpected errors.
 */
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';

/**
 * Global error handler — must be the LAST middleware registered.
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const errorHandler = (err, req, res, next) => {
  // Default to 500 if no status code is set
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let errors = err.errors || [];

  // Prisma known errors
  if (err.code === 'P2002') {
    statusCode = 409;
    message = 'A record with this data already exists';
    errors = [{ field: err.meta?.target?.join(', '), message: 'Must be unique' }];
  }

  if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Record not found';
  }

  // JWT errors (in case they slip through auth middleware)
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Log the error
  if (statusCode >= 500) {
    logger.error(`[${req.method}] ${req.path} — ${message}`, {
      error: err.stack,
      body: req.body,
      userId: req.user?.id,
    });
  } else {
    logger.warn(`[${req.method}] ${req.path} — ${statusCode} ${message}`);
  }

  // Send response
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors: errors.length > 0 ? errors : undefined,
    // Include stack trace only in development
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * 404 handler — catches requests to undefined routes.
 */
export const notFoundHandler = (req, res, next) => {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
};
