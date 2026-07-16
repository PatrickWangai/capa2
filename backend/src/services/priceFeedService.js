import YahooFinance from 'yahoo-finance2';
import { prisma } from '../utils/db.js';
import { broadcastPrice } from './socketService.js';
import logger from '../utils/logger.js';

const yf = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

const TICK_MS          = 1_000;        // broadcast every 1 second
const DB_WRITE_MS      = 15_000;       // persist to DB every 15 seconds
const YAHOO_REFRESH_MS = 15_000;       // re-fetch Yahoo every 15 seconds
const NSE_REFRESH_MS   = 15 * 60_000; // re-fetch NSE every 15 minutes
const NSE_FAIL_BACKOFF_MS = 60 * 60_000;

const YAHOO_SUFFIX = { NSE: '.NR', LSE: '.L', NYSE: '', NASDAQ: '' };

// NSE symbols that differ between our DB and Yahoo Finance (.NR)
const NSE_YAHOO_MAP = { BATK: 'BAT', BKG: 'BKG', TOTL: 'TOTA' };

// ── In-memory live price cache (what gets broadcast every second) ──
// { assetId: { symbol, exchange, price, open, high, low, previousClose,
//              changeAmount, changePercent, volume, anchorPrice } }
const liveCache = new Map();

// ── Timing state ──
let lastDbWrite   = 0;
let lastYahoo     = 0;
let nseCache      = {};
let nseCacheAt    = 0;
let nseFailedAt   = 0;

// ── NSE batch refresh via Yahoo Finance (.NR suffix) ─────────────
async function refreshNsePrices(nseSymbols) {
  const now = Date.now();
  if (now - nseCacheAt < NSE_REFRESH_MS) return;
  if (nseFailedAt && now - nseFailedAt < NSE_FAIL_BACKOFF_MS) return;

  logger.info(`NSE: refreshing ${nseSymbols.length} stocks via Yahoo Finance (.NR)`);
  const results = await Promise.allSettled(
    nseSymbols.map(async sym => ({ sym, data: await fetchYahooPrice(sym, 'NSE') }))
  );
  const prices = {};
  for (const r of results) {
    if (r.status === 'fulfilled' && r.value.data) {
      prices[r.value.sym] = { price: r.value.data.price, change: r.value.data.changeAmount };
    }
  }
  if (Object.keys(prices).length > 0) {
    nseCache = prices;
    nseCacheAt = now;
    nseFailedAt = 0;
    logger.info(`NSE: cached ${Object.keys(prices).length}/${nseSymbols.length} live prices via Yahoo`);
  } else {
    nseFailedAt = now;
    logger.warn('NSE: Yahoo Finance returned no NSE prices — simulating until next retry in 1 hr');
  }
}

// ── Yahoo Finance ─────────────────────────────────────────────────
async function fetchYahooPrice(symbol, exchange) {
  const suffix = YAHOO_SUFFIX[exchange];
  if (suffix === undefined) return null;
  const yahooSym = exchange === 'NSE'
    ? (NSE_YAHOO_MAP[symbol] ?? symbol) + suffix
    : symbol + suffix;
  try {
    const q = await yf.quote(yahooSym);
    if (!q?.regularMarketPrice) return null;
    return {
      price:         q.regularMarketPrice,
      open:          q.regularMarketOpen          ?? q.regularMarketPrice,
      high:          q.regularMarketDayHigh       ?? q.regularMarketPrice,
      low:           q.regularMarketDayLow        ?? q.regularMarketPrice,
      previousClose: q.regularMarketPreviousClose ?? q.regularMarketPrice,
      changeAmount:  q.regularMarketChange        ?? 0,
      changePercent: q.regularMarketChangePercent ?? 0,
      volume:        q.regularMarketVolume        ?? 0,
      marketCap:     q.marketCap   ?? null,
      peRatio:       q.trailingPE  ?? null,
      weekHigh52:    q.fiftyTwoWeekHigh ?? null,
      weekLow52:     q.fiftyTwoWeekLow  ?? null,
    };
  } catch {
    return null;
  }
}

// ── Micro-drift (applied every second between real fetches) ───────
// Tiny ±0.03% drift so prices "breathe" realistically.
// Snaps back toward the anchor price to prevent unbounded drift.
function applyMicroDrift(entry) {
  const anchor = entry.anchorPrice ?? entry.price;
  const current = entry.price;
  // Pull 10% back toward anchor each tick to prevent runaway drift
  const pull = (anchor - current) * 0.10;
  const drift = (Math.random() - 0.495) * current * 0.0003;
  const price = Math.max(0.01, current + drift + pull);

  const changeAmount  = price - entry.previousClose;
  const changePercent = entry.previousClose > 0 ? (changeAmount / entry.previousClose) * 100 : 0;

  return {
    ...entry,
    price,
    high: Math.max(price, entry.high),
    low:  Math.min(price, entry.low),
    changeAmount,
    changePercent,
  };
}

