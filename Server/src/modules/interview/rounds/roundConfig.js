/**
 * Interview round configuration.
 * Defines which rounds to run based on SDE level, role, and company type.
 * Also defines durations, score weights, and question counts per round.
 */

// ──────────────────────────────────────────────────
// ROUND SEQUENCES
// ──────────────────────────────────────────────────

export const ROUND_SEQUENCES = {
  SDE_1: {
    DEFAULT: ['APTITUDE', 'DSA_BASIC', 'TECH_FUNDAMENTALS', 'HR'],
    FAANG: ['APTITUDE', 'DSA_BASIC', 'DSA_BASIC', 'TECH_FUNDAMENTALS', 'HR'],
    STARTUP: ['DSA_BASIC', 'TECH_FUNDAMENTALS', 'HR'],
  },
  SDE_2: {
    DEFAULT: ['DSA_MEDIUM', 'LLD', 'TECH_DEEP_DIVE', 'BEHAVIOURAL'],
    FAANG: ['DSA_MEDIUM', 'DSA_MEDIUM', 'LLD', 'BEHAVIOURAL'],
    FINTECH: ['DSA_MEDIUM', 'LLD', 'TECH_DEEP_DIVE', 'BEHAVIOURAL'],
  },
  SDE_3: {
    DEFAULT: ['DSA_HARD', 'HLD', 'LLD', 'BEHAVIOURAL', 'HIRING_MANAGER'],
  },
  SDE_4: {
    DEFAULT: ['HLD', 'HLD', 'LLD', 'BEHAVIOURAL', 'HIRING_MANAGER'],
  },
};

// ──────────────────────────────────────────────────
// ROUND DURATIONS (in seconds)
// ──────────────────────────────────────────────────

export const ROUND_DURATIONS = {
  APTITUDE: 900,       // 15 min
  DSA_BASIC: 1500,     // 25 min
  DSA_MEDIUM: 2100,    // 35 min
  DSA_HARD: 2400,      // 40 min
  HR: 900,             // 15 min
  LLD: 1800,           // 30 min
  HLD: 2400,           // 40 min
  BEHAVIOURAL: 1200,   // 20 min
  TECH_FUNDAMENTALS: 1200, // 20 min
  TECH_DEEP_DIVE: 1500,   // 25 min
  HIRING_MANAGER: 1200,   // 20 min
};

// ──────────────────────────────────────────────────
// SCORE WEIGHTS per level
// ──────────────────────────────────────────────────

export const SCORE_WEIGHTS = {
  SDE_1: {
    APTITUDE: 0.15,
    DSA_BASIC: 0.40,
    TECH_FUNDAMENTALS: 0.30,
    HR: 0.15,
  },
  SDE_2: {
    DSA_MEDIUM: 0.35,
    LLD: 0.30,
    TECH_DEEP_DIVE: 0.20,
    BEHAVIOURAL: 0.15,
  },
  SDE_3: {
    DSA_HARD: 0.20,
    HLD: 0.35,
    LLD: 0.25,
    BEHAVIOURAL: 0.10,
    HIRING_MANAGER: 0.10,
  },
  SDE_4: {
    HLD: 0.40,
    LLD: 0.25,
    BEHAVIOURAL: 0.15,
    HIRING_MANAGER: 0.20,
  },
};

// ──────────────────────────────────────────────────
// QUESTIONS PER ROUND
// ──────────────────────────────────────────────────

export const QUESTIONS_PER_ROUND = {
  APTITUDE: 10,
  DSA_BASIC: 3,
  DSA_MEDIUM: 3,
  DSA_HARD: 2,
  HR: 5,
  LLD: 2,
  HLD: 2,
  BEHAVIOURAL: 5,
  TECH_FUNDAMENTALS: 6,
  TECH_DEEP_DIVE: 5,
  HIRING_MANAGER: 4,
};

