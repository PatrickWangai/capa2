import Link from "next/link";
import {
  LineChart,
  Users,
  FileText,
  Activity,
  FlaskConical,
  CircleDot,
  Newspaper,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const TICKER = [
  { symbol: "SCOM", change: 1.42 },
  { symbol: "EQTY", change: 0.68 },
  { symbol: "KCB", change: -0.35 },
  { symbol: "AAPL", change: 2.1 },
  { symbol: "NVDA", change: 3.4 },
  { symbol: "VOO", change: 0.52 },
  { symbol: "MSFT", change: -0.18 },
  { symbol: "TSLA", change: -1.9 },
];

const FEATURES = [
  {
    icon: LineChart,
    title: "Real markets",
    copy: "Kenyan, US, and global stocks and ETFs, with the charts and order types a serious trading terminal needs.",
  },
  {
    icon: Activity,
    title: "Market Pulse",
    copy: "See what Capa investors are actually buying and selling this week — aggregated activity, never a recommendation.",
  },
  {
    icon: FileText,
    title: "Investment theses",
    copy: "Publish the reasoning behind a position, not just the trade. Bull and bear cases, tracked over time.",
  },
  {
    icon: Users,
    title: "Investor profiles",
    copy: "Follow investors whose thinking you trust. Verified trades are labeled — opinions are labeled too.",
  },
  {
    icon: CircleDot,
    title: "Investment circles",
    copy: "Private and public groups with shared research, discussion, and simulated group portfolios.",
  },
  {
    icon: FlaskConical,
    title: "Portfolio tools",
    copy: "Time Machine backtests and What-If scenarios — clearly labeled simulations, never guarantees.",
  },
];

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-5 pt-16 pb-14 sm:pt-24 sm:pb-20">
        <div className="max-w-[24ch]">
          <h1
            className="text-[clamp(2.6rem,7vw,5rem)] leading-[1.02] text-ink"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Invest beyond the market.
          </h1>
        </div>
        <p className="mt-6 max-w-[54ch] text-[16.5px] leading-relaxed text-muted">
          Trade, discover, research, and connect with investors across Kenyan and global markets — Capa is where a
          position comes with the reasoning behind it.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/signup">Start investing</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/markets">Explore markets</Link>
          </Button>
        </div>
      </section>

      {/* Ticker strip */}
      <section className="border-y-2 border-line-strong bg-surface-raised py-3">
        <div className="mx-auto flex max-w-6xl gap-8 overflow-x-auto px-5 [scrollbar-width:none]">
          {TICKER.map((t) => {
            const up = t.change >= 0;
            const Icon = up ? ArrowUpRight : ArrowDownRight;
            return (
              <div key={t.symbol} className="flex shrink-0 items-center gap-2 font-tabular text-[13px]">
                <span className="font-semibold text-ink">{t.symbol}</span>
                <span className={`inline-flex items-center gap-0.5 ${up ? "text-gain" : "text-loss"}`}>
                  <Icon className="size-3" strokeWidth={2.5} />
                  {up ? "+" : ""}
                  {t.change.toFixed(2)}%
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <p className="text-[12px] font-bold uppercase tracking-wide text-faint">What you get</p>
        <h2 className="mt-3 max-w-[26ch] text-3xl font-bold text-ink sm:text-4xl">
          See what investors are doing. Understand why. Track what happened next.
        </h2>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-md border-2 border-line-strong bg-surface p-7 shadow-hard-sm">
              <div className="flex size-11 items-center justify-center rounded-md border-2 border-line-strong bg-primary">
                <f.icon className="size-5 text-primary-foreground" strokeWidth={2} />
              </div>
              <h3 className="mt-4 text-[15.5px] font-bold text-ink">{f.title}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{f.copy}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Market Pulse preview */}
      <section className="border-t-2 border-line-strong bg-surface-raised py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-wide text-faint">Market Pulse</p>
            <h2 className="mt-3 text-3xl font-bold text-ink">Aggregated activity, never advice.</h2>
            <p className="mt-4 max-w-[46ch] text-[14.5px] leading-relaxed text-muted">
              Capa surfaces what its own investor base is buying, selling, and discussing — clearly labeled as
              community activity, not a signal to act on.
            </p>
          </div>
          <div className="rounded-md border-2 border-line-strong bg-surface p-6 shadow-hard">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-faint">Based on aggregated user activity</p>
            <div className="mt-4 space-y-4">
              {[
                { symbol: "SCOM", buyers: 1284, growth: "+18%" },
                { symbol: "NVDA", buyers: 846, growth: "+31%" },
                { symbol: "VOO", buyers: 621, growth: "+12%" },
              ].map((row) => (
                <div key={row.symbol} className="flex items-center justify-between">
                  <div>
                    <p className="font-tabular text-[14.5px] font-semibold text-ink">{row.symbol}</p>
                    <p className="text-[12px] text-muted">{row.buyers.toLocaleString()} investors bought this week</p>
                  </div>
                  <span className="font-tabular text-[13px] font-medium text-gain">{row.growth}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Security / trust */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="flex flex-col items-start gap-6 rounded-md border-2 border-line-strong p-8 shadow-hard-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <ShieldCheck className="mt-1 size-7 shrink-0 text-ink" strokeWidth={1.5} />
            <div>
              <h3 className="text-[16px] font-semibold text-ink">Built as a sandbox, honestly labeled</h3>
              <p className="mt-1.5 max-w-[56ch] text-[13.5px] leading-relaxed text-muted">
                Every order today executes against a simulated broker with real market-shaped pricing — no real
                money moves until a licensed broker and payment provider are connected. Historical simulations and
                hypothetical scenarios are always marked as such.
              </p>
            </div>
          </div>
          <Newspaper className="hidden size-16 shrink-0 text-line-strong sm:block" strokeWidth={1} />
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t-2 border-line-strong bg-primary py-20">
        <div className="mx-auto max-w-6xl px-5 text-center">
          <p className="text-4xl text-primary-foreground sm:text-5xl" style={{ fontFamily: "var(--font-script)" }}>
            Open your first position
          </p>
          <h2 className="mt-2 text-3xl font-bold text-primary-foreground sm:text-4xl" style={{ fontFamily: "var(--font-display)" }}>
            with the reasoning already attached.
          </h2>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="!bg-paper !text-ink">
              <Link href="/signup">Start investing</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="!border-primary-foreground !bg-primary !text-primary-foreground">
              <Link href="/markets">Explore markets</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
