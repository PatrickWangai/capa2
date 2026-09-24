import { db } from "@/lib/db";
import { getMarketDataProvider } from "./providers/market-data";

export async function getOrCreateDefaultWatchlist(userId: string) {
  const existing = await db.watchlist.findFirst({ where: { userId }, orderBy: { createdAt: "asc" } });
  if (existing) return existing;
  return db.watchlist.create({ data: { userId, name: "My Watchlist" } });
}

export async function listWatchlist(userId: string) {
  const watchlist = await getOrCreateDefaultWatchlist(userId);
  const items = await db.watchlistItem.findMany({
    where: { watchlistId: watchlist.id },
    include: { asset: true },
    orderBy: { createdAt: "desc" },
  });

  const provider = getMarketDataProvider();
  return Promise.all(
    items.map(async (item) => {
      const quote = await provider.getQuote(item.asset.symbol);
      return {
        assetId: item.asset.id,
        symbol: item.asset.symbol,
        name: item.asset.name,
        currency: item.asset.currency,
        price: quote.price.toNumber(),
        changePercent: quote.changePercent.toNumber(),
      };
    }),
  );
}

export async function addToWatchlist(userId: string, assetId: string) {
  const watchlist = await getOrCreateDefaultWatchlist(userId);
  return db.watchlistItem.upsert({
    where: { watchlistId_assetId: { watchlistId: watchlist.id, assetId } },
    create: { watchlistId: watchlist.id, assetId },
    update: {},
  });
}

export async function removeFromWatchlist(userId: string, assetId: string) {
  const watchlist = await getOrCreateDefaultWatchlist(userId);
  await db.watchlistItem.deleteMany({ where: { watchlistId: watchlist.id, assetId } });
}

export async function isInWatchlist(userId: string, assetId: string): Promise<boolean> {
  const watchlist = await db.watchlist.findFirst({ where: { userId } });
  if (!watchlist) return false;
  const item = await db.watchlistItem.findUnique({
    where: { watchlistId_assetId: { watchlistId: watchlist.id, assetId } },
  });
  return !!item;
}
