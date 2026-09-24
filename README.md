# Capa — Invest beyond the market

Capa is a trading and social-investing platform for Kenyan, US, and global markets. Every position can carry an investment thesis — why it was opened, and what happened next. Built as a sandbox: every order executes against a simulated broker with real market-shaped pricing, and no real money moves until a licensed broker and payment provider are connected.

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router), TypeScript, React 19 |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL, Prisma ORM 7 |
| Auth | Auth.js (credentials) |
| Charts | TradingView Lightweight Charts |
| Forms | React Hook Form + Zod |
| Testing | Vitest |

## Architecture: provider abstractions

Every external integration point is a TypeScript interface with a `Mock*` implementation, so the UI never knows whether it's talking to a real vendor or a sandbox:

| Interface | File | Mock implementation |
|---|---|---|
| `BrokerService` | `src/services/providers/broker.ts` | Executes orders against live-shaped mock quotes, updates holdings/wallet/transactions atomically |
| `MarketDataProvider` | `src/services/providers/market-data.ts` | Deterministic seeded price jitter + synthetic OHLC history, no external API |
| `PaymentProvider` | `src/services/providers/payment.ts` | Simulates instant M-Pesa/bank/card confirmation |
| `KYCProvider` | `src/services/providers/kyc.ts` | Leaves submissions `PENDING` for the admin review queue — no auto-approval |

Swapping in a real broker, market data vendor, or payment processor means writing a `Real*` class against the same interface — no changes to pages, API routes, or the database schema.

## Getting started

### Prerequisites

- Node.js 20+
- A local PostgreSQL server

### Setup

```bash
npm install
cp .env.example .env
# Edit .env: set DATABASE_URL to a local Postgres database, generate AUTH_SECRET with:
#   openssl rand -base64 32

npx prisma migrate dev
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo accounts (after seeding)

| Role | Email | Password |
|---|---|---|
| Investor | `demo@capa.invest` | `Demo1234!` |
| Admin | `admin@capa.invest` | `Demo1234!` |

Five more investor accounts (`amara@capa.invest`, `brian@capa.invest`, `faith@capa.invest`, `james@capa.invest`, `lindiwe@capa.invest`) share the same password and seed the social feed, theses, and circles with realistic activity.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build (runs `prisma generate` first) |
| `npm test` | Run the Vitest suite |
| `npm run lint` | ESLint |
| `npm run db:seed` | Reset and reseed the local database |
| `npm run db:studio` | Open Prisma Studio |

## Project structure

```
prisma/
  schema.prisma       # Full data model — trading, social, circles, wallet, KYC, admin
  seed.ts             # Realistic demo data: assets, users, holdings, orders, posts, theses, circles
src/
  app/
    (marketing)/      # Public: landing, markets, stock detail, about, pricing, learn
    (auth)/           # Login, signup
    (app)/            # Authenticated: dashboard, portfolio, trade, social, circles, wallet, settings...
    admin/            # Role-gated admin console
    api/              # Route handlers backing every mutation and data fetch
  services/
    providers/        # Broker / market data / payment / KYC interfaces + mocks
    *.ts              # Business logic (social, theses, circles, market pulse, simulator, admin...)
  components/         # UI primitives (ui/) and domain components (post-card, trade-ticket, ...)
  lib/
    money.ts           # Centralized Decimal-based financial math — never floating point for money
    db.ts               # Prisma client singleton
  auth.ts / auth.config.ts / proxy.ts   # Auth.js config, split Edge-safe vs. full for middleware
```

## Notable implementation details

- **Financial math never uses native floats.** `src/lib/money.ts` wraps `decimal.js` for every calculation — order fees, P&L, weighted average cost, currency conversion for cross-currency portfolio aggregation.
- **RBAC is enforced in `proxy.ts`** (the Next.js middleware), not just in the UI — hitting `/admin` as a non-admin redirects server-side to `/forbidden` before any admin page code runs.
- **Compliance-conscious language throughout**: Market Pulse is always labeled "based on aggregated user activity," never phrased as a recommendation; simulator results are labeled as historical/hypothetical; the footer and landing page are explicit that this is a sandbox with no real broker-dealer behind it.

## Deployment

Set `DATABASE_URL`, `AUTH_SECRET`, and `AUTH_URL` (your deployed origin) in the hosting provider's environment variables. The build step (`prisma generate && next build`) and a `prisma migrate deploy` before `next start` are both required — see `render.yaml` for a working Render Blueprint.
