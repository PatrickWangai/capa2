import { db } from "@/lib/db";

interface BriefHighlight {
  symbol: string;
  headline: string;
  why: string;
}

export async function generateMarketBrief(userId: string) {
  const [holdings, watchlistItems, followedTheses] = await Promise.all([
    db.holding.findMany({ where: { userId }, include: { asset: { include: { marketEvents: { orderBy: { occurredAt: "desc" }, take: 1 } } } } }),
    db.watchlistItem.findMany({ where: { watchlist: { userId } }, include: { asset: { include: { marketEvents: { orderBy: { occurredAt: "desc" }, take: 1 } } } } }),
    db.thesisFollow.findMany({ where: { userId }, include: { thesis: { include: { asset: true, user: { select: { name: true } } } } } }),
  ]);

  const highlights: BriefHighlight[] = [];

  for (const h of holdings) {
    const event = h.asset.marketEvents[0];
    if (event) {
      highlights.push({ symbol: h.asset.symbol, headline: event.title, why: "You hold a position in this company." });
    }
  }
  for (const w of watchlistItems) {
    const event = w.asset.marketEvents[0];
    if (event && !highlights.some((h) => h.symbol === w.asset.symbol)) {
      highlights.push({ symbol: w.asset.symbol, headline: event.title, why: "This is on your watchlist." });
    }
  }
  for (const tf of followedTheses) {
    if (highlights.length >= 6) break;
    highlights.push({
      symbol: tf.thesis.asset.symbol,
      headline: `${tf.thesis.user.name}'s thesis on ${tf.thesis.asset.symbol} is still ${tf.thesis.status.toLowerCase()}`,
      why: "You follow this investment thesis.",
    });
  }

  const summary =
    highlights.length === 0
      ? "Nothing new to report today — check back after the market moves, or add a few assets to your watchlist."
      : `${highlights.length} thing${highlights.length === 1 ? "" : "s"} relevant to your portfolio today.`;

  const brief = await db.marketBrief.create({
    data: { userId, summary, highlights: highlights as unknown as object },
  });

  return { id: brief.id, generatedAt: brief.generatedAt, summary, highlights };
}

export async function getLatestBrief(userId: string) {
  const brief = await db.marketBrief.findFirst({ where: { userId }, orderBy: { generatedAt: "desc" } });
  if (!brief) return null;
  return { id: brief.id, generatedAt: brief.generatedAt, summary: brief.summary, highlights: brief.highlights as unknown as BriefHighlight[] };
}
