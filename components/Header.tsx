'use client';

import { Search, Bell, User, ChevronDown, LogOut, Menu, X, Megaphone, Phone, Mail, ShieldCheck } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { getSession, clearSession, getSessionUpdatedEventName, getAuthHeaders, updateSessionUser } from '@/lib/auth';
import { getUnreadCount, hydrateAnnouncementLastSeen, markAnnouncementsAsSeen } from '@/lib/announcements-seen';
import { AnnouncementBodyWithStatus } from '@/lib/announcement-body';
import { apiUrl } from '@/lib/api-client';
import { getUserImageUrl } from '@/lib/api/auth';
import { getAnnouncementTargetUrl } from '@/lib/announcement-target';
import { startAnnouncementsStream } from '@/lib/announcements-stream';

interface AnnouncementItem {
  id: number;
  title: string;
  body: string;
  created_by_name: string;
  created_at: string;
  entity_type?: string | null;
  entity_id?: string | null;
  action?: string | null;
}

function formatAgo(iso: string): string {
  try {
    const d = new Date(iso);
    const sec = Math.floor((Date.now() - d.getTime()) / 1000);
    if (sec < 60) return 'Just now';
    if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
    if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
    if (sec < 604800) return `${Math.floor(sec / 86400)}d ago`;
    return d.toLocaleDateString();
  } catch {
    return '';
  }
}

interface HeaderProps {
  sidebarCollapsed?: boolean;
  sidebarOpen?: boolean;
  onMenuClick?: () => void;
}

