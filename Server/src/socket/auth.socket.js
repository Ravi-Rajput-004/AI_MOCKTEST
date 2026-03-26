/**
 * Socket authentication middleware.
 * Verifies JWT from socket handshake auth.
 */
import { verifySocketToken } from '../modules/auth/auth.service.js';
import { logger } from '../config/logger.js';

/**
 * Authenticate socket connections via JWT.
 * Token is expected in: socket.handshake.auth.token
 */
export function socketAuthMiddleware(socket, next) {
  const token = socket.handshake.auth?.token;
  if (!token) {
    logger.warn('Socket connection rejected — no token');
    return next(new Error('Authentication required'));
  }

  verifySocketToken(token)
    .then((user) => {
      socket.userId = user.id;
      socket.user = user;
      next();
    })
    .catch((err) => {
      logger.warn(`Socket auth failed: ${err.message}`);
      next(new Error('Invalid token'));
    });
}
