import { prisma } from '../../config/database.js';

export async function getPlatformStats() {
  const [totalUsers, totalSessions, completedSessions, activeUsers, planBreakdown, totalRevenue] = await Promise.all([
    prisma.user.count(),
    prisma.interviewSession.count(),
    prisma.interviewSession.count({ where: { status: 'COMPLETED' } }),
    prisma.user.count({ where: { updatedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
    prisma.user.groupBy({ by: ['plan'], _count: { plan: true } }),
    prisma.payment.aggregate({ where: { status: 'SUCCESS' }, _sum: { amount: true } }),
  ]);

  const totalQuestions = await prisma.question.count();
  const avgScore = await prisma.interviewSession.aggregate({ where: { status: 'COMPLETED', finalScore: { not: null } }, _avg: { finalScore: true } });

  return {
    totalUsers,
    totalSessions,
    completedSessions,
    activeUsersLast7d: activeUsers,
    totalQuestions,
    avgScore: avgScore._avg.finalScore ? Math.round(avgScore._avg.finalScore * 10) / 10 : 0,
    totalRevenue: (totalRevenue._sum.amount || 0) / 100,
    planBreakdown: planBreakdown.reduce((acc, p) => { acc[p.plan] = p._count.plan; return acc; }, {}),
  };
}

export async function getUserGrowth() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const users = await prisma.user.findMany({
    where: { createdAt: { gte: thirtyDaysAgo } },
    select: { createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  const dailyMap = {};
  for (let i = 0; i < 30; i++) {
    const d = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000);
    dailyMap[d.toISOString().split('T')[0]] = 0;
  }

  users.forEach(u => {
    const key = u.createdAt.toISOString().split('T')[0];
    if (dailyMap[key] !== undefined) dailyMap[key]++;
  });

  return Object.entries(dailyMap).map(([date, count]) => ({ date, count }));
}

export async function getRevenueBreakdown() {
  const payments = await prisma.payment.findMany({
    where: { status: 'SUCCESS' },
    select: { plan: true, amount: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const byPlan = {};
  payments.forEach(p => {
    if (!byPlan[p.plan]) byPlan[p.plan] = { total: 0, count: 0 };
    byPlan[p.plan].total += p.amount / 100;
    byPlan[p.plan].count++;
  });

  return {
    byPlan,
    recentPayments: payments.slice(0, 10).map(p => ({
      plan: p.plan,
      amount: p.amount / 100,
      date: p.createdAt,
    })),
  };
}

export async function getPopularRounds() {
  const rounds = await prisma.round.groupBy({
    by: ['type'],
    _count: { type: true },
    _avg: { score: true },
    orderBy: { _count: { type: 'desc' } },
  });

  return rounds.map(r => ({
    type: r.type,
    count: r._count.type,
    avgScore: r._avg.score ? Math.round(r._avg.score * 10) / 10 : 0,
  }));
}

export async function getAdminUsers(page = 1, limit = 20, search = '') {
  const where = search ? { OR: [
    { name: { contains: search, mode: 'insensitive' } },
    { email: { contains: search, mode: 'insensitive' } },
  ] } : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true, email: true, name: true, avatar: true,
        plan: true, isAdmin: true, createdAt: true,
        _count: { select: { sessions: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total, page, totalPages: Math.ceil(total / limit) };
}
