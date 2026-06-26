import { prisma } from '../utils/db.js';

// GET /api/admin/dashboard
export async function getDashboard(req, res) {
  const [users, kyc, orders, deposits] = await Promise.all([
    prisma.user.count(),
    prisma.user.groupBy({ by: ['kycStatus'], _count: true }),
    prisma.order.count({ where: { createdAt: { gte: new Date(Date.now() - 86400000) } } }),
    prisma.transaction.aggregate({ where: { type: 'DEPOSIT', status: 'COMPLETED' }, _sum: { amount: true } }),
  ]);
  const pendingKyc = await prisma.kycDocument.count({ where: { status: 'PENDING' } });
  const newUsers7d = await prisma.user.count({ where: { createdAt: { gte: new Date(Date.now() - 7 * 86400000) } } });
  res.json({ totalUsers: users, kycBreakdown: kyc, ordersToday: orders, totalDeposited: deposits._sum.amount || 0, pendingKycDocs: pendingKyc, newUsers7d });
}

// GET /api/admin/users
export async function listUsers(req, res) {
  const { search, status, kycStatus, limit = 20, offset = 0 } = req.query;
  const users = await prisma.user.findMany({
    where: {
      ...(status && { status }),
      ...(kycStatus && { kycStatus }),
      ...(search && { OR: [{ email: { contains: search, mode: 'insensitive' } }, { firstName: { contains: search, mode: 'insensitive' } }, { lastName: { contains: search, mode: 'insensitive' } }] }),
    },
    select: { id: true, email: true, firstName: true, lastName: true, status: true, kycStatus: true, createdAt: true, lastLoginAt: true, phone: true, countryOfResidence: true },
    orderBy: { createdAt: 'desc' },
    take: Number(limit), skip: Number(offset),
  });
  const total = await prisma.user.count();
  res.json({ users, total });
}

// PATCH /api/admin/users/:id
export async function updateUser(req, res) {
  const { status } = req.body;
  const user = await prisma.user.update({ where: { id: req.params.id }, data: { status }, select: { id: true, email: true, status: true } });
  await prisma.auditLog.create({ data: { adminId: req.user.id, userId: req.params.id, action: 'UPDATE_USER_STATUS', newValues: { status } } });
  res.json({ user });
}

// GET /api/admin/transactions
export async function listTransactions(req, res) {
  const { type, status, limit = 50, offset = 0 } = req.query;
  const transactions = await prisma.transaction.findMany({
    where: { ...(type && { type }), ...(status && { status }) },
    include: { account: { include: { user: { select: { email: true, firstName: true, lastName: true } } } }, paymentInstruction: true },
    orderBy: { createdAt: 'desc' },
    take: Number(limit), skip: Number(offset),
  });
  res.json({ transactions });
}

// PATCH /api/admin/transactions/:id/confirm
export async function confirmTransaction(req, res) {
  const tx = await prisma.transaction.findUnique({ where: { id: req.params.id } });
  if (!tx) return res.status(404).json({ error: 'Not found.' });
  await prisma.transaction.update({ where: { id: tx.id }, data: { status: 'COMPLETED' } });
  if (tx.type === 'DEPOSIT') {
    await prisma.accountBalance.upsert({
      where: { accountId_currency: { accountId: tx.accountId, currency: tx.currency } },
      create: { accountId: tx.accountId, currency: tx.currency, available: tx.amount },
      update: { available: { increment: Number(tx.amount) } },
    });
  }
  res.json({ message: 'Transaction confirmed.' });
}

// GET /api/admin/audit
export async function getAuditLogs(req, res) {
  const logs = await prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
  res.json({ logs });
}
