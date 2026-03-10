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
