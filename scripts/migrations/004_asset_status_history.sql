-- Asset status change history: who changed status, from what, to what, when.
-- Run: psql $DATABASE_URL -f scripts/migrations/004_asset_status_history.sql

CREATE TABLE IF NOT EXISTS asset_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES asset_master(id) ON DELETE CASCADE,
    status_from TEXT,
    status_to TEXT NOT NULL,
    changed_by_phone TEXT NOT NULL,
    changed_by_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Primary query: fetch history for an asset, most recent first
CREATE INDEX idx_asset_status_history_asset_created ON asset_status_history (asset_id, created_at DESC);

-- Optional: lookup by who made changes
CREATE INDEX idx_asset_status_history_changed_by ON asset_status_history (changed_by_phone);
