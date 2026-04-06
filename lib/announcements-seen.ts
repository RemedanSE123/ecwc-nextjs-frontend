/**
 * Tracks which announcements the user has acknowledged for the unread badge.
 * Primary: server (survives logout/login). Fallback: sessionStorage for legacy/no-JWT sessions.
 */

import { getSession, getAuthHeaders } from '@/lib/auth';
import { apiUrl } from '@/lib/api-client';

const STORAGE_KEY_PREFIX = 'ecwc_announcements_last_seen_id';

/** In-memory cursor after hydrate (sync reads for getUnreadCount). */
let memoryLastSeen = 0;

function getStorageKey(): string {
  if (typeof window === 'undefined') return STORAGE_KEY_PREFIX;
  const userKey = getSession()?.user?.id || getSession()?.user?.phone || 'guest';
  return `${STORAGE_KEY_PREFIX}:${userKey}`;
}

function readStorage(): number {
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

function writeStorage(n: number): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(getStorageKey(), String(n));
  } catch {
    /* ignore quota */
  }
}

/** Load last-seen from API and merge with local storage (max). Call when session is ready. */
export async function hydrateAnnouncementLastSeen(): Promise<void> {
  if (typeof window === 'undefined') return;
  const session = getSession();
  if (!session?.accessToken) {
    memoryLastSeen = 0;
    return;
  }
  const local = readStorage();
  try {
    const res = await fetch(apiUrl('/api/v1/announcements/me/last-seen'), {
      headers: { ...getAuthHeaders() },
    });
    if (!res.ok) {
      memoryLastSeen = Math.max(memoryLastSeen, local);
      return;
    }
    const j = (await res.json()) as { last_seen_id?: number };
    const server = typeof j.last_seen_id === 'number' && Number.isFinite(j.last_seen_id) ? j.last_seen_id : 0;
    memoryLastSeen = Math.max(server, local, memoryLastSeen);
    writeStorage(memoryLastSeen);
  } catch {
    memoryLastSeen = Math.max(memoryLastSeen, local);
  }
}

export function getLastSeenAnnouncementId(): number {
  if (typeof window === 'undefined') return 0;
  if (!getSession()?.accessToken) return 0;
  return Math.max(memoryLastSeen, readStorage());
}

/** Update last-seen to at least the max of the given ids; persists to server when possible. */
export function markAnnouncementsAsSeen(ids: number[]): void {
  if (typeof window === 'undefined' || !ids.length) return;
  const session = getSession();
  if (!session?.accessToken) return;

  const current = getLastSeenAnnouncementId();
  const maxId = Math.max(current, ...ids);
  memoryLastSeen = maxId;
  writeStorage(maxId);
  window.dispatchEvent(new CustomEvent('announcements-seen'));

  void (async () => {
    try {
      const res = await fetch(apiUrl('/api/v1/announcements/me/last-seen'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ last_seen_id: maxId }),
      });
      if (res.ok) {
        const j = (await res.json()) as { last_seen_id?: number };
        const confirmed =
          typeof j.last_seen_id === 'number' && Number.isFinite(j.last_seen_id) ? j.last_seen_id : maxId;
        memoryLastSeen = confirmed;
        writeStorage(confirmed);
        window.dispatchEvent(new CustomEvent('announcements-seen'));
      }
    } catch {
      /* offline: local storage still updated */
    }
  })();
}

export function getUnreadCount(announcements: { id: number }[]): number {
  const lastSeen = getLastSeenAnnouncementId();
  return announcements.filter((a) => a.id > lastSeen).length;
}
