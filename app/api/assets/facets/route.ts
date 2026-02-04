import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { SLUG_TO_DB_CATEGORY } from '@/types/asset';

export const dynamic = 'force-dynamic';

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryGroup = searchParams.get('category_group') || undefined;
    const dbCategory = categoryGroup ? SLUG_TO_DB_CATEGORY[categoryGroup] : null;

    const baseWhere = dbCategory ? 'WHERE category = $1' : '';
    const statusWhere = baseWhere ? `${baseWhere} AND status IS NOT NULL AND status != ''` : "WHERE status IS NOT NULL AND status != ''";
    const locWhere = baseWhere ? `${baseWhere} AND project_location IS NOT NULL AND project_location != ''` : "WHERE project_location IS NOT NULL AND project_location != ''";
    const ownWhere = baseWhere ? `${baseWhere} AND ownership IS NOT NULL AND ownership != ''` : "WHERE ownership IS NOT NULL AND ownership != ''";
    const respWhere = baseWhere ? `${baseWhere} AND responsible_person_name IS NOT NULL AND responsible_person_name != ''` : "WHERE responsible_person_name IS NOT NULL AND responsible_person_name != ''";
    const params = dbCategory ? [dbCategory] : [];

    const [statusRes, locationRes, ownershipRes, responsibleRes] = await Promise.all([
      query<{ status: string }>(`SELECT DISTINCT status FROM asset_master ${statusWhere} ORDER BY status`, params),
      query<{ project_location: string }>(`SELECT DISTINCT project_location FROM asset_master ${locWhere} ORDER BY project_location`, params),
      query<{ ownership: string }>(`SELECT DISTINCT ownership FROM asset_master ${ownWhere} ORDER BY ownership`, params),
      query<{ responsible_person_name: string }>(`SELECT DISTINCT responsible_person_name FROM asset_master ${respWhere} ORDER BY responsible_person_name`, params),
    ]);

    return NextResponse.json({
      status: statusRes.map((r) => r.status),
      project_location: locationRes.map((r) => r.project_location),
      ownership: ownershipRes.map((r) => r.ownership),
      responsible_person_name: responsibleRes.map((r) => r.responsible_person_name),
    });
  } catch (err) {
    const msg = getErrorMessage(err);
    console.error('GET /api/assets/facets error:', msg);
    return NextResponse.json(
      { error: 'Failed to fetch facets', detail: msg },
      { status: 500 }
    );
  }
}
