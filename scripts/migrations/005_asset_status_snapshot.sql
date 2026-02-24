-- Daily snapshots of status counts for trend charts.
-- category NULL = all categories combined.
-- Run: psql $DATABASE_URL -f scripts/migrations/005_asset_status_snapshot.sql

CREATE TABLE IF NOT EXISTS asset_status_snapshot (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    snapshot_date DATE NOT NULL,
    category TEXT,
    op_count INT NOT NULL DEFAULT 0,
    idle_count INT NOT NULL DEFAULT 0,
    down_count INT NOT NULL DEFAULT 0,
    total_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(snapshot_date, category)
);

CREATE INDEX IF NOT EXISTS idx_asset_status_snapshot_date ON asset_status_snapshot (snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_asset_status_snapshot_category ON asset_status_snapshot (category);
