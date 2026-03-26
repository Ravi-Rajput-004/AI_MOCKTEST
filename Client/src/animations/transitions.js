/**
 * Framer Motion transition presets.
 */

/** Default spring transition */
export const springTransition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
};

/** Smooth easing */
export const smoothTransition = {
  duration: 0.4,
  ease: [0.22, 1, 0.36, 1],
};

/** Fast transition */
export const fastTransition = {
  duration: 0.2,
  ease: 'easeOut',
};

/** Slow transition */
export const slowTransition = {
  duration: 0.6,
  ease: [0.22, 1, 0.36, 1],
};

/** Page transition */
export const pageTransition = {
  duration: 0.35,
  ease: [0.22, 1, 0.36, 1],
};

/** Bounce spring */
export const bounceTransition = {
  type: 'spring',
  stiffness: 400,
  damping: 15,
};
