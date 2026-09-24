import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, AssetRegion, AssetClass, Exchange } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

const ASSETS: Array<{
  symbol: string;
  name: string;
  exchange: Exchange;
  assetClass: AssetClass;
  region: AssetRegion;
  sector: string;
  currency: string;
  price: number;
  peRatio: number | null;
  dividendYield: number | null;
  marketCap: number | null;
}> = [
  { symbol: "SCOM", name: "Safaricom PLC", exchange: "NSE", assetClass: "STOCK", region: "KE", sector: "Telecommunications", currency: "KES", price: 28.05, peRatio: 12.4, dividendYield: 5.8, marketCap: 1_123_000_000_000 },
  { symbol: "EQTY", name: "Equity Group Holdings", exchange: "NSE", assetClass: "STOCK", region: "KE", sector: "Financials", currency: "KES", price: 52.75, peRatio: 6.1, dividendYield: 7.2, marketCap: 199_000_000_000 },
  { symbol: "KCB", name: "KCB Group PLC", exchange: "NSE", assetClass: "STOCK", region: "KE", sector: "Financials", currency: "KES", price: 41.2, peRatio: 4.8, dividendYield: 6.5, marketCap: 131_000_000_000 },
  { symbol: "COOP", name: "Co-operative Bank of Kenya", exchange: "NSE", assetClass: "STOCK", region: "KE", sector: "Financials", currency: "KES", price: 16.85, peRatio: 5.3, dividendYield: 8.1, marketCap: 92_000_000_000 },
  { symbol: "AAPL", name: "Apple Inc.", exchange: "NASDAQ", assetClass: "STOCK", region: "US", sector: "Technology", currency: "USD", price: 231.42, peRatio: 34.2, dividendYield: 0.45, marketCap: 3_540_000_000_000 },
  { symbol: "NVDA", name: "NVIDIA Corporation", exchange: "NASDAQ", assetClass: "STOCK", region: "US", sector: "Technology", currency: "USD", price: 138.07, peRatio: 55.6, dividendYield: 0.03, marketCap: 3_390_000_000_000 },
  { symbol: "MSFT", name: "Microsoft Corporation", exchange: "NASDAQ", assetClass: "STOCK", region: "US", sector: "Technology", currency: "USD", price: 421.33, peRatio: 36.1, dividendYield: 0.72, marketCap: 3_130_000_000_000 },
  { symbol: "AMZN", name: "Amazon.com, Inc.", exchange: "NASDAQ", assetClass: "STOCK", region: "US", sector: "Consumer Discretionary", currency: "USD", price: 197.55, peRatio: 41.8, dividendYield: null, marketCap: 2_060_000_000_000 },
  { symbol: "GOOGL", name: "Alphabet Inc.", exchange: "NASDAQ", assetClass: "STOCK", region: "US", sector: "Communication Services", currency: "USD", price: 172.91, peRatio: 23.4, dividendYield: 0.44, marketCap: 2_130_000_000_000 },
  { symbol: "TSLA", name: "Tesla, Inc.", exchange: "NASDAQ", assetClass: "STOCK", region: "US", sector: "Consumer Discretionary", currency: "USD", price: 248.98, peRatio: 68.9, dividendYield: null, marketCap: 793_000_000_000 },
  { symbol: "VOO", name: "Vanguard S&P 500 ETF", exchange: "NYSE", assetClass: "ETF", region: "GLOBAL", sector: "Diversified", currency: "USD", price: 512.34, peRatio: null, dividendYield: 1.28, marketCap: null },
  { symbol: "QQQ", name: "Invesco QQQ Trust", exchange: "NASDAQ", assetClass: "ETF", region: "GLOBAL", sector: "Diversified", currency: "USD", price: 481.09, peRatio: null, dividendYield: 0.58, marketCap: null },
];

const DEMO_USERS = [
  { email: "demo@capa.invest", username: "demo", name: "Demo Investor" },
  { email: "amara@capa.invest", username: "amara", name: "Amara Otieno" },
  { email: "brian@capa.invest", username: "brian_k", name: "Brian Kimani" },
  { email: "faith@capa.invest", username: "faithw", name: "Faith Wanjiru" },
  { email: "james@capa.invest", username: "james_m", name: "James Mwangi" },
  { email: "lindiwe@capa.invest", username: "lindiwe", name: "Lindiwe Ndlovu" },
];

const REASONS = ["LONG_TERM_GROWTH", "DIVIDEND", "UNDERVALUED", "TECHNICAL_SETUP", "SHORT_TERM_TRADE", "DIVERSIFICATION"] as const;

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: readonly T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

