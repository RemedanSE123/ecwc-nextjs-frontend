import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { uploadToS3, getBucket } from '@/lib/s3';
import { getUserFromRequest, getSessionIdFromRequest, insertAuditLog } from '@/lib/audit';

export const dynamic = 'force-dynamic';

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

const ASSET_DATA_KEYS = [
  'id', 'image_s3_key', 'project_location', 'category', 'asset_no', 'description',
  'serial_no', 'make', 'model', 'status', 'responsible_person_name',
  'responsible_person_pno', 'ownership', 'remark',
] as const;

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

function toPlainObject(row: Record<string, unknown>): Record<string, string | null> {
  const out: Record<string, string | null> = {};
  for (const k of ASSET_DATA_KEYS) {
    const v = row[k];
    out[k] = v == null ? null : String(v);
  }
  return out;
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', detail: 'Valid X-User-Phone and X-User-Name required' },
        { status: 401 }
      );
    }
    if (!getBucket()) {
      return NextResponse.json(
        { error: 'S3 bucket not configured', detail: 'AWS_S3_BUCKET is missing' },
        { status: 500 }
      );
    }
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'Missing file', detail: 'Send a file in the "file" field' },
        { status: 400 }
      );
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File too large', detail: 'Max size is 5MB' },
        { status: 400 }
      );
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid type', detail: 'Allowed: JPEG, PNG, GIF, WebP' },
        { status: 400 }
      );
    }
    const assetId = formData.get('asset_id')?.toString()?.trim() || null;
    let entityId: string | null = null;
    let asset_snapshot: Record<string, string | null> | null = null;
    if (assetId) {
      const rows = await query<Record<string, unknown>>('SELECT * FROM asset_master WHERE id = $1', [assetId]);
      const asset = rows?.[0];
      if (asset) {
        entityId = assetId;
        asset_snapshot = toPlainObject(asset);
      }
    }
    const ext = file.name.split('.').pop() || 'bin';
    const key = `assets/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await uploadToS3(key, buffer, file.type);
    await insertAuditLog({
      user_phone: user.phone,
      user_name: user.name,
      action: 'asset_upload',
      entity_type: 'asset',
      entity_id: entityId,
      details: { key, filename: file.name, ...(asset_snapshot && { asset_snapshot }) },
      session_id: getSessionIdFromRequest(request),
    });
    return NextResponse.json({ key });
  } catch (err) {
    const msg = getErrorMessage(err);
    console.error('POST /api/assets/upload error:', msg);
    return NextResponse.json(
      { error: 'Upload failed', detail: msg },
      { status: 500 }
    );
  }
}