// ── Seed live cache from DB on startup ───────────────────────────
async function seedLiveCache() {
  const assets = await prisma.asset.findMany({ where: { isActive: true }, include: { price: true } });
  for (const asset of assets) {
    const p = asset.price;
    if (!p) continue;
    const price = Number(p.price);
    liveCache.set(asset.id, {
      symbol:        asset.symbol,
      exchange:      asset.exchange,
      price,
      anchorPrice:   price,
      open:          Number(p.open          ?? price),
      high:          Number(p.high          ?? price),
      low:           Number(p.low           ?? price),
      previousClose: Number(p.previousClose ?? price * 0.99),
      changeAmount:  Number(p.changeAmount  ?? 0),
      changePercent: Number(p.changePercent ?? 0),
      volume:        Number(p.volume        ?? 0),
    });
  }
  logger.info(`Live cache seeded with ${liveCache.size} assets`);
}

// ── Fetch fresh real data and update live cache ──────────────────
async function fetchRealPrices() {
  const now = Date.now();
  const doYahoo = now - lastYahoo >= YAHOO_REFRESH_MS;
  const doNse   = now - nseCacheAt >= NSE_REFRESH_MS &&
                  !(nseFailedAt && now - nseFailedAt < NSE_FAIL_BACKOFF_MS);

  if (!doYahoo && !doNse) return;

  const assets = await prisma.asset.findMany({ where: { isActive: true } });
  const nseSymbols = assets.filter(a => a.exchange === 'NSE').map(a => a.symbol);

  if (doNse && nseSymbols.length > 0) await refreshNsePrices(nseSymbols);

  if (doYahoo) lastYahoo = now;

  for (const asset of assets) {
    const existing = liveCache.get(asset.id);
    let real = null;

    if (asset.exchange === 'NSE') {
      // Try Yahoo Finance first (works from Frankfurt), fall back to AFX cache
      if (doYahoo) real = await fetchYahooPrice(asset.symbol, 'NSE');
      if (!real) {
        const live = nseCache[asset.symbol];
        if (live) {
          const prev = existing?.previousClose ?? existing?.price ?? live.price;
          real = {
            price:         live.price,
            open:          prev,
            high:          Math.max(live.price, existing?.high ?? live.price),
            low:           Math.min(live.price, existing?.low  ?? live.price),
            previousClose: prev,
            changeAmount:  live.change,
            changePercent: prev > 0 ? (live.change / prev) * 100 : 0,
            volume:        existing?.volume ?? 0,
          };
        }
      }
    } else if (doYahoo) {
      real = await fetchYahooPrice(asset.symbol, asset.exchange);
    }

    if (real) {
      liveCache.set(asset.id, {
        ...(existing ?? {}),
        ...real,
        symbol:      asset.symbol,
        exchange:    asset.exchange,
        anchorPrice: real.price, // snap anchor to fresh real price
      });
    }
  }
}

// ── Persist current live cache to DB ────────────────────────────
async function persistToDb() {
  const now = Date.now();
  if (now - lastDbWrite < DB_WRITE_MS) return;
  lastDbWrite = now;

  for (const [assetId, entry] of liveCache) {
    const priceData = {
      price:         entry.price,
      open:          entry.open,
      high:          entry.high,
      low:           entry.low,
      previousClose: entry.previousClose,
      changeAmount:  entry.changeAmount,
      changePercent: entry.changePercent,
      volume:        entry.volume,
    };

    await prisma.assetPrice.upsert({
      where:  { assetId },
      create: { assetId, ...priceData },
      update: { ...priceData, fetchedAt: new Date() },
    }).catch(() => {});

    const now2 = new Date();
    await prisma.priceHistory.upsert({
      where:  { assetId_interval_openTime: { assetId, interval: '1m', openTime: roundToMinute(now2) } },
      create: { assetId, interval: '1m', openTime: roundToMinute(now2), open: entry.open, high: entry.high, low: entry.low, close: entry.price, volume: entry.volume },
      update: { high: { set: Math.max(entry.high, entry.price) }, low: { set: Math.min(entry.low, entry.price) }, close: entry.price, volume: entry.volume },
    }).catch(() => {});

    const dayStart = startOfDay(now2);
    await prisma.$executeRaw`
      INSERT INTO price_history (id, asset_id, interval, open_time, open, high, low, close, volume)
      VALUES (gen_random_uuid(), ${assetId}::uuid, '1d', ${dayStart},
              ${entry.open}, ${entry.high}, ${entry.low}, ${entry.price}, ${BigInt(Math.round(entry.volume))})
      ON CONFLICT (asset_id, interval, open_time) DO UPDATE SET
        high   = GREATEST(price_history.high,  EXCLUDED.high),
        low    = LEAST   (price_history.low,   EXCLUDED.low),
        close  = EXCLUDED.close,
        volume = EXCLUDED.volume
    `.catch(() => {});
  }
}

