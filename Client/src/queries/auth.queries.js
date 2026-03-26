/**
 * Auth React Query hooks.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios.js';
import { useUserStore } from '../store/userStore.js';
import { queryKeys } from './queryKeys.js';

/** Fetch current authenticated user */
export function useMe() {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: async () => {
      const { data } = await api.get('/auth/me');
      return data.data.user;
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 min
  });
}

/** Register mutation */
export function useRegister() {
  const { setUser } = useUserStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, email, password }) => {
      const { data } = await api.post('/auth/register', { name, email, password });
      return data.data;
    },
    onSuccess: (data) => {
      setUser(data.user, data.accessToken);
      queryClient.setQueryData(queryKeys.auth.me, data.user);
    },
  });
}

/** Login mutation */
export function useLogin() {
  const { setUser } = useUserStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, password }) => {
      const { data } = await api.post('/auth/login', { email, password });
      return data.data;
    },
    onSuccess: (data) => {
      setUser(data.user, data.accessToken);
      queryClient.setQueryData(queryKeys.auth.me, data.user);
    },
  });
}

/** Logout mutation */
export function useLogout() {
  const { clearUser } = useUserStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout');
    },
    onSettled: () => {
      clearUser();
      queryClient.clear();
    },
  });
}
