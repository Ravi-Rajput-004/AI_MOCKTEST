import React from 'react';
import { motion as Motion } from 'framer-motion';
import { cardVariants } from '../../animations/variants.js';
import { ROUND_LABELS } from '../../lib/constants.jsx';

const QuestionCard = React.memo(function QuestionCard({ question, questionNumber, totalQuestions, roundType }) {
  const difficulty = question?.metadata?.difficulty || 'Medium';
  const topic = question?.metadata?.topic || '';
  const diffColor = difficulty === 'Easy' ? 'var(--color-success)' : difficulty === 'Hard' ? 'var(--color-danger)' : 'var(--color-warning)';

  return (
    <Motion.div variants={cardVariants} initial="initial" animate="animate" className="bg-bg-card rounded-xl border border-border p-6">
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="text-xs px-2.5 py-1 rounded-full bg-primary/20 text-primary-light font-medium">{ROUND_LABELS[roundType] || roundType}</span>
        <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: `${diffColor}20`, color: diffColor }}>{difficulty}</span>
        {topic && <span className="text-xs px-2.5 py-1 rounded-full bg-bg-elevated text-text-muted">{topic}</span>}
        <span className="ml-auto text-xs text-text-muted">Q{questionNumber}/{totalQuestions}</span>
      </div>
      <div className="prose prose-invert max-w-none">
        <pre className="whitespace-pre-wrap text-sm leading-relaxed text-text-primary font-sans">{question?.content}</pre>
      </div>
    </Motion.div>
  );
});

export default QuestionCard;
