-- Speeds up lookups of all positions holding a given asset (e.g. dividendJob.js),
-- which the existing @@unique([accountId, assetId]) composite index cannot serve.
CREATE INDEX "positions_asset_id_idx" ON "positions" ("asset_id");
