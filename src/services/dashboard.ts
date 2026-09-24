import Decimal from "decimal.js";
import { db } from "@/lib/db";
import { getBrokerService } from "./providers/broker";
import { getMarketDataProvider } from "./providers/market-data";

export async function getDashboardData(userId: string) {
  const broker = getBrokerService();
  const [account, positions, watchlistItems] = await Promise.all([
    broker.getAccount(userId),
    broker.getPositions(userId),
    db.watchlistItem.findMany({
      where: { watchlist: { userId } },
      include: { asset: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const dayChangeAmount = positions.reduce((sum, p) => sum.plus(p.dayChangeAmount), new Decimal(0));
  const dayChangeBase = account.totalValue.minus(dayChangeAmount);
  const dayChangePercent = dayChangeBase.isZero() ? new Decimal(0) : dayChangeAmount.div(dayChangeBase).mul(100);

  const totalCostBasis = positions.reduce((sum, p) => sum.plus(p.quantity.mul(p.avgPrice)), new Decimal(0));
  const totalUnrealizedPnl = positions.reduce((sum, p) => sum.plus(p.unrealizedPnl), new Decimal(0));
  const totalReturnPercent = totalCostBasis.isZero() ? new Decimal(0) : totalUnrealizedPnl.div(totalCostBasis).mul(100);

  return {
    account: {
      totalValue: account.totalValue.toNumber(),
      cashBalance: account.cashBalance.toNumber(),
      portfolioValue: account.portfolioValue.toNumber(),
    },
    dayChangeAmount: dayChangeAmount.toNumber(),
    dayChangePercent: dayChangePercent.toNumber(),
    totalUnrealizedPnl: totalUnrealizedPnl.toNumber(),
    totalReturnPercent: totalReturnPercent.toNumber(),
    holdings: positions
      .sort((a, b) => b.marketValue.comparedTo(a.marketValue))
      .slice(0, 5)
      .map((p) => ({
        symbol: p.symbol,
        name: p.name,
        currency: p.currency,
        marketValue: p.marketValue.toNumber(),
        currentPrice: p.currentPrice.toNumber(),
        dayChangePercent: p.dayChangePercent.toNumber(),
      })),
    watchlist: await Promise.all(
      watchlistItems.map(async (w) => {
        const provider = getMarketDataProvider();
        const quote = await provider.getQuote(w.asset.symbol);
        return {
          symbol: w.asset.symbol,
          name: w.asset.name,
          currency: w.asset.currency,
          price: quote.price.toNumber(),
          changePercent: quote.changePercent.toNumber(),
        };
      }),
    ),
  };
}
