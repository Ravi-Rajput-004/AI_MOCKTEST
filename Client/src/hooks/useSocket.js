import { useEffect, useRef, useCallback } from 'react';
import { getSocket, disconnectSocket } from '../lib/socket.js';
import { useUserStore } from '../store/userStore.js';

export function useSocket() {
  const socketRef = useRef(null);
  const { isAuthenticated } = useUserStore();

  useEffect(() => {
    if (isAuthenticated) {
      socketRef.current = getSocket();
    }
    return () => {
    };
  }, [isAuthenticated]);

  const emit = useCallback((event, data) => {
    socketRef.current?.emit(event, data);
  }, []);

  const on = useCallback((event, callback) => {
    socketRef.current?.on(event, callback);
    return () => socketRef.current?.off(event, callback);
  }, []);

  const off = useCallback((event, callback) => {
    socketRef.current?.off(event, callback);
  }, []);

  return {
    get socket() { return socketRef.current; },
    emit,
    on,
    off,
    disconnect: disconnectSocket,
  };
}
