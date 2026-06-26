# Capa — Invest Globally. Grow Confidently.

Capa is a full-stack global investment platform enabling users to buy and sell US (NYSE/NASDAQ), UK (LSE), and Kenyan (NSE) stocks and ETFs, deposit via M-Pesa or bank transfer, track portfolios in real time, and receive dividend notifications.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js · Express · Prisma ORM · PostgreSQL · Redis · Socket.IO |
| Frontend | React 18 · Vite · TypeScript · Tailwind CSS · Recharts · React Query |
| Mobile | Expo (React Native) · TypeScript · React Navigation |
| Broker | Alpaca Markets (US equities) |
| Payments | M-Pesa Daraja STK Push · Bank Transfer |
| Storage | AWS S3 (KYC documents) |
| Infra | Docker · Nginx · GitHub Actions |

---

## Project Structure

```
capa/
├── backend/                  # Express API server
│   ├── prisma/
│   │   ├── schema.prisma     # Full data model (20 models, 14 enums)
│   │   └── migrations/       # SQL migrations
│   ├── src/
│   │   ├── controllers/      # Business logic (auth, orders, kyc, portfolio…)
│   │   ├── middleware/        # JWT auth, KYC guard, admin guard, validation
│   │   ├── routes/           # 14 route files
│   │   ├── services/         # Alpaca, M-Pesa, S3, email, price feed, socket
│   │   ├── jobs/             # Dividend processor, price alert checker
│   │   └── utils/            # DB, Redis, logger, seed
│   └── tests/                # Unit + integration tests
├── frontend/                 # React/Vite web app
│   └── src/
│       ├── pages/            # 10 user pages + 4 admin pages
│       ├── components/       # UI primitives, layout, admin panel
│       ├── services/         # Axios client with JWT refresh
│       └── store/            # Zustand auth store
├── mobile/                   # Expo React Native app
│   └── src/
│       ├── screens/          # Auth, Home, Markets, Portfolio, Deposit, Account
│       ├── navigation/       # Stack + Tab navigators
│       ├── components/       # Charts, price change, common
│       └── store/            # SecureStore-backed auth
├── infra/
│   ├── nginx/nginx.conf      # Reverse proxy + WebSocket support
│   └── postgres/init.sql     # DB initialisation
├── brand_assets/             # Capa logo SVG
├── docker-compose.yml        # Full stack orchestration
├── .env.example              # All required environment variables
└── README.md
```

---

## Quick Start (Local)

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- Git

### 1. Clone and configure
First, clone the repository and navigate into the new directory.
```bash
git clone https://github.com/chimerawang/capa.git
cd capa
```

Next, create your local environment file from the example provided.
```bash
cp .env.example .env
```

### 2. Start infrastructure

```bash
docker-compose up -d postgres redis
```

### 3. Set up backend

```bash
cd backend
npm install
npx prisma migrate deploy     # Run migrations
node src/utils/seed.js        # Seed assets + demo accounts
npm run dev                   # Start API on :4000
```

### 4. Start frontend

```bash
cd ../frontend
npm install
npm run dev                   # Start web app on :5173
```

### 5. Start mobile (optional)

```bash
cd ../mobile
npm install
npx expo start               # Scan QR with Expo Go app
```

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@capa.invest | Admin1234! |
| Demo User | demo@capa.invest | Demo1234! |

---

## Docker (Full Stack)

```bash
cp .env.example .env
# Fill in .env values

docker-compose up -d
# Web app:  http://localhost:3000
# API:      http://localhost:4000
# Nginx:    http://localhost:80
```

---

## Environment Variables

See `.env.example` for all variables. Key ones:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `JWT_SECRET` | 64+ char random string for access tokens |
| `JWT_REFRESH_SECRET` | 64+ char random string for refresh tokens |
| `MPESA_CONSUMER_KEY` | Safaricom Daraja API key |
| `MPESA_CONSUMER_SECRET` | Safaricom Daraja secret |
| `MPESA_PASSKEY` | Daraja STK push passkey |
| `MPESA_CALLBACK_URL` | Public URL for M-Pesa callbacks |
| `ALPACA_API_KEY` | Alpaca Markets API key |
| `ALPACA_SECRET_KEY` | Alpaca Markets secret |
| `ALPACA_BASE_URL` | Use paper-api URL for testing |
| `AWS_ACCESS_KEY_ID` | S3 access for KYC documents |
| `AWS_SECRET_ACCESS_KEY` | S3 secret |
| `AWS_S3_BUCKET` | S3 bucket name |
| `POLYGON_API_KEY` | Polygon.io for live market data |
| `SMTP_HOST/USER/PASS` | Email (SendGrid recommended) |

