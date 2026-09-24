import { db } from "@/lib/db";
import type { AssetClass, AssetRegion } from "@/generated/prisma/client";
import { getMarketDataProvider } from "./providers/market-data";

export interface MarketAssetView {
  id: string;
  symbol: string;
  name: string;
  exchange: string;
  assetClass: AssetClass;
  region: AssetRegion;
  currency: string;
  price: number;
  changePercent: number;
}

export async function listMarketAssets(filter: {
  region?: AssetRegion;
  assetClass?: AssetClass;
  search?: string;
}): Promise<MarketAssetView[]> {
  const assets = await db.asset.findMany({
    where: {
      region: filter.region,
      assetClass: filter.assetClass,
      ...(filter.search
        ? {
            OR: [
              { symbol: { contains: filter.search, mode: "insensitive" } },
              { name: { contains: filter.search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { symbol: "asc" },
  });

  const provider = getMarketDataProvider();
  return Promise.all(
    assets.map(async (a) => {
      const quote = await provider.getQuote(a.symbol);
      return {
        id: a.id,
        symbol: a.symbol,
        name: a.name,
        exchange: a.exchange,
        assetClass: a.assetClass,
        region: a.region,
        currency: a.currency,
        price: quote.price.toNumber(),
        changePercent: quote.changePercent.toNumber(),
      };
    }),
  );
}
