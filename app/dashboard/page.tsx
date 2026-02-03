"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchAssetStats, fetchAssetReports } from "@/lib/api/assets";
import { SLUG_TO_DB_CATEGORY } from "@/types/asset";
import { exportStatsToExcel, exportToPdf } from "@/lib/export-utils";
import type { AssetStats, AssetReportData } from "@/types/asset";
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
} from "recharts";
import {
  Truck,
  Wrench,
  FileText,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Activity,
  Clock,
  BarChart3 as BarIcon,
  MapPin,
  Download,
  FileSpreadsheet,
  FileDown,
} from "lucide-react";
import { motion } from "framer-motion";

const COLORS = ["#16a34a", "#ea580c", "#0891b2", "#dc2626", "#7c3aed", "#ca8a04", "#db2777", "#64748b"];

function getStatusCount(byStatus: { status: string; count: number }[], match: string | RegExp): number {
  return (
    byStatus?.find((s) =>
      typeof match === "string" ? s.status?.toLowerCase().includes(match.toLowerCase()) : match.test(s.status || "")
    )?.count ?? 0
  );
}

export default function DashboardPage() {
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
  const operational = getStatusCount(stats?.byStatus ?? [], /operational|active|running/i);
  const underRepair = getStatusCount(stats?.byStatus ?? [], /repair|maintenance/i);
  const idle = getStatusCount(stats?.byStatus ?? [], /idle|available/i);
  const downAccident = getStatusCount(stats?.byStatus ?? [], /down|accident|broken|out/i);
  const activeSites = stats?.byLocation?.filter((l) => l.project_location !== "Unassigned")?.length ?? 0;
  const opPct = total ? Math.round((operational / total) * 100) : 0;

  const handleExportExcel = () => {
    if (!stats) return;
    setExporting(true);
    exportStatsToExcel(stats.byCategory, stats.byStatus, stats.byLocation, stats.total);
    setExporting(false);
  };

  const handleExportPdf = async () => {
    if (!pdfRef.current) return;
    setExporting(true);
    await exportToPdf("dashboard-pdf", `ecwc-dashboard-${new Date().toISOString().slice(0, 10)}.pdf`);
    setExporting(false);
  };

  const chartData = stats?.byCategory?.slice(0, 8).map((c) => ({
    name: c.category,
    count: c.count,
    fill: COLORS[stats.byCategory.indexOf(c) % COLORS.length],
  })) ?? [];

  const pieData = stats?.byStatus?.slice(0, 6).map((s, i) => ({
    name: s.status || "Unknown",
    value: s.count,
    fill: COLORS[i % COLORS.length],
  })) ?? [];

  return (
    <Layout>
      <TooltipProvider>
        <div id="dashboard-pdf" ref={pdfRef} className="space-y-5">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
          >
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-green-700 to-green-500 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-muted-foreground text-sm mt-0.5">
                Welcome to ECWC Plant Equipment Management System
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <Activity className="w-4 h-4 text-green-600" />
                <span className="text-xs font-medium text-green-700 dark:text-green-400">System Online</span>
              </div>
              <div className="text-xs text-muted-foreground bg-muted px-3 py-2 rounded-lg flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                Last updated: Just now
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
            </div>
          </motion.div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {loading ? (
              [...Array(6)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
            ) : (
              [
                {
                  title: "Total Fleet",
                  value: total.toLocaleString(),
                  subValue: "Equipment",
                  icon: Truck,
                  color: "from-blue-500 to-blue-600",
                  bg: "bg-blue-500/10",
                  iconBg: "bg-blue-500/20",
                },
                {
                  title: "Operational",
                  value: operational.toString(),
                  subValue: `${opPct}% Active`,
                  icon: CheckCircle,
                  color: "from-green-500 to-green-600",
                  bg: "bg-green-500/10",
                  iconBg: "bg-green-500/20",
                },
                {
                  title: "Under Repair",
                  value: underRepair.toString(),
                  subValue: `${total ? Math.round((underRepair / total) * 100) : 0}%`,
                  icon: Wrench,
                  color: "from-orange-500 to-orange-600",
                  bg: "bg-orange-500/10",
                  iconBg: "bg-orange-500/20",
                },
                {
                  title: "Idle",
                  value: idle.toString(),
                  subValue: "Available",
                  icon: Clock,
                  color: "from-cyan-500 to-cyan-600",
                  bg: "bg-cyan-500/10",
                  iconBg: "bg-cyan-500/20",
                },
                {
                  title: "Down/Accident",
                  value: downAccident.toString(),
                  subValue: "Attention",
                  icon: AlertTriangle,
                  color: "from-red-500 to-red-600",
                  bg: "bg-red-500/10",
                  iconBg: "bg-red-500/20",
                },
                {
                  title: "Active Sites",
                  value: activeSites.toString(),
                  subValue: "Locations",
                  icon: MapPin,
                  color: "from-purple-500 to-purple-600",
                  bg: "bg-purple-500/10",
                  iconBg: "bg-purple-500/20",
                },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                            {stat.title}
                          </p>
                          <p className="text-2xl font-bold mt-1">{stat.value}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{stat.subValue}</p>
                        </div>
                        <div className={`p-2.5 rounded-xl ${stat.iconBg} group-hover:scale-110 transition-transform`}>
                          <stat.icon className="h-5 w-5 text-foreground/80" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
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
                Reports
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Fleet Utilization */}
                <Card className="lg:col-span-2 border-green-200/50 dark:border-green-900/30 shadow-md">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <BarIcon className="w-4 h-4 text-green-600" />
                        Fleet Utilization
                      </CardTitle>
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 text-xs">
                        <TrendingUp className="w-3 h-3 mr-1" /> {opPct}%
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-6">
                      <div className="relative w-24 h-24 flex-shrink-0">
                        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="12" className="text-gray-200 dark:text-gray-700" />
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke="url(#grad)"
                            strokeWidth="12"
                            strokeDasharray="251.2"
                            strokeDashoffset={251.2 - (251.2 * opPct) / 100}
                            strokeLinecap="round"
                          />
                          <defs>
                            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#16a34a" />
                              <stop offset="100%" stopColor="#22c55e" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-lg font-bold text-green-600">{loading ? "..." : `${opPct}%`}</span>
                        </div>
                      </div>
                      <div className="flex-1 space-y-3">
                        {loading ? (
                          <Skeleton className="h-20" />
                        ) : (
                          stats?.byCategory?.slice(0, 4).map((c) => {
                            const pct = total ? Math.round((c.count / total) * 100) : 0;
                            return (
                              <div key={c.category}>
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-muted-foreground truncate max-w-[140px]">{c.category}</span>
                                  <span className="font-medium">{pct}%</span>
                                </div>
                                <Progress value={pct} className="h-2" />
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-2">
                    {[
                      { label: "New Request", icon: FileText, href: "#", color: "hover:bg-blue-50 dark:hover:bg-blue-950/30" },
                      { label: "Add Equipment", icon: Truck, href: "#", color: "hover:bg-green-50 dark:hover:bg-green-950/30" },
                      { label: "View Reports", icon: BarIcon, href: "/equipment/dashboard", color: "hover:bg-purple-50 dark:hover:bg-purple-950/30" },
                      { label: "Schedule", icon: Calendar, href: "#", color: "hover:bg-orange-50 dark:hover:bg-orange-950/30" },
                    ].map((a, i) => (
                      <Link key={i} href={a.href}>
                        <Button variant="outline" className={`w-full justify-start gap-2 h-11 ${a.color}`}>
                          <a.icon className="w-4 h-4" />
                          {a.label}
                        </Button>
                      </Link>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Recent Assets & Top Sites */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="shadow-md">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Recent Assets</CardTitle>
                      <Link href="/equipment/dashboard" className="text-xs text-green-600 hover:underline font-medium">
                        View All
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-[240px] overflow-y-auto">
                      {loading ? (
                        [...Array(5)].map((_, i) => <Skeleton key={i} className="h-12" />)
                      ) : report?.recentAssets?.length ? (
                        report.recentAssets.slice(0, 6).map((a, i) => (
                          <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="p-1.5 rounded-full bg-green-100 dark:bg-green-900/30">
                              <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{a.asset_no ?? a.description?.slice(0, 35) ?? "—"}</p>
                              <p className="text-xs text-muted-foreground">Status: {a.status ?? "—"}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground py-8 text-center">No recent assets</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Top Locations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {loading ? (
                        [...Array(4)].map((_, i) => <Skeleton key={i} className="h-10" />)
                      ) : report?.locationBreakdown?.length ? (
                        report.locationBreakdown
                          .filter((l) => l.location !== "Unassigned")
                          .slice(0, 5)
                          .map((site, i) => {
                            const pct = total ? Math.round((site.total / total) * 100) : 0;
                            return (
                              <div key={i} className="flex items-center gap-3">
                                <div className="flex-1">
                                  <div className="flex justify-between text-xs mb-1">
                                    <span className="font-medium truncate max-w-[160px]">{site.location}</span>
                                    <span className="text-green-600 font-semibold">{pct}%</span>
                                  </div>
                                  <Progress value={pct} className="h-2" />
                                </div>
                                <span className="text-xs text-muted-foreground w-12 text-right">{site.total}</span>
                              </div>
                            );
                          })
                      ) : (
                        <p className="text-sm text-muted-foreground py-8 text-center">No location data</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="charts" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-lg overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-base">Assets by Category</CardTitle>
                    <CardDescription>Distribution across equipment categories</CardDescription>
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
                              contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }}
                              formatter={(value: number) => [value, "Count"]}
                            />
                            <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="hsl(var(--primary))" />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No data</div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-base">Status Distribution</CardTitle>
                    <CardDescription>Asset status breakdown</CardDescription>
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
                        <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No data</div>
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
                  <CardDescription>Full breakdown of equipment by category</CardDescription>
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
                                  <span className="text-muted-foreground">{c.count} ({pct}%)</span>
                                </div>
                                <Progress value={pct} className="h-3" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{c.count} assets in {c.category}</p>
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

          {/* Equipment Categories Overview */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="shadow-lg border-green-200/30 dark:border-green-900/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Equipment Categories</CardTitle>
                    <CardDescription className="text-xs mt-0.5">Total: {total.toLocaleString()} assets</CardDescription>
                  </div>
                  <Link href="/equipment/dashboard">
                    <Button variant="outline" size="sm">View Details</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 gap-4">
                  {loading ? (
                    [...Array(6)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
                  ) : stats?.byCategory?.length ? (
                    stats.byCategory.slice(0, 10).map((cat, i) => {
                      const pct = total ? Math.round((cat.count / total) * 100) : 0;
                      const slug = Object.entries(SLUG_TO_DB_CATEGORY).find(([, v]) => v === cat.category)?.[0] ?? cat.category.toLowerCase().replace(/\s+/g, "-").replace(/&/g, "");
                      return (
                        <Link key={i} href={`/equipment/${slug}`}>
                          <Card className="overflow-hidden hover:shadow-md hover:border-green-400/50 transition-all duration-200 cursor-pointer group h-full">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold truncate max-w-[80px] group-hover:text-green-600">
                                  {cat.category}
                                </span>
                                <div
                                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                                />
                              </div>
                              <p className="text-xl font-bold">{cat.count}</p>
                              <p className="text-[10px] text-muted-foreground">{pct}% of fleet</p>
                              <Progress value={pct} className="h-1.5 mt-2" />
                            </CardContent>
                          </Card>
                        </Link>
                      );
                    })
                  ) : (
                    <p className="col-span-full text-center text-muted-foreground py-8">No category data</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </TooltipProvider>
    </Layout>
  );
}
