import { motion as Motion } from 'framer-motion';

export default function AITypingIndicator({ message = 'AI is evaluating your answer...' }) {
  return (
    <Motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 p-4 bg-bg-card rounded-xl border border-border/30">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <Motion.div key={i} className="w-2 h-2 rounded-full bg-primary" animate={{ y: [-3, 3, -3], opacity: [0.4, 1, 0.4] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }} />
        ))}
      </div>
      <span className="text-sm text-text-secondary">{message}</span>
    </Motion.div>
  );
}
