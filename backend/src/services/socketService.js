import logger from '../utils/logger.js';
import jwt from 'jsonwebtoken';

const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || process.env.ACCESS_TOKEN_SECRET || 'dev-access-secret';

let _io = null;

export function getIO() { return _io; }

export function setupSocketHandlers(io) {
  _io = io;

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      const payload = jwt.verify(token, ACCESS_TOKEN_SECRET);
      socket.userId = payload.sub;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    logger.info('Socket connected', { userId: socket.userId, id: socket.id });

    // Join personal room for notifications
    socket.join(`user:${socket.userId}`);

    // Subscribe to asset price feeds
    socket.on('subscribe:asset', (assetId) => {
      socket.join(`asset:${assetId}`);
      logger.debug('Subscribed to asset', { userId: socket.userId, assetId });
    });

    socket.on('unsubscribe:asset', (assetId) => {
      socket.leave(`asset:${assetId}`);
    });

    socket.on('disconnect', () => {
      logger.info('Socket disconnected', { userId: socket.userId, id: socket.id });
    });
  });
}

export function broadcastPrice(assetId, priceData) {
  if (_io) {
    _io.to(`asset:${assetId}`).emit('price:update', { assetId, ...priceData });
  }
}

export function broadcastToUser(userId, event, data) {
  if (_io) {
    _io.to(`user:${userId}`).emit(event, data);
  }
}
