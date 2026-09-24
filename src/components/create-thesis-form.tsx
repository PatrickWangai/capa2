"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface AssetOption {
  id: string;
  symbol: string;
  name: string;
}

const REASONS = [
  { value: "LONG_TERM_GROWTH", label: "Long-term growth" },
  { value: "DIVIDEND", label: "Dividend" },
  { value: "UNDERVALUED", label: "Undervalued" },
  { value: "TECHNICAL_SETUP", label: "Technical setup" },
  { value: "SHORT_TERM_TRADE", label: "Short-term trade" },
  { value: "DIVERSIFICATION", label: "Diversification" },
  { value: "OTHER", label: "Other" },
];

export function CreateThesisForm({ assets, defaultAssetId }: { assets: AssetOption[]; defaultAssetId?: string }) {
  const router = useRouter();
  const [assetId, setAssetId] = useState(defaultAssetId ?? assets[0]?.id ?? "");
  const [direction, setDirection] = useState<"BULL" | "BEAR">("BULL");
  const [title, setTitle] = useState("");
  const [entryPrice, setEntryPrice] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [timeHorizon, setTimeHorizon] = useState("12 months");
  const [reason, setReason] = useState("LONG_TERM_GROWTH");
  const [body, setBody] = useState("");
  const [riskFactors, setRiskFactors] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/theses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        assetId,
        direction,
        title,
        entryPrice: Number(entryPrice),
        targetPrice: targetPrice ? Number(targetPrice) : undefined,
        timeHorizon,
        reason,
        body,
        riskFactors: riskFactors || undefined,
      }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error ?? "Could not publish thesis.");
      return;
    }
    router.push(`/social/theses/${data.id}`);
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 rounded-full bg-surface-raised p-1">
        {(["BULL", "BEAR"] as const).map((d) => (
          <button
            key={d}
            onClick={() => setDirection(d)}
            className={cn(
              "rounded-full py-2 text-[13.5px] font-semibold transition-colors",
              direction === d ? (d === "BULL" ? "bg-gain text-white" : "bg-loss text-white") : "text-muted",
            )}
          >
            {d === "BULL" ? "Bull case" : "Bear case"}
          </button>
        ))}
      </div>

      <div>
        <Label htmlFor="thesis-asset">Asset</Label>
        <select
          id="thesis-asset"
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
      </div>

      <div>
        <Label htmlFor="thesis-title">Title</Label>
        <Input id="thesis-title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1.5" placeholder="e.g. Dividend + long-term growth" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="thesis-entry">Entry price</Label>
          <Input id="thesis-entry" type="number" value={entryPrice} onChange={(e) => setEntryPrice(e.target.value)} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="thesis-target">Target price (optional)</Label>
          <Input id="thesis-target" type="number" value={targetPrice} onChange={(e) => setTargetPrice(e.target.value)} className="mt-1.5" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="thesis-horizon">Time horizon</Label>
          <Input id="thesis-horizon" value={timeHorizon} onChange={(e) => setTimeHorizon(e.target.value)} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="thesis-reason">Reason</Label>
          <select
            id="thesis-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-1.5 flex h-10 w-full rounded-md border border-line-strong bg-surface px-3 text-[14px] text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {REASONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <Label htmlFor="thesis-body">Thesis</Label>
        <textarea
          id="thesis-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={6}
          placeholder="I believe…"
          className="mt-1.5 w-full resize-none rounded-md border border-line-strong bg-surface p-3 text-[14px] text-ink placeholder:text-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div>
        <Label htmlFor="thesis-risk">Risk factors (optional)</Label>
        <textarea
          id="thesis-risk"
          value={riskFactors}
          onChange={(e) => setRiskFactors(e.target.value)}
          rows={3}
          className="mt-1.5 w-full resize-none rounded-md border border-line-strong bg-surface p-3 text-[14px] text-ink placeholder:text-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {error && <p className="text-[13px] text-loss">{error}</p>}

      <Button className="w-full" disabled={submitting || !title || !entryPrice || !body} onClick={submit}>
        {submitting ? "Publishing…" : "Publish thesis"}
      </Button>
    </div>
  );
}
