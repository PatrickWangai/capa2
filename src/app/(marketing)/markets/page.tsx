import type { Metadata } from "next";
import Link from "next/link";
import { AssetRow } from "@/components/asset-row";
import { Badge } from "@/components/ui/badge";
import { listMarketAssets } from "@/services/markets";
import type { AssetRegion, AssetClass } from "@/generated/prisma/client";

export const metadata: Metadata = { title: "Markets" };

const REGION_TABS: { label: string; value?: AssetRegion; assetClass?: AssetClass }[] = [
  { label: "All" },
  { label: "Kenya", value: "KE" },
  { label: "US", value: "US" },
  { label: "Global", value: "GLOBAL" },
  { label: "ETFs", assetClass: "ETF" },
];

export default async function MarketsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; q?: string }>;
}) {
  const params = await searchParams;
  const activeFilter = params.filter ?? "All";
  const tab = REGION_TABS.find((t) => t.label === activeFilter) ?? REGION_TABS[0];

  const assets = await listMarketAssets({ region: tab.value, assetClass: tab.assetClass, search: params.q });

  return (
    <section className="mx-auto max-w-4xl px-5 py-14">
      <p className="text-[12px] font-semibold uppercase tracking-wide text-faint">Markets</p>
      <h1 className="mt-3 text-3xl font-bold text-ink">Kenyan, US, and global markets.</h1>

      <div className="mt-8 flex flex-wrap gap-2">
        {REGION_TABS.map((t) => (
          <Link
            key={t.label}
            href={t.label === "All" ? "/markets" : `/markets?filter=${t.label}`}
            className="inline-block"
          >
            <Badge variant={activeFilter === t.label ? "signal" : "outline"} className="px-3.5 py-1.5 text-[13px]">
              {t.label}
            </Badge>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-md border-2 border-line-strong">
        {assets.length === 0 ? (
          <p className="p-8 text-center text-[13.5px] text-muted">No assets match this filter yet.</p>
        ) : (
          <div className="px-4">
            {assets.map((a) => (
              <AssetRow
                key={a.id}
                symbol={a.symbol}
                name={a.name}
                price={a.price}
                changePercent={a.changePercent}
                currency={a.currency}
                href={`/stock/${a.symbol}`}
                meta={
                  <span className="hidden text-[11px] font-medium uppercase tracking-wide text-faint sm:block">
                    {a.exchange}
                  </span>
                }
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
