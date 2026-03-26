import { motion as Motion } from 'framer-motion';
import { DEV_ROLES } from '../../lib/constants.jsx';
import { cardVariants } from '../../animations/variants.js';

export default function RoleSelector({ selected, onSelect }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {DEV_ROLES.map((role) => (
        <Motion.button
          key={role.value}
          variants={cardVariants}
          initial="initial"
          animate="animate"
          whileHover="hover"
          whileTap="tap"
          onClick={() => onSelect(role.value)}
          className={`p-5 rounded-xl border-2 text-center transition-all ${selected === role.value ? 'border-primary bg-primary/10 shadow-glow' : 'border-border bg-bg-card hover:border-border-light'}`}
        >
          <div className="text-3xl mb-2">{role.icon}</div>
          <h3 className="font-semibold text-sm">{role.label}</h3>
          <p className="text-xs text-text-muted mt-1">{role.description}</p>
        </Motion.button>
      ))}
    </div>
  );
}
