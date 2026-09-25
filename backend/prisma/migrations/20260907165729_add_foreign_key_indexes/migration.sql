-- CreateIndex
CREATE INDEX "audit_logs_admin_id_idx" ON "audit_logs"("admin_id");

-- CreateIndex
CREATE INDEX "dividend_payments_dividend_id_idx" ON "dividend_payments"("dividend_id");

-- CreateIndex
CREATE INDEX "dividend_payments_account_id_idx" ON "dividend_payments"("account_id");

-- CreateIndex
CREATE INDEX "dividend_payments_position_id_idx" ON "dividend_payments"("position_id");

-- CreateIndex
CREATE INDEX "dividends_asset_id_idx" ON "dividends"("asset_id");

-- CreateIndex
CREATE INDEX "investment_accounts_user_id_idx" ON "investment_accounts"("user_id");

-- CreateIndex
CREATE INDEX "kyc_documents_user_id_idx" ON "kyc_documents"("user_id");

-- CreateIndex
CREATE INDEX "orders_asset_id_idx" ON "orders"("asset_id");

-- CreateIndex
CREATE INDEX "price_alerts_user_id_idx" ON "price_alerts"("user_id");

-- CreateIndex
CREATE INDEX "price_alerts_asset_id_idx" ON "price_alerts"("asset_id");

-- CreateIndex
CREATE INDEX "saved_payment_methods_user_id_idx" ON "saved_payment_methods"("user_id");

-- CreateIndex
CREATE INDEX "transactions_order_id_idx" ON "transactions"("order_id");

-- CreateIndex
CREATE INDEX "users_referred_by_id_idx" ON "users"("referred_by_id");

-- CreateIndex
CREATE INDEX "watchlist_items_asset_id_idx" ON "watchlist_items"("asset_id");

-- CreateIndex
CREATE INDEX "watchlists_user_id_idx" ON "watchlists"("user_id");

