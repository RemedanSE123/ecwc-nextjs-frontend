import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

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
