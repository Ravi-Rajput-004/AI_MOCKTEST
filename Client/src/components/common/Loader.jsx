import { motion as Motion } from 'framer-motion';

export default function Loader({ text = 'Loading...', fullScreen = false }) {
  const content = (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <Motion.div
            key={i}
            className="w-3 h-3 rounded-full bg-primary"
            animate={{ y: [-8, 8, -8], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
          />
        ))}
      </div>
      <p className="text-sm text-text-muted">{text}</p>
    </div>
  );

  if (fullScreen) {
    return <div className="fixed inset-0 bg-bg-base flex items-center justify-center z-50">{content}</div>;
  }
  return <div className="flex items-center justify-center py-20">{content}</div>;
}
