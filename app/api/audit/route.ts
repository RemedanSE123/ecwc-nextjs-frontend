import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest, getSessionIdFromRequest, insertAuditLog } from '@/lib/audit';
import { AUTH_ACCOUNTS } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

/** POST: log an action from client (e.g. login). Body: { action, entity_type?, entity_id?, details? }. */
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', detail: 'Valid X-User-Phone and X-User-Name required' },
        { status: 401 }
      );
    }
    let body: { action?: string; entity_type?: string; entity_id?: string; details?: Record<string, unknown> } = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }
    const action = body.action ?? 'login';
    const session_id = getSessionIdFromRequest(request);
    await insertAuditLog({
      user_phone: user.phone,
      user_name: user.name,
      action,
      entity_type: body.entity_type ?? null,
      entity_id: body.entity_id ?? null,
      details: body.details ?? null,
      session_id,
    });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    const msg = getErrorMessage(err);
    console.error('POST /api/audit error:', msg);
    return NextResponse.json(
      { error: 'Failed to log audit', detail: msg },
      { status: 500 }
    );
  }
}

export interface AuditLogRow {
  id: number;
  user_phone: string;
  user_name: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
  session_id: string | null;
}

/** GET: list audit logs with filters. Params: user_phone, action, entity_type, session_id, from_date, to_date, page, limit, sort. */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_phone = searchParams.get('user_phone')?.trim();
    const action = searchParams.get('action')?.trim();
    const entity_type = searchParams.get('entity_type')?.trim();
    const session_id = searchParams.get('session_id')?.trim();
    const from_date = searchParams.get('from_date')?.trim();
    const to_date = searchParams.get('to_date')?.trim();
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(500, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));
    const sort = searchParams.get('sort') || 'created_at_desc';
    const offset = (page - 1) * limit;

    const conditions: string[] = ['1=1'];
    const params: (string | number)[] = [];
    let idx = 1;

    if (session_id) {
      conditions.push(`session_id = $${idx}`);
      params.push(session_id);
      idx++;
    }
    if (user_phone) {
      const validPhones = AUTH_ACCOUNTS.map((a) => a.phone.replace(/\s/g, ''));
      const normalized = user_phone.replace(/\s/g, '');
      if (!validPhones.includes(normalized)) {
        return NextResponse.json(
          { error: 'Invalid user_phone filter' },
          { status: 400 }
        );
      }
      conditions.push(`user_phone = $${idx}`);
      params.push(user_phone);
      idx++;
    }
    if (action) {
      conditions.push(`action = $${idx}`);
      params.push(action);
      idx++;
    }
    if (entity_type) {
      conditions.push(`entity_type = $${idx}`);
      params.push(entity_type);
      idx++;
    }
    if (from_date) {
      conditions.push(`created_at >= $${idx}::timestamptz`);
      params.push(from_date);
      idx++;
    }
    if (to_date) {
      conditions.push(`created_at <= $${idx}::timestamptz`);
      params.push(to_date);
      idx++;
    }

    const whereClause = conditions.join(' AND ');
    const orderBy = sort === 'created_at_asc' ? 'created_at ASC' : 'created_at DESC';

    const countQuery = `SELECT COUNT(*)::int AS total FROM audit_log WHERE ${whereClause}`;
    const countRes = await query<{ total: number }>(countQuery, params);
    const total = countRes?.[0]?.total ?? 0;

    params.push(limit, offset);
    const dataQuery = `SELECT id, user_phone, user_name, action, entity_type, entity_id, details, created_at, session_id
      FROM audit_log WHERE ${whereClause} ORDER BY ${orderBy} LIMIT $${idx} OFFSET $${idx + 1}`;
    const data = await query<AuditLogRow>(dataQuery, params);

    return NextResponse.json({
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    const msg = getErrorMessage(err);
    console.error('GET /api/audit error:', msg);
    return NextResponse.json(
      { error: 'Failed to fetch audit log', detail: msg },
      { status: 500 }
    );
  }
}
