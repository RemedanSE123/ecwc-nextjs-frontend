/**
 * Client-side: track which announcements the user has "seen" for unread badge.
 * Uses sessionStorage so each tab/session shows unread until user visits /announcements.
 */

import { getSession } from '@/lib/auth';

const STORAGE_KEY_PREFIX = 'ecwc_announcements_last_seen_id';

function getStorageKey(): string {
  if (typeof window === 'undefined') return STORAGE_KEY_PREFIX;
  const userKey = getSession()?.user?.id || getSession()?.user?.phone || 'guest';
  return `${STORAGE_KEY_PREFIX}:${userKey}`;
}

export function getLastSeenAnnouncementId(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = sessionStorage.getItem(getStorageKey());
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
  sessionStorage.setItem(getStorageKey(), String(maxId));
  window.dispatchEvent(new CustomEvent('announcements-seen'));
}

/** Count how many of the given announcements are "unread" (id > lastSeenId). */
export function getUnreadCount(announcements: { id: number }[]): number {
  const lastSeen = getLastSeenAnnouncementId();
  return announcements.filter((a) => a.id > lastSeen).length;
}
