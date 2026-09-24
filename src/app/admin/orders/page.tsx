import type { Metadata } from "next";
import { listOrdersForAdmin } from "@/services/admin";
import { Badge } from "@/components/ui/badge";
import { formatMoney, formatQuantity } from "@/lib/money";
import type { BadgeProps } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Admin — Orders" };

const STATUS_VARIANT: Record<string, NonNullable<BadgeProps["variant"]>> = {
  FILLED: "gain",
  OPEN: "signal",
  PENDING: "signal",
  CANCELLED: "neutral",
  REJECTED: "loss",
};

export default async function AdminOrdersPage() {
  const orders = await listOrdersForAdmin();

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink">Orders</h1>
      <div className="mt-6 overflow-x-auto rounded-xl border border-line">
        <table className="w-full min-w-[720px] text-left text-[13.5px]">
          <thead>
            <tr className="border-b border-line text-[11.5px] uppercase tracking-wide text-faint">
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Symbol</th>
              <th className="px-4 py-3 font-medium">Side</th>
              <th className="px-4 py-3 text-right font-medium">Quantity</th>
              <th className="px-4 py-3 text-right font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Placed</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-line last:border-none">
                <td className="px-4 py-3 text-ink-soft">@{o.user.username}</td>
                <td className="px-4 py-3 font-tabular font-medium text-ink">{o.asset.symbol}</td>
                <td className="px-4 py-3">
                  <span className={o.side === "BUY" ? "text-gain" : "text-loss"}>{o.side}</span>
                </td>
                <td className="px-4 py-3 text-right font-tabular text-ink-soft">{formatQuantity(o.quantity)}</td>
                <td className="px-4 py-3 text-right font-tabular text-ink-soft">{formatMoney(o.estimatedTotal, o.asset.currency)}</td>
                <td className="px-4 py-3">
                  <Badge variant={STATUS_VARIANT[o.status] ?? "neutral"}>{o.status.replace("_", " ")}</Badge>
                </td>
                <td className="px-4 py-3 text-ink-soft">{o.createdAt.toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
