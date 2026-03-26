import React from 'react';
import { motion as Motion } from 'framer-motion';
import { formatTime } from '../../lib/utils.js';

const TimerBar = React.memo(function TimerBar({ timeRemaining, totalTime }) {
  const pct = totalTime > 0 ? (timeRemaining / totalTime) * 100 : 0;
  const color = pct > 50 ? 'var(--color-success)' : pct > 20 ? 'var(--color-warning)' : 'var(--color-danger)';

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-text-muted">Time Remaining</span>
        <span className="text-sm font-mono font-bold" style={{ color }}>{formatTime(timeRemaining)}</span>
      </div>
      <div className="h-2 bg-bg-elevated rounded-full overflow-hidden">
        <Motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'linear' }}
        />
      </div>
    </div>
  );
});

export default TimerBar;
