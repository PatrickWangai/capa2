import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { getDashboardData } from "@/services/dashboard";
import { StatCard } from "@/components/stat-card";
import { PortfolioChart } from "@/components/portfolio-chart";
import { AssetRow } from "@/components/asset-row";
import { PriceChange } from "@/components/price-change";
import { formatMoney } from "@/lib/money";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  const data = await getDashboardData(session!.user.id);
  const isGain = data.dayChangeAmount >= 0;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const firstName = (session!.user.name ?? session!.user.username).split(" ")[0];

  return (
    <div className="mx-auto max-w-5xl px-5 py-8">
      <p className="text-[13.5px] text-muted">
        {greeting}, {firstName}
      </p>
      <div className="mt-1 flex flex-wrap items-baseline gap-3">
        <h1 className="font-tabular text-[32px] font-bold text-ink">{formatMoney(data.account.totalValue)}</h1>
        <PriceChange percent={data.dayChangePercent} amount={data.dayChangeAmount} />
      </div>

      <div className="mt-6 rounded-md border-2 border-line-strong shadow-hard-sm bg-surface p-5">
        <PortfolioChart isGain={isGain} />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Available cash" value={formatMoney(data.account.cashBalance)} />
        <StatCard
          label="Today's gain/loss"
          value={`${data.dayChangeAmount >= 0 ? "+" : ""}${formatMoney(data.dayChangeAmount)}`}
          sub={<PriceChange percent={data.dayChangePercent} size="sm" />}
        />
        <StatCard
          label="Total return"
          value={`${data.totalUnrealizedPnl >= 0 ? "+" : ""}${formatMoney(data.totalUnrealizedPnl)}`}
          sub={<PriceChange percent={data.totalReturnPercent} size="sm" />}
        />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-ink">Holdings</h2>
            <Link href="/portfolio" className="text-[13px] font-medium text-signal">
              View all →
            </Link>
          </div>
          <div className="mt-3 rounded-md border-2 border-line-strong">
            {data.holdings.length === 0 ? (
              <p className="p-6 text-center text-[13.5px] text-muted">
                No holdings yet. <Link href="/markets" className="font-medium text-ink underline">Browse markets</Link> to
                make your first trade.
              </p>
            ) : (
              <div className="px-4">
                {data.holdings.map((h) => (
                  <AssetRow
                    key={h.symbol}
                    symbol={h.symbol}
                    name={h.name}
                    price={h.marketValue}
                    changePercent={h.dayChangePercent}
                    currency={h.currency}
                    href={`/stock/${h.symbol}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-ink">Watchlist</h2>
            <Link href="/watchlist" className="text-[13px] font-medium text-signal">
              View all →
            </Link>
          </div>
          <div className="mt-3 rounded-md border-2 border-line-strong">
            {data.watchlist.length === 0 ? (
              <p className="p-6 text-center text-[13.5px] text-muted">
                Your watchlist is empty. <Link href="/markets" className="font-medium text-ink underline">Add an asset</Link>.
              </p>
            ) : (
              <div className="px-4">
                {data.watchlist.map((w) => (
                  <AssetRow
                    key={w.symbol}
                    symbol={w.symbol}
                    name={w.name}
                    price={w.price}
                    changePercent={w.changePercent}
                    currency={w.currency}
                    href={`/stock/${w.symbol}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
