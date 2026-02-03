import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { SLUG_TO_DB_CATEGORY } from '@/types/asset';

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
      `SELECT COUNT(*)::int as total FROM asset_master ${categoryFilter}`,
      params
    );
    const totalCount = totalRes?.[0]?.total ?? 0;

    const byCategory = await query<{ category: string; count: number }>(
      `SELECT category, COUNT(*)::int as count
       FROM asset_master ${categoryFilter}
       GROUP BY category ORDER BY count DESC`,
      params
    );

    const byStatus = await query<{ status: string; count: number }>(
      `SELECT COALESCE(status, 'Unknown') as status, COUNT(*)::int as count
       FROM asset_master ${categoryFilter}
       GROUP BY status ORDER BY count DESC`,
      params
    );

    const byLocation = await query<{ project_location: string; count: number }>(
      `SELECT COALESCE(project_location, 'Unassigned') as project_location, COUNT(*)::int as count
       FROM asset_master ${categoryFilter}
       GROUP BY project_location ORDER BY count DESC
       LIMIT 20`,
      params
    );

    return NextResponse.json({
      total: totalCount,
      byCategory,
      byStatus,
      byLocation,
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
