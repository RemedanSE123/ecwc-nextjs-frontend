-- Auxiliary Generator Rates: 1-to-1 with asset_master for Auxiliary Generator equipment
CREATE TABLE IF NOT EXISTS aux_generator_rates (
    asset_id UUID PRIMARY KEY REFERENCES asset_master(id) ON DELETE CASCADE,
    rate_op NUMERIC(12, 2),
    rate_idle NUMERIC(12, 2),
    rate_down NUMERIC(12, 2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

