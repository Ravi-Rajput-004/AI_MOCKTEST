import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SkipForward, Pause, Play, Send } from 'lucide-react';
import { motion as Motion } from 'framer-motion';
import { useSession, useStartRound, useSubmitAnswer, useGetHint, useSkipQuestion, useCompleteRound, useCompleteSession } from '../queries/interview.queries.js';
import { useInterviewStore } from '../store/interviewStore.js';
import { useUserStore } from '../store/userStore.js';
import { useSocket } from '../hooks/useSocket.js';
import { useAIFeedback } from '../hooks/useAIFeedback.js';
import { useTimer } from '../hooks/useTimer.js';
import { useAutoSave } from '../hooks/useAutoSave.js';
import CodeEditor from '../components/interview/CodeEditor.jsx';
import VoiceRecorder from '../components/interview/VoiceRecorder.jsx';
import QuestionCard from '../components/interview/QuestionCard.jsx';
import HintPanel from '../components/interview/HintPanel.jsx';
import TimerBar from '../components/interview/TimerBar.jsx';
import AITypingIndicator from '../components/interview/AITypingIndicator.jsx';
import RoundTransition from '../components/interview/RoundTransition.jsx';
import LiveFeedbackPanel from '../components/interview/LiveFeedbackPanel.jsx';
import Loader from '../components/common/Loader.jsx';
import { CODE_LANGUAGES, ROUND_DURATIONS } from '../lib/constants.jsx';
import { pageVariants } from '../animations/variants.js';

