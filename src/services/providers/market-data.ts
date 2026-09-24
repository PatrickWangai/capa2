import Decimal from "decimal.js";
import type { Exchange } from "@/generated/prisma/client";

export type ChartRange = "1D" | "1W" | "1M" | "3M" | "6M" | "1Y" | "5Y" | "MAX";

export interface Quote {
  symbol: string;
  price: Decimal;
  previousClose: Decimal;
  change: Decimal;
  changePercent: Decimal;
  dayHigh: Decimal;
  dayLow: Decimal;
  volume: number;
  timestamp: Date;
}

export interface Candle {
  time: number; // unix seconds, for lightweight-charts
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface CompanyInfo {
  symbol: string;
  name: string;
  sector: string | null;
  marketCap: Decimal | null;
  peRatio: Decimal | null;
  dividendYield: Decimal | null;
  week52High: Decimal | null;
  week52Low: Decimal | null;
  description: string;
}

export interface NewsItem {
  id: string;
  headline: string;
  summary: string;
  url: string;
  publishedAt: Date;
  source: string;
}

export interface MarketStatus {
  exchange: Exchange;
  isOpen: boolean;
  timezone: string;
  localTime: string;
}

/**
 * Abstraction over any source of prices, candles, company facts, news, and
 * market-session status. The app must never care whether data comes from
 * MockMarketDataProvider or a real vendor (Polygon, IEX, NSE feed, ...) —
 * only this interface is imported outside of `providers/`.
 */
export interface MarketDataProvider {
  getQuote(symbol: string): Promise<Quote>;
  getHistoricalPrices(symbol: string, range: ChartRange): Promise<Candle[]>;
  getCompany(symbol: string): Promise<CompanyInfo>;
  getNews(symbol: string): Promise<NewsItem[]>;
  getMarketStatus(exchange: Exchange): Promise<MarketStatus>;
}

const EXCHANGE_HOURS: Record<Exchange, { timezone: string; openHour: number; closeHour: number }> = {
  NSE: { timezone: "Africa/Nairobi", openHour: 9, closeHour: 15 },
  NYSE: { timezone: "America/New_York", openHour: 9.5, closeHour: 16 },
  NASDAQ: { timezone: "America/New_York", openHour: 9.5, closeHour: 16 },
  LSE: { timezone: "Europe/London", openHour: 8, closeHour: 16.5 },
};

/** Deterministic pseudo-random in [0, 1), seeded by a string + integer bucket. */
function seededRandom(seed: string, bucket: number): number {
  let h = 2166136261 ^ bucket;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  }
  h += h << 13;
  h ^= h >>> 7;
  h += h << 3;
  h ^= h >>> 17;
  h += h << 5;
  return ((h >>> 0) % 100000) / 100000;
}

export class MockMarketDataProvider implements MarketDataProvider {
  async getQuote(symbol: string): Promise<Quote> {
    const { db } = await import("@/lib/db");
    const asset = await db.asset.findUniqueOrThrow({ where: { symbol } });

    // Jitter the stored base price deterministically within each 5-minute
    // bucket so the UI shows gentle "live" movement without a real feed or
    // background job — reloading mid-bucket shows a stable price.
    const bucket = Math.floor(Date.now() / (5 * 60 * 1000));
    const jitter = (seededRandom(symbol, bucket) - 0.5) * 0.006; // +/-0.3%
    const base = new Decimal(asset.currentPrice.toString());
    const price = base.mul(new Decimal(1).plus(jitter));
    const previousClose = new Decimal(asset.previousClose.toString());
    const change = price.minus(previousClose);
    const changePercent = previousClose.isZero() ? new Decimal(0) : change.div(previousClose).mul(100);

    return {
      symbol: asset.symbol,
      price,
      previousClose,
      change,
      changePercent,
      dayHigh: price.mul(1.008),
      dayLow: price.mul(0.992),
      volume: Math.floor(seededRandom(symbol, bucket + 1) * 2_000_000) + 50_000,
      timestamp: new Date(),
    };
  }

