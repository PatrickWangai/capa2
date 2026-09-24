import type { Metadata } from "next";
import Link from "next/link";
import { getMarketPulse, type PulseWindow } from "@/services/market-pulse";
import { MarketPulseCard } from "@/components/market-pulse-card";
import { Badge } from "@/components/ui/badge";
import type { AssetRegion } from "@/generated/prisma/client";

export const metadata: Metadata = { title: "Market Pulse" };

const WINDOWS: { label: string; value: PulseWindow }[] = [
  { label: "Today", value: "today" },
  { label: "7 days", value: "7d" },
  { label: "30 days", value: "30d" },
];

const REGIONS: { label: string; value?: AssetRegion }[] = [
  { label: "All" },
  { label: "Kenya", value: "KE" },
  { label: "US", value: "US" },
  { label: "Global", value: "GLOBAL" },
];

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<{ window?: string; region?: string }>;
}) {
  const params = await searchParams;
  const window = (WINDOWS.find((w) => w.value === params.window)?.value ?? "7d") as PulseWindow;
  const region = REGIONS.find((r) => r.label === params.region)?.value;

  const pulse = await getMarketPulse({ window, region });

  return (
    <div className="mx-auto max-w-4xl px-5 py-8">
      <h1 className="text-2xl font-bold text-ink">Market Pulse</h1>
      <p className="mt-1 text-[13px] text-faint">Based on aggregated Capa user activity — not a recommendation.</p>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {WINDOWS.map((w) => (
            <Link key={w.value} href={`/discover?window=${w.value}${params.region ? `&region=${params.region}` : ""}`}>
              <Badge variant={window === w.value ? "signal" : "outline"} className="px-3 py-1.5">
                {w.label}
              </Badge>
            </Link>
          ))}
        </div>
        <div className="flex gap-2">
          {REGIONS.map((r) => (
            <Link key={r.label} href={`/discover?window=${window}${r.label !== "All" ? `&region=${r.label}` : ""}`}>
              <Badge variant={(params.region ?? "All") === r.label ? "signal" : "outline"} className="px-3 py-1.5">
                {r.label}
              </Badge>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-8 sm:grid-cols-2">
        <PulseSection title="Most bought" rows={pulse.mostBought} metricLabel="buyers" metricKey="buyers" />
        <PulseSection title="Biggest seller activity" rows={pulse.biggestSellerIncrease} metricLabel="sellers" metricKey="sellers" />
        <PulseSection title="Most added to watchlists" rows={pulse.mostWatchlisted} metricLabel="adds" metricKey="watchlistAdds" />
        <PulseSection title="Most discussed" rows={pulse.mostDiscussed} metricLabel="theses" metricKey="discussions" />
      </div>
    </div>
  );
}

function PulseSection({
  title,
  rows,
  metricLabel,
  metricKey,
}: {
  title: string;
  rows: Awaited<ReturnType<typeof getMarketPulse>>["mostBought"];
  metricLabel: string;
  metricKey: "buyers" | "sellers" | "watchlistAdds" | "discussions";
}) {
  return (
    <div>
      <h2 className="text-[14px] font-semibold text-ink">{title}</h2>
      <div className="mt-2 rounded-xl border border-line px-4">
        {rows.filter((r) => r[metricKey] > 0).length === 0 ? (
          <p className="py-6 text-center text-[13px] text-muted">No activity in this window yet.</p>
        ) : (
          rows
            .filter((r) => r[metricKey] > 0)
            .slice(0, 5)
            .map((r) => (
              <MarketPulseCard
                key={r.assetId}
                symbol={r.symbol}
                name={r.name}
                price={r.price}
                changePercent={r.changePercent}
                currency={r.currency}
                metricLabel={metricLabel}
                metricValue={r[metricKey].toLocaleString()}
              />
            ))
        )}
      </div>
    </div>
  );
}
