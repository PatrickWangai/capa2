"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PriceChange } from "@/components/price-change";
import { formatMoney } from "@/lib/money";

interface WatchlistItem {
  assetId: string;
  symbol: string;
  name: string;
  currency: string;
  price: number;
  changePercent: number;
}

interface AssetSearchResult {
  id: string;
  symbol: string;
  name: string;
}

export function WatchlistManager({ initialItems }: { initialItems: WatchlistItem[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AssetSearchResult[]>([]);
  const [isPending, startTransition] = useTransition();

  const search = async (value: string) => {
    setQuery(value);
    if (value.trim().length < 1) {
      setResults([]);
      return;
    }
    const res = await fetch(`/api/assets?search=${encodeURIComponent(value)}`);
    setResults(await res.json());
  };

  const add = (asset: AssetSearchResult) => {
    startTransition(async () => {
      await fetch("/api/watchlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetId: asset.id }),
      });
      setQuery("");
      setResults([]);
      router.refresh();
    });
  };

  const remove = (assetId: string) => {
    setItems((prev) => prev.filter((i) => i.assetId !== assetId));
    startTransition(async () => {
      await fetch(`/api/watchlists/${assetId}`, { method: "DELETE" });
      router.refresh();
    });
  };

  return (
    <div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-faint" />
        <Input
          value={query}
          onChange={(e) => search(e.target.value)}
          placeholder="Add a symbol or company…"
          className="pl-9"
        />
        {results.length > 0 && (
          <div className="absolute z-10 mt-1.5 w-full rounded-md border-2 border-line-strong bg-surface shadow-hard">
            {results.map((r) => (
              <button
                key={r.id}
                onClick={() => add(r)}
                disabled={isPending}
                className="flex w-full items-center justify-between px-3.5 py-2.5 text-left text-[13.5px] hover:bg-surface-raised"
              >
                <span className="font-tabular font-semibold text-ink">{r.symbol}</span>
                <span className="truncate text-muted">{r.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 rounded-md border-2 border-line-strong">
        {items.length === 0 ? (
          <p className="p-8 text-center text-[13.5px] text-muted">Your watchlist is empty — search above to add one.</p>
        ) : (
          <div className="px-4">
            {items.map((item) => (
              <div key={item.assetId} className="flex items-center justify-between gap-4 border-b border-line py-3.5 last:border-none">
                <Link href={`/stock/${item.symbol}`} className="min-w-0 flex-1">
                  <p className="font-tabular text-[14.5px] font-semibold text-ink">{item.symbol}</p>
                  <p className="truncate text-[12.5px] text-muted">{item.name}</p>
                </Link>
                <div className="text-right">
                  <p className="font-tabular text-[14px] font-medium text-ink">{formatMoney(item.price, item.currency)}</p>
                  <PriceChange percent={item.changePercent} size="sm" className="justify-end" />
                </div>
                <button
                  onClick={() => remove(item.assetId)}
                  className="text-faint hover:text-loss"
                  aria-label={`Remove ${item.symbol} from watchlist`}
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
