import { query } from '@/lib/db';

export interface CreateAssetChangeAnnouncementParams {
  title: string;
  body: string;
  created_by_phone: string;
  created_by_name: string;
}

/**
 * Inserts an asset-change announcement into the announcements table.
 * Non-blocking: logs and continues if insert fails (announcement is non-critical).
 */
export async function createAssetChangeAnnouncement(params: CreateAssetChangeAnnouncementParams): Promise<void> {
  try {
    await query(
      `INSERT INTO announcements (title, body, created_by_phone, created_by_name)
       VALUES ($1, $2, $3, $4)`,
      [params.title, params.body, params.created_by_phone, params.created_by_name]
    );
  } catch (err) {
    console.error('[asset-change-announcement] Failed to insert announcement:', err);
    // Non-critical: do not throw; main response continues
  }
}
