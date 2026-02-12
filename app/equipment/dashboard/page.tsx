'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { fetchAssetStats, fetchAssetReports, fetchStatusSummary } from '@/lib/api/assets';
import EquipmentDataView from '@/components/equipment/EquipmentDataView';
import { exportStatsToExcel, exportToPdf } from '@/lib/export-utils';
import { EQUIPMENT_CATEGORIES, SLUG_TO_DB_CATEGORY } from '@/types/asset';
import type { AssetStats, AssetReportData } from '@/types/asset';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LabelList,
} from 'recharts';
import {
  Wrench,
  Truck,
  Car,
  FileText,
  Download,
  FileSpreadsheet,
  FileDown,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Drill,
  Factory,
  BarChart3,
  MapPin,
  PieChart as PieChartIcon,
  Activity,
} from 'lucide-react';
import { motion } from 'framer-motion';

/* Maximally different colors per category — high contrast, spread across spectrum */
const COLORS = [
  '#00c853', /* 1 Plant — bright green */
  '#2962ff', /* 2 Machinery — blue */
  '#ff1744', /* 3 Heavy Vehicles — red */
  '#ff9100', /* 4 Light Vehicles — orange */
  '#aa00ff', /* 5 Factory Equipment — purple */
  '#00e5ff', /* 6 Auxiliary Equipment — cyan */
];

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  'plant-equipment': Wrench,
  'auxiliary-equipment': Drill,
  'light-vehicles': Car,
  'heavy-vehicles': Truck,
  'machinery': Wrench,
  'factory-equipment': Factory,
};

const DOWN_BREAKDOWN_LABELS: Record<string, string> = {
  ur: 'Under Repair',
  down: 'Down',
  hr: 'Heavy Repair',
  ui: 'Under Installation',
  wi: 'Waiting for Installation',
  uc: 'Under Commissioning',
  rfd: 'Ready For Disposal',
  afd: 'Approved For Disposal',
  accident: 'Accident',
  other: 'Other',
};

type ChartTooltipPayloadItem = {
  name?: string | number;
  value?: number | string | (string | number)[];
  payload?: Record<string, unknown>;
};

