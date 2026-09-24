"use client";

import { useEffect, useRef, useState } from "react";
import { createChart, AreaSeries, type IChartApi, type ISeriesApi, type UTCTimestamp } from "lightweight-charts";
import { cn } from "@/lib/utils";

const RANGES = ["1D", "1W", "1M", "3M", "6M", "1Y"] as const;
type Range = (typeof RANGES)[number];

export function PortfolioChart({ isGain }: { isGain: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Area"> | null>(null);
  const [range, setRange] = useState<Range>("1M");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;
    const chart = createChart(containerRef.current, {
      layout: { background: { color: "transparent" }, textColor: "#66655d", fontFamily: "var(--font-sans)" },
      grid: { horzLines: { color: "#e7e5df" }, vertLines: { visible: false } },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false },
      height: 220,
      autoSize: true,
    });
    const series = chart.addSeries(AreaSeries, {
      lineColor: isGain ? "#0e8f5f" : "#d33d2c",
      topColor: isGain ? "rgba(14,143,95,0.16)" : "rgba(211,61,44,0.16)",
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
  }, [isGain]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/portfolio/history?range=${range}`)
      .then((r) => r.json())
      .then((data: { time: number; value: number }[]) => {
        if (cancelled || !seriesRef.current) return;
        seriesRef.current.setData(data.map((d) => ({ time: d.time as UTCTimestamp, value: d.value })));
        chartRef.current?.timeScale().fitContent();
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [range]);

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
      <div className={cn("relative mt-1 h-[220px] w-full transition-opacity", loading && "opacity-50")}>
        <div ref={containerRef} className="size-full" />
      </div>
    </div>
  );
}
