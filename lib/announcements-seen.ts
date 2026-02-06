/**
 * Client-side: track which announcements the user has "seen" for unread badge.
 * Uses highest seen announcement id in localStorage.
 */

const STORAGE_KEY = 'ecwc_announcements_last_seen_id';

export function getLastSeenAnnouncementId(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return 0;
    const n = parseInt(raw, 10);
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

/** Update last-seen to at least the given id (or max of ids). */
export function markAnnouncementsAsSeen(ids: number[]): void {
  if (typeof window === 'undefined' || !ids.length) return;
  const current = getLastSeenAnnouncementId();
  const maxId = Math.max(current, ...ids);
  localStorage.setItem(STORAGE_KEY, String(maxId));
}

/** Count how many of the given announcements are "unread" (id > lastSeenId). */
export function getUnreadCount(announcements: { id: number }[]): number {
  const lastSeen = getLastSeenAnnouncementId();
  return announcements.filter((a) => a.id > lastSeen).length;
}
