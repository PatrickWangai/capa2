import { db } from "@/lib/db";
import { getBrokerService } from "./providers/broker";
import { convertToBase } from "@/lib/money";

export interface PortfolioInsights {
  totalValue: number;
  topHoldings: { symbol: string; name: string; allocationPercent: number }[];
  sectorConcentration: { sector: string; percent: number }[];
  geographicExposure: { region: string; percent: number }[];
  concentrationRisk: string | null;
  recentPerformanceNote: string;
}

/**
 * Presents structured facts about the current portfolio — allocation, sector
 * and geography exposure, concentration flags. Deliberately does not
 * recommend buy/sell actions; see spec section 24.
 */
export async function explainPortfolio(userId: string): Promise<PortfolioInsights> {
  const broker = getBrokerService();
  const [positions, holdings] = await Promise.all([
    broker.getPositions(userId),
    db.holding.findMany({ where: { userId }, include: { asset: true } }),
  ]);

  const totalValue = positions.reduce((sum, p) => sum + p.marketValueBase.toNumber(), 0);

  const topHoldings = [...positions]
    .sort((a, b) => b.marketValueBase.comparedTo(a.marketValueBase))
    .slice(0, 5)
    .map((p) => ({ symbol: p.symbol, name: p.name, allocationPercent: p.allocationPercent.toNumber() }));

  const largestAllocation = topHoldings[0]?.allocationPercent ?? 0;
  const concentrationRisk =
    largestAllocation > 40
      ? `${topHoldings[0].symbol} makes up ${largestAllocation.toFixed(0)}% of your portfolio — a single-position concentration this high means your returns are closely tied to one company.`
      : null;

  const dayChange = positions.reduce((sum, p) => sum + p.dayChangeAmountBase.toNumber(), 0);
  const recentPerformanceNote =
    positions.length === 0
      ? "You don't hold any positions yet."
      : dayChange >= 0
        ? `Your portfolio is up today, driven mostly by ${topHoldings[0]?.symbol ?? "your largest holding"}.`
        : `Your portfolio is down today, driven mostly by ${topHoldings[0]?.symbol ?? "your largest holding"}.`;

  const bySector = new Map<string, number>();
  const byRegion = new Map<string, number>();
  for (const h of holdings) {
    const value = convertToBase(Number(h.quantity) * Number(h.asset.currentPrice), h.asset.currency).toNumber();
    const sector = h.asset.sector ?? "Other";
    bySector.set(sector, (bySector.get(sector) ?? 0) + value);
    byRegion.set(h.asset.region, (byRegion.get(h.asset.region) ?? 0) + value);
  }

  const toPercentSorted = (map: Map<string, number>) =>
    [...map.entries()]
      .map(([key, value]) => ({ key, percent: totalValue === 0 ? 0 : (value / totalValue) * 100 }))
      .sort((a, b) => b.percent - a.percent);

  return {
    totalValue,
    topHoldings,
    sectorConcentration: toPercentSorted(bySector).map((s) => ({ sector: s.key, percent: s.percent })),
    geographicExposure: toPercentSorted(byRegion).map((r) => ({ region: r.key, percent: r.percent })),
    concentrationRisk,
    recentPerformanceNote,
  };
}
