import { create } from 'zustand';

export const useInterviewStore = create((set, get) => ({
  session: null,
  currentRound: null,
  currentQuestion: null,
  currentQuestionIndex: 0,
  questions: [],

  timeRemaining: 0,
  timerRunning: false,

  isAIThinking: false,
  lastEvaluation: null,

  code: '',
  language: 'javascript',

  isRecording: false,
  transcript: '',

  setSession: (session) => set({ session }),

  setRound: (round, questions, duration, hydrateQuestionIndex) => {
    const isHydrate = hydrateQuestionIndex !== undefined;
    set({
      currentRound: round,
      questions,
      currentQuestionIndex: isHydrate ? hydrateQuestionIndex : 0,
      currentQuestion: questions[isHydrate ? hydrateQuestionIndex : 0] || null,
      timeRemaining: duration,
      timerRunning: true,
      lastEvaluation: null,
      code: '',
      transcript: '',
    });
  },

  addQuestion: (question) => {
    const state = get();
    const exists = state.questions.some(q => q.id === question.id);
    if (exists) return;
    const updated = [...state.questions, question].sort((a, b) => a.questionNumber - b.questionNumber);
    const patch = { questions: updated };
    if (!state.currentQuestion) {
      patch.currentQuestion = updated[0];
      patch.currentQuestionIndex = 0;
    }
    set(patch);
  },

  nextQuestion: () => {
    const state = get();
    const nextIdx = state.currentQuestionIndex + 1;
    if (nextIdx < state.questions.length) {
      set({
        currentQuestionIndex: nextIdx,
        currentQuestion: state.questions[nextIdx],
        lastEvaluation: null,
        code: '',
        transcript: '',
      });
    }
  },

  tick: () =>
    set((state) => ({
      timeRemaining: Math.max(0, state.timeRemaining - 1),
    })),

  setTimerRunning: (running) => set({ timerRunning: running }),

  setAIThinking: (thinking) => set({ isAIThinking: thinking }),
  setEvaluation: (evaluation) => set({ lastEvaluation: evaluation, isAIThinking: false }),

  setCode: (code) => set({ code }),
  setLanguage: (language) => set({ language }),

  setTranscript: (transcript) => set({ transcript }),

  setRecording: (isRecording) => set({ isRecording }),

  reset: () =>
    set({
      session: null,
      currentRound: null,
      currentQuestion: null,
      currentQuestionIndex: 0,
      questions: [],
      timeRemaining: 0,
      timerRunning: false,
      isAIThinking: false,
      lastEvaluation: null,
      code: '',
      language: 'javascript',
      isRecording: false,
      transcript: '',
    }),
}));
