import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

export interface AssetStatusHistoryEntry {
  id: string;
  asset_id: string;
  status_from: string | null;
  status_to: string;
  changed_by_phone: string;
  changed_by_name: string;
  created_at: string;
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
    const rows = await query<AssetStatusHistoryEntry>(
      `SELECT id, asset_id, status_from, status_to, changed_by_phone, changed_by_name, created_at
       FROM asset_status_history
       WHERE asset_id = $1
       ORDER BY created_at DESC`,
      [id]
    );
    return NextResponse.json(rows ?? []);
  } catch (err) {
    const msg = getErrorMessage(err);
    console.error('GET /api/assets/[id]/status-history error:', msg);
    return NextResponse.json(
      { error: 'Failed to fetch status history', detail: msg },
      { status: 500 }
    );
  }
}
