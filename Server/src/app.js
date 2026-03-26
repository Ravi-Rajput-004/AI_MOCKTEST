/**
 * Express application setup.
 * Configures middleware, routes, and error handling.
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { httpLogger } from './config/logger.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import { generalLimiter } from './middleware/rateLimit.middleware.js';

// Route imports
import authRoutes from './modules/auth/auth.routes.js';
import interviewRoutes from './modules/interview/interview.routes.js';
import userRoutes from './modules/user/user.routes.js';
import paymentRoutes from './modules/payment/payment.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';

const app = express();

// ──────────────────────────────────────────────────
// GLOBAL MIDDLEWARE
// ──────────────────────────────────────────────────

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS
app.use(cors({
  origin: [
    env.FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parsing
app.use(cookieParser());

// HTTP request logging
app.use(httpLogger);

// General rate limiting
app.use('/api/', generalLimiter);

// ──────────────────────────────────────────────────
// ROUTES
// ──────────────────────────────────────────────────

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({
    success: true,
    message: 'AI Mock Interviewer API is running',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/interview', interviewRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/payment', paymentRoutes);
app.use('/api/v1/admin', adminRoutes);

// ──────────────────────────────────────────────────
// ERROR HANDLING
// ──────────────────────────────────────────────────

// 404 handler — catches unmatched routes
app.use(notFoundHandler);

// Global error handler — must be last
app.use(errorHandler);

export default app;
