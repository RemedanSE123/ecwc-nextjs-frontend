import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { EQUIPMENT_CATEGORIES } from '@/types/asset';

export const dynamic = 'force-dynamic';

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

/** Map status to op/idle/down buckets for snapshot. */
function bucketStatus(status: string | null): 'op' | 'idle' | 'down' {
  const s = (status ?? '').trim().toLowerCase();
  if (s === 'op') return 'op';
  if (s === 'idle') return 'idle';
  return 'down'; // includes '0', 'unknown', and all other statuses
}

export async function POST(_request: NextRequest) {
  try {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    const existing = await query<{ count: number }>(
      `SELECT COUNT(*)::int as count FROM asset_status_snapshot WHERE snapshot_date = $1`,
      [today]
    );
    if ((existing?.[0]?.count ?? 0) > 0) {
      return NextResponse.json({ ok: true, message: 'Snapshot already exists for today' });
    }

    const rows = await query<{ category: string | null; status: string | null; count: number }>(
      `SELECT category, status, COUNT(*)::int as count
       FROM asset_master
       GROUP BY category, status`
    );

    const byCategory = new Map<string, { op: number; idle: number; down: number }>();
    let allOp = 0;
    let allIdle = 0;
    let allDown = 0;

    for (const r of rows ?? []) {
      const cat = r.category ?? 'Unspecified';
      if (!byCategory.has(cat)) {
        byCategory.set(cat, { op: 0, idle: 0, down: 0 });
      }
      const rec = byCategory.get(cat)!;
      const bucket = bucketStatus(r.status);
      rec[bucket] += r.count;
      allOp += bucket === 'op' ? r.count : 0;
      allIdle += bucket === 'idle' ? r.count : 0;
      allDown += bucket === 'down' ? r.count : 0;
    }

    await query(
      `INSERT INTO asset_status_snapshot (snapshot_date, category, op_count, idle_count, down_count, total_count)
       VALUES ($1, NULL, $2, $3, $4, $5)
       ON CONFLICT (snapshot_date, category) DO NOTHING`,
      [today, allOp, allIdle, allDown, allOp + allIdle + allDown]
    );

    for (const [cat, rec] of byCategory) {
      const total = rec.op + rec.idle + rec.down;
      await query(
        `INSERT INTO asset_status_snapshot (snapshot_date, category, op_count, idle_count, down_count, total_count)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (snapshot_date, category) DO NOTHING`,
        [today, cat, rec.op, rec.idle, rec.down, total]
      );
    }

    for (const { dbCategory } of EQUIPMENT_CATEGORIES) {
      if (byCategory.has(dbCategory)) continue;
      await query(
        `INSERT INTO asset_status_snapshot (snapshot_date, category, op_count, idle_count, down_count, total_count)
         VALUES ($1, $2, 0, 0, 0, 0)
         ON CONFLICT (snapshot_date, category) DO NOTHING`,
        [today, dbCategory]
      );
    }

    return NextResponse.json({ ok: true, message: 'Snapshot created' });
  } catch (err) {
    const msg = getErrorMessage(err);
    console.error('POST /api/assets/reports/status-snapshot error:', msg);
    return NextResponse.json(
      { error: 'Failed to create snapshot', detail: msg },
      { status: 500 }
    );
  }
}
