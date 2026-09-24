import { db } from "@/lib/db";

export async function listNotifications(userId: string) {
  return db.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 50 });
}

export async function markAllRead(userId: string) {
  await db.notification.updateMany({ where: { userId, read: false }, data: { read: true } });
}

export async function markRead(userId: string, id: string) {
  await db.notification.updateMany({ where: { id, userId }, data: { read: true } });
}
