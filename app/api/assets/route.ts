import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { SLUG_TO_DB_CATEGORY } from '@/types/asset';
import { getUserFromRequest, getSessionIdFromRequest, insertAuditLog } from '@/lib/audit';
import { createAssetChangeAnnouncement } from '@/lib/asset-change-announcement';

export const dynamic = 'force-dynamic';

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

const ASSET_COLUMNS = [
  'image_s3_key', 'project_location', 'category', 'asset_no', 'description',
  'serial_no', 'make', 'model', 'status', 'responsible_person_name',
  'responsible_person_pno', 'ownership', 'remark',
] as const;

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', detail: 'Valid X-User-Phone and X-User-Name required' },
        { status: 401 }
      );
    }
    const body = await request.json();
    const category = body.category ?? null;
    const description = (body.description ?? '').trim() || null;
    if (!category || !description) {
      return NextResponse.json(
        { error: 'Validation error', detail: 'category and description are required' },
        { status: 400 }
      );
    }

    // Enforce unique asset_no and serial_no (case/whitespace insensitive)
    const assetNo = (body.asset_no ?? '').trim();
    if (assetNo) {
      const dup = await query<{ id: string }>(
        `SELECT id FROM asset_master WHERE LOWER(TRIM(asset_no)) = LOWER(TRIM($1)) LIMIT 1`,
        [assetNo]
      );
      if (dup && dup.length > 0) {
        return NextResponse.json(
          { error: 'Validation error', detail: 'An asset with this Asset No already exists. Asset No must be unique.' },
          { status: 400 }
        );
      }
    }
    const serialNo = (body.serial_no ?? '').trim();
    if (serialNo) {
      const dup = await query<{ id: string }>(
        `SELECT id FROM asset_master WHERE LOWER(TRIM(serial_no)) = LOWER(TRIM($1)) LIMIT 1`,
        [serialNo]
      );
      if (dup && dup.length > 0) {
        return NextResponse.json(
          { error: 'Validation error', detail: 'An asset with this Serial No already exists. Serial No must be unique.' },
          { status: 400 }
        );
      }
    }
    const values: (string | null)[] = [];
    for (const key of ASSET_COLUMNS) {
      const v = body[key];
      values.push(v === undefined || v === '' ? null : String(v));
    }
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    const sql = `INSERT INTO asset_master (${ASSET_COLUMNS.join(', ')}) VALUES (${placeholders}) RETURNING *`;
    const rows = await query(sql, values);
    if (!rows?.length) {
      return NextResponse.json(
        { error: 'Insert failed' },
        { status: 500 }
      );
    }
    const inserted = rows[0] as Record<string, unknown>;
    const newId = inserted?.id;
    const createdFields: Record<string, string | null> = {};
    for (const col of ASSET_COLUMNS) {
      const v = inserted[col];
      createdFields[col] = v == null ? null : String(v);
    }
    await insertAuditLog({
      user_phone: user.phone,
      user_name: user.name,
      action: 'asset_create',
      entity_type: 'asset',
      entity_id: newId != null ? String(newId) : null,
      details: { created_fields: createdFields },
      session_id: getSessionIdFromRequest(request),
    });
    if (newId != null) {
      const initialStatus = inserted.status;
      const statusTo = initialStatus != null && initialStatus !== '' ? String(initialStatus) : '—';
      const params: (string | number)[] = [
        typeof newId === 'number' ? newId : String(newId),
        statusTo,
        user.phone,
        user.name,
      ];
      await query(
        `INSERT INTO asset_status_history (asset_id, status_from, status_to, changed_by_phone, changed_by_name)
         VALUES ($1, NULL, $2, $3, $4)`,
        params
      );
      const desc = (inserted.description || 'Unspecified') as string;
      await createAssetChangeAnnouncement({
        title: 'New asset created',
        body: `"${desc}" created with status ${statusTo} by ${user.name}.`,
        created_by_phone: user.phone,
        created_by_name: user.name,
      });
    }
    return NextResponse.json(rows[0], { status: 201 });
  } catch (err) {
    const msg = getErrorMessage(err);
    console.error('POST /api/assets error:', msg);
    return NextResponse.json(
      { error: 'Failed to create asset', detail: msg },
      { status: 500 }
    );
  }
}

const BLANK_FILTER_VALUE = '__BLANK__';

function getParamValues(searchParams: URLSearchParams, key: string): string[] {
  const all = searchParams.getAll(key);
  if (all.length > 0) return all.map((v) => v.trim()).filter((v) => v !== '');
  const single = searchParams.get(key);
  if (single?.trim()) return [single.trim()];
  return [];
}

