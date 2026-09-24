import Link from "next/link";
import { formatMoney } from "@/lib/money";
import { PriceChange } from "@/components/price-change";

export function MarketPulseCard({
  symbol,
  name,
  price,
  changePercent,
  currency,
  metricLabel,
  metricValue,
}: {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  currency: string;
  metricLabel: string;
  metricValue: string;
}) {
  return (
    <Link href={`/stock/${symbol}`} className="flex items-center justify-between gap-4 border-b border-line py-3.5 last:border-none hover:bg-surface-raised">
      <div className="min-w-0">
        <p className="font-tabular text-[14px] font-semibold text-ink">{symbol}</p>
        <p className="truncate text-[12px] text-muted">{name}</p>
      </div>
      <div className="text-center">
        <p className="font-tabular text-[13.5px] font-medium text-ink">{metricValue}</p>
        <p className="text-[11px] text-faint">{metricLabel}</p>
      </div>
      <div className="text-right">
        <p className="font-tabular text-[13.5px] text-ink">{formatMoney(price, currency)}</p>
        <PriceChange percent={changePercent} size="sm" className="justify-end" />
      </div>
    </Link>
  );
}
