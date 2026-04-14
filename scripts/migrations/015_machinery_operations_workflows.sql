-- Machinery operations workflow tables:
-- 1) Rental agreements (+ PDF upload metadata)
-- 2) Daily status change requests (+ approval metadata)
-- 3) Equipment utilization header/rows
-- 4) Operator and type-of-work master tables

CREATE TABLE IF NOT EXISTS rental_asset_agreements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES asset_master(id) ON DELETE SET NULL,
    owner_name TEXT NOT NULL,
    tin_no TEXT,
    owner_address TEXT,
    category TEXT,
    description TEXT,
    rented_project TEXT NOT NULL,
    make_model TEXT,
    plate_no TEXT,
    km_hr_reading TEXT,
    fuel_filled TEXT,
    capacity TEXT,
    contract_from_date DATE,
    contract_to_date DATE,
    contract_status TEXT DEFAULT 'Active',
    min_hour_per_day NUMERIC(12, 2),
    rate_op NUMERIC(12, 2) NOT NULL,
    rate_idle NUMERIC(12, 2) NOT NULL,
    rate_down NUMERIC(12, 2) NOT NULL,
    agreement_pdf_key TEXT,
    agreement_pdf_name TEXT,
    remark TEXT,
    submitted_by_phone TEXT,
    submitted_by_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rental_asset_agreements_asset_id ON rental_asset_agreements(asset_id);
CREATE INDEX IF NOT EXISTS idx_rental_asset_agreements_project ON rental_asset_agreements(rented_project);
CREATE INDEX IF NOT EXISTS idx_rental_asset_agreements_dates ON rental_asset_agreements(contract_from_date, contract_to_date);

CREATE TABLE IF NOT EXISTS daily_status_change_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES asset_master(id) ON DELETE CASCADE,
    project_name TEXT,
    request_date DATE NOT NULL,
    status_from TEXT,
    status_to TEXT NOT NULL,
    request_note TEXT,
    approval_status TEXT NOT NULL DEFAULT 'pending',
    approved_by_phone TEXT,
    approved_by_name TEXT,
    approved_by_role TEXT,
    approved_at TIMESTAMPTZ,
    approval_note TEXT,
    submitted_by_phone TEXT,
    submitted_by_name TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_daily_status_change_approval_status
      CHECK (approval_status IN ('pending', 'approved', 'rejected', 'cancelled'))
);

CREATE INDEX IF NOT EXISTS idx_daily_status_change_requests_asset_id ON daily_status_change_requests(asset_id);
CREATE INDEX IF NOT EXISTS idx_daily_status_change_requests_project_name ON daily_status_change_requests(project_name);
CREATE INDEX IF NOT EXISTS idx_daily_status_change_requests_request_date ON daily_status_change_requests(request_date);
CREATE INDEX IF NOT EXISTS idx_daily_status_change_requests_approval_status ON daily_status_change_requests(approval_status);

CREATE TABLE IF NOT EXISTS operator_master (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_value TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_operator_master_value_norm
ON operator_master (LOWER(TRIM(operator_value)));

CREATE TABLE IF NOT EXISTS type_of_work_master (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type_value TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_type_of_work_master_value_norm
ON type_of_work_master (LOWER(TRIM(type_value)));

CREATE TABLE IF NOT EXISTS equipment_utilization_registers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_name TEXT NOT NULL,
    gc_date DATE NOT NULL,
    ref_no TEXT,
    recorded_by_phone TEXT,
    recorded_by_name TEXT,
    checked_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_equipment_utilization_registers_project_name
ON equipment_utilization_registers(project_name);
CREATE INDEX IF NOT EXISTS idx_equipment_utilization_registers_gc_date
ON equipment_utilization_registers(gc_date);

CREATE TABLE IF NOT EXISTS equipment_utilization_register_rows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    register_id UUID NOT NULL REFERENCES equipment_utilization_registers(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES asset_master(id) ON DELETE SET NULL,
    line_no INT NOT NULL,
    category TEXT,
    description TEXT,
    asset_no TEXT,
    plate_no TEXT,
    status TEXT,
    rate_op NUMERIC(12, 2),
    rate_idle NUMERIC(12, 2),
    rate_down NUMERIC(12, 2),
    first_half_start TEXT,
    first_half_end TEXT,
    second_half_start TEXT,
    second_half_end TEXT,
    night_first_half_start TEXT,
    night_first_half_end TEXT,
    night_second_half_start TEXT,
    night_second_half_end TEXT,
    worked_hrs TEXT,
    idle_hrs NUMERIC(12, 2),
    idle_reason TEXT,
    down_hrs NUMERIC(12, 2),
    down_reason TEXT,
    engine_initial NUMERIC(14, 2),
    engine_final NUMERIC(14, 2),
    engine_diff NUMERIC(14, 2),
    fuel_liters NUMERIC(14, 2),
    fuel_reading NUMERIC(14, 2),
    operator_day_first_half_id UUID REFERENCES operator_master(id) ON DELETE SET NULL,
    operator_day_second_half_id UUID REFERENCES operator_master(id) ON DELETE SET NULL,
    operator_night_first_half_id UUID REFERENCES operator_master(id) ON DELETE SET NULL,
    operator_night_second_half_id UUID REFERENCES operator_master(id) ON DELETE SET NULL,
    type_of_work_id UUID REFERENCES type_of_work_master(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_equipment_utilization_register_rows_line UNIQUE (register_id, line_no)
);

CREATE INDEX IF NOT EXISTS idx_equipment_utilization_register_rows_register_id
ON equipment_utilization_register_rows(register_id);
CREATE INDEX IF NOT EXISTS idx_equipment_utilization_register_rows_asset_id
ON equipment_utilization_register_rows(asset_id);
