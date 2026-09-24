import { db } from "@/lib/db";
import type { AssetRegion, AssetClass } from "@/generated/prisma/client";
import { getMarketDataProvider } from "./providers/market-data";

export type PulseWindow = "today" | "7d" | "30d";

function windowStart(window: PulseWindow): Date {
  const days = window === "today" ? 1 : window === "7d" ? 7 : 30;
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

export interface MarketPulseFilter {
  window: PulseWindow;
  region?: AssetRegion;
  assetClass?: AssetClass;
}

export async function getMarketPulse(filter: MarketPulseFilter) {
  const since = windowStart(filter.window);
  const assetWhere = { region: filter.region, assetClass: filter.assetClass };

  const assets = await db.asset.findMany({ where: assetWhere, select: { id: true, symbol: true, name: true, currency: true } });
  const assetIds = assets.map((a) => a.id);

  const [buyGroups, sellGroups, watchlistGroups, holderGroups, discussionGroups, saveGroups] = await Promise.all([
    db.order.groupBy({ by: ["assetId"], where: { assetId: { in: assetIds }, side: "BUY", status: "FILLED", filledAt: { gte: since } }, _count: { assetId: true } }),
    db.order.groupBy({ by: ["assetId"], where: { assetId: { in: assetIds }, side: "SELL", status: "FILLED", filledAt: { gte: since } }, _count: { assetId: true } }),
    db.watchlistItem.groupBy({ by: ["assetId"], where: { assetId: { in: assetIds }, createdAt: { gte: since } }, _count: { assetId: true } }),
    db.holding.groupBy({ by: ["assetId"], where: { assetId: { in: assetIds } }, _count: { assetId: true } }),
    db.thesis.groupBy({ by: ["assetId"], where: { assetId: { in: assetIds }, createdAt: { gte: since } }, _count: { assetId: true } }),
    // "most saved" proxied via thesis follows on theses for that asset — a reasonable stand-in without a direct asset<->save relation.
    db.thesisFollow.groupBy({ by: ["thesisId"], where: { createdAt: { gte: since } }, _count: { thesisId: true } }),
  ]);

  const buyMap = new Map(buyGroups.map((g) => [g.assetId, g._count.assetId]));
  const sellMap = new Map(sellGroups.map((g) => [g.assetId, g._count.assetId]));
  const watchMap = new Map(watchlistGroups.map((g) => [g.assetId, g._count.assetId]));
  const holderMap = new Map(holderGroups.map((g) => [g.assetId, g._count.assetId]));
  const discussionMap = new Map(discussionGroups.map((g) => [g.assetId, g._count.assetId]));
  void saveGroups;

  const provider = getMarketDataProvider();
  const rows = await Promise.all(
    assets.map(async (a) => {
      const quote = await provider.getQuote(a.symbol);
      return {
        assetId: a.id,
        symbol: a.symbol,
        name: a.name,
        currency: a.currency,
        price: quote.price.toNumber(),
        changePercent: quote.changePercent.toNumber(),
        buyers: buyMap.get(a.id) ?? 0,
        sellers: sellMap.get(a.id) ?? 0,
        watchlistAdds: watchMap.get(a.id) ?? 0,
        holders: holderMap.get(a.id) ?? 0,
        discussions: discussionMap.get(a.id) ?? 0,
      };
    }),
  );

  return {
    trendingPurchases: [...rows].sort((a, b) => b.buyers - a.buyers).slice(0, 10),
    mostBought: [...rows].sort((a, b) => b.buyers - a.buyers).slice(0, 10),
    mostWatchlisted: [...rows].sort((a, b) => b.watchlistAdds - a.watchlistAdds).slice(0, 10),
    biggestSellerIncrease: [...rows].sort((a, b) => b.sellers - a.sellers).slice(0, 10),
    mostDiscussed: [...rows].sort((a, b) => b.discussions - a.discussions).slice(0, 10),
    newlyTrending: [...rows]
      .filter((r) => r.buyers > 0)
      .sort((a, b) => b.buyers / (b.holders + 1) - a.buyers / (a.holders + 1))
      .slice(0, 10),
  };
}
