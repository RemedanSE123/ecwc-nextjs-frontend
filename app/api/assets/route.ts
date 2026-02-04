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
    const status = searchParams.get('status') || undefined;
    const project_location = searchParams.get('project_location') || undefined;
    const search = searchParams.get('search') || undefined;
    const ownership = searchParams.get('ownership') || undefined;
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
    if (status) {
      conditions.push(`status ILIKE $${idx}`);
      params.push(status);
      idx++;
    }
    if (project_location) {
      conditions.push(`project_location ILIKE $${idx}`);
      params.push(`%${project_location}%`);
      idx++;
    }
    if (ownership) {
      conditions.push(`ownership ILIKE $${idx}`);
      params.push(ownership);
      idx++;
    }
    if (responsible_person_name) {
      conditions.push(`responsible_person_name ILIKE $${idx}`);
      params.push(responsible_person_name);
      idx++;
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
