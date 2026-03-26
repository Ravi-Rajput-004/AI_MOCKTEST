/**
 * React Query cache keys — centralized for consistency.
 */
export const queryKeys = {
  auth: {
    me: ['auth', 'me'],
  },
  user: {
    profile: ['user', 'profile'],
    analytics: ['user', 'analytics'],
    dashboard: ['user', 'dashboard'],
  },
  interview: {
    session: (id) => ['interview', 'session', id],
    history: (filters) => ['interview', 'history', filters],
    results: (id) => ['interview', 'results', id],
  },
  payment: {
    subscription: ['payment', 'subscription'],
  },
};
