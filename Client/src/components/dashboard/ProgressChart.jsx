import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { formatDate } from '../../lib/utils.js';

export default function ProgressChart({ sessions = [] }) {
  const data = sessions.map(s => ({ date: formatDate(s.date || s.completedAt), score: Math.round(s.score || s.finalScore || 0) })).reverse();

  if (data.length === 0) return <div className="text-center text-sm text-text-muted py-8">Complete interviews to see your progress</div>;

  return (
    <div className="bg-bg-card rounded-xl border border-border p-4">
      <h3 className="text-sm font-semibold mb-4">Score Trend</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <XAxis dataKey="date" tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }} />
          <Line type="monotone" dataKey="score" stroke="var(--color-primary)" strokeWidth={2} dot={{ fill: 'var(--color-primary)', r: 4 }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
