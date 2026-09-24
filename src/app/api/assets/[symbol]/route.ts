import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getMarketDataProvider } from "@/services/providers/market-data";

export async function GET(_request: Request, { params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await params;
  const asset = await db.asset.findUnique({ where: { symbol: symbol.toUpperCase() } });
  if (!asset) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const provider = getMarketDataProvider();
  const quote = await provider.getQuote(asset.symbol);

  return NextResponse.json({
    id: asset.id,
    symbol: asset.symbol,
    name: asset.name,
    currency: asset.currency,
    price: quote.price.toNumber(),
    changePercent: quote.changePercent.toNumber(),
  });
}
