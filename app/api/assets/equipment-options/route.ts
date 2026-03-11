import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

/** Plant first, then Machinery, Heavy Vehicle, Light Vehicles & Bus, Auxiliary last. Within Auxiliary, Generator description last. */
const UTILIZATION_CATEGORIES = ['Plant', 'Machinery', 'Heavy Vehicle', 'Light Vehicles & Bus', 'Auxillary'];

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
      LEFT JOIN machinery_details md ON am.id = md.asset_id
      LEFT JOIN plant_details pd ON am.id = pd.asset_id
      LEFT JOIN aux_generator_rates ag ON am.id = ag.asset_id`;
    const sql = `SELECT am.id, am.category, am.description, am.status, am.asset_no,
      COALESCE(hvd.plate_no, lvd.plate_no, md.plate_no) AS plate_no,
      COALESCE(hvd.rate_op, lvd.rate_op, md.rate_op, pd.rate_op, ag.rate_op) AS rate_op,
      COALESCE(hvd.rate_idle, lvd.rate_idle, md.rate_idle, pd.rate_idle, ag.rate_idle) AS rate_idle,
      COALESCE(hvd.rate_down, lvd.rate_down, md.rate_down, pd.rate_down, ag.rate_down) AS rate_down
      FROM ${fromJoin}
      WHERE am.project_location = $1
        AND am.category = ANY($2::text[])
        AND (am.category <> 'Auxillary' OR am.description ILIKE '%generator%')
      ORDER BY
        CASE am.category
          WHEN 'Plant' THEN 1
          WHEN 'Machinery' THEN 2
          WHEN 'Heavy Vehicle' THEN 3
          WHEN 'Light Vehicles & Bus' THEN 4
          WHEN 'Auxillary' THEN 5
          ELSE 6
        END,
        am.description ASC NULLS LAST,
        plate_no ASC NULLS LAST
      LIMIT 2000`;
    const rows = await query<{
      id: string;
      category: string | null;
      description: string | null;
      status: string | null;
      asset_no: string | null;
      plate_no: string | null;
      rate_op: number | null;
      rate_idle: number | null;
      rate_down: number | null;
    }>(sql, [projectLocation, UTILIZATION_CATEGORIES]);

    const data = (rows ?? []).map((r) => ({
      id: String(r.id),
      category: r.category != null ? String(r.category) : null,
      description: r.description != null ? String(r.description) : null,
      asset_no: r.asset_no != null ? String(r.asset_no) : null,
      plate_no: r.plate_no != null ? String(r.plate_no) : null,
      status: r.status != null ? String(r.status) : null,
      rate_op: r.rate_op != null ? Number(r.rate_op) : null,
      rate_idle: r.rate_idle != null ? Number(r.rate_idle) : null,
      rate_down: r.rate_down != null ? Number(r.rate_down) : null,
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
