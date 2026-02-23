import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { buildAssetWhereClause } from '@/lib/asset-filters-where';

export const dynamic = 'force-dynamic';

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { whereClause, params } = buildAssetWhereClause(searchParams);

    const cols = [
      'image_s3_key',
      'project_location',
      'category',
      'asset_no',
      'description',
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
      category: 'Category',
      asset_no: 'Asset No',
      description: 'Description',
      serial_no: 'Serial No',
      make: 'Make',
      model: 'Model',
      status: 'Status',
      responsible_person_name: 'Responsible',
      responsible_person_pno: 'Phone',
      ownership: 'Ownership',
      remark: 'Remark',
    };

    const filters = cols.map(
      (col) => `COUNT(*) FILTER (WHERE (${col} IS NOT NULL) AND (TRIM(COALESCE(${col}::text, '')) != ''))::int AS ${col}_filled`
    ).join(', ');
    const oneRow = await query<Record<string, number>>(
      `SELECT COUNT(*)::int AS total, ${filters} FROM asset_master WHERE ${whereClause}`,
      params
    );
    const row = oneRow?.[0];
    const totalFromQuery = row ? Number(row.total) || 0 : 0;
    if (totalFromQuery === 0) {
      return NextResponse.json({ total: 0, columns: {} });
    }
    const results: Record<string, { filled: number; empty: number; pctEmpty: number; pctFilled: number }> = {};
    for (const col of cols) {
      const filled = Number(row[`${col}_filled`]) || 0;
      const empty = Math.max(0, totalFromQuery - filled);
      const pctEmpty = totalFromQuery ? Math.round((empty / totalFromQuery) * 100) : 0;
      const pctFilled = totalFromQuery ? Math.round((filled / totalFromQuery) * 100) : 0;
      results[columnLabels[col] || col] = { filled, empty, pctEmpty, pctFilled };
    }

    return NextResponse.json({ total: totalFromQuery, columns: results });
  } catch (err) {
    const msg = getErrorMessage(err);
    console.error('GET /api/assets/completeness error:', msg);
    return NextResponse.json(
      { error: 'Failed to fetch completeness', detail: msg },
      { status: 500 }
    );
  }
}
