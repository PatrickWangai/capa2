import { db } from "@/lib/db";
import type { CircleVisibility } from "@/generated/prisma/client";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function listCircles(viewerId: string | null) {
  const circles = await db.circle.findMany({
    where: { visibility: "PUBLIC" },
    orderBy: { memberCount: "desc" },
    include: { owner: { select: { username: true, name: true } } },
  });

  if (!viewerId) return circles.map((c) => ({ ...c, isMember: false }));

  const memberships = await db.circleMember.findMany({ where: { userId: viewerId }, select: { circleId: true } });
  const memberSet = new Set(memberships.map((m) => m.circleId));
  return circles.map((c) => ({ ...c, isMember: memberSet.has(c.id) }));
}

export async function createCircle(input: { ownerId: string; name: string; description: string; visibility: CircleVisibility }) {
  const slug = `${slugify(input.name)}-${Math.random().toString(36).slice(2, 6)}`;
  return db.$transaction(async (tx) => {
    const circle = await tx.circle.create({
      data: { name: input.name, description: input.description, visibility: input.visibility, slug, ownerId: input.ownerId, memberCount: 1 },
    });
    await tx.circleMember.create({ data: { circleId: circle.id, userId: input.ownerId, role: "OWNER" } });
    return circle;
  });
}

export async function getCircle(id: string, viewerId: string | null) {
  const circle = await db.circle.findUnique({
    where: { id },
    include: {
      owner: { select: { username: true, name: true } },
      members: { include: { user: { select: { id: true, username: true, name: true, avatarUrl: true } } }, orderBy: { joinedAt: "asc" } },
      posts: { orderBy: { createdAt: "desc" }, include: { user: { select: { id: true, username: true, name: true, avatarUrl: true } } } },
    },
  });
  if (!circle) return null;

  return {
    ...circle,
    isMember: viewerId ? circle.members.some((m) => m.userId === viewerId) : false,
    role: viewerId ? circle.members.find((m) => m.userId === viewerId)?.role ?? null : null,
  };
}

export async function joinCircle(circleId: string, userId: string) {
  const existing = await db.circleMember.findUnique({ where: { circleId_userId: { circleId, userId } } });
  if (existing) return;
  await db.$transaction([
    db.circleMember.create({ data: { circleId, userId, role: "MEMBER" } }),
    db.circle.update({ where: { id: circleId }, data: { memberCount: { increment: 1 } } }),
  ]);
}

export async function leaveCircle(circleId: string, userId: string) {
  const existing = await db.circleMember.findUnique({ where: { circleId_userId: { circleId, userId } } });
  if (!existing) return;
  if (existing.role === "OWNER") throw new Error("The circle owner can't leave — transfer ownership first.");
  await db.$transaction([
    db.circleMember.delete({ where: { circleId_userId: { circleId, userId } } }),
    db.circle.update({ where: { id: circleId }, data: { memberCount: { decrement: 1 } } }),
  ]);
}

export async function postToCircle(circleId: string, userId: string, content: string) {
  const membership = await db.circleMember.findUnique({ where: { circleId_userId: { circleId, userId } } });
  if (!membership) throw new Error("Join this circle before posting.");
  return db.circlePost.create({ data: { circleId, userId, content } });
}
