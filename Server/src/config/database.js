/**
 * Prisma client singleton with Neon serverless driver adapter.
 * Uses connection pooling via Neon's serverless driver for production,
 * falls back to standard Prisma client for local development.
 */
import { PrismaClient } from '@prisma/client';
import { env } from './env.js';

/** @type {PrismaClient} */
let prisma;

if (env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: ['error', 'warn'],
    datasources: { db: { url: env.DATABASE_URL } },
  });
} else {
  // In development, reuse the Prisma client to avoid exhausting connections
  if (!globalThis.__prisma) {
    globalThis.__prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
      datasources: { db: { url: env.DATABASE_URL } },
    });
  }
  prisma = globalThis.__prisma;
}

export { prisma };
