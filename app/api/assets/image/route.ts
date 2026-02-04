import { NextRequest, NextResponse } from 'next/server';
import { getPresignedGetUrl } from '@/lib/s3';

export const dynamic = 'force-dynamic';

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    if (!key) {
      return NextResponse.json(
        { error: 'Missing key', detail: 'Query param "key" is required' },
        { status: 400 }
      );
    }
    const url = await getPresignedGetUrl(key);
    return NextResponse.redirect(url);
  } catch (err) {
    const msg = getErrorMessage(err);
    console.error('GET /api/assets/image error:', msg);
    return NextResponse.json(
      { error: 'Failed to get image URL', detail: msg },
      { status: 500 }
    );
  }
}
