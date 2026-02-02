'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Menu, X } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

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
        <Sidebar isCollapsed={sidebarCollapsed} onToggleCollapse={toggleSidebarCollapse} />
      </div>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col w-full transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-14' : 'lg:ml-52'
      }`}>
        {/* Mobile Menu Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="print-hide lg:hidden fixed top-2.5 left-2.5 z-30 p-1 bg-green-600 hover:bg-green-700 text-white rounded shadow-lg"
        >
          {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>

        <div className="print-hide">
          <Header sidebarCollapsed={sidebarCollapsed} />
        </div>
        <main className="flex-1 overflow-y-auto overflow-x-hidden mt-[3.675rem] p-[0.65625rem] sm:p-[0.7875rem] lg:p-[1.05rem] max-w-full min-w-0 bg-gray-50/50 dark:bg-gray-900/50">
          <div className="max-w-full min-w-0 overflow-x-hidden">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

