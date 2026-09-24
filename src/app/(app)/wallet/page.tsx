import type { Metadata } from "next";
import { auth } from "@/auth";
import { getWalletSummary } from "@/services/wallet";
import { StatCard } from "@/components/stat-card";
import { WalletActions } from "@/components/wallet-actions";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/money";
import type { BadgeProps } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Wallet" };

const STATUS_VARIANT: Record<string, NonNullable<BadgeProps["variant"]>> = {
  COMPLETED: "gain",
  PENDING: "signal",
  FAILED: "loss",
};

export default async function WalletPage() {
  const session = await auth();
  const wallet = await getWalletSummary(session!.user.id);

  return (
    <div className="mx-auto max-w-2xl px-5 py-8">
      <h1 className="text-2xl font-bold text-ink">Wallet</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Cash balance" value={formatMoney(wallet.cashBalance)} emphasize />
        <StatCard label="Pending deposits" value={formatMoney(wallet.pendingDeposits)} />
        <StatCard label="Pending withdrawals" value={formatMoney(wallet.pendingWithdrawals)} />
      </div>

      <div className="mt-6">
        <WalletActions />
      </div>

      <div className="mt-8">
        <h2 className="text-[15px] font-semibold text-ink">Transaction history</h2>
        {wallet.transactions.length === 0 ? (
          <p className="mt-3 text-[13.5px] text-muted">No transactions yet.</p>
        ) : (
          <div className="mt-3 rounded-xl border border-line">
            {wallet.transactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-4 border-b border-line p-4 last:border-none">
                <div>
                  <p className="text-[13.5px] font-medium text-ink">{t.description ?? t.type.replaceAll("_", " ")}</p>
                  <p className="text-[11.5px] text-faint">{new Date(t.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={STATUS_VARIANT[t.status] ?? "neutral"}>{t.status}</Badge>
                  <span className={`font-tabular text-[13.5px] font-medium ${Number(t.amount) >= 0 ? "text-gain" : "text-loss"}`}>
                    {Number(t.amount) >= 0 ? "+" : ""}
                    {formatMoney(t.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
