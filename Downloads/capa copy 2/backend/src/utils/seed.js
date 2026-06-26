import dotenv from 'dotenv';
dotenv.config();
import { prisma } from './db.js';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Seeding database...');

  // ── Admin user ─────────────────────────────────────────────
  const adminHash = await bcrypt.hash('Admin1234!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@capa.invest' },
    create: {
      email: 'admin@capa.invest',
      passwordHash: adminHash,
      firstName: 'Super',
      lastName: 'Admin',
      status: 'ACTIVE',
      kycStatus: 'APPROVED',
      referralCode: 'ADMIN0001',
    },
    update: {},
  });
  await prisma.userRole.upsert({
    where: { userId: admin.id },
    create: { userId: admin.id, role: 'SUPERADMIN', permissions: ['*'] },
    update: {},
  });
  console.log('✅ Admin user: admin@capa.invest / Admin1234!');

  // ── Demo investor ──────────────────────────────────────────
  const demoHash = await bcrypt.hash('Demo1234!', 12);
  const demo = await prisma.user.upsert({
    where: { email: 'demo@capa.invest' },
    create: {
      email: 'demo@capa.invest',
      passwordHash: demoHash,
      firstName: 'Demo',
      lastName: 'Investor',
      countryOfResidence: 'KE',
      status: 'ACTIVE',
      kycStatus: 'APPROVED',
      referralCode: 'DEMO0001',
      accounts: {
        create: {
          accountNumber: 'IG00000001',
          isPrimary: true,
          baseCurrency: 'USD',
          balances: {
            create: [
              { currency: 'USD', available: 10000 },
              { currency: 'KES', available: 500000 },
              { currency: 'GBP', available: 5000 },
            ],
          },
        },
      },
      watchlists: { create: { name: 'My Watchlist', isDefault: true } },
    },
    update: {},
  });
  console.log('✅ Demo user: demo@capa.invest / Demo1234!');

  // ── Assets ─────────────────────────────────────────────────
  const assets = [
    // US Stocks
    { symbol: 'AAPL',  exchange: 'NASDAQ', name: 'Apple Inc.',             assetClass: 'STOCK', currency: 'USD', sector: 'Technology',    isFractional: true,  startPrice: 189.50 },
    { symbol: 'MSFT',  exchange: 'NASDAQ', name: 'Microsoft Corporation',  assetClass: 'STOCK', currency: 'USD', sector: 'Technology',    isFractional: true,  startPrice: 374.00 },
    { symbol: 'GOOGL', exchange: 'NASDAQ', name: 'Alphabet Inc.',          assetClass: 'STOCK', currency: 'USD', sector: 'Technology',    isFractional: true,  startPrice: 140.20 },
    { symbol: 'AMZN',  exchange: 'NASDAQ', name: 'Amazon.com Inc.',        assetClass: 'STOCK', currency: 'USD', sector: 'Consumer',      isFractional: true,  startPrice: 178.35 },
    { symbol: 'TSLA',  exchange: 'NASDAQ', name: 'Tesla Inc.',             assetClass: 'STOCK', currency: 'USD', sector: 'Automotive',    isFractional: true,  startPrice: 242.80 },
    { symbol: 'NVDA',  exchange: 'NASDAQ', name: 'NVIDIA Corporation',     assetClass: 'STOCK', currency: 'USD', sector: 'Technology',    isFractional: true,  startPrice: 495.00 },
    { symbol: 'JPM',   exchange: 'NYSE',   name: 'JPMorgan Chase & Co.',   assetClass: 'STOCK', currency: 'USD', sector: 'Financials',    isFractional: true,  startPrice: 198.20 },
    { symbol: 'META',  exchange: 'NASDAQ', name: 'Meta Platforms Inc.',    assetClass: 'STOCK', currency: 'USD', sector: 'Technology',    isFractional: true,  startPrice: 505.00 },
    // US ETFs
    { symbol: 'SPY',   exchange: 'NYSE',   name: 'SPDR S&P 500 ETF',       assetClass: 'ETF',   currency: 'USD', sector: 'Diversified',   isFractional: true,  startPrice: 478.00 },
    { symbol: 'QQQ',   exchange: 'NASDAQ', name: 'Invesco QQQ Trust',      assetClass: 'ETF',   currency: 'USD', sector: 'Technology',    isFractional: true,  startPrice: 410.00 },
    { symbol: 'VTI',   exchange: 'NYSE',   name: 'Vanguard Total Market',  assetClass: 'ETF',   currency: 'USD', sector: 'Diversified',   isFractional: true,  startPrice: 240.00 },
    { symbol: 'VWO',   exchange: 'NYSE',   name: 'Vanguard Emerging Mkts', assetClass: 'ETF',   currency: 'USD', sector: 'Emerging',      isFractional: true,  startPrice: 42.50  },
    // UK Stocks
    { symbol: 'BARC',  exchange: 'LSE',    name: 'Barclays PLC',           assetClass: 'STOCK', currency: 'GBP', sector: 'Financials',    isFractional: false, startPrice: 1.85   },
    { symbol: 'SHEL',  exchange: 'LSE',    name: 'Shell PLC',              assetClass: 'STOCK', currency: 'GBP', sector: 'Energy',        isFractional: false, startPrice: 26.40  },
    { symbol: 'LLOY',  exchange: 'LSE',    name: 'Lloyds Banking Group',   assetClass: 'STOCK', currency: 'GBP', sector: 'Financials',    isFractional: false, startPrice: 0.52   },
    { symbol: 'VOD',   exchange: 'LSE',    name: 'Vodafone Group PLC',     assetClass: 'STOCK', currency: 'GBP', sector: 'Telecom',       isFractional: false, startPrice: 0.72   },
    { symbol: 'BP',    exchange: 'LSE',    name: 'BP PLC',                 assetClass: 'STOCK', currency: 'GBP', sector: 'Energy',        isFractional: false, startPrice: 4.80   },
    { symbol: 'AZN',   exchange: 'LSE',    name: 'AstraZeneca PLC',        assetClass: 'STOCK', currency: 'GBP', sector: 'Healthcare',    isFractional: false, startPrice: 112.00 },
    // UK ETFs
    { symbol: 'ISF',   exchange: 'LSE',    name: 'iShares Core FTSE 100',  assetClass: 'ETF',   currency: 'GBP', sector: 'Diversified',   isFractional: false, startPrice: 7.80   },
    { symbol: 'VUKE',  exchange: 'LSE',    name: 'Vanguard FTSE 100',      assetClass: 'ETF',   currency: 'GBP', sector: 'Diversified',   isFractional: false, startPrice: 37.50  },
    // Kenyan Stocks
    { symbol: 'SCOM',  exchange: 'NSE',    name: 'Safaricom PLC',          assetClass: 'STOCK', currency: 'KES', sector: 'Telecom',       isFractional: false, startPrice: 18.50  },
    { symbol: 'EQTY',  exchange: 'NSE',    name: 'Equity Group Holdings',  assetClass: 'STOCK', currency: 'KES', sector: 'Financials',    isFractional: false, startPrice: 42.00  },
    { symbol: 'KPLC',  exchange: 'NSE',    name: 'Kenya Power & Lighting', assetClass: 'STOCK', currency: 'KES', sector: 'Utilities',     isFractional: false, startPrice: 2.10   },
    { symbol: 'BATK',  exchange: 'NSE',    name: 'BAT Kenya PLC',          assetClass: 'STOCK', currency: 'KES', sector: 'Consumer',      isFractional: false, startPrice: 425.00 },
    { symbol: 'COOP',  exchange: 'NSE',    name: 'Co-operative Bank',      assetClass: 'STOCK', currency: 'KES', sector: 'Financials',    isFractional: false, startPrice: 13.80  },
    { symbol: 'KCB',   exchange: 'NSE',    name: 'KCB Group PLC',          assetClass: 'STOCK', currency: 'KES', sector: 'Financials',    isFractional: false, startPrice: 28.50  },
    { symbol: 'EABL',  exchange: 'NSE',    name: 'East African Breweries', assetClass: 'STOCK', currency: 'KES', sector: 'Consumer',      isFractional: false, startPrice: 168.00 },
    { symbol: 'ABSA',  exchange: 'NSE',    name: 'ABSA Bank Kenya',        assetClass: 'STOCK', currency: 'KES', sector: 'Financials',    isFractional: false, startPrice: 14.00  },
  ];

  for (const a of assets) {
    const { startPrice, ...assetData } = a;
    const asset = await prisma.asset.upsert({
      where: { symbol_exchange: { symbol: a.symbol, exchange: a.exchange } },
      create: assetData,
      update: { name: a.name },
    });

    const prev = startPrice * 0.99;
    await prisma.assetPrice.upsert({
      where: { assetId: asset.id },
      create: {
        assetId: asset.id,
        price: startPrice,
        open: prev * 1.002,
        high: startPrice * 1.008,
        low: prev * 0.995,
        previousClose: prev,
        changeAmount: startPrice - prev,
        changePercent: ((startPrice - prev) / prev) * 100,
        volume: Math.floor(Math.random() * 10_000_000) + 500_000,
        weekHigh52: startPrice * 1.35,
        weekLow52: startPrice * 0.65,
      },
      update: { price: startPrice },
    });
  }
  console.log(`✅ ${assets.length} assets seeded`);

  // ── Demo dividends ─────────────────────────────────────────
  const aapl = await prisma.asset.findFirst({ where: { symbol: 'AAPL' } });
  if (aapl) {
    await prisma.dividend.upsert({
      where: { id: 'seed-div-aapl-2024' },
      create: {
        id: 'seed-div-aapl-2024',
        assetId: aapl.id,
        exDividendDate: new Date('2024-02-09'),
        recordDate: new Date('2024-02-12'),
        payDate: new Date('2024-02-15'),
        amountPerShare: 0.24,
        currency: 'USD',
        dividendType: 'regular',
      },
      update: {},
    });
  }
  console.log('✅ Sample dividends seeded');

  // ── Demo positions for demo account ───────────────────────
  const demoAccount = await prisma.investmentAccount.findFirst({ where: { userId: demo.id } });
  if (demoAccount && aapl) {
    const msft = await prisma.asset.findFirst({ where: { symbol: 'MSFT' } });
    const scom = await prisma.asset.findFirst({ where: { symbol: 'SCOM' } });

    const positionData = [
      { asset: aapl, qty: 5.25, costPrice: 175.00 },
      { asset: msft, qty: 3.0,  costPrice: 350.00 },
      { asset: scom, qty: 500,  costPrice: 16.00  },
    ].filter(p => p.asset);

    for (const { asset, qty, costPrice } of positionData) {
      await prisma.position.upsert({
        where: { accountId_assetId: { accountId: demoAccount.id, assetId: asset.id } },
        create: { accountId: demoAccount.id, assetId: asset.id, quantity: qty, avgCostPrice: costPrice, totalInvested: qty * costPrice },
        update: {},
      });
    }
    console.log('✅ Demo positions seeded');
  }

  console.log('\n🎉 Seed complete!\n');
  console.log('  Admin:  admin@capa.invest / Admin1234!');
  console.log('  Demo:   demo@capa.invest  / Demo1234!\n');
}

seed()
  .catch(e => { console.error('Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
