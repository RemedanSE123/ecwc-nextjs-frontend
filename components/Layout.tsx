'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import ProfilePopup from '@/components/ProfilePopup';
import { Loader2 } from 'lucide-react';
import { can, getSession, isSessionExpired, clearSession, touchSession, refreshAccessTokenIfNeeded } from '@/lib/auth';
import { SidebarContext } from '@/lib/sidebar-context';
import { apiUrl } from '@/lib/api-client';

export default function Layout({ children }: { children: React.ReactNode }) {
  const canAccessRoute = useCallback((route: string) => {
    if (route.startsWith('/equipment/dashboard')) return can('page:view:equipment_dashboard');
    if (route.startsWith('/equipment')) return can('page:view:assets');
    if (route.startsWith('/machinery-operations')) return can('page:view:assets');
    if (route.startsWith('/common-data')) return can('page:view:master_data');
    if (route.startsWith('/compound-map')) return can('page:view:assets');
    if (route.startsWith('/announcements')) return can('page:view:announcements');
    if (route.startsWith('/audit')) return can('page:view:audit');
    if (route.startsWith('/admin/master-data')) return can('page:view:master_data');
    if (route.startsWith('/admin/access-control')) return can('authz:manage');
    if (route.startsWith('/admin/employees')) return can('page:view:employee_access');
    if (route.startsWith('/profile')) return can('page:view:profile');
    return true;
  }, []);

  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [showAccessDeniedPopup, setShowAccessDeniedPopup] = useState(false);

  const getDefaultAuthorizedRoute = useCallback((): string | null => {
    const candidates: Array<{ route: string; permission: string }> = [
      { route: '/equipment/dashboard', permission: 'page:view:equipment_dashboard' },
      { route: '/equipment', permission: 'page:view:assets' },
      { route: '/announcements', permission: 'page:view:announcements' },
      { route: '/profile', permission: 'page:view:profile' },
    ];
    for (const item of candidates) {
      if (can(item.permission)) return item.route;
    }
    return null;
  }, []);

  const redirectToSignIn = useCallback(async () => {
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
          body: JSON.stringify({ action: 'logout', details: { reason: 'inactivity' } }),
        });
      } catch (err) {
        if (typeof console !== 'undefined') console.warn('Audit log (logout) failed:', err);
      }
    }
    clearSession();
    const returnUrl = pathname ? encodeURIComponent(pathname) : '';
    router.replace(`/sign-in${returnUrl ? `?returnUrl=${returnUrl}` : ''}`);
  }, [router, pathname]);

  // Auth check on mount and pathname change
  useEffect(() => {
    const session = getSession();
    if (!session) {
      setAccessDenied(false);
      redirectToSignIn();
      return;
    }
    if (isSessionExpired(session)) {
      setAccessDenied(false);
      redirectToSignIn();
      return;
    }
    if (!canAccessRoute(pathname || '')) {
      setShowAccessDeniedPopup(true);
      const fallbackRoute = getDefaultAuthorizedRoute();
      if (fallbackRoute && fallbackRoute !== pathname) {
        setAccessDenied(false);
        router.replace(fallbackRoute);
        return;
      }
      setAccessDenied(true);
      setAuthChecked(true);
      return;
    }
    setAccessDenied(false);
    setAuthChecked(true);
  }, [pathname, redirectToSignIn, canAccessRoute, router, getDefaultAuthorizedRoute]);

  // Inactivity check every 60s
  useEffect(() => {
    if (!authChecked) return;
    const interval = setInterval(() => {
      const session = getSession();
      if (!session || isSessionExpired(session)) {
        redirectToSignIn();
      }
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, [authChecked, redirectToSignIn]);

  // Keep access token fresh for active users to avoid 401 loops after ~60 minutes.
  useEffect(() => {
    if (!authChecked) return;
    let mounted = true;

    const ensureFresh = async (force = false) => {
      const session = getSession();
      if (!session) return;
      const ok = await refreshAccessTokenIfNeeded(force);
      if (!ok && mounted) {
        const latest = getSession();
        if (!latest || isSessionExpired(latest)) {
          redirectToSignIn();
        }
      }
    };

    void ensureFresh(false);
    const interval = setInterval(() => {
      void ensureFresh(false);
    }, 60 * 1000);

    const handleVisibilityOrFocus = () => {
      void ensureFresh(false);
    };
    window.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);

    return () => {
      mounted = false;
      clearInterval(interval);
      window.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
    };
  }, [authChecked, redirectToSignIn]);

  // Touch session on user activity
  useEffect(() => {
    if (!authChecked) return;
    const handleActivity = () => touchSession();
    window.addEventListener('click', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('scroll', handleActivity);
    return () => {
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, [authChecked]);

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  if (!authChecked) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md rounded-xl border bg-white p-6 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">No page access assigned</h2>
          <p className="mt-2 text-sm text-gray-600">
            Your account is logged in, but no page permissions are assigned yet. Please contact admin to assign access.
          </p>
          <button
            onClick={() => {
              clearSession();
              router.replace('/sign-in');
            }}
            className="mt-4 rounded-md bg-[#137638] px-4 py-2 text-sm font-medium text-white hover:bg-[#0f5c2b]"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <ProfilePopup
        open={showAccessDeniedPopup}
        title="Access Denied"
        message="You do not have permission to perform this action or open this page. Please contact your administrator."
        onClose={() => setShowAccessDeniedPopup(false)}
      />
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`print-hide fixed lg:fixed inset-y-0 left-0 z-50 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition-transform duration-300 ease-in-out`}
      >
        <Sidebar
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapse}
          userPhone={getSession()?.user?.phone ?? null}
        />
      </div>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col w-full min-w-0 transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-14' : 'lg:ml-52'
      }`}>
        <div className="print-hide">
          <Header
            sidebarCollapsed={sidebarCollapsed}
            sidebarOpen={sidebarOpen}
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          />
        </div>
        <main className="flex-1 overflow-y-scroll overflow-x-hidden mt-[3.675rem] p-[0.65625rem] sm:p-[0.7875rem] lg:p-[1.05rem] max-w-full min-w-0 bg-gray-50/50 dark:bg-gray-900/50 custom-scrollbar">
          <div className="max-w-full min-w-0 overflow-x-hidden">
            <SidebarContext.Provider value={{ sidebarOpen }}>
              {children}
            </SidebarContext.Provider>
          </div>
        </main>
      </div>
    </div>
  );
}

