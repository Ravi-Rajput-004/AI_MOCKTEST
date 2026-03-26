import { useDashboard, useAnalytics } from '../queries/user.queries.js';
import { ClipboardList, CheckCircle2, BarChart3, Flame } from 'lucide-react';
import { motion as Motion } from 'framer-motion';
import ScoreRadar from '../components/dashboard/ScoreRadar.jsx';
import ProgressChart from '../components/dashboard/ProgressChart.jsx';
import WeakAreaCard from '../components/dashboard/WeakAreaCard.jsx';
import SessionHistory from '../components/dashboard/SessionHistory.jsx';
import Loader from '../components/common/Loader.jsx';
import { pageVariants, staggerContainer, staggerItem } from '../animations/variants.js';

const statCards = [
  { key: 'totalSessions', label: 'Total Sessions', icon: <ClipboardList className="w-5 h-5 text-primary" /> },
  { key: 'completedSessions', label: 'Completed', icon: <CheckCircle2 className="w-5 h-5 text-success" /> },
  { key: 'averageScore', label: 'Avg Score', icon: <BarChart3 className="w-5 h-5 text-warning" />, format: (v) => (v !== null && v !== undefined && !isNaN(v)) ? Math.round(v) : '—' },
  { key: 'currentStreak', label: 'Streak', icon: <Flame className="w-5 h-5 text-danger" />, suffix: ' days' },
];

export default function Dashboard() {
  const { data: dashboard, isLoading: dLoading } = useDashboard();
  const { data: analytics, isLoading: aLoading } = useAnalytics();

  if (dLoading || aLoading) return <Loader fullScreen text="Loading dashboard..." />;

  const stats = dashboard?.stats || {};

  return (
    <Motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-sm text-text-muted">Track your interview performance</p>
          </div>
        </div>

        <Motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((card) => (
            <Motion.div key={card.key} variants={staggerItem} className="bg-bg-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 mb-2">
                <span>{card.icon}</span>
                <span className="text-xs text-text-muted">{card.label}</span>
              </div>
              <p className="text-2xl font-bold">
                {card.format ? card.format(stats[card.key]) : (stats[card.key] || 0)}
                {card.suffix && stats[card.key] ? card.suffix : ''}
              </p>
            </Motion.div>
          ))}
        </Motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <ProgressChart sessions={analytics?.trends || []} />
          </div>
          <ScoreRadar data={analytics?.profile || {}} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <WeakAreaCard areas={dashboard?.weakAreas || []} type="weak" />
          <WeakAreaCard areas={dashboard?.strongAreas || []} type="strong" />
        </div>

        <div className="bg-bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Sessions</h2>
          <SessionHistory sessions={dashboard?.recentSessions || []} />
        </div>
      </div>
    </Motion.div>
  );
}
