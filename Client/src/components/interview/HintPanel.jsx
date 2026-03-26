import { useState } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { Lightbulb } from 'lucide-react';
import { expandVariants } from '../../animations/variants.js';

export default function HintPanel({ hints = [], hintsUsed = 0, maxHints = 3, onRequestHint, loading }) {
  const [expanded, setExpanded] = useState(false);
  const available = Math.min(maxHints, hints.length) - hintsUsed;

  return (
    <div className="bg-bg-card rounded-xl border border-border overflow-hidden">
      <button
        onClick={() => { if (available > 0 && !loading) { setExpanded(!expanded); if (!expanded && hintsUsed < hints.length) onRequestHint?.(); } }}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-bg-elevated transition-colors"
        disabled={available <= 0}
      >
        <span className="text-sm flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-warning" /> <span className="font-medium">Hints</span>
          <span className="text-xs text-text-muted">({available} remaining)</span>
        </span>
        <Motion.span animate={{ rotate: expanded ? 180 : 0 }} className="text-text-muted">▼</Motion.span>
      </button>

      <AnimatePresence>
        {expanded && (
          <Motion.div variants={expandVariants} initial="collapsed" animate="expanded" exit="collapsed" className="overflow-hidden">
            <div className="px-4 pb-4 space-y-2">
              {hints.slice(0, hintsUsed).map((hint, i) => (
                <div key={i} className="text-sm p-3 rounded-lg bg-bg-elevated border-l-2 border-warning">
                  <span className="text-xs text-warning font-medium">Hint {i + 1}:</span>
                  <p className="mt-1 text-text-secondary">{hint}</p>
                </div>
              ))}
              {loading && <div className="skeleton h-16 w-full" />}
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
