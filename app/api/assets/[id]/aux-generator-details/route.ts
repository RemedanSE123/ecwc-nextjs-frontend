import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest, getSessionIdFromRequest, insertAuditLog } from '@/lib/audit';

export const dynamic = 'force-dynamic';

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

export interface AuxGeneratorDetails {
  asset_id: string;
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
    const rows = await query<AuxGeneratorDetails>(
      `SELECT asset_id, rate_op, rate_idle, rate_down,
              created_at, updated_at
       FROM aux_generator_rates
       WHERE asset_id = $1`,
      [id]
    );
    return NextResponse.json(rows?.[0] ?? null);
  } catch (err) {
    const msg = getErrorMessage(err);
    console.error('GET /api/assets/[id]/aux-generator-details error:', msg);
    return NextResponse.json(
      { error: 'Failed to fetch auxiliary generator details', detail: msg },
      { status: 500 }
    );
  }
}

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
    const beforeRows = await query<AuxGeneratorDetails>(
      `SELECT * FROM aux_generator_rates WHERE asset_id = $1`,
      [id]
    );
    const before = beforeRows?.[0] ?? null;

    const body = await request.json().catch(() => ({}));
    const rate_op = body.rate_op ?? null;
    const rate_idle = body.rate_idle ?? null;
    const rate_down = body.rate_down ?? null;
    await query(
      `INSERT INTO aux_generator_rates (asset_id, rate_op, rate_idle, rate_down)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (asset_id) DO UPDATE
         SET rate_op = EXCLUDED.rate_op,
             rate_idle = EXCLUDED.rate_idle,
             rate_down = EXCLUDED.rate_down`,
      [id, rate_op, rate_idle, rate_down]
    );
    const afterRows = await query<AuxGeneratorDetails>(
      `SELECT * FROM aux_generator_rates WHERE asset_id = $1`,
      [id]
    );
    const after = afterRows?.[0] ?? null;
    const toPlain = (row: AuxGeneratorDetails | null): Record<string, string | null> => {
      if (!row) return {};
      const fields: (keyof AuxGeneratorDetails)[] = ['asset_id', 'rate_op', 'rate_idle', 'rate_down'];
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
        action: 'aux_generator_rates_update',
        entity_type: 'asset',
        entity_id: id,
        details: {
          asset_id: id,
          section: 'aux_generator_rates',
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
    console.error('PUT /api/assets/[id]/aux-generator-details error:', msg);
    return NextResponse.json(
      { error: 'Failed to update auxiliary generator details', detail: msg },
      { status: 500 }
    );
  }
}


