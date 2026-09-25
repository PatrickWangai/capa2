import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { generateMarketBrief } from "@/services/market-brief";

export const metadata: Metadata = { title: "Market Brief" };

export default async function BriefingPage() {
  const session = await auth();
  const brief = await generateMarketBrief(session!.user.id);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "GOOD MORNING" : hour < 18 ? "GOOD AFTERNOON" : "GOOD EVENING";

  return (
    <div className="mx-auto max-w-2xl px-5 py-8">
      <p className="text-[12px] font-semibold uppercase tracking-wide text-faint">{greeting}</p>
      <h1 className="mt-1 text-2xl font-bold text-ink">{brief.summary}</h1>

      {brief.highlights.length > 0 && (
        <div className="mt-6 space-y-4">
          {brief.highlights.map((h, i) => (
            <div key={i} className="rounded-md border-2 border-line-strong shadow-hard-sm p-4">
              <Link href={`/stock/${h.symbol}`} className="font-tabular text-[14px] font-semibold text-ink hover:underline">
                {h.symbol}
              </Link>
              <p className="mt-1 text-[14px] text-ink-soft">{h.headline}</p>
              <p className="mt-1 text-[12.5px] text-faint">Why it matters: {h.why}</p>
            </div>
          ))}
        </div>
      )}

      <p className="mt-6 text-[12px] text-faint">Generated {new Date(brief.generatedAt).toLocaleString()} from your holdings, watchlist, and followed theses.</p>
    </div>
  );
}
