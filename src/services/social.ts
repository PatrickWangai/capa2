import { db } from "@/lib/db";
import { PostType, PostVisibility } from "@/generated/prisma/client";

export type FeedScope = "for-you" | "following" | "trending" | "latest";

export interface CreatePostInput {
  userId: string;
  type: PostType;
  content: string;
  visibility?: PostVisibility;
  thesisId?: string;
  tradeId?: string;
}

const AUTHOR_SELECT = {
  select: {
    id: true,
    username: true,
    name: true,
    avatarUrl: true,
  },
} as const;

export async function createPost(input: CreatePostInput) {
  return db.post.create({
    data: {
      userId: input.userId,
      type: input.type,
      content: input.content,
      visibility: input.visibility ?? "PUBLIC",
      thesisId: input.thesisId,
      tradeId: input.tradeId,
    },
  });
}

export async function getFeed(scope: FeedScope, viewerId: string | null, cursor?: string, limit = 20) {
  const following = viewerId
    ? await db.follow.findMany({ where: { followerId: viewerId }, select: { followingId: true } })
    : [];
  const followingIds = following.map((f) => f.followingId);

  const where =
    scope === "following" && viewerId
      ? { userId: { in: [...followingIds, viewerId] }, visibility: "PUBLIC" as const, moderationStatus: "VISIBLE" as const }
      : { visibility: "PUBLIC" as const, moderationStatus: "VISIBLE" as const };

  const orderBy =
    scope === "trending"
      ? [{ likeCount: "desc" as const }, { createdAt: "desc" as const }]
      : [{ createdAt: "desc" as const }];

  const posts = await db.post.findMany({
    where,
    orderBy,
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: {
      user: AUTHOR_SELECT,
      thesis: { include: { asset: { select: { symbol: true, name: true, currency: true } } } },
      trade: { include: { asset: { select: { symbol: true, currency: true } } } },
    },
  });

  const hasMore = posts.length > limit;
  const page = hasMore ? posts.slice(0, limit) : posts;

  let likedIds = new Set<string>();
  let savedIds = new Set<string>();
  if (viewerId) {
    const [likes, saves] = await Promise.all([
      db.like.findMany({ where: { userId: viewerId, postId: { in: page.map((p) => p.id) } }, select: { postId: true } }),
      db.save.findMany({ where: { userId: viewerId, postId: { in: page.map((p) => p.id) } }, select: { postId: true } }),
    ]);
    likedIds = new Set(likes.map((l) => l.postId));
    savedIds = new Set(saves.map((s) => s.postId));
  }

  return {
    posts: page.map((p) => ({ ...p, viewerHasLiked: likedIds.has(p.id), viewerHasSaved: savedIds.has(p.id) })),
    nextCursor: hasMore ? page[page.length - 1].id : null,
  };
}

export async function toggleLike(userId: string, postId: string): Promise<boolean> {
  const existing = await db.like.findUnique({ where: { userId_postId: { userId, postId } } });
  if (existing) {
    await db.$transaction([
      db.like.delete({ where: { userId_postId: { userId, postId } } }),
      db.post.update({ where: { id: postId }, data: { likeCount: { decrement: 1 } } }),
    ]);
    return false;
  }
  await db.$transaction([
    db.like.create({ data: { userId, postId } }),
    db.post.update({ where: { id: postId }, data: { likeCount: { increment: 1 } } }),
  ]);
  return true;
}

export async function toggleSave(userId: string, postId: string): Promise<boolean> {
  const existing = await db.save.findUnique({ where: { userId_postId: { userId, postId } } });
  if (existing) {
    await db.$transaction([
      db.save.delete({ where: { userId_postId: { userId, postId } } }),
      db.post.update({ where: { id: postId }, data: { saveCount: { decrement: 1 } } }),
    ]);
    return false;
  }
  await db.$transaction([
    db.save.create({ data: { userId, postId } }),
    db.post.update({ where: { id: postId }, data: { saveCount: { increment: 1 } } }),
  ]);
  return true;
}

export async function listComments(postId: string) {
  return db.comment.findMany({
    where: { postId, moderationStatus: "VISIBLE" },
    orderBy: { createdAt: "asc" },
    include: { user: AUTHOR_SELECT },
  });
}

export async function addComment(userId: string, postId: string, body: string) {
  const [comment] = await db.$transaction([
    db.comment.create({ data: { userId, postId, body }, include: { user: AUTHOR_SELECT } }),
    db.post.update({ where: { id: postId }, data: { commentCount: { increment: 1 } } }),
  ]);
  return comment;
}

/** Publishes a verified-trade post automatically when a user opts in and a trade fills. */
export async function publishVerifiedTradePost(userId: string, tradeId: string, note?: string) {
  return createPost({
    userId,
    type: "VERIFIED_TRADE",
    content: note ?? "",
    tradeId,
  });
}