export default function Header({ sidebarCollapsed = false, sidebarOpen = false, onMenuClick }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const [userPhone, setUserPhone] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [userImage, setUserImage] = useState<string | null>(null);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [, setBadgeFeed] = useState<AnnouncementItem[]>([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const syncUser = () => {
      const session = getSession();
      if (session?.user) {
        setUserName(session.user.name);
        setUserPhone(session.user.phone);
        setUserEmail(session.user.email || '');
        setUserImage(getUserImageUrl(session.user.profile_image));
      } else {
        setUserName('');
        setUserPhone('');
        setUserEmail('');
        setUserImage(null);
      }
    };
    syncUser();
    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key === 'ecwc_session') syncUser();
    };
    const eventName = getSessionUpdatedEventName();
    const onSession = () => syncUser();
    window.addEventListener('storage', onStorage);
    window.addEventListener(eventName, onSession);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(eventName, onSession);
    };
  }, []);

  // Fallback: hydrate profile image from /auth/me in case current session was created
  // before profile_image was stored in local session payload.
  useEffect(() => {
    const session = getSession();
    if (!session?.accessToken) return;
    if (userImage) return;

    fetch(apiUrl('/api/v1/auth/me'), { headers: { ...getAuthHeaders() } })
      .then((res) => (res.ok ? res.json() : null))
      .then((profile) => {
        const rawImage = (profile?.profile_image as string | null | undefined) ?? null;
        const normalized = getUserImageUrl(rawImage);
        if (normalized) {
          setUserImage(normalized);
          updateSessionUser({ profile_image: rawImage });
        }
      })
      .catch(() => {
        // Ignore; initials fallback remains.
      });
  }, [userImage]);

  const initials = (userName || 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((x) => x[0]?.toUpperCase() || '')
    .join('') || 'U';

  const profileRole =
    userPhone === '0911000000' || userEmail.toLowerCase() === 'superadmin@ecwc.gov.et'
      ? 'System Super Admin'
      : 'ECWC User';

  const mergeByNewest = (prev: AnnouncementItem[], incoming: AnnouncementItem, limit = 50): AnnouncementItem[] => {
    const merged = [incoming, ...prev.filter((item) => item.id !== incoming.id)];
    return merged.slice(0, limit);
  };

  // Fetch announcements for dropdown when opened
  useEffect(() => {
    if (!notificationsOpen) return;
    const session = getSession();
    if (!session?.accessToken) {
      setAnnouncements([]);
      return;
    }
    setAnnouncementsLoading(true);
    fetch(apiUrl('/api/v1/announcements?limit=30'), { headers: { ...getAuthHeaders() } })
      .then((res) => (res.ok ? res.json() : { data: [] }))
      .then((json) => {
        const data = json.data ?? [];
        setAnnouncements(data);
        if (data.length) markAnnouncementsAsSeen(data.map((a: AnnouncementItem) => a.id));
      })
      .catch(() => setAnnouncements([]))
      .finally(() => setAnnouncementsLoading(false));
  }, [notificationsOpen]);

  // Hydrate last-seen from server, then badge feed + unread count.
  useEffect(() => {
    let cancelled = false;
    const fetchBadge = () => {
      const session = getSession();
      if (!session?.accessToken) {
        setBadgeFeed([]);
        setUnreadCount(0);
        return;
      }
      fetch(apiUrl('/api/v1/announcements?limit=50'), { headers: { ...getAuthHeaders() } })
        .then((res) => (res.ok ? res.json() : { data: [] }))
        .then((json) => {
          if (cancelled) return;
          const data = (json.data ?? []) as AnnouncementItem[];
          setBadgeFeed(data);
          setUnreadCount(getUnreadCount(data));
        })
        .catch(() => {
          if (cancelled) return;
          setBadgeFeed([]);
          setUnreadCount(0);
        });
    };
    const run = async () => {
      await hydrateAnnouncementLastSeen();
      if (cancelled) return;
      fetchBadge();
    };
    const onSeen = () => void run();
    void run();
    const onFocus = () => void run();
    window.addEventListener('focus', onFocus);
    window.addEventListener('announcements-seen', onSeen);
    return () => {
      cancelled = true;
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('announcements-seen', onSeen);
    };
  }, [pathname, userPhone]);

  // Realtime announcement events (manual + asset status changes) via SSE.
  useEffect(() => {
    const session = getSession();
    if (!session?.accessToken) {
      setUnreadCount(0);
      return;
    }
    const stop = startAnnouncementsStream({
      onAnnouncement: (announcement) => {
        setBadgeFeed((prev) => {
          const next = mergeByNewest(prev, announcement, 50);
          setUnreadCount(getUnreadCount(next));
          return next;
        });
        setAnnouncements((prev) => mergeByNewest(prev, announcement, 30));
      },
      onStatusChange: () => {
        // No-op for now; reserved for optional UI connectivity indicator.
      },
    });
    return () => stop();
  }, [userPhone]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) router.push(`/equipment/dashboard?search=${encodeURIComponent(q)}`);
  };

  const handleSignOut = async () => {
    const session = getSession();
    if (session?.user) {
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'X-User-Phone': session.user.phone,
          'X-User-Name': session.user.name,
        };
        if (session.sessionId) headers['X-Session-Id'] = session.sessionId;
        await fetch(apiUrl('/api/v1/audit'), {
          method: 'POST',
          headers,
          body: JSON.stringify({ action: 'logout', details: { reason: 'manual' } }),
        });
      } catch (err) {
        if (typeof console !== 'undefined') console.warn('Audit log (logout) failed:', err);
      }
    }
    clearSession();
    setUserMenuOpen(false);
    router.replace('/sign-in');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header 
      className={`bg-white border-b border-gray-200/80 h-[3.675rem] flex items-center justify-between pl-3 pr-3 lg:pl-4 lg:pr-4 fixed top-0 left-0 right-0 z-30 backdrop-blur-sm transition-all duration-300 font-[var(--font-dm-sans)] ${
        sidebarCollapsed ? 'lg:left-14' : 'lg:left-52'
      }`}
    >
      {/* Left - Menu button (mobile) + ECWC + PEMS subtitle */}
      <div className="flex items-center min-w-0 flex-1 justify-start gap-2">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden shrink-0 p-2 -ml-1 rounded-lg bg-gradient-to-br from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 transition-colors shadow-sm"
            aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        )}
        <div className="flex flex-col min-w-0 max-w-full">
          <span className="text-[10px] sm:text-[13px] font-bold text-gray-900 dark:text-gray-100 leading-tight tracking-tight whitespace-normal">
            Ethiopian Construction Works Corporation
          </span>
          <span className="text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-400 leading-tight">
            Plant Equipment Management System
          </span>
        </div>
      </div>

      {/* Search - visually centered in header, hidden on mobile */}
      <div className="hidden sm:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md px-4 pointer-events-none">
        <form onSubmit={handleSearch} className="pointer-events-auto relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 group-focus-within:text-green-600 transition-colors pointer-events-none z-10" />
          <input
            type="text"
            placeholder="Search equipment, asset no., make, model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-9 py-1.5 text-[11px] border border-gray-200 rounded-full bg-white shadow-sm hover:shadow-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition-all duration-200 text-gray-900 placeholder:text-gray-400"
          />
        </form>
      </div>

      {/* Right Actions - Compact */}
      <div className="flex items-center gap-2 flex-shrink-0 flex-1 justify-end">
        {/* Notifications - Facebook-style red badge with number */}
        <div className="relative inline-flex overflow-visible" ref={notificationsRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full transition-colors overflow-visible"
            aria-label={unreadCount > 0 ? `${unreadCount} unread announcements` : 'Announcements'}
          >
            <Bell className="w-5 h-5 shrink-0" />
            {unreadCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 z-10 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-600 text-white text-[10px] font-bold shadow-md ring-2 ring-white dark:ring-gray-900 animate-pulse"
                title={`${unreadCount} unread announcement${unreadCount !== 1 ? 's' : ''}`}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-80 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-0.5 z-50">
              <div className="px-3 py-2.5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-green-600" />
                <h3 className="text-[12px] font-semibold text-gray-900 dark:text-gray-100">Announcements</h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {announcementsLoading ? (
                  <div className="px-3 py-4 text-center text-[11px] text-gray-500">Loading…</div>
                ) : announcements.length === 0 ? (
                  <div className="px-3 py-4 text-center text-[11px] text-gray-500">No announcements yet.</div>
                ) : (
                  announcements.map((a) => (
                    <Link
                      key={a.id}
                      href={getAnnouncementTargetUrl(a)}
                      onClick={() => setNotificationsOpen(false)}
                      className="block px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-50 dark:border-gray-800 last:border-b-0 transition-colors"
                    >
                      <p className="text-[11px] font-medium text-gray-900 dark:text-gray-100 line-clamp-1">{a.title}</p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                        {a.body ? <AnnouncementBodyWithStatus text={a.body} /> : a.title}
                      </p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{a.created_by_name} · {formatAgo(a.created_at)}</p>
                    </Link>
                  ))
                )}
              </div>
              <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-800">
                <Link
                  href="/announcements"
                  onClick={() => setNotificationsOpen(false)}
                  className="block text-center text-[11px] font-medium text-green-600 dark:text-green-400 hover:underline py-1.5"
                >
                  View all announcements
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Menu - Compact */}
        <div className="relative flex items-center gap-2 pl-2 border-l border-gray-200" ref={userMenuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center text-white font-semibold text-[11px] shadow-sm ring-2 ring-green-100 overflow-hidden">
              {userImage ? (
                <img
                  src={userImage}
                  alt={userName || 'User'}
                  className="w-full h-full rounded-full object-cover object-center"
                  loading="eager"
                  decoding="async"
                  referrerPolicy="no-referrer"
                />
              ) : (
                initials
              )}
            </div>
            <div className="hidden lg:flex flex-col items-start">
              <span className="text-[11px] font-medium text-gray-900 leading-tight">{userName || 'User'}</span>
              <span className="text-[9px] text-gray-500 leading-tight">{userPhone || ''}</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 hidden lg:block transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-72 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50">
              <div className="px-3 py-3 border-b border-gray-100 bg-gradient-to-r from-green-50 to-white rounded-t-xl space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-green-600 to-green-700 text-white text-xs font-bold flex items-center justify-center shadow-sm ring-2 ring-green-100 overflow-hidden shrink-0">
                    {userImage ? (
                      <img
                        src={userImage}
                        alt={userName || 'User'}
                        className="w-full h-full rounded-full object-cover object-center"
                        loading="eager"
                        decoding="async"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      initials
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">{userName || 'User'}</p>
                    <p className="text-[10px] text-green-700 font-medium truncate">{profileRole}</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 rounded-md bg-white/80 border border-gray-100 px-2 py-1.5">
                    <Phone className="w-3.5 h-3.5 text-green-600" />
                    <span className="text-[11px] text-gray-700 truncate">{userPhone || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-md bg-white/80 border border-gray-100 px-2 py-1.5">
                    <Mail className="w-3.5 h-3.5 text-green-600" />
                    <span className="text-[11px] text-gray-700 truncate">{userEmail || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-md bg-white/80 border border-gray-100 px-2 py-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                    <span className="text-[11px] text-gray-700 truncate">{profileRole}</span>
                  </div>
                </div>
              </div>
              <Link
                href="/profile"
                onClick={() => setUserMenuOpen(false)}
                className="w-full px-3 py-2.5 text-left text-[11px] text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors"
              >
                <User className="w-3.5 h-3.5 text-gray-400" />
                <span>My Profile</span>
              </Link>
              <div className="border-t border-gray-100 my-0.5"></div>
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full px-3 py-2 text-left text-[11px] text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
