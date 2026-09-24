import type { Metadata } from "next";
import { getAdminMetrics } from "@/services/admin";
import { StatCard } from "@/components/stat-card";
import { formatMoney } from "@/lib/money";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminOverviewPage() {
  const metrics = await getAdminMetrics();

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink">Platform overview</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard label="Total users" value={metrics.totalUsers.toLocaleString()} emphasize />
        <StatCard label="Active users" value={metrics.activeUsers.toLocaleString()} />
        <StatCard label="Pending KYC" value={metrics.pendingKyc.toLocaleString()} />
        <StatCard label="Total orders" value={metrics.totalOrders.toLocaleString()} />
        <StatCard label="Filled orders (24h)" value={metrics.filledOrders24h.toLocaleString()} />
        <StatCard label="Total deposits" value={formatMoney(metrics.depositsTotal)} />
        <StatCard label="Total withdrawals" value={formatMoney(metrics.withdrawalsTotal)} />
        <StatCard label="Social posts" value={metrics.posts.toLocaleString()} />
        <StatCard label="Flagged content" value={metrics.flaggedContent.toLocaleString()} />
      </div>
    </div>
  );
}
