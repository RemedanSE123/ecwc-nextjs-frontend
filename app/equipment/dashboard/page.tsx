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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
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
  Legend,
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
  Drill,
  Factory,
} from 'lucide-react';
import { motion } from 'framer-motion';

/* Cohesive palette: slate/primary family so colors work together */
const COLORS = ['#475569', '#64748b', '#0f766e', '#0369a1', '#1e40af', '#4f46e5'];

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
    <div className="rounded-lg border border-border bg-background px-3 py-2 shadow-lg text-xs font-medium text-foreground">
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
  const availability = stats.total ? Math.round((stats.op / stats.total) * 100) : 0;
  const card = (
    <Link href={`/equipment/${slug}`} className="block">
      <Card
        className="overflow-visible border border-border/80 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 group relative bg-card rounded-lg"
        style={{ borderLeftWidth: '3px', borderLeftColor: color }}
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
            {/* Column 2: OP, Idle, Availability, Down — unified palette */}
            <div className="flex flex-col justify-center gap-1 p-3">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 opacity-80" />
                <span className="text-muted-foreground text-[11px]">OP:</span>
                <span className="font-semibold text-primary tabular-nums">{stats.op}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 shrink-0" />
                <span className="text-muted-foreground text-[11px]">Idle:</span>
                <span className="font-semibold text-muted-foreground tabular-nums">{stats.idle}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 opacity-80" />
                <span className="text-muted-foreground text-[11px]">Availability:</span>
                <span className="font-semibold text-primary tabular-nums">{availability}%</span>
              </div>
              <div
                className="relative z-[100] flex items-center gap-1.5 text-xs w-fit"
                onMouseEnter={() => setShowDownPopup(true)}
                onMouseLeave={() => setShowDownPopup(false)}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-destructive/80 shrink-0" />
                <span className="text-muted-foreground text-[11px]">Down:</span>
                <span className="font-semibold text-destructive tabular-nums cursor-help underline decoration-dotted decoration-destructive/50 underline-offset-1">
                  {stats.down}
                </span>
                {showDownPopup && (
                  <div
                    className="absolute z-[200] right-0 bottom-full mb-1.5 w-[200px] rounded-lg shadow-2xl border border-border bg-background overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150 pointer-events-auto"
                    style={{ isolation: 'isolate' }}
                    onMouseEnter={() => setShowDownPopup(true)}
                    onMouseLeave={() => setShowDownPopup(false)}
                  >
                    <div className="px-3 py-2 bg-destructive/10 border-b border-border font-semibold text-xs text-destructive">
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
                            <span className="font-bold tabular-nums text-destructive">{d.count}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground py-2">No breakdown</p>
                      )}
                    </div>
                  </div>
                )}
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
  type ReportFilterValue = 'overall' | (typeof EQUIPMENT_CATEGORIES)[number]['slug'];
  const [reportFilter, setReportFilter] = useState<ReportFilterValue>('overall');
  const [reportLoading, setReportLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [fleetDownPopup, setFleetDownPopup] = useState<{ top: number; left: number } | null>(null);
  const fleetDownTriggerRef = useRef<HTMLDivElement>(null);
  const fleetDownPopupCloseRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pdfRef = useRef<HTMLDivElement>(null);

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

  const reportFilterInitialized = useRef(false);
  useEffect(
    () => () => {
      if (fleetDownPopupCloseRef.current) clearTimeout(fleetDownPopupCloseRef.current);
    },
    []
  );
  useEffect(() => {
    if (!reportFilterInitialized.current) {
      reportFilterInitialized.current = true;
      return;
    }
    const group = reportFilter === 'overall' ? undefined : reportFilter;
    setReportLoading(true);
    fetchStatusSummary(group)
      .then(setStatusSummaryReport)
      .catch(console.error)
      .finally(() => setReportLoading(false));
  }, [reportFilter]);

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

  /** When Overall: show only 6 main category rows (aggregated). Otherwise use API rows as-is. */
  const reportTableRows = useMemo(() => {
    if (!statusSummaryReport?.rows) return [];
    if (reportFilter !== 'overall') return statusSummaryReport.rows;
    const NUM_KEYS = ['op', 'idle', 'ur', 'down', 'hr', 'ui', 'wi', 'uc', 'rfd', 'afd', 'accident', 'other'] as const;
    return EQUIPMENT_CATEGORIES.map((cat, index) => {
      const categoryRows = statusSummaryReport.rows.filter((r) => r.category === cat.dbCategory);
      const agg = categoryRows.reduce<Record<string, number>>(
        (acc, row) => {
          NUM_KEYS.forEach((k) => { acc[k] = (acc[k] ?? 0) + (row[k] ?? 0); });
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
  }, [statusSummaryReport, reportFilter]);

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

  const locationChartData =
    report?.locationBreakdown
      ?.filter((l) => l.location !== 'Unassigned' && (l.location?.trim() ?? '') !== '')
      .slice(0, 8)
      .map((l, i) => ({
        name: (l.location ?? '').length > 18 ? (l.location ?? '').slice(0, 16) + '…' : l.location ?? '',
        fullName: l.location ?? '',
        count: l.total ?? 0,
        fill: COLORS[i % COLORS.length],
      })) ?? [];

  return (
    <Layout>
      <TooltipProvider>
        <div className="w-full overflow-x-hidden">
          <div id="equipment-dashboard-pdf" ref={pdfRef} className="space-y-4 w-[103.09%] origin-top-left scale-[0.97]">
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
                    {/* Column 1: Project Sites — neutral */}
                    <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-muted/30 dark:bg-muted/20 px-4 py-4 sm:py-5 min-w-0">
                      <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-muted-foreground">Project Sites</span>
                      <p className="text-2xl sm:text-3xl font-extrabold tabular-nums text-foreground mt-1">{totalProjectSites}</p>
                      <span className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">Active locations</span>
                    </div>

                    {/* Column 2: Total Fleet — primary accent only */}
                    <div className="flex flex-col items-center justify-center rounded-2xl bg-primary/10 dark:bg-primary/15 border border-primary/20 px-5 py-6 sm:px-10 sm:py-8 min-w-0">
                      <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">Total Fleet</span>
                      <p className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tabular-nums text-foreground mt-2 tracking-tight">
                        {total.toLocaleString()}
                      </p>
                      <span className="text-sm text-muted-foreground mt-1.5 font-medium">Equipment units</span>
                    </div>

                    {/* Column 3: 4 quadrants — neutral + primary + destructive only */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 min-w-0">
                      <div className="rounded-lg border border-border bg-muted/20 dark:bg-muted/15 px-2.5 py-3 sm:py-4 flex flex-col justify-center text-center">
                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground">OP</span>
                        <span className="text-base sm:text-lg font-extrabold tabular-nums text-primary mt-1">{totalOp}</span>
                        <span className="text-[10px] text-muted-foreground leading-tight mt-0.5">Operational</span>
                      </div>
                      <div className="rounded-lg border border-border bg-muted/20 dark:bg-muted/15 px-2.5 py-3 sm:py-4 flex flex-col justify-center text-center">
                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground">Idle</span>
                        <span className="text-base sm:text-lg font-extrabold tabular-nums text-foreground mt-1">{totalIdle}</span>
                        <span className="text-[10px] text-muted-foreground leading-tight mt-0.5">Standby</span>
                      </div>
                      <div className="rounded-lg border border-border bg-muted/20 dark:bg-muted/15 px-2.5 py-3 sm:py-4 flex flex-col justify-center text-center">
                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground">Avail</span>
                        <span className="text-base sm:text-lg font-extrabold tabular-nums text-primary mt-1">{totalAvailability}%</span>
                        <span className="text-[10px] text-muted-foreground leading-tight mt-0.5">Fleet ready</span>
                      </div>
                      <div
                        ref={fleetDownTriggerRef}
                        className="relative rounded-lg border border-border bg-destructive/5 dark:bg-destructive/10 px-2.5 py-3 sm:py-4 flex flex-col justify-center text-center cursor-help"
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

          {/* Tabs: Overview | Charts | Reports | All Assets — centered, larger */}
          <Tabs defaultValue="overview" className="space-y-3">
            <div className="flex justify-start">
              <TabsList className="inline-flex bg-muted/60 p-1.5 rounded-xl text-base">
                <TabsTrigger value="overview" className="rounded-lg px-5 py-2.5 text-sm font-semibold data-[state=active]:bg-[#16A34A] data-[state=active]:text-white data-[state=active]:shadow">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="charts" className="rounded-lg px-5 py-2.5 text-sm font-semibold data-[state=active]:bg-[#16A34A] data-[state=active]:text-white data-[state=active]:shadow">
                  Charts & Graphs
                </TabsTrigger>
                <TabsTrigger value="reports" className="rounded-lg px-5 py-2.5 text-sm font-semibold data-[state=active]:bg-[#16A34A] data-[state=active]:text-white data-[state=active]:shadow">
                  Report
                </TabsTrigger>
                <TabsTrigger value="all-assets" className="rounded-lg px-5 py-2.5 text-sm font-semibold data-[state=active]:bg-[#16A34A] data-[state=active]:text-white data-[state=active]:shadow">
                  All Assets
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="space-y-3">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <Card className="shadow-md">
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm">Equipment by Category</CardTitle>
                    <CardDescription>Distribution across 6 equipment types</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <Skeleton className="h-48" />
                    ) : stats?.byCategory?.length ? (
                      <div className="space-y-2">
                        {stats.byCategory.slice(0, 8).map((c, i) => {
                          const pct = total ? Math.round((c.count / total) * 100) : 0;
                          const slug = Object.entries(SLUG_TO_DB_CATEGORY).find(([, v]) => v === c.category)?.[0];
                          return (
                            <Link key={c.category} href={slug ? `/equipment/${slug}` : '#'}>
                              <div className="flex items-center gap-2 p-1.5 rounded-md hover:bg-muted/50 transition-colors group">
                                <div
                                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between text-xs mb-0.5">
                                    <span className="font-medium truncate">{c.category}</span>
                                    <span className="text-muted-foreground">{c.count} ({pct}%)</span>
                                  </div>
                                  <Progress value={pct} className="h-1.5" />
                                </div>
                                {slug && (
                                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                )}
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No data</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="shadow-md">
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm">Top Locations</CardTitle>
                    <CardDescription>Assets by project location</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <Skeleton className="h-48" />
                    ) : report?.locationBreakdown?.length ? (
                      <div className="space-y-2">
                        {report.locationBreakdown
                          .filter((l) => l.location !== 'Unassigned')
                          .slice(0, 6)
                          .map((site, i) => {
                            const pct = total ? Math.round((site.total / total) * 100) : 0;
                            return (
                              <div key={i} className="flex items-center gap-2">
                                <div className="flex-1">
                                  <div className="flex justify-between text-xs mb-0.5">
                                    <span className="font-medium truncate max-w-[160px]">{site.location}</span>
                                    <span className="text-green-600 font-semibold">{pct}%</span>
                                  </div>
                                  <Progress value={pct} className="h-1.5" />
                                </div>
                                <span className="text-[11px] text-muted-foreground w-10 text-right">{site.total}</span>
                              </div>
                            );
                          })}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No location data</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="charts" className="space-y-4 overflow-hidden">
              {/* Column 1: Bar charts | Column 2: Pie & Donuts — no duplicate data */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-w-0">
                {/* ——— COLUMN 1: Bar charts only ——— */}
                <div className="space-y-4 min-w-0">
                  <Card className="shadow-lg overflow-hidden border-0 bg-gradient-to-br from-sky-50/50 to-blue-50/30 dark:from-sky-950/20 dark:to-blue-950/10 min-w-0">
                  <CardHeader className="py-3 border-b bg-sky-50/50 dark:bg-sky-950/30">
                    <CardTitle className="text-sm font-semibold text-sky-900 dark:text-sky-100">Equipment Categories (Bar)</CardTitle>
                    <CardDescription>Asset count per category</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-3 min-w-0 overflow-hidden">
                    <div className="h-[260px] min-w-0 w-full">
                      {loading ? (
                        <Skeleton className="h-full w-full" />
                      ) : chartData.length ? (
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                          <BarChart data={chartData} margin={{ top: 12, right: 12, left: 0, bottom: 4 }}>
                            <defs>
                              {chartData.map((_, i) => (
                                <linearGradient key={i} id={`cat-bar-grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor={COLORS[i % COLORS.length]} stopOpacity={1} />
                                  <stop offset="100%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.7} />
                                </linearGradient>
                              ))}
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} />
                            <YAxis tick={{ fontSize: 11 }} tickLine={false} tickFormatter={(v) => Number(v).toLocaleString()} />
                            <RechartsTooltip
                              content={(p) => (
                                <ChartTooltip
                                  {...p}
                                  render={(value, name) =>
                                    `${name}: ${value.toLocaleString()}${total ? ` (${((value / total) * 100).toFixed(1)}%)` : ''}`
                                  }
                                />
                              )}
                            />
                            <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={40}>
                              {chartData.map((entry, i) => (
                                <Cell key={entry.name ?? i} fill={`url(#cat-bar-grad-${i})`} stroke="rgba(255,255,255,0.4)" strokeWidth={1} />
                              ))}
                              <LabelList dataKey="count" position="top" formatter={(v: unknown) => Number(v ?? 0).toLocaleString()} style={{ fontSize: 10, fontWeight: 600 }} />
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No data</div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                  <Card className="shadow-lg overflow-hidden border-0 bg-gradient-to-br from-amber-50/50 to-orange-50/30 dark:from-amber-950/20 dark:to-orange-950/10 min-w-0">
                  <CardHeader className="py-3 border-b bg-amber-50/50 dark:bg-amber-950/30">
                    <CardTitle className="text-sm font-semibold text-amber-900 dark:text-amber-100">Status Distribution</CardTitle>
                    <CardDescription>Assets by status (OP, Idle, Down, etc.)</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-3 min-w-0 overflow-hidden">
                    <div className="h-[260px] min-w-0 w-full">
                      {loading ? (
                        <Skeleton className="h-full w-full" />
                      ) : statusChartData.length ? (
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                          <BarChart data={statusChartData} margin={{ top: 12, right: 12, left: 0, bottom: 4 }}>
                            <defs>
                              {statusChartData.map((_, i) => (
                                <linearGradient key={i} id={`status-bar-grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor={statusChartData[i]?.fill ?? STATUS_COLORS.default} stopOpacity={1} />
                                  <stop offset="100%" stopColor={statusChartData[i]?.fill ?? STATUS_COLORS.default} stopOpacity={0.7} />
                                </linearGradient>
                              ))}
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 9 }} tickLine={false} angle={-25} textAnchor="end" height={45} />
                            <YAxis tick={{ fontSize: 11 }} tickLine={false} tickFormatter={(v) => Number(v).toLocaleString()} />
                            <RechartsTooltip
                              content={(p) => (
                                <ChartTooltip
                                  {...p}
                                  render={(value, name) => `${name}: ${value.toLocaleString()} assets`}
                                />
                              )}
                            />
                            <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={36}>
                              {statusChartData.map((entry, i) => (
                                <Cell key={entry.name ?? i} fill={`url(#status-bar-grad-${i})`} stroke="rgba(255,255,255,0.4)" strokeWidth={1} />
                              ))}
                              <LabelList dataKey="count" position="top" formatter={(v: unknown) => Number(v ?? 0).toLocaleString()} style={{ fontSize: 9, fontWeight: 600 }} />
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No data</div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Top Project Locations - Horizontal Bar */}
                <Card className="shadow-lg overflow-hidden border-0 bg-gradient-to-br from-violet-50/50 to-purple-50/30 dark:from-violet-950/20 dark:to-purple-950/10 min-w-0">
                  <CardHeader className="py-3 border-b bg-violet-50/50 dark:bg-violet-950/30">
                    <CardTitle className="text-sm font-semibold text-violet-900 dark:text-violet-100">Top Project Locations</CardTitle>
                    <CardDescription>Assets deployed per site · top 8</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-3 min-w-0 overflow-hidden">
                    <div className="h-[260px] min-w-0 w-full">
                      {loading ? (
                        <Skeleton className="h-full w-full" />
                      ) : locationChartData.length ? (
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                          <BarChart data={locationChartData} layout="vertical" margin={{ top: 8, right: 40, left: 0, bottom: 4 }}>
                            <defs>
                              {locationChartData.map((_, i) => (
                                <linearGradient key={i} id={`loc-bar-grad-${i}`} x1="0" y1="0" x2="1" y2="0">
                                  <stop offset="0%" stopColor={locationChartData[i]?.fill ?? COLORS[i % COLORS.length]} stopOpacity={0.9} />
                                  <stop offset="100%" stopColor={locationChartData[i]?.fill ?? COLORS[i % COLORS.length]} stopOpacity={0.6} />
                                </linearGradient>
                              ))}
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                            <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} tickFormatter={(v) => Number(v).toLocaleString()} />
                            <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 10 }} tickLine={false} />
                            <RechartsTooltip
                              content={(p) => (
                                <ChartTooltip
                                  {...p}
                                  render={(value, _n, payload) => `${(payload?.fullName as string) ?? ''}: ${value.toLocaleString()} assets`}
                                />
                              )}
                            />
                            <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={24}>
                              {locationChartData.map((entry, i) => (
                                <Cell key={entry.name ?? i} fill={`url(#loc-bar-grad-${i})`} stroke="rgba(255,255,255,0.3)" strokeWidth={1} />
                              ))}
                              <LabelList dataKey="count" position="right" formatter={(v: unknown) => Number(v ?? 0).toLocaleString()} style={{ fontSize: 10, fontWeight: 600 }} />
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No location data</div>
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
                      <div className="h-[260px] min-w-0 w-full" style={{ filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.15))' }}>
                        {loading ? (
                          <Skeleton className="h-full w-full" />
                        ) : total > 0 ? (
                          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <PieChart>
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
                              <Legend formatter={(name) => <span className="text-xs font-medium">{name}</span>} />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No data</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* 2. Down in Detail — Donut */}
                  <Card className="shadow-lg overflow-hidden border-0 bg-gradient-to-br from-destructive/5 via-card to-red-50/20 dark:from-destructive/10 dark:to-red-950/20 min-w-0">
                    <CardHeader className="py-3 border-b bg-destructive/5 dark:bg-destructive/10">
                      <CardTitle className="text-sm font-semibold text-foreground">Down in Detail</CardTitle>
                      <CardDescription>Out-of-service breakdown</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3 min-w-0 overflow-hidden">
                      <div className="h-[260px] min-w-0 w-full" style={{ filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.12))' }}>
                        {loading ? (
                          <Skeleton className="h-full w-full" />
                        ) : fleetDownBreakdown.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <PieChart>
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
                              <Legend formatter={(name) => <span className="text-xs font-medium">{name}</span>} />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No down breakdown data</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* 3. Category Distribution — Donut */}
                  <Card className="shadow-lg overflow-hidden border-0 bg-gradient-to-br from-emerald-50/50 to-teal-50/30 dark:from-emerald-950/20 dark:to-teal-950/10 min-w-0">
                    <CardHeader className="py-3 border-b bg-emerald-50/50 dark:bg-emerald-950/30">
                      <CardTitle className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">Category Distribution</CardTitle>
                      <CardDescription>Share of total assets by category</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3 min-w-0 overflow-hidden">
                      <div className="h-[260px] min-w-0 w-full" style={{ filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.12))' }}>
                        {loading ? (
                          <Skeleton className="h-full w-full" />
                        ) : pieData.length ? (
                          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <PieChart>
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
                              <Legend formatter={(name) => <span className="text-xs font-medium">{name}</span>} />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No data</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reports" className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Button
                  key="overall"
                  variant={reportFilter === 'overall' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setReportFilter('overall')}
                >
                  Overall
                </Button>
                {EQUIPMENT_CATEGORIES.map((cat) => (
                  <Button
                    key={cat.slug}
                    variant={reportFilter === cat.slug ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setReportFilter(cat.slug)}
                  >
                    {cat.name}
                  </Button>
                ))}
              </div>
              <Card className="shadow-lg overflow-hidden">
                <CardHeader className="bg-green-50/50 dark:bg-green-950/20 border-b py-3">
                  <CardTitle className="text-sm">
                    {reportFilter === 'overall'
                      ? 'Overall Equipment Status Summary'
                      : `${EQUIPMENT_CATEGORIES.find((c) => c.slug === reportFilter)?.name ?? reportFilter} Status Summary`}
                  </CardTitle>
                  <CardDescription>
                    Equipment counts by type and status (Op, Idle, UR, Down, HR, etc.)
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {(loading && !statusSummaryReport) || reportLoading ? (
                    <div className="p-8">
                      <Skeleton className="h-64 w-full" />
                    </div>
                  ) : !reportTableRows.length ? (
                    <p className="text-muted-foreground text-center py-12">No data</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-green-600 text-white">
                            <th className="px-2 py-2 text-left font-semibold">No.</th>
                            <th className="px-2 py-2 text-left font-semibold">Description</th>
                            <th className="px-2 py-2 text-center font-semibold">Op</th>
                            <th className="px-2 py-2 text-center font-semibold">Idle</th>
                            <th className="px-2 py-2 text-center font-semibold">UR</th>
                            <th className="px-2 py-2 text-center font-semibold">Down</th>
                            <th className="px-2 py-2 text-center font-semibold">HR</th>
                            <th className="px-2 py-2 text-center font-semibold">UI</th>
                            <th className="px-2 py-2 text-center font-semibold">WI</th>
                            <th className="px-2 py-2 text-center font-semibold">UC</th>
                            <th className="px-2 py-2 text-center font-semibold">RFD</th>
                            <th className="px-2 py-2 text-center font-semibold">AFD</th>
                            <th className="px-2 py-2 text-center font-semibold">Accident</th>
                            <th className="px-2 py-2 text-center font-semibold">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportTableRows.map((row) => (
                            <tr
                              key={`${row.category}-${row.description}`}
                              className="border-b border-border/50 hover:bg-muted/30"
                            >
                              <td className="px-2 py-1.5 font-medium">{row.no}</td>
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
                            <td className="px-2 py-2" colSpan={2}>G/Total</td>
                            <td className="px-2 py-2 text-center tabular-nums">{statusSummaryReport?.grandTotal?.op ?? '-'}</td>
                            <td className="px-2 py-2 text-center tabular-nums">{statusSummaryReport?.grandTotal?.idle ?? '-'}</td>
                            <td className="px-2 py-2 text-center tabular-nums">{statusSummaryReport?.grandTotal?.ur ?? '-'}</td>
                            <td className="px-2 py-2 text-center tabular-nums">{statusSummaryReport?.grandTotal?.down ?? '-'}</td>
                            <td className="px-2 py-2 text-center tabular-nums">{statusSummaryReport?.grandTotal?.hr ?? '-'}</td>
                            <td className="px-2 py-2 text-center tabular-nums">{statusSummaryReport?.grandTotal?.ui ?? '-'}</td>
                            <td className="px-2 py-2 text-center tabular-nums">{statusSummaryReport?.grandTotal?.wi ?? '-'}</td>
                            <td className="px-2 py-2 text-center tabular-nums">{statusSummaryReport?.grandTotal?.uc ?? '-'}</td>
                            <td className="px-2 py-2 text-center tabular-nums">{statusSummaryReport?.grandTotal?.rfd ?? '-'}</td>
                            <td className="px-2 py-2 text-center tabular-nums">{statusSummaryReport?.grandTotal?.afd ?? '-'}</td>
                            <td className="px-2 py-2 text-center tabular-nums">{statusSummaryReport?.grandTotal?.accident ?? '-'}</td>
                            <td className="px-2 py-2 text-center tabular-nums">{statusSummaryReport?.grandTotal?.total ?? '-'}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="all-assets" className="mt-4">
              <EquipmentDataView
                categoryName="All Assets"
                useInfiniteScroll
              />
            </TabsContent>
          </Tabs>
          </div>
        </div>
      </TooltipProvider>
    </Layout>
  );
}
