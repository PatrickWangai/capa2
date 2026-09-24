import type { Metadata } from "next";
import Link from "next/link";
import { listTheses } from "@/services/theses";
import { ThesisCard } from "@/components/thesis-card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Investment Theses" };

export default async function ThesesPage() {
  const theses = await listTheses();

  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">Investment Theses</h1>
        <Button asChild size="sm">
          <Link href="/social/theses/new">Publish a thesis</Link>
        </Button>
      </div>

      {theses.length === 0 ? (
        <p className="mt-10 text-center text-[13.5px] text-muted">No theses published yet — be the first.</p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {theses.map((t) => (
            <ThesisCard
              key={t.id}
              id={t.id}
              direction={t.direction}
              status={t.status}
              title={t.title}
              entryPrice={Number(t.entryPrice)}
              targetPrice={t.targetPrice ? Number(t.targetPrice) : null}
              timeHorizon={t.timeHorizon}
              currency={t.asset.currency}
              symbol={t.asset.symbol}
              authorName={t.user.name}
              authorUsername={t.user.username}
              likeCount={t.likeCount}
              followCount={t.followCount}
            />
          ))}
        </div>
      )}
    </div>
  );
}
