import { Queue } from 'bullmq';
import { env } from './env.js';
import { logger } from './logger.js';

let generationQueue = null;
let evaluationQueue = null;
let redisConnection = null;

function getRedisConnection() {
  if (redisConnection) return redisConnection;
  if (!env.REDIS_URL) return null;

  try {
    const url = new URL(env.REDIS_URL);
    redisConnection = {
      host: url.hostname,
      port: parseInt(url.port) || 6379,
      password: url.password || undefined,
      username: url.username || undefined,
      tls: url.protocol === 'rediss:' ? {} : undefined,
      maxRetriesPerRequest: null,
    };
    return redisConnection;
  } catch {
    logger.warn('Invalid REDIS_URL for BullMQ');
    return null;
  }
}

function initQueues() {
  const connection = getRedisConnection();
  if (!connection) {
    logger.warn('BullMQ queues disabled — no Redis connection');
    return { generationQueue: null, evaluationQueue: null };
  }

  const defaultOpts = {
    connection,
    defaultJobOptions: {
      removeOnComplete: { count: 200 },
      removeOnFail: { count: 100 },
    },
  };

  generationQueue = new Queue('ai-generation', {
    ...defaultOpts,
    defaultJobOptions: {
      ...defaultOpts.defaultJobOptions,
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      priority: 1,
    },
  });

  evaluationQueue = new Queue('ai-evaluation', {
    ...defaultOpts,
    defaultJobOptions: {
      ...defaultOpts.defaultJobOptions,
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      priority: 2,
    },
  });

  logger.info('✅ BullMQ queues initialized (ai-generation, ai-evaluation)');
  return { generationQueue, evaluationQueue };
}

function getGenerationQueue() {
  return generationQueue;
}

function getEvaluationQueue() {
  return evaluationQueue;
}

export { initQueues, getGenerationQueue, getEvaluationQueue, getRedisConnection };
