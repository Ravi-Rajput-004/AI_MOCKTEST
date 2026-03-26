/**
 * useTimer — countdown timer hook with pause/resume.
 */
import { useEffect, useRef, useCallback } from 'react';
import { useInterviewStore } from '../store/interviewStore.js';

export function useTimer() {
  const timeRemaining = useInterviewStore(state => state.timeRemaining);
  const timerRunning = useInterviewStore(state => state.timerRunning);
  const tick = useInterviewStore(state => state.tick);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (timerRunning) {
      intervalRef.current = setInterval(() => {
        const { timeRemaining: t, setTimerRunning } = useInterviewStore.getState();
        if (t > 0) {
          tick();
        } else {
          setTimerRunning(false);
        }
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [timerRunning, tick]);

  const percentage = useCallback(
    (total) => (total > 0 ? (timeRemaining / total) * 100 : 0),
    [timeRemaining]
  );

  return { timeRemaining, timerRunning, percentage };
}