/** Split values into regular values and whether blanks are requested. */
function splitValues(arr: string[]): { values: string[]; includeBlanks: boolean } {
  const values = arr.filter((v) => v !== BLANK_FILTER_VALUE);
  const includeBlanks = arr.includes(BLANK_FILTER_VALUE);
  return { values, includeBlanks };
}

/** SQL condition for column being blank (null or empty/whitespace). */
function blankCondition(column: string): string {
  return `(${column} IS NULL OR TRIM(COALESCE(${column}, '')::text) = '')`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryArr = getParamValues(searchParams, 'category');
    const categoryGroup = searchParams.get('category_group') || undefined;
    const statusArr = getParamValues(searchParams, 'status');
    const project_locationArr = getParamValues(searchParams, 'project_location');
    const makeArr = getParamValues(searchParams, 'make');
    const modelArr = getParamValues(searchParams, 'model');
    const ownershipArr = getParamValues(searchParams, 'ownership');
    const search = searchParams.get('search') || undefined;
    const descriptionArr = getParamValues(searchParams, 'description');
    const responsible_person_name = searchParams.get('responsible_person_name') || undefined;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(5000, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const offset = (page - 1) * limit;
    const includeDetails = searchParams.get('include_details') === 'true';

    const conditions: string[] = ['1=1'];
    const params: (string | number)[] = [];
    let idx = 1;

    if (categoryGroup) {
      const dbCategory = SLUG_TO_DB_CATEGORY[categoryGroup];
      if (dbCategory) {
        conditions.push(`category = $${idx}`);
        params.push(dbCategory);
        idx++;
      }
    } else if (categoryArr.length > 0) {
      const { values, includeBlanks } = splitValues(categoryArr);
      const parts: string[] = [];
      if (values.length > 0) {
        parts.push(`(category = ${values.map((_, i) => `$${idx + i}`).join(' OR category = ')})`);
        values.forEach((v) => params.push(v));
        idx += values.length;
      }
      if (includeBlanks) parts.push(blankCondition('category'));
      if (parts.length > 0) conditions.push(`(${parts.join(' OR ')})`);
    }
    const { values: statusVals, includeBlanks: statusBlanks } = splitValues(statusArr);
    if (statusVals.length > 0 || statusBlanks) {
      const parts: string[] = [];
      if (statusVals.length > 0) {
        parts.push(`(status = ${statusVals.map((_, i) => `$${idx + i}`).join(' OR status = ')})`);
        statusVals.forEach((v) => params.push(v));
        idx += statusVals.length;
      }
      if (statusBlanks) parts.push(blankCondition('status'));
      if (parts.length > 0) conditions.push(`(${parts.join(' OR ')})`);
    }
    const { values: locVals, includeBlanks: locBlanks } = splitValues(project_locationArr);
    if (locVals.length > 0 || locBlanks) {
      const parts: string[] = [];
      if (locVals.length > 0) {
        parts.push(`(project_location = ${locVals.map((_, i) => `$${idx + i}`).join(' OR project_location = ')})`);
        locVals.forEach((v) => params.push(v));
        idx += locVals.length;
      }
      if (locBlanks) parts.push(blankCondition('project_location'));
      if (parts.length > 0) conditions.push(`(${parts.join(' OR ')})`);
    }
    const { values: makeVals, includeBlanks: makeBlanks } = splitValues(makeArr);
    if (makeVals.length > 0 || makeBlanks) {
      const parts: string[] = [];
      if (makeVals.length > 0) {
        parts.push(`(make = ${makeVals.map((_, i) => `$${idx + i}`).join(' OR make = ')})`);
        makeVals.forEach((v) => params.push(v));
        idx += makeVals.length;
      }
      if (makeBlanks) parts.push(blankCondition('make'));
      if (parts.length > 0) conditions.push(`(${parts.join(' OR ')})`);
    }
    const { values: modelVals, includeBlanks: modelBlanks } = splitValues(modelArr);
    if (modelVals.length > 0 || modelBlanks) {
      const parts: string[] = [];
      if (modelVals.length > 0) {
        parts.push(`(model = ${modelVals.map((_, i) => `$${idx + i}`).join(' OR model = ')})`);
        modelVals.forEach((v) => params.push(v));
        idx += modelVals.length;
      }
      if (modelBlanks) parts.push(blankCondition('model'));
      if (parts.length > 0) conditions.push(`(${parts.join(' OR ')})`);
    }
    const { values: ownVals, includeBlanks: ownBlanks } = splitValues(ownershipArr);
    if (ownVals.length > 0 || ownBlanks) {
      const parts: string[] = [];
      if (ownVals.length > 0) {
        parts.push(`(ownership = ${ownVals.map((_, i) => `$${idx + i}`).join(' OR ownership = ')})`);
        ownVals.forEach((v) => params.push(v));
        idx += ownVals.length;
      }
      if (ownBlanks) parts.push(blankCondition('ownership'));
      if (parts.length > 0) conditions.push(`(${parts.join(' OR ')})`);
    }
    if (responsible_person_name) {
      conditions.push(`responsible_person_name ILIKE $${idx}`);
      params.push(responsible_person_name);
      idx++;
    }
    const { values: descVals, includeBlanks: descBlanks } = splitValues(descriptionArr);
    if (descVals.length > 0 || descBlanks) {
      const parts: string[] = [];
      if (descVals.length > 0) {
        parts.push(`(description = ${descVals.map((_, i) => `$${idx + i}`).join(' OR description = ')})`);
        descVals.forEach((v) => params.push(v));
        idx += descVals.length;
      }
      if (descBlanks) parts.push(blankCondition('description'));
      if (parts.length > 0) conditions.push(`(${parts.join(' OR ')})`);
    }
    if (search) {
      const pattern = `%${search}%`;
      conditions.push(`(
        am.description ILIKE $${idx} OR am.asset_no ILIKE $${idx + 1} OR
        am.serial_no ILIKE $${idx + 2} OR am.make ILIKE $${idx + 3} OR
        am.model ILIKE $${idx + 4} OR am.responsible_person_name ILIKE $${idx + 5} OR
        am.project_location ILIKE $${idx + 6} OR am.category ILIKE $${idx + 7} OR
        am.ownership ILIKE $${idx + 8} OR am.remark ILIKE $${idx + 9} OR
        hvd.plate_no ILIKE $${idx + 10} OR lvd.plate_no ILIKE $${idx + 11} OR md.plate_no ILIKE $${idx + 12}
      )`);
      params.push(pattern, pattern, pattern, pattern, pattern, pattern, pattern, pattern, pattern, pattern, pattern, pattern, pattern);
      idx += 13;
    }

    const whereClause = conditions.join(' AND ');

    const fromJoin = `asset_master am LEFT JOIN heavy_vehicle_details hvd ON am.id = hvd.asset_id LEFT JOIN light_vehicle_details lvd ON am.id = lvd.asset_id LEFT JOIN machinery_details md ON am.id = md.asset_id`;
    const countQuery = `SELECT COUNT(*)::int as total FROM ${fromJoin} WHERE ${whereClause}`;
    const countRes = await query<{ total: number }>(countQuery, params);
    const total = countRes?.[0]?.total ?? 0;

    params.push(limit, offset);
    const detailCols = includeDetails
      ? `, hvd.plate_no AS hvd_plate_no, hvd.chassis_serial_no AS hvd_chassis_serial_no, hvd.engine_make AS hvd_engine_make, hvd.engine_model AS hvd_engine_model, hvd.engine_serial_no AS hvd_engine_serial_no, hvd.capacity AS hvd_capacity, hvd.manuf_year AS hvd_manuf_year, hvd.libre AS hvd_libre, hvd.tire_size AS hvd_tire_size, hvd.battery_capacity AS hvd_battery_capacity, hvd.insurance_coverage AS hvd_insurance_coverage, hvd.bolo_renewal_date AS hvd_bolo_renewal_date, lvd.plate_no AS lvd_plate_no, lvd.engine_serial_no AS lvd_engine_serial_no, lvd.capacity AS lvd_capacity, lvd.manuf_year AS lvd_manuf_year, lvd.libre AS lvd_libre, lvd.tire_size AS lvd_tire_size, lvd.battery_capacity AS lvd_battery_capacity, lvd.insurance_coverage AS lvd_insurance_coverage, lvd.bolo_renewal_date AS lvd_bolo_renewal_date, md.plate_no AS md_plate_no, md.engine_make AS md_engine_make, md.engine_model AS md_engine_model, md.engine_serial_no AS md_engine_serial_no, md.capacity AS md_capacity, md.manuf_year AS md_manuf_year, md.libre AS md_libre, md.tire_size AS md_tire_size, md.battery_capacity AS md_battery_capacity`
      : '';
    const dataQuery = `SELECT am.*, COALESCE(hvd.plate_no, lvd.plate_no, md.plate_no) AS plate_no${detailCols} FROM ${fromJoin} WHERE ${whereClause} ORDER BY am.project_location ASC NULLS LAST, am.created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`;
    const data = await query(dataQuery, params);

    return NextResponse.json({
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    const msg = getErrorMessage(err);
    console.error('GET /api/assets error:', msg);
    return NextResponse.json(
      { error: 'Failed to fetch assets', detail: msg },
      { status: 500 }
    );
  }
}
