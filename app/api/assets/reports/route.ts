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

    const categoryRows = await query<{ category: string; total: number }>(
      `SELECT category, COUNT(*)::int as total FROM asset_master ${categoryFilter}
       GROUP BY category ORDER BY total DESC`,
      params
    );
    const catTotal = categoryRows.reduce((s: number, r: { total: number }) => s + r.total, 0);
    const categoryBreakdown = categoryRows.map((r: { category: string; total: number }) => ({
      category: r.category,
      total: r.total,
      percentage: catTotal ? Math.round((r.total / catTotal) * 100) : 0,
    }));

    const statusRows = await query<{ status: string; total: number }>(
      `SELECT COALESCE(status, 'Unknown') as status, COUNT(*)::int as total FROM asset_master ${categoryFilter}
       GROUP BY status ORDER BY total DESC`,
      params
    );
    const statusTotal = statusRows.reduce((s: number, r: { total: number }) => s + r.total, 0);
    const statusBreakdown = statusRows.map((r: { status: string; total: number }) => ({
      status: r.status,
      total: r.total,
      percentage: statusTotal ? Math.round((r.total / statusTotal) * 100) : 0,
    }));

    const locationRows = await query<{ location: string; total: number }>(
      `SELECT COALESCE(project_location, 'Unassigned') as location, COUNT(*)::int as total
       FROM asset_master ${categoryFilter}
       GROUP BY project_location ORDER BY total DESC LIMIT 15`,
      params
    );
    const locationBreakdown = locationRows.map((r: { location: string; total: number }) => ({
      location: r.location,
      total: r.total,
    }));

    const recentParams = [...params, 10];
    const limitIdx = params.length + 1;
    const recentAssets = await query(
      `SELECT * FROM asset_master ${categoryFilter} ORDER BY created_at DESC LIMIT $${limitIdx}`,
      recentParams
    );

    return NextResponse.json({
      categoryBreakdown,
      statusBreakdown,
      locationBreakdown,
      recentAssets,
    });
  } catch (err) {
    const msg = getErrorMessage(err);
    console.error('GET /api/assets/reports error:', msg);
    return NextResponse.json(
      { error: 'Failed to fetch reports', detail: msg },
      { status: 500 }
    );
  }
}
