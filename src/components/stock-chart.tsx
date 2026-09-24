"use client";

import { useEffect, useRef, useState } from "react";
import { createChart, AreaSeries, type IChartApi, type ISeriesApi, type UTCTimestamp } from "lightweight-charts";
import type { ChartRange } from "@/services/providers/market-data";
import { cn } from "@/lib/utils";

const RANGES: ChartRange[] = ["1D", "1W", "1M", "3M", "6M", "1Y", "5Y", "MAX"];

interface CandlePoint {
  time: number;
  close: number;
}

export function StockChart({ symbol, initialRange = "1M" }: { symbol: string; initialRange?: ChartRange }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Area"> | null>(null);
  const [range, setRange] = useState<ChartRange>(initialRange);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;
    const isGain = true;
    const chart = createChart(containerRef.current, {
      layout: { background: { color: "transparent" }, textColor: "#66655d", fontFamily: "var(--font-sans)" },
      grid: { horzLines: { color: "#e7e5df" }, vertLines: { visible: false } },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false, timeVisible: range === "1D" },
      crosshair: { horzLine: { labelBackgroundColor: "#0a0a0a" }, vertLine: { labelBackgroundColor: "#0a0a0a" } },
      height: 320,
      autoSize: true,
    });
    const series = chart.addSeries(AreaSeries, {
      lineColor: isGain ? "#0e8f5f" : "#d33d2c",
      topColor: isGain ? "rgba(14,143,95,0.18)" : "rgba(211,61,44,0.18)",
      bottomColor: "rgba(14,143,95,0.0)",
      lineWidth: 2,
      priceLineVisible: false,
    });
    chartRef.current = chart;
    seriesRef.current = series;

    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/assets/${symbol}/history?range=${range}`);
        const data: CandlePoint[] = await res.json();
        if (cancelled || !seriesRef.current) return;
        seriesRef.current.setData(data.map((d) => ({ time: d.time as UTCTimestamp, value: d.close })));
        chartRef.current?.timeScale().fitContent();
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [symbol, range]);

  return (
    <div>
      <div className="flex items-center gap-1">
        {RANGES.map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={cn(
              "rounded-md px-2.5 py-1 text-[12.5px] font-medium transition-colors",
              range === r ? "bg-surface-raised text-ink" : "text-faint hover:text-ink-soft",
            )}
          >
            {r}
          </button>
        ))}
      </div>
      <div className={cn("relative mt-2 h-[320px] w-full transition-opacity", loading && "opacity-50")}>
        <div ref={containerRef} className="size-full" />
      </div>
    </div>
  );
}
