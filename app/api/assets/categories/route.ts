import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

export async function GET() {
  try {
    const rows = await query<{ category: string }>(
      'SELECT DISTINCT category FROM asset_master ORDER BY category'
    );
    return NextResponse.json({ categories: rows.map((r) => r.category) });
  } catch (err) {
    const msg = getErrorMessage(err);
    console.error('GET /api/assets/categories error:', msg);
    return NextResponse.json(
      { error: 'Failed to fetch categories', detail: msg },
      { status: 500 }
    );
  }
}
