-- Add rate columns to vehicle/machinery detail tables (for existing databases)
-- Run this only if 006, 007, 008 were applied before rate columns were added

ALTER TABLE light_vehicle_details ADD COLUMN IF NOT EXISTS rate_op NUMERIC(12, 2);
ALTER TABLE light_vehicle_details ADD COLUMN IF NOT EXISTS rate_idle NUMERIC(12, 2);
ALTER TABLE light_vehicle_details ADD COLUMN IF NOT EXISTS rate_down NUMERIC(12, 2);

ALTER TABLE machinery_details ADD COLUMN IF NOT EXISTS rate_op NUMERIC(12, 2);
ALTER TABLE machinery_details ADD COLUMN IF NOT EXISTS rate_idle NUMERIC(12, 2);
ALTER TABLE machinery_details ADD COLUMN IF NOT EXISTS rate_down NUMERIC(12, 2);

ALTER TABLE heavy_vehicle_details ADD COLUMN IF NOT EXISTS rate_op NUMERIC(12, 2);
ALTER TABLE heavy_vehicle_details ADD COLUMN IF NOT EXISTS rate_idle NUMERIC(12, 2);
ALTER TABLE heavy_vehicle_details ADD COLUMN IF NOT EXISTS rate_down NUMERIC(12, 2);
