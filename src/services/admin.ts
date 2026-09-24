import { db } from "@/lib/db";

export async function getAdminMetrics() {
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [
    totalUsers,
    activeUsers,
    pendingKyc,
    totalOrders,
    filledOrders24h,
    depositsTotal,
    withdrawalsTotal,
    posts,
    flaggedContent,
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { status: "ACTIVE" } }),
    db.kYCApplication.count({ where: { status: "PENDING" } }),
    db.order.count(),
    db.order.count({ where: { status: "FILLED", filledAt: { gte: since24h } } }),
    db.deposit.aggregate({ where: { status: "COMPLETED" }, _sum: { amount: true } }),
    db.withdrawal.aggregate({ where: { status: "COMPLETED" }, _sum: { amount: true } }),
    db.post.count(),
    db.report.count({ where: { status: { in: ["REPORTED", "UNDER_REVIEW"] } } }),
  ]);

  return {
    totalUsers,
    activeUsers,
    pendingKyc,
    totalOrders,
    filledOrders24h,
    depositsTotal: depositsTotal._sum.amount?.toString() ?? "0",
    withdrawalsTotal: withdrawalsTotal._sum.amount?.toString() ?? "0",
    posts,
    flaggedContent,
  };
}

export async function listUsersForAdmin() {
  return db.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      email: true,
      username: true,
      name: true,
      role: true,
      status: true,
      createdAt: true,
      kycApplication: { select: { status: true } },
    },
  });
}

export async function setUserStatus(actorId: string, userId: string, status: "ACTIVE" | "SUSPENDED") {
  await db.$transaction([
    db.user.update({ where: { id: userId }, data: { status } }),
    db.auditLog.create({ data: { actorId, action: `user.status.${status.toLowerCase()}`, targetType: "User", targetId: userId } }),
  ]);
}

export async function listOrdersForAdmin() {
  return db.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { user: { select: { username: true } }, asset: { select: { symbol: true, currency: true } } },
  });
}

export async function listTransactionsForAdmin() {
  return db.transaction.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { wallet: { include: { user: { select: { username: true } } } } },
  });
}

export async function listPendingKyc() {
  return db.kYCApplication.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: { user: { select: { username: true, name: true, email: true } } },
  });
}

export async function reviewKyc(actorId: string, applicationId: string, decision: "VERIFIED" | "REJECTED", rejectionReason?: string) {
  await db.$transaction([
    db.kYCApplication.update({
      where: { id: applicationId },
      data: { status: decision, rejectionReason: decision === "REJECTED" ? rejectionReason : null, reviewedById: actorId, reviewedAt: new Date() },
    }),
    db.auditLog.create({ data: { actorId, action: `kyc.${decision.toLowerCase()}`, targetType: "KYCApplication", targetId: applicationId } }),
  ]);
}

export async function listReportsForAdmin() {
  return db.report.findMany({
    where: { status: { in: ["REPORTED", "UNDER_REVIEW"] } },
    orderBy: { createdAt: "desc" },
    include: {
      reporter: { select: { username: true } },
      post: { select: { id: true, content: true, userId: true } },
      comment: { select: { id: true, body: true, userId: true } },
    },
  });
}

export async function resolveReport(actorId: string, reportId: string, action: "REMOVE" | "DISMISS") {
  const report = await db.report.findUniqueOrThrow({ where: { id: reportId } });
  await db.$transaction(async (tx) => {
    if (action === "REMOVE") {
      if (report.postId) await tx.post.update({ where: { id: report.postId }, data: { moderationStatus: "REMOVED" } });
      if (report.commentId) await tx.comment.update({ where: { id: report.commentId }, data: { moderationStatus: "REMOVED" } });
    }
    await tx.report.update({
      where: { id: reportId },
      data: { status: action === "REMOVE" ? "REMOVED" : "VISIBLE", reviewedById: actorId, reviewedAt: new Date() },
    });
    await tx.auditLog.create({ data: { actorId, action: `report.${action.toLowerCase()}`, targetType: "Report", targetId: reportId } });
  });
}

export async function listAuditLog() {
  return db.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { actor: { select: { username: true } } },
  });
}
