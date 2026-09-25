import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { getBrokerService } from "@/services/providers/broker";
import { Badge } from "@/components/ui/badge";
import { CancelOrderButton } from "@/components/cancel-order-button";
import { formatMoney, formatQuantity } from "@/lib/money";
import type { BadgeProps } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Orders" };

const STATUS_VARIANT: Record<string, NonNullable<BadgeProps["variant"]>> = {
  FILLED: "gain",
  OPEN: "signal",
  PENDING: "signal",
  PARTIALLY_FILLED: "signal",
  CANCELLED: "neutral",
  REJECTED: "loss",
};

export default async function OrdersPage() {
  const session = await auth();
  const broker = getBrokerService();
  const orders = await broker.getOrders(session!.user.id);

  return (
    <div className="mx-auto max-w-4xl px-5 py-8">
      <h1 className="text-2xl font-bold text-ink">Orders</h1>

      {orders.length === 0 ? (
        <div className="mt-6 rounded-md border-2 border-dashed border-line-strong p-10 text-center">
          <p className="text-[14px] text-muted">You haven&apos;t placed any orders yet.</p>
          <Link href="/trade" className="mt-2 inline-block text-[13.5px] font-medium text-ink underline underline-offset-2">
            Place your first trade
          </Link>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-md border-2 border-line-strong">
          <table className="w-full min-w-[720px] text-left text-[13.5px]">
            <thead>
              <tr className="border-b border-line text-[11.5px] uppercase tracking-wide text-faint">
                <th className="px-4 py-3 font-medium">Symbol</th>
                <th className="px-4 py-3 font-medium">Side</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 text-right font-medium">Quantity</th>
                <th className="px-4 py-3 text-right font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Placed</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-line last:border-none hover:bg-surface-raised">
                  <td className="px-4 py-3">
                    <Link href={`/stock/${o.symbol}`} className="font-tabular font-semibold text-ink">
                      {o.symbol}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className={o.side === "BUY" ? "text-gain" : "text-loss"}>{o.side}</span>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{o.type}</td>
                  <td className="px-4 py-3 text-right font-tabular text-ink-soft">{formatQuantity(o.quantity)}</td>
                  <td className="px-4 py-3 text-right font-tabular text-ink-soft">
                    {o.filledPrice ? formatMoney(o.filledPrice.toNumber()) : o.limitPrice ? formatMoney(o.limitPrice.toNumber()) : "Market"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANT[o.status] ?? "neutral"}>{o.status.replace("_", " ")}</Badge>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{o.createdAt.toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    {(o.status === "OPEN" || o.status === "PENDING") && <CancelOrderButton orderId={o.id} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
