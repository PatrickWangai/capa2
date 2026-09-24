import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { TrendingUp, TrendingDown } from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getThesis } from "@/services/theses";
import { getMarketDataProvider } from "@/services/providers/market-data";
import { Badge } from "@/components/ui/badge";
import { ThesisFollowButton } from "@/components/thesis-follow-button";
import { PriceChange } from "@/components/price-change";
import { formatMoney } from "@/lib/money";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const thesis = await getThesis(id);
  return { title: thesis?.title ?? "Thesis" };
}

export default async function ThesisDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [thesis, session] = await Promise.all([getThesis(id), auth()]);
  if (!thesis) notFound();

  const provider = getMarketDataProvider();
  const quote = await provider.getQuote(thesis.asset.symbol);
  const entryPrice = Number(thesis.entryPrice);
  const currentPrice = quote.price.toNumber();
  const changeSinceEntry = ((currentPrice - entryPrice) / entryPrice) * 100;
  const isFollowing = session?.user
    ? !!(await db.thesisFollow.findUnique({ where: { userId_thesisId: { userId: session.user.id, thesisId: id } } }))
    : false;

  const Icon = thesis.direction === "BULL" ? TrendingUp : TrendingDown;

  return (
    <div className="mx-auto max-w-2xl px-5 py-8">
      <Link href={`/stock/${thesis.asset.symbol}`} className="text-[13px] font-medium text-signal">
        ← {thesis.asset.symbol} · {thesis.asset.name}
      </Link>

      <div className="mt-3 flex items-center justify-between">
        <span className={`flex items-center gap-1.5 text-[13.5px] font-semibold ${thesis.direction === "BULL" ? "text-gain" : "text-loss"}`}>
          <Icon className="size-4" /> {thesis.direction === "BULL" ? "Bull case" : "Bear case"}
        </span>
        <Badge>{thesis.status}</Badge>
      </div>

      <h1 className="mt-2 text-2xl font-bold text-ink">{thesis.title}</h1>
      <p className="mt-1 text-[13px] text-muted">
        by{" "}
        <Link href={`/profile/${thesis.user.username}`} className="font-medium text-ink hover:underline">
          {thesis.user.name}
        </Link>{" "}
        · {new Date(thesis.createdAt).toLocaleDateString()}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-line p-5 sm:grid-cols-4">
        <Stat label="Entry" value={formatMoney(entryPrice, thesis.asset.currency)} />
        <Stat label="Current" value={formatMoney(currentPrice, thesis.asset.currency)} />
        <Stat label="Since entry" value={<PriceChange percent={changeSinceEntry} size="sm" />} />
        {thesis.targetPrice && <Stat label="Target" value={formatMoney(Number(thesis.targetPrice), thesis.asset.currency)} />}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-[13px] text-muted">
          {thesis.followCount} following · {thesis.timeHorizon} · {thesis.reason.replaceAll("_", " ").toLowerCase()}
        </p>
        {session?.user && <ThesisFollowButton thesisId={id} initialFollowing={isFollowing} />}
      </div>

      <div className="mt-6">
        <h2 className="text-[13px] font-semibold uppercase tracking-wide text-faint">Thesis</h2>
        <p className="mt-2 whitespace-pre-wrap text-[14.5px] leading-relaxed text-ink-soft">{thesis.body}</p>
      </div>

      {thesis.riskFactors && (
        <div className="mt-6">
          <h2 className="text-[13px] font-semibold uppercase tracking-wide text-faint">Risk factors</h2>
          <p className="mt-2 whitespace-pre-wrap text-[14px] leading-relaxed text-ink-soft">{thesis.riskFactors}</p>
        </div>
      )}

      {thesis.versions.length > 0 && (
        <div className="mt-6">
          <h2 className="text-[13px] font-semibold uppercase tracking-wide text-faint">Previous versions</h2>
          <div className="mt-2 space-y-3">
            {thesis.versions.map((v) => (
              <div key={v.id} className="rounded-lg border border-line p-3">
                <p className="text-[11.5px] text-faint">{new Date(v.createdAt).toLocaleString()}</p>
                <p className="mt-1 whitespace-pre-wrap text-[13px] text-muted">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-faint">{label}</p>
      <div className="mt-1 font-tabular text-[14.5px] font-medium text-ink">{value}</div>
    </div>
  );
}
