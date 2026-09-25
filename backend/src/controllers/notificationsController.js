import { prisma } from '../utils/db.js';

export async function getNotifications(req, res) {
  const { limit = 30, unreadOnly = false } = req.query;
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user.id, ...(unreadOnly === 'true' && { isRead: false }) },
    orderBy: { createdAt: 'desc' },
    take: Number(limit),
  });
  const unreadCount = await prisma.notification.count({ where: { userId: req.user.id, isRead: false } });
  res.json({ notifications, unreadCount });
}

export async function markRead(req, res) {
  const { ids } = req.body; // array of ids, or empty for all
  if (ids?.length) {
    await prisma.notification.updateMany({ where: { id: { in: ids }, userId: req.user.id }, data: { isRead: true } });
  } else {
    await prisma.notification.updateMany({ where: { userId: req.user.id, isRead: false }, data: { isRead: true } });
  }
  res.json({ message: 'Marked as read.' });
}

export async function deleteNotification(req, res) {
  await prisma.notification.deleteMany({ where: { id: req.params.id, userId: req.user.id } });
  res.json({ message: 'Deleted.' });
}
