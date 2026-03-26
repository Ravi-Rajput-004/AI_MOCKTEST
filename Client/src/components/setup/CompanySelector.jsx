import { motion as Motion } from 'framer-motion';
import { COMPANY_TYPES } from '../../lib/constants.jsx';
import { cardVariants } from '../../animations/variants.js';

export default function CompanySelector({ selected, onSelect }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {COMPANY_TYPES.map((co) => (
        <Motion.button
          key={co.value}
          variants={cardVariants}
          initial="initial"
          animate="animate"
          whileHover="hover"
          whileTap="tap"
          onClick={() => onSelect(co.value)}
          className={`p-5 rounded-xl border-2 text-center transition-all ${selected === co.value ? 'border-primary bg-primary/10 shadow-glow' : 'border-border bg-bg-card hover:border-border-light'}`}
        >
          <div className="text-3xl mb-2">{co.icon}</div>
          <h3 className="font-semibold text-sm">{co.label}</h3>
          <p className="text-xs text-text-muted mt-1">{co.description}</p>
        </Motion.button>
      ))}
    </div>
  );
}
