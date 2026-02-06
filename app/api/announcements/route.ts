import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/audit';
import { canSendAnnouncement } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

export interface AnnouncementRow {
  id: number;
  title: string;
  body: string;
  created_by_phone: string;
  created_by_name: string;
  created_at: string;
}

/** GET: list announcements, newest first. Params: page, limit. */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const offset = (page - 1) * limit;

    const countRes = await query<{ total: number }>('SELECT COUNT(*)::int AS total FROM announcements');
    const total = countRes?.[0]?.total ?? 0;

    const data = await query<AnnouncementRow>(
      `SELECT id, title, body, created_by_phone, created_by_name, created_at
       FROM announcements
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return NextResponse.json({
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    const msg = getErrorMessage(err);
    console.error('GET /api/announcements error:', msg);
    return NextResponse.json(
      { error: 'Failed to fetch announcements', detail: msg },
      { status: 500 }
    );
  }
}

/** POST: create announcement. Body: { title, body }. Requires auth headers. */
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', detail: 'Valid X-User-Phone and X-User-Name required' },
        { status: 401 }
      );
    }
    if (!canSendAnnouncement(user.phone)) {
      return NextResponse.json(
        { error: 'Forbidden', detail: 'You can only view announcements, not create them.' },
        { status: 403 }
      );
    }
    const body = await request.json();
    const title = (body.title ?? '').toString().trim();
    const messageBody = (body.body ?? body.message ?? '').toString().trim();
    if (!title) {
      return NextResponse.json(
        { error: 'Validation error', detail: 'title is required' },
        { status: 400 }
      );
    }
    const rows = await query<AnnouncementRow>(
      `INSERT INTO announcements (title, body, created_by_phone, created_by_name)
       VALUES ($1, $2, $3, $4)
       RETURNING id, title, body, created_by_phone, created_by_name, created_at`,
      [title, messageBody || title, user.phone, user.name]
    );
    if (!rows?.length) {
      return NextResponse.json({ error: 'Insert failed' }, { status: 500 });
    }
    return NextResponse.json(rows[0], { status: 201 });
  } catch (err) {
    const msg = getErrorMessage(err);
    console.error('POST /api/announcements error:', msg);
    return NextResponse.json(
      { error: 'Failed to create announcement', detail: msg },
      { status: 500 }
    );
  }
}
