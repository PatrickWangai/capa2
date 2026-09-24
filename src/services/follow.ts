import { db } from "@/lib/db";

export async function followUser(followerId: string, followingId: string) {
  if (followerId === followingId) throw new Error("You can't follow yourself.");

  const existing = await db.follow.findUnique({ where: { followerId_followingId: { followerId, followingId } } });
  if (existing) return;

  await db.$transaction([
    db.follow.create({ data: { followerId, followingId } }),
    db.profile.update({ where: { userId: followingId }, data: { followerCount: { increment: 1 } } }),
    db.profile.update({ where: { userId: followerId }, data: { followingCount: { increment: 1 } } }),
  ]);
}

export async function unfollowUser(followerId: string, followingId: string) {
  const existing = await db.follow.findUnique({ where: { followerId_followingId: { followerId, followingId } } });
  if (!existing) return;

  await db.$transaction([
    db.follow.delete({ where: { followerId_followingId: { followerId, followingId } } }),
    db.profile.update({ where: { userId: followingId }, data: { followerCount: { decrement: 1 } } }),
    db.profile.update({ where: { userId: followerId }, data: { followingCount: { decrement: 1 } } }),
  ]);
}

export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  const existing = await db.follow.findUnique({ where: { followerId_followingId: { followerId, followingId } } });
  return !!existing;
}
