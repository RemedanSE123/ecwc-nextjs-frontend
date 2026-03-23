import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest, getSessionIdFromRequest, insertAuditLog } from '@/lib/audit';

export const dynamic = 'force-dynamic';

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

export async function GET(request: NextRequest) {
  try {
    const status = new URL(request.url).searchParams.get('status')?.trim().toLowerCase();
    const validStatus = status && ['active', 'inactive', 'closed'].includes(status) ? status : null;
    const rows = await query<Record<string, unknown>>(
      `SELECT id, project_name, status, manager_name, manager_phone, start_date, end_date, remark, created_at
       FROM projects
       ${validStatus ? 'WHERE status = $1' : ''}
       ORDER BY project_name ASC`,
      validStatus ? [validStatus] : []
    );
    return NextResponse.json(rows ?? []);
  } catch (err) {
    const msg = getErrorMessage(err);
    console.error('GET /api/projects error:', msg);
    return NextResponse.json({ error: 'Failed to fetch projects', detail: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await request.json();
    const project_name = String(body.project_name ?? '').trim();
    const status = String(body.status ?? 'active').trim().toLowerCase();
    if (!project_name) {
      return NextResponse.json({ error: 'Validation error', detail: 'project_name is required' }, { status: 400 });
    }
    if (!['active', 'inactive', 'closed'].includes(status)) {
      return NextResponse.json({ error: 'Validation error', detail: 'status must be active, inactive, or closed' }, { status: 400 });
    }
    const rows = await query(
      `INSERT INTO projects (project_name, status, manager_name, manager_phone, start_date, end_date, remark)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT ((LOWER(TRIM(project_name))))
       DO UPDATE SET
         status = EXCLUDED.status,
         manager_name = EXCLUDED.manager_name,
         manager_phone = EXCLUDED.manager_phone,
         start_date = EXCLUDED.start_date,
         end_date = EXCLUDED.end_date,
         remark = EXCLUDED.remark
       RETURNING *`,
      [
        project_name,
        status,
        body.manager_name ?? null,
        body.manager_phone ?? null,
        body.start_date ?? null,
        body.end_date ?? null,
        body.remark ?? null,
      ]
    );
    const saved = rows?.[0] as Record<string, unknown> | undefined;
    await insertAuditLog({
      user_phone: user.phone,
      user_name: user.name,
      action: 'project_upsert',
      entity_type: 'project',
      entity_id: saved?.id != null ? String(saved.id) : null,
      details: { project_name, status },
      session_id: getSessionIdFromRequest(request),
    });
    return NextResponse.json(saved ?? null, { status: 201 });
  } catch (err) {
    const msg = getErrorMessage(err);
    console.error('POST /api/projects error:', msg);
    return NextResponse.json({ error: 'Failed to save project', detail: msg }, { status: 500 });
  }
}
