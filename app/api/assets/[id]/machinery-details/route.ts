import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest, getSessionIdFromRequest, insertAuditLog } from '@/lib/audit';

export const dynamic = 'force-dynamic';

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

export interface MachineryDetails {
  asset_id: string;
  plate_no: string | null;
  engine_make: string | null;
  engine_model: string | null;
  engine_serial_no: string | null;
  capacity: string | null;
  manuf_year: number | null;
  libre: boolean | null;
  tire_size: string | null;
  battery_capacity: string | null;
  rate_op: number | null;
  rate_idle: number | null;
  rate_down: number | null;
  created_at: string;
  updated_at: string;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params?.id;
    if (!id) {
      return NextResponse.json(
        { error: 'Missing id' },
        { status: 400 }
      );
    }
    const rows = await query<MachineryDetails>(
      `SELECT asset_id, plate_no, engine_make, engine_model, engine_serial_no,
              capacity, manuf_year, libre, tire_size, battery_capacity,
              rate_op, rate_idle, rate_down,
              created_at, updated_at
       FROM machinery_details
       WHERE asset_id = $1`,
      [id]
    );
    return NextResponse.json(rows?.[0] ?? null);
  } catch (err) {
    const msg = getErrorMessage(err);
    console.error('GET /api/assets/[id]/machinery-details error:', msg);
    return NextResponse.json(
      { error: 'Failed to fetch machinery details', detail: msg },
      { status: 500 }
    );
  }
}

// Update only rate fields (used by rate editors)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', detail: 'Valid X-User-Phone and X-User-Name required' },
        { status: 401 }
      );
    }
    const id = params?.id;
    if (!id) {
      return NextResponse.json(
        { error: 'Missing id' },
        { status: 400 }
      );
    }
    const beforeRows = await query<MachineryDetails>(
      `SELECT * FROM machinery_details WHERE asset_id = $1`,
      [id]
    );
    const before = beforeRows?.[0] ?? null;

    const body = await request.json().catch(() => ({}));
    const rate_op = body.rate_op ?? null;
    const rate_idle = body.rate_idle ?? null;
    const rate_down = body.rate_down ?? null;
    await query(
      `INSERT INTO machinery_details (asset_id, rate_op, rate_idle, rate_down)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (asset_id) DO UPDATE
         SET rate_op = EXCLUDED.rate_op,
             rate_idle = EXCLUDED.rate_idle,
             rate_down = EXCLUDED.rate_down`,
      [id, rate_op, rate_idle, rate_down]
    );
    const afterRows = await query<MachineryDetails>(
      `SELECT * FROM machinery_details WHERE asset_id = $1`,
      [id]
    );
    const after = afterRows?.[0] ?? null;
    const toPlain = (row: MachineryDetails | null): Record<string, string | null> => {
      if (!row) return {};
      const fields: (keyof MachineryDetails)[] = [
        'asset_id',
        'plate_no',
        'engine_make',
        'engine_model',
        'engine_serial_no',
        'capacity',
        'manuf_year',
        'libre',
        'tire_size',
        'battery_capacity',
        'rate_op',
        'rate_idle',
        'rate_down',
      ];
      const out: Record<string, string | null> = {};
      for (const f of fields) {
        const v = (row as any)[f];
        out[f] = v == null ? null : String(v);
      }
      return out;
    };
    const previous_data = toPlain(before);
    const updated_data = toPlain(after);
    const changes: { field: string; from: string | null; to: string | null }[] = [];
    for (const key of Object.keys(updated_data)) {
      const from = previous_data[key] ?? null;
      const to = updated_data[key] ?? null;
      if (from !== to) {
        changes.push({ field: key, from, to });
      }
    }
    if (changes.length > 0) {
      await insertAuditLog({
        user_phone: user.phone,
        user_name: user.name,
        action: 'machinery_rates_update',
        entity_type: 'asset',
        entity_id: id,
        details: {
          asset_id: id,
          section: 'machinery_details',
          previous_data,
          updated_data,
          changes,
        },
        session_id: getSessionIdFromRequest(request),
      });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = getErrorMessage(err);
    console.error('PUT /api/assets/[id]/machinery-details error:', msg);
    return NextResponse.json(
      { error: 'Failed to update machinery details', detail: msg },
      { status: 500 }
    );
  }
}

