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
    const categoryWhere = baseWhere ? `${baseWhere}` : "WHERE category IS NOT NULL AND TRIM(category::text) != ''";
    const descWhere = baseWhere ? `${baseWhere} AND description IS NOT NULL AND TRIM(description::text) != ''` : "WHERE description IS NOT NULL AND TRIM(description::text) != ''";
    const statusWhere = baseWhere ? `${baseWhere} AND status IS NOT NULL AND TRIM(status::text) != ''` : "WHERE status IS NOT NULL AND TRIM(status::text) != ''";
    const locWhere = baseWhere ? `${baseWhere} AND project_location IS NOT NULL AND TRIM(project_location::text) != ''` : "WHERE project_location IS NOT NULL AND TRIM(project_location::text) != ''";
    const makeWhere = baseWhere ? `${baseWhere} AND make IS NOT NULL AND TRIM(make::text) != ''` : "WHERE make IS NOT NULL AND TRIM(make::text) != ''";
    const modelWhere = baseWhere ? `${baseWhere} AND model IS NOT NULL AND TRIM(model::text) != ''` : "WHERE model IS NOT NULL AND TRIM(model::text) != ''";
    const ownWhere = baseWhere ? `${baseWhere} AND ownership IS NOT NULL AND TRIM(ownership::text) != ''` : "WHERE ownership IS NOT NULL AND TRIM(ownership::text) != ''";
    const respWhere = baseWhere ? `${baseWhere} AND responsible_person_name IS NOT NULL AND TRIM(responsible_person_name::text) != ''` : "WHERE responsible_person_name IS NOT NULL AND TRIM(responsible_person_name::text) != ''";
    const params = dbCategory ? [dbCategory] : [];

    const [categoryRes, descriptionRes, statusRes, locationRes, makeRes, modelRes, ownershipRes, responsibleRes] = await Promise.all([
      query<{ category: string }>(`SELECT DISTINCT category FROM asset_master ${categoryWhere} ORDER BY category`, params),
      query<{ description: string }>(`SELECT DISTINCT description FROM asset_master ${descWhere} ORDER BY description LIMIT 500`, params),
      query<{ status: string }>(`SELECT DISTINCT status FROM asset_master ${statusWhere} ORDER BY status`, params),
      query<{ project_location: string }>(`SELECT DISTINCT project_location FROM asset_master ${locWhere} ORDER BY project_location`, params),
      query<{ make: string }>(`SELECT DISTINCT make FROM asset_master ${makeWhere} ORDER BY make`, params),
      query<{ model: string }>(`SELECT DISTINCT model FROM asset_master ${modelWhere} ORDER BY model`, params),
      query<{ ownership: string }>(`SELECT DISTINCT ownership FROM asset_master ${ownWhere} ORDER BY ownership`, params),
      query<{ responsible_person_name: string }>(`SELECT DISTINCT responsible_person_name FROM asset_master ${respWhere} ORDER BY responsible_person_name`, params),
    ]);

    const toStrings = <T extends Record<string, unknown>>(rows: T[], key: keyof T): string[] =>
      (rows ?? []).map((r) => r[key]).filter((v): v is string => v != null && String(v).trim() !== '');

    return NextResponse.json({
      category: toStrings(categoryRes, 'category'),
      description: toStrings(descriptionRes, 'description'),
      status: toStrings(statusRes, 'status'),
      project_location: toStrings(locationRes, 'project_location'),
      make: toStrings(makeRes, 'make'),
      model: toStrings(modelRes, 'model'),
      ownership: toStrings(ownershipRes, 'ownership'),
      responsible_person_name: toStrings(responsibleRes, 'responsible_person_name'),
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
