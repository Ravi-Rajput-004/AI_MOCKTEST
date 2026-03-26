import { motion as Motion } from 'framer-motion';
import { SDE_LEVELS } from '../../lib/constants.jsx';
import { cardVariants } from '../../animations/variants.js';

export default function LevelSelector({ selected, onSelect }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {SDE_LEVELS.map((level) => (
        <Motion.button
          key={level.value}
          variants={cardVariants}
          initial="initial"
          animate="animate"
          whileHover="hover"
          whileTap="tap"
          onClick={() => onSelect(level.value)}
          className={`p-6 rounded-xl border-2 text-left transition-all ${selected === level.value ? 'border-primary bg-primary/10 shadow-glow' : 'border-border bg-bg-card hover:border-border-light'}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold" style={{ backgroundColor: `${level.color}20`, color: level.color }}>{level.label.split('-')[1]}</div>
            <div>
              <h3 className="font-semibold text-lg">{level.label}</h3>
              <p className="text-xs text-text-muted">{level.description}</p>
            </div>
          </div>
        </Motion.button>
      ))}
    </div>
  );
}
