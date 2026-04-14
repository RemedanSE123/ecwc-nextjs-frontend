'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { can, getSessionUpdatedEventName } from '@/lib/auth';
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
  ChevronsLeft,
  ChevronsRight,
  Info,
  Truck,
  Car,
  MapPin,
  Drill,
  Factory,
  History,
  Megaphone,
  Database,
} from 'lucide-react';
import { useState, useEffect } from 'react';

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
  { name: 'Dashboard', href: '/equipment/dashboard', icon: LayoutDashboard },
  
  {
    name: 'ECWC Assets',
    href: '/equipment',
    icon: Wrench,
    children: [
      { name: 'Plant', href: '/equipment/plant-equipment', icon: Wrench },
      { name: 'Machinery', href: '/equipment/machinery', icon: Wrench },
      { name: 'Heavy Vehicles', href: '/equipment/heavy-vehicles', icon: Truck },
      { name: 'Light Vehicles', href: '/equipment/light-vehicles', icon: Car },
      { name: 'Factory Equipment', href: '/equipment/factory-equipment', icon: Factory },
      { name: 'Auxiliary Equipment', href: '/equipment/auxiliary-equipment', icon: Drill },
    ],
  },

  
  //{ name: 'Machinery Maintenance', href: '/machinery-maintenance', icon: Wrench },
  { name: 'Machinery Operations', href: '/machinery-operations', icon: ClipboardList },
  //{ name: 'Equipment Admin', href: '/equipment-administration', icon: Settings },
  { name: 'Common Data', href: '/common-data', icon: Database },
  {
    name: 'Employee Access',
    href: '/admin/employees',
    icon: UserCheck,
    children: [
      { name: 'Employees', href: '/admin/employees', icon: UserCheck },
      { name: 'Master Data CRUD', href: '/admin/master-data', icon: Database },
      { name: 'Access Control', href: '/admin/access-control', icon: Settings },
    ],
  },
  { name: 'Compound Map', href: '/compound-map', icon: MapPin },
  { name: 'Announcements', href: '/announcements', icon: Megaphone },
  { name: 'Audit Trail', href: '/audit', icon: History },
];

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  userPhone?: string | null;
}

export default function Sidebar({ isCollapsed = false, onToggleCollapse, userPhone }: SidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [authzVersion, setAuthzVersion] = useState(0);

  useEffect(() => {
    const eventName = getSessionUpdatedEventName();
    const onSession = () => setAuthzVersion((n) => n + 1);
    window.addEventListener(eventName, onSession);
    return () => window.removeEventListener(eventName, onSession);
  }, []);

  const visibleNav = useMemo(() => {
    const permissionByHref: Record<string, string> = {
      '/equipment/dashboard': 'page:view:equipment_dashboard',
      '/equipment': 'page:view:assets',
      '/equipment/plant-equipment': 'page:view:assets',
      '/equipment/machinery': 'page:view:assets',
      '/equipment/heavy-vehicles': 'page:view:assets',
      '/equipment/light-vehicles': 'page:view:assets',
      '/equipment/factory-equipment': 'page:view:assets',
      '/equipment/auxiliary-equipment': 'page:view:assets',
      '/machinery-operations': 'page:view:assets',
      '/common-data': 'page:view:master_data',
      '/admin/employees': 'page:view:employee_access',
      '/admin/master-data': 'page:view:master_data',
      '/admin/access-control': 'authz:manage',
      '/compound-map': 'page:view:assets',
      '/announcements': 'page:view:announcements',
      '/audit': 'page:view:audit',
    };

    return navigation
      .filter((item) => {
        const permission = permissionByHref[item.href];
        return permission ? can(permission) : false;
      })
      .map((item) => ({
        ...item,
        children: item.children?.filter((child) => {
          const permission = permissionByHref[child.href];
          return permission ? can(permission) : false;
        }),
      }))
      .filter((item) => !item.children || item.children.length > 0);
  }, [authzVersion, userPhone]);

  // Standalone form routes: do not add or remove Time Sheet from expanded state (no expand/collapse)
  const isStandaloneFormRoute =
    pathname === '/daily-down' ||
    pathname === '/equipment-utilization' ||
    pathname === '/equipment-transfer';

  // Keep parent expanded when on a child route; for Assets+Map-only users always expand ECWC Assets
  useEffect(() => {
    const parentsToExpand: string[] = [];
    visibleNav.forEach((item) => {
      if (item.children && (pathname === item.href || pathname?.startsWith(item.href + '/'))) {
        parentsToExpand.push(item.name);
      }
    });
    setExpandedItems((prev) => {
      // On Daily Down / Equipment Utilization / Equipment Transfer, don't change expanded state at all
      if (isStandaloneFormRoute) {
        return prev;
      }
      const combined = new Set([...prev, ...parentsToExpand]);
      return Array.from(combined);
    });
  }, [pathname, userPhone, visibleNav, isStandaloneFormRoute]);

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
    return pathname === href || pathname?.startsWith(href + '/');
  };

  return (
    <div className={`${isCollapsed ? 'w-14' : 'w-52'} bg-gradient-to-b from-[#0d5c32] via-[#0a4d28] to-[#064320] text-white flex flex-col h-screen transition-all duration-300 ease-in-out shadow-xl relative overflow-hidden font-[var(--font-dm-sans)]`}>
      
      {/* Subtle Dot Pattern (Texture) */}
      <div className="absolute inset-0 opacity-[0.06]">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,_white_2px,_transparent_2px)] bg-[length:40px_40px]"></div>
      </div>
      
      {/* Soft Glow / Light Blob */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
      
      {/* Header: logo as large as possible within same height as main header (3.675rem) */}
      <div className="h-[3.675rem] border-b border-white/20 flex items-center relative z-10">
        <div className="absolute inset-0 flex items-center justify-center pl-2 pr-9 py-1">
          <div className="relative w-full max-w-[180px] h-full min-h-0">
            <Image
              src="/slogo.png"
              alt="ECWC"
              fill
              sizes="(min-width: 208px) 180px, 48px"
              className="object-contain object-center"
              priority
            />
          </div>
        </div>
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="absolute top-1/2 -translate-y-1/2 right-2 p-1.5 rounded hover:bg-white/10 transition-colors z-10"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronsRight className="w-4 h-4 text-white/80" />
            ) : (
              <ChevronsLeft className="w-4 h-4 text-white/80" />
            )}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2.5 py-3 relative z-10 sidebar-scrollbar">
        <ul className="space-y-0.5">
          {visibleNav.map((item) => {
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
              የኢትዮጵያ ኮንስትራክሽን ሥራዎች ኮርፖሬሽን
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

