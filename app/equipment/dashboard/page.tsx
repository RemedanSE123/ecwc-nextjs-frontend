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
import { fetchAssetStats, fetchAssetReports } from '@/lib/api/assets';
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
} from 'lucide-react';
import { motion } from 'framer-motion';

const COLORS = ['#16a34a', '#ea580c', '#0891b2', '#dc2626', '#7c3aed', '#ca8a04'];

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'plant-equipment': Wrench,
  'auxiliary-equipment': Truck,
  'light-vehicles': Car,
  'heavy-vehicles': Truck,
  'machinery': Wrench,
  'factory-equipment': Wrench,
};

export default function EquipmentDashboardPage() {
  const [stats, setStats] = useState<AssetStats | null>(null);
  const [report, setReport] = useState<AssetReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([fetchAssetStats(), fetchAssetReports()])
      .then(([s, r]) => {
        setStats(s);
        setReport(r);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const total = stats?.total ?? 0;
  const getCountForSlug = (slug: string) => {
    const dbCategory = SLUG_TO_DB_CATEGORY[slug];
    if (!dbCategory) return 0;
    return stats?.byCategory?.find((c) => c.category === dbCategory)?.count ?? 0;
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

  return (
    <Layout>
      <TooltipProvider>
        <div id="equipment-dashboard-pdf" ref={pdfRef} className="space-y-5">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
          >
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-green-700 to-green-500 bg-clip-text text-transparent">
                Equipment Dashboard
              </h1>
              <p className="text-muted-foreground text-sm mt-0.5">
                Overview of all 6 equipment categories
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={exporting} className="gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleExportExcel} className="gap-2 cursor-pointer">
                  <FileSpreadsheet className="w-4 h-4" />
                  Export to Excel
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleExportPdf} className="gap-2 cursor-pointer">
                  <FileDown className="w-4 h-4" />
                  Export to PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>

          {/* Category Cards - 6 Equipment + Total */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
            {loading ? (
              [...Array(7)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
            ) : (
              <>
                {/* Total Summary Card */}
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
                  <Card className="overflow-hidden shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/20 border-2 border-green-200/50 dark:border-green-800/30">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                            Total Assets
                          </p>
                          <p className="text-2xl font-bold text-green-700 dark:text-green-400 mt-1">{total.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">All categories</p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-green-500/20">
                          <LayoutDashboard className="h-5 w-5 text-green-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* 6 Category Cards */}
                {EQUIPMENT_CATEGORIES.map((cat, i) => {
                  const Icon = iconMap[cat.slug] ?? FileText;
                  const count = getCountForSlug(cat.slug);
                  const pct = total ? Math.round((count / total) * 100) : 0;
                  return (
                    <motion.div
                      key={cat.slug}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (i + 1) * 0.05 }}
                    >
                      <Link href={`/equipment/${cat.slug}`}>
                        <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl hover:border-green-400/50 transition-all duration-300 cursor-pointer group h-full">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold truncate max-w-[90px]">
                                  {cat.name}
                                </p>
                                <p className="text-2xl font-bold mt-1">{count}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{pct}% of fleet</p>
                              </div>
                              <div
                                className="p-2.5 rounded-xl group-hover:scale-110 transition-transform"
                                style={{ backgroundColor: `${COLORS[i % COLORS.length]}20` }}
                              >
                                <Icon
                                  className="h-5 w-5"
                                  style={{ color: COLORS[i % COLORS.length] }}
                                />
                              </div>
                            </div>
                            <Progress value={pct} className="h-1.5 mt-2" />
                            <div className="flex items-center gap-1 mt-2 text-[10px] text-green-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                              <span>View</span>
                              <ChevronRight className="w-3 h-3" />
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  );
                })}
              </>
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
                Category Report
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
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-base">Category Report</CardTitle>
                  <CardDescription>Full breakdown of equipment by category with export</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {loading ? (
                      <Skeleton className="h-48" />
                    ) : stats?.byCategory?.length ? (
                      stats.byCategory.map((c, i) => {
                        const pct = total ? Math.round((c.count / total) * 100) : 0;
                        return (
                          <Tooltip key={i}>
                            <TooltipTrigger asChild>
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="font-medium">{c.category}</span>
                                  <span className="text-muted-foreground">
                                    {c.count} ({pct}%)
                                  </span>
                                </div>
                                <Progress value={pct} className="h-3" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                {c.count} assets in {c.category}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        );
                      })
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No data</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </TooltipProvider>
    </Layout>
  );
}
