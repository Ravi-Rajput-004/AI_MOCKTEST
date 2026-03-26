/**
 * Zustand store — auth / user state.
 * Stores access token in memory (not localStorage) for security.
 */
import { create } from 'zustand';
import { setAccessToken } from '../lib/axios.js';

export const useUserStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user, token = null) => {
    if (token) setAccessToken(token);
    set({ user, isAuthenticated: true, isLoading: false });
  },

  updateUser: (updates) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    }));
  },

  clearUser: () => {
    setAccessToken(null);
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  setLoading: (isLoading) => set({ isLoading }),

  isAdmin: () => get().user?.isAdmin === true,
}));
