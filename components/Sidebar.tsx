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
} from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  {
    name: 'Equipment',
    href: '/equipment',
    icon: Wrench,
    children: [
      { name: 'Equipment Dashboard', href: '/equipment/dashboard', icon: LayoutDashboard },
      { name: 'Equipment List', href: '/equipment', icon: Wrench },
      { name: 'Non ECWC Equipment List', href: '/non-ecwc-equipment', icon: Wrench },
      { name: 'Cargo Truck List', href: '/cargo-truck', icon: Truck },
      { name: 'Light Vehicle List', href: '/light-vehicle', icon: Car },
      { name: 'Detailed Reports', href: '/equipment/reports', icon: FileText },
      { name: 'Status Codes Reference', href: '/status-codes', icon: Info },
    ],
  },
  {
    name: 'Maintenance',
    href: '/maintenance',
    icon: FileText,
    children: [
      { name: 'All Requests', href: '/maintenance', icon: FileText },
      { name: 'Create Request', href: '/requests', icon: FileText },
      { name: 'Maintenance Request', href: '/maintenance-request', icon: ClipboardList },
      { name: 'Job Order', href: '/job-order', icon: FileCheck },
    ],
  },
  {
    name: 'Technician',
    href: '/technician-report',
    icon: UserCheck,
    children: [
      { name: 'Service Report', href: '/technician-report', icon: FileText },
      { name: 'Time Sheet', href: '/technician-timesheet', icon: Clock },
      { name: 'Dry Cargo Time Sheet', href: '/dry-cargo-timesheet', icon: Clock },
      { name: 'Dumper Truck Time Sheet', href: '/dumper-truck-timesheet', icon: Clock },
      { name: 'Construction Equipment Time Sheet', href: '/construction-equipment-timesheet', icon: Clock },
      { name: 'Light Vehicle & Public Transport Time Sheet', href: '/light-vehicle-public-transport-timesheet', icon: Clock },
      { name: 'Wagen Drill Time Sheet', href: '/wagen-drill-timesheet', icon: Clock },
    ],
  },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Help & Support', href: '/help', icon: HelpCircle },
];

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function Sidebar({ isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>(['Equipment', 'Maintenance', 'Technician']);

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
    <div className={`${isCollapsed ? 'w-20' : 'w-64'} bg-gradient-to-b from-green-600 via-green-700 to-green-800 text-white flex flex-col h-screen transition-all duration-300 ease-in-out shadow-2xl relative overflow-hidden`} style={{ fontFamily: 'Times, "Times New Roman", serif' }}>
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,_white_2px,_transparent_2px)] bg-[length:40px_40px]"></div>
      </div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
      {/* Logo Section */}
      <div className="h-24 border-b border-white/15 bg-gradient-to-br from-green-800 via-green-700 to-green-800 flex items-center justify-center relative overflow-hidden">
        {/* Subtle glow effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/8 via-transparent to-white/3"></div>
        <div className="relative w-full h-full px-3 flex items-center justify-center">
          {isCollapsed ? (
            <div className="relative w-16 h-16">
              <Image
                src="/ECWC-Official-Logo.png"
                alt="ECWC Logo"
                fill
                sizes="64px"
                className="object-contain"
                priority
                quality={100}
                unoptimized
              />
            </div>
          ) : (
            <div className="relative w-full h-full">
              <Image
                src="/ECWC-Official-Logo.png"
                alt="ECWC Logo"
                fill
                sizes="512px"
                className="object-contain"
                priority
                quality={100}
                unoptimized
              />
            </div>
          )}
        </div>
        {/* Collapse Toggle Button */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="absolute top-1.5 right-1.5 p-1 rounded bg-white/10 hover:bg-white/20 transition-all duration-200 border border-white/15 z-10"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronsRight className="w-3.5 h-3.5 text-white" />
            ) : (
              <ChevronsLeft className="w-3.5 h-3.5 text-white" />
            )}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2.5 relative z-10">
        <ul className="space-y-1">
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
                      className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-2.5 py-2 rounded-md text-xs transition-all duration-200 group relative font-serif ${
                        itemIsActive
                          ? 'text-white font-semibold'
                          : 'text-white/85 hover:text-white'
                      }`}
                      title={isCollapsed ? item.name : undefined}
                    >
                      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5'}`}>
                        <Icon className="w-4 h-4" />
                        {!isCollapsed && <span>{item.name}</span>}
                      </div>
                      {!isCollapsed && (
                        isExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                        )
                      )}
                    </button>
                    {isExpanded && item.children && !isCollapsed && (
                      <ul className="ml-6 mt-1 space-y-0.5 border-l border-white/20 pl-3">
                        {item.children.map((child) => {
                          const ChildIcon = child.icon;
                          const childIsActive = isActive(child.href);
                          return (
                            <li key={child.name}>
                              <Link
                                href={child.href}
                                onClick={handleChildClick}
                                className={`flex items-center gap-2 px-2.5 py-1.5 rounded text-[11px] transition-all duration-200 font-serif ${
                                  childIsActive
                                    ? 'text-white font-semibold'
                                    : 'text-white/75 hover:text-white'
                                }`}
                              >
                                <ChildIcon className="w-3.5 h-3.5" />
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
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5'} px-2.5 py-2 rounded-md text-xs transition-all duration-200 group relative font-serif ${
                      itemIsActive
                        ? 'text-white font-semibold'
                        : 'text-white/85 hover:text-white'
                    }`}
                    title={isCollapsed ? item.name : undefined}
                  >
                    <Icon className="w-4 h-4" />
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
        <div className="p-2.5 border-t border-white/15 bg-gradient-to-t from-green-800 via-green-700 to-green-800 relative overflow-hidden">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/8 via-transparent to-transparent"></div>
          
          <div className="relative z-10 text-center space-y-1">
            {/* Amharic Text */}
            <div className="relative">
              <p className="text-[11px] font-semibold text-white leading-tight tracking-wide drop-shadow-md relative z-10 font-serif">
                ኢትየጵያ ኮንስትራክሽን ሥራዎች ኮርፖሬሽን
              </p>
            </div>
            
            {/* Decorative divider */}
            <div className="flex items-center justify-center gap-1 py-0.5">
              <div className="h-px w-5 bg-gradient-to-r from-transparent via-white/30 to-white/30"></div>
              <div className="w-0.5 h-0.5 rounded-full bg-white/30"></div>
              <div className="h-px w-5 bg-gradient-to-l from-transparent via-white/30 to-white/30"></div>
            </div>
            
            {/* English Text */}
            <div className="relative">
              <p className="text-[9px] font-medium text-white/90 leading-tight tracking-wider uppercase drop-shadow-sm relative z-10 font-serif">
                Ethiopian Construction and Works Corporation
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

