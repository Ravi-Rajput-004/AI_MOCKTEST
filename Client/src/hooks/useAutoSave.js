import { useEffect, useRef } from 'react';
import { useSocket } from './useSocket.js';

export function useAutoSave(sessionId, enabled = true) {
  const { emit } = useSocket();
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!enabled || !sessionId) return;

    intervalRef.current = setInterval(() => {
      emit('interview:heartbeat', {
        sessionId,
        timestamp: new Date().toISOString(),
      });
    }, 30000);

    return () => clearInterval(intervalRef.current);
  }, [sessionId, enabled, emit]);
}