async function main() {
  console.log("Seeding assets…");
  for (const a of ASSETS) {
    await db.asset.upsert({
      where: { symbol: a.symbol },
      create: {
        symbol: a.symbol,
        name: a.name,
        exchange: a.exchange,
        assetClass: a.assetClass,
        region: a.region,
        sector: a.sector,
        currency: a.currency,
        currentPrice: a.price,
        previousClose: a.price * (1 - randomInt(-150, 150) / 10000),
        dayChangePercent: 0,
        peRatio: a.peRatio,
        dividendYield: a.dividendYield,
        marketCap: a.marketCap,
        week52High: a.price * 1.28,
        week52Low: a.price * 0.71,
      },
      update: {},
    });
  }

  console.log("Seeding market metadata…");
  await db.market.upsert({
    where: { code: "NSE" },
    create: { code: "NSE", name: "Nairobi Securities Exchange", timezone: "Africa/Nairobi", openTime: "09:00", closeTime: "15:00" },
    update: {},
  });
  await db.market.upsert({
    where: { code: "NYSE" },
    create: { code: "NYSE", name: "New York Stock Exchange", timezone: "America/New_York", openTime: "09:30", closeTime: "16:00" },
    update: {},
  });
  await db.market.upsert({
    where: { code: "NASDAQ" },
    create: { code: "NASDAQ", name: "Nasdaq", timezone: "America/New_York", openTime: "09:30", closeTime: "16:00" },
    update: {},
  });

  console.log("Seeding market events…");
  const scom = await db.asset.findUniqueOrThrow({ where: { symbol: "SCOM" } });
  const nvda = await db.asset.findUniqueOrThrow({ where: { symbol: "NVDA" } });
  await db.marketEvent.createMany({
    data: [
      { assetId: scom.id, title: "Safaricom announces interim dividend", summary: "The board approved an interim dividend of KES 0.65 per share, payable next quarter.", category: "DIVIDEND", occurredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      { assetId: scom.id, title: "M-Pesa transaction volumes up 14% year-on-year", summary: "Safaricom's Q2 update shows continued growth in mobile money transaction volume across East Africa.", category: "NEWS", occurredAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) },
      { assetId: nvda.id, title: "NVIDIA beats quarterly data-center revenue estimates", summary: "Data-center revenue rose sharply on continued AI infrastructure demand.", category: "EARNINGS", occurredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
    ],
    skipDuplicates: true,
  });

  console.log("Seeding users…");
  const passwordHash = await bcrypt.hash("Demo1234!", 10);
  const users = [];
  for (const u of DEMO_USERS) {
    const user = await db.user.upsert({
      where: { email: u.email },
      create: { email: u.email, username: u.username, name: u.name, passwordHash },
      update: {},
    });
    await db.profile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, interests: [pick(["Kenya", "US", "Global", "ETFs"])] },
      update: {},
    });
    await db.account.upsert({
      where: { userId: user.id },
      create: { userId: user.id, accountNumber: `CAPA-${randomInt(100000, 999999)}` },
      update: {},
    });
    await db.wallet.upsert({
      where: { userId: user.id },
      create: { userId: user.id, cashBalance: randomInt(20000, 500000) },
      update: {},
    });
    users.push(user);
  }

  console.log("Seeding admin…");
  await db.user.upsert({
    where: { email: "admin@capa.invest" },
    create: { email: "admin@capa.invest", username: "admin", name: "Capa Admin", passwordHash, role: "ADMIN" },
    update: { role: "ADMIN" },
  });
  const admin = await db.user.findUniqueOrThrow({ where: { email: "admin@capa.invest" } });
  await db.profile.upsert({ where: { userId: admin.id }, create: { userId: admin.id }, update: {} });
  await db.account.upsert({
    where: { userId: admin.id },
    create: { userId: admin.id, accountNumber: `CAPA-${randomInt(100000, 999999)}` },
    update: {},
  });
  await db.wallet.upsert({ where: { userId: admin.id }, create: { userId: admin.id, cashBalance: 1_000_000 }, update: {} });

  console.log("Seeding holdings, orders, and trades…");
  const allAssets = await db.asset.findMany();
  for (const user of users) {
    const wallet = await db.wallet.findUniqueOrThrow({ where: { userId: user.id } });
    let cash = Number(wallet.cashBalance);

    const numPositions = randomInt(1, 4);
    const chosenAssets = [...allAssets].sort(() => Math.random() - 0.5).slice(0, numPositions);

    for (const asset of chosenAssets) {
      const price = Number(asset.currentPrice);
      const maxAffordable = Math.floor(cash * 0.3 / price);
      const quantity = Math.max(1, Math.min(maxAffordable, randomInt(1, 50)));
      if (quantity < 1 || price * quantity > cash) continue;

      const fillPrice = price * (1 - randomInt(-500, 500) / 10000);
      const total = fillPrice * quantity;
      const fee = Math.max(total * 0.005, 10);
      cash -= total + fee;

      const order = await db.order.create({
        data: {
          userId: user.id,
          assetId: asset.id,
          side: "BUY",
          type: "MARKET",
          quantity,
          estimatedTotal: total,
          fee,
          status: "FILLED",
          filledAt: new Date(Date.now() - randomInt(1, 20) * 24 * 60 * 60 * 1000),
          filledPrice: fillPrice,
          reason: Math.random() > 0.3 ? pick(REASONS) : null,
        },
      });
      await db.trade.create({
        data: {
          orderId: order.id,
          userId: user.id,
          assetId: asset.id,
          side: "BUY",
          quantity,
          price: fillPrice,
          fee,
          executedAt: order.filledAt!,
        },
      });
      await db.holding.upsert({
        where: { userId_assetId: { userId: user.id, assetId: asset.id } },
        create: { userId: user.id, assetId: asset.id, quantity, avgPrice: fillPrice },
        update: { quantity: { increment: quantity } },
      });
    }

    await db.wallet.update({ where: { userId: user.id }, data: { cashBalance: Math.max(cash, 0) } });

    const watchlist =
      (await db.watchlist.findFirst({ where: { userId: user.id } })) ??
      (await db.watchlist.create({ data: { userId: user.id, name: "My Watchlist" } }));

    const watchAssets = [...allAssets].sort(() => Math.random() - 0.5).slice(0, randomInt(1, 3));
    for (const asset of watchAssets) {
      await db.watchlistItem.upsert({
        where: { watchlistId_assetId: { watchlistId: watchlist.id, assetId: asset.id } },
        create: { watchlistId: watchlist.id, assetId: asset.id },
        update: {},
      });
    }
  }

  console.log("Seed complete.");
  console.log("Demo login: demo@capa.invest / Demo1234!");
  console.log("Admin login: admin@capa.invest / Demo1234!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
