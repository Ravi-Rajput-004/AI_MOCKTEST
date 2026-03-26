/**
 * Framer Motion animation variants.
 * Centralized for consistency across all components.
 */

/** Page enter/exit transitions */
export const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

/** Fade in/out */
export const fadeVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

/** Scale in (for cards) */
export const cardVariants = {
  initial: { opacity: 0, scale: 0.95, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95 },
  hover: { scale: 1.02, y: -2 },
  tap: { scale: 0.98 },
};

/** Staggered children (for lists of cards) */
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

/** Slide up from below */
export const slideUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 40 },
};

/** Slide from right */
export const slideRight = {
  initial: { opacity: 0, x: 60 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -60 },
};

/** Scale bounce (for score reveals) */
export const scaleBounce = {
  initial: { opacity: 0, scale: 0.3 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20,
    },
  },
};

/** Accordion/expand */
export const expandVariants = {
  collapsed: { height: 0, opacity: 0 },
  expanded: {
    height: 'auto',
    opacity: 1,
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
};

/** Toast notification slide */
export const toastVariants = {
  initial: { opacity: 0, x: 100, y: 0 },
  animate: { opacity: 1, x: 0, y: 0 },
  exit: { opacity: 0, x: 100 },
};

/** Round transition overlay */
export const roundTransitionVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    scale: 1.1,
    transition: { duration: 0.3 },
  },
};

/** Pulse animation for AI thinking */
export const pulseVariants = {
  animate: {
    scale: [1, 1.2, 1],
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

/** Hero text reveal */
export const heroTextVariants = {
  initial: { opacity: 0, y: 30 },
  animate: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

/** Float animation for decorative elements */
export const floatVariants = {
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};
