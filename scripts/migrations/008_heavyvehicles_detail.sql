-- Heavy Vehicle Details table (1-to-1 with asset_master)
CREATE TABLE heavy_vehicle_details (
  asset_id UUID PRIMARY KEY REFERENCES asset_master(id) ON DELETE CASCADE,

  plate_no TEXT,
  chassis_serial_no TEXT,//duplicate in asset maste as serial number
  engine_make TEXT,
  engine_model TEXT,
  engine_serial_no TEXT,
  capacity TEXT,
  manuf_year INT CHECK (manuf_year BETWEEN 1900 AND EXTRACT(YEAR FROM now())::INT),
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

-- Indexes for fast lookup & filtering
CREATE INDEX idx_heavy_vehicle_plate_no
  ON heavy_vehicle_details (plate_no);

CREATE INDEX idx_heavy_vehicle_chassis_serial
  ON heavy_vehicle_details (chassis_serial_no);

CREATE INDEX idx_heavy_vehicle_engine_serial
  ON heavy_vehicle_details (engine_serial_no);

CREATE INDEX idx_heavy_vehicle_manuf_year
  ON heavy_vehicle_details (manuf_year);

CREATE INDEX idx_heavy_vehicle_insurance_coveragey
  ON heavy_vehicle_details (insurance_coverage);

CREATE INDEX idx_heavy_vehicle_bolo_renewal_date
  ON heavy_vehicle_details (bolo_renewal_date);
