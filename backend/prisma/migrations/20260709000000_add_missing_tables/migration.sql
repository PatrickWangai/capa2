-- CreateTable: saved_payment_methods
CREATE TABLE "saved_payment_methods" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "user_id" TEXT NOT NULL,
    "type" "PaymentMethod" NOT NULL,
    "label" TEXT,
    "phone" TEXT,
    "bank_name" TEXT,
    "bank_account" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "saved_payment_methods_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "saved_payment_methods" ADD CONSTRAINT "saved_payment_methods_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: currency_conversions
CREATE TABLE "currency_conversions" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "account_id" TEXT NOT NULL,
    "from_currency" "Currency" NOT NULL,
    "to_currency" "Currency" NOT NULL,
    "from_amount" DECIMAL(20,6) NOT NULL,
    "to_amount" DECIMAL(20,6) NOT NULL,
    "rate" DECIMAL(16,8) NOT NULL,
    "mid_rate" DECIMAL(16,8),
    "spread" DECIMAL(8,6) NOT NULL DEFAULT 0,
    "fee" DECIMAL(20,6) NOT NULL DEFAULT 0,
    "fee_currency" "Currency" NOT NULL,
    "reference" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'mock',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "currency_conversions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "currency_conversions_reference_key" ON "currency_conversions"("reference");
CREATE INDEX "currency_conversions_account_id_created_at_idx" ON "currency_conversions"("account_id", "created_at" DESC);

ALTER TABLE "currency_conversions" ADD CONSTRAINT "currency_conversions_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "investment_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable: portfolio_snapshots
CREATE TABLE "portfolio_snapshots" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "account_id" TEXT NOT NULL,
    "total_value" DECIMAL(20,6) NOT NULL,
    "cash_value" DECIMAL(20,6) NOT NULL,
    "equity_value" DECIMAL(20,6) NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'USD',
    "snapshot_at" TIMESTAMPTZ NOT NULL,
    CONSTRAINT "portfolio_snapshots_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "portfolio_snapshots_account_id_snapshot_at_key" ON "portfolio_snapshots"("account_id", "snapshot_at");
CREATE INDEX "portfolio_snapshots_account_id_snapshot_at_idx" ON "portfolio_snapshots"("account_id", "snapshot_at" DESC);

ALTER TABLE "portfolio_snapshots" ADD CONSTRAINT "portfolio_snapshots_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "investment_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
