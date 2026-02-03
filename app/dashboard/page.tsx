"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Layout from "@/components/Layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchAssetStats, fetchAssetReports } from "@/lib/api/assets"
import type { AssetStats, AssetReportData } from "@/types/asset"
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
  BarChart3,
  MapPin,
} from "lucide-react"
import { motion } from "framer-motion"

function getStatusCount(byStatus: { status: string; count: number }[], match: string | RegExp): number {
  return byStatus?.find((s) =>
    typeof match === "string"
      ? s.status?.toLowerCase().includes(match.toLowerCase())
      : match.test(s.status || "")
  )?.count ?? 0
}

export default function DashboardPage() {
  const [stats, setStats] = useState<AssetStats | null>(null)
  const [report, setReport] = useState<AssetReportData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([fetchAssetStats(), fetchAssetReports()])
      .then(([s, r]) => {
        setStats(s)
        setReport(r)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const total = stats?.total ?? 0
  const operational = getStatusCount(stats?.byStatus ?? [], /operational|active|running/i)
  const underRepair = getStatusCount(stats?.byStatus ?? [], /repair|maintenance/i)
  const idle = getStatusCount(stats?.byStatus ?? [], /idle|available/i)
  const downAccident = getStatusCount(stats?.byStatus ?? [], /down|accident|broken|out/i)
  const activeSites = stats?.byLocation?.filter((l) => l.project_location !== "Unassigned")?.length ?? 0
  const opPct = total ? Math.round((operational / total) * 100) : 0

  return (
    <Layout>
      {/* Container - scaled for 95% appearance at 100% zoom */}
      <div className="space-y-4 text-[13px]">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3"
        >
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground text-[12px]">Welcome to ECWC Plant Equipment Management System</p>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800">
              <Activity className="w-3.5 h-3.5 text-green-600" />
              <span className="text-[11px] font-medium text-green-700 dark:text-green-400">System Online</span>
            </div>
            <div className="text-[11px] text-muted-foreground bg-muted px-3 py-1.5 rounded-md">
              <Clock className="w-3 h-3 inline mr-1" />
              Last updated: 2 min ago
            </div>
          </div>
        </motion.div>

        {/* Top Stats Row - 6 Cards */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {loading ? (
            [...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-[88px]" />
            ))
          ) : (
          [
            { title: "Total Fleet", value: total.toLocaleString(), subValue: "Equipment", icon: Truck, color: "text-blue-600", bgColor: "bg-blue-50 dark:bg-blue-900/20", borderColor: "border-blue-200 dark:border-blue-800" },
            { title: "Operational", value: operational.toString(), subValue: `${opPct}% Active`, icon: CheckCircle, color: "text-green-600", bgColor: "bg-green-50 dark:bg-green-900/20", borderColor: "border-green-200 dark:border-green-800" },
            { title: "Under Repair", value: underRepair.toString(), subValue: `${total ? Math.round((underRepair / total) * 100) : 0}% Fleet`, icon: Wrench, color: "text-orange-600", bgColor: "bg-orange-50 dark:bg-orange-900/20", borderColor: "border-orange-200 dark:border-orange-800" },
            { title: "Idle", value: idle.toString(), subValue: "Available", icon: Clock, color: "text-cyan-600", bgColor: "bg-cyan-50 dark:bg-cyan-900/20", borderColor: "border-cyan-200 dark:border-cyan-800" },
            { title: "Down/Accident", value: downAccident.toString(), subValue: "Attention", icon: AlertTriangle, color: "text-red-600", bgColor: "bg-red-50 dark:bg-red-900/20", borderColor: "border-red-200 dark:border-red-800" },
            { title: "Active Sites", value: activeSites.toString(), subValue: "Locations", icon: MapPin, color: "text-purple-600", bgColor: "bg-purple-50 dark:bg-purple-900/20", borderColor: "border-purple-200 dark:border-purple-800" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card className={`hover:shadow-md transition-all border ${stat.borderColor}`}>
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">{stat.title}</p>
                      <p className="text-lg font-bold leading-tight">{stat.value}</p>
                      <p className="text-[10px] text-muted-foreground">{stat.subValue}</p>
                    </div>
                    <div className={`p-1.5 rounded-md ${stat.bgColor}`}>
                      <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
          )}
        </div>

        {/* Main Dashboard Grid - 3 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          
          {/* Left Column - 5 cols */}
          <div className="lg:col-span-5 space-y-3">
            {/* Fleet Utilization Gauge */}
            <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }}>
              <Card className="border-green-200 dark:border-green-800">
                <CardHeader className="p-3 pb-1.5">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-[13px] font-semibold">Fleet Utilization</CardTitle>
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[10px] px-1.5 py-0.5">
                      <TrendingUp className="w-2.5 h-2.5 mr-0.5" /> +5.2%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-3 pt-1.5">
                  <div className="flex items-center gap-4">
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="14" className="text-gray-200 dark:text-gray-700" />
                        <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="14" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * opPct) / 100} strokeLinecap="round" className="text-green-500" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-base font-bold text-green-600">{loading ? "..." : `${opPct}%`}</span>
                      </div>
                    </div>
                    <div className="flex-1 space-y-2.5">
                      {loading ? (
                        <Skeleton className="h-16 w-full" />
                      ) : (
                        stats?.byCategory?.slice(0, 3).map((c) => {
                          const pct = total ? Math.round((c.count / total) * 100) : 0
                          return (
                            <div key={c.category}>
                              <div className="flex justify-between text-[11px]">
                                <span className="text-muted-foreground truncate max-w-[120px]">{c.category}</span>
                                <span className="font-medium">{pct}%</span>
                              </div>
                              <Progress value={pct} className="h-1.5" />
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <Card>
                <CardHeader className="p-3 pb-1.5">
                  <CardTitle className="text-[13px] font-semibold">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-1.5 grid grid-cols-2 gap-2.5">
                  {[
                    { label: "New Request", icon: FileText, color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20" },
                    { label: "Add Equipment", icon: Truck, color: "text-green-600 bg-green-50 dark:bg-green-900/20" },
                    { label: "View Reports", icon: BarChart3, color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20", href: "/equipment/dashboard" },
                    { label: "Schedule", icon: Calendar, color: "text-orange-600 bg-orange-50 dark:bg-orange-900/20" },
                  ].map((action, i) => {
                    const a = action as { href?: string }
                    if (a.href) {
                      return (
                        <Link key={i} href={a.href} className="flex items-center gap-2.5 p-2.5 border rounded-md hover:bg-muted/50 hover:border-green-300 transition-all text-left group">
                          <div className={`p-1.5 rounded-md ${action.color}`}>
                            <action.icon className="h-3.5 w-3.5" />
                          </div>
                          <span className="text-[11px] font-medium group-hover:text-green-600">{action.label}</span>
                        </Link>
                      )
                    }
                    return (
                      <button key={i} className="flex items-center gap-2.5 p-2.5 border rounded-md hover:bg-muted/50 hover:border-green-300 transition-all text-left group">
                        <div className={`p-1.5 rounded-md ${action.color}`}>
                          <action.icon className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-[11px] font-medium group-hover:text-green-600">{action.label}</span>
                      </button>
                    )
                  })}
                </CardContent>
              </Card>
            </motion.div>

            {/* KPI Summary */}
            <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <Card>
                <CardHeader className="p-3 pb-1.5">
                  <CardTitle className="text-[13px] font-semibold">Key Performance Indicators</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-1.5 space-y-2.5">
                  {[
                    { label: "MTBF (Mean Time Between Failures)", value: "245 hrs", target: "200 hrs", progress: 100, color: "bg-green-500" },
                    { label: "MTTR (Mean Time To Repair)", value: "18 hrs", target: "24 hrs", progress: 100, color: "bg-green-500" },
                    { label: "Preventive Maintenance Compliance", value: "87%", target: "90%", progress: 87, color: "bg-amber-500" },
                    { label: "Work Order Completion Rate", value: "94%", target: "95%", progress: 94, color: "bg-green-500" },
                  ].map((kpi, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-muted-foreground truncate max-w-[60%]">{kpi.label}</span>
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] font-bold">{kpi.value}</span>
                          <span className="text-[9px] text-muted-foreground">/ {kpi.target}</span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className={`h-full ${kpi.color} rounded-full`} style={{ width: `${kpi.progress}%` }} />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Middle Column - 4 cols */}
          <div className="lg:col-span-4 space-y-3">
            {/* Recent Activity */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="h-full">
                <CardHeader className="p-3 pb-1.5">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-[13px] font-semibold">Recent Assets</CardTitle>
                    <Link href="/equipment/dashboard" className="text-[10px] text-green-600 hover:underline">View All</Link>
                  </div>
                </CardHeader>
                <CardContent className="p-3 pt-1.5">
                  <div className="space-y-2">
                    {loading ? (
                      [...Array(5)].map((_, i) => <Skeleton key={i} className="h-12" />)
                    ) : report?.recentAssets?.length ? (
                      report.recentAssets.slice(0, 8).map((a, i) => (
                        <div key={i} className="flex items-center gap-2.5 p-2 border rounded-md hover:bg-muted/50 transition-colors">
                          <div className="p-1.5 rounded-full flex-shrink-0 bg-green-100 text-green-600 dark:bg-green-900/30">
                            <CheckCircle className="h-3 w-3" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-[11px] truncate">{a.asset_no ?? a.description?.slice(0, 40) ?? "—"}</p>
                            <p className="text-[10px] text-muted-foreground truncate">Status: {a.status ?? "—"}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-[11px] text-muted-foreground py-4 text-center">No recent assets</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - 3 cols */}
          <div className="lg:col-span-3 space-y-3">
            {/* Maintenance Overview */}
            <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }}>
              <Card className="border-orange-200 dark:border-orange-800">
                <CardHeader className="p-3 pb-1.5">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-[13px] font-semibold">Maintenance</CardTitle>
                    <Wrench className="w-4 h-4 text-orange-500" />
                  </div>
                </CardHeader>
                <CardContent className="p-3 pt-1.5">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-2.5 bg-orange-50 dark:bg-orange-900/20 rounded-md text-center">
                      <p className="text-base font-bold text-orange-600">24</p>
                      <p className="text-[10px] text-muted-foreground">Active</p>
                    </div>
                    <div className="p-2.5 bg-green-50 dark:bg-green-900/20 rounded-md text-center">
                      <p className="text-base font-bold text-green-600">142</p>
                      <p className="text-[10px] text-muted-foreground">Completed</p>
                    </div>
                    <div className="p-2.5 bg-amber-50 dark:bg-amber-900/20 rounded-md text-center">
                      <p className="text-base font-bold text-amber-600">8</p>
                      <p className="text-[10px] text-muted-foreground">Pending</p>
                    </div>
                    <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-md text-center">
                      <p className="text-base font-bold text-blue-600">15</p>
                      <p className="text-[10px] text-muted-foreground">Scheduled</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Alerts */}
            <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <Card className="border-red-200 dark:border-red-800">
                <CardHeader className="p-3 pb-1.5">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-[13px] font-semibold">Critical Alerts</CardTitle>
                    <Badge variant="destructive" className="text-[9px] px-1.5 py-0.5">3 New</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-3 pt-1.5 space-y-2">
                  {[
                    { msg: "EEC-EX-045 requires urgent repair", time: "5m", severity: "high" },
                    { msg: "Low fuel level at Site B", time: "15m", severity: "medium" },
                    { msg: "Scheduled maintenance overdue", time: "1h", severity: "medium" },
                  ].map((alert, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 bg-red-50 dark:bg-red-900/10 rounded-md border border-red-100 dark:border-red-900/20">
                      <AlertTriangle className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${alert.severity === 'high' ? 'text-red-600' : 'text-amber-600'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-medium text-red-800 dark:text-red-300 leading-tight">{alert.msg}</p>
                        <p className="text-[9px] text-red-600/70">{alert.time} ago</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Site Performance */}
            <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <Card>
                <CardHeader className="p-3 pb-1.5">
                  <CardTitle className="text-[13px] font-semibold">Top Sites</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-1.5 space-y-2.5">
                  {loading ? (
                    [...Array(3)].map((_, i) => <Skeleton key={i} className="h-8" />)
                  ) : report?.locationBreakdown?.length ? (
                    report.locationBreakdown
                      .filter((l) => l.location !== "Unassigned")
                      .slice(0, 5)
                      .map((site, i) => {
                        const pct = total ? Math.round((site.total / total) * 100) : 0
                        return (
                          <div key={i} className="flex items-center gap-2.5">
                            <div className="flex-1">
                              <div className="flex justify-between text-[11px] mb-0.5">
                                <span className="font-medium truncate max-w-[120px]">{site.location}</span>
                                <span className="text-green-600">{pct}%</span>
                              </div>
                              <Progress value={pct} className="h-1.5" />
                            </div>
                            <span className="text-[10px] text-muted-foreground w-14 text-right">{site.total} units</span>
                          </div>
                        )
                      })
                  ) : (
                    <p className="text-[11px] text-muted-foreground">No location data</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Bottom Row - Equipment Categories */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="p-3 pb-1.5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[13px] font-semibold">Equipment Categories Overview</CardTitle>
                <Link href="/equipment/dashboard" className="text-[10px] text-green-600 hover:underline">View Details</Link>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-1.5">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 xl:grid-cols-10 gap-2.5">
                {loading ? (
                  [...Array(6)].map((_, i) => <Skeleton key={i} className="h-20" />)
                ) : stats?.byCategory?.length ? (
                  stats.byCategory.slice(0, 10).map((cat, i) => {
                    const pct = total ? Math.round((cat.count / total) * 100) : 0
                    const colors = ["bg-orange-500", "bg-amber-500", "bg-yellow-500", "bg-lime-500", "bg-green-500", "bg-cyan-500", "bg-blue-500", "bg-purple-500", "bg-rose-500", "bg-indigo-500"]
                    return (
                      <Link key={i} href={`/equipment/${cat.category.toLowerCase().replace(/\s+/g, "-")}`} className="block">
                        <div className="p-2.5 border rounded-md hover:shadow-md hover:border-green-300 transition-all group">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-medium truncate group-hover:text-green-600">{cat.category}</span>
                            <div className={`w-2 h-2 rounded-full ${colors[i % colors.length]}`} />
                          </div>
                          <div className="text-base font-bold leading-tight">{cat.count}</div>
                          <div className="text-[9px] text-muted-foreground">{pct}% of fleet</div>
                          <div className="mt-1 h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div className={`h-full ${colors[i % colors.length]} rounded-full`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </Link>
                    )
                  })
                ) : (
                  <p className="col-span-full text-[11px] text-muted-foreground py-4 text-center">No category data</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  )
}



