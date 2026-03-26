import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

export default function ScoreRadar({ data }) {
  const chartData = [
    { subject: 'DSA', score: data?.dsaScore || 0 },
    { subject: 'LLD', score: data?.lldScore || 0 },
    { subject: 'HLD', score: data?.hldScore || 0 },
    { subject: 'HR', score: data?.hrScore || 0 },
    { subject: 'Aptitude', score: data?.aptitudeScore || 0 },
  ].filter(d => d.score > 0);

  if (chartData.length === 0) return <div className="text-center text-sm text-text-muted py-8">No data yet</div>;

  return (
    <div className="bg-bg-card rounded-xl border border-border p-4">
      <h3 className="text-sm font-semibold mb-4">Skill Radar</h3>
      <ResponsiveContainer width="100%" height={250}>
        <RadarChart data={chartData}>
          <PolarGrid stroke="var(--color-border)" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} />
          <Radar dataKey="score" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.2} strokeWidth={2} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
