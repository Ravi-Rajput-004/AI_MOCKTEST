import { motion as Motion, AnimatePresence } from 'framer-motion';
import { ROUND_LABELS } from '../../lib/constants.jsx';
import { roundTransitionVariants } from '../../animations/variants.js';

export default function RoundTransition({ roundType, roundNumber, totalRounds, show, onComplete }) {
  return (
    <AnimatePresence>
      {show && (
        <Motion.div variants={roundTransitionVariants} initial="initial" animate="animate" exit="exit" onAnimationComplete={() => setTimeout(onComplete, 1500)} className="fixed inset-0 z-50 bg-bg-base/95 backdrop-blur-lg flex items-center justify-center">
          <div className="text-center">
            <Motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.2 }} className="w-20 h-20 rounded-2xl bg-linear-to-br from-primary to-[#A78BFA] flex items-center justify-center text-3xl mx-auto mb-6">
              {roundNumber}
            </Motion.div>
            <Motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-3xl font-bold mb-2">{ROUND_LABELS[roundType] || roundType}</Motion.h2>
            <Motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-text-muted">Round {roundNumber} of {totalRounds}</Motion.p>
          </div>
        </Motion.div>
      )}
    </AnimatePresence>
  );
}
