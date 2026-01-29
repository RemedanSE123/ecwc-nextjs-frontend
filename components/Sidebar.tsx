'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Wrench,
  FileText,
  Settings,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  UserCheck,
  Clock,
  FileCheck,
  ChevronsLeft,
  ChevronsRight,
  Info,
  Truck,
  Car,
  MapPin,
} from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';

function BrIcon({ className }: { className?: string }) {
  return <span className={className} style={{ fontWeight: 700, fontSize: '0.75rem' }}>Br</span>;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Compound Map', href: '/compound-map', icon: MapPin },
  {
    name: 'Equipment',
    href: '/equipment',
    icon: Wrench,
    children: [
      { name: 'Dashboard', href: '/equipment/dashboard', icon: LayoutDashboard },
      { name: 'Equipment List', href: '/equipment', icon: Wrench },
     
      { name: 'Cargo Truck List', href: '/cargo-truck', icon: Truck },
      { name: 'Light Vehicle List', href: '/light-vehicle', icon: Car },
      { name: 'Detailed Reports', href: '/equipment/reports', icon: FileText },
  
    ],
  },
  {
    name: 'Forms',
    href: '/forms',
    icon: ClipboardList,
    children: [
      { name: 'Dry Load TS', href: '/forms/dry-cargo-timesheet', icon: FileText },
      { name: 'Machinery TS', href: '/forms/construction-equipment-timesheet', icon: FileText },
      { name: 'Dump Truck TS', href: '/forms/dump-truck-timesheet', icon: FileText },
      { name: 'Light Vehicle TS', href: '/forms/light-vehicle-timesheet', icon: FileText },
      { name: 'Wagon Drill TS', href: '/forms/wagon-drill-timesheet', icon: FileText },
      { name: 'Rate Reference', href: '/rates', icon: BrIcon },
    ],
  },
  { name: 'Maintenance', href: '/maintenance', icon: FileText },
  { name: 'Technician', href: '/technician-report', icon: UserCheck },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Help & Support', href: '/help', icon: HelpCircle },
];

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function Sidebar({ isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>(['Equipment', 'Forms']);

  const toggleExpanded = (name: string) => {
    setExpandedItems((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    );
  };

  const handleItemClick = (e: React.MouseEvent, hasChildren: boolean, itemName?: string) => {
    if (isCollapsed && onToggleCollapse) {
      // If collapsed, expand first
      onToggleCollapse();
      // If it has children, also expand the item
      if (hasChildren && itemName) {
        setTimeout(() => {
          if (!expandedItems.includes(itemName)) {
            toggleExpanded(itemName);
          }
        }, 100);
      }
    } else if (hasChildren && itemName) {
      // If not collapsed and has children, just toggle expansion
      toggleExpanded(itemName);
    }
  };

  const handleChildClick = () => {
    if (isCollapsed && onToggleCollapse) {
      // If collapsed, expand the sidebar
      onToggleCollapse();
    }
  };

  const handleLinkClick = () => {
    if (isCollapsed && onToggleCollapse) {
      // If collapsed, expand the sidebar
      onToggleCollapse();
    }
  };

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(href);
  };

  return (
    <div className={`${isCollapsed ? 'w-14' : 'w-52'} bg-gradient-to-b from-[#16A34A] via-[#15803D] to-[#166534] text-white flex flex-col h-screen transition-all duration-300 ease-in-out shadow-xl relative overflow-hidden font-[var(--font-dm-sans)]`}>
      
      {/* Subtle Dot Pattern (Texture) */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,_white_2px,_transparent_2px)] bg-[length:40px_40px]"></div>
      </div>
      
      {/* Soft Glow / Light Blob */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
      
      {/* Header Section */}
      <div className="h-[3.675rem] border-b border-white/10 flex items-center relative z-10">
        {/* Dark Header Background */}
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative w-full h-full px-3 flex items-center">
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-[14px] font-extrabold text-white leading-tight tracking-wide drop-shadow-md">
                ECWC PEMS
              </span>
              <span className="text-[9px] text-green-200/80 leading-tight">
                Plant Equipment Management System
              </span>
            </div>
          )}
        </div>
        
        {/* Collapse Toggle Button */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="absolute top-1/2 -translate-y-1/2 right-1.5 p-1 rounded-md hover:bg-white/10 transition-all duration-200"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronsRight className="w-3.5 h-3.5 text-white/70" />
            ) : (
              <ChevronsLeft className="w-3.5 h-3.5 text-white/70" />
            )}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-3 relative z-10">
        <ul className="space-y-0.5">
          {navigation.map((item) => {
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedItems.includes(item.name) && !isCollapsed;
            const Icon = item.icon;
            const itemIsActive = isActive(item.href);

            return (
              <li key={item.name}>
                {hasChildren ? (
                  <>
                    <button
                      onClick={(e) => handleItemClick(e, true, item.name)}
                      className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-2.5 py-2 rounded-md text-[12px] transition-all duration-200 ${
                        itemIsActive
                          ? 'bg-green-700/50 text-white font-semibold'
                          : 'text-white hover:bg-white/10'
                      }`}
                      title={isCollapsed ? item.name : undefined}
                    >
                      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5'}`}>
                        <Icon className="w-3.5 h-3.5" />
                        {!isCollapsed && <span>{item.name}</span>}
                      </div>
                      {!isCollapsed && (
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? '' : '-rotate-90'}`} />
                      )}
                    </button>
                    {isExpanded && item.children && !isCollapsed && (
                      <ul className="mt-0.5 ml-2.5 space-y-0.5 border-l border-white/15 pl-2.5">
                        {item.children.map((child) => {
                          const ChildIcon = child.icon;
                          const childIsActive = isActive(child.href);
                          return (
                            <li key={child.name}>
                              <Link
                                href={child.href}
                                onClick={handleChildClick}
                                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] transition-all duration-200 ${
                                  childIsActive
                                    ? 'bg-green-600/40 text-white font-medium'
                                    : 'text-white hover:bg-white/10'
                                }`}
                              >
                                <ChildIcon className="w-3 h-3" />
                                <span>{child.name}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    onClick={handleLinkClick}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5'} px-2.5 py-2 rounded-md text-[12px] transition-all duration-200 ${
                      itemIsActive
                        ? 'bg-green-700/50 text-white font-semibold'
                        : 'text-white hover:bg-white/10'
                    }`}
                    title={isCollapsed ? item.name : undefined}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {!isCollapsed && <span>{item.name}</span>}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="px-2.5 py-2.5 border-t border-white/20 relative z-10">
          <div className="text-center">
            <p className="text-[10px] text-white/90 leading-relaxed">
              ኢትዮጵያ ኮንስትራክሽን ስራዎች ኮርፖሬሽን
            </p>
            <p className="text-[9px] text-green-200/80 leading-relaxed">
              Ethiopian Construction Works Corp.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

