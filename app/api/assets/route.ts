import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { SLUG_TO_DB_CATEGORY } from '@/types/asset';
import { getUserFromRequest, getSessionIdFromRequest, insertAuditLog } from '@/lib/audit';

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
        description ILIKE $${idx} OR asset_no ILIKE $${idx + 1} OR
        serial_no ILIKE $${idx + 2} OR make ILIKE $${idx + 3} OR
        model ILIKE $${idx + 4} OR responsible_person_name ILIKE $${idx + 5} OR
        project_location ILIKE $${idx + 6} OR category ILIKE $${idx + 7} OR
        ownership ILIKE $${idx + 8} OR remark ILIKE $${idx + 9}
      )`);
      params.push(pattern, pattern, pattern, pattern, pattern, pattern, pattern, pattern, pattern, pattern);
      idx += 10;
    }

    const whereClause = conditions.join(' AND ');

    const countQuery = `SELECT COUNT(*)::int as total FROM asset_master WHERE ${whereClause}`;
    const countRes = await query<{ total: number }>(countQuery, params);
    const total = countRes?.[0]?.total ?? 0;

    params.push(limit, offset);
    const dataQuery = `SELECT * FROM asset_master WHERE ${whereClause} ORDER BY project_location ASC NULLS LAST, created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`;
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
