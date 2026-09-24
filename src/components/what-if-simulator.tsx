"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { PriceChange } from "@/components/price-change";
import { formatMoney } from "@/lib/money";

interface WhatIfResult {
  currentValue: number;
  projectedValue: number;
  deltaValue: number;
  deltaPercent: number;
  projectedWithContribution12mo: number;
}

export function WhatIfSimulator() {
  const [priceShock, setPriceShock] = useState("-20");
  const [extraContribution, setExtraContribution] = useState("20000");
  const [result, setResult] = useState<WhatIfResult | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    const res = await fetch("/api/simulate/what-if", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceShockPercent: Number(priceShock), extraMonthlyContribution: Number(extraContribution) }),
    });
    setResult(await res.json());
    setLoading(false);
  };

  return (
    <div className="rounded-xl border border-line p-5">
      <h2 className="text-[15px] font-semibold text-ink">What if…?</h2>
      <p className="mt-1 text-[13px] text-muted">Hypothetical scenarios against your current portfolio.</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="wi-shock">Market moves by (%)</Label>
          <Input id="wi-shock" type="number" value={priceShock} onChange={(e) => setPriceShock(e.target.value)} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="wi-contribution">+ Monthly contribution (KES)</Label>
          <Input id="wi-contribution" type="number" value={extraContribution} onChange={(e) => setExtraContribution(e.target.value)} className="mt-1.5" />
        </div>
      </div>

      <Button className="mt-4" size="sm" onClick={run} disabled={loading}>
        {loading ? "Calculating…" : "Run scenario"}
      </Button>

      {result && (
        <div className="mt-5 border-t border-line pt-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Stat label="Current value" value={formatMoney(result.currentValue)} />
            <Stat label="Projected value" value={formatMoney(result.projectedValue)} />
            <Stat label="Change" value={<PriceChange percent={result.deltaPercent} amount={result.deltaValue} size="sm" />} />
          </div>
          <p className="mt-3 text-[13px] text-ink-soft">
            With the extra monthly contribution for 12 months: <strong className="font-tabular">{formatMoney(result.projectedWithContribution12mo)}</strong>
          </p>
          <p className="mt-3 text-[11.5px] text-faint">A hypothetical scenario, not a guaranteed outcome.</p>
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
