import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useResults } from '../queries/interview.queries.js';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import Loader from '../components/common/Loader.jsx';
import { ROUND_LABELS } from '../lib/constants.jsx';
import { getScoreColor } from '../lib/utils.js';
import { pageVariants, staggerContainer, staggerItem, scaleBounce } from '../animations/variants.js';
import { useState, useEffect } from 'react';

function CountUp({ end, duration = 1500 }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(Math.round(end)); clearInterval(timer); }
      else setCount(Math.round(start));
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);
  return count;
}

export default function Results() {
  const { sessionId } = useParams();
  const { data: session, isLoading } = useResults(sessionId);
  const [confettiPieces, setConfettiPieces] = useState([]);

  const score = session?.finalScore || 0;

  useEffect(() => {
    if (score > 70) {
      const pieces = Array.from({ length: 30 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        bg: ['#6366F1', '#10B981', '#F59E0B', '#A78BFA', '#F87171'][i % 5],
        rotate: Math.random() * 360,
        duration: 2 + Math.random() * 2,
        delay: Math.random() * 1.5
      }));
      queueMicrotask(() => setConfettiPieces(pieces));
    }
  }, [score]);

  if (isLoading) return <Loader fullScreen text="Loading results..." />;
  if (!session) return <div className="min-h-screen flex items-center justify-center text-text-muted">Session not found</div>;

  const color = getScoreColor(score);
  const radarData = session.rounds?.map(r => ({ subject: ROUND_LABELS[r.type] || r.type, score: r.score || 0 })) || [];

  return (
    <Motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="min-h-screen pt-24 pb-12 px-4">
      {confettiPieces.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-40">
          {confettiPieces.map((p) => (
            <Motion.div
              key={p.id}
              className="absolute w-2 h-2 rounded-full"
              style={{ left: p.left, background: p.bg }}
              initial={{ top: '-5%', opacity: 1 }}
              animate={{ top: '105%', opacity: 0, rotate: p.rotate }}
              transition={{ duration: p.duration, delay: p.delay, ease: 'easeOut' }}
            />
          ))}
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <Motion.div variants={scaleBounce} initial="initial" animate="animate" className="text-center mb-12">
          <h1 className="text-2xl font-bold mb-6">Interview Complete! 🎉</h1>
          <div className="inline-flex flex-col items-center p-8 bg-bg-card rounded-2xl border border-border">
            <span className="text-7xl font-bold" style={{ color }}><CountUp end={score} /></span>
            <span className="text-lg text-text-muted mt-1">/ 100</span>
            {session.percentile && <p className="text-sm text-text-secondary mt-3">Better than <strong>{session.percentile}%</strong> of candidates</p>}
          </div>
        </Motion.div>

        {radarData.length > 0 && (
          <div className="bg-bg-card rounded-xl border border-border p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">Performance Breakdown</h2>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--color-border)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} />
                <Radar dataKey="score" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}

        <Motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-4">
          {session.rounds?.map((round, i) => (
            <RoundResultCard key={round.id} round={round} index={i} />
          ))}
        </Motion.div>

        <div className="flex items-center justify-center gap-4 mt-10 flex-wrap">
          <Link to="/setup" className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors btn-glow">Try Again</Link>
          <Link to="/dashboard" className="px-6 py-2.5 border border-border rounded-lg hover:bg-bg-card transition-colors">Dashboard</Link>
        </div>
      </div>
    </Motion.div>
  );
}

function RoundResultCard({ round }) {
  const [expanded, setExpanded] = useState(false);
  const sc = round.score || 0;
  const color = getScoreColor(sc);

  return (
    <Motion.div variants={staggerItem} className="bg-bg-card rounded-xl border border-border overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between p-4 hover:bg-bg-elevated transition-colors">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-bg-elevated flex items-center justify-center text-sm font-bold">{round.roundNumber}</span>
          <span className="font-medium text-sm">{ROUND_LABELS[round.type] || round.type}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold" style={{ color }}>{Math.round(sc)}</span>
          <Motion.span animate={{ rotate: expanded ? 180 : 0 }} className="text-text-muted">▼</Motion.span>
        </div>
      </button>
      {expanded && round.questions?.map((q, qi) => (
        <div key={q.id} className="px-4 pb-4 border-t border-border">
          <div className="pt-3">
            <p className="text-xs text-text-muted mb-1">Q{qi + 1}: {q.content?.slice(0, 120)}...</p>
            {q.aiEvaluation && (
              <div className="mt-2 p-3 bg-bg-surface rounded-lg text-xs space-y-1">
                <p><strong>Score:</strong> <span style={{ color: getScoreColor(q.score || 0) }}>{q.score}/100</span></p>
                {q.aiEvaluation.verdict && <p><strong>Verdict:</strong> {q.aiEvaluation.verdict}</p>}
                {q.aiEvaluation.positiveFeedback && <p className="text-success-light">✓ {q.aiEvaluation.positiveFeedback}</p>}
              </div>
            )}
            {q.skipped && <p className="mt-2 text-xs text-warning">⏭ Skipped</p>}
          </div>
        </div>
      ))}
    </Motion.div>
  );
}
