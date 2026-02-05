/**
 * Client-side auth: 6 whitelisted accounts (phone + 6-digit password + name).
 * Session stored in localStorage; 12h inactivity auto sign-out.
 */

const SESSION_KEY = 'ecwc_session';
const INACTIVITY_MS = 12 * 60 * 60 * 1000; // 12 hours

export interface AuthUser {
  phone: string;
  name: string;
}

export interface SessionData {
  user: AuthUser;
  lastActivity: number;
  /** Unique per login (e.g. phone vs laptop); used in audit to group one session. */
  sessionId?: string;
}

/** 6 whitelisted accounts — edit phone, password, and name as needed. Passwords are 6-digit. */
export const AUTH_ACCOUNTS: { phone: string; password: string; name: string }[] = [
  { phone: '0929517703', password: '482917', name: 'Remedan Hyeredin' },
  { phone: '0983007020', password: '639284', name: 'Robel Argaw' },
  { phone: '0912293712', password: '291746', name: 'Yonas Eshetu' },
  { phone: '0927763207', password: '815203', name: 'Biruh T/Michael ' },
  { phone: '0921133084', password: '564839', name: 'Tilaye Teshome' },
  { phone: '0980194463', password: '193058', name: 'Hagos Alemseged' },
];

/** Full sidebar access (all nav items) */
export const FULL_ACCESS_PHONES = ['0929517703', '0983007020'];
/** All except Overview */
export const NO_OVERVIEW_PHONES = ['0912293712'];
/** Only ECWC Assets (expanded) + Compound Map */
export const ASSETS_AND_MAP_PHONES = ['0927763207', '0921133084', '0980194463'];

export function validateUser(phone: string, password: string): AuthUser | null {
  const normalizedPhone = phone.replace(/\s/g, '');
  const account = AUTH_ACCOUNTS.find(
    (a) => a.phone.replace(/\s/g, '') === normalizedPhone && a.password === password
  );
  if (!account) return null;
  return { phone: account.phone, name: account.name };
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
}

export function touchSession(): void {
  const session = getSession();
  if (!session) return;
  session.lastActivity = Date.now();
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEY);
}

export function getInactivityMs(): number {
  return INACTIVITY_MS;
}

/** Returns headers to send with mutating API requests so server can attribute audit. Client-only. */
export function getAuthHeaders(): Record<string, string> {
  const session = getSession();
  if (!session?.user?.phone || !session?.user?.name) return {};
  const headers: Record<string, string> = {
    'X-User-Phone': session.user.phone,
    'X-User-Name': session.user.name,
  };
  if (session.sessionId) headers['X-Session-Id'] = session.sessionId;
  return headers;
}
