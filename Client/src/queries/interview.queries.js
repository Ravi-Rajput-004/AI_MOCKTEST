/**
 * Interview React Query hooks.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios.js';
import { queryKeys } from './queryKeys.js';

/** Create a new interview session */
export function useCreateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const { data: response } = await api.post('/interview/session', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interview', 'history'] });
    },
  });
}

/** Get full session state */
export function useSession(sessionId) {
  return useQuery({
    queryKey: queryKeys.interview.session(sessionId),
    queryFn: async () => {
      const { data } = await api.get(`/interview/session/${sessionId}`);
      return data.data;
    },
    enabled: !!sessionId,
    staleTime: 60 * 1000, // 1 min
  });
}

/** Start a round */
export function useStartRound() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ sessionId, roundNumber }) => {
      const { data } = await api.post('/interview/round/start', { sessionId, roundNumber });
      return data.data;
    },
    onSuccess: (_, { sessionId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.interview.session(sessionId) });
    },
  });
}

/** Submit an answer (via REST — socket also available) */
export function useSubmitAnswer() {
  return useMutation({
    mutationFn: async (data) => {
      const { data: response } = await api.post('/interview/answer', data);
      return response.data;
    },
  });
}

/** Get a hint */
export function useGetHint() {
  return useMutation({
    mutationFn: async ({ questionId, sessionId }) => {
      const { data } = await api.get(`/interview/hint/${questionId}?sessionId=${sessionId}`);
      return data.data;
    },
  });
}

/** Skip a question */
export function useSkipQuestion() {
  return useMutation({
    mutationFn: async ({ sessionId, questionId }) => {
      const { data } = await api.post('/interview/skip', { sessionId, questionId });
      return data.data;
    },
  });
}

/** Complete a round */
export function useCompleteRound() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ sessionId, roundId }) => {
      const { data } = await api.post('/interview/round/complete', { sessionId, roundId });
      return data.data;
    },
    onSuccess: (_, { sessionId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.interview.session(sessionId) });
    },
  });
}

/** Complete the entire session */
export function useCompleteSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ sessionId }) => {
      const { data } = await api.post('/interview/complete', { sessionId });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interview'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

/** Get results for a session */
export function useResults(sessionId) {
  return useQuery({
    queryKey: queryKeys.interview.results(sessionId),
    queryFn: async () => {
      const { data } = await api.get(`/interview/results/${sessionId}`);
      return data.data;
    },
    enabled: !!sessionId,
    staleTime: 5 * 60 * 1000,
  });
}

/** Get session history */
export function useHistory(filters = {}) {
  return useQuery({
    queryKey: queryKeys.interview.history(filters),
    queryFn: async () => {
      const params = new URLSearchParams(filters).toString();
      const { data } = await api.get(`/interview/history?${params}`);
      return data.data;
    },
    staleTime: 60 * 1000,
  });
}

/** Update session status (pause/abandon) */
export function useUpdateSession() {
  return useMutation({
    mutationFn: async ({ sessionId, status }) => {
      const { data } = await api.patch(`/interview/session/${sessionId}`, { status });
      return data.data;
    },
  });
}