/** Single-line tooltip to avoid double text on hover. Accepts Recharts tooltip payload. */
function ChartTooltip({
  active,
  payload,
  label,
  render,
}: {
  active?: boolean;
  payload?: ChartTooltipPayloadItem[];
  label?: string;
  render?: (value: number, name: string, payload: Record<string, unknown> | undefined) => string;
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  const raw = p?.value;
  const value = Array.isArray(raw) ? Number((raw as (string | number)[])[0] ?? 0) : Number(raw ?? 0);
  const name = String(p?.name ?? '');
  const text = render ? render(value, name, p?.payload) : `${name}: ${value.toLocaleString()}`;
  return (
    <div className="rounded-xl border border-border/80 bg-background/95 backdrop-blur-sm px-3 py-2.5 shadow-xl text-xs font-medium text-foreground ring-1 ring-black/5">
      {text}
    </div>
  );
}

interface CategoryCardProps {
  slug: string;
  name: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  stats: { total: number; op: number; idle: number; down: number; downBreakdown: { label: string; count: number }[] };
  pct: number;
  index: number;
}

function CategoryCard({ slug, name, icon: Icon, color, stats, pct, index }: CategoryCardProps) {
  const [showDownPopup, setShowDownPopup] = useState(false);
  const downPct = stats.total ? Math.round((stats.down / stats.total) * 100) : 0;
  const card = (
    <Link href={`/equipment/${slug}`} className="block">
      <Card
        className="overflow-visible border border-border/80 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group relative bg-card rounded-xl"
        style={{ borderLeftWidth: '4px', borderLeftColor: color }}
      >
        <CardContent className="p-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
            {/* Column 1: Category name, total, fleet % */}
            <div className="flex items-center gap-2.5 p-3 sm:border-r sm:border-b-0 border-b border-border/60 sm:border-b-transparent">
              <div
                className="p-1.5 rounded-md shrink-0 group-hover:scale-105 transition-transform bg-muted/60"
                style={{ color }}
              >
                <Icon className="h-4 w-4" style={{ color }} />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-xs text-foreground truncate">{name}</p>
                <p className="text-xl font-bold tabular-nums text-foreground mt-0.5">{stats.total.toLocaleString()}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{pct}% of fleet</p>
              </div>
            </div>
            {/* Column 2: OP (green), Idle (blue), Down count (red), Down % (red) */}
            <div className="flex flex-col justify-center gap-1 p-3">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                <span className="text-muted-foreground text-[11px]">OP:</span>
                <span className="font-semibold text-green-600 dark:text-green-400 tabular-nums">{stats.op}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                <span className="text-muted-foreground text-[11px]">Idle:</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400 tabular-nums">{stats.idle}</span>
              </div>
              <div
                className="relative z-[100] flex items-center gap-1.5 text-xs w-fit"
                onMouseEnter={() => setShowDownPopup(true)}
                onMouseLeave={() => setShowDownPopup(false)}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                <span className="text-muted-foreground text-[11px]">Down:</span>
                <span className="font-semibold text-red-600 dark:text-red-400 tabular-nums cursor-help underline decoration-dotted decoration-red-500/50 underline-offset-1">
                  {stats.down}
                </span>
                {showDownPopup && (
                  <div
                    className="absolute z-[200] right-0 bottom-full mb-1.5 w-[200px] rounded-lg shadow-2xl border border-border bg-background overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150 pointer-events-auto"
                    style={{ isolation: 'isolate' }}
                    onMouseEnter={() => setShowDownPopup(true)}
                    onMouseLeave={() => setShowDownPopup(false)}
                  >
                    <div className="px-3 py-2 bg-red-500/10 border-b border-border font-semibold text-xs text-red-600 dark:text-red-400">
                      Down breakdown
                    </div>
                    <div className="p-2 space-y-1 max-h-44 overflow-y-auto">
                      {stats.downBreakdown.length > 0 ? (
                        stats.downBreakdown.map((d) => (
                          <div
                            key={d.label}
                            className="flex justify-between items-center gap-2 py-1 px-2 rounded text-xs hover:bg-muted/50"
                          >
                            <span className="text-foreground">{d.label}</span>
                            <span className="font-bold tabular-nums text-red-600 dark:text-red-400">{d.count}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground py-2">No breakdown</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                <span className="text-muted-foreground text-[11px]">Down:</span>
                <span className="font-semibold text-red-600 dark:text-red-400 tabular-nums">{downPct}%</span>
              </div>
            </div>
          </div>
          <div className="absolute top-2 right-2">
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (index + 1) * 0.05 }}
      className={showDownPopup ? 'relative z-[100]' : undefined}
    >
      {card}
    </motion.div>
  );
}

function getCategoryStats(
  statusSummary: Awaited<ReturnType<typeof fetchStatusSummary>> | null,
  dbCategory: string
) {
  if (!statusSummary?.rows?.length) return { total: 0, op: 0, idle: 0, down: 0, downBreakdown: [] as { label: string; count: number }[] };
  const rows = statusSummary.rows.filter((r) => r.category === dbCategory);
  let total = 0;
  let op = 0;
  let idle = 0;
  const downParts: Record<string, number> = { ur: 0, down: 0, hr: 0, ui: 0, wi: 0, uc: 0, rfd: 0, afd: 0, accident: 0, other: 0 };
  for (const r of rows) {
    total += r.total;
    op += r.op;
    idle += r.idle;
    downParts.ur += r.ur;
    downParts.down += r.down;
    downParts.hr += r.hr;
    downParts.ui += r.ui;
    downParts.wi += r.wi;
    downParts.uc += r.uc;
    downParts.rfd += r.rfd;
    downParts.afd += r.afd;
    downParts.accident += r.accident;
    downParts.other += r.other;
  }
  const down = Object.values(downParts).reduce((a, b) => a + b, 0);
  const downBreakdown = Object.entries(downParts)
    .filter(([, c]) => c > 0)
    .map(([k, c]) => ({ label: DOWN_BREAKDOWN_LABELS[k] ?? k, count: c }))
    .sort((a, b) => b.count - a.count);
  return { total, op, idle, down, downBreakdown };
}

export default function EquipmentDashboardPage() {
  const [stats, setStats] = useState<AssetStats | null>(null);
  const [report, setReport] = useState<AssetReportData | null>(null);
  const [statusSummary, setStatusSummary] = useState<Awaited<ReturnType<typeof fetchStatusSummary>> | null>(null);
  const [statusSummaryReport, setStatusSummaryReport] = useState<Awaited<ReturnType<typeof fetchStatusSummary>> | null>(null);
  /** Button click = view only that report. Checkbox 2+ = merged report. */
  const [primaryReportScope, setPrimaryReportScope] = useState<'overall' | string>('overall');
  const [combinedCheckboxes, setCombinedCheckboxes] = useState<string[]>([]);
  /** Report table header sort (all views) */
  const [reportTableSortBy, setReportTableSortBy] = useState<string>('total');
  const [reportTableSortOrder, setReportTableSortOrder] = useState<'asc' | 'desc'>('desc');
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [fleetDownPopup, setFleetDownPopup] = useState<{ top: number; left: number } | null>(null);
  const fleetDownTriggerRef = useRef<HTMLDivElement>(null);
  const fleetDownPopupCloseRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pdfRef = useRef<HTMLDivElement>(null);
  const overviewSectionRef = useRef<HTMLDivElement>(null);
  const allAssetsSectionRef = useRef<HTMLDivElement>(null);
  const [animatedTotal, setAnimatedTotal] = useState(0);
  const locationSortColumns = ['location', 'plant', 'machinery', 'heavy_vehicle', 'light_vehicles', 'factory_equipment', 'auxiliary', 'total', 'op', 'idle', 'down'] as const;
  type LocationSortBy = (typeof locationSortColumns)[number];
  const [locationSortBy, setLocationSortBy] = useState<LocationSortBy>('location');
  const [locationSortOrder, setLocationSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    Promise.all([fetchAssetStats(), fetchAssetReports(), fetchStatusSummary(), fetchStatusSummary()])
      .then(([s, r, ss, ssOverall]) => {
        setStats(s);
        setReport(r);
        setStatusSummary(ss);
        setStatusSummaryReport(ssOverall);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(
    () => () => {
      if (fleetDownPopupCloseRef.current) clearTimeout(fleetDownPopupCloseRef.current);
    },
    []
  );

  const total = stats?.total ?? 0;
  const totalOp = statusSummary?.grandTotal?.op ?? 0;
  const totalIdle = statusSummary?.grandTotal?.idle ?? 0;
  const totalDown = total - totalOp - totalIdle;
  const totalAvailability = total ? Math.round((totalOp / total) * 100) : 0;
  const totalProjectSites = stats?.uniqueProjectSites ?? stats?.byLocation?.filter((l) => l.project_location !== 'Unassigned')?.length ?? 0;

  const fleetDownBreakdown = (() => {
    const gt = statusSummary?.grandTotal;
    if (!gt) return [];
    const parts: { label: string; count: number }[] = [];
    (['ur', 'down', 'hr', 'ui', 'wi', 'uc', 'rfd', 'afd', 'accident', 'other'] as const).forEach((k) => {
      const count = Number(gt[k] ?? 0);
      if (count > 0) parts.push({ label: DOWN_BREAKDOWN_LABELS[k] ?? k, count });
    });
    return parts.sort((a, b) => b.count - a.count);
  })();

  // Count-up animation for Total Fleet: smooth count from 0 to total
  useEffect(() => {
    if (loading) {
      setAnimatedTotal(0);
      return;
    }
    const target = total;
    if (target <= 0) {
      setAnimatedTotal(0);
      return;
    }
    setAnimatedTotal(0);
    const durationMs = 2000; // 2s for a smooth, visible count
    // easeOutExpo: fast start, smooth gentle settle at the end
    const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
    let rafId: number;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / durationMs, 1);
      const eased = easeOutExpo(t);
      const value = t >= 1 ? target : Math.round(eased * target);
      setAnimatedTotal(value);
      if (t < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [total, loading]);

  const NUM_KEYS_REPORT = ['op', 'idle', 'ur', 'down', 'hr', 'ui', 'wi', 'uc', 'rfd', 'afd', 'accident', 'other'] as const;

  const effectiveReportSlugs = combinedCheckboxes.length >= 2
    ? combinedCheckboxes
    : primaryReportScope === 'overall'
      ? ['overall']
      : [primaryReportScope];
  const isCombinedView = combinedCheckboxes.length >= 2;

  /** Rows for report table: Overall = aggregated by category; single/multi = filter to selected categories. */
  const reportTableRows = useMemo(() => {
    if (!statusSummaryReport?.rows) return [];
    const isOverall = effectiveReportSlugs.length === 0 || effectiveReportSlugs.includes('overall');
    const dbCategories = isOverall
      ? EQUIPMENT_CATEGORIES.map((c) => c.dbCategory)
      : effectiveReportSlugs
          .filter((s) => s !== 'overall')
          .map((s) => EQUIPMENT_CATEGORIES.find((c) => c.slug === s)?.dbCategory)
          .filter(Boolean) as string[];

    let rows: Array<{ no: number; description: string; category: string; op?: number; idle?: number; ur?: number; down?: number; hr?: number; ui?: number; wi?: number; uc?: number; rfd?: number; afd?: number; accident?: number; other?: number; total?: number }>;
    if (isOverall) {
      rows = EQUIPMENT_CATEGORIES.map((cat, index) => {
        const categoryRows = statusSummaryReport.rows.filter((r) => r.category === cat.dbCategory);
        const agg = categoryRows.reduce<Record<string, number>>(
          (acc, row) => {
            NUM_KEYS_REPORT.forEach((k) => { acc[k] = (acc[k] ?? 0) + (row[k] ?? 0); });
            acc.total = (acc.total ?? 0) + (row.total ?? 0);
            return acc;
          },
          { total: 0 }
        );
        return {
          no: index + 1,
          description: cat.name,
          category: cat.dbCategory,
          op: agg.op ?? 0,
          idle: agg.idle ?? 0,
          ur: agg.ur ?? 0,
          down: agg.down ?? 0,
          hr: agg.hr ?? 0,
          ui: agg.ui ?? 0,
          wi: agg.wi ?? 0,
          uc: agg.uc ?? 0,
          rfd: agg.rfd ?? 0,
          afd: agg.afd ?? 0,
          accident: agg.accident ?? 0,
          other: agg.other ?? 0,
          total: agg.total ?? 0,
        };
      });
    } else {
      let filtered = statusSummaryReport.rows.filter((r) => dbCategories.includes(r.category));
      rows = filtered.map((row, i) => ({ ...row, no: i + 1 }));
    }

    const mul = reportTableSortOrder === 'asc' ? 1 : -1;
    const sortKey = reportTableSortBy;
    const isNum = ['no', 'op', 'idle', 'ur', 'down', 'hr', 'ui', 'wi', 'uc', 'rfd', 'afd', 'accident', 'total'].includes(sortKey);
    rows = [...rows].sort((a, b) => {
      if (isNum) {
        const va = (a as Record<string, unknown>)[sortKey] ?? 0;
        const vb = (b as Record<string, unknown>)[sortKey] ?? 0;
        return mul * (Number(va) - Number(vb));
      }
      const va = String((a as Record<string, unknown>)[sortKey] ?? '');
      const vb = String((b as Record<string, unknown>)[sortKey] ?? '');
      return mul * va.localeCompare(vb);
    });
    return rows.map((row, i) => ({ ...row, no: i + 1 }));
  }, [statusSummaryReport, effectiveReportSlugs, reportTableSortBy, reportTableSortOrder]);

  /** Grand total for report: when single/multi category, sum from reportTableRows; otherwise use API grandTotal. */
  const reportGrandTotal = useMemo(() => {
    const isOverall = effectiveReportSlugs.length === 0 || effectiveReportSlugs.includes('overall');
    if (isOverall && statusSummaryReport?.grandTotal) return statusSummaryReport.grandTotal;
    const gt: Record<string, number> = Object.fromEntries([...NUM_KEYS_REPORT.map((k) => [k, 0]), ['total', 0]]);
    reportTableRows.forEach((row) => {
      NUM_KEYS_REPORT.forEach((k) => { gt[k] = (gt[k] ?? 0) + (row[k] ?? 0); });
      gt.total = (gt.total ?? 0) + (row.total ?? 0);
    });
    return gt;
  }, [statusSummaryReport?.grandTotal, effectiveReportSlugs, reportTableRows]);

  /** In combined view, slight background per category section (cycle through these). */
  const COMBINED_SECTION_BG = [
    'bg-slate-50/70 dark:bg-slate-900/25',
    'bg-sky-50/50 dark:bg-sky-950/20',
    'bg-amber-50/40 dark:bg-amber-950/15',
    'bg-emerald-50/40 dark:bg-emerald-950/15',
    'bg-violet-50/40 dark:bg-violet-950/15',
    'bg-rose-50/40 dark:bg-rose-950/15',
  ];
  const reportRowSectionClass = useMemo(() => {
    if (effectiveReportSlugs.length <= 1) return () => '';
    const slugToIndex = new Map(effectiveReportSlugs.filter((s) => s !== 'overall').map((s, i) => [s, i]));
    const dbCategoryToIndex = new Map(
      EQUIPMENT_CATEGORIES.filter((c) => slugToIndex.has(c.slug)).map((c) => [c.dbCategory, slugToIndex.get(c.slug)!])
    );
    return (rowCategory: string) => {
      const idx = dbCategoryToIndex.get(rowCategory) ?? 0;
      return COMBINED_SECTION_BG[idx % COMBINED_SECTION_BG.length];
    };
  }, [effectiveReportSlugs]);

  /** Top Locations: filtered (no Unassigned), sorted by selected column (location = alphabet, others = by value). */
  const sortedLocationBreakdown = useMemo(() => {
    const list = report?.locationBreakdown?.filter((l) => l.location !== 'Unassigned') ?? [];
    const key = locationSortBy;
    const mul = locationSortOrder === 'asc' ? 1 : -1;
    if (key === 'location') {
      return [...list].sort((a, b) => mul * (a.location ?? '').localeCompare(b.location ?? '', undefined, { sensitivity: 'base' }));
    }
    return [...list].sort((a, b) => mul * ((Number(a[key]) ?? 0) - (Number(b[key]) ?? 0)));
  }, [report?.locationBreakdown, locationSortBy, locationSortOrder]);

  /** Summary row totals from fleet (reportTableRows + reportGrandTotal) so they match KPI cards exactly (fixes Heavy/Light off-by-one). */
  const topLocationsSummary = useMemo(() => {
    const isOverall = effectiveReportSlugs.length === 0 || effectiveReportSlugs.includes('overall');
    if (!isOverall || !reportTableRows.length || !reportGrandTotal) return null;
    const byCat = new Map<string, number>();
    reportTableRows.forEach((r) => { byCat.set(r.category, r.total ?? 0); });
    const gt = reportGrandTotal;
    const total = gt?.total ?? 0;
    const op = gt?.op ?? 0;
    const idle = gt?.idle ?? 0;
    const down = Math.max(0, total - op - idle);
    return {
      plant: byCat.get('Plant') ?? 0,
      machinery: byCat.get('Machinery') ?? 0,
      heavy_vehicle: byCat.get('Heavy Vehicle') ?? 0,
      light_vehicles: byCat.get('Light Vehicles & Bus') ?? 0,
      factory_equipment: byCat.get('Factory Equipment') ?? 0,
      auxiliary: byCat.get('Auxillary') ?? 0,
      total,
      op,
      idle,
      down,
    };
  }, [reportTableRows, reportGrandTotal, effectiveReportSlugs]);

  const handleLocationSort = (column: LocationSortBy) => {
    if (locationSortBy === column) {
      setLocationSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setLocationSortBy(column);
      setLocationSortOrder(column === 'location' ? 'asc' : 'desc');
    }
  };

  const handleExportExcel = () => {
    if (!stats) return;
    setExporting(true);
    exportStatsToExcel(stats.byCategory, stats.byStatus, stats.byLocation, stats.total);
    setExporting(false);
  };

  const handleExportPdf = async () => {
    if (!pdfRef.current) return;
    setExporting(true);
    await exportToPdf('equipment-dashboard-pdf', `ecwc-equipment-${new Date().toISOString().slice(0, 10)}.pdf`);
    setExporting(false);
  };

  const chartData =
    stats?.byCategory
      ?.filter((c) => EQUIPMENT_CATEGORIES.some((ec) => ec.dbCategory === c.category))
      .slice(0, 6)
      .map((c, i) => ({
        name: c.category,
        count: c.count,
        fill: COLORS[i % COLORS.length],
      })) ?? [];

  const pieData =
    stats?.byCategory?.slice(0, 6).map((c, i) => ({
      name: c.category,
      value: c.count,
      fill: COLORS[i % COLORS.length],
    })) ?? [];

  const STATUS_COLORS: Record<string, string> = {
    op: '#10b981',
    operational: '#10b981',
    idle: '#06b6d4',
    down: '#ef4444',
    repair: '#f59e0b',
    default: '#64748b',
  };
  const getStatusColor = (status: string | null | undefined) => {
    const s = String(status ?? '').toLowerCase();
    if (s.includes('op') || s.includes('operational')) return STATUS_COLORS.op;
    if (s.includes('idle')) return STATUS_COLORS.idle;
    if (s.includes('down')) return STATUS_COLORS.down;
    if (s.includes('repair')) return STATUS_COLORS.repair;
    return STATUS_COLORS.default;
  };

  const statusChartData =
    stats?.byStatus?.slice(0, 8).map((s) => ({
      name: s.status ?? 'Unknown',
      count: Number(s?.count ?? 0),
      fill: getStatusColor(s?.status),
    })) ?? [];

  /* Attractive 6-color palette for location chart (teal → blue → violet → rose → amber → emerald) */
  const LOCATION_CHART_COLORS = ['#0d9488', '#2563eb', '#7c3aed', '#e11d48', '#d97706', '#059669'];
  const locationChartData =
    report?.locationBreakdown
      ?.filter((l) => l.location !== 'Unassigned' && (l.location?.trim() ?? '') !== '')
      .sort((a, b) => (b.total ?? 0) - (a.total ?? 0))
      .slice(0, 6)
      .map((l, i) => ({
        name: (l.location ?? '').length > 18 ? (l.location ?? '').slice(0, 16) + '…' : l.location ?? '',
        fullName: l.location ?? '',
        count: l.total ?? 0,
        fill: LOCATION_CHART_COLORS[i % LOCATION_CHART_COLORS.length],
      })) ?? [];

  return (
    <Layout>
      <TooltipProvider>
        <div className="w-full overflow-x-hidden min-w-0">
          <div id="equipment-dashboard-pdf" ref={pdfRef} className="space-y-4 w-full min-w-0">
          {/* Row 1: Title + Fleet card in same row — card stretches full to right */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
          >
            {loading ? (
              <Skeleton className="h-40 min-w-0 rounded-lg w-full" />
            ) : (
              <Card className="min-w-0 w-full overflow-hidden rounded-xl border border-border/80 bg-gradient-to-br from-card via-card to-muted/20 shadow-lg">
                <CardContent className="p-4 sm:p-5">
                  {/* 1 row, 3 columns: cohesive neutral + primary accent */}
                  <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_2fr_minmax(0,1fr)] gap-3 sm:gap-4 items-stretch min-h-[130px] md:min-h-[180px]">
                    {/* Column 1: Project Sites — neutral, clickable → Overview */}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('overview');
                        setTimeout(() => overviewSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
                      }}
                      title="Go to Overview"
                      className="flex flex-col items-center justify-center rounded-xl border border-border bg-muted/30 dark:bg-muted/20 px-4 py-4 sm:py-5 min-w-0 hover:bg-muted/50 dark:hover:bg-muted/30 transition-colors cursor-pointer focus:outline-none focus:ring-0"
                    >
                      <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-muted-foreground">Project Sites</span>
                      <p className="text-2xl sm:text-3xl font-extrabold tabular-nums text-foreground mt-1">{totalProjectSites}</p>
                      <span className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">Active locations</span>
                    </button>

                    {/* Column 2: Total Fleet — primary accent only (count-up animation), clickable → All Assets */}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('all-assets');
                        setTimeout(() => allAssetsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
                      }}
                      title="Go to All Assets"
                      className="flex flex-col items-center justify-center rounded-2xl bg-primary/10 dark:bg-primary/15 border border-primary/20 px-5 py-6 sm:px-10 sm:py-8 min-w-0 shadow-inner ring-2 ring-primary/10 hover:bg-primary/15 dark:hover:bg-primary/20 transition-colors cursor-pointer focus:outline-none focus:ring-0"
                    >
                      <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">Total Fleet</span>
                      <p className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tabular-nums text-foreground mt-2 tracking-tight drop-shadow-sm">
                        {animatedTotal.toLocaleString()}
                      </p>
                      <span className="text-sm text-muted-foreground mt-1.5 font-medium">Equipment units</span>
                    </button>

                    {/* Column 3: 4 quadrants — row 1: OP, Idle | line | row 2: Avail, Down */}
                    <div className="grid grid-cols-2 gap-1.5 sm:gap-2 min-w-0">
                      <div className="rounded-lg border border-green-200 dark:border-green-800/50 bg-green-50/50 dark:bg-green-950/20 px-2.5 py-2 sm:py-2.5 flex flex-col justify-center text-center">
                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground">OP</span>
                        <span className="text-base sm:text-lg font-extrabold tabular-nums text-green-600 dark:text-green-500 mt-0.5">{totalOp}</span>
                        <span className="text-[10px] text-muted-foreground leading-tight mt-0.5">Operational</span>
                      </div>
                      <div className="rounded-lg border border-blue-200 dark:border-blue-800/50 bg-blue-50/50 dark:bg-blue-950/20 px-2.5 py-2 sm:py-2.5 flex flex-col justify-center text-center">
                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground">Idle</span>
                        <span className="text-base sm:text-lg font-extrabold tabular-nums text-blue-600 dark:text-blue-500 mt-0.5">{totalIdle}</span>
                        <span className="text-[10px] text-muted-foreground leading-tight mt-0.5">Standby</span>
                      </div>
                      {/* Line between first and second row — minimal space */}
                      <div className="col-span-2 border-t border-border/80 my-0 shrink-0" />
                      <div className="rounded-lg border border-border bg-destructive/5 dark:bg-destructive/10 px-2.5 py-2 sm:py-2.5 flex flex-col justify-center text-center">
                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground">Down</span>
                        <span className="text-base sm:text-lg font-extrabold tabular-nums text-destructive mt-0.5">{total ? Math.round((totalDown / total) * 100) : 0}%</span>
                        <span className="text-[10px] text-muted-foreground leading-tight mt-0.5">Out of service</span>
                      </div>
                      <div
                        ref={fleetDownTriggerRef}
                        className="relative rounded-lg border border-border bg-destructive/5 dark:bg-destructive/10 px-2.5 py-2 sm:py-2.5 flex flex-col justify-center text-center cursor-help"
                        onMouseEnter={() => {
                          if (fleetDownPopupCloseRef.current) {
                            clearTimeout(fleetDownPopupCloseRef.current);
                            fleetDownPopupCloseRef.current = null;
                          }
                          const el = fleetDownTriggerRef.current;
                          if (el) {
                            const rect = el.getBoundingClientRect();
                            setFleetDownPopup({
                              top: rect.top,
                              left: rect.left - 208,
                            });
                          }
                        }}
                        onMouseLeave={() => {
                          fleetDownPopupCloseRef.current = setTimeout(() => setFleetDownPopup(null), 150);
                        }}
                      >
                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground">Down</span>
                        <span className="text-base sm:text-lg font-extrabold tabular-nums text-destructive mt-1 underline decoration-dotted decoration-destructive/50 underline-offset-1">{totalDown}</span>
                        <span className="text-[10px] text-muted-foreground leading-tight mt-0.5">Out of service</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>

          {typeof document !== 'undefined' &&
            fleetDownPopup &&
            createPortal(
              <div
                className="fixed w-[200px] rounded-lg shadow-2xl border border-border bg-background overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150 z-[9999]"
                style={{
                  top: fleetDownPopup.top,
                  left: fleetDownPopup.left,
                }}
                onMouseEnter={() => {
                  if (fleetDownPopupCloseRef.current) {
                    clearTimeout(fleetDownPopupCloseRef.current);
                    fleetDownPopupCloseRef.current = null;
                  }
                  const el = fleetDownTriggerRef.current;
                  if (el) {
                    const rect = el.getBoundingClientRect();
                    setFleetDownPopup({ top: rect.top, left: rect.left - 208 });
                  }
                }}
                onMouseLeave={() => {
                  fleetDownPopupCloseRef.current = setTimeout(() => setFleetDownPopup(null), 150);
                }}
              >
                <div className="px-3 py-2 bg-destructive/10 border-b border-border font-semibold text-xs text-destructive">
                  Down breakdown (fleet)
                </div>
                <div className="p-2 space-y-1 max-h-44 overflow-y-auto">
                  {fleetDownBreakdown.length > 0 ? (
                    fleetDownBreakdown.map((d) => (
                      <div key={d.label} className="flex justify-between items-center gap-2 py-1 px-2 rounded text-xs hover:bg-muted/50">
                        <span className="text-foreground">{d.label}</span>
                        <span className="font-bold tabular-nums text-destructive">{d.count}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground py-2">No breakdown data</p>
                  )}
                </div>
              </div>,
              document.body
            )}

          {/* Row 2: Plant, Machinery, Heavy Vehicles - 3 cards per row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {loading ? (
              [...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 rounded-lg" />)
            ) : (
              EQUIPMENT_CATEGORIES.slice(0, 3).map((cat, i) => {
                const Icon = iconMap[cat.slug] ?? FileText;
                const s = getCategoryStats(statusSummary, cat.dbCategory);
                const pct = total ? Math.round((s.total / total) * 100) : 0;
                return (
                  <CategoryCard
                    key={cat.slug}
                    slug={cat.slug}
                    name={cat.name}
                    icon={Icon}
                    color={COLORS[i]}
                    stats={s}
                    pct={pct}
                    index={i}
                  />
                );
              })
            )}
          </div>

          {/* Row 3: Light Vehicles, Factory Equipment, Auxiliary - 3 cards per row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {loading ? (
              [...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 rounded-lg" />)
            ) : (
              EQUIPMENT_CATEGORIES.slice(3, 6).map((cat, i) => {
                const Icon = iconMap[cat.slug] ?? FileText;
                const s = getCategoryStats(statusSummary, cat.dbCategory);
                const pct = total ? Math.round((s.total / total) * 100) : 0;
                return (
                  <CategoryCard
                    key={cat.slug}
                    slug={cat.slug}
                    name={cat.name}
                    icon={Icon}
                    color={COLORS[i + 3]}
                    stats={s}
                    pct={pct}
                    index={i + 3}
                  />
                );
              })
            )}
          </div>

          {/* Tabs: Overview | Charts | Reports | All Assets — polished pill style */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3">
            <div className="flex justify-start">
              <TabsList className="inline-flex bg-muted/70 dark:bg-muted/40 p-1.5 rounded-2xl text-base shadow-inner border border-border/50">
                <TabsTrigger
                  value="overview"
                  className="rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 data-[state=active]:bg-[#16A34A] data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:scale-[1.02] hover:bg-muted"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="charts"
                  className="rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 data-[state=active]:bg-[#16A34A] data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:scale-[1.02] hover:bg-muted"
                >
                  Charts & Graphs
                </TabsTrigger>
                <TabsTrigger
                  value="reports"
                  className="rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 data-[state=active]:bg-[#16A34A] data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:scale-[1.02] hover:bg-muted"
                >
                  Report
                </TabsTrigger>
                <TabsTrigger
                  value="all-assets"
                  className="rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 data-[state=active]:bg-[#16A34A] data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:scale-[1.02] hover:bg-muted"
                >
                  All Assets
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="space-y-3" ref={overviewSectionRef}>
              <Card className="shadow-lg rounded-xl border border-border/80 overflow-hidden">
                <CardHeader className="py-3.5 bg-gradient-to-r from-emerald-50/80 to-green-50/60 dark:from-emerald-950/30 dark:to-green-950/20 border-b border-border/60">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Top Locations
                  </CardTitle>
                  <CardDescription>Assets by project location (12 visible, scrollable). Total split by Plant, Machinery, Heavy, Light, Factory, Auxiliary; then OP, Idle, Down.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {loading ? (
                    <div className="p-4"><Skeleton className="h-64 w-full" /></div>
                  ) : sortedLocationBreakdown.length ? (
                    <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
                      <table className="w-full text-xs border-collapse min-w-[720px]">
                        <thead>
                          <tr className="bg-green-600 text-white text-left text-[11px] font-semibold">
                            <th className="py-2 px-2 w-10 text-center sticky top-0 left-0 z-30 bg-green-600 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.15)]">No</th>
                            <th
                              className="py-2 px-2 whitespace-nowrap cursor-pointer hover:bg-green-700 select-none sticky top-0 z-30 bg-green-600 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.15)]"
                              style={{ left: '2.5rem' }}
                              onClick={() => handleLocationSort('location')}
                              title="Sort by location (A–Z)"
                            >
                              <span className="inline-flex items-center gap-0.5">
                                Location
                                <span className="inline-flex flex-col leading-none">
                                  <ChevronUp className={`w-3.5 h-3.5 -mb-0.5 ${locationSortBy === 'location' && locationSortOrder === 'asc' ? 'text-emerald-200 drop-shadow-sm' : 'text-white/50'}`} />
                                  <ChevronDown className={`w-3.5 h-3.5 -mt-0.5 ${locationSortBy === 'location' && locationSortOrder === 'desc' ? 'text-amber-200 drop-shadow-sm' : 'text-white/50'}`} />
                                </span>
                              </span>
                            </th>
                            <th
                              className="py-2 px-2 whitespace-nowrap cursor-pointer hover:bg-green-700 select-none sticky top-0 z-20 bg-green-600"
                              onClick={() => handleLocationSort('plant')}
                              title="Sort by Plant"
                            >
                              <span className="inline-flex items-center gap-0.5">
                                Plant
                                <span className="inline-flex flex-col leading-none">
                                  <ChevronUp className={`w-3.5 h-3.5 -mb-0.5 ${locationSortBy === 'plant' && locationSortOrder === 'asc' ? 'text-emerald-200 drop-shadow-sm' : 'text-white/50'}`} />
                                  <ChevronDown className={`w-3.5 h-3.5 -mt-0.5 ${locationSortBy === 'plant' && locationSortOrder === 'desc' ? 'text-amber-200 drop-shadow-sm' : 'text-white/50'}`} />
                                </span>
                              </span>
                            </th>
                            <th
                              className="py-2 px-2 whitespace-nowrap cursor-pointer hover:bg-green-700 select-none sticky top-0 z-20 bg-green-600"
                              onClick={() => handleLocationSort('machinery')}
                              title="Sort by Machinery"
                            >
                              <span className="inline-flex items-center gap-0.5">
                                Machinery
                                <span className="inline-flex flex-col leading-none">
                                  <ChevronUp className={`w-3.5 h-3.5 -mb-0.5 ${locationSortBy === 'machinery' && locationSortOrder === 'asc' ? 'text-emerald-200 drop-shadow-sm' : 'text-white/50'}`} />
                                  <ChevronDown className={`w-3.5 h-3.5 -mt-0.5 ${locationSortBy === 'machinery' && locationSortOrder === 'desc' ? 'text-amber-200 drop-shadow-sm' : 'text-white/50'}`} />
                                </span>
                              </span>
                            </th>
                            <th
                              className="py-2 px-2 whitespace-nowrap cursor-pointer hover:bg-green-700 select-none sticky top-0 z-20 bg-green-600"
                              onClick={() => handleLocationSort('heavy_vehicle')}
                              title="Sort by Heavy"
                            >
                              <span className="inline-flex items-center gap-0.5">
                                Heavy
                                <span className="inline-flex flex-col leading-none">
                                  <ChevronUp className={`w-3.5 h-3.5 -mb-0.5 ${locationSortBy === 'heavy_vehicle' && locationSortOrder === 'asc' ? 'text-emerald-200 drop-shadow-sm' : 'text-white/50'}`} />
                                  <ChevronDown className={`w-3.5 h-3.5 -mt-0.5 ${locationSortBy === 'heavy_vehicle' && locationSortOrder === 'desc' ? 'text-amber-200 drop-shadow-sm' : 'text-white/50'}`} />
                                </span>
                              </span>
                            </th>
                            <th
                              className="py-2 px-2 whitespace-nowrap cursor-pointer hover:bg-green-700 select-none sticky top-0 z-20 bg-green-600"
                              onClick={() => handleLocationSort('light_vehicles')}
                              title="Sort by Light"
                            >
                              <span className="inline-flex items-center gap-0.5">
                                Light
                                <span className="inline-flex flex-col leading-none">
                                  <ChevronUp className={`w-3.5 h-3.5 -mb-0.5 ${locationSortBy === 'light_vehicles' && locationSortOrder === 'asc' ? 'text-emerald-200 drop-shadow-sm' : 'text-white/50'}`} />
                                  <ChevronDown className={`w-3.5 h-3.5 -mt-0.5 ${locationSortBy === 'light_vehicles' && locationSortOrder === 'desc' ? 'text-amber-200 drop-shadow-sm' : 'text-white/50'}`} />
                                </span>
                              </span>
                            </th>
                            <th
                              className="py-2 px-2 whitespace-nowrap cursor-pointer hover:bg-green-700 select-none sticky top-0 z-20 bg-green-600"
                              onClick={() => handleLocationSort('factory_equipment')}
                              title="Sort by Factory"
                            >
                              <span className="inline-flex items-center gap-0.5">
                                Factory
                                <span className="inline-flex flex-col leading-none">
                                  <ChevronUp className={`w-3.5 h-3.5 -mb-0.5 ${locationSortBy === 'factory_equipment' && locationSortOrder === 'asc' ? 'text-emerald-200 drop-shadow-sm' : 'text-white/50'}`} />
                                  <ChevronDown className={`w-3.5 h-3.5 -mt-0.5 ${locationSortBy === 'factory_equipment' && locationSortOrder === 'desc' ? 'text-amber-200 drop-shadow-sm' : 'text-white/50'}`} />
                                </span>
                              </span>
                            </th>
                            <th
                              className="py-2 px-2 whitespace-nowrap cursor-pointer hover:bg-green-700 select-none sticky top-0 z-20 bg-green-600"
                              onClick={() => handleLocationSort('auxiliary')}
                              title="Sort by Auxiliary"
                            >
                              <span className="inline-flex items-center gap-0.5">
                                Auxiliary
                                <span className="inline-flex flex-col leading-none">
                                  <ChevronUp className={`w-3.5 h-3.5 -mb-0.5 ${locationSortBy === 'auxiliary' && locationSortOrder === 'asc' ? 'text-emerald-200 drop-shadow-sm' : 'text-white/50'}`} />
                                  <ChevronDown className={`w-3.5 h-3.5 -mt-0.5 ${locationSortBy === 'auxiliary' && locationSortOrder === 'desc' ? 'text-amber-200 drop-shadow-sm' : 'text-white/50'}`} />
                                </span>
                              </span>
                            </th>
                            <th
                              className="py-2 px-2 whitespace-nowrap cursor-pointer hover:bg-green-700 select-none sticky top-0 z-20 bg-green-600"
                              onClick={() => handleLocationSort('total')}
                              title="Sort by total"
                            >
                              <span className="inline-flex items-center gap-0.5">
                                Total
                                <span className="inline-flex flex-col leading-none">
                                  <ChevronUp className={`w-3.5 h-3.5 -mb-0.5 ${locationSortBy === 'total' && locationSortOrder === 'asc' ? 'text-emerald-200 drop-shadow-sm' : 'text-white/50'}`} />
                                  <ChevronDown className={`w-3.5 h-3.5 -mt-0.5 ${locationSortBy === 'total' && locationSortOrder === 'desc' ? 'text-amber-200 drop-shadow-sm' : 'text-white/50'}`} />
                                </span>
                              </span>
                            </th>
                            <th
                              className="py-2 px-2 whitespace-nowrap cursor-pointer hover:bg-green-700 select-none sticky top-0 z-20 bg-green-600"
                              onClick={() => handleLocationSort('op')}
                              title="Sort by OP"
                            >
                              <span className="inline-flex items-center gap-0.5">
                                OP
                                <span className="inline-flex flex-col leading-none">
                                  <ChevronUp className={`w-3.5 h-3.5 -mb-0.5 ${locationSortBy === 'op' && locationSortOrder === 'asc' ? 'text-emerald-200 drop-shadow-sm' : 'text-white/50'}`} />
                                  <ChevronDown className={`w-3.5 h-3.5 -mt-0.5 ${locationSortBy === 'op' && locationSortOrder === 'desc' ? 'text-amber-200 drop-shadow-sm' : 'text-white/50'}`} />
                                </span>
                              </span>
                            </th>
                            <th
                              className="py-2 px-2 whitespace-nowrap cursor-pointer hover:bg-green-700 select-none sticky top-0 z-20 bg-green-600"
                              onClick={() => handleLocationSort('idle')}
                              title="Sort by Idle"
                            >
                              <span className="inline-flex items-center gap-0.5">
                                Idle
                                <span className="inline-flex flex-col leading-none">
                                  <ChevronUp className={`w-3.5 h-3.5 -mb-0.5 ${locationSortBy === 'idle' && locationSortOrder === 'asc' ? 'text-emerald-200 drop-shadow-sm' : 'text-white/50'}`} />
                                  <ChevronDown className={`w-3.5 h-3.5 -mt-0.5 ${locationSortBy === 'idle' && locationSortOrder === 'desc' ? 'text-amber-200 drop-shadow-sm' : 'text-white/50'}`} />
                                </span>
                              </span>
                            </th>
                            <th
                              className="py-2 px-2 whitespace-nowrap cursor-pointer hover:bg-green-700 select-none sticky top-0 z-20 bg-green-600"
                              onClick={() => handleLocationSort('down')}
                              title="Sort by Down"
                            >
                              <span className="inline-flex items-center gap-0.5">
                                Down
                                <span className="inline-flex flex-col leading-none">
                                  <ChevronUp className={`w-3.5 h-3.5 -mb-0.5 ${locationSortBy === 'down' && locationSortOrder === 'asc' ? 'text-emerald-200 drop-shadow-sm' : 'text-white/50'}`} />
                                  <ChevronDown className={`w-3.5 h-3.5 -mt-0.5 ${locationSortBy === 'down' && locationSortOrder === 'desc' ? 'text-amber-200 drop-shadow-sm' : 'text-white/50'}`} />
                                </span>
                              </span>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedLocationBreakdown.map((row, i) => {
                            const pctTotal = total ? (row.total / total) * 100 : 0;
                            const pctOp = row.total ? (row.op / row.total) * 100 : 0;
                            const pctIdle = row.total ? (row.idle / row.total) * 100 : 0;
                            const pctDown = row.total ? (row.down / row.total) * 100 : 0;
                            const plant = row.plant ?? 0;
                            const machinery = row.machinery ?? 0;
                            const heavy_vehicle = row.heavy_vehicle ?? 0;
                            const light_vehicles = row.light_vehicles ?? 0;
                            const factory_equipment = row.factory_equipment ?? 0;
                            const auxiliary = row.auxiliary ?? 0;
                            return (
                              <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                                <td className="py-1.5 px-2 text-center tabular-nums text-muted-foreground sticky left-0 bg-background z-10 w-10">{i + 1}</td>
                                <td className="py-1.5 px-2 font-medium truncate max-w-[140px] sticky z-10 bg-background" style={{ left: '2.5rem' }} title={row.location}>{row.location}</td>
                                <td className="py-1.5 px-2 tabular-nums">{plant}</td>
                                <td className="py-1.5 px-2 tabular-nums">{machinery}</td>
                                <td className="py-1.5 px-2 tabular-nums">{heavy_vehicle}</td>
                                <td className="py-1.5 px-2 tabular-nums">{light_vehicles}</td>
                                <td className="py-1.5 px-2 tabular-nums">{factory_equipment}</td>
                                <td className="py-1.5 px-2 tabular-nums">{auxiliary}</td>
                                <td className="py-1.5 px-2">
                                  <span className="tabular-nums font-medium">{row.total.toLocaleString()}</span>
                                  <span className="text-muted-foreground ml-0.5">({pctTotal.toFixed(1)}%)</span>
                                </td>
                                <td className="py-1.5 px-2">
                                  <span className="tabular-nums font-medium text-green-600 dark:text-green-400">{row.op.toLocaleString()}</span>
                                  <span className="text-muted-foreground ml-0.5">({pctOp.toFixed(1)}%)</span>
                                </td>
                                <td className="py-1.5 px-2">
                                  <span className="tabular-nums font-medium text-blue-600 dark:text-blue-400">{row.idle.toLocaleString()}</span>
                                  <span className="text-muted-foreground ml-0.5">({pctIdle.toFixed(1)}%)</span>
                                </td>
                                <td className="py-1.5 px-2">
                                  <span className="tabular-nums font-medium text-red-600 dark:text-red-400">{row.down.toLocaleString()}</span>
                                  <span className="text-muted-foreground ml-0.5">({pctDown.toFixed(1)}%)</span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          {(() => {
                            const sum = topLocationsSummary ?? sortedLocationBreakdown.reduce(
                              (acc, row) => ({
                                total: acc.total + (row.total ?? 0),
                                plant: acc.plant + (row.plant ?? 0),
                                machinery: acc.machinery + (row.machinery ?? 0),
                                heavy_vehicle: acc.heavy_vehicle + (row.heavy_vehicle ?? 0),
                                light_vehicles: acc.light_vehicles + (row.light_vehicles ?? 0),
                                factory_equipment: acc.factory_equipment + (row.factory_equipment ?? 0),
                                auxiliary: acc.auxiliary + (row.auxiliary ?? 0),
                                op: acc.op + (row.op ?? 0),
                                idle: acc.idle + (row.idle ?? 0),
                                down: acc.down + (row.down ?? 0),
                              }),
                              { total: 0, plant: 0, machinery: 0, heavy_vehicle: 0, light_vehicles: 0, factory_equipment: 0, auxiliary: 0, op: 0, idle: 0, down: 0 }
                            );
                            const pctTotal = total ? (sum.total / total) * 100 : 0;
                            const pctOp = sum.total ? (sum.op / sum.total) * 100 : 0;
                            const pctIdle = sum.total ? (sum.idle / sum.total) * 100 : 0;
                            const pctDown = sum.total ? (sum.down / sum.total) * 100 : 0;
                            return (
                              <tr className="bg-green-100/50 dark:bg-green-900/20 font-semibold border-t-2 border-green-600/30">
                                <td className="py-2 px-2 sticky left-0 bg-green-100/50 dark:bg-green-900/20 z-10 w-10 text-center">—</td>
                                <td className="py-2 px-2 sticky bg-green-100/50 dark:bg-green-900/20 z-10" style={{ left: '2.5rem' }}>Total / Summary</td>
                                <td className="py-2 px-2 tabular-nums">{sum.plant.toLocaleString()}</td>
                                <td className="py-2 px-2 tabular-nums">{sum.machinery.toLocaleString()}</td>
                                <td className="py-2 px-2 tabular-nums">{sum.heavy_vehicle.toLocaleString()}</td>
                                <td className="py-2 px-2 tabular-nums">{sum.light_vehicles.toLocaleString()}</td>
                                <td className="py-2 px-2 tabular-nums">{sum.factory_equipment.toLocaleString()}</td>
                                <td className="py-2 px-2 tabular-nums">{sum.auxiliary.toLocaleString()}</td>
                                <td className="py-2 px-2">
                                  <span className="tabular-nums">{sum.total.toLocaleString()}</span>
                                  {total ? (
                                    <span className="text-muted-foreground ml-0.5">({pctTotal.toFixed(1)}%)</span>
                                  ) : null}
                                </td>
                                <td className="py-2 px-2 tabular-nums">
                                  <span className="text-green-700 dark:text-green-400 font-bold">{sum.op.toLocaleString()}</span>
                                  <span className="text-muted-foreground ml-0.5">({pctOp.toFixed(1)}%)</span>
                                </td>
                                <td className="py-2 px-2 tabular-nums">
                                  <span className="text-blue-700 dark:text-blue-400 font-bold">{sum.idle.toLocaleString()}</span>
                                  <span className="text-muted-foreground ml-0.5">({pctIdle.toFixed(1)}%)</span>
                                </td>
                                <td className="py-2 px-2 tabular-nums">
                                  <span className="text-red-700 dark:text-red-400 font-bold">{sum.down.toLocaleString()}</span>
                                  <span className="text-muted-foreground ml-0.5">({pctDown.toFixed(1)}%)</span>
                                </td>
                              </tr>
                            );
                          })()}
                        </tfoot>
                      </table>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8 px-4">No location data</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="charts" className="space-y-4 overflow-hidden">
              {/* Column 1: Bar charts | Column 2: Pie & Donuts — no duplicate data */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-w-0"
              >
                {/* ——— COLUMN 1: Category Distribution + Project Locations ——— */}
                <div className="space-y-4 min-w-0">
                  {/* Category Distribution — Donut (moved from column 2) */}
                  <Card className="shadow-xl overflow-hidden rounded-xl border-l-4 border-l-teal-500 border border-teal-200/50 dark:border-teal-800/40 bg-gradient-to-br from-emerald-50/70 to-teal-50/50 dark:from-emerald-950/30 dark:to-teal-950/20 min-w-0 hover:shadow-2xl transition-shadow duration-300">
                    <CardHeader className="py-3.5 border-b border-teal-200/50 dark:border-teal-800/40 bg-gradient-to-r from-teal-50/80 to-emerald-50/60 dark:from-teal-950/40 dark:to-emerald-950/30">
                      <CardTitle className="text-sm font-semibold text-emerald-900 dark:text-emerald-100 flex items-center gap-2">
                        <PieChartIcon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                        Category Distribution
                      </CardTitle>
                      <CardDescription>Share of total assets by category</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3 min-w-0 overflow-hidden">
                      <div className="flex gap-4 h-[260px] min-w-0 w-full">
                        {loading ? (
                          <Skeleton className="flex-1 h-full" />
                        ) : pieData.length ? (
                          <>
                            <div className="flex-1 min-w-0" style={{ filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.12))' }}>
                              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                                  <defs>
                                    {pieData.map((d, i) => (
                                      <linearGradient key={i} id={`donut-grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={d.fill} stopOpacity={1} />
                                        <stop offset="50%" stopColor={d.fill} stopOpacity={0.85} />
                                        <stop offset="100%" stopColor={d.fill} stopOpacity={0.65} />
                                      </linearGradient>
                                    ))}
                                  </defs>
                                  <Pie
                                    data={pieData.map((d, i) => ({ ...d, fill: `url(#donut-grad-${i})` }))}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={48}
                                    outerRadius={78}
                                    paddingAngle={4}
                                    dataKey="value"
                                    nameKey="name"
                                  >
                                    {pieData.map((_, i) => (
                                      <Cell key={i} fill={`url(#donut-grad-${i})`} stroke="rgba(255,255,255,0.9)" strokeWidth={2} />
                                    ))}
                                  </Pie>
                                  <RechartsTooltip
                                    content={(props) => (
                                      <ChartTooltip
                                        {...props}
                                        render={(value, name) => {
                                          const pct = total && value > 0 ? ((value / total) * 100).toFixed(1) : '0';
                                          return `${name}: ${value.toLocaleString()} (${pct}%)`;
                                        }}
                                      />
                                    )}
                                  />
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                            <div className="flex flex-col justify-center gap-1.5 w-[200px] shrink-0 border-l border-border/80 pl-3 overflow-y-auto">
                              {pieData.map((d, i) => {
                                const pct = total && d.value > 0 ? ((d.value / total) * 100).toFixed(1) : '0';
                                return (
                                  <div key={i} className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-2 text-xs min-w-0">
                                    <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: d.fill }} />
                                    <span className="font-medium text-foreground truncate">{d.name}</span>
                                    <span className="tabular-nums font-semibold text-foreground">{d.value.toLocaleString()}</span>
                                    <span className="tabular-nums text-muted-foreground shrink-0">({pct}%)</span>
                                  </div>
                                );
                              })}
                            </div>
                          </>
                        ) : (
                          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">No data</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                {/* Top Project Locations - Horizontal Bar (spans 2 columns, top 6) — attractive colors & graph */}
                <Card className="shadow-xl overflow-hidden rounded-xl border-l-4 border-l-violet-500 border border-violet-200/50 dark:border-violet-800/40 bg-gradient-to-br from-violet-50/70 via-purple-50/40 to-fuchsia-50/30 dark:from-violet-950/30 dark:via-purple-950/20 dark:to-fuchsia-950/10 min-w-0 lg:col-span-2 hover:shadow-2xl transition-shadow duration-300">
                  <CardHeader className="py-3.5 border-b border-violet-200/50 dark:border-violet-800/40 bg-gradient-to-r from-violet-100/80 to-purple-100/60 dark:from-violet-900/50 dark:to-purple-900/40">
                    <CardTitle className="text-sm font-semibold text-violet-900 dark:text-violet-100 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                      Asset Count by Project Location
                    </CardTitle>
                    <CardDescription>Top 6 sites by number of deployed assets</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-3 min-w-0 overflow-hidden">
                    <div className="h-[260px] min-w-0 w-full flex flex-col">
                      {loading ? (
                        <Skeleton className="flex-1 min-h-0 w-full" />
                      ) : locationChartData.length ? (
                        <>
                          <div className="flex-1 min-h-0 w-full rounded-lg bg-white/50 dark:bg-black/10 p-2 ring-1 ring-violet-100/60 dark:ring-violet-500/20">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                              <BarChart data={locationChartData} layout="vertical" margin={{ top: 12, right: 48, left: 8, bottom: 12 }}>
                                <defs>
                                  {locationChartData.map((_, i) => {
                                    const c = locationChartData[i]?.fill ?? LOCATION_CHART_COLORS[i % LOCATION_CHART_COLORS.length];
                                    return (
                                      <linearGradient key={i} id={`loc-bar-grad-${i}`} x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor={c} stopOpacity={1} />
                                        <stop offset="50%" stopColor={c} stopOpacity={0.85} />
                                        <stop offset="100%" stopColor={c} stopOpacity={0.6} />
                                      </linearGradient>
                                    );
                                  })}
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,92,246,0.18)" horizontal={false} vertical={true} />
                                <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }} tickLine={false} tickFormatter={(v) => Number(v).toLocaleString()} />
                                <YAxis type="category" dataKey="name" width={0} tick={false} axisLine={false} tickLine={false} />
                                <RechartsTooltip
                                  content={(p) => (
                                    <ChartTooltip
                                      {...p}
                                      render={(value, _n, payload) => `${(payload?.fullName as string) ?? ''}: ${value.toLocaleString()} assets`}
                                    />
                                  )}
                                />
                                <Bar dataKey="count" radius={[0, 10, 10, 0]} maxBarSize={36}>
                                  {locationChartData.map((entry, i) => (
                                    <Cell key={entry.name ?? i} fill={`url(#loc-bar-grad-${i})`} stroke="rgba(255,255,255,0.5)" strokeWidth={1.5} />
                                  ))}
                                  <LabelList dataKey="count" position="right" formatter={(v: unknown) => Number(v ?? 0).toLocaleString()} style={{ fontSize: 11, fontWeight: 700 }} />
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="shrink-0 border-t border-violet-200/50 dark:border-violet-800/40 pt-2 mt-1">
                            <div className="grid grid-cols-3 gap-x-3 gap-y-1">
                              {locationChartData.map((entry, i) => (
                                <div key={i} className="flex items-center gap-1.5 text-xs min-w-0" title={entry.fullName}>
                                  <span className="w-3 h-3 rounded-md shrink-0 shadow-sm" style={{ backgroundColor: entry.fill ?? LOCATION_CHART_COLORS[i % LOCATION_CHART_COLORS.length] }} />
                                  <span className="text-foreground/90 truncate font-medium">{entry.fullName}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">No location data</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                </div>

                {/* ——— COLUMN 2: Pie & Donuts (3D style, good colors) ——— */}
                <div className="space-y-4 min-w-0">
                  {/* 1. Fleet Status — Pie (OP, Idle, Down) */}
                  <Card className="shadow-lg overflow-hidden border-0 bg-gradient-to-br from-primary/5 via-card to-emerald-50/30 dark:from-primary/10 dark:to-emerald-950/20 min-w-0">
                    <CardHeader className="py-3 border-b bg-primary/5 dark:bg-primary/10">
                      <CardTitle className="text-sm font-semibold text-foreground">Fleet Status</CardTitle>
                      <CardDescription>OP, Idle &amp; Down</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3 min-w-0 overflow-hidden">
                      <div className="flex gap-4 h-[260px] min-w-0 w-full">
                        {loading ? (
                          <Skeleton className="flex-1 h-full" />
                        ) : total > 0 ? (
                          <>
                            <div className="flex-1 min-w-0" style={{ filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.15))' }}>
                              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                                  <defs>
                                    <linearGradient id="status-pie-op" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="0%" stopColor="#22c55e" stopOpacity={1} />
                                      <stop offset="50%" stopColor="#16a34a" stopOpacity={1} />
                                      <stop offset="100%" stopColor="#15803d" stopOpacity={0.9} />
                                    </linearGradient>
                                    <linearGradient id="status-pie-idle" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="0%" stopColor="#94a3b8" stopOpacity={1} />
                                      <stop offset="50%" stopColor="#64748b" stopOpacity={1} />
                                      <stop offset="100%" stopColor="#475569" stopOpacity={0.9} />
                                    </linearGradient>
                                    <linearGradient id="status-pie-down" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="0%" stopColor="#f87171" stopOpacity={1} />
                                      <stop offset="50%" stopColor="#dc2626" stopOpacity={1} />
                                      <stop offset="100%" stopColor="#b91c1c" stopOpacity={0.9} />
                                    </linearGradient>
                                  </defs>
                                  <Pie
                                    data={[
                                      { name: 'Operational', value: totalOp, fill: 'url(#status-pie-op)' },
                                      { name: 'Idle', value: totalIdle, fill: 'url(#status-pie-idle)' },
                                      { name: 'Down', value: totalDown, fill: 'url(#status-pie-down)' },
                                    ].filter((d) => d.value > 0)}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={88}
                                    paddingAngle={5}
                                    dataKey="value"
                                    nameKey="name"
                                  >
                                    {[
                                      { name: 'Operational', value: totalOp, fill: 'url(#status-pie-op)' },
                                      { name: 'Idle', value: totalIdle, fill: 'url(#status-pie-idle)' },
                                      { name: 'Down', value: totalDown, fill: 'url(#status-pie-down)' },
                                    ]
                                      .filter((d) => d.value > 0)
                                      .map((d, i) => (
                                        <Cell key={i} fill={d.fill} stroke="rgba(255,255,255,0.95)" strokeWidth={2.5} />
                                      ))}
                                  </Pie>
                                  <RechartsTooltip
                                    content={(props) => (
                                      <ChartTooltip
                                        {...props}
                                        render={(value, name) => {
                                          const pct = total ? ((value / total) * 100).toFixed(1) : '0';
                                          return `${name}: ${value.toLocaleString()} (${pct}%)`;
                                        }}
                                      />
                                    )}
                                  />
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                            <div className="flex flex-col justify-center gap-2 w-[180px] shrink-0 border-l border-border/80 pl-3">
                              {[
                                { name: 'Operational', value: totalOp, color: '#16a34a' },
                                { name: 'Idle', value: totalIdle, color: '#64748b' },
                                { name: 'Down', value: totalDown, color: '#dc2626' },
                              ]
                                .filter((d) => d.value > 0)
                                .map((d, i) => {
                                  const pct = total ? ((d.value / total) * 100).toFixed(1) : '0';
                                  return (
                                    <div key={i} className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-2 text-xs">
                                      <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: d.color }} />
                                      <span className="font-medium text-foreground truncate">{d.name}</span>
                                      <span className="tabular-nums font-semibold text-foreground">{d.value.toLocaleString()}</span>
                                      <span className="tabular-nums text-muted-foreground">({pct}%)</span>
                                    </div>
                                  );
                                })}
                            </div>
                          </>
                        ) : (
                          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">No data</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* 2. Down in Detail — Donut */}
                  <Card className="shadow-xl overflow-hidden rounded-xl border-l-4 border-l-rose-500 border border-rose-200/50 dark:border-rose-800/40 bg-gradient-to-br from-destructive/5 via-card to-red-50/30 dark:from-destructive/10 dark:to-red-950/25 min-w-0 hover:shadow-2xl transition-shadow duration-300">
                    <CardHeader className="py-3.5 border-b border-rose-200/50 dark:border-rose-800/40 bg-gradient-to-r from-rose-50/80 to-red-50/60 dark:from-rose-950/40 dark:to-red-950/30">
                      <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <PieChartIcon className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                        Down in Detail
                      </CardTitle>
                      <CardDescription>Out-of-service breakdown</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3 min-w-0 overflow-hidden">
                      <div className="flex gap-4 h-[260px] min-w-0 w-full">
                        {loading ? (
                          <Skeleton className="flex-1 h-full" />
                        ) : fleetDownBreakdown.length > 0 ? (
                          <>
                            <div className="flex-1 min-w-0" style={{ filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.12))' }}>
                              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                                  <defs>
                                    {fleetDownBreakdown.slice(0, 10).map((_, i) => {
                                      const base = [
                                        { h: 0, l: [55, 42, 32] },
                                        { h: 25, l: [52, 40, 30] },
                                        { h: 350, l: [50, 38, 28] },
                                        { h: 15, l: [48, 36, 26] },
                                        { h: 330, l: [46, 34, 24] },
                                        { h: 340, l: [44, 32, 22] },
                                        { h: 320, l: [42, 30, 20] },
                                        { h: 310, l: [40, 28, 18] },
                                        { h: 5, l: [38, 26, 16] },
                                        { h: 355, l: [36, 24, 14] },
                                      ][i % 10];
                                      return (
                                        <linearGradient key={i} id={`down-donut-grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="0%" stopColor={`hsl(${base.h}, 75%, ${base.l[0]}%)`} stopOpacity={1} />
                                          <stop offset="50%" stopColor={`hsl(${base.h}, 70%, ${base.l[1]}%)`} stopOpacity={1} />
                                          <stop offset="100%" stopColor={`hsl(${base.h}, 65%, ${base.l[2]}%)`} stopOpacity={0.95} />
                                        </linearGradient>
                                      );
                                    })}
                                  </defs>
                                  <Pie
                                    data={fleetDownBreakdown.map((d, i) => ({
                                      name: d.label,
                                      value: d.count,
                                      fill: `url(#down-donut-grad-${i})`,
                                    }))}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={80}
                                    paddingAngle={4}
                                    dataKey="value"
                                    nameKey="name"
                                  >
                                    {fleetDownBreakdown.map((_, i) => (
                                      <Cell key={i} fill={`url(#down-donut-grad-${i})`} stroke="rgba(255,255,255,0.9)" strokeWidth={2} />
                                    ))}
                                  </Pie>
                                  <RechartsTooltip
                                    content={(props) => {
                                      const sum = fleetDownBreakdown.reduce((a, b) => a + b.count, 0);
                                      return (
                                        <ChartTooltip
                                          {...props}
                                          render={(value, name) => {
                                            const pct = sum ? ((value / sum) * 100).toFixed(1) : '0';
                                            return `${name}: ${value.toLocaleString()} (${pct}%)`;
                                          }}
                                        />
                                      );
                                    }}
                                  />
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                            <div className="flex flex-col justify-center gap-1.5 w-[200px] shrink-0 border-l border-border/80 pl-3 overflow-y-auto">
                              {fleetDownBreakdown.map((d, i) => {
                                const sum = fleetDownBreakdown.reduce((a, b) => a + b.count, 0);
                                const pct = sum ? ((d.count / sum) * 100).toFixed(1) : '0';
                                const base = [
                                  { h: 0, l: 42 }, { h: 25, l: 40 }, { h: 350, l: 38 }, { h: 15, l: 36 },
                                  { h: 330, l: 34 }, { h: 340, l: 32 }, { h: 320, l: 30 }, { h: 310, l: 28 },
                                  { h: 5, l: 26 }, { h: 355, l: 24 },
                                ][i % 10];
                                const color = `hsl(${base.h}, 70%, ${base.l}%)`;
                                return (
                                  <div key={i} className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-2 text-xs min-w-0">
                                    <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: color }} />
                                    <span className="font-medium text-foreground truncate">{d.label}</span>
                                    <span className="tabular-nums font-semibold text-foreground">{d.count.toLocaleString()}</span>
                                    <span className="tabular-nums text-muted-foreground shrink-0">({pct}%)</span>
                                  </div>
                                );
                              })}
                            </div>
                          </>
                        ) : (
                          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">No down breakdown data</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="reports" className="space-y-3">
              {/* Report scope: click button = view only that report; check 2+ boxes = merged report. */}
              <Card className="border border-border/80 bg-muted/20 dark:bg-muted/10">
                <CardContent className="p-4 space-y-2">
                  <p className="text-sm font-semibold text-foreground">Report scope</p>
                  <p className="text-xs text-muted-foreground">Click a button to view only that report. Check 2 or more boxes to see a merged report.</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1">
                    <button
                      type="button"
                      onClick={() => { setPrimaryReportScope('overall'); setCombinedCheckboxes([]); }}
                      className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                        primaryReportScope === 'overall' && !isCombinedView
                          ? 'bg-[#16A34A] text-white hover:bg-[#15803D] shadow-sm'
                          : 'bg-background border border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      Overall
                    </button>
                    {EQUIPMENT_CATEGORIES.map((cat) => {
                      const checked = combinedCheckboxes.includes(cat.slug);
                      const isSingleView = !isCombinedView && primaryReportScope === cat.slug;
                      return (
                        <div
                          key={cat.slug}
                          className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 ${
                            isSingleView
                              ? 'bg-[#16A34A] text-white border-[#16A34A]'
                              : checked
                                ? 'bg-[#16A34A]/10 border-[#16A34A]/50'
                                : 'bg-background border-border'
                          }`}
                        >
                          <Checkbox
                            checked={checked}
                            onChange={(e) => {
                              e.stopPropagation();
                              const next = e.target.checked
                                ? [...combinedCheckboxes, cat.slug]
                                : combinedCheckboxes.filter((s) => s !== cat.slug);
                              setCombinedCheckboxes(next);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className={isSingleView ? 'border-white data-[state=checked]:bg-white data-[state=checked]:text-[#16A34A]' : ''}
                          />
                          <button
                            type="button"
                            onClick={() => { setPrimaryReportScope(cat.slug); setCombinedCheckboxes([]); }}
                            className={`text-xs font-medium text-left transition-colors hover:underline focus:outline-none focus:underline ${
                              isSingleView ? 'text-white' : 'text-foreground hover:text-[#16A34A]'
                            }`}
                          >
                            {cat.name}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  {combinedCheckboxes.length === 1 && (
                    <p className="text-xs text-amber-600 dark:text-amber-400">Check 2 or more to merge.</p>
                  )}
                </CardContent>
              </Card>
              <Card className="shadow-lg overflow-hidden">
                <CardHeader className="bg-green-50/50 dark:bg-green-950/20 border-b py-3">
                  <CardTitle className="text-sm">
                    {effectiveReportSlugs.length === 0 || effectiveReportSlugs.includes('overall')
                      ? 'Overall Equipment Status Summary'
                      : effectiveReportSlugs.length === 1
                        ? `${EQUIPMENT_CATEGORIES.find((c) => c.slug === effectiveReportSlugs[0])?.name ?? effectiveReportSlugs[0]} Status Summary`
                        : `Combined: ${effectiveReportSlugs.map((s) => EQUIPMENT_CATEGORIES.find((c) => c.slug === s)?.name ?? s).join(' + ')}`}
                  </CardTitle>
                  <CardDescription>
                    Equipment counts by type and status (Op, Idle, UR, Down, HR, etc.)
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {loading && !statusSummaryReport ? (
                    <div className="p-8">
                      <Skeleton className="h-64 w-full" />
                    </div>
                  ) : !reportTableRows.length ? (
                    <p className="text-muted-foreground text-center py-12">No data</p>
                  ) : (
                    <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-5rem)] custom-scrollbar">
                      <table className="w-full text-xs">
                        <thead className="sticky top-0 z-10 bg-green-600 shadow-[0_2px_0_0_rgba(0,0,0,0.1)]">
                          <tr className="bg-green-600 text-white">
                            {(['no', 'category', 'description', 'op', 'idle', 'ur', 'down', 'hr', 'ui', 'wi', 'uc', 'rfd', 'afd', 'accident', 'total'] as const).map((key) => {
                              if (key === 'category' && effectiveReportSlugs.length <= 1) return null;
                              const labels: Record<string, string> = {
                                no: 'No.',
                                category: 'Category',
                                description: effectiveReportSlugs.length === 0 || effectiveReportSlugs.includes('overall') ? 'Category' : 'Description',
                                op: 'Op', idle: 'Idle', ur: 'UR', down: 'Down', hr: 'HR', ui: 'UI', wi: 'WI', uc: 'UC', rfd: 'RFD', afd: 'AFD', accident: 'Accident', total: 'Total',
                              };
                              const align = ['no', 'category', 'description'].includes(key) ? 'text-left' : 'text-center';
                              const isActive = reportTableSortBy === key;
                              const handleClick = () => {
                                setReportTableSortBy(key);
                                setReportTableSortOrder(isActive && reportTableSortOrder === 'desc' ? 'asc' : 'desc');
                              };
                              return (
                                <th
                                  key={key}
                                  className={`px-2 py-2 ${align} font-semibold cursor-pointer select-none hover:bg-green-700 transition-colors bg-green-600`}
                                  onClick={handleClick}
                                >
                                  <span className="inline-flex items-center gap-0.5">
                                    {labels[key]}
                                    {isActive ? (
                                      <span className="text-white/90">{reportTableSortOrder === 'asc' ? ' ↑' : ' ↓'}</span>
                                    ) : (
                                      <span className="text-white/50 text-[10px]">↕</span>
                                    )}
                                  </span>
                                </th>
                              );
                            })}
                          </tr>
                        </thead>
                        <tbody>
                          {reportTableRows.map((row) => (
                            <tr
                              key={`${row.category}-${row.description}`}
                              className={`border-b border-border/50 hover:opacity-90 ${effectiveReportSlugs.length > 1 ? reportRowSectionClass(row.category) : 'hover:bg-muted/30'}`}
                            >
                              <td className="px-2 py-1.5 font-medium">{row.no}</td>
                              {effectiveReportSlugs.length > 1 && (
                                <td className="px-2 py-1.5 font-medium text-muted-foreground">{row.category}</td>
                              )}
                              <td className="px-2 py-1.5 font-medium">{row.description}</td>
                              <td className="px-2 py-1.5 text-center tabular-nums">{row.op || '-'}</td>
                              <td className="px-2 py-1.5 text-center tabular-nums">{row.idle || '-'}</td>
                              <td className="px-2 py-1.5 text-center tabular-nums">{row.ur || '-'}</td>
                              <td className="px-2 py-1.5 text-center tabular-nums">{row.down || '-'}</td>
                              <td className="px-2 py-1.5 text-center tabular-nums">{row.hr || '-'}</td>
                              <td className="px-2 py-1.5 text-center tabular-nums">{row.ui || '-'}</td>
                              <td className="px-2 py-1.5 text-center tabular-nums">{row.wi || '-'}</td>
                              <td className="px-2 py-1.5 text-center tabular-nums">{row.uc || '-'}</td>
                              <td className="px-2 py-1.5 text-center tabular-nums">{row.rfd || '-'}</td>
                              <td className="px-2 py-1.5 text-center tabular-nums">{row.afd || '-'}</td>
                              <td className="px-2 py-1.5 text-center tabular-nums">{row.accident || '-'}</td>
                              <td className="px-2 py-1.5 text-center font-semibold tabular-nums">{row.total}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-green-100/50 dark:bg-green-900/20 font-semibold text-xs">
                            <td className="px-2 py-2" colSpan={effectiveReportSlugs.length > 1 ? 3 : 2}>G/Total</td>
                            <td className="px-2 py-2 text-center tabular-nums">{reportGrandTotal?.op ?? '-'}</td>
                            <td className="px-2 py-2 text-center tabular-nums">{reportGrandTotal?.idle ?? '-'}</td>
                            <td className="px-2 py-2 text-center tabular-nums">{reportGrandTotal?.ur ?? '-'}</td>
                            <td className="px-2 py-2 text-center tabular-nums">{reportGrandTotal?.down ?? '-'}</td>
                            <td className="px-2 py-2 text-center tabular-nums">{reportGrandTotal?.hr ?? '-'}</td>
                            <td className="px-2 py-2 text-center tabular-nums">{reportGrandTotal?.ui ?? '-'}</td>
                            <td className="px-2 py-2 text-center tabular-nums">{reportGrandTotal?.wi ?? '-'}</td>
                            <td className="px-2 py-2 text-center tabular-nums">{reportGrandTotal?.uc ?? '-'}</td>
                            <td className="px-2 py-2 text-center tabular-nums">{reportGrandTotal?.rfd ?? '-'}</td>
                            <td className="px-2 py-2 text-center tabular-nums">{reportGrandTotal?.afd ?? '-'}</td>
                            <td className="px-2 py-2 text-center tabular-nums">{reportGrandTotal?.accident ?? '-'}</td>
                            <td className="px-2 py-2 text-center tabular-nums">{reportGrandTotal?.total ?? '-'}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="all-assets" className="mt-4 min-w-0 max-w-full overflow-visible" ref={allAssetsSectionRef}>
              <div className="min-w-0 max-w-full overflow-x-auto custom-scrollbar -mx-1 px-1">
                <EquipmentDataView
                  categoryName="All Assets"
                  useInfiniteScroll
                />
              </div>
            </TabsContent>
          </Tabs>
          </div>
        </div>
      </TooltipProvider>
    </Layout>
  );
}
