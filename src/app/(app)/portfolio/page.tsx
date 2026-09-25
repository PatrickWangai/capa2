import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { getBrokerService } from "@/services/providers/broker";
import { StatCard } from "@/components/stat-card";
import { PriceChange } from "@/components/price-change";
import { ExplainPortfolio } from "@/components/explain-portfolio";
import { convertToBase, formatMoney, formatQuantity } from "@/lib/money";

export const metadata: Metadata = { title: "Portfolio" };

export default async function PortfolioPage() {
  const session = await auth();
  const broker = getBrokerService();
  const [account, positions] = await Promise.all([
    broker.getAccount(session!.user.id),
    broker.getPositions(session!.user.id),
  ]);

  const totalUnrealizedPnl = positions.reduce(
    (sum, p) => sum + convertToBase(p.unrealizedPnl, p.currency).toNumber(),
    0,
  );

  return (
    <div className="mx-auto max-w-5xl px-5 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">Portfolio</h1>
        <ExplainPortfolio />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <StatCard label="Total value" value={formatMoney(account.totalValue.toNumber())} emphasize />
        <StatCard label="Cash" value={formatMoney(account.cashBalance.toNumber())} />
        <StatCard label="Invested" value={formatMoney(account.portfolioValue.toNumber())} />
        <StatCard
          label="Unrealized P/L"
          value={`${totalUnrealizedPnl >= 0 ? "+" : ""}${formatMoney(totalUnrealizedPnl)}`}
        />
      </div>

      <div className="mt-10">
        <h2 className="text-[15px] font-semibold text-ink">Holdings</h2>
        {positions.length === 0 ? (
          <div className="mt-3 rounded-md border-2 border-dashed border-line-strong p-10 text-center">
            <p className="text-[14px] text-muted">You don&apos;t hold any positions yet.</p>
            <Link href="/markets" className="mt-2 inline-block text-[13.5px] font-medium text-ink underline underline-offset-2">
              Browse markets to make your first trade
            </Link>
          </div>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-md border-2 border-line-strong">
            <table className="w-full min-w-[720px] text-left text-[13.5px]">
              <thead>
                <tr className="border-b border-line text-[11.5px] uppercase tracking-wide text-faint">
                  <th className="px-4 py-3 font-medium">Symbol</th>
                  <th className="px-4 py-3 text-right font-medium">Quantity</th>
                  <th className="px-4 py-3 text-right font-medium">Avg price</th>
                  <th className="px-4 py-3 text-right font-medium">Current</th>
                  <th className="px-4 py-3 text-right font-medium">Market value</th>
                  <th className="px-4 py-3 text-right font-medium">Unrealized P/L</th>
                  <th className="px-4 py-3 text-right font-medium">Allocation</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((p) => (
                  <tr key={p.assetId} className="border-b border-line last:border-none hover:bg-surface-raised">
                    <td className="px-4 py-3">
                      <Link href={`/stock/${p.symbol}`} className="block">
                        <p className="font-tabular font-semibold text-ink">{p.symbol}</p>
                        <p className="text-[12px] text-muted">{p.name}</p>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right font-tabular text-ink-soft">{formatQuantity(p.quantity)}</td>
                    <td className="px-4 py-3 text-right font-tabular text-ink-soft">
                      {formatMoney(p.avgPrice.toNumber(), p.currency)}
                    </td>
                    <td className="px-4 py-3 text-right font-tabular text-ink-soft">
                      {formatMoney(p.currentPrice.toNumber(), p.currency)}
                    </td>
                    <td className="px-4 py-3 text-right font-tabular font-medium text-ink">
                      {formatMoney(p.marketValue.toNumber(), p.currency)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <PriceChange percent={p.unrealizedPnlPercent.toNumber()} amount={p.unrealizedPnl.toNumber()} size="sm" className="justify-end" />
                    </td>
                    <td className="px-4 py-3 text-right font-tabular text-ink-soft">
                      {p.allocationPercent.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
