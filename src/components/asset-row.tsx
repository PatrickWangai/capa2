import Link from "next/link";
import { PriceChange } from "@/components/price-change";
import { formatMoney } from "@/lib/money";

export function AssetRow({
  symbol,
  name,
  price,
  changePercent,
  currency,
  meta,
  href,
}: {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  currency: string;
  meta?: React.ReactNode;
  href?: string;
}) {
  const content = (
    <div className="flex items-center justify-between gap-4 px-1 py-3.5">
      <div className="min-w-0">
        <p className="font-tabular text-[14.5px] font-semibold text-ink">{symbol}</p>
        <p className="truncate text-[12.5px] text-muted">{name}</p>
      </div>
      <div className="flex shrink-0 items-center gap-4">
        {meta}
        <div className="text-right">
          <p className="font-tabular text-[14.5px] font-medium text-ink">{formatMoney(price, currency)}</p>
          <PriceChange percent={changePercent} size="sm" className="justify-end" />
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block border-b border-line last:border-none hover:bg-surface-raised">
        {content}
      </Link>
    );
  }
  return <div className="border-b border-line last:border-none">{content}</div>;
}
