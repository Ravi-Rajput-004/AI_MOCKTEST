import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios.js';

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const { data } = await api.get('/admin/stats');
      return data.data;
    },
    staleTime: 30 * 1000,
  });
}

export function useAdminUsers(page = 1, search = '') {
  return useQuery({
    queryKey: ['admin', 'users', page, search],
    queryFn: async () => {
      const { data } = await api.get(`/admin/users?page=${page}&search=${search}`);
      return data.data;
    },
    staleTime: 30 * 1000,
  });
}

export function useAdminGrowth() {
  return useQuery({
    queryKey: ['admin', 'growth'],
    queryFn: async () => {
      const { data } = await api.get('/admin/growth');
      return data.data;
    },
    staleTime: 60 * 1000,
  });
}

export function useAdminRevenue() {
  return useQuery({
    queryKey: ['admin', 'revenue'],
    queryFn: async () => {
      const { data } = await api.get('/admin/revenue');
      return data.data;
    },
    staleTime: 60 * 1000,
  });
}
