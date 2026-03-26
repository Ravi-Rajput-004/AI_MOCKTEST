/**
 * Socket.io client singleton.
 * Connects to backend Socket.io server with JWT authentication.
 */
import { io } from 'socket.io-client';
import { getAccessToken } from './axios.js';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8000';

let socket = null;

/**
 * Get or create the socket connection.
 * Automatically sends the JWT access token for auth.
 * @returns {import('socket.io-client').Socket}
 */
export function getSocket() {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    auth: { token: getAccessToken() },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 10000,
  });

  socket.on('connect', () => {
    console.log('🔌 Socket connected:', socket.id);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  return socket;
}

/**
 * Disconnect and clean up the socket.
 */
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

/**
 * Reconnect with a fresh token (call after token refresh).
 */
export function reconnectSocket() {
  disconnectSocket();
  return getSocket();
}

export { socket };
