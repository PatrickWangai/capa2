import 'dotenv/config';
import 'express-async-errors';

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
  if (sentryEnabled) Sentry.captureException(reason);
});
import fs from 'fs';
import path from 'path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import http from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';

import logger from './utils/logger.js';
import { prisma } from './utils/db.js';
import { redis } from './utils/redis.js';
import { initSentry, Sentry, sentryEnabled } from './utils/sentry.js';

initSentry();
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import kycRoutes from './routes/kyc.js';
import accountsRoutes from './routes/accounts.js';
import assetsRoutes from './routes/assets.js';
import ordersRoutes from './routes/orders.js';
import portfolioRoutes from './routes/portfolio.js';
import transactionsRoutes from './routes/transactions.js';
import depositsRoutes from './routes/deposits.js';
import paymentMethodsRoutes from './routes/paymentMethods.js';
import notificationsRoutes from './routes/notifications.js';
import walletsRoutes from './routes/wallets.js';
import dividendsRoutes from './routes/dividends.js';
import adminRoutes from './routes/admin.js';
import webhooksRoutes from './routes/webhooks.js';
import alertsRoutes from './routes/alerts.js';
import { setupSocketHandlers } from './services/socketService.js';
import { startPriceFeed } from './services/priceFeedService.js';
import { startLimitOrderJob } from './jobs/limitOrderJob.js';

// Prisma can return BigInt values; JSON.stringify doesn't handle them natively
BigInt.prototype.toJSON = function () { return this.toString(); };

const app = express();
app.set('trust proxy', 1); // Render sits behind a reverse proxy
const httpServer = http.createServer(app);

// ── Socket.IO ────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGINS === '*' ? true : (process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173']),
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});
app.set('io', io);

// ── Core middleware ───────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https://logo.clearbit.com', 'https://www.google.com'],
      connectSrc: ["'self'", 'wss:', 'ws:', 'https:'],
      fontSrc: ["'self'", 'data:'],
    },
  },
}));
app.use(compression());
app.use(cors({
  origin: process.env.CORS_ORIGINS === '*' ? true : (process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173']),
  credentials: true,
}));
app.use('/api/webhooks', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: msg => logger.http(msg.trim()) } }));

// ── Rate limits ───────────────────────────────────────────────
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));
app.use('/api/auth/', rateLimit({
  windowMs: 15 * 60 * 1000, max: 20,
  message: { error: 'Too many auth attempts. Try again in 15 minutes.' },
}));

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/users',         usersRoutes);
app.use('/api/kyc',           kycRoutes);
app.use('/api/accounts',      accountsRoutes);
app.use('/api/assets',        assetsRoutes);
app.use('/api/orders',        ordersRoutes);
app.use('/api/portfolio',     portfolioRoutes);
app.use('/api/transactions',  transactionsRoutes);
app.use('/api/deposits',         depositsRoutes);
app.use('/api/payment-methods',  paymentMethodsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/wallets',       walletsRoutes);
app.use('/api/dividends',     dividendsRoutes);
app.use('/api/admin',         adminRoutes);
app.use('/api/alerts',        alertsRoutes);
app.use('/api/webhooks',      webhooksRoutes);

// ── Health ────────────────────────────────────────────────────
app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', ts: new Date().toISOString() });
  } catch (e) {
    res.status(503).json({ status: 'error', error: e.message });
  }
});

// Serve the production web app from the same origin as the API.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDist = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(path.join(frontendDist, 'index.html'))) {
  // /app-icon.png — served with no-store so Safari cannot cache a stale version.
  // /favicon.ico, apple-touch-icon → 404 so Safari cannot fall back to old cached files.
  app.get('/app-icon.png', (_req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(path.join(frontendDist, 'app-icon.png'));
  });
  // Favicon routes — served with no-store so Safari never caches a stale icon
  for (const name of ['favicon.ico', 'favicon-16x16.png', 'favicon-32x32.png', 'favicon-48x48.png', 'apple-touch-icon.png', 'apple-touch-icon-precomposed.png']) {
    app.get(`/${name}`, (_req, res) => {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.sendFile(path.join(frontendDist, name));
    });
  }
  // JS/CSS chunks have content hashes in their filenames — cache them aggressively.
  // index.html must never be cached so phones always get the latest app shell.
  app.use(express.static(frontendDist, {
    setHeaders(res, filePath) {
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      }
    },
  }));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) return next();
    // Static assets that don't exist should 404, not return index.html —
    // returning HTML for a missing JS chunk causes the MIME-type error.
    if (req.path.startsWith('/assets/')) return res.status(404).end();
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// ── Error monitoring ──────────────────────────────────────────
if (sentryEnabled) Sentry.setupExpressErrorHandler(app);

// ── Global error handler ──────────────────────────────────────
app.use((err, _req, res, _next) => {
  logger.error(err.message, { stack: err.stack });
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

// ── Start ─────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
(async () => {
  await prisma.$connect();
  logger.info('PostgreSQL connected via Prisma');
  setupSocketHandlers(io);
  await startPriceFeed(io);
  startLimitOrderJob();
  httpServer.listen(PORT, () => logger.info(`API listening on :${PORT}`));
})();

// ── Graceful shutdown ─────────────────────────────────────────
let shuttingDown = false;
async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info(`${signal} received, shutting down gracefully`);
  const forceExit = setTimeout(() => {
    logger.error('Graceful shutdown timed out, forcing exit');
    process.exit(1);
  }, 10000);
  try {
    await new Promise(resolve => httpServer.close(resolve));
    io.close();
    await prisma.$disconnect();
    await redis.quit();
    clearTimeout(forceExit);
    logger.info('Shutdown complete');
    process.exit(0);
  } catch (err) {
    logger.error('Error during shutdown', { error: err.message });
    process.exit(1);
  }
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default app;