// ── 1-second tick: drift → broadcast ─────────────────────────────
function tick() {
  for (const [assetId, entry] of liveCache) {
    const updated = applyMicroDrift(entry);
    liveCache.set(assetId, updated);

    broadcastPrice(assetId, {
      symbol:        updated.symbol,
      price:         updated.price,
      changePercent: updated.changePercent,
      changeAmount:  updated.changeAmount,
      volume:        updated.volume,
      fetchedAt:     new Date().toISOString(),
    });
  }
}

function roundToMinute(date) {
  return new Date(Math.floor(date.getTime() / 60_000) * 60_000);
}

function startOfDay(date) {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

// ── Historical backfill ───────────────────────────────────────────
// Fetches up to 2 years of real daily candles from Yahoo Finance for
// each active asset if the DB has fewer than 30 days of history.
async function backfillHistory() {
  const assets = await prisma.asset.findMany({ where: { isActive: true } });
  logger.info(`Backfill: checking history for ${assets.length} assets…`);

  const cutoff2y = new Date(Date.now() - 2 * 365 * 86_400_000);
  const cutoff30d = new Date(Date.now() - 30 * 86_400_000);

  for (const asset of assets) {
    try {
      // Skip if we already have at least 30 daily candles in the last 30 days
      const recent = await prisma.priceHistory.count({
        where: { assetId: asset.id, interval: '1d', openTime: { gte: cutoff30d } },
      });
      if (recent >= 30) continue;

      const suffix = YAHOO_SUFFIX[asset.exchange];
      if (suffix === undefined) continue;
      const yahooSym = asset.exchange === 'NSE'
        ? (NSE_YAHOO_MAP[asset.symbol] ?? asset.symbol) + suffix
        : asset.symbol + suffix;

      logger.info(`Backfill: fetching 2y daily history for ${yahooSym}`);
      const rows = await yf.historical(yahooSym, {
        period1: cutoff2y.toISOString().slice(0, 10),
        period2: new Date().toISOString().slice(0, 10),
        interval: '1d',
      }).catch(() => null);

      if (!rows || rows.length === 0) {
        logger.warn(`Backfill: no data returned for ${yahooSym}`);
        continue;
      }

      // Bulk-upsert — use raw SQL for efficiency
      let inserted = 0;
      for (const row of rows) {
        if (!row.close || !row.date) continue;
        const openTime = new Date(row.date);
        openTime.setUTCHours(0, 0, 0, 0);
        await prisma.$executeRaw`
          INSERT INTO price_history (id, asset_id, interval, open_time, open, high, low, close, volume)
          VALUES (
            gen_random_uuid(), ${asset.id}::uuid, '1d', ${openTime},
            ${row.open ?? row.close}, ${row.high ?? row.close},
            ${row.low  ?? row.close}, ${row.close},
            ${BigInt(Math.round(row.volume ?? 0))}
          )
          ON CONFLICT (asset_id, interval, open_time) DO UPDATE SET
            open   = EXCLUDED.open,
            high   = GREATEST(price_history.high, EXCLUDED.high),
            low    = LEAST   (price_history.low,  EXCLUDED.low),
            close  = EXCLUDED.close,
            volume = EXCLUDED.volume
        `.catch(() => {});
        inserted++;
      }
      logger.info(`Backfill: upserted ${inserted} daily candles for ${asset.symbol}`);

      // Small delay between assets to avoid hammering Yahoo
      await new Promise(r => setTimeout(r, 300));
    } catch (err) {
      logger.warn(`Backfill: error for ${asset.symbol} — ${err.message}`);
    }
  }
  logger.info('Backfill complete.');
}

export async function startPriceFeed(io) {
  logger.info('Price feed starting — 1s broadcast | 15s DB write | 15s Yahoo | 15m NSE Yahoo(.NR)');
  await seedLiveCache();

  // Fetch real prices immediately on startup
  await fetchRealPrices();

  // Backfill historical daily candles (runs once in background, non-blocking)
  backfillHistory().catch(err => logger.warn('Backfill failed', { err: err.message }));

  // 1-second tick: apply micro-drift and broadcast
  setInterval(tick, TICK_MS);

  // Fetch real prices every 15 seconds (separate from tick to avoid overlapping calls)
  setInterval(() => fetchRealPrices().catch(() => {}), YAHOO_REFRESH_MS);

  // Persist to DB every 15 seconds
  setInterval(() => persistToDb().catch(() => {}), DB_WRITE_MS);
}
