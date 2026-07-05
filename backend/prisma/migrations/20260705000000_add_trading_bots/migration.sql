CREATE TABLE "trading_bots" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "asset_id" UUID NOT NULL,
    "strategy" TEXT NOT NULL,
    "params" JSONB NOT NULL DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "quantity" DECIMAL(20,6) NOT NULL,
    "last_run_at" TIMESTAMP(3),
    "trades_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "trading_bots_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "bot_trades" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "bot_id" UUID NOT NULL,
    "order_id" UUID,
    "side" TEXT NOT NULL,
    "quantity" DECIMAL(20,6) NOT NULL,
    "price" DECIMAL(20,6) NOT NULL,
    "reason" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "bot_trades_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "trading_bots_user_id_idx" ON "trading_bots"("user_id");
CREATE INDEX "trading_bots_status_idx" ON "trading_bots"("status");
CREATE INDEX "bot_trades_bot_id_idx" ON "bot_trades"("bot_id");

ALTER TABLE "trading_bots" ADD CONSTRAINT "trading_bots_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "trading_bots" ADD CONSTRAINT "trading_bots_asset_id_fkey"
    FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "bot_trades" ADD CONSTRAINT "bot_trades_bot_id_fkey"
    FOREIGN KEY ("bot_id") REFERENCES "trading_bots"("id") ON DELETE CASCADE ON UPDATE CASCADE;
