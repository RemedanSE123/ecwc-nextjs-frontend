-- Add session_id to audit_log so multiple logins (same user, different devices) can be distinguished.
-- Run once: psql $DATABASE_URL -f scripts/migrations/002_audit_log_session_id.sql

ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS session_id TEXT;
CREATE INDEX IF NOT EXISTS idx_audit_log_session_id ON audit_log (session_id);
