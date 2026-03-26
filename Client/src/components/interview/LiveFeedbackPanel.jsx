import { motion as Motion } from 'framer-motion';
import { getScoreColor } from '../../lib/utils.js';

export default function LiveFeedbackPanel({ evaluation }) {
  if (!evaluation) return null;

  const score = evaluation.totalScore || 0;
  const color = getScoreColor(score);

  return (
    <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-bg-card rounded-xl border border-border p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">AI Evaluation</h3>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold" style={{ color }}>{score}</span>
          <span className="text-sm text-text-muted">/ 100</span>
        </div>
      </div>

      {evaluation.breakdown && (
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(evaluation.breakdown).map(([key, val]) => (
            <div key={key} className="p-2 bg-bg-surface rounded-lg">
              <p className="text-xs text-text-muted capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
              <p className="text-sm font-semibold" style={{ color: getScoreColor((val / 40) * 100) }}>{val}</p>
            </div>
          ))}
        </div>
      )}

      {evaluation.verdict && (
        <div className={`text-sm font-medium px-3 py-1.5 rounded-lg inline-block ${evaluation.verdict === 'Excellent' || evaluation.verdict === 'Strong' ? 'bg-success/20 text-success' : evaluation.verdict === 'Good' ? 'bg-primary/20 text-primary-light' : evaluation.verdict === 'Average' ? 'bg-warning/20 text-warning' : 'bg-danger/20 text-danger'}`}>
          {evaluation.verdict}
        </div>
      )}

      {evaluation.positiveFeedback && <p className="text-sm text-success-light">✓ {evaluation.positiveFeedback}</p>}
      {evaluation.improvements?.length > 0 && (
        <div>
          <p className="text-xs text-text-muted mb-1">Improvements:</p>
          {evaluation.improvements.map((imp, i) => <p key={i} className="text-sm text-text-secondary">• {imp}</p>)}
        </div>
      )}
    </Motion.div>
  );
}
