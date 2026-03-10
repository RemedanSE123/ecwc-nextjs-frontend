import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

/** Only Machinery, Heavy Vehicle, Light Vehicles & Bus — in that order. */
const UTILIZATION_CATEGORIES = ['Machinery', 'Heavy Vehicle', 'Light Vehicles & Bus'];

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectLocation = searchParams.get('project_location')?.trim();
    if (!projectLocation) {
      return NextResponse.json(
        { error: 'Validation error', detail: 'project_location is required' },
        { status: 400 }
      );
    }

    const fromJoin = `asset_master am
      LEFT JOIN heavy_vehicle_details hvd ON am.id = hvd.asset_id
      LEFT JOIN light_vehicle_details lvd ON am.id = lvd.asset_id
      LEFT JOIN machinery_details md ON am.id = md.asset_id`;
    const sql = `SELECT am.id, am.category, am.description, am.status,
      COALESCE(hvd.plate_no, lvd.plate_no, md.plate_no) AS plate_no
      FROM ${fromJoin}
      WHERE am.project_location = $1 AND am.category = ANY($2::text[])
      ORDER BY CASE am.category
        WHEN 'Machinery' THEN 1
        WHEN 'Heavy Vehicle' THEN 2
        WHEN 'Light Vehicles & Bus' THEN 3
        ELSE 4
      END, plate_no ASC NULLS LAST
      LIMIT 2000`;
    const rows = await query<{ id: string; category: string | null; description: string | null; status: string | null; plate_no: string | null }>(sql, [projectLocation, UTILIZATION_CATEGORIES]);

    const data = (rows ?? []).map((r) => ({
      id: String(r.id),
      category: r.category != null ? String(r.category) : null,
      description: r.description != null ? String(r.description) : null,
      plate_no: r.plate_no != null ? String(r.plate_no) : null,
      status: r.status != null ? String(r.status) : null,
    }));

    return NextResponse.json(data);
  } catch (err) {
    const msg = getErrorMessage(err);
    console.error('GET /api/assets/equipment-options error:', msg);
    return NextResponse.json(
      { error: 'Failed to fetch equipment options', detail: msg },
      { status: 500 }
    );
  }
}
