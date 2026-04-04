import { apiUrl } from '@/lib/api-client';

const SESSION_KEY = 'ecwc_session';
const SESSION_EVENT = 'ecwc-session-updated';
const INACTIVITY_MS = 12 * 60 * 60 * 1000; // 12 hours
const ACCESS_TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000; // Refresh 5 minutes before expiry

export interface AuthUser {
  id?: string;
  phone: string;
  name: string;
  email?: string;
  profile_image?: string | null;
  roles?: string[];
  permissions?: string[];
}

export interface SessionData {
  user: AuthUser;
  lastActivity: number;
  accessToken?: string;
  refreshToken?: string;
  /** Unique per login (e.g. phone vs laptop); used in audit to group one session. */
  sessionId?: string;
}

export function getSession(): SessionData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as SessionData;
    if (!data?.user?.phone || !data?.user?.name || typeof data.lastActivity !== 'number') return null;
    return data;
  } catch {
    return null;
  }
}

export function isSessionExpired(session: SessionData): boolean {
  return Date.now() - session.lastActivity > INACTIVITY_MS;
}

function generateSessionId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function setSession(user: AuthUser): void {
  if (typeof window === 'undefined') return;
  const data: SessionData = {
    user,
    lastActivity: Date.now(),
    sessionId: generateSessionId(),
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(data));
  window.dispatchEvent(new CustomEvent(SESSION_EVENT));
}

export function setSessionWithTokens(user: AuthUser, accessToken: string, refreshToken?: string): void {
  if (typeof window === 'undefined') return;
  const data: SessionData = {
    user,
    accessToken,
    refreshToken,
    lastActivity: Date.now(),
    sessionId: generateSessionId(),
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(data));
  window.dispatchEvent(new CustomEvent(SESSION_EVENT));
}

export function touchSession(): void {
  const session = getSession();
  if (!session) return;
  session.lastActivity = Date.now();
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  window.dispatchEvent(new CustomEvent(SESSION_EVENT));
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new CustomEvent(SESSION_EVENT));
}

export function updateSessionUser(userPatch: Partial<AuthUser>): void {
  if (typeof window === 'undefined') return;
  const session = getSession();
  if (!session) return;
  session.user = { ...session.user, ...userPatch };
  session.lastActivity = Date.now();
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  window.dispatchEvent(new CustomEvent(SESSION_EVENT));
}

export function getSessionUpdatedEventName(): string {
  return SESSION_EVENT;
}

export function getInactivityMs(): number {
  return INACTIVITY_MS;
}

function matchesPermission(requested: string, granted: string): boolean {
  if (granted === '*' || granted === '*:*') return true;
  if (requested === granted) return true;
  if (granted.endsWith(':*')) return requested.startsWith(granted.slice(0, -1));
  return false;
}

export function can(permission: string): boolean {
  const permissions = getSession()?.user?.permissions ?? [];
  return permissions.some((p) => matchesPermission(permission, p));
}

export function canSendAnnouncement(): boolean {
  return can('announcement:create');
}

export function canEditRates(): boolean {
  return can('asset:rates:update');
}

/** Returns headers to send with mutating API requests so server can attribute audit. Client-only. */
export function getAuthHeaders(): Record<string, string> {
  const session = getSession();
  if (!session?.user?.phone || !session?.user?.name) return {};
  const headers: Record<string, string> = {
    'X-User-Phone': session.user.phone,
    'X-User-Name': session.user.name,
  };
  if (session.accessToken) headers['Authorization'] = `Bearer ${session.accessToken}`;
  if (session.sessionId) headers['X-Session-Id'] = session.sessionId;
  return headers;
}

function decodeJwtExpMs(token: string | undefined): number | null {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64Url + '='.repeat((4 - (base64Url.length % 4)) % 4);
    if (typeof atob !== 'function') return null;
    const json = atob(padded);
    const payload = JSON.parse(json) as { exp?: number };
    if (typeof payload.exp !== 'number') return null;
    return payload.exp * 1000;
  } catch {
    return null;
  }
}

export function isAccessTokenExpiringSoon(session: SessionData, bufferMs = ACCESS_TOKEN_REFRESH_BUFFER_MS): boolean {
  const expMs = decodeJwtExpMs(session.accessToken);
  if (!expMs) return false;
  return expMs - Date.now() <= bufferMs;
}

let refreshInFlight: Promise<boolean> | null = null;

export async function refreshAccessTokenIfNeeded(force = false): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  const session = getSession();
  if (!session?.refreshToken) return false;
  if (!force && !isAccessTokenExpiringSoon(session)) return true;
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    try {
      const res = await fetch(apiUrl('/api/v1/auth/refresh'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: session.refreshToken }),
      });
      if (!res.ok) return false;
      const body = (await res.json().catch(() => ({}))) as { access_token?: string };
      if (!body.access_token) return false;
      const latest = getSession();
      if (!latest) return false;
      const next: SessionData = {
        ...latest,
        accessToken: body.access_token,
        // Keep refresh token from latest session (or previous one if missing)
        refreshToken: latest.refreshToken ?? session.refreshToken,
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent(SESSION_EVENT));
      return true;
    } catch {
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}
