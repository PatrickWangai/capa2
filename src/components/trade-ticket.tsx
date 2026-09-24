"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/money";
import { CheckCircle2 } from "lucide-react";

interface AssetOption {
  id: string;
  symbol: string;
  name: string;
  currency: string;
}

interface Quote {
  price: number;
  changePercent: number;
}

const REASONS: { value: string; label: string }[] = [
  { value: "LONG_TERM_GROWTH", label: "Long-term growth" },
  { value: "DIVIDEND", label: "Dividend" },
  { value: "UNDERVALUED", label: "Undervalued" },
  { value: "TECHNICAL_SETUP", label: "Technical setup" },
  { value: "SHORT_TERM_TRADE", label: "Short-term trade" },
  { value: "DIVERSIFICATION", label: "Diversification" },
  { value: "OTHER", label: "Other" },
];

export function TradeTicket({
  assets,
  initialAssetId,
  initialSide,
  buyingPower,
}: {
  assets: AssetOption[];
  initialAssetId: string;
  initialSide: "BUY" | "SELL";
  buyingPower: number;
}) {
  const router = useRouter();
  const [assetId, setAssetId] = useState(initialAssetId);
  const [side, setSide] = useState<"BUY" | "SELL">(initialSide);
  const [orderType, setOrderType] = useState<"MARKET" | "LIMIT">("MARKET");
  const [quantity, setQuantity] = useState("");
  const [limitPrice, setLimitPrice] = useState("");
  const [reason, setReason] = useState<string | undefined>(undefined);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [step, setStep] = useState<"form" | "review" | "success">("form");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<{ id: string; symbol: string; tradeId: string | null } | null>(null);
  const [shared, setShared] = useState(false);
  const [sharing, setSharing] = useState(false);

  const asset = assets.find((a) => a.id === assetId) ?? assets[0];

  useEffect(() => {
    if (!asset) return;
    let cancelled = false;
    fetch(`/api/assets/${asset.symbol}`)
      .then((r) => r.json())
      .then((data) => !cancelled && setQuote({ price: data.price, changePercent: data.changePercent }));
    return () => {
      cancelled = true;
    };
  }, [asset]);

  const qty = Number(quantity) || 0;
  const referencePrice = orderType === "LIMIT" && Number(limitPrice) > 0 ? Number(limitPrice) : quote?.price ?? 0;
  const estimatedTotal = qty * referencePrice;
  const fee = Math.max(estimatedTotal * 0.005, qty > 0 ? 10 : 0);
  const totalWithFee = estimatedTotal + fee;
  const canReview =
    !!asset && qty > 0 && (orderType === "MARKET" || Number(limitPrice) > 0) && (side === "SELL" || totalWithFee <= buyingPower);

  const insufficientFunds = side === "BUY" && qty > 0 && totalWithFee > buyingPower;

  const submit = async () => {
    if (!asset) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetId: asset.id,
          side,
          type: orderType,
          quantity: qty,
          limitPrice: orderType === "LIMIT" ? Number(limitPrice) : undefined,
          reason,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not place order.");
        setStep("form");
        return;
      }
      setPlacedOrder({ id: data.id, symbol: asset.symbol, tradeId: data.tradeId ?? null });
      setStep("success");
      router.refresh();
    } catch {
      setError("Network error — please try again.");
      setStep("form");
    } finally {
      setSubmitting(false);
    }
  };

  if (step === "success" && placedOrder) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-7 text-center">
        <CheckCircle2 className="mx-auto size-10 text-gain" strokeWidth={1.5} />
        <h2 className="mt-3 text-[17px] font-semibold text-ink">Order submitted</h2>
        <p className="mt-1 font-tabular text-[14px] text-muted">
          {qty} {placedOrder.symbol}
        </p>
        <div className="mt-6 flex justify-center gap-2.5">
          <Button asChild variant="outline">
            <Link href="/orders">View Order</Link>
          </Button>
          <Button asChild>
            <Link href="/portfolio">View Portfolio</Link>
          </Button>
        </div>
        {placedOrder.tradeId && (
          <div className="mt-4 border-t border-line pt-4">
            <Button
              size="sm"
              variant="outline"
              disabled={shared || sharing}
              onClick={async () => {
                setSharing(true);
                await fetch(`/api/trades/${placedOrder.tradeId}/share`, { method: "POST" });
                setSharing(false);
                setShared(true);
              }}
            >
              {shared ? "Shared to your feed" : sharing ? "Sharing…" : "Share as verified trade"}
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (step === "review") {
    return (
      <div className="rounded-2xl border border-line bg-surface p-7">
        <h2 className="text-[13px] font-semibold uppercase tracking-wide text-faint">Confirm order</h2>
        <p className="mt-3 text-[17px] font-semibold text-ink">
          {side === "BUY" ? "Buy" : "Sell"} {qty} {asset?.symbol}
        </p>
        <dl className="mt-5 space-y-2.5 text-[13.5px]">
          <Row label="Order type" value={orderType} />
          <Row label="Estimated total" value={formatMoney(estimatedTotal, asset?.currency)} />
          <Row label="Estimated fee" value={formatMoney(fee, asset?.currency)} />
          <Row label="Total" value={formatMoney(totalWithFee, asset?.currency)} strong />
        </dl>
        {error && <p className="mt-3 text-[13px] text-loss">{error}</p>}
        <div className="mt-6 flex gap-2.5">
          <Button variant="outline" className="flex-1" onClick={() => setStep("form")} disabled={submitting}>
            Back
          </Button>
          <Button className="flex-1" onClick={submit} disabled={submitting}>
            {submitting ? "Placing…" : `Confirm ${side === "BUY" ? "Buy" : "Sell"}`}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-surface p-6">
      <div className="grid grid-cols-2 rounded-full bg-surface-raised p-1">
        {(["BUY", "SELL"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSide(s)}
            className={cn(
              "rounded-full py-2 text-[13.5px] font-semibold transition-colors",
              side === s ? (s === "BUY" ? "bg-ink text-paper" : "bg-loss text-white") : "text-muted",
            )}
          >
            {s === "BUY" ? "Buy" : "Sell"}
          </button>
        ))}
      </div>

      <div className="mt-5">
        <Label htmlFor="asset">Asset</Label>
        <select
          id="asset"
          value={assetId}
          onChange={(e) => setAssetId(e.target.value)}
          className="mt-1.5 flex h-10 w-full rounded-md border border-line-strong bg-surface px-3 text-[14px] text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {assets.map((a) => (
            <option key={a.id} value={a.id}>
              {a.symbol} — {a.name}
            </option>
          ))}
        </select>
        {quote && (
          <p className="mt-1.5 font-tabular text-[13px] text-muted">
            {formatMoney(quote.price, asset?.currency)}{" "}
            <span className={quote.changePercent >= 0 ? "text-gain" : "text-loss"}>
              {quote.changePercent >= 0 ? "+" : ""}
              {quote.changePercent.toFixed(2)}%
            </span>
          </p>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="orderType">Order type</Label>
          <select
            id="orderType"
            value={orderType}
            onChange={(e) => setOrderType(e.target.value as "MARKET" | "LIMIT")}
            className="mt-1.5 flex h-10 w-full rounded-md border border-line-strong bg-surface px-3 text-[14px] text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="MARKET">Market</option>
            <option value="LIMIT">Limit</option>
          </select>
        </div>
        <div>
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            min="0"
            step="any"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="mt-1.5"
            placeholder="0"
          />
        </div>
      </div>

      {orderType === "LIMIT" && (
        <div className="mt-4">
          <Label htmlFor="limitPrice">Limit price</Label>
          <Input
            id="limitPrice"
            type="number"
            min="0"
            step="any"
            value={limitPrice}
            onChange={(e) => setLimitPrice(e.target.value)}
            className="mt-1.5"
            placeholder="0.00"
          />
        </div>
      )}

      {side === "BUY" && (
        <div className="mt-4">
          <Label htmlFor="reason">Why are you buying? (optional)</Label>
          <select
            id="reason"
            value={reason ?? ""}
            onChange={(e) => setReason(e.target.value || undefined)}
            className="mt-1.5 flex h-10 w-full rounded-md border border-line-strong bg-surface px-3 text-[14px] text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Prefer not to say</option>
            {REASONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <dl className="mt-5 space-y-2 border-t border-line pt-4 text-[13px]">
        <Row label="Estimated total" value={formatMoney(estimatedTotal, asset?.currency)} />
        <Row label="Estimated fee" value={formatMoney(fee, asset?.currency)} />
        <Row label="Buying power" value={formatMoney(buyingPower)} />
      </dl>

      {insufficientFunds && <p className="mt-3 text-[13px] text-loss">Not enough buying power for this order.</p>}
      {error && <p className="mt-3 text-[13px] text-loss">{error}</p>}

      <Button className="mt-5 w-full" size="lg" disabled={!canReview} onClick={() => setStep("review")}>
        Review Order
      </Button>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted">{label}</dt>
      <dd className={cn("font-tabular", strong ? "font-semibold text-ink" : "text-ink-soft")}>{value}</dd>
    </div>
  );
}
