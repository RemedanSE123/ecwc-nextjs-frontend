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

    const categoryFilterAm = categoryFilter ? categoryFilter.replace('WHERE category', 'WHERE am.category') : '';
    const categoryRows = await query<{ category: string; total: number }>(
      `SELECT am.category AS category, COUNT(*)::int as total FROM asset_master am ${categoryFilterAm}
       GROUP BY am.category ORDER BY total DESC`,
      params
    );
    const catTotal = categoryRows.reduce((s: number, r: { total: number }) => s + r.total, 0);
    const categoryBreakdown = categoryRows.map((r: { category: string; total: number }) => ({
      category: r.category,
      total: r.total,
      percentage: catTotal ? Math.round((r.total / catTotal) * 100) : 0,
    }));

    const statusRows = await query<{ status: string; total: number }>(
      `SELECT COALESCE(am.status, 'Unknown') as status, COUNT(*)::int as total FROM asset_master am ${categoryFilterAm}
       GROUP BY am.status ORDER BY total DESC`,
      params
    );
    const statusTotal = statusRows.reduce((s: number, r: { total: number }) => s + r.total, 0);
    const statusBreakdown = statusRows.map((r: { status: string; total: number }) => ({
      status: r.status,
      total: r.total,
      percentage: statusTotal ? Math.round((r.total / statusTotal) * 100) : 0,
    }));

    const locationExpr = `COALESCE(NULLIF(TRIM(p.project_name), ''), 'Unassigned')`;
    const locationRows = await query<{ location: string; total: number; op: number; idle: number }>(
      `SELECT
         ${locationExpr} AS location,
         COUNT(*)::int AS total,
         COUNT(*) FILTER (WHERE LOWER(TRIM(COALESCE(am.status, ''))) = 'op')::int AS op,
         COUNT(*) FILTER (WHERE LOWER(TRIM(COALESCE(am.status, ''))) = 'idle')::int AS idle
       FROM asset_master am
       LEFT JOIN projects p ON am.project_id = p.id
       ${categoryFilterAm}
       GROUP BY ${locationExpr}
       ORDER BY location ASC`,
      params
    );

    const locCatRows = await query<{ location: string; category: string; count: number }>(
      `SELECT
         ${locationExpr} AS location,
         TRIM(category) AS category,
         COUNT(*)::int AS count
       FROM asset_master am
       LEFT JOIN projects p ON am.project_id = p.id
       ${categoryFilterAm}
       GROUP BY ${locationExpr}, TRIM(category)`,
      params
    );

    type CatKey = 'plant' | 'machinery' | 'heavy_vehicle' | 'light_vehicles' | 'factory_equipment' | 'auxiliary';
    function categoryToKey(cat: string): CatKey | null {
      const n = cat.trim().toLowerCase();
      const exact: Record<string, CatKey> = {
        'plant': 'plant',
        'machinery': 'machinery',
        'heavy vehicle': 'heavy_vehicle',
        'light vehicles & bus': 'light_vehicles',
        'factory equipment': 'factory_equipment',
        'auxillary': 'auxiliary',
        'auxiliary': 'auxiliary',
      };
      if (exact[n]) return exact[n];
      if (n.includes('plant')) return 'plant';
      if (n.includes('machinery')) return 'machinery';
      if (n.includes('heavy')) return 'heavy_vehicle';
      if (n.includes('light') && (n.includes('vehicle') || n.includes('bus'))) return 'light_vehicles';
      if (n.includes('factory')) return 'factory_equipment';
      if (n.includes('auxil')) return 'auxiliary';
      return null;
    }

    const catByLoc = new Map<string, { plant: number; machinery: number; heavy_vehicle: number; light_vehicles: number; factory_equipment: number; auxiliary: number }>();
    for (const r of locCatRows) {
      const loc = (r.location ?? '').trim() || 'Unassigned';
      if (!catByLoc.has(loc)) {
        catByLoc.set(loc, { plant: 0, machinery: 0, heavy_vehicle: 0, light_vehicles: 0, factory_equipment: 0, auxiliary: 0 });
      }
      const key = categoryToKey(r.category ?? '');
      if (key) {
        const row = catByLoc.get(loc)!;
        (row as Record<string, number>)[key] = (r.count ?? 0) + (row as Record<string, number>)[key];
      }
    }

    const locationBreakdown = locationRows.map((r) => {
      const op = r.op ?? 0;
      const idle = r.idle ?? 0;
      const total = r.total ?? 0;
      const loc = (r.location ?? '').trim() || 'Unassigned';
      const cats = catByLoc.get(loc) ?? {
        plant: 0, machinery: 0, heavy_vehicle: 0, light_vehicles: 0, factory_equipment: 0, auxiliary: 0,
      };
      return {
        location: r.location,
        total,
        op,
        idle,
        down: Math.max(0, total - op - idle),
        ...cats,
      };
    });

    const recentParams = [...params, 10];
    const limitIdx = params.length + 1;
    const recentAssets = await query(
      `SELECT am.*, p.project_name AS project_name
       FROM asset_master am
       LEFT JOIN projects p ON am.project_id = p.id
       ${categoryFilterAm}
       ORDER BY am.created_at DESC LIMIT $${limitIdx}`,
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
