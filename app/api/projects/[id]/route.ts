import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest, getSessionIdFromRequest, insertAuditLog } from '@/lib/audit';

export const dynamic = 'force-dynamic';

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const id = params?.id;
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const body = await request.json();
    const setParts: string[] = [];
    const values: unknown[] = [];
    let idx = 1;
    const fields = ['project_name', 'status', 'manager_name', 'manager_phone', 'start_date', 'end_date', 'remark'] as const;
    for (const field of fields) {
      if (!(field in body)) continue;
      setParts.push(`${field} = $${idx}`);
      values.push(body[field] ?? null);
      idx++;
    }
    if (setParts.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }
    values.push(id);

    const rows = await query<Record<string, unknown>>(
      `UPDATE projects SET ${setParts.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    if (!rows?.length) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    await insertAuditLog({
      user_phone: user.phone,
      user_name: user.name,
      action: 'project_update',
      entity_type: 'project',
      entity_id: id,
      details: { updated_fields: Object.keys(body) },
      session_id: getSessionIdFromRequest(request),
    });
    return NextResponse.json(rows[0]);
  } catch (err) {
    const msg = getErrorMessage(err);
    console.error('PATCH /api/projects/[id] error:', msg);
    return NextResponse.json({ error: 'Failed to update project', detail: msg }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const id = params?.id;
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const usage = await query<{ count: number }>('SELECT COUNT(*)::int AS count FROM asset_master WHERE project_id = $1', [id]);
    if ((usage?.[0]?.count ?? 0) > 0) {
      return NextResponse.json({ error: 'Cannot delete project with linked assets' }, { status: 409 });
    }
    const rows = await query<Record<string, unknown>>('DELETE FROM projects WHERE id = $1 RETURNING id, project_name', [id]);
    if (!rows?.length) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    await insertAuditLog({
      user_phone: user.phone,
      user_name: user.name,
      action: 'project_delete',
      entity_type: 'project',
      entity_id: id,
      details: rows[0],
      session_id: getSessionIdFromRequest(request),
    });
    return NextResponse.json({ success: true, id });
  } catch (err) {
    const msg = getErrorMessage(err);
    console.error('DELETE /api/projects/[id] error:', msg);
    return NextResponse.json({ error: 'Failed to delete project', detail: msg }, { status: 500 });
  }
}
