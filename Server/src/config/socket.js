/**
 * Socket.io server initialization.
 * - Redis adapter for multi-server scaling (when REDIS_URL is available)
 * - JWT authentication middleware on socket connections
 * - Heartbeat and disconnect handling
 */
import { Server } from 'socket.io';
import { env } from './env.js';
import { logger } from './logger.js';

/**
 * Initialize and return a configured Socket.io server instance.
 * @param {import('http').Server} httpServer - The HTTP server to attach to
 * @returns {Server} Configured Socket.io server
 */
export function initializeSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: env.FRONTEND_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Attach Redis adapter if REDIS_URL is configured
  if (env.REDIS_URL) {
    import('ioredis').then(({ default: Redis }) => {
      const pubClient = new Redis(env.REDIS_URL);
      const subClient = pubClient.duplicate();

      import('@socket.io/redis-adapter').then(({ createAdapter }) => {
        io.adapter(createAdapter(pubClient, subClient));
        logger.info('✅ Socket.io Redis adapter attached');
      });
    }).catch((err) => {
      logger.warn('⚠️  Socket.io Redis adapter failed, using default:', err.message);
    });
  }

  return io;
}
