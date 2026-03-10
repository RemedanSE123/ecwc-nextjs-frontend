-- Light Vehicle & Bus Details (1-to-1 with asset_master for Light Vehicles & Bus category)
CREATE TABLE IF NOT EXISTS light_vehicle_details (
    asset_id UUID PRIMARY KEY REFERENCES asset_master(id) ON DELETE CASCADE,
    plate_no TEXT,
    engine_serial_no TEXT,
    capacity TEXT,
    manuf_year INT,
    libre BOOLEAN,
    tire_size TEXT,
    battery_capacity TEXT,
    insurance_coverage TEXT,
    bolo_renewal_date DATE,
    rate_op NUMERIC(12, 2),
    rate_idle NUMERIC(12, 2),
    rate_down NUMERIC(12, 2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lv_plate_no ON light_vehicle_details(plate_no);
CREATE INDEX IF NOT EXISTS idx_lv_engine_serial_no ON light_vehicle_details(engine_serial_no);
CREATE INDEX IF NOT EXISTS idx_lv_capacity ON light_vehicle_details(capacity);
CREATE INDEX IF NOT EXISTS idx_lv_manuf_year ON light_vehicle_details(manuf_year);
CREATE INDEX IF NOT EXISTS idx_lv_insurance_coverage ON light_vehicle_details(insurance_coverage);
