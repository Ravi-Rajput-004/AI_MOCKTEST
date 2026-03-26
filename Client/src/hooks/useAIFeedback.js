import { useEffect } from 'react';
import { useSocket } from './useSocket.js';
import { useInterviewStore } from '../store/interviewStore.js';
import { useQueryClient } from '@tanstack/react-query';

export function useAIFeedback() {
  const { on } = useSocket();
  const setAIThinking = useInterviewStore(state => state.setAIThinking);
  const setEvaluation = useInterviewStore(state => state.setEvaluation);
  const addQuestion = useInterviewStore(state => state.addQuestion);
  const queryClient = useQueryClient();

  useEffect(() => {
    const cleanupThinking = on('interview:ai_thinking', () => {
      setAIThinking(true);
    });

    const cleanupDone = on('interview:evaluation_done', (data) => {
      setEvaluation(data.evaluation);
    });

    const cleanupQuestion = on('interview:question_ready', (data) => {
      queryClient.invalidateQueries({ queryKey: ['session', data.sessionId || ''] });
      if (data.question) {
        addQuestion(data.question);
      }
    });

    const cleanupError = on('interview:error', (data) => {
      setAIThinking(false);
      console.error('Interview error:', data);
    });

    return () => {
      cleanupThinking?.();
      cleanupDone?.();
      cleanupQuestion?.();
      cleanupError?.();
    };
  }, [on, setAIThinking, setEvaluation, addQuestion, queryClient]);
}