// Update full machinery_details row (specs + rates) from asset edit form
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', detail: 'Valid X-User-Phone and X-User-Name required' },
        { status: 401 }
      );
    }
    const id = params?.id;
    if (!id) {
      return NextResponse.json(
        { error: 'Missing id' },
        { status: 400 }
      );
    }
    const beforeRows = await query<MachineryDetails>(
      `SELECT * FROM machinery_details WHERE asset_id = $1`,
      [id]
    );
    const before = beforeRows?.[0] ?? null;

    const body = await request.json().catch(() => ({}));

    const values = [
      id,
      body.plate_no ?? null,
      body.engine_make ?? null,
      body.engine_model ?? null,
      body.engine_serial_no ?? null,
      body.capacity ?? null,
      body.manuf_year ?? null,
      body.libre ?? null,
      body.tire_size ?? null,
      body.battery_capacity ?? null,
      body.rate_op ?? null,
      body.rate_idle ?? null,
      body.rate_down ?? null,
    ];

    await query(
      `INSERT INTO machinery_details (
         asset_id, plate_no, engine_make, engine_model, engine_serial_no,
         capacity, manuf_year, libre, tire_size, battery_capacity,
         rate_op, rate_idle, rate_down
       )
       VALUES (
         $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13
       )
       ON CONFLICT (asset_id) DO UPDATE SET
         plate_no = EXCLUDED.plate_no,
         engine_make = EXCLUDED.engine_make,
         engine_model = EXCLUDED.engine_model,
         engine_serial_no = EXCLUDED.engine_serial_no,
         capacity = EXCLUDED.capacity,
         manuf_year = EXCLUDED.manuf_year,
         libre = EXCLUDED.libre,
         tire_size = EXCLUDED.tire_size,
         battery_capacity = EXCLUDED.battery_capacity,
         rate_op = EXCLUDED.rate_op,
         rate_idle = EXCLUDED.rate_idle,
         rate_down = EXCLUDED.rate_down`,
      values
    );
    const afterRows = await query<MachineryDetails>(
      `SELECT * FROM machinery_details WHERE asset_id = $1`,
      [id]
    );
    const after = afterRows?.[0] ?? null;
    const toPlain = (row: MachineryDetails | null): Record<string, string | null> => {
      if (!row) return {};
      const fields: (keyof MachineryDetails)[] = [
        'asset_id',
        'plate_no',
        'engine_make',
        'engine_model',
        'engine_serial_no',
        'capacity',
        'manuf_year',
        'libre',
        'tire_size',
        'battery_capacity',
        'rate_op',
        'rate_idle',
        'rate_down',
      ];
      const out: Record<string, string | null> = {};
      for (const f of fields) {
        const v = (row as any)[f];
        out[f] = v == null ? null : String(v);
      }
      return out;
    };
    const previous_data = toPlain(before);
    const updated_data = toPlain(after);
    const changes: { field: string; from: string | null; to: string | null }[] = [];
    for (const key of Object.keys(updated_data)) {
      const from = previous_data[key] ?? null;
      const to = updated_data[key] ?? null;
      if (from !== to) {
        changes.push({ field: key, from, to });
      }
    }
    if (changes.length > 0) {
      await insertAuditLog({
        user_phone: user.phone,
        user_name: user.name,
        action: 'machinery_details_update',
        entity_type: 'asset',
        entity_id: id,
        details: {
          asset_id: id,
          section: 'machinery_details',
          previous_data,
          updated_data,
          changes,
        },
        session_id: getSessionIdFromRequest(request),
      });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = getErrorMessage(err);
    console.error('PATCH /api/assets/[id]/machinery-details error:', msg);
    return NextResponse.json(
      { error: 'Failed to update machinery specs', detail: msg },
      { status: 500 }
    );
  }
}


