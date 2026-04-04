import { apiUrl } from '@/lib/api-client';
import { getSession } from '@/lib/auth';

export interface StreamAnnouncement {
  id: number;
  title: string;
  body: string;
  created_by_phone?: string;
  created_by_name: string;
  created_at: string;
  entity_type?: string | null;
  entity_id?: string | null;
  action?: string | null;
}

export interface AnnouncementStreamOptions {
  onAnnouncement: (announcement: StreamAnnouncement) => void;
  onStatusChange?: (connected: boolean) => void;
}

export function startAnnouncementsStream(options: AnnouncementStreamOptions): () => void {
  if (typeof window === 'undefined') return () => {};
  let source: EventSource | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let stopped = false;
  let attempt = 0;

  const connect = () => {
    const token = getSession()?.accessToken;
    if (!token || stopped) return;
    const url = apiUrl(`/api/v1/announcements/stream?access_token=${encodeURIComponent(token)}`);
    source = new EventSource(url);

    source.addEventListener('ready', () => {
      attempt = 0;
      options.onStatusChange?.(true);
    });

    source.addEventListener('announcement', (event) => {
      try {
        const payload = JSON.parse((event as MessageEvent).data) as StreamAnnouncement;
        if (!payload?.id) return;
        options.onAnnouncement(payload);
      } catch {
        // Ignore malformed stream payload.
      }
    });

    source.onerror = () => {
      options.onStatusChange?.(false);
      source?.close();
      source = null;
      if (stopped) return;
      attempt += 1;
      const delay = Math.min(30000, 1000 * 2 ** Math.min(attempt, 5));
      reconnectTimer = setTimeout(() => connect(), delay);
    };
  };

  connect();

  return () => {
    stopped = true;
    options.onStatusChange?.(false);
    if (reconnectTimer) clearTimeout(reconnectTimer);
    if (source) source.close();
  };
}

