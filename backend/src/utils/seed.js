import dotenv from 'dotenv';
dotenv.config();
import { prisma } from './db.js';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Seeding database...');

  // ── Remove demo user (delete related data first to respect FK RESTRICT) ──
  const demoUser = await prisma.user.findUnique({ where: { email: 'demo@capa.invest' } });
  if (demoUser) {
    const accounts = await prisma.investmentAccount.findMany({ where: { userId: demoUser.id }, select: { id: true } });
    const accountIds = accounts.map(a => a.id);
    if (accountIds.length) {
      await prisma.transaction.deleteMany({ where: { accountId: { in: accountIds } } });
      await prisma.order.deleteMany({ where: { accountId: { in: accountIds } } });
      await prisma.position.deleteMany({ where: { accountId: { in: accountIds } } });
      await prisma.dividendPayment.deleteMany({ where: { accountId: { in: accountIds } } });
    }
    await prisma.user.delete({ where: { id: demoUser.id } });
    console.log('✅ Demo user removed');
  } else {
    console.log('✅ No demo user to remove');
  }

  // ── Admin user ─────────────────────────────────────────────
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminHash = await bcrypt.hash(adminPassword || 'Admin1234!', 12);
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
    update: adminPassword ? { passwordHash: adminHash } : {},
  });
  await prisma.userRole.upsert({
    where: { userId: admin.id },
    create: { userId: admin.id, role: 'SUPERADMIN', permissions: ['*'] },
    update: {},
  });
  console.log('✅ Admin user ready: admin@capa.invest');

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
    // ── NSE Kenya (all listed stocks) ──────────────────────────
    { symbol: 'SCOM',  exchange: 'NSE', name: 'Safaricom PLC',                  assetClass: 'STOCK', currency: 'KES', sector: 'Telecom',       isFractional: false, startPrice: 33.60  },
    { symbol: 'EQTY',  exchange: 'NSE', name: 'Equity Group Holdings',          assetClass: 'STOCK', currency: 'KES', sector: 'Financials',    isFractional: false, startPrice: 79.75  },
    { symbol: 'KCB',   exchange: 'NSE', name: 'KCB Group PLC',                  assetClass: 'STOCK', currency: 'KES', sector: 'Financials',    isFractional: false, startPrice: 76.00  },
    { symbol: 'ABSA',  exchange: 'NSE', name: 'ABSA Bank Kenya',                assetClass: 'STOCK', currency: 'KES', sector: 'Financials',    isFractional: false, startPrice: 32.50  },
    { symbol: 'COOP',  exchange: 'NSE', name: 'Co-operative Bank',              assetClass: 'STOCK', currency: 'KES', sector: 'Financials',    isFractional: false, startPrice: 34.50  },
    { symbol: 'NCBA',  exchange: 'NSE', name: 'NCBA Group PLC',                 assetClass: 'STOCK', currency: 'KES', sector: 'Financials',    isFractional: false, startPrice: 91.75  },
    { symbol: 'SCBK',  exchange: 'NSE', name: 'Standard Chartered Bank Kenya',  assetClass: 'STOCK', currency: 'KES', sector: 'Financials',    isFractional: false, startPrice: 334.75 },
    { symbol: 'DTK',   exchange: 'NSE', name: 'Diamond Trust Bank Kenya',       assetClass: 'STOCK', currency: 'KES', sector: 'Financials',    isFractional: false, startPrice: 141.00 },
    { symbol: 'IMH',   exchange: 'NSE', name: 'I&M Holdings PLC',               assetClass: 'STOCK', currency: 'KES', sector: 'Financials',    isFractional: false, startPrice: 65.75  },
    { symbol: 'SBIC',  exchange: 'NSE', name: 'Stanbic Holdings PLC',           assetClass: 'STOCK', currency: 'KES', sector: 'Financials',    isFractional: false, startPrice: 290.00 },
    { symbol: 'FMLY',  exchange: 'NSE', name: 'Family Bank Ltd',                assetClass: 'STOCK', currency: 'KES', sector: 'Financials',    isFractional: false, startPrice: 24.50  },
    { symbol: 'HFCK',  exchange: 'NSE', name: 'HF Group Ltd',                   assetClass: 'STOCK', currency: 'KES', sector: 'Financials',    isFractional: false, startPrice: 9.50   },
    { symbol: 'BKG',   exchange: 'NSE', name: 'BK Group PLC',                   assetClass: 'STOCK', currency: 'KES', sector: 'Financials',    isFractional: false, startPrice: 53.75  },
    { symbol: 'JUB',   exchange: 'NSE', name: 'Jubilee Holdings Ltd',           assetClass: 'STOCK', currency: 'KES', sector: 'Insurance',     isFractional: false, startPrice: 360.00 },
    { symbol: 'BRIT',  exchange: 'NSE', name: 'Britam Holdings Ltd',            assetClass: 'STOCK', currency: 'KES', sector: 'Insurance',     isFractional: false, startPrice: 12.75  },
    { symbol: 'CIC',   exchange: 'NSE', name: 'CIC Insurance Group Ltd',        assetClass: 'STOCK', currency: 'KES', sector: 'Insurance',     isFractional: false, startPrice: 4.47   },
    { symbol: 'KNRE',  exchange: 'NSE', name: 'Kenya Re-Insurance Corporation', assetClass: 'STOCK', currency: 'KES', sector: 'Insurance',     isFractional: false, startPrice: 3.32   },
    { symbol: 'SLAM',  exchange: 'NSE', name: 'Sanlam Kenya PLC',               assetClass: 'STOCK', currency: 'KES', sector: 'Insurance',     isFractional: false, startPrice: 7.80   },
    { symbol: 'LBTY',  exchange: 'NSE', name: 'Liberty Kenya Holdings Ltd',     assetClass: 'STOCK', currency: 'KES', sector: 'Insurance',     isFractional: false, startPrice: 9.12   },
    { symbol: 'OCH',   exchange: 'NSE', name: 'Olympia Capital Holdings Ltd',   assetClass: 'STOCK', currency: 'KES', sector: 'Financials',    isFractional: false, startPrice: 7.08   },
    { symbol: 'EABL',  exchange: 'NSE', name: 'East African Breweries Ltd',     assetClass: 'STOCK', currency: 'KES', sector: 'Consumer',      isFractional: false, startPrice: 270.50 },
    { symbol: 'BATK',  exchange: 'NSE', name: 'BAT Kenya PLC',                  assetClass: 'STOCK', currency: 'KES', sector: 'Consumer',      isFractional: false, startPrice: 546.00 },
    { symbol: 'UNGA',  exchange: 'NSE', name: 'Unga Group Ltd',                 assetClass: 'STOCK', currency: 'KES', sector: 'Consumer',      isFractional: false, startPrice: 26.50  },
    { symbol: 'CRWN',  exchange: 'NSE', name: 'Crown Paints Kenya Ltd',         assetClass: 'STOCK', currency: 'KES', sector: 'Consumer',      isFractional: false, startPrice: 61.25  },
    { symbol: 'SMER',  exchange: 'NSE', name: 'Sameer Africa PLC',              assetClass: 'STOCK', currency: 'KES', sector: 'Consumer',      isFractional: false, startPrice: 14.75  },
    { symbol: 'CGEN',  exchange: 'NSE', name: 'Car and General Kenya Ltd',      assetClass: 'STOCK', currency: 'KES', sector: 'Consumer',      isFractional: false, startPrice: 107.25 },
    { symbol: 'UCHM',  exchange: 'NSE', name: 'Uchumi Supermarket Ltd',         assetClass: 'STOCK', currency: 'KES', sector: 'Consumer',      isFractional: false, startPrice: 1.70   },
    { symbol: 'EVRD',  exchange: 'NSE', name: 'Eveready East Africa Ltd',       assetClass: 'STOCK', currency: 'KES', sector: 'Consumer',      isFractional: false, startPrice: 1.04   },
    { symbol: 'FTGH',  exchange: 'NSE', name: 'Flame Tree Group Holdings',      assetClass: 'STOCK', currency: 'KES', sector: 'Consumer',      isFractional: false, startPrice: 1.85   },
    { symbol: 'SKL',   exchange: 'NSE', name: 'Shri Krishana Overseas Ltd',     assetClass: 'STOCK', currency: 'KES', sector: 'Consumer',      isFractional: false, startPrice: 9.68   },
    { symbol: 'TOTL',  exchange: 'NSE', name: 'Total Kenya Ltd',                assetClass: 'STOCK', currency: 'KES', sector: 'Energy',        isFractional: false, startPrice: 42.95  },
    { symbol: 'KPLC',  exchange: 'NSE', name: 'Kenya Power & Lighting Co.',     assetClass: 'STOCK', currency: 'KES', sector: 'Utilities',     isFractional: false, startPrice: 17.40  },
    { symbol: 'KEGN',  exchange: 'NSE', name: 'KenGen PLC',                     assetClass: 'STOCK', currency: 'KES', sector: 'Utilities',     isFractional: false, startPrice: 9.90   },
    { symbol: 'KPC',   exchange: 'NSE', name: 'Kenya Pipeline Company',         assetClass: 'STOCK', currency: 'KES', sector: 'Energy',        isFractional: false, startPrice: 9.10   },
    { symbol: 'UMME',  exchange: 'NSE', name: 'Umeme Ltd',                      assetClass: 'STOCK', currency: 'KES', sector: 'Utilities',     isFractional: false, startPrice: 7.48   },
    { symbol: 'KQ',    exchange: 'NSE', name: 'Kenya Airways Ltd',              assetClass: 'STOCK', currency: 'KES', sector: 'Transport',     isFractional: false, startPrice: 5.56   },
    { symbol: 'XPRS',  exchange: 'NSE', name: 'Express Kenya Ltd',              assetClass: 'STOCK', currency: 'KES', sector: 'Transport',     isFractional: false, startPrice: 7.18   },
    { symbol: 'KAPC',  exchange: 'NSE', name: 'Kapchorua Tea Company Ltd',      assetClass: 'STOCK', currency: 'KES', sector: 'Agriculture',   isFractional: false, startPrice: 298.75 },
    { symbol: 'KUKZ',  exchange: 'NSE', name: 'Kakuzi Ltd',                     assetClass: 'STOCK', currency: 'KES', sector: 'Agriculture',   isFractional: false, startPrice: 437.25 },
    { symbol: 'LIMT',  exchange: 'NSE', name: 'Limuru Tea Company Ltd',         assetClass: 'STOCK', currency: 'KES', sector: 'Agriculture',   isFractional: false, startPrice: 538.00 },
    { symbol: 'SASN',  exchange: 'NSE', name: 'Sasini Tea and Coffee Ltd',      assetClass: 'STOCK', currency: 'KES', sector: 'Agriculture',   isFractional: false, startPrice: 22.40  },
    { symbol: 'WTK',   exchange: 'NSE', name: 'Williamson Tea Kenya Ltd',       assetClass: 'STOCK', currency: 'KES', sector: 'Agriculture',   isFractional: false, startPrice: 150.25 },
    { symbol: 'EGAD',  exchange: 'NSE', name: 'Eaagads Ltd',                    assetClass: 'STOCK', currency: 'KES', sector: 'Agriculture',   isFractional: false, startPrice: 30.50  },
    { symbol: 'AMAC',  exchange: 'NSE', name: 'Africa Mega Agricorp',           assetClass: 'STOCK', currency: 'KES', sector: 'Agriculture',   isFractional: false, startPrice: 110.75 },
    { symbol: 'PORT',  exchange: 'NSE', name: 'East African Portland Cement',   assetClass: 'STOCK', currency: 'KES', sector: 'Industrial',    isFractional: false, startPrice: 90.25  },
    { symbol: 'BOC',   exchange: 'NSE', name: 'BOC Kenya Ltd',                  assetClass: 'STOCK', currency: 'KES', sector: 'Industrial',    isFractional: false, startPrice: 157.00 },
    { symbol: 'CARB',  exchange: 'NSE', name: 'Carbacid Investments',           assetClass: 'STOCK', currency: 'KES', sector: 'Industrial',    isFractional: false, startPrice: 31.50  },
    { symbol: 'NMG',   exchange: 'NSE', name: 'Nation Media Group',             assetClass: 'STOCK', currency: 'KES', sector: 'Media',         isFractional: false, startPrice: 12.75  },
    { symbol: 'SGL',   exchange: 'NSE', name: 'Standard Group Ltd',             assetClass: 'STOCK', currency: 'KES', sector: 'Media',         isFractional: false, startPrice: 6.02   },
    { symbol: 'LKL',   exchange: 'NSE', name: 'Longhorn Publishers Ltd',        assetClass: 'STOCK', currency: 'KES', sector: 'Media',         isFractional: false, startPrice: 2.92   },
    { symbol: 'SCAN',  exchange: 'NSE', name: 'ScanGroup Ltd',                  assetClass: 'STOCK', currency: 'KES', sector: 'Media',         isFractional: false, startPrice: 2.16   },
    { symbol: 'TPSE',  exchange: 'NSE', name: 'TPS Eastern Africa (Serena)',    assetClass: 'STOCK', currency: 'KES', sector: 'Hospitality',   isFractional: false, startPrice: 15.60  },
    { symbol: 'CTUM',  exchange: 'NSE', name: 'Centum Investment Company',      assetClass: 'STOCK', currency: 'KES', sector: 'Financials',    isFractional: false, startPrice: 14.55  },
    { symbol: 'HAFR',  exchange: 'NSE', name: 'Home Afrika Ltd',                assetClass: 'STOCK', currency: 'KES', sector: 'Real Estate',   isFractional: false, startPrice: 1.32   },
    { symbol: 'NBV',   exchange: 'NSE', name: 'Nairobi Business Ventures Ltd',  assetClass: 'STOCK', currency: 'KES', sector: 'Financials',    isFractional: false, startPrice: 1.28   },
    { symbol: 'NSE',   exchange: 'NSE', name: 'Nairobi Securities Exchange Ltd',assetClass: 'STOCK', currency: 'KES', sector: 'Financials',    isFractional: false, startPrice: 19.50  },
    { symbol: 'SMWF',  exchange: 'NSE', name: 'Satrix MSCI World Feeder ETF',   assetClass: 'ETF',   currency: 'KES', sector: 'Diversified',   isFractional: false, startPrice: 934.00 },
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
      update: { price: startPrice, changeAmount: startPrice - prev, changePercent: ((startPrice - prev) / prev) * 100 },
    });
  }
  console.log(`✅ ${assets.length} assets seeded`);

  // ── 30-day synthetic price history ────────────────────────
  // Seeds 1d candles so weekly/monthly changes work immediately on first deploy.
  // Uses upsert with update:{} so it never overwrites real accumulated data.
  const seededAssets = await prisma.asset.findMany({ select: { id: true, symbol: true, exchange: true } });
  const today = new Date(); today.setUTCHours(0, 0, 0, 0);
  let historyRows = 0;

  for (const asset of seededAssets) {
    const def = assets.find(a => a.symbol === asset.symbol && a.exchange === asset.exchange);
    if (!def) continue;
    const base = def.startPrice;

    // Walk backward: start from a price 30 days ago (±15% of current), drift to current
    const startMult = 1 + (Math.random() - 0.5) * 0.30; // ±15%
    let price = base / startMult;                          // price 30 days ago
    const dailyTarget = (base - price) / 30;              // linear drift component

    for (let d = 30; d >= 0; d--) {
      const dayTs = new Date(today.getTime() - d * 86_400_000);
      const noise = (Math.random() - 0.48) * price * 0.025;
      const close = Math.max(0.01, price + dailyTarget * 0.3 + noise);
      const open  = price * (1 + (Math.random() - 0.5) * 0.005);
      const high  = Math.max(open, close) * (1 + Math.random() * 0.007);
      const low   = Math.min(open, close) * (1 - Math.random() * 0.007);
      const vol   = Math.floor(Math.random() * 8_000_000) + 100_000;

      await prisma.priceHistory.upsert({
        where: { assetId_interval_openTime: { assetId: asset.id, interval: '1d', openTime: dayTs } },
        create: { assetId: asset.id, interval: '1d', openTime: dayTs, open, high, low, close, volume: vol },
        update: {},
      });
      price = close;
      historyRows++;
    }
  }
  console.log(`✅ ${historyRows} daily history candles seeded`);

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

  console.log('\n🎉 Seed complete!\n');
  console.log('  Admin:  admin@capa.invest\n');
}

seed()
  .catch(e => { console.error('Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
