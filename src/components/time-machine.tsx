"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { PriceChange } from "@/components/price-change";
import { formatMoney } from "@/lib/money";

interface AssetOption {
  id: string;
  symbol: string;
  name: string;
}

interface TimeMachineResult {
  startingCapital: number;
  totalContributions: number;
  endingValue: number;
  profit: number;
  profitPercent: number;
  comparison: { symbol: string; endingValue: number }[];
}

export function TimeMachine({ assets }: { assets: AssetOption[] }) {
  const [symbol, setSymbol] = useState(assets[0]?.symbol ?? "");
  const [startingAmount, setStartingAmount] = useState("100000");
  const [monthlyContribution, setMonthlyContribution] = useState("10000");
  const [startDate, setStartDate] = useState("2022-01-01");
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [result, setResult] = useState<TimeMachineResult | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    const res = await fetch("/api/simulate/time-machine", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol, startingAmount: Number(startingAmount), monthlyContribution: Number(monthlyContribution), startDate, endDate }),
    });
    setResult(await res.json());
    setLoading(false);
  };

  return (
    <div className="rounded-xl border border-line p-5">
      <h2 className="text-[15px] font-semibold text-ink">Time Machine</h2>
      <p className="mt-1 text-[13px] text-muted">See how a historical investment would have performed — a simulation, not a prediction.</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="tm-symbol">Asset</Label>
          <select
            id="tm-symbol"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="mt-1.5 flex h-10 w-full rounded-md border border-line-strong bg-surface px-3 text-[14px] text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {assets.map((a) => (
              <option key={a.id} value={a.symbol}>
                {a.symbol} — {a.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="tm-amount">Starting amount (KES)</Label>
          <Input id="tm-amount" type="number" value={startingAmount} onChange={(e) => setStartingAmount(e.target.value)} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="tm-start">Start date</Label>
          <Input id="tm-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="tm-end">End date</Label>
          <Input id="tm-end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="tm-monthly">Monthly contribution (KES)</Label>
          <Input id="tm-monthly" type="number" value={monthlyContribution} onChange={(e) => setMonthlyContribution(e.target.value)} className="mt-1.5" />
        </div>
      </div>

      <Button className="mt-4" size="sm" onClick={run} disabled={loading}>
        {loading ? "Simulating…" : "Run simulation"}
      </Button>

      {result && (
        <div className="mt-5 border-t border-line pt-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Stat label="Contributions" value={formatMoney(result.totalContributions)} />
            <Stat label="Ending value" value={formatMoney(result.endingValue)} />
            <Stat label="Profit" value={<PriceChange percent={result.profitPercent} amount={result.profit} size="sm" />} />
          </div>
          {result.comparison.length > 0 && (
            <div className="mt-4">
              <p className="text-[12px] font-semibold uppercase tracking-wide text-faint">Same schedule, other assets</p>
              <div className="mt-2 space-y-1.5">
                {result.comparison.map((c) => (
                  <div key={c.symbol} className="flex justify-between text-[13px]">
                    <span className="text-muted">{c.symbol}</span>
                    <span className="font-tabular text-ink-soft">{formatMoney(c.endingValue)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <p className="mt-4 text-[11.5px] text-faint">
            Historical simulation only. Past performance does not predict future returns.
          </p>
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
