-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'CLOSED');
CREATE TYPE "KycStatus" AS ENUM ('NOT_STARTED', 'PENDING', 'APPROVED', 'REJECTED', 'EXPIRED');
CREATE TYPE "KycDocumentType" AS ENUM ('NATIONAL_ID', 'PASSPORT', 'DRIVERS_LICENSE', 'UTILITY_BILL', 'BANK_STATEMENT', 'SELFIE');
CREATE TYPE "Currency" AS ENUM ('USD', 'GBP', 'KES', 'EUR');
CREATE TYPE "Exchange" AS ENUM ('NYSE', 'NASDAQ', 'LSE', 'NSE');
CREATE TYPE "AssetClass" AS ENUM ('STOCK', 'ETF', 'BOND');
CREATE TYPE "OrderSide" AS ENUM ('BUY', 'SELL');
CREATE TYPE "OrderType" AS ENUM ('MARKET', 'LIMIT', 'STOP', 'STOP_LIMIT');
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'OPEN', 'PARTIAL', 'FILLED', 'CANCELLED', 'REJECTED', 'EXPIRED');
CREATE TYPE "TransactionType" AS ENUM ('DEPOSIT', 'WITHDRAWAL', 'BUY', 'SELL', 'DIVIDEND', 'FEE', 'FX_CONVERSION');
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');
CREATE TYPE "PaymentMethod" AS ENUM ('BANK_TRANSFER', 'MPESA', 'AIRTEL_MONEY', 'SWIFT', 'SEPA');
CREATE TYPE "NotificationType" AS ENUM ('DIVIDEND', 'ORDER_FILLED', 'PRICE_ALERT', 'KYC_UPDATE', 'DEPOSIT', 'WITHDRAWAL', 'NEWS', 'SYSTEM');
CREATE TYPE "AdminRoleType" AS ENUM ('SUPPORT', 'COMPLIANCE', 'OPERATIONS', 'SUPERADMIN');

-- CreateTable: users
CREATE TABLE "users" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password_hash" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "date_of_birth" DATE,
    "nationality" CHAR(2),
    "country_of_residence" CHAR(2),
    "address_line1" TEXT,
    "address_line2" TEXT,
    "city" TEXT,
    "postal_code" TEXT,
    "tax_id" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'PENDING',
    "kyc_status" "KycStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "mfa_secret" TEXT,
    "mfa_enabled" BOOLEAN NOT NULL DEFAULT false,
    "referral_code" TEXT,
    "referred_by_id" TEXT,
    "last_login_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");
CREATE UNIQUE INDEX "users_referral_code_key" ON "users"("referral_code");

-- CreateTable: admin_roles
CREATE TABLE "admin_roles" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "user_id" TEXT NOT NULL,
    "role" "AdminRoleType" NOT NULL DEFAULT 'SUPPORT',
    "permissions" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "admin_roles_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "admin_roles_user_id_key" ON "admin_roles"("user_id");

-- CreateTable: kyc_documents
CREATE TABLE "kyc_documents" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "user_id" TEXT NOT NULL,
    "document_type" "KycDocumentType" NOT NULL,
    "document_number" TEXT,
    "issue_date" DATE,
    "expiry_date" DATE,
    "country_issued" CHAR(2),
    "file_url" TEXT NOT NULL,
    "file_key" TEXT NOT NULL,
    "status" "KycStatus" NOT NULL DEFAULT 'PENDING',
    "rejection_reason" TEXT,
    "reviewed_by_id" TEXT,
    "reviewed_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "kyc_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable: investment_accounts
CREATE TABLE "investment_accounts" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "user_id" TEXT NOT NULL,
    "account_number" TEXT NOT NULL,
    "base_currency" "Currency" NOT NULL DEFAULT 'USD',
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "investment_accounts_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "investment_accounts_account_number_key" ON "investment_accounts"("account_number");

-- CreateTable: account_balances
CREATE TABLE "account_balances" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "account_id" TEXT NOT NULL,
    "currency" "Currency" NOT NULL,
    "available" DECIMAL(20,6) NOT NULL DEFAULT 0,
    "reserved" DECIMAL(20,6) NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "account_balances_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "account_balances_account_id_currency_key" ON "account_balances"("account_id", "currency");

