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

/** Whitelisted accounts — edit phone, password, and name as needed. Passwords are 6-digit. */
export const AUTH_ACCOUNTS: { phone: string; password: string; name: string }[] = [
  { phone: '0929517703', password: '482917', name: 'Remedan Hyeredin' },
  { phone: '0983007020', password: '639284', name: 'Robel Argaw' },
  { phone: '0912293712', password: '291746', name: 'Yonas Eshetu' },
  { phone: '0927763207', password: '815203', name: 'Biruh T/Michael ' },
  { phone: '0921133084', password: '564839', name: 'Tilaye Teshome' },
  { phone: '0980194463', password: '193058', name: 'Hagos Alemseged' },
  { phone: '0920795215', password: '521407', name: 'Abdulaziz Yimer' },
  { phone: '0923953835', password: '353592', name: 'Nahom Aregay' },
  { phone: '0943190139', password: '013914', name: 'Biruk Berihun' },
  { phone: '0922789648', password: '964827', name: 'Mohammed Erpo' },
  { phone: '0924700786', password: '786407', name: 'Kassahun Shukera' },
  { phone: '0915980000', password: '598000', name: 'Getu Mekonnen' },
  { phone: '0911909654', password: '190965', name: 'Tariku Mamo' },
  { phone: '0912233648', password: '233648', name: 'Tokuma Tolcha' },
];

/** Phones to notify when asset status changes or asset is edited (in-app announcements) */
export const ASSET_CHANGE_NOTIFICATION_PHONES = ['0929517703', '0983007020', '0912293712'];

/** Full sidebar access (all nav items) */
export const FULL_ACCESS_PHONES = ['0929517703', '0983007020'];
/** All except Overview, Machinery Maintenance, Equipment Admin, Common Data, Time Sheet */
export const NO_OVERVIEW_PHONES = ['0912293712'];
/** Nav hrefs hidden for NO_OVERVIEW_PHONES (Overview + Machinery Maintenance, Equipment Admin, Common Data, Time Sheet) */
export const NO_OVERVIEW_HIDDEN_HREFS = [
  '/dashboard',
  '/machinery-maintenance',
  '/equipment-administration',
  '/common-data',
  '/forms',
];
/** Only ECWC Assets (expanded) + Compound Map */
export const ASSETS_AND_MAP_PHONES = [
  '0927763207', '0921133084', '0980194463',
  '0920795215', '0923953835', '0943190139', '0922789648', '0924700786',
  '0915980000', '0911909654', '0912233648',
];

/** Can only view announcements, not create/send */
export const ANNOUNCEMENT_VIEW_ONLY_PHONES = [
  '0927763207', '0921133084', '0980194463',
  '0920795215', '0923953835', '0943190139', '0922789648', '0924700786',
  '0915980000', '0911909654', '0912233648',
];

export function canSendAnnouncement(phone: string): boolean {
  const normalized = phone.replace(/\s/g, '');
  return !ANNOUNCEMENT_VIEW_ONLY_PHONES.includes(normalized);
}

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

/** Phones allowed to edit rate_op / rate_idle / rate_down on assets */
export const RATE_EDIT_PHONES: string[] = ['0929517703', '0983007020', '0912293712'];

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
