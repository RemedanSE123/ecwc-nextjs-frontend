import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { SLUG_TO_DB_CATEGORY } from '@/types/asset';

export const dynamic = 'force-dynamic';

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

/** Map raw DB status to report column key */
function mapStatusToColumn(raw: string): string {
  const s = (raw ?? '').trim().toLowerCase();
  if (s === 'op') return 'op';
  if (s === 'idle') return 'idle';
  if (s === 'ur') return 'ur';
  if (s === 'down') return 'down';
  if (s === 'hr' || s.startsWith('hr ')) return 'hr';
  if (s === 'ui') return 'ui';
  if (s.includes('waiting for installation') || s === 'wi') return 'wi';
  if (s.includes('under commissioning') || s === 'uc') return 'uc';
  if (s === 'rfd') return 'rfd';
  if (s.includes('approved for disposal') || s === 'afd') return 'afd';
  if (s.includes('accident')) return 'accident';
  return 'other';
}

const COL_KEYS = ['op', 'idle', 'ur', 'down', 'hr', 'ui', 'wi', 'uc', 'rfd', 'afd', 'accident', 'other'] as const;

export interface StatusSummaryRow {
  no: number;
  description: string;
  category: string;
  op: number;
  idle: number;
  ur: number;
  down: number;
  hr: number;
  ui: number;
  wi: number;
  uc: number;
  rfd: number;
  afd: number;
  accident: number;
  other: number;
  total: number;
}

export interface StatusSummaryResponse {
  rows: StatusSummaryRow[];
  grandTotal: Record<string, number>;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryGroup = searchParams.get('category_group') || undefined;

    const dbCategory = categoryGroup ? SLUG_TO_DB_CATEGORY[categoryGroup] : undefined;
    const categoryFilter = dbCategory ? 'WHERE category = $1' : '';
    const params = dbCategory ? [dbCategory] : [];

    const rows = await query<{ category: string; description: string; status: string; count: number }>(
      `SELECT category, COALESCE(NULLIF(TRIM(description), ''), 'Unspecified') as description,
              COALESCE(status, 'Unknown') as status, COUNT(*)::int as count
       FROM asset_master ${categoryFilter}
       GROUP BY category, description, status
       ORDER BY category, description, count DESC`,
      params
    );

    const byDesc = new Map<string, { category: string; counts: Record<string, number> }>();

    for (const r of rows) {
      const key = `${r.category}::${r.description}`;
      if (!byDesc.has(key)) {
        byDesc.set(key, { category: r.category, counts: Object.fromEntries(COL_KEYS.map((k) => [k, 0])) });
      }
      const col = mapStatusToColumn(r.status);
      const rec = byDesc.get(key)!;
      if (col in rec.counts) {
        rec.counts[col] += r.count;
      } else {
        rec.counts.other = (rec.counts.other ?? 0) + r.count;
      }
    }

    const grandTotal: Record<string, number> = Object.fromEntries(COL_KEYS.map((k) => [k, 0]));
    grandTotal.total = 0;

    const summaryRows: StatusSummaryRow[] = [];
    let no = 1;
    for (const [key, rec] of byDesc.entries()) {
      const [, description] = key.split('::');
      const total = COL_KEYS.reduce((sum, k) => sum + rec.counts[k], 0);
      summaryRows.push({
        no: no++,
        description,
        category: rec.category,
        op: rec.counts.op ?? 0,
        idle: rec.counts.idle ?? 0,
        ur: rec.counts.ur ?? 0,
        down: rec.counts.down ?? 0,
        hr: rec.counts.hr ?? 0,
        ui: rec.counts.ui ?? 0,
        wi: rec.counts.wi ?? 0,
        uc: rec.counts.uc ?? 0,
        rfd: rec.counts.rfd ?? 0,
        afd: rec.counts.afd ?? 0,
        accident: rec.counts.accident ?? 0,
        other: rec.counts.other ?? 0,
        total,
      });
      COL_KEYS.forEach((k) => (grandTotal[k] += rec.counts[k] ?? 0));
      grandTotal.total += total;
    }

    summaryRows.sort((a, b) => b.total - a.total);
    summaryRows.forEach((r, i) => (r.no = i + 1));

    return NextResponse.json({
      rows: summaryRows,
      grandTotal,
    });
  } catch (err) {
    const msg = getErrorMessage(err);
    console.error('GET /api/assets/reports/status-summary error:', msg);
    return NextResponse.json(
      { error: 'Failed to fetch status summary', detail: msg },
      { status: 500 }
    );
  }
}
