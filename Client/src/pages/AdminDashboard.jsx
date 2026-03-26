import { useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { Users, DollarSign, BarChart3, Activity, TrendingUp, Search } from 'lucide-react';
import { useAdminStats, useAdminUsers, useAdminGrowth, useAdminRevenue } from '../queries/admin.queries.js';
import Loader from '../components/common/Loader.jsx';
import { pageVariants, staggerContainer, staggerItem } from '../animations/variants.js';
import { ROUND_LABELS } from '../lib/constants.jsx';

export default function AdminDashboard() {
  const { data: stats, isLoading: sLoading } = useAdminStats();
  const { data: growth, isLoading: gLoading } = useAdminGrowth();
  const { data: revenue, isLoading: rLoading } = useAdminRevenue();
  const [userPage, setUserPage] = useState(1);
  const [search, setSearch] = useState('');
  const { data: usersData, isLoading: uLoading } = useAdminUsers(userPage, search);

  if (sLoading) return <Loader fullScreen text="Loading admin dashboard..." />;

  const cards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: <Users className="w-5 h-5" />, color: '#6366F1' },
    { label: 'Total Sessions', value: stats?.totalSessions || 0, icon: <Activity className="w-5 h-5" />, color: '#10B981' },
    { label: 'Avg Score', value: stats?.avgScore || 0, icon: <BarChart3 className="w-5 h-5" />, color: '#F59E0B' },
    { label: 'Revenue (₹)', value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, icon: <DollarSign className="w-5 h-5" />, color: '#EF4444' },
    { label: 'Active (7d)', value: stats?.activeUsersLast7d || 0, icon: <TrendingUp className="w-5 h-5" />, color: '#8B5CF6' },
    { label: 'Questions', value: stats?.totalQuestions || 0, icon: <BarChart3 className="w-5 h-5" />, color: '#06B6D4' },
  ];

  return (
    <Motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-text-muted">Platform analytics and management</p>
        </div>

        <Motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {cards.map((card, i) => (
            <Motion.div key={i} variants={staggerItem} className="bg-bg-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 mb-2">
                <span style={{ color: card.color }}>{card.icon}</span>
                <span className="text-xs text-text-muted">{card.label}</span>
              </div>
              <p className="text-xl font-bold">{card.value}</p>
            </Motion.div>
          ))}
        </Motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Plan Breakdown */}
          <div className="bg-bg-card rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold mb-4">Plan Distribution</h2>
            {stats?.planBreakdown && Object.entries(stats.planBreakdown).map(([plan, count]) => (
              <div key={plan} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-sm font-medium">{plan}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-bg rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, (count / (stats.totalUsers || 1)) * 100)}%` }} />
                  </div>
                  <span className="text-sm text-text-muted w-12 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Popular Rounds */}
          <div className="bg-bg-card rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold mb-4">Popular Rounds</h2>
            {stats?.popularRounds?.map((round) => (
              <div key={round.type} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-sm font-medium">{ROUND_LABELS[round.type] || round.type}</span>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-text-muted">{round.count} attempts</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">{round.avgScore}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Growth */}
        {!gLoading && growth && (
          <div className="bg-bg-card rounded-xl border border-border p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">User Growth (30 Days)</h2>
            <div className="flex items-end gap-1 h-32">
              {growth.map((d, i) => {
                const max = Math.max(...growth.map(g => g.count), 1);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center group relative">
                    <div
                      className="w-full bg-primary/80 rounded-t transition-all hover:bg-primary"
                      style={{ height: `${Math.max(2, (d.count / max) * 100)}%`, minHeight: '2px' }}
                    />
                    <div className="absolute -top-8 hidden group-hover:block bg-bg-card border border-border rounded px-2 py-1 text-xs whitespace-nowrap z-10">
                      {d.date}: {d.count} users
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Revenue */}
        {!rLoading && revenue && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold mb-4">Revenue by Plan</h2>
              {revenue.byPlan && Object.entries(revenue.byPlan).map(([plan, data]) => (
                <div key={plan} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-sm font-medium">{plan}</span>
                  <div className="text-right">
                    <p className="text-sm font-bold">₹{data.total.toLocaleString()}</p>
                    <p className="text-xs text-text-muted">{data.count} payments</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold mb-4">Recent Payments</h2>
              {revenue.recentPayments?.map((p, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-success/20 text-success">{p.plan}</span>
                  <span className="text-sm font-medium">₹{p.amount}</span>
                  <span className="text-xs text-text-muted">{new Date(p.date).toLocaleDateString()}</span>
                </div>
              ))}
              {(!revenue.recentPayments || revenue.recentPayments.length === 0) && (
                <p className="text-sm text-text-muted">No payments yet</p>
              )}
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Users</h2>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setUserPage(1); }}
                className="pl-9 pr-4 py-2 bg-bg border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {uLoading ? <Loader text="Loading users..." /> : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-text-muted border-b border-border">
                      <th className="text-left py-2 px-3">Name</th>
                      <th className="text-left py-2 px-3">Email</th>
                      <th className="text-left py-2 px-3">Plan</th>
                      <th className="text-left py-2 px-3">Sessions</th>
                      <th className="text-left py-2 px-3">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersData?.users?.map((u) => (
                      <tr key={u.id} className="border-b border-border/50 hover:bg-bg/50">
                        <td className="py-2 px-3 flex items-center gap-2">
                          {u.avatar ? <img src={u.avatar} className="w-6 h-6 rounded-full" alt="" /> : <div className="w-6 h-6 rounded-full bg-primary/20" />}
                          {u.name}
                          {u.isAdmin && <span className="text-xs px-1.5 py-0.5 bg-primary/20 text-primary rounded">admin</span>}
                        </td>
                        <td className="py-2 px-3 text-text-muted">{u.email}</td>
                        <td className="py-2 px-3"><span className="text-xs px-2 py-0.5 rounded-full bg-success/20 text-success">{u.plan}</span></td>
                        <td className="py-2 px-3">{u._count?.sessions || 0}</td>
                        <td className="py-2 px-3 text-text-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {usersData?.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs text-text-muted">Page {usersData.page} of {usersData.totalPages} ({usersData.total} users)</span>
                  <div className="flex gap-2">
                    <button onClick={() => setUserPage(p => Math.max(1, p - 1))} disabled={userPage <= 1} className="px-3 py-1 text-xs border border-border rounded hover:bg-bg-card disabled:opacity-50">Prev</button>
                    <button onClick={() => setUserPage(p => Math.min(usersData.totalPages, p + 1))} disabled={userPage >= usersData.totalPages} className="px-3 py-1 text-xs border border-border rounded hover:bg-bg-card disabled:opacity-50">Next</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Motion.div>
  );
}
