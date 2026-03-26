import { Link } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '../../animations/variants.js';
import { STATUS_COLORS, ROUND_LABELS } from '../../lib/constants.jsx';
import { timeAgo } from '../../lib/utils.js';

export default function SessionHistory({ sessions = [] }) {
  if (sessions.length === 0) {
    return <div className="text-center text-sm text-text-muted py-8">No interview sessions yet. Start your first one!</div>;
  }

  return (
    <Motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-3">
      {sessions.map((s) => (
        <Motion.div key={s.id} variants={staggerItem}>
          <Link to={s.status === 'COMPLETED' ? `/results/${s.id}` : `/interview/${s.id}`} className="block bg-bg-card rounded-xl border border-border p-4 hover:border-primary/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{s.level?.replace('_', '-')}</span>
                  <span className="text-xs text-text-muted">•</span>
                  <span className="text-xs text-text-muted">{s.role?.replace('_', ' ')}</span>
                  <span className="text-xs text-text-muted">•</span>
                  <span className="text-xs text-text-muted">{s.companyType}</span>
                </div>
                <p className="text-xs text-text-muted mt-1">{timeAgo(s.startedAt)}</p>
              </div>
              <div className="text-right">
                <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${STATUS_COLORS[s.status]}20`, color: STATUS_COLORS[s.status] }}>{s.status?.replace('_', ' ')}</span>
                {s.finalScore != null && <p className="text-lg font-bold mt-1" style={{ color: STATUS_COLORS.COMPLETED }}>{Math.round(s.finalScore)}</p>}
              </div>
            </div>
          </Link>
        </Motion.div>
      ))}
    </Motion.div>
  );
}
