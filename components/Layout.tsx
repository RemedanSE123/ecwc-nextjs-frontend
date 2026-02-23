'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Loader2 } from 'lucide-react';
import { getSession, isSessionExpired, clearSession, touchSession } from '@/lib/auth';
import { SidebarContext } from '@/lib/sidebar-context';

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

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
        await fetch('/api/audit', {
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
      redirectToSignIn();
      return;
    }
    if (isSessionExpired(session)) {
      redirectToSignIn();
      return;
    }
    setAuthChecked(true);
  }, [pathname, redirectToSignIn]);

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

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
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

