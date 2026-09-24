import "dotenv/config";
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

/**
 * Clears rows this script creates fresh each run (orders/trades/social data),
 * so re-running the seed is idempotent instead of duplicating holdings and
 * follower counts. Scoped to whatever DATABASE_URL points at — this repo's
 * local dev database — never touches anything outside this Prisma client.
 */
async function resetSeedData() {
  await db.circlePost.deleteMany();
  await db.circleMember.deleteMany();
  await db.circle.deleteMany();
  await db.thesisFollow.deleteMany();
  await db.thesisVersion.deleteMany();
  await db.post.deleteMany();
  await db.thesis.deleteMany();
  await db.follow.deleteMany();
  await db.investmentMilestone.deleteMany();
  await db.notification.deleteMany();
  await db.trade.deleteMany();
  await db.order.deleteMany();
  await db.holding.deleteMany();
  await db.watchlistItem.deleteMany();
  await db.watchlist.deleteMany();
  await db.transaction.deleteMany();
  await db.marketEvent.deleteMany();
  await db.kYCApplication.deleteMany();
  await db.wallet.deleteMany();
  await db.account.deleteMany();
  await db.profile.deleteMany();
}

async function main() {
  console.log("Resetting previous seed data…");
  await resetSeedData();

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
  const createdTrades: { userId: string; tradeId: string; assetId: string; quantity: number; price: number }[] = [];
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
      const trade = await db.trade.create({
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
      createdTrades.push({ userId: user.id, tradeId: trade.id, assetId: asset.id, quantity, price: fillPrice });
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

  console.log("Seeding follows…");
  for (const user of users) {
    const others = users.filter((u) => u.id !== user.id).sort(() => Math.random() - 0.5).slice(0, randomInt(1, 3));
    for (const target of others) {
      const existing = await db.follow.findUnique({ where: { followerId_followingId: { followerId: user.id, followingId: target.id } } });
      if (existing) continue;
      await db.follow.create({ data: { followerId: user.id, followingId: target.id } });
      await db.profile.update({ where: { userId: target.id }, data: { followerCount: { increment: 1 } } });
      await db.profile.update({ where: { userId: user.id }, data: { followingCount: { increment: 1 } } });
    }
  }

  console.log("Seeding verified-trade posts…");
  for (const t of createdTrades.slice(0, 12)) {
    if (Math.random() > 0.6) continue; // only some trades get shared
    await db.post.create({
      data: {
        userId: t.userId,
        type: "VERIFIED_TRADE",
        content: pick([
          "Adding to a position I believe in for the long run.",
          "Started small, will build this up over time.",
          "",
          "Dividend play — happy to hold through the noise.",
        ]),
        tradeId: t.tradeId,
      },
    });
  }

  console.log("Seeding commentary posts…");
  const COMMENTARY = [
    "Anyone else watching the NSE this week? Volumes look thin.",
    "US tech earnings season is going to be interesting — margins are the story, not revenue.",
    "Rebalanced my portfolio today, trimmed one position that had grown too large.",
    "Reminder: diversification isn't exciting, but neither is a 40% drawdown.",
    "Dividend investors — what's your minimum yield cutoff?",
  ];
  for (const text of COMMENTARY) {
    await db.post.create({ data: { userId: pick(users).id, type: "COMMENTARY", content: text } });
  }

  console.log("Seeding investment theses…");
  const THESES = [
    { symbol: "SCOM", direction: "BULL" as const, title: "Dividend + long-term growth", reason: "DIVIDEND" as const, horizon: "12 months" },
    { symbol: "NVDA", direction: "BULL" as const, title: "AI infrastructure demand still underestimated", reason: "LONG_TERM_GROWTH" as const, horizon: "24 months" },
    { symbol: "TSLA", direction: "BEAR" as const, title: "Valuation has run too far ahead of deliveries", reason: "TECHNICAL_SETUP" as const, horizon: "6 months" },
    { symbol: "EQTY", direction: "BULL" as const, title: "Undervalued relative to regional peers", reason: "UNDERVALUED" as const, horizon: "18 months" },
  ];
  for (const t of THESES) {
    const asset = allAssets.find((a) => a.symbol === t.symbol)!;
    const author = pick(users);
    const entryPrice = Number(asset.currentPrice) * (1 - randomInt(-800, 800) / 10000);
    const thesis = await db.thesis.create({
      data: {
        userId: author.id,
        assetId: asset.id,
        direction: t.direction,
        title: t.title,
        entryPrice,
        targetPrice: entryPrice * (t.direction === "BULL" ? 1.25 : 0.8),
        timeHorizon: t.horizon,
        reason: t.reason,
        body: `I believe ${asset.symbol} is worth watching closely. ${t.title}. This is a sandbox thesis for demonstration purposes.`,
        riskFactors: "Macro conditions, regulatory changes, and company-specific execution risk could all invalidate this thesis.",
        likeCount: randomInt(2, 40),
      },
    });
    await db.post.create({
      data: { userId: author.id, type: "THESIS", content: "", thesisId: thesis.id },
    });
    const followers = users.filter((u) => u.id !== author.id).sort(() => Math.random() - 0.5).slice(0, randomInt(1, 4));
    for (const f of followers) {
      await db.thesisFollow.create({ data: { userId: f.id, thesisId: thesis.id } }).catch(() => {});
    }
    await db.thesis.update({ where: { id: thesis.id }, data: { followCount: followers.length } });
  }

  console.log("Seeding circles…");
  const CIRCLES = [
    { name: "Kenyan Investors", description: "Discussion and research on NSE-listed companies." },
    { name: "US Tech Investors", description: "Following US technology stocks and earnings." },
    { name: "Dividend Investors", description: "Sharing dividend-paying stocks and yield strategies." },
  ];
  for (const c of CIRCLES) {
    const owner = pick(users);
    const slug = `${c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${randomInt(1000, 9999)}`;
    const circle = await db.circle.create({
      data: { name: c.name, description: c.description, slug, ownerId: owner.id, visibility: "PUBLIC", memberCount: 1 },
    });
    await db.circleMember.create({ data: { circleId: circle.id, userId: owner.id, role: "OWNER" } });
    const members = users.filter((u) => u.id !== owner.id).sort(() => Math.random() - 0.5).slice(0, randomInt(2, 4));
    for (const m of members) {
      await db.circleMember.create({ data: { circleId: circle.id, userId: m.id, role: "MEMBER" } });
    }
    await db.circle.update({ where: { id: circle.id }, data: { memberCount: members.length + 1 } });
    await db.circlePost.create({
      data: { circleId: circle.id, userId: owner.id, content: `Welcome to ${c.name}! Share your research and questions here.` },
    });
  }

  console.log("Seeding investment milestones…");
  for (const user of users.slice(0, 3)) {
    await db.investmentMilestone.createMany({
      data: [
        { userId: user.id, title: "Started investing", description: "Joined Capa and made a first contribution.", occurredAt: new Date(2026, 0, 15), isPublic: true },
        { userId: user.id, title: "First thesis published", description: "Shared reasoning behind a position for the first time.", occurredAt: new Date(2026, 4, 3), isPublic: true },
      ],
    });
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
