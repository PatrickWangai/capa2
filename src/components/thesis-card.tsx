import Link from "next/link";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/money";

const STATUS_VARIANT: Record<string, "gain" | "loss" | "neutral" | "signal"> = {
  ACTIVE: "signal",
  UPDATED: "signal",
  ACHIEVED: "gain",
  INVALIDATED: "loss",
  CLOSED: "neutral",
};

export function ThesisCard({
  id,
  direction,
  status,
  title,
  entryPrice,
  targetPrice,
  timeHorizon,
  currency,
  symbol,
  authorName,
  authorUsername,
  likeCount,
  followCount,
}: {
  id: string;
  direction: string;
  status: string;
  title: string;
  entryPrice: number;
  targetPrice: number | null;
  timeHorizon: string;
  currency: string;
  symbol: string;
  authorName: string;
  authorUsername: string;
  likeCount: number;
  followCount: number;
}) {
  const Icon = direction === "BULL" ? TrendingUp : TrendingDown;
  return (
    <Link href={`/social/theses/${id}`} className="block rounded-xl border border-line p-5 hover:border-ink">
      <div className="flex items-center justify-between">
        <span className={`flex items-center gap-1.5 text-[12.5px] font-semibold ${direction === "BULL" ? "text-gain" : "text-loss"}`}>
          <Icon className="size-4" /> {direction === "BULL" ? "Bull case" : "Bear case"} · {symbol}
        </span>
        <Badge variant={STATUS_VARIANT[status] ?? "neutral"}>{status}</Badge>
      </div>
      <h3 className="mt-2 text-[15px] font-semibold text-ink">{title}</h3>
      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-[12.5px] text-muted">
        <span>
          Entry <strong className="font-tabular text-ink-soft">{formatMoney(entryPrice, currency)}</strong>
        </span>
        {targetPrice && (
          <span>
            Target <strong className="font-tabular text-ink-soft">{formatMoney(targetPrice, currency)}</strong>
          </span>
        )}
        <span>Horizon {timeHorizon}</span>
      </div>
      <p className="mt-3 text-[12.5px] text-faint">
        by @{authorUsername} ({authorName}) · {likeCount} likes · {followCount} following
      </p>
    </Link>
  );
}
