-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Asset Master table: only category & description required
CREATE TABLE asset_master (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_s3_key TEXT,
    project_location TEXT,
    category TEXT NOT NULL,
    asset_no TEXT,
    description TEXT NOT NULL,
    serial_no TEXT,
    make TEXT,
    model TEXT,
    status TEXT,
    responsible_person_name TEXT,
    responsible_person_pno TEXT,
    ownership TEXT,
    remark TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for filtering and lookups
CREATE INDEX idx_asset_master_project_location ON asset_master (project_location);
CREATE INDEX idx_asset_master_category ON asset_master (category);
CREATE INDEX idx_asset_master_status ON asset_master (status);
CREATE INDEX idx_asset_master_responsible_person_pno ON asset_master (responsible_person_pno);
CREATE INDEX idx_asset_master_serial_no ON asset_master (serial_no);
CREATE INDEX idx_asset_master_ownership ON asset_master (ownership);

-- Uniqueness (case/whitespace insensitive) for asset_no and serial_no
CREATE UNIQUE INDEX IF NOT EXISTS idx_asset_master_asset_no_unique
  ON asset_master (LOWER(TRIM(asset_no)))
  WHERE asset_no IS NOT NULL AND TRIM(asset_no) <> '';

CREATE UNIQUE INDEX IF NOT EXISTS idx_asset_master_serial_no_unique
  ON asset_master (LOWER(TRIM(serial_no)))
  WHERE serial_no IS NOT NULL AND TRIM(serial_no) <> '';



ALTER TABLE asset_master
ADD COLUMN detail_location TEXT;


-- 1️⃣ Rename project_location to temp
ALTER TABLE asset_master
RENAME COLUMN project_location TO temp_location;

-- 2️⃣ Rename detail_location to project_location
ALTER TABLE asset_master
RENAME COLUMN detail_location TO project_location;

-- 3️⃣ Rename temp_location to detail_location
ALTER TABLE asset_master
RENAME COLUMN temp_location TO detail_location;

ALTER TABLE asset_master
DROP COLUMN detail_location;

[3/23/2026 11:03 AM] Remedan: ALTER TABLE asset_master
DROP COLUMN detail_location;
[3/23/2026 11:16 AM] Remedan: CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_name TEXT NOT NULL UNIQUE,
    status TEXT DEFAULT 'active',
    manager_name TEXT,
    manager_phone TEXT,
    start_date DATE,
    end_date DATE,
    remark TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
[3/23/2026 11:18 AM] Remedan: INSERT INTO projects (project_name)
SELECT DISTINCT project_location
FROM asset_master
WHERE project_location IS NOT NULL;
[3/23/2026 11:18 AM] Remedan: ALTER TABLE asset_master
ADD COLUMN project_id UUID;
[3/23/2026 11:20 AM] Remedan: UPDATE asset_master a
SET project_id = p.id
FROM projects p
WHERE a.project_location = p.project_name;
[3/23/2026 11:23 AM] Remedan: ALTER TABLE asset_master
ADD CONSTRAINT fk_asset_project
FOREIGN KEY (project_id)
REFERENCES projects(id);
[3/23/2026 11:24 AM] Remedan: CREATE INDEX idx_asset_master_project_id
ON asset_master(project_id);


