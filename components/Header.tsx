'use client';

import { Search, Bell, User, ChevronDown, Settings, LogOut, Menu } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface HeaderProps {
  sidebarCollapsed?: boolean;
}

export default function Header({ sidebarCollapsed = false }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

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
      className={`bg-white border-b border-gray-200/80 h-[3.675rem] flex items-center justify-between px-3 lg:px-4 fixed top-0 right-0 z-30 backdrop-blur-sm transition-all duration-300 font-[var(--font-dm-sans)] ${
        sidebarCollapsed ? 'lg:left-14' : 'lg:left-52'
      }`}
    >
      {/* Left - Logo */}
      <div className="flex items-center">
        <div className="relative w-20 h-12">
          <Image
            src="/flogo.png"
            alt="ECWC Logo"
            fill
            sizes="80px"
            className="object-contain drop-shadow-sm"
            priority
            quality={100}
          />
        </div>
      </div>

      {/* Search Section - Centered */}
      <div className="flex-1 flex justify-center px-3">
        <div className="relative group w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 group-focus-within:text-green-600 transition-colors pointer-events-none z-10" />
          <input
            type="text"
            placeholder="Search equipment, requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-9 py-1.5 text-[11px] border border-gray-200 rounded-full bg-white shadow-sm hover:shadow-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition-all duration-200 text-gray-900 placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Right Actions - Compact */}
      <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white"></span>
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-72 bg-white rounded-md shadow-lg border border-gray-200 py-0.5 z-50">
              <div className="px-3 py-2.5 border-b border-gray-100">
                <h3 className="text-[12px] font-semibold text-gray-900">Notifications</h3>
              </div>
              <div className="max-h-72 overflow-y-auto">
                <div className="px-3 py-2.5 hover:bg-gray-50 cursor-pointer border-b border-gray-50">
                  <p className="text-[11px] text-gray-900">New maintenance request received</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">2 minutes ago</p>
                </div>
                <div className="px-3 py-2.5 hover:bg-gray-50 cursor-pointer border-b border-gray-50">
                  <p className="text-[11px] text-gray-900">Equipment status updated</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">15 minutes ago</p>
                </div>
                <div className="px-3 py-2.5 hover:bg-gray-50 cursor-pointer">
                  <p className="text-[11px] text-gray-900">Approval required for request #1234</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">1 hour ago</p>
                </div>
              </div>
              <div className="px-3 py-1.5 border-t border-gray-100">
                <button className="text-[11px] text-gray-600 hover:text-gray-900 w-full text-center py-1.5">
                  View all notifications
                </button>
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
            <div className="w-7 h-7 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center text-white font-medium text-xs shadow-sm">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="hidden lg:flex flex-col items-start">
              <span className="text-[11px] font-medium text-gray-900 leading-tight">John Doe</span>
              <span className="text-[9px] text-gray-500 leading-tight">Equipment Dept.</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 hidden lg:block transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-md shadow-lg border border-gray-200 py-0.5 z-50">
              <div className="px-3 py-2.5 border-b border-gray-100">
                <p className="text-[11px] font-medium text-gray-900">John Doe</p>
                <p className="text-[10px] text-gray-500 mt-0.5">john.doe@ecwc.gov.et</p>
              </div>
              <button className="w-full px-3 py-2 text-left text-[11px] text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors">
                <User className="w-3.5 h-3.5 text-gray-400" />
                <span>My Profile</span>
              </button>
              <button className="w-full px-3 py-2 text-left text-[11px] text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors">
                <Settings className="w-3.5 h-3.5 text-gray-400" />
                <span>Settings</span>
              </button>
              <div className="border-t border-gray-100 my-0.5"></div>
              <button className="w-full px-3 py-2 text-left text-[11px] text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors">
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
