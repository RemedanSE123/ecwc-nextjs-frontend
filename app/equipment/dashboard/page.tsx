'use client';

import { useState, useEffect, useRef } from 'react';
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
} from 'recharts';
import {
  LayoutDashboard,
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

const COLORS = ['#16a34a', '#ea580c', '#0891b2', '#dc2626', '#7c3aed', '#ca8a04'];

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
        className="overflow-visible border shadow-md hover:shadow-xl hover:border-green-400/60 transition-all duration-300 group relative bg-card/95 backdrop-blur-sm rounded-lg"
        style={{ borderLeftWidth: '3px', borderLeftColor: color }}
      >
        <CardContent className="p-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
            {/* Column 1: Category name, total, fleet % */}
            <div className="flex items-center gap-3 p-4 sm:border-r sm:border-b-0 border-b border-border/60 sm:border-b-transparent">
              <div
                className="p-2 rounded-lg shrink-0 group-hover:scale-105 transition-transform"
                style={{ backgroundColor: `${color}18` }}
              >
                <Icon className="h-5 w-5" style={{ color }} />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-foreground truncate">{name}</p>
                <p className="text-2xl font-bold tabular-nums mt-0.5">{stats.total.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{pct}% of fleet</p>
              </div>
            </div>
            {/* Column 2: OP, Idle, Availability, Down */}
            <div className="flex flex-col justify-center gap-1.5 p-4">
              <div className="flex items-center gap-1.5 text-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-muted-foreground text-xs">OP:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">{stats.op}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm">
                <span className="w-2 h-2 rounded-full bg-cyan-500 shrink-0" />
                <span className="text-muted-foreground text-xs">Idle:</span>
                <span className="font-semibold text-cyan-600 dark:text-cyan-400 tabular-nums">{stats.idle}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm">
                <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                <span className="text-muted-foreground text-xs">Availability:</span>
                <span className="font-semibold text-green-600 dark:text-green-400 tabular-nums">{availability}%</span>
              </div>
              <div
                className="relative z-[100] flex items-center gap-1.5 text-sm w-fit"
                onMouseEnter={() => setShowDownPopup(true)}
                onMouseLeave={() => setShowDownPopup(false)}
              >
                <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                <span className="text-muted-foreground text-xs">Down:</span>
                <span className="font-semibold text-red-600 dark:text-red-400 tabular-nums cursor-help underline decoration-dotted decoration-red-400/60 underline-offset-1">
                  {stats.down}
                </span>
                {showDownPopup && (
                  <div
                    className="absolute z-[200] left-0 bottom-full mb-1.5 w-[200px] rounded-lg shadow-2xl border bg-background overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150"
                    onMouseEnter={() => setShowDownPopup(true)}
                    onMouseLeave={() => setShowDownPopup(false)}
                  >
                    <div className="px-3 py-2 bg-red-500/10 border-b font-semibold text-xs text-red-700 dark:text-red-400">
                      Down breakdown
                    </div>
                    <div className="p-2 space-y-1 max-h-44 overflow-y-auto">
                      {stats.downBreakdown.length > 0 ? (
                        stats.downBreakdown.map((d) => (
                          <div
                            key={d.label}
                            className="flex justify-between items-center gap-2 py-1 px-2 rounded text-xs hover:bg-red-50/50 dark:hover:bg-red-950/30"
                          >
                            <span>{d.label}</span>
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
            </div>
          </div>
          <div className="absolute top-3 right-3">
            <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (index + 1) * 0.05 }}>
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
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([fetchAssetStats(), fetchAssetReports(), fetchStatusSummary()])
      .then(([s, r, ss]) => {
        setStats(s);
        setReport(r);
        setStatusSummary(ss);
        setStatusSummaryReport(ss);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const reportFilterInitialized = useRef(false);
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

  return (
    <Layout>
      <TooltipProvider>
        <div id="equipment-dashboard-pdf" ref={pdfRef} className="space-y-5">
          {/* Row 1: Title + Overview | Total Equipment */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row lg:items-stretch gap-3"
          >
            {/* Title block */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-br from-[#16A34A]/15 via-[#15803D]/10 to-[#166534]/5 dark:from-[#16A34A]/20 dark:via-[#15803D]/15 dark:to-[#166534]/10 border border-[#16A34A]/30 shadow-sm w-fit min-w-[180px]">
              <div className="p-1.5 rounded-md bg-[#16A34A]/20 dark:bg-[#16A34A]/25">
                <LayoutDashboard className="h-4 w-4 text-[#16A34A]" />
              </div>
              <div>
                <h1 className="text-base font-bold text-foreground tracking-tight">Equipment Dashboard</h1>
                <p className="text-[11px] text-muted-foreground">Overview of all 6 equipment categories</p>
              </div>
            </div>
            {/* Total Equipment card */}
            <div className="flex-1 min-w-0 w-full">
              {loading ? (
                <Skeleton className="h-[68px] w-full rounded-xl" />
              ) : (
                <Card
                  className="overflow-hidden border-0 shadow-lg rounded-xl bg-card/95 backdrop-blur-sm"
                  style={{
                    borderLeft: '4px solid',
                    borderLeftColor: '#16A34A',
                    boxShadow: '0 4px 24px -4px rgba(22, 163, 74, 0.15), 0 0 0 1px rgba(0,0,0,0.04)',
                  }}
                >
                  <CardContent className="p-0">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 min-h-[68px]">
                      {/* Column 1 */}
                      <div className="flex items-center gap-3 p-3 sm:border-r border-border/40 sm:border-b-0 border-b bg-gradient-to-r from-[#16A34A]/10 via-[#16A34A]/5 to-transparent">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-[#16A34A]/25 to-[#15803D]/15 ring-1 ring-[#16A34A]/20">
                          <LayoutDashboard className="h-5 w-5 text-[#16A34A]" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-foreground tracking-tight">Total Equipment</p>
                          <p className="text-[10px] text-muted-foreground/90 mt-0.5 font-medium">Fleet overview</p>
                        </div>
                      </div>
                      {/* Column 2 */}
                      <div className="flex flex-col items-center justify-center gap-1 py-3 sm:border-r border-border/40 sm:border-b-0 border-b px-4 bg-gradient-to-b from-[#16A34A]/5 to-transparent">
                        <p className="text-3xl font-black tabular-nums tracking-tight bg-gradient-to-br from-[#16A34A] via-[#15803D] to-[#166534] dark:from-green-400 dark:via-green-500 dark:to-green-600 bg-clip-text text-transparent">
                          {total.toLocaleString()}
                        </p>
                        <span className="inline-flex items-center rounded-full bg-[#16A34A]/15 px-2 py-0.5 text-[10px] font-semibold text-[#16A34A] uppercase tracking-wider">
                          Total Fleet
                        </span>
                      </div>
                      {/* Column 3: KPIs */}
                      <div className="grid grid-cols-2 gap-1.5 p-3">
                        <div className="flex items-center gap-1.5 rounded-md px-2 py-1 bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                          <div>
                            <span className="block text-[8px] uppercase tracking-wider text-muted-foreground">OP</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums text-xs">{totalOp}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 rounded-md px-2 py-1 bg-cyan-500/10 dark:bg-cyan-500/15 border border-cyan-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0" />
                          <div>
                            <span className="block text-[8px] uppercase tracking-wider text-muted-foreground">Idle</span>
                            <span className="font-bold text-cyan-600 dark:text-cyan-400 tabular-nums text-xs">{totalIdle}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 rounded-md px-2 py-1 bg-green-500/10 dark:bg-green-500/15 border border-green-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                          <div>
                            <span className="block text-[8px] uppercase tracking-wider text-muted-foreground">Avail</span>
                            <span className="font-bold text-green-600 dark:text-green-400 tabular-nums text-xs">{totalAvailability}%</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 rounded-md px-2 py-1 bg-red-500/10 dark:bg-red-500/15 border border-red-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                          <div>
                            <span className="block text-[8px] uppercase tracking-wider text-muted-foreground">Down</span>
                            <span className="font-bold text-red-600 dark:text-red-400 tabular-nums text-xs">{totalDown}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </motion.div>

          {/* Row 2: Plant, Auxiliary, Light Vehicles - 3 cards per row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              [...Array(3)].map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)
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

          {/* Row 3: Heavy Vehicles, Machinery, Factory Equipment - 3 cards per row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              [...Array(3)].map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)
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

          {/* Tabs: Overview | Charts | Reports */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="bg-muted/50 p-1 rounded-xl">
              <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow">
                Overview
              </TabsTrigger>
              <TabsTrigger value="charts" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow">
                Charts & Graphs
              </TabsTrigger>
              <TabsTrigger value="reports" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow">
                Report
              </TabsTrigger>
              <TabsTrigger value="all-assets" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow">
                All Assets
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="shadow-md">
                  <CardHeader>
                    <CardTitle className="text-base">Equipment by Category</CardTitle>
                    <CardDescription>Distribution across 6 equipment types</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <Skeleton className="h-48" />
                    ) : stats?.byCategory?.length ? (
                      <div className="space-y-3">
                        {stats.byCategory.slice(0, 8).map((c, i) => {
                          const pct = total ? Math.round((c.count / total) * 100) : 0;
                          const slug = Object.entries(SLUG_TO_DB_CATEGORY).find(([, v]) => v === c.category)?.[0];
                          return (
                            <Link key={c.category} href={slug ? `/equipment/${slug}` : '#'}>
                              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group">
                                <div
                                  className="w-2 h-2 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium truncate">{c.category}</span>
                                    <span className="text-muted-foreground">{c.count} ({pct}%)</span>
                                  </div>
                                  <Progress value={pct} className="h-2" />
                                </div>
                                {slug && (
                                  <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
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
                  <CardHeader>
                    <CardTitle className="text-base">Top Locations</CardTitle>
                    <CardDescription>Assets by project location</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <Skeleton className="h-48" />
                    ) : report?.locationBreakdown?.length ? (
                      <div className="space-y-3">
                        {report.locationBreakdown
                          .filter((l) => l.location !== 'Unassigned')
                          .slice(0, 6)
                          .map((site, i) => {
                            const pct = total ? Math.round((site.total / total) * 100) : 0;
                            return (
                              <div key={i} className="flex items-center gap-3">
                                <div className="flex-1">
                                  <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium truncate max-w-[180px]">{site.location}</span>
                                    <span className="text-green-600 font-semibold">{pct}%</span>
                                  </div>
                                  <Progress value={pct} className="h-2" />
                                </div>
                                <span className="text-xs text-muted-foreground w-12 text-right">{site.total}</span>
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

            <TabsContent value="charts" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-lg overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-base">Equipment Categories (Bar)</CardTitle>
                    <CardDescription>Asset count per category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      {loading ? (
                        <Skeleton className="h-full w-full" />
                      ) : chartData.length ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} />
                            <YAxis tick={{ fontSize: 11 }} tickLine={false} />
                            <RechartsTooltip
                              contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                              formatter={(value: number) => [value, 'Count']}
                            />
                            <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="hsl(var(--primary))" />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                          No data
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-base">Category Distribution (Donut)</CardTitle>
                    <CardDescription>Share of total assets</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      {loading ? (
                        <Skeleton className="h-full w-full" />
                      ) : pieData.length ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={2}
                              dataKey="value"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                              {pieData.map((_, i) => (
                                <Cell key={i} fill={pieData[i].fill} />
                              ))}
                            </Pie>
                            <RechartsTooltip formatter={(value: number, name: string) => [value, name]} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                          No data
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="reports" className="space-y-4">
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
                <CardHeader className="bg-green-50/50 dark:bg-green-950/20 border-b">
                  <CardTitle className="text-base">
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
                  ) : !statusSummaryReport?.rows?.length ? (
                    <p className="text-muted-foreground text-center py-12">No data</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-green-600 text-white">
                            <th className="px-3 py-2.5 text-left font-semibold">No.</th>
                            <th className="px-3 py-2.5 text-left font-semibold">Description</th>
                            <th className="px-3 py-2.5 text-center font-semibold">Op</th>
                            <th className="px-3 py-2.5 text-center font-semibold">Idle</th>
                            <th className="px-3 py-2.5 text-center font-semibold">UR</th>
                            <th className="px-3 py-2.5 text-center font-semibold">Down</th>
                            <th className="px-3 py-2.5 text-center font-semibold">HR</th>
                            <th className="px-3 py-2.5 text-center font-semibold">UI</th>
                            <th className="px-3 py-2.5 text-center font-semibold">WI</th>
                            <th className="px-3 py-2.5 text-center font-semibold">UC</th>
                            <th className="px-3 py-2.5 text-center font-semibold">RFD</th>
                            <th className="px-3 py-2.5 text-center font-semibold">AFD</th>
                            <th className="px-3 py-2.5 text-center font-semibold">Accident</th>
                            <th className="px-3 py-2.5 text-center font-semibold">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {statusSummaryReport.rows.map((row) => (
                            <tr
                              key={`${row.category}-${row.description}`}
                              className="border-b border-border/50 hover:bg-muted/30"
                            >
                              <td className="px-3 py-2 font-medium">{row.no}</td>
                              <td className="px-3 py-2 font-medium">{row.description}</td>
                              <td className="px-3 py-2 text-center tabular-nums">{row.op || '-'}</td>
                              <td className="px-3 py-2 text-center tabular-nums">{row.idle || '-'}</td>
                              <td className="px-3 py-2 text-center tabular-nums">{row.ur || '-'}</td>
                              <td className="px-3 py-2 text-center tabular-nums">{row.down || '-'}</td>
                              <td className="px-3 py-2 text-center tabular-nums">{row.hr || '-'}</td>
                              <td className="px-3 py-2 text-center tabular-nums">{row.ui || '-'}</td>
                              <td className="px-3 py-2 text-center tabular-nums">{row.wi || '-'}</td>
                              <td className="px-3 py-2 text-center tabular-nums">{row.uc || '-'}</td>
                              <td className="px-3 py-2 text-center tabular-nums">{row.rfd || '-'}</td>
                              <td className="px-3 py-2 text-center tabular-nums">{row.afd || '-'}</td>
                              <td className="px-3 py-2 text-center tabular-nums">{row.accident || '-'}</td>
                              <td className="px-3 py-2 text-center font-semibold tabular-nums">{row.total}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-green-100/50 dark:bg-green-900/20 font-semibold">
                            <td className="px-3 py-2.5" colSpan={2}>G/Total</td>
                            <td className="px-3 py-2.5 text-center tabular-nums">{statusSummaryReport.grandTotal.op || '-'}</td>
                            <td className="px-3 py-2.5 text-center tabular-nums">{statusSummaryReport.grandTotal.idle || '-'}</td>
                            <td className="px-3 py-2.5 text-center tabular-nums">{statusSummaryReport.grandTotal.ur || '-'}</td>
                            <td className="px-3 py-2.5 text-center tabular-nums">{statusSummaryReport.grandTotal.down || '-'}</td>
                            <td className="px-3 py-2.5 text-center tabular-nums">{statusSummaryReport.grandTotal.hr || '-'}</td>
                            <td className="px-3 py-2.5 text-center tabular-nums">{statusSummaryReport.grandTotal.ui || '-'}</td>
                            <td className="px-3 py-2.5 text-center tabular-nums">{statusSummaryReport.grandTotal.wi || '-'}</td>
                            <td className="px-3 py-2.5 text-center tabular-nums">{statusSummaryReport.grandTotal.uc || '-'}</td>
                            <td className="px-3 py-2.5 text-center tabular-nums">{statusSummaryReport.grandTotal.rfd || '-'}</td>
                            <td className="px-3 py-2.5 text-center tabular-nums">{statusSummaryReport.grandTotal.afd || '-'}</td>
                            <td className="px-3 py-2.5 text-center tabular-nums">{statusSummaryReport.grandTotal.accident || '-'}</td>
                            <td className="px-3 py-2.5 text-center tabular-nums">{statusSummaryReport.grandTotal.total}</td>
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
                initialLimit={5000}
              />
            </TabsContent>
          </Tabs>
        </div>
      </TooltipProvider>
    </Layout>
  );
}