  async getHistoricalPrices(symbol: string, range: ChartRange): Promise<Candle[]> {
    const { db } = await import("@/lib/db");
    const asset = await db.asset.findUniqueOrThrow({ where: { symbol } });
    const endPrice = new Decimal(asset.currentPrice.toString()).toNumber();

    const { points, stepSeconds } = rangeToPoints(range);
    const candles: Candle[] = [];
    let price = endPrice / (1 + volatilityFor(range) * 0.5);
    const now = Math.floor(Date.now() / 1000);

    for (let i = points; i >= 0; i--) {
      const time = now - i * stepSeconds;
      const drift = (seededRandom(symbol, time) - 0.48) * volatilityFor(range);
      const open = price;
      price = Math.max(price * (1 + drift), 0.01);
      const high = Math.max(open, price) * (1 + seededRandom(symbol, time + 1) * 0.004);
      const low = Math.min(open, price) * (1 - seededRandom(symbol, time + 2) * 0.004);
      const volume = Math.floor(seededRandom(symbol, time + 3) * 1_500_000) + 20_000;
      candles.push({ time, open, high, low, close: price, volume });
    }

    // Anchor the final candle to the asset's actual current price so the
    // chart always agrees with the quote shown next to it.
    if (candles.length > 0) candles[candles.length - 1].close = endPrice;
    return candles;
  }

  async getCompany(symbol: string): Promise<CompanyInfo> {
    const { db } = await import("@/lib/db");
    const asset = await db.asset.findUniqueOrThrow({ where: { symbol } });
    return {
      symbol: asset.symbol,
      name: asset.name,
      sector: asset.sector,
      marketCap: asset.marketCap ? new Decimal(asset.marketCap.toString()) : null,
      peRatio: asset.peRatio ? new Decimal(asset.peRatio.toString()) : null,
      dividendYield: asset.dividendYield ? new Decimal(asset.dividendYield.toString()) : null,
      week52High: asset.week52High ? new Decimal(asset.week52High.toString()) : null,
      week52Low: asset.week52Low ? new Decimal(asset.week52Low.toString()) : null,
      description: `${asset.name} (${asset.symbol}) trades on the ${asset.exchange}.`,
    };
  }

  async getNews(symbol: string): Promise<NewsItem[]> {
    const { db } = await import("@/lib/db");
    const asset = await db.asset.findUnique({ where: { symbol }, include: { marketEvents: { orderBy: { occurredAt: "desc" }, take: 10 } } });
    if (!asset) return [];
    return asset.marketEvents.map((e) => ({
      id: e.id,
      headline: e.title,
      summary: e.summary,
      url: "#",
      publishedAt: e.occurredAt,
      source: "Capa Market Desk",
    }));
  }

  async getMarketStatus(exchange: Exchange): Promise<MarketStatus> {
    const hours = EXCHANGE_HOURS[exchange];
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: hours.timezone,
      hour: "numeric",
      minute: "2-digit",
      hour12: false,
      weekday: "short",
    });
    const parts = formatter.formatToParts(new Date());
    const weekday = parts.find((p) => p.type === "weekday")?.value ?? "Mon";
    const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
    const minute = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
    const decimalHour = hour + minute / 60;
    const isWeekday = !["Sat", "Sun"].includes(weekday);
    const isOpen = isWeekday && decimalHour >= hours.openHour && decimalHour < hours.closeHour;

    return {
      exchange,
      isOpen,
      timezone: hours.timezone,
      localTime: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
    };
  }
}

function rangeToPoints(range: ChartRange): { points: number; stepSeconds: number } {
  switch (range) {
    case "1D":
      return { points: 78, stepSeconds: 5 * 60 };
    case "1W":
      return { points: 7 * 8, stepSeconds: 60 * 60 };
    case "1M":
      return { points: 30, stepSeconds: 24 * 60 * 60 };
    case "3M":
      return { points: 90, stepSeconds: 24 * 60 * 60 };
    case "6M":
      return { points: 180, stepSeconds: 24 * 60 * 60 };
    case "1Y":
      return { points: 52, stepSeconds: 7 * 24 * 60 * 60 };
    case "5Y":
      return { points: 60, stepSeconds: 30 * 24 * 60 * 60 };
    case "MAX":
      return { points: 96, stepSeconds: 30 * 24 * 60 * 60 };
  }
}

function volatilityFor(range: ChartRange): number {
  switch (range) {
    case "1D":
      return 0.006;
    case "1W":
      return 0.012;
    case "1M":
      return 0.02;
    default:
      return 0.035;
  }
}

export function getMarketDataProvider(): MarketDataProvider {
  return new MockMarketDataProvider();
}
