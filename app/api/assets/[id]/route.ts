import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest, getSessionIdFromRequest, insertAuditLog } from '@/lib/audit';
import { createAssetChangeAnnouncement } from '@/lib/asset-change-announcement';

export const dynamic = 'force-dynamic';

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params?.id;
    if (!id) {
      return NextResponse.json(
        { error: 'Missing id' },
        { status: 400 }
      );
    }
    const rows = await query(
      'SELECT * FROM asset_master WHERE id = $1',
      [id]
    );
    if (!rows?.length) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(rows[0]);
  } catch (err) {
    const msg = getErrorMessage(err);
    console.error('GET /api/assets/[id] error:', msg);
    return NextResponse.json(
      { error: 'Failed to fetch asset', detail: msg },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', detail: 'Valid X-User-Phone and X-User-Name required' },
        { status: 401 }
      );
    }
    const id = params?.id;
    if (!id) {
      return NextResponse.json(
        { error: 'Missing id' },
        { status: 400 }
      );
    }
    const body = await request.json();
    const allowed = [
      'image_s3_key', 'project_location', 'category', 'asset_no', 'description',
      'serial_no', 'make', 'model', 'status', 'responsible_person_name',
      'responsible_person_pno', 'ownership', 'remark',
    ];
    const assetDataKeys = ['id', ...allowed];
    const currentRows = await query<Record<string, unknown>>(
      'SELECT * FROM asset_master WHERE id = $1',
      [id]
    );
    const current = currentRows?.[0];
    if (!current) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      );
    }
    const toPlain = (row: Record<string, unknown>): Record<string, string | null> => {
      const out: Record<string, string | null> = {};
      for (const k of assetDataKeys) {
        const v = row[k];
        out[k] = v == null ? null : String(v);
      }
      return out;
    };
    const setParts: string[] = [];
    const values: (string | null)[] = [];
    let idx = 1;
    const changes: { field: string; from: string | null; to: string | null }[] = [];
    for (const key of allowed) {
      if (!(key in body)) continue;
      const newVal = body[key] === '' ? null : body[key];
      const oldVal = current[key];
      const oldStr = oldVal == null ? null : String(oldVal);
      const newStr = newVal == null ? null : String(newVal);
      if (oldStr !== newStr) {
        changes.push({ field: key, from: oldStr, to: newStr });
      }
      setParts.push(`${key} = $${idx}`);
      values.push(newVal);
      idx++;
    }
    if (setParts.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }
    setParts.push(`updated_at = NOW()`);
    values.push(id);
    const sql = `UPDATE asset_master SET ${setParts.join(', ')} WHERE id = $${idx} RETURNING *`;
    const rows = await query<Record<string, unknown>>(sql, values);
    if (!rows?.length) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      );
    }
    const previous_data = toPlain(current);
    const updated_data = toPlain(rows[0]);
    if (changes.length > 0) {
      await insertAuditLog({
        user_phone: user.phone,
        user_name: user.name,
        action: 'asset_update',
        entity_type: 'asset',
        entity_id: id,
        details: { asset_id: id, previous_data, updated_data, changes },
        session_id: getSessionIdFromRequest(request),
      });
    }
    const statusChange = changes.find((c) => c.field === 'status');
    if (statusChange) {
      await query(
        `INSERT INTO asset_status_history (asset_id, status_from, status_to, changed_by_phone, changed_by_name)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          id,
          statusChange.from ?? null,
          statusChange.to ?? '—',
          user.phone,
          user.name,
        ]
      );
    }

    // Notify only when status column changes (not for other field edits)
    const desc = (updated_data.description || current?.description || 'Unspecified') as string;
    if (statusChange) {
      const fromStr = statusChange.from?.trim() || '—';
      const toStr = statusChange.to?.trim() || '—';
      await createAssetChangeAnnouncement({
        title: 'Asset status changed',
        body: `"${desc}" status changed from ${fromStr} to ${toStr} by ${user.name}.`,
        created_by_phone: user.phone,
        created_by_name: user.name,
      });
    }

    return NextResponse.json(rows[0]);
  } catch (err) {
    const msg = getErrorMessage(err);
    console.error('PATCH /api/assets/[id] error:', msg);
    return NextResponse.json(
      { error: 'Failed to update asset', detail: msg },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', detail: 'Valid X-User-Phone and X-User-Name required' },
        { status: 401 }
      );
    }
    const id = params?.id;
    if (!id) {
      return NextResponse.json(
        { error: 'Missing id' },
        { status: 400 }
      );
    }
    const beforeRows = await query<Record<string, unknown>>(
      'SELECT * FROM asset_master WHERE id = $1',
      [id]
    );
    const before = beforeRows?.[0];
    const rows = await query<Record<string, unknown>>(
      'DELETE FROM asset_master WHERE id = $1 RETURNING *',
      [id]
    );
    if (!rows?.length) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      );
    }
    const assetDataKeys = [
      'id', 'image_s3_key', 'project_location', 'category', 'asset_no', 'description',
      'serial_no', 'make', 'model', 'status', 'responsible_person_name',
      'responsible_person_pno', 'ownership', 'remark',
    ];
    const toPlain = (row: Record<string, unknown>): Record<string, string | null> => {
      const out: Record<string, string | null> = {};
      for (const k of assetDataKeys) {
        const v = row[k];
        out[k] = v == null ? null : String(v);
      }
      return out;
    };
    const deleted_asset = before ? toPlain(before) : toPlain(rows[0]);
    await insertAuditLog({
      user_phone: user.phone,
      user_name: user.name,
      action: 'asset_delete',
      entity_type: 'asset',
      entity_id: id,
      details: { deleted_id: id, deleted_asset },
      session_id: getSessionIdFromRequest(request),
    });
    return NextResponse.json({ success: true, id: rows[0].id });
  } catch (err) {
    const msg = getErrorMessage(err);
    console.error('DELETE /api/assets/[id] error:', msg);
    return NextResponse.json(
      { error: 'Failed to delete asset', detail: msg },
      { status: 500 }
    );
  }
}
