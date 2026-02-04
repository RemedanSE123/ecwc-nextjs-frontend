import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

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
    const setParts: string[] = [];
    const values: (string | null)[] = [];
    let idx = 1;
    for (const key of allowed) {
      if (!(key in body)) continue;
      setParts.push(`${key} = $${idx}`);
      values.push(body[key] === '' ? null : body[key]);
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
    const rows = await query(sql, values);
    if (!rows?.length) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      );
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
    const rows = await query<{ id: string | number }>(
      'DELETE FROM asset_master WHERE id = $1 RETURNING id',
      [id]
    );
    if (!rows?.length) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      );
    }
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
