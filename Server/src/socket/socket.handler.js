import { socketAuthMiddleware } from './auth.socket.js';
import { setupInterviewHandlers } from './interview.socket.js';
import { logger } from '../config/logger.js';

export function setupSocketHandlers(io) {
  io.use(socketAuthMiddleware);

  io.on('connection', (socket) => {
    logger.info(`User connected: ${socket.userId}`);

    setupInterviewHandlers(io, socket);

    socket.on('disconnect', (reason) => {
      logger.info(`User disconnected: ${socket.userId}, reason: ${reason}`);
    });

    socket.on('error', (error) => {
      logger.error(`Socket error for user ${socket.userId}: ${error.message}`);
    });
  });
}
