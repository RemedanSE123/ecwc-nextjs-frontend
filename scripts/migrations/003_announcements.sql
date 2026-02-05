-- Announcements: broadcast messages to all users (new features, updates, etc.).
-- Run once: psql $DATABASE_URL -f scripts/migrations/003_announcements.sql

CREATE TABLE IF NOT EXISTS announcements (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  created_by_phone TEXT NOT NULL,
  created_by_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements (created_at DESC);
