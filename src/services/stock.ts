import { db } from "@/lib/db";
import { getMarketDataProvider } from "./providers/market-data";
import { OrderStatus, TradeReason } from "@/generated/prisma/client";

const REASON_LABEL: Record<TradeReason, string> = {
  LONG_TERM_GROWTH: "Long-term growth",
  DIVIDEND: "Dividend",
  UNDERVALUED: "Undervalued",
  TECHNICAL_SETUP: "Technical setup",
  SHORT_TERM_TRADE: "Short-term trade",
  DIVERSIFICATION: "Diversification",
  OTHER: "Other",
};

export async function getStockPageData(symbolRaw: string) {
  const symbol = symbolRaw.toUpperCase();
  const asset = await db.asset.findUnique({ where: { symbol } });
  if (!asset) return null;

  const provider = getMarketDataProvider();
  const [quote, company, news] = await Promise.all([
    provider.getQuote(symbol),
    provider.getCompany(symbol),
    provider.getNews(symbol),
  ]);

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [buyOrders, sellOrders, holderCount, reasonBreakdown] = await Promise.all([
    db.order.count({ where: { assetId: asset.id, side: "BUY", status: OrderStatus.FILLED, filledAt: { gte: since } } }),
    db.order.count({ where: { assetId: asset.id, side: "SELL", status: OrderStatus.FILLED, filledAt: { gte: since } } }),
    db.holding.count({ where: { assetId: asset.id } }),
    db.order.groupBy({
      by: ["reason"],
      where: { assetId: asset.id, side: "BUY", status: OrderStatus.FILLED, reason: { not: null } },
      _count: { reason: true },
    }),
  ]);

  const totalReasonVotes = reasonBreakdown.reduce((sum, r) => sum + r._count.reason, 0);
  const reasons = reasonBreakdown
    .map((r) => ({
      reason: r.reason as TradeReason,
      label: REASON_LABEL[r.reason as TradeReason],
      percent: totalReasonVotes === 0 ? 0 : Math.round((r._count.reason / totalReasonVotes) * 100),
    }))
    .sort((a, b) => b.percent - a.percent);

  return {
    asset,
    quote: {
      price: quote.price.toNumber(),
      change: quote.change.toNumber(),
      changePercent: quote.changePercent.toNumber(),
      dayHigh: quote.dayHigh.toNumber(),
      dayLow: quote.dayLow.toNumber(),
      volume: quote.volume,
    },
    company: {
      sector: company.sector,
      marketCap: company.marketCap?.toNumber() ?? null,
      peRatio: company.peRatio?.toNumber() ?? null,
      dividendYield: company.dividendYield?.toNumber() ?? null,
      week52High: company.week52High?.toNumber() ?? null,
      week52Low: company.week52Low?.toNumber() ?? null,
      description: company.description,
    },
    news: news.map((n) => ({ ...n, publishedAt: n.publishedAt.toISOString() })),
    community: { buyOrders, sellOrders, holderCount, reasons },
  };
}

export type StockPageData = NonNullable<Awaited<ReturnType<typeof getStockPageData>>>;