-- CreateTable: assets
CREATE TABLE "assets" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "symbol" TEXT NOT NULL,
    "exchange" "Exchange" NOT NULL,
    "name" TEXT NOT NULL,
    "asset_class" "AssetClass" NOT NULL DEFAULT 'STOCK',
    "currency" "Currency" NOT NULL,
    "isin" CHAR(12),
    "sector" TEXT,
    "industry" TEXT,
    "description" TEXT,
    "logo_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_fractional" BOOLEAN NOT NULL DEFAULT false,
    "min_order_size" DECIMAL(10,6) NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "assets_symbol_exchange_key" ON "assets"("symbol", "exchange");

-- CreateTable: asset_prices
CREATE TABLE "asset_prices" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "asset_id" TEXT NOT NULL,
    "price" DECIMAL(20,6) NOT NULL,
    "open" DECIMAL(20,6),
    "high" DECIMAL(20,6),
    "low" DECIMAL(20,6),
    "previous_close" DECIMAL(20,6),
    "change_amount" DECIMAL(20,6),
    "change_percent" DECIMAL(8,4),
    "volume" BIGINT,
    "market_cap" DECIMAL(24,2),
    "pe_ratio" DECIMAL(10,4),
    "dividend_yield" DECIMAL(6,4),
    "week_high_52" DECIMAL(20,6),
    "week_low_52" DECIMAL(20,6),
    "fetched_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "asset_prices_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "asset_prices_asset_id_key" ON "asset_prices"("asset_id");

-- CreateTable: price_history
CREATE TABLE "price_history" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "asset_id" TEXT NOT NULL,
    "interval" TEXT NOT NULL,
    "open_time" TIMESTAMPTZ NOT NULL,
    "open" DECIMAL(20,6) NOT NULL,
    "high" DECIMAL(20,6) NOT NULL,
    "low" DECIMAL(20,6) NOT NULL,
    "close" DECIMAL(20,6) NOT NULL,
    "volume" BIGINT,
    CONSTRAINT "price_history_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "price_history_asset_id_interval_open_time_key" ON "price_history"("asset_id", "interval", "open_time");
CREATE INDEX "price_history_asset_id_interval_open_time_idx" ON "price_history"("asset_id", "interval", "open_time" DESC);

-- CreateTable: orders
CREATE TABLE "orders" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "account_id" TEXT NOT NULL,
    "asset_id" TEXT NOT NULL,
    "order_type" "OrderType" NOT NULL DEFAULT 'MARKET',
    "side" "OrderSide" NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "quantity" DECIMAL(20,6) NOT NULL,
    "filled_quantity" DECIMAL(20,6) NOT NULL DEFAULT 0,
    "limit_price" DECIMAL(20,6),
    "stop_price" DECIMAL(20,6),
    "avg_fill_price" DECIMAL(20,6),
    "estimated_total" DECIMAL(20,6),
    "filled_total" DECIMAL(20,6),
    "currency" "Currency" NOT NULL,
    "fee" DECIMAL(20,6) NOT NULL DEFAULT 0,
    "broker_order_id" TEXT,
    "notes" TEXT,
    "expires_at" TIMESTAMPTZ,
    "filled_at" TIMESTAMPTZ,
    "cancelled_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "orders_account_id_idx" ON "orders"("account_id");
CREATE INDEX "orders_status_idx" ON "orders"("status");
CREATE INDEX "orders_created_at_idx" ON "orders"("created_at" DESC);

-- CreateTable: positions
CREATE TABLE "positions" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "account_id" TEXT NOT NULL,
    "asset_id" TEXT NOT NULL,
    "quantity" DECIMAL(20,6) NOT NULL DEFAULT 0,
    "avg_cost_price" DECIMAL(20,6) NOT NULL,
    "total_invested" DECIMAL(20,6) NOT NULL,
    "realized_pnl" DECIMAL(20,6) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "positions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "positions_account_id_asset_id_key" ON "positions"("account_id", "asset_id");

-- CreateTable: transactions
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "account_id" TEXT NOT NULL,
    "order_id" TEXT,
    "type" "TransactionType" NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "amount" DECIMAL(20,6) NOT NULL,
    "currency" "Currency" NOT NULL,
    "fee" DECIMAL(20,6) NOT NULL DEFAULT 0,
    "fx_rate" DECIMAL(16,8),
    "description" TEXT,
    "reference" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "transactions_account_id_idx" ON "transactions"("account_id");
CREATE INDEX "transactions_type_idx" ON "transactions"("type");
CREATE INDEX "transactions_created_at_idx" ON "transactions"("created_at" DESC);

