-- Machinery Details (1-to-1 with asset_master for Machinery category)
CREATE TABLE IF NOT EXISTS machinery_details (
    asset_id UUID PRIMARY KEY REFERENCES asset_master(id) ON DELETE CASCADE,
    plate_no TEXT,
    engine_make TEXT,
    engine_model TEXT,
    engine_serial_no TEXT,
    capacity TEXT,
    manuf_year INT,
    libre BOOLEAN,
    tire_size TEXT,
    battery_capacity TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_machinery_plate_no ON machinery_details(plate_no);
CREATE INDEX IF NOT EXISTS idx_machinery_engine_serial_no ON machinery_details(engine_serial_no);
CREATE INDEX IF NOT EXISTS idx_machinery_engine_make ON machinery_details(engine_make);
CREATE INDEX IF NOT EXISTS idx_machinery_capacity ON machinery_details(capacity);
CREATE INDEX IF NOT EXISTS idx_machinery_manuf_year ON machinery_details(manuf_year);
