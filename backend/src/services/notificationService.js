import { prisma } from '../utils/db.js';
import logger from '../utils/logger.js';
import { getIO } from './socketService.js';

/**
 * createNotification({ userId, type, title, body, metadata })
 * Persists to DB and emits via Socket.IO if server instance is available.
 */
export async function createNotification({ userId, type, title, body, metadata = {} }) {
  try {
    const notification = await prisma.notification.create({
      data: { userId, type, title, body, metadata },
    });

    // Emit real-time via Socket.IO (app.get('io') set in index.js)
    const io = getIO();
    if (io) {
      io.to(`user:${userId}`).emit('notification', notification);
    }

    return notification;
  } catch (err) {
    logger.error('Failed to create notification', { error: err.message, userId, type });
  }
}
