/**
 * User React Query hooks.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios.js';
import { queryKeys } from './queryKeys.js';
import { useUserStore } from '../store/userStore.js';

/** Get user profile */
export function useProfile() {
  return useQuery({
    queryKey: queryKeys.user.profile,
    queryFn: async () => {
      const { data } = await api.get('/user/profile');
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/** Update user profile */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { updateUser } = useUserStore();

  return useMutation({
    mutationFn: async (updates) => {
      const { data } = await api.patch('/user/profile', updates);
      return data.data;
    },
    onSuccess: (user) => {
      updateUser(user);
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile });
    },
  });
}

/** Get analytics */
export function useAnalytics() {
  return useQuery({
    queryKey: queryKeys.user.analytics,
    queryFn: async () => {
      const { data } = await api.get('/user/analytics');
      return data.data;
    },
    staleTime: 2 * 60 * 1000,
  });
}

/** Get dashboard data */
export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.user.dashboard,
    queryFn: async () => {
      const { data } = await api.get('/user/dashboard');
      return data.data;
    },
    staleTime: 60 * 1000,
  });
}
