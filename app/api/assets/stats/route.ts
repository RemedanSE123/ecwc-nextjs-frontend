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
    const category = searchParams.get('category') || undefined;
    const categoryGroup = searchParams.get('category_group') || undefined;

    const dbCategory = categoryGroup ? SLUG_TO_DB_CATEGORY[categoryGroup] : category;
    let categoryFilter = '';
    const params: string[] = [];
    if (dbCategory) {
      categoryFilter = 'WHERE category = $1';
      params.push(dbCategory);
    }

    const totalRes = await query<{ total: number }>(
      `SELECT COUNT(*)::int as total FROM asset_master am ${categoryFilter ? categoryFilter.replace('WHERE category', 'WHERE am.category') : ''}`,
      params
    );
    const totalCount = totalRes?.[0]?.total ?? 0;

    const byCategory = await query<{ category: string; count: number }>(
      `SELECT am.category as category, COUNT(*)::int as count
       FROM asset_master am ${categoryFilter ? categoryFilter.replace('WHERE category', 'WHERE am.category') : ''}
       GROUP BY am.category ORDER BY count DESC`,
      params
    );

    const byStatus = await query<{ status: string; count: number }>(
      `SELECT COALESCE(am.status, 'Unknown') as status, COUNT(*)::int as count
       FROM asset_master am ${categoryFilter ? categoryFilter.replace('WHERE category', 'WHERE am.category') : ''}
       GROUP BY am.status ORDER BY count DESC`,
      params
    );

    const byLocation = await query<{ project_name: string; count: number }>(
      `SELECT COALESCE(NULLIF(TRIM(p.project_name), ''), 'Unassigned') as project_name, COUNT(*)::int as count
       FROM asset_master am
       LEFT JOIN projects p ON am.project_id = p.id
       ${categoryFilter ? categoryFilter.replace('WHERE category', 'WHERE am.category') : ''}
       GROUP BY COALESCE(NULLIF(TRIM(p.project_name), ''), 'Unassigned') ORDER BY count DESC
       LIMIT 20`,
      params
    );

    const categoryFilterAm = categoryFilter ? categoryFilter.replace('WHERE category', 'WHERE am.category') : '';
    const locationCondition = `${categoryFilterAm ? categoryFilterAm + ' AND' : 'WHERE'} (p.project_name IS NOT NULL AND TRIM(p.project_name) != '' AND p.project_name != 'Unassigned')`;
    const uniqueSitesRes = await query<{ unique_project_sites: number }>(
      `SELECT COUNT(DISTINCT p.project_name)::int as unique_project_sites
       FROM asset_master am
       LEFT JOIN projects p ON am.project_id = p.id
       ${locationCondition}`,
      params
    );
    const uniqueProjectSites = uniqueSitesRes?.[0]?.unique_project_sites ?? 0;

    return NextResponse.json({
      total: totalCount,
      byCategory,
      byStatus,
      byLocation,
      uniqueProjectSites,
    });
  } catch (err) {
    const msg = getErrorMessage(err);
    console.error('GET /api/assets/stats error:', msg);
    return NextResponse.json(
      { error: 'Failed to fetch stats', detail: msg },
      { status: 500 }
    );
  }
}
