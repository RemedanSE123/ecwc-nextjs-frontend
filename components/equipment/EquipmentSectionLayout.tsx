'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Database, BarChart3 } from 'lucide-react';
import CategoryKPICards from './CategoryKPICards';

interface EquipmentSectionLayoutProps {
  title: string;
  basePath: string;
  /** Slug for category-specific KPIs (e.g. plant-equipment). Omit for non-category pages. */
  categoryGroup?: string;
  children: React.ReactNode;
}

export default function EquipmentSectionLayout({ title, basePath, categoryGroup, children }: EquipmentSectionLayoutProps) {
  const pathname = usePathname();
  const isData = pathname === basePath || pathname === `${basePath}/data`;
  const isReport = pathname === `${basePath}/report`;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-foreground">{title}</h1>
        <p className="text-muted-foreground text-[12px]">Equipment data and reports</p>
      </div>

      {/* KPI Cards - Total, Operational, Down, Repair, Idle, Availability */}
      {categoryGroup && (
        <CategoryKPICards categoryGroup={categoryGroup} />
      )}

      {/* Navbar: Data | Report */}
      <nav className="flex gap-1 p-1 bg-muted/50 rounded-lg w-fit border">
        <Link
          href={basePath}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            isData ? 'bg-background text-foreground shadow' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Database className="w-4 h-4" />
          Data
        </Link>
        <Link
          href={`${basePath}/report`}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            isReport ? 'bg-background text-foreground shadow' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Report
        </Link>
      </nav>

      {children}
    </div>
  );
}
