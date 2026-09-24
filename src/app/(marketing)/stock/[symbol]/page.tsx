import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { getStockPageData } from "@/services/stock";
import { PriceChange } from "@/components/price-change";
import { StockChart } from "@/components/stock-chart";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatMoney, formatCompactMoney, formatPercent } from "@/lib/money";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ symbol: string }>;
}): Promise<Metadata> {
  const { symbol } = await params;
  return { title: symbol.toUpperCase() };
}

export default async function StockPage({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await params;
  const [data, session] = await Promise.all([getStockPageData(symbol), auth()]);
  if (!data) notFound();

  const { asset, quote, company, news, community } = data;
  const tradeHref = session?.user ? `/trade?symbol=${asset.symbol}` : `/login?callbackUrl=/trade?symbol=${asset.symbol}`;
  const totalCommunity = community.buyOrders + community.sellOrders;
  const buyShare = totalCommunity === 0 ? 50 : Math.round((community.buyOrders / totalCommunity) * 100);

  return (
    <section className="mx-auto max-w-4xl px-5 py-10">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className="font-tabular text-[13px] font-medium text-faint">
            {asset.symbol} · {asset.exchange}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-ink">{asset.name}</h1>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="font-tabular text-3xl font-bold text-ink">{formatMoney(quote.price, asset.currency)}</span>
            <PriceChange percent={quote.changePercent} amount={quote.change} currency={asset.currency} />
          </div>
        </div>
        <div className="flex gap-2.5">
          <Button asChild size="lg">
            <Link href={`${tradeHref}&side=BUY`}>Buy</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href={`${tradeHref}&side=SELL`}>Sell</Link>
          </Button>
        </div>
      </div>

      <div className="mt-8">
        <StockChart symbol={asset.symbol} />
      </div>

      <Tabs defaultValue="overview" className="mt-10">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="news">News</TabsTrigger>
          <TabsTrigger value="financials">Financials</TabsTrigger>
          <TabsTrigger value="community">Community</TabsTrigger>
          <TabsTrigger value="theses">Theses</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <p className="max-w-[64ch] text-[14.5px] leading-relaxed text-ink-soft">{company.description}</p>
          <dl className="mt-6 grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3">
            <Stat label="Day high" value={formatMoney(quote.dayHigh, asset.currency)} />
            <Stat label="Day low" value={formatMoney(quote.dayLow, asset.currency)} />
            <Stat label="Volume" value={quote.volume.toLocaleString()} />
            <Stat label="52-week range" value={
              company.week52Low && company.week52High
                ? `${formatMoney(company.week52Low, asset.currency)} – ${formatMoney(company.week52High, asset.currency)}`
                : "—"
            } />
            <Stat label="Sector" value={company.sector ?? "—"} />
            <Stat label="Asset class" value={asset.assetClass} />
          </dl>
        </TabsContent>

        <TabsContent value="news">
          {news.length === 0 ? (
            <p className="text-[13.5px] text-muted">No recent news for {asset.symbol}.</p>
          ) : (
            <ul className="space-y-5">
              {news.map((item) => (
                <li key={item.id} className="border-b border-line pb-5 last:border-none">
                  <p className="text-[12px] font-medium uppercase tracking-wide text-faint">
                    {new Date(item.publishedAt).toLocaleDateString()} · {item.source}
                  </p>
                  <h3 className="mt-1 text-[15px] font-semibold text-ink">{item.headline}</h3>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">{item.summary}</p>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="financials">
          <dl className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3">
            <Stat label="Market cap" value={company.marketCap ? formatCompactMoney(company.marketCap, asset.currency) : "—"} />
            <Stat label="P/E ratio" value={company.peRatio ? company.peRatio.toFixed(2) : "—"} />
            <Stat label="Dividend yield" value={company.dividendYield ? formatPercent(company.dividendYield) : "—"} />
          </dl>
        </TabsContent>

        <TabsContent value="community">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-faint">Based on aggregated user activity</p>
          <div className="mt-4 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-[13.5px] text-ink-soft">
                <span className="font-tabular font-semibold text-ink">{community.buyOrders.toLocaleString()}</span> investors
                bought {asset.symbol} this week
              </p>
              <p className="mt-1 text-[13.5px] text-ink-soft">
                <span className="font-tabular font-semibold text-ink">{community.sellOrders.toLocaleString()}</span> investors
                sold
              </p>
              <p className="mt-1 text-[13.5px] text-ink-soft">
                <span className="font-tabular font-semibold text-ink">{community.holderCount.toLocaleString()}</span> current
                Capa holders
              </p>
              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-loss-tint">
                <div className="h-full bg-gain" style={{ width: `${buyShare}%` }} />
              </div>
              <div className="mt-1.5 flex justify-between text-[11.5px] text-faint">
                <span>Buying {buyShare}%</span>
                <span>Selling {100 - buyShare}%</span>
              </div>
            </div>
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-wide text-faint">Why investors are buying</p>
              {community.reasons.length === 0 ? (
                <p className="mt-3 text-[13.5px] text-muted">Not enough voluntary data yet.</p>
              ) : (
                <div className="mt-3 space-y-2.5">
                  {community.reasons.map((r) => (
                    <div key={r.reason} className="flex items-center gap-3">
                      <span className="w-32 shrink-0 text-[13px] text-ink-soft">{r.label}</span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-raised">
                        <div className="h-full bg-ink" style={{ width: `${r.percent}%` }} />
                      </div>
                      <span className="w-9 shrink-0 text-right font-tabular text-[12.5px] text-muted">{r.percent}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="theses">
          <p className="text-[13.5px] text-muted">
            No public investment theses on {asset.symbol} yet.{" "}
            <Link href={tradeHref} className="font-medium text-ink underline underline-offset-2">
              Be the first to publish one
            </Link>
            .
          </p>
        </TabsContent>
      </Tabs>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11.5px] font-medium uppercase tracking-wide text-faint">{label}</dt>
      <dd className="mt-1 font-tabular text-[14.5px] font-medium text-ink">{value}</dd>
    </div>
  );
}
