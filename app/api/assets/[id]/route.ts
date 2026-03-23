import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest, getSessionIdFromRequest, insertAuditLog } from '@/lib/audit';
import { createAssetChangeAnnouncement } from '@/lib/asset-change-announcement';

export const dynamic = 'force-dynamic';

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

async function getOrCreateProjectId(projectLocation: string | null | undefined): Promise<string | null> {
  const normalized = (projectLocation ?? '').trim();
  if (!normalized) return null;
  const existing = await query<{ id: string }>(
    'SELECT id FROM projects WHERE LOWER(TRIM(project_name)) = LOWER(TRIM($1)) LIMIT 1',
    [normalized]
  );
  if (existing?.[0]?.id) return existing[0].id;
  const created = await query<{ id: string }>(
    `INSERT INTO projects (project_name, status)
     VALUES ($1, 'active')
     ON CONFLICT ((LOWER(TRIM(project_name))))
     DO UPDATE SET project_name = EXCLUDED.project_name
     RETURNING id`,
    [normalized]
  );
  return created?.[0]?.id ?? null;
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
      `SELECT am.*, p.project_name AS project_name
       FROM asset_master am
       LEFT JOIN projects p ON am.project_id = p.id
       WHERE am.id = $1`,
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
      'image_s3_key', 'project_name', 'category', 'asset_no', 'description',
      'serial_no', 'make', 'model', 'status', 'responsible_person_name',
      'responsible_person_pno', 'ownership', 'remark',
    ];
    const assetDataKeys = ['id', ...allowed];
    const currentRows = await query<Record<string, unknown>>(
      `SELECT am.*, p.project_name AS project_name
       FROM asset_master am
       LEFT JOIN projects p ON am.project_id = p.id
       WHERE am.id = $1`,
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
    // Determine prospective asset_no / serial_no (new value if provided, otherwise current)
    const nextAssetNoRaw =
      'asset_no' in body ? (body.asset_no ?? '') : (current.asset_no ?? '');
    const nextSerialNoRaw =
      'serial_no' in body ? (body.serial_no ?? '') : (current.serial_no ?? '');
    const nextAssetNo = typeof nextAssetNoRaw === 'string' ? nextAssetNoRaw.trim() : String(nextAssetNoRaw ?? '').trim();
    const nextSerialNo = typeof nextSerialNoRaw === 'string' ? nextSerialNoRaw.trim() : String(nextSerialNoRaw ?? '').trim();

    if (nextAssetNo) {
      const dup = await query<{ id: string }>(
        `SELECT id FROM asset_master WHERE LOWER(TRIM(asset_no)) = LOWER(TRIM($1)) AND id <> $2 LIMIT 1`,
        [nextAssetNo, id]
      );
      if (dup && dup.length > 0) {
        return NextResponse.json(
          { error: 'Validation error', detail: 'An asset with this Asset No already exists. Asset No must be unique.' },
          { status: 400 }
        );
      }
    }
    if (nextSerialNo) {
      const dup = await query<{ id: string }>(
        `SELECT id FROM asset_master WHERE LOWER(TRIM(serial_no)) = LOWER(TRIM($1)) AND id <> $2 LIMIT 1`,
        [nextSerialNo, id]
      );
      if (dup && dup.length > 0) {
        return NextResponse.json(
          { error: 'Validation error', detail: 'An asset with this Serial No already exists. Serial No must be unique.' },
          { status: 400 }
        );
      }
    }

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
      if (key === 'project_name') {
        const projectId = await getOrCreateProjectId(newStr);
        setParts.push(`project_id = $${idx}`);
        values.push(projectId);
      } else {
        setParts.push(`${key} = $${idx}`);
        values.push(newVal);
      }
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
    const updatedRows = await query<Record<string, unknown>>(sql, values);
    const updatedId = updatedRows?.[0]?.id as string | undefined;
    const rows = updatedId
      ? await query<Record<string, unknown>>(
          `SELECT am.*, p.project_name AS project_name
           FROM asset_master am
           LEFT JOIN projects p ON am.project_id = p.id
           WHERE am.id = $1`,
          [updatedId]
        )
      : [];
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
      `SELECT am.*, p.project_name AS project_name
       FROM asset_master am
       LEFT JOIN projects p ON am.project_id = p.id
       WHERE am.id = $1`,
      [id]
    );
    const before = beforeRows?.[0];
    // Delete from detail tables first to avoid FK violations (works even if DB has no ON DELETE CASCADE)
    const detailTables = [
      'light_vehicle_details',
      'heavy_vehicle_details',
      'machinery_details',
      'plant_details',
      'aux_generator_rates',
      'asset_status_history',
    ];
    for (const table of detailTables) {
      await query(`DELETE FROM ${table} WHERE asset_id = $1`, [id]);
    }
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
      'id', 'image_s3_key', 'project_name', 'category', 'asset_no', 'description',
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
