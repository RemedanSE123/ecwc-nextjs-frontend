import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { buildAssetWhereClause } from '@/lib/asset-filters-where';

export const dynamic = 'force-dynamic';

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

/** Detail table columns for completeness (excludes rate_*, created_at, updated_at) */
const DETAIL_COMPLETENESS: Record<string, { table: string; alias: string; columns: { name: string; label: string }[] }> = {
  'light-vehicles': {
    table: 'light_vehicle_details',
    alias: 'lvd',
    columns: [
      { name: 'plate_no', label: 'Plate No' },
      { name: 'engine_serial_no', label: 'Engine Serial No' },
      { name: 'capacity', label: 'Capacity' },
      { name: 'manuf_year', label: 'Manuf Year' },
      { name: 'libre', label: 'Libre' },
      { name: 'tire_size', label: 'Tire Size' },
      { name: 'battery_capacity', label: 'Battery Capacity' },
      { name: 'insurance_coverage', label: 'Insurance Coverage' },
      { name: 'bolo_renewal_date', label: 'Bolo Renewal Date' },
    ],
  },
  'heavy-vehicles': {
    table: 'heavy_vehicle_details',
    alias: 'hvd',
    columns: [
      { name: 'plate_no', label: 'Plate No' },
      { name: 'chassis_serial_no', label: 'Chassis Serial No' },
      { name: 'engine_make', label: 'Engine Make' },
      { name: 'engine_model', label: 'Engine Model' },
      { name: 'engine_serial_no', label: 'Engine Serial No' },
      { name: 'capacity', label: 'Capacity' },
      { name: 'manuf_year', label: 'Manuf Year' },
      { name: 'libre', label: 'Libre' },
      { name: 'tire_size', label: 'Tire Size' },
      { name: 'battery_capacity', label: 'Battery Capacity' },
      { name: 'insurance_coverage', label: 'Insurance Coverage' },
      { name: 'bolo_renewal_date', label: 'Bolo Renewal Date' },
    ],
  },
  machinery: {
    table: 'machinery_details',
    alias: 'md',
    columns: [
      { name: 'plate_no', label: 'Plate No' },
      { name: 'engine_make', label: 'Engine Make' },
      { name: 'engine_model', label: 'Engine Model' },
      { name: 'engine_serial_no', label: 'Engine Serial No' },
      { name: 'capacity', label: 'Capacity' },
      { name: 'manuf_year', label: 'Manuf Year' },
      { name: 'libre', label: 'Libre' },
      { name: 'tire_size', label: 'Tire Size' },
      { name: 'battery_capacity', label: 'Battery Capacity' },
    ],
  },
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryGroup = searchParams.get('category_group') || undefined;
    const { whereClause, params } = buildAssetWhereClause(searchParams);

    const cols = [
      'image_s3_key',
      'project_name',
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
      project_name: 'Location',
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

    const colExpr: Record<string, string> = {
      image_s3_key: 'am.image_s3_key',
      project_name: 'p.project_name',
      category: 'am.category',
      asset_no: 'am.asset_no',
      description: 'am.description',
      serial_no: 'am.serial_no',
      make: 'am.make',
      model: 'am.model',
      status: 'am.status',
      responsible_person_name: 'am.responsible_person_name',
      responsible_person_pno: 'am.responsible_person_pno',
      ownership: 'am.ownership',
      remark: 'am.remark',
    };
    const filters = cols.map((col) => {
      const expr = colExpr[col] ?? `am.${col}`;
      return `COUNT(*) FILTER (WHERE (${expr} IS NOT NULL) AND (TRIM(COALESCE(${expr}::text, '')) != ''))::int AS ${col}_filled`;
    }).join(', ');
    const oneRow = await query<Record<string, number>>(
      `SELECT COUNT(*)::int AS total, ${filters}
       FROM asset_master am
       LEFT JOIN projects p ON am.project_id = p.id
       WHERE ${whereClause}`,
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

    // Add detail columns for this category (excludes rate_*, created_at, updated_at)
    const detailConfig = categoryGroup ? DETAIL_COMPLETENESS[categoryGroup] : undefined;
    if (detailConfig && totalFromQuery > 0) {
      const { table, alias, columns } = detailConfig;
      const detailFilters = columns.map(
        (c) => `COUNT(*) FILTER (WHERE (${alias}.${c.name} IS NOT NULL) AND (TRIM(COALESCE(${alias}.${c.name}::text, '')) != ''))::int AS detail_${c.name}_filled`
      ).join(', ');
      const detailRow = await query<Record<string, number>>(
        `SELECT ${detailFilters}
         FROM asset_master am
         LEFT JOIN projects p ON am.project_id = p.id
         LEFT JOIN ${table} ${alias} ON am.id = ${alias}.asset_id
         WHERE ${whereClause}`,
        params
      );
      const dRow = detailRow?.[0];
      if (dRow) {
        for (const c of columns) {
          const filled = Number(dRow[`detail_${c.name}_filled`]) || 0;
          const empty = Math.max(0, totalFromQuery - filled);
          const pctEmpty = totalFromQuery ? Math.round((empty / totalFromQuery) * 100) : 0;
          const pctFilled = totalFromQuery ? Math.round((filled / totalFromQuery) * 100) : 0;
          results[c.label] = { filled, empty, pctEmpty, pctFilled };
        }
      }
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
