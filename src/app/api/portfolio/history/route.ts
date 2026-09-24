import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getMarketDataProvider, type ChartRange } from "@/services/providers/market-data";
import { convertToBase } from "@/lib/money";
import Decimal from "decimal.js";

const VALID_RANGES: ChartRange[] = ["1D", "1W", "1M", "3M", "6M", "1Y"];

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const rangeParam = url.searchParams.get("range") ?? "1M";
  const range = (VALID_RANGES.includes(rangeParam as ChartRange) ? rangeParam : "1M") as ChartRange;

  const [holdings, wallet] = await Promise.all([
    db.holding.findMany({ where: { userId: session.user.id }, include: { asset: true } }),
    db.wallet.findUniqueOrThrow({ where: { userId: session.user.id } }),
  ]);

  const cash = new Decimal(wallet.cashBalance.toString()).toNumber();
  if (holdings.length === 0) {
    return NextResponse.json([{ time: Math.floor(Date.now() / 1000), value: cash }]);
  }

  const provider = getMarketDataProvider();
  const perHolding = await Promise.all(
    holdings.map(async (h) => {
      const candles = await provider.getHistoricalPrices(h.asset.symbol, range);
      const qty = new Decimal(h.quantity.toString()).toNumber();
      return candles.map((c) => ({ time: c.time, value: convertToBase(c.close * qty, h.asset.currency).toNumber() }));
    }),
  );

  const length = Math.min(...perHolding.map((series) => series.length));
  const combined = Array.from({ length }, (_, i) => {
    const time = perHolding[0][i].time;
    const value = perHolding.reduce((sum, series) => sum + series[i].value, cash);
    return { time, value };
  });

  return NextResponse.json(combined);
}
