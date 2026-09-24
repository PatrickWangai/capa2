import { db } from "@/lib/db";
import { getBrokerService } from "./providers/broker";

export async function getPublicProfile(username: string, viewerId: string | null) {
  const user = await db.user.findUnique({
    where: { username },
    include: { profile: true },
  });
  if (!user || !user.profile) return null;

  const isSelf = viewerId === user.id;
  const isFollowing = viewerId
    ? !!(await db.follow.findUnique({ where: { followerId_followingId: { followerId: viewerId, followingId: user.id } } }))
    : false;

  const [thesesRaw, postsRaw, milestones] = await Promise.all([
    user.profile.showTheses
      ? db.thesis.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 10, include: { asset: true } })
      : Promise.resolve([]),
    db.post.findMany({
      where: { userId: user.id, visibility: "PUBLIC", moderationStatus: "VISIBLE" },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        thesis: { include: { asset: true } },
        trade: { include: { asset: true } },
      },
    }),
    user.profile.showJourney
      ? db.investmentMilestone.findMany({ where: { userId: user.id, isPublic: true }, orderBy: { occurredAt: "asc" } })
      : Promise.resolve([]),
  ]);

  let portfolioValue: number | null = null;
  if (user.profile.showPortfolioValue || isSelf) {
    const broker = getBrokerService();
    const account = await broker.getAccount(user.id);
    portfolioValue = account.totalValue.toNumber();
  }

  // Prisma Decimal fields can't cross the server->client component boundary as
  // props (PostCard/ThesisCard are client components) — convert to plain
  // numbers/strings here, once, instead of at every call site.
  const theses = thesesRaw.map((t) => ({
    id: t.id,
    direction: t.direction,
    status: t.status,
    title: t.title,
    entryPrice: Number(t.entryPrice),
    targetPrice: t.targetPrice ? Number(t.targetPrice) : null,
    timeHorizon: t.timeHorizon,
    likeCount: t.likeCount,
    followCount: t.followCount,
    symbol: t.asset.symbol,
    currency: t.asset.currency,
  }));

  const posts = postsRaw.map((p) => ({
    id: p.id,
    type: p.type,
    content: p.content,
    createdAt: p.createdAt.toISOString(),
    likeCount: p.likeCount,
    commentCount: p.commentCount,
    saveCount: p.saveCount,
    thesis: p.thesis
      ? { id: p.thesis.id, title: p.thesis.title, direction: p.thesis.direction, asset: { symbol: p.thesis.asset.symbol } }
      : null,
    trade: p.trade
      ? {
          side: p.trade.side,
          quantity: p.trade.quantity.toString(),
          price: p.trade.price.toString(),
          asset: { symbol: p.trade.asset.symbol, currency: p.trade.asset.currency },
        }
      : null,
  }));

  return {
    id: user.id,
    username: user.username,
    name: user.name,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    interests: user.profile.interests,
    followerCount: user.profile.followerCount,
    followingCount: user.profile.followingCount,
    allowFollow: user.profile.allowFollow,
    isSelf,
    isFollowing,
    portfolioValue,
    theses,
    posts,
    milestones,
  };
}