export default function InterviewRoom() {
  const { id: sessionId } = useParams();
  const navigate = useNavigate();
  const { data: session, isLoading } = useSession(sessionId);
  const startRound = useStartRound();
  const submitAnswer = useSubmitAnswer();
  const getHint = useGetHint();
  const skipQuestion = useSkipQuestion();
  const completeRound = useCompleteRound();
  const completeSession = useCompleteSession();
  const { emit } = useSocket();

  // Select state individually for stability and performance
  const currentRound = useInterviewStore(state => state.currentRound);
  const currentQuestion = useInterviewStore(state => state.currentQuestion);
  const currentQuestionIndex = useInterviewStore(state => state.currentQuestionIndex);
  const questions = useInterviewStore(state => state.questions);
  const timeRemaining = useInterviewStore(state => state.timeRemaining);
  const isAIThinking = useInterviewStore(state => state.isAIThinking);
  const lastEvaluation = useInterviewStore(state => state.lastEvaluation);
  const code = useInterviewStore(state => state.code);
  const language = useInterviewStore(state => state.language);

  const setSession = useInterviewStore(state => state.setSession);
  const setRound = useInterviewStore(state => state.setRound);
  const addQuestion = useInterviewStore(state => state.addQuestion);
  const nextQuestion = useInterviewStore(state => state.nextQuestion);
  const setCode = useInterviewStore(state => state.setCode);
  const setLanguage = useInterviewStore(state => state.setLanguage);
  const setAIThinking = useInterviewStore(state => state.setAIThinking);
  const setEvaluation = useInterviewStore(state => state.setEvaluation);
  const reset = useInterviewStore(state => state.reset);

  useTimer();
  useAIFeedback();
  const [showTransition, setShowTransition] = useState(false);
  const [totalTime, setTotalTime] = useState(0);
  const [hints, setHints] = useState([]);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [textAnswer, setTextAnswer] = useState('');
  const pendingRef = useRef(false);
  const pollRef = useRef(null);

  useAutoSave(sessionId, true);

  useEffect(() => {
    if (sessionId) {
      emit('interview:join_session', { sessionId });
    }
  }, [sessionId, emit]);

  // Auto-save transient state to localStorage to survive navigation
  useEffect(() => {
    if (currentRound && sessionId && timeRemaining !== undefined) {
      localStorage.setItem(`timer_${sessionId}_${currentRound.id}`, timeRemaining.toString());
    }
  }, [timeRemaining, currentRound, sessionId]);

  useEffect(() => {
    if (currentQuestion && sessionId) {
      localStorage.setItem(`code_${sessionId}_${currentQuestion.id}`, code || '');
      localStorage.setItem(`text_${sessionId}_${currentQuestion.id}`, textAnswer || '');
    }
  }, [code, textAnswer, currentQuestion, sessionId]);

  // Separate cleanup - only run on unmount to auto-pause the session remotely
  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  useEffect(() => {
    if (session) {
      setSession(session);
      const activeRound = session.rounds?.find(r => r.status === 'IN_PROGRESS' || r.status === 'NOT_STARTED');
      
      // Only start if not already in progress, not currently pending, and NOT already the current round in our store
      if (activeRound && 
          activeRound.status === 'NOT_STARTED' && 
          !startRound.isPending && 
          currentRound?.roundNumber !== activeRound.roundNumber
      ) {
        queueMicrotask(() => setShowTransition(true));
        startRound.mutate({ sessionId, roundNumber: activeRound.roundNumber }, {
          onSuccess: (data) => {
            setRound(data.round, data.questions, data.duration);
            setTotalTime(data.duration);
            if (data.questions?.[0]?.metadata?.hints) setHints(data.questions[0].metadata.hints);
            if (data.pendingGeneration) {
              pendingRef.current = true;
            }
          },
        });
      } else if (activeRound && currentRound?.roundNumber !== activeRound.roundNumber) {
        // Hydrate from existing progress if round is already IN_PROGRESS but not in our store
        const q = activeRound.questions || [];
        const unansweredIdx = q.findIndex(qu => !qu.answeredAt && !qu.skipped);
        const targetIdx = unansweredIdx >= 0 ? unansweredIdx : Math.max(0, q.length - 1);
        const unanswered = q[targetIdx];
        
        if (unanswered) {
          const defaultDuration = ROUND_DURATIONS[activeRound.type] || 1800;
          const savedTime = localStorage.getItem(`timer_${sessionId}_${activeRound.id}`);
          const duration = savedTime !== null ? parseInt(savedTime, 10) : defaultDuration;
          
          setRound(activeRound, q, duration, targetIdx);
          setTotalTime(defaultDuration);
          
          const savedCode = localStorage.getItem(`code_${sessionId}_${unanswered.id}`);
          if (savedCode) setCode(savedCode);
          
          const savedText = localStorage.getItem(`text_${sessionId}_${unanswered.id}`);
          if (savedText) setTextAnswer(savedText);
          
          // Auto-resume remotely
          emit('interview:resume_session', { sessionId });

          if (unanswered.metadata?.hints) queueMicrotask(() => setHints(unanswered.metadata.hints));
        }
      }
    }
  }, [session, setRound, setSession, startRound, sessionId, currentRound?.roundNumber]);



  const roundType = currentRound?.type || '';

  useEffect(() => {
    if (pendingRef.current && questions.length === 0 && currentRound) {
      pollRef.current = setInterval(async () => {
        try {
          const { data } = await import('../lib/axios.js').then(m => m.default.get(`/interview/session/${sessionId}`));
          const sess = data.data;
          const round = sess.rounds?.find(r => r.id === currentRound.id);
          if (round?.questions?.length > 0) {
            clearInterval(pollRef.current);
            pendingRef.current = false;
            const q = round.questions;
            q.forEach(question => addQuestion(question));
            if (q[0]?.metadata?.hints) setHints(q[0].metadata.hints);
          }
        } catch {}
      }, 2000);
    }
    if (questions.length > 0 && pollRef.current) {
      clearInterval(pollRef.current);
      pendingRef.current = false;
      if (questions[currentQuestionIndex]?.metadata?.hints && hints.length === 0) {
        setHints(questions[currentQuestionIndex].metadata.hints);
      }
    }
    return () => clearInterval(pollRef.current);
  }, [questions.length, currentRound, sessionId]);
  const isCoding = ['DSA_BASIC', 'DSA_MEDIUM', 'DSA_HARD'].includes(roundType);
  const isVoice = ['HR', 'BEHAVIOURAL', 'HIRING_MANAGER'].includes(roundType);

  const handleSubmit = useCallback(() => {
    if (!currentQuestion || !currentRound) return;
    setAIThinking(true);
    const payload = { 
      sessionId, 
      roundId: currentRound.id, 
      questionId: currentQuestion.id, 
      answer: textAnswer, 
      codeAnswer: isCoding ? code : undefined, 
      language: isCoding ? language : undefined 
    };
    submitAnswer.mutate(payload, {
      onSuccess: (data) => {
        if (data.pendingEvaluation) return;
        setEvaluation(data.evaluation);
        setAIThinking(false);
      },
      onError: () => setAIThinking(false),
    });
  }, [currentQuestion, currentRound, code, language, textAnswer, sessionId, isCoding, submitAnswer, setAIThinking, setEvaluation]);

  const handleCompleteRound = useCallback(() => {
    if (!currentRound) return;
    completeRound.mutate({ sessionId, roundId: currentRound.id }, {
      onSuccess: (data) => {
        if (data.isLastRound) {
          completeSession.mutate({ sessionId }, { onSuccess: () => navigate(`/results/${sessionId}`) });
        } else {
          setShowTransition(true);
          startRound.mutate({ sessionId, roundNumber: data.nextRound.roundNumber }, {
            onSuccess: (rd) => {
              setRound(rd.round, rd.questions, rd.duration);
              setTotalTime(rd.duration);
              setHintsUsed(0);
              setTextAnswer('');
              if (rd.pendingGeneration) {
                pendingRef.current = true;
              } else if (rd.questions?.[0]?.metadata?.hints) {
                setHints(rd.questions[0].metadata.hints);
              }
            },
          });
        }
      },
    });
  }, [completeRound, sessionId, currentRound, completeSession, navigate, startRound, setRound]);

  const handleNext = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      nextQuestion();
      setHints(questions[currentQuestionIndex + 1]?.metadata?.hints || []);
      setHintsUsed(0);
      setTextAnswer('');
      setCode('');
      setEvaluation(null);
    } else {
      handleCompleteRound();
    }
  }, [currentQuestionIndex, questions, nextQuestion, setCode, setEvaluation, handleCompleteRound]);

  // Handle auto-completion when timer hits 00:00
  const isCompletingRef = useRef(false);
  useEffect(() => {
    isCompletingRef.current = false;
  }, [currentRound?.id]);

  useEffect(() => {
    if (timeRemaining === 0 && currentRound && !isCompletingRef.current) {
      isCompletingRef.current = true;
      handleCompleteRound();
    }
  }, [timeRemaining, currentRound, handleCompleteRound]);

  const user = useUserStore(state => state.user);
  const HINTS_BY_PLAN = { FREE: 2, PRO: 4, PREMIUM: 8, TEAM: 8 };
  const maxHints = user?.isAdmin ? 999 : (HINTS_BY_PLAN[user?.plan] || 2);

  const handleHint = useCallback(() => {
    if (!currentQuestion) return;
    getHint.mutate({ questionId: currentQuestion.id, sessionId }, {
      onSuccess: (data) => { 
          
        setHints(prev => {
          const newHints = [...prev];
          if (data.hintNumber <= newHints.length) {
            newHints[data.hintNumber - 1] = data.hint;
          } else {
            newHints.push(data.hint);
          }
          return newHints;
        });
        setHintsUsed(data.hintNumber); 
      },
    });
  }, [currentQuestion, sessionId, getHint]);

  const handleSkip = useCallback(() => {
    if (!currentQuestion) return;
    skipQuestion.mutate({ sessionId, questionId: currentQuestion.id }, { onSuccess: handleNext });
  }, [skipQuestion, sessionId, currentQuestion, handleNext]);

  if (isLoading || startRound.isPending) return <Loader fullScreen text={startRound.isPending ? "AI is generating your interview questions..." : "Loading interview..."} />;
  if (questions.length === 0 && currentRound) return <Loader fullScreen text="Generating questions... They will appear shortly." />;

  return (
    <Motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="min-h-screen pt-20 pb-8 px-4">
      <RoundTransition roundType={roundType} roundNumber={currentRound?.roundNumber || 1} totalRounds={session?.totalRounds || 1} show={showTransition} onComplete={() => setShowTransition(false)} />

      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <TimerBar timeRemaining={timeRemaining} totalTime={totalTime} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <QuestionCard question={currentQuestion} questionNumber={currentQuestionIndex + 1} totalQuestions={questions.length} roundType={roundType} />
            <HintPanel hints={hints} hintsUsed={hintsUsed} maxHints={maxHints} onRequestHint={handleHint} loading={getHint.isPending} />
            <div className="flex gap-2">
              <button onClick={handleSkip} disabled={skipQuestion.isPending} className="w-full py-2 text-sm border border-border rounded-lg hover:bg-bg-card transition-colors flex items-center justify-center gap-2"><SkipForward className="w-4 h-4" /> Skip</button>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-4">
            {isCoding && (
              <>
                <div className="flex items-center gap-2 mb-2">
                  {CODE_LANGUAGES.map(lang => (
                    <button key={lang.value} onClick={() => setLanguage(lang.value)} className={`px-3 py-1 text-xs rounded-lg transition-colors ${language === lang.value ? 'bg-primary text-white' : 'bg-bg-card border border-border hover:border-primary/50'}`}>{lang.label}</button>
                  ))}
                </div>
                <CodeEditor value={code} onChange={setCode} language={language} height="350px" />
              </>
            )}

            {isVoice && <VoiceRecorder onTranscriptChange={setTextAnswer} />}

            {!isCoding && !isVoice && (
              <textarea value={textAnswer} onChange={(e) => setTextAnswer(e.target.value)} className="w-full h-64 p-4 bg-bg-card border border-border rounded-xl text-sm resize-none focus:outline-none focus:border-primary transition-colors" placeholder="Type your answer here..." />
            )}

            {isAIThinking && <AITypingIndicator />}
            {lastEvaluation && <LiveFeedbackPanel evaluation={lastEvaluation} />}

            <div className="flex gap-3">
              {!lastEvaluation && (
                <button 
                  onClick={handleSubmit} 
                  disabled={isAIThinking || submitAnswer.isPending || (isCoding ? !code?.trim() : !textAnswer?.trim())} 
                  className="flex-1 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-medium transition-colors disabled:opacity-50 btn-glow flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" /> {isAIThinking ? 'Evaluating...' : 'Submit Answer'}
                </button>
              )}
              {lastEvaluation && (
                <button onClick={handleNext} className="flex-1 py-3 bg-success hover:bg-success-light text-white rounded-xl font-medium transition-colors">
                  {currentQuestionIndex < questions.length - 1 ? 'Next Question →' : 'Finish Round →'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Motion.div>
  );
}
