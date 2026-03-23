-- Normalize projects into a dedicated table and link asset_master via project_id.
-- Safe to run on databases where parts were already created manually.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'closed')),
  manager_name TEXT,
  manager_phone TEXT,
  start_date DATE,
  end_date DATE,
  remark TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_name_unique_norm
  ON projects (LOWER(TRIM(project_name)));

ALTER TABLE asset_master
  ADD COLUMN IF NOT EXISTS project_id UUID;

-- Seed projects from legacy asset text values (if any remain), normalized by TRIM.
INSERT INTO projects (project_name)
SELECT DISTINCT TRIM(project_location) AS project_name
FROM asset_master
WHERE project_location IS NOT NULL
  AND TRIM(project_location) <> ''
  AND NOT EXISTS (
    SELECT 1
    FROM projects p
    WHERE LOWER(TRIM(p.project_name)) = LOWER(TRIM(asset_master.project_location))
  );

-- Backfill project_id from legacy project_location text.
UPDATE asset_master am
SET project_id = p.id
FROM projects p
WHERE am.project_id IS NULL
  AND am.project_location IS NOT NULL
  AND TRIM(am.project_location) <> ''
  AND LOWER(TRIM(p.project_name)) = LOWER(TRIM(am.project_location));

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_asset_project'
      AND conrelid = 'asset_master'::regclass
  ) THEN
    ALTER TABLE asset_master
      ADD CONSTRAINT fk_asset_project
      FOREIGN KEY (project_id)
      REFERENCES projects(id)
      ON DELETE RESTRICT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_asset_master_project_id
  ON asset_master(project_id);