-- CreateTable: payment_instructions
CREATE TABLE "payment_instructions" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "transaction_id" TEXT NOT NULL,
    "payment_method" "PaymentMethod" NOT NULL,
    "direction" TEXT NOT NULL,
    "amount" DECIMAL(20,6) NOT NULL,
    "currency" "Currency" NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "provider_ref" TEXT,
    "bank_name" TEXT,
    "bank_account" TEXT,
    "bank_code" TEXT,
    "phone_number" TEXT,
    "confirmed_at" TIMESTAMPTZ,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "payment_instructions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "payment_instructions_transaction_id_key" ON "payment_instructions"("transaction_id");

-- CreateTable: dividends
CREATE TABLE "dividends" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "asset_id" TEXT NOT NULL,
    "ex_dividend_date" DATE NOT NULL,
    "record_date" DATE,
    "pay_date" DATE,
    "amount_per_share" DECIMAL(12,6) NOT NULL,
    "currency" "Currency" NOT NULL,
    "dividend_type" TEXT NOT NULL DEFAULT 'regular',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "dividends_pkey" PRIMARY KEY ("id")
);

-- CreateTable: dividend_payments
CREATE TABLE "dividend_payments" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "dividend_id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "position_id" TEXT NOT NULL,
    "shares_held" DECIMAL(20,6) NOT NULL,
    "gross_amount" DECIMAL(20,6) NOT NULL,
    "tax_withheld" DECIMAL(20,6) NOT NULL DEFAULT 0,
    "net_amount" DECIMAL(20,6) NOT NULL,
    "currency" "Currency" NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "paid_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "dividend_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable: watchlists
CREATE TABLE "watchlists" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'My Watchlist',
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "watchlists_pkey" PRIMARY KEY ("id")
);

-- CreateTable: watchlist_items
CREATE TABLE "watchlist_items" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "watchlist_id" TEXT NOT NULL,
    "asset_id" TEXT NOT NULL,
    "added_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "watchlist_items_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "watchlist_items_watchlist_id_asset_id_key" ON "watchlist_items"("watchlist_id", "asset_id");

-- CreateTable: price_alerts
CREATE TABLE "price_alerts" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "user_id" TEXT NOT NULL,
    "asset_id" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "target_price" DECIMAL(20,6),
    "percent_change" DECIMAL(6,2),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "triggered_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "price_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable: notifications
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "user_id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "sent_push" BOOLEAN NOT NULL DEFAULT false,
    "sent_email" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "notifications_user_id_is_read_created_at_idx" ON "notifications"("user_id", "is_read", "created_at" DESC);

-- CreateTable: refresh_tokens
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "device_info" TEXT,
    "ip_address" TEXT,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "revoked_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "refresh_tokens_token_hash_key" ON "refresh_tokens"("token_hash");
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateTable: audit_logs
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "user_id" TEXT,
    "admin_id" TEXT,
    "action" TEXT NOT NULL,
    "entity_type" TEXT,
    "entity_id" TEXT,
    "old_values" JSONB,
    "new_values" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "audit_logs_user_id_created_at_idx" ON "audit_logs"("user_id", "created_at" DESC);

-- AddForeignKey constraints
ALTER TABLE "admin_roles" ADD CONSTRAINT "admin_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "users" ADD CONSTRAINT "users_referred_by_id_fkey" FOREIGN KEY ("referred_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "kyc_documents" ADD CONSTRAINT "kyc_documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "investment_accounts" ADD CONSTRAINT "investment_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "account_balances" ADD CONSTRAINT "account_balances_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "investment_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "asset_prices" ADD CONSTRAINT "asset_prices_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "price_history" ADD CONSTRAINT "price_history_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "orders" ADD CONSTRAINT "orders_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "investment_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "orders" ADD CONSTRAINT "orders_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "positions" ADD CONSTRAINT "positions_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "investment_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "positions" ADD CONSTRAINT "positions_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "investment_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "payment_instructions" ADD CONSTRAINT "payment_instructions_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "dividends" ADD CONSTRAINT "dividends_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "dividend_payments" ADD CONSTRAINT "dividend_payments_dividend_id_fkey" FOREIGN KEY ("dividend_id") REFERENCES "dividends"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "dividend_payments" ADD CONSTRAINT "dividend_payments_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "investment_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "dividend_payments" ADD CONSTRAINT "dividend_payments_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "positions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "watchlists" ADD CONSTRAINT "watchlists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "watchlist_items" ADD CONSTRAINT "watchlist_items_watchlist_id_fkey" FOREIGN KEY ("watchlist_id") REFERENCES "watchlists"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "watchlist_items" ADD CONSTRAINT "watchlist_items_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "price_alerts" ADD CONSTRAINT "price_alerts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "price_alerts" ADD CONSTRAINT "price_alerts_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
