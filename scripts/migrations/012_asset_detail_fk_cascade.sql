-- Ensure all asset detail tables use ON DELETE CASCADE so deleting an asset
-- removes related rows. Safe to run on DBs that were created without CASCADE.
-- Run: psql $DATABASE_URL -f scripts/migrations/012_asset_detail_fk_cascade.sql

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT tc.table_name, tc.constraint_name, kcu.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
      AND kcu.column_name = 'asset_id'
      AND tc.table_name IN (
        'light_vehicle_details', 'heavy_vehicle_details', 'machinery_details',
        'plant_details', 'aux_generator_rates', 'asset_status_history'
      )
  ) LOOP
    EXECUTE format(
      'ALTER TABLE %I DROP CONSTRAINT IF EXISTS %I',
      r.table_name, r.constraint_name
    );
    EXECUTE format(
      'ALTER TABLE %I ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES asset_master(id) ON DELETE CASCADE',
      r.table_name, r.constraint_name, r.column_name
    );
  END LOOP;
END $$;