// ──────────────────────────────────────────────────
// QUESTION TYPE per round
// ──────────────────────────────────────────────────

export const QUESTION_TYPE_MAP = {
  APTITUDE: 'MCQ',
  DSA_BASIC: 'CODING',
  DSA_MEDIUM: 'CODING',
  DSA_HARD: 'CODING',
  HR: 'VOICE',
  LLD: 'DESIGN',
  HLD: 'TEXT',
  BEHAVIOURAL: 'VOICE',
  TECH_FUNDAMENTALS: 'TEXT',
  TECH_DEEP_DIVE: 'TEXT',
  HIRING_MANAGER: 'VOICE',
};

// ──────────────────────────────────────────────────
// HINTS CONFIG
// ──────────────────────────────────────────────────

export const HINTS_CONFIG = {
  FREE: 2,
  PRO: 4,
  PREMIUM: 8,
  TEAM: 8,
  ADMIN: Infinity,
};

// ──────────────────────────────────────────────────
// ADAPTIVE DIFFICULTY
// ──────────────────────────────────────────────────

export const ADAPTIVE_THRESHOLDS = {
  upgradeThreshold: 75,
  downgradeThreshold: 35,
  minQuestionsForAdaptation: 1,
};

export const DIFFICULTY_PROGRESSION = {
  Easy: { up: 'Medium', down: 'Easy' },
  Medium: { up: 'Hard', down: 'Easy' },
  Hard: { up: 'Hard', down: 'Medium' },
};

export const ROUND_DIFFICULTY_RANGE = {
  APTITUDE: ['Easy', 'Medium'],
  DSA_BASIC: ['Easy', 'Medium'],
  DSA_MEDIUM: ['Medium', 'Hard'],
  DSA_HARD: ['Hard'],
  HR: ['Medium'],
  LLD: ['Medium', 'Hard'],
  HLD: ['Hard'],
  BEHAVIOURAL: ['Medium'],
  TECH_FUNDAMENTALS: ['Easy', 'Medium', 'Hard'],
  TECH_DEEP_DIVE: ['Medium', 'Hard'],
  HIRING_MANAGER: ['Medium'],
};

// ──────────────────────────────────────────────────
// DSA TOPICS by difficulty
// ──────────────────────────────────────────────────

export const DSA_TOPICS = {
  EASY: ['Arrays', 'Strings', 'Hash Maps', 'Two Pointers', 'Stack', 'Queue', 'Linked List', 'Sorting', 'Binary Search'],
  MEDIUM: ['Trees', 'Graphs', 'Dynamic Programming', 'Backtracking', 'Sliding Window', 'Heap', 'Trie', 'BFS/DFS', 'Greedy'],
  HARD: ['Advanced DP', 'Segment Trees', 'Graph Advanced', 'String Algorithms', 'Network Flow', 'Geometry', 'Bit Manipulation Advanced'],
};

/**
 * Get the round sequence for a given level and company type.
 * @param {string} level - SDE level (SDE_1, SDE_2, etc.)
 * @param {string} companyType - FAANG, STARTUP, etc.
 * @returns {string[]} Array of round types
 */
export function getRoundSequence(level, companyType) {
  const levelConfig = ROUND_SEQUENCES[level];
  if (!levelConfig) {
    return ROUND_SEQUENCES.SDE_1.DEFAULT;
  }
  return levelConfig[companyType] || levelConfig.DEFAULT;
}

/**
 * Get the weight for a specific round type and level.
 * Falls back to equal weighting if not explicitly configured.
 * @param {string} level
 * @param {string} roundType
 * @param {number} totalRounds
 * @returns {number} Weight between 0 and 1
 */
export function getRoundWeight(level, roundType, totalRounds) {
  const weights = SCORE_WEIGHTS[level];
  if (weights && weights[roundType] !== undefined) {
    return weights[roundType];
  }
  // Equal weight fallback
  return 1 / totalRounds;
}
