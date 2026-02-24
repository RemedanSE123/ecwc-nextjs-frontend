import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { SLUG_TO_DB_CATEGORY } from '@/types/asset';

export const dynamic = 'force-dynamic';

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

export interface StatusTrendPoint {
  date: string;
  op: number;
  idle: number;
  down: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'day';
    const category = searchParams.get('category') || 'all';

    const dbCategory = category === 'all' ? null : (SLUG_TO_DB_CATEGORY[category] ?? category);

    const now = new Date();
    let startStr: string;
    if (period === 'day') {
      const start = new Date(now);
      start.setDate(start.getDate() - 30);
      startStr = start.toISOString().slice(0, 10);
    } else if (period === 'week') {
      const start = new Date(now);
      start.setDate(start.getDate() - 84);
      startStr = start.toISOString().slice(0, 10);
    } else {
      const start = new Date(now);
      start.setMonth(start.getMonth() - 12);
      startStr = start.toISOString().slice(0, 10);
    }

    const params: (string | number)[] = [startStr];
    if (dbCategory) params.push(dbCategory);

    let sql: string;
    if (period === 'day') {
      sql = `SELECT snapshot_date::text as date, op_count as op, idle_count as idle, down_count as down
             FROM asset_status_snapshot
             WHERE snapshot_date >= $1 AND snapshot_date <= CURRENT_DATE ${dbCategory ? 'AND category = $2' : 'AND category IS NULL'}
             ORDER BY snapshot_date ASC`;
    } else if (period === 'week') {
      sql = `SELECT DISTINCT ON (DATE_TRUNC('week', snapshot_date))
                    (DATE_TRUNC('week', snapshot_date) + INTERVAL '6 days')::date::text as date,
                    op_count as op, idle_count as idle, down_count as down
             FROM asset_status_snapshot
             WHERE snapshot_date >= $1 ${dbCategory ? 'AND category = $2' : 'AND category IS NULL'}
             ORDER BY DATE_TRUNC('week', snapshot_date), snapshot_date DESC`;
    } else {
      sql = `SELECT DISTINCT ON (DATE_TRUNC('month', snapshot_date))
                    (DATE_TRUNC('month', snapshot_date) + INTERVAL '1 month' - INTERVAL '1 day')::date::text as date,
                    op_count as op, idle_count as idle, down_count as down
             FROM asset_status_snapshot
             WHERE snapshot_date >= $1 ${dbCategory ? 'AND category = $2' : 'AND category IS NULL'}
             ORDER BY DATE_TRUNC('month', snapshot_date), snapshot_date DESC`;
    }

    const rows = await query<{ date: string; op: number; idle: number; down: number }>(sql, params);
    const result: StatusTrendPoint[] = (rows ?? []).map((r) => ({
      date: r.date?.slice(0, 10) ?? '',
      op: Number(r.op) ?? 0,
      idle: Number(r.idle) ?? 0,
      down: Number(r.down) ?? 0,
    }));

    return NextResponse.json(result);
  } catch (err) {
    const msg = getErrorMessage(err);
    console.error('GET /api/assets/reports/status-trend error:', msg);
    return NextResponse.json(
      { error: 'Failed to fetch status trend', detail: msg },
      { status: 500 }
    );
  }
}
