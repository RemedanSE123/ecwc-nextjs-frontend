import { NextRequest, NextResponse } from 'next/server';
import { uploadToS3, getBucket } from '@/lib/s3';

export const dynamic = 'force-dynamic';

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

export async function POST(request: NextRequest) {
  try {
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
    const ext = file.name.split('.').pop() || 'bin';
    const key = `assets/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await uploadToS3(key, buffer, file.type);
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
