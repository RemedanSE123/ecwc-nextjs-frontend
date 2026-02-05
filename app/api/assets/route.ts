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

function getParamValues(searchParams: URLSearchParams, key: string): string[] {
  const all = searchParams.getAll(key);
  if (all.length > 0) return all.map((v) => v.trim()).filter(Boolean);
  const single = searchParams.get(key);
  if (single?.trim()) return [single.trim()];
  return [];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
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

    const dbCategory = categoryGroup ? SLUG_TO_DB_CATEGORY[categoryGroup] : category;
    if (dbCategory) {
      conditions.push(`category = $${idx}`);
      params.push(dbCategory);
      idx++;
    }
    if (statusArr.length > 0) {
      conditions.push(`(status = ${statusArr.map((_, i) => `$${idx + i}`).join(' OR status = ')})`);
      statusArr.forEach((v) => params.push(v));
      idx += statusArr.length;
    }
    if (project_locationArr.length > 0) {
      conditions.push(`(project_location = ${project_locationArr.map((_, i) => `$${idx + i}`).join(' OR project_location = ')})`);
      project_locationArr.forEach((v) => params.push(v));
      idx += project_locationArr.length;
    }
    if (makeArr.length > 0) {
      conditions.push(`(make = ${makeArr.map((_, i) => `$${idx + i}`).join(' OR make = ')})`);
      makeArr.forEach((v) => params.push(v));
      idx += makeArr.length;
    }
    if (modelArr.length > 0) {
      conditions.push(`(model = ${modelArr.map((_, i) => `$${idx + i}`).join(' OR model = ')})`);
      modelArr.forEach((v) => params.push(v));
      idx += modelArr.length;
    }
    if (ownershipArr.length > 0) {
      conditions.push(`(ownership = ${ownershipArr.map((_, i) => `$${idx + i}`).join(' OR ownership = ')})`);
      ownershipArr.forEach((v) => params.push(v));
      idx += ownershipArr.length;
    }
    if (responsible_person_name) {
      conditions.push(`responsible_person_name ILIKE $${idx}`);
      params.push(responsible_person_name);
      idx++;
    }
    if (descriptionArr.length > 0) {
      conditions.push(`(description = ${descriptionArr.map((_, i) => `$${idx + i}`).join(' OR description = ')})`);
      descriptionArr.forEach((v) => params.push(v));
      idx += descriptionArr.length;
    }
    if (search) {
      const pattern = `%${search}%`;
      conditions.push(`(
        description ILIKE $${idx} OR asset_no ILIKE $${idx + 1} OR
        serial_no ILIKE $${idx + 2} OR make ILIKE $${idx + 3} OR
        model ILIKE $${idx + 4} OR responsible_person_name ILIKE $${idx + 5}
      )`);
      params.push(pattern, pattern, pattern, pattern, pattern, pattern);
      idx += 6;
    }

    const whereClause = conditions.join(' AND ');

    const countQuery = `SELECT COUNT(*)::int as total FROM asset_master WHERE ${whereClause}`;
    const countRes = await query<{ total: number }>(countQuery, params);
    const total = countRes?.[0]?.total ?? 0;

    params.push(limit, offset);
    const dataQuery = `SELECT * FROM asset_master WHERE ${whereClause} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`;
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
