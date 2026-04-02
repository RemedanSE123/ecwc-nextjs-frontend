const SESSION_KEY = 'ecwc_session';
const SESSION_EVENT = 'ecwc-session-updated';
const INACTIVITY_MS = 12 * 60 * 60 * 1000; // 12 hours

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
