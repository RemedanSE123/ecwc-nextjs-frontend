"use client"

import Layout from "@/components/Layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  Truck, 
  Wrench, 
  FileText, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  Users,
  Calendar,
  Activity,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Gauge,
  Target,
  Zap,
  MapPin,
  Settings
} from "lucide-react"
import { motion } from "framer-motion"

const fadeInUp = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
}

export default function DashboardPage() {
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
          {[
            { title: "Total Fleet", value: "1,140", subValue: "Equipment", icon: Truck, color: "text-blue-600", bgColor: "bg-blue-50 dark:bg-blue-900/20", borderColor: "border-blue-200 dark:border-blue-800" },
            { title: "Operational", value: "434", subValue: "38% Active", icon: CheckCircle, color: "text-green-600", bgColor: "bg-green-50 dark:bg-green-900/20", borderColor: "border-green-200 dark:border-green-800" },
            { title: "Under Repair", value: "187", subValue: "16% Fleet", icon: Wrench, color: "text-orange-600", bgColor: "bg-orange-50 dark:bg-orange-900/20", borderColor: "border-orange-200 dark:border-orange-800" },
            { title: "Idle", value: "34", subValue: "Available", icon: Clock, color: "text-cyan-600", bgColor: "bg-cyan-50 dark:bg-cyan-900/20", borderColor: "border-cyan-200 dark:border-cyan-800" },
            { title: "Down/Accident", value: "145", subValue: "Attention", icon: AlertTriangle, color: "text-red-600", bgColor: "bg-red-50 dark:bg-red-900/20", borderColor: "border-red-200 dark:border-red-800" },
            { title: "Active Sites", value: "31", subValue: "Nationwide", icon: MapPin, color: "text-purple-600", bgColor: "bg-purple-50 dark:bg-purple-900/20", borderColor: "border-purple-200 dark:border-purple-800" },
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
          ))}
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
                        <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="14" strokeDasharray="251.2" strokeDashoffset="96.2" strokeLinecap="round" className="text-green-500" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-base font-bold text-green-600">62%</span>
                      </div>
                    </div>
                    <div className="flex-1 space-y-2.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-muted-foreground">Machinery</span>
                        <span className="font-medium">39%</span>
                      </div>
                      <Progress value={39} className="h-1.5" />
                      <div className="flex justify-between text-[11px]">
                        <span className="text-muted-foreground">Dump Trucks</span>
                        <span className="font-medium">30%</span>
                      </div>
                      <Progress value={30} className="h-1.5" />
                      <div className="flex justify-between text-[11px]">
                        <span className="text-muted-foreground">Heavy Vehicles</span>
                        <span className="font-medium">37%</span>
                      </div>
                      <Progress value={37} className="h-1.5" />
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
                    { label: "View Reports", icon: BarChart3, color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20" },
                    { label: "Schedule", icon: Calendar, color: "text-orange-600 bg-orange-50 dark:bg-orange-900/20" },
                  ].map((action, i) => (
                    <button
                      key={i}
                      className="flex items-center gap-2.5 p-2.5 border rounded-md hover:bg-muted/50 hover:border-green-300 transition-all text-left group"
                    >
                      <div className={`p-1.5 rounded-md ${action.color}`}>
                        <action.icon className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-[11px] font-medium group-hover:text-green-600">{action.label}</span>
                    </button>
                  ))}
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
                    <CardTitle className="text-[13px] font-semibold">Recent Activity</CardTitle>
                    <button className="text-[10px] text-green-600 hover:underline">View All</button>
                  </div>
                </CardHeader>
                <CardContent className="p-3 pt-1.5">
                  <div className="space-y-2">
                    {[
                      { action: "Work order completed", equipment: "EEC-EX-012", user: "Tech. Alemayehu", time: "10m", type: "success" },
                      { action: "Maintenance scheduled", equipment: "EEC-BD-008", user: "Manager Sofia", time: "25m", type: "info" },
                      { action: "Fuel consumption report", equipment: "EEC-TR-045", user: "System", time: "1h", type: "warning" },
                      { action: "New equipment added", equipment: "EEC-CR-009", user: "Admin Michael", time: "2h", type: "success" },
                      { action: "Maintenance request", equipment: "EEC-LD-023", user: "Operator John", time: "3h", type: "info" },
                      { action: "Equipment inspection", equipment: "EEC-GR-017", user: "Tech. Samuel", time: "4h", type: "success" },
                      { action: "Parts requisition", equipment: "EEC-RL-031", user: "Tech. Yonas", time: "5h", type: "info" },
                       { action: "Equipment inspection", equipment: "EEC-GR-017", user: "Tech. Samuel", time: "4h", type: "success" },
                    ].map((activity, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2.5 p-2 border rounded-md hover:bg-muted/50 transition-colors"
                      >
                        <div className={`p-1.5 rounded-full flex-shrink-0 ${
                          activity.type === 'success' ? 'bg-green-100 text-green-600 dark:bg-green-900/30' :
                          activity.type === 'info' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' :
                          'bg-amber-100 text-amber-600 dark:bg-amber-900/30'
                        }`}>
                          {activity.type === 'success' ? <CheckCircle className="h-3 w-3" /> :
                           activity.type === 'info' ? <FileText className="h-3 w-3" /> :
                           <AlertTriangle className="h-3 w-3" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[11px] truncate">{activity.action}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{activity.equipment} • {activity.user}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground flex-shrink-0">{activity.time}</span>
                      </div>
                    ))}
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
                  {[
                    { name: "Addis Ababa", utilization: 94, equipment: 156 },
                    { name: "Bahir Dar", utilization: 87, equipment: 89 },
                    { name: "Hawassa", utilization: 82, equipment: 67 },
                  ].map((site, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <div className="flex-1">
                        <div className="flex justify-between text-[11px] mb-0.5">
                          <span className="font-medium">{site.name}</span>
                          <span className="text-green-600">{site.utilization}%</span>
                        </div>
                        <Progress value={site.utilization} className="h-1.5" />
                      </div>
                      <span className="text-[10px] text-muted-foreground w-14 text-right">{site.equipment} units</span>
                    </div>
                  ))}
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
                <button className="text-[10px] text-green-600 hover:underline">View Details</button>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-1.5">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 xl:grid-cols-10 gap-2.5">
                {[
                  { type: "Dozers", count: 52, operational: 19, color: "bg-orange-500" },
                  { type: "Graders", count: 31, operational: 13, color: "bg-amber-500" },
                  { type: "Excavators", count: 74, operational: 29, color: "bg-yellow-500" },
                  { type: "Loaders", count: 76, operational: 21, color: "bg-lime-500" },
                  { type: "Rollers", count: 66, operational: 32, color: "bg-green-500" },
                  { type: "Dump Trucks", count: 365, operational: 111, color: "bg-cyan-500" },
                  { type: "Water Trucks", count: 69, operational: 46, color: "bg-blue-500" },
                  { type: "Light Vehicles", count: 288, operational: 111, color: "bg-purple-500" },
                  { type: "Fuel Trucks", count: 25, operational: 15, color: "bg-rose-500" },
                  { type: "Cranes", count: 8, operational: 4, color: "bg-indigo-500" },
                ].map((category, i) => (
                  <div key={i} className="p-2.5 border rounded-md hover:shadow-md hover:border-green-300 transition-all cursor-pointer group">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-medium truncate group-hover:text-green-600">{category.type}</span>
                      <div className={`w-2 h-2 rounded-full ${category.color}`} />
                    </div>
                    <div className="text-base font-bold leading-tight">{category.operational}<span className="text-[11px] font-normal text-muted-foreground">/{category.count}</span></div>
                    <div className="text-[9px] text-muted-foreground">
                      {Math.round((category.operational / category.count) * 100)}% op
                    </div>
                    <div className="mt-1 h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className={`h-full ${category.color} rounded-full`} style={{ width: `${(category.operational / category.count) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  )
}



