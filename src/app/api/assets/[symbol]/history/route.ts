import { NextResponse } from "next/server";
import { getMarketDataProvider, type ChartRange } from "@/services/providers/market-data";

const VALID_RANGES: ChartRange[] = ["1D", "1W", "1M", "3M", "6M", "1Y", "5Y", "MAX"];

export async function GET(request: Request, { params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await params;
  const url = new URL(request.url);
  const rangeParam = url.searchParams.get("range") ?? "1M";
  const range = (VALID_RANGES.includes(rangeParam as ChartRange) ? rangeParam : "1M") as ChartRange;

  const provider = getMarketDataProvider();
  const candles = await provider.getHistoricalPrices(symbol.toUpperCase(), range);

  return NextResponse.json(candles.map((c) => ({ time: c.time, close: c.close })));
}
