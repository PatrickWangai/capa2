"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatPercent } from "@/lib/money";

interface Insights {
  totalValue: number;
  topHoldings: { symbol: string; name: string; allocationPercent: number }[];
  sectorConcentration: { sector: string; percent: number }[];
  geographicExposure: { region: string; percent: number }[];
  concentrationRisk: string | null;
  recentPerformanceNote: string;
}

export function ExplainPortfolio() {
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(false);

  const explain = async () => {
    setLoading(true);
    const res = await fetch("/api/portfolio/explain");
    setInsights(await res.json());
    setLoading(false);
  };

  if (!insights) {
    return (
      <Button variant="outline" size="sm" onClick={explain} disabled={loading}>
        {loading ? "Analyzing…" : "Explain my portfolio"}
      </Button>
    );
  }

  return (
    <div className="rounded-xl border border-line p-5">
      <h3 className="text-[14px] font-semibold text-ink">Portfolio explanation</h3>
      <p className="mt-2 text-[13.5px] text-ink-soft">{insights.recentPerformanceNote}</p>

      {insights.concentrationRisk && (
        <p className="mt-3 rounded-lg bg-loss-tint p-3 text-[13px] text-loss">{insights.concentrationRisk}</p>
      )}

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-[11.5px] font-semibold uppercase tracking-wide text-faint">Top holdings</p>
          <div className="mt-2 space-y-1.5">
            {insights.topHoldings.map((h) => (
              <div key={h.symbol} className="flex justify-between text-[13px]">
                <span className="text-ink-soft">{h.symbol}</span>
                <span className="font-tabular text-muted">{formatPercent(h.allocationPercent)}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[11.5px] font-semibold uppercase tracking-wide text-faint">Geographic exposure</p>
          <div className="mt-2 space-y-1.5">
            {insights.geographicExposure.map((g) => (
              <div key={g.region} className="flex justify-between text-[13px]">
                <span className="text-ink-soft">{g.region}</span>
                <span className="font-tabular text-muted">{formatPercent(g.percent)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {insights.sectorConcentration.length > 0 && (
        <div className="mt-4">
          <p className="text-[11.5px] font-semibold uppercase tracking-wide text-faint">Sector concentration</p>
          <div className="mt-2 space-y-1.5">
            {insights.sectorConcentration.map((s) => (
              <div key={s.sector} className="flex justify-between text-[13px]">
                <span className="text-ink-soft">{s.sector}</span>
                <span className="font-tabular text-muted">{formatPercent(s.percent)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="mt-4 text-[11.5px] text-faint">Informational only — not personalized investment advice.</p>
    </div>
  );
}