---

## API Reference

### Authentication
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login (returns JWT) |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Revoke tokens |
| POST | `/api/auth/mfa/setup` | Enable MFA (TOTP) |
| POST | `/api/auth/mfa/verify` | Confirm MFA code |

### Markets
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/assets` | List assets (filter: exchange, assetClass, search) |
| GET | `/api/assets/:id` | Asset details + live price |
| GET | `/api/assets/:id/history` | OHLCV candles |
| GET | `/api/assets/watchlist` | User's watchlist |
| POST | `/api/assets/watchlist/:assetId` | Add to watchlist |
| DELETE | `/api/assets/watchlist/:assetId` | Remove from watchlist |

### Orders
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/orders` | Order history |
| POST | `/api/orders` | Place order (requires KYC) |
| DELETE | `/api/orders/:id` | Cancel open order |

### Portfolio
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/portfolio` | Holdings + summary + P&L |
| GET | `/api/portfolio/history` | Value over time |
| GET | `/api/portfolio/dividends` | Dividend payments |

### Deposits
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/deposits/mpesa` | M-Pesa STK Push |
| POST | `/api/deposits/bank` | Bank transfer instructions |
| POST | `/api/deposits/withdraw` | Withdrawal request |
| GET | `/api/deposits/history` | Transaction history |

### KYC
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/kyc/status` | KYC status + submitted docs |
| POST | `/api/kyc/upload` | Upload document (multipart) |

### Admin
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/dashboard` | Platform metrics |
| GET | `/api/admin/users` | List users |
| PATCH | `/api/admin/users/:id` | Update user status |
| GET | `/api/admin/kyc/pending` | Pending KYC docs |
| PATCH | `/api/admin/kyc/:docId/review` | Approve/reject KYC |
| GET | `/api/admin/transactions` | All transactions |
| PATCH | `/api/admin/transactions/:id/confirm` | Confirm deposit |

### Webhooks
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/webhooks/mpesa` | M-Pesa Daraja callback |

---

## Deployment

### Railway

```bash
# Install Railway CLI
npm install -g @railway/cli
railway login
railway init

# Add services: PostgreSQL, Redis from Railway dashboard
# Set environment variables in Railway dashboard

railway up
```

Railway auto-detects Node.js. Set `START_COMMAND` to:
```
cd backend && npx prisma migrate deploy && node src/index.js
```

### Render

1. Create a new **Web Service** → connect GitHub repo
2. **Build Command**: `cd backend && npm install && npx prisma generate`
3. **Start Command**: `cd backend && npx prisma migrate deploy && node src/index.js`
4. Add **PostgreSQL** and **Redis** from Render dashboard
5. Set all environment variables from `.env.example`

For frontend, create a **Static Site**:
- **Build Command**: `cd frontend && npm install && npm run build`
- **Publish Directory**: `frontend/dist`

### Vercel (Frontend only)

```bash
cd frontend
npx vercel --prod
```

Set environment variables in Vercel dashboard:
- `VITE_API_URL` = your Railway/Render backend URL
- `VITE_WS_URL` = same URL with `wss://` prefix

### Expo (Mobile — EAS Build)

```bash
npm install -g eas-cli
cd mobile
eas build --platform android   # or ios
eas submit --platform android
```

Update `mobile/app.json` → `extra.apiUrl` to point to your deployed backend.

---

## M-Pesa Setup

1. Register at [Safaricom Daraja](https://developer.safaricom.co.ke/)
2. Create an app and get `Consumer Key` + `Consumer Secret`
3. For callbacks, use [ngrok](https://ngrok.com/) in dev:
   ```bash
   ngrok http 4000
   # Set MPESA_CALLBACK_URL=https://xxxxx.ngrok.io/api/webhooks/mpesa
   ```
4. Set `MPESA_ENV=production` and use your domain in production

---

## Alpaca Setup

1. Register at [Alpaca Markets](https://alpaca.markets/)
2. Create paper trading API keys for testing
3. Set `ALPACA_BASE_URL=https://paper-api.alpaca.markets`
4. Switch to live keys + `https://api.alpaca.markets` for production
5. If `ALPACA_API_KEY` is not set, the system uses simulated fills

---

## Running Tests

```bash
cd backend
npm test                      # All tests
npm test -- --testPathPattern auth   # Auth tests only
```

---

## License

MIT © Capa Technologies Ltd
