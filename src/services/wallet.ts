import { db } from "@/lib/db";

export async function getWalletSummary(userId: string) {
  const wallet = await db.wallet.findUniqueOrThrow({ where: { userId } });
  const transactions = await db.transaction.findMany({
    where: { walletId: wallet.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return {
    cashBalance: wallet.cashBalance.toString(),
    pendingDeposits: wallet.pendingDeposits.toString(),
    pendingWithdrawals: wallet.pendingWithdrawals.toString(),
    currency: wallet.currency,
    transactions: transactions.map((t) => ({
      id: t.id,
      type: t.type,
      amount: t.amount.toString(),
      status: t.status,
      description: t.description,
      createdAt: t.createdAt,
    })),
  };
}
