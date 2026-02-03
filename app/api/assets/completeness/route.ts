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
    const categoryGroup = searchParams.get('category_group') || undefined;
    const dbCategory = categoryGroup ? SLUG_TO_DB_CATEGORY[categoryGroup] : null;

    const whereClause = dbCategory ? 'WHERE category = $1' : '';
    const params = dbCategory ? [dbCategory] : [];

    const totalRes = await query<{ total: number }>(
      `SELECT COUNT(*)::int as total FROM asset_master ${whereClause}`,
      params
    );
    const total = totalRes?.[0]?.total ?? 0;

    if (total === 0) {
      return NextResponse.json({
        total: 0,
        columns: {},
      });
    }

    const cols = [
      'image_s3_key',
      'project_location',
      'asset_no',
      'serial_no',
      'make',
      'model',
      'status',
      'responsible_person_name',
      'responsible_person_pno',
      'ownership',
      'remark',
    ];

    const columnLabels: Record<string, string> = {
      image_s3_key: 'Image',
      project_location: 'Location',
      asset_no: 'Asset No',
      serial_no: 'Serial No',
      make: 'Make',
      model: 'Model',
      status: 'Status',
      responsible_person_name: 'Responsible',
      responsible_person_pno: 'Phone',
      ownership: 'Ownership',
      remark: 'Remark',
    };

    const results: Record<string, { filled: number; empty: number; pctEmpty: number; pctFilled: number }> = {};

    const connector = whereClause ? ' AND ' : ' WHERE ';
    for (const col of cols) {
      const filledRes = await query<{ cnt: number }>(
        `SELECT COUNT(*)::int as cnt FROM asset_master ${whereClause}${connector}${col} IS NOT NULL AND TRIM(${col}::text) != ''`,
        params
      );
      const filled = filledRes?.[0]?.cnt ?? 0;
      const empty = total - filled;
      const pctEmpty = total ? Math.round((empty / total) * 100) : 0;
      const pctFilled = total ? Math.round((filled / total) * 100) : 0;
      results[columnLabels[col] || col] = { filled, empty, pctEmpty, pctFilled };
    }

    return NextResponse.json({ total, columns: results });
  } catch (err) {
    const msg = getErrorMessage(err);
    console.error('GET /api/assets/completeness error:', msg);
    return NextResponse.json(
      { error: 'Failed to fetch completeness', detail: msg },
      { status: 500 }
    );
  }
}
