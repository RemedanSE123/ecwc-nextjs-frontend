"use client"

import Layout from "@/components/Layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Truck, 
  Wrench, 
  FileText, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  Users,
  Calendar
} from "lucide-react"
import { motion } from "framer-motion"

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}

export default function DashboardPage() {
  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome to ECWC ERP Management System</p>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { 
              title: "Total Equipment", 
              value: "156", 
              change: "+5%", 
              icon: Truck, 
              color: "text-cyan-600",
              bgColor: "bg-cyan-50 dark:bg-cyan-900/20"
            },
            { 
              title: "Active Maintenance", 
              value: "24", 
              change: "+12%", 
              icon: Wrench, 
              color: "text-orange-600",
              bgColor: "bg-orange-50 dark:bg-orange-900/20"
            },
            { 
              title: "Completed Requests", 
              value: "142", 
              change: "+8%", 
              icon: CheckCircle, 
              color: "text-green-600",
              bgColor: "bg-green-50 dark:bg-green-900/20"
            },
            { 
              title: "Pending Approvals", 
              value: "8", 
              change: "-3%", 
              icon: AlertTriangle, 
              color: "text-red-600",
              bgColor: "bg-red-50 dark:bg-red-900/20"
            },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className={`text-xs mt-1 ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change} from last month
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest equipment operations and maintenance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { action: "Work order completed", equipment: "EEC-EX-012", user: "Tech. Alemayehu", time: "10 min ago", type: "success" },
                    { action: "Maintenance scheduled", equipment: "EEC-BD-008", user: "Manager Sofia", time: "25 min ago", type: "info" },
                    { action: "Fuel consumption report", equipment: "EEC-TR-045", user: "System", time: "1 hour ago", type: "warning" },
                    { action: "New equipment added", equipment: "EEC-CR-009", user: "Admin Michael", time: "2 hours ago", type: "success" },
                    { action: "Maintenance request created", equipment: "EEC-LD-023", user: "Operator John", time: "3 hours ago", type: "info" },
                  ].map((activity, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className={`p-2 rounded-full ${
                        activity.type === 'success' ? 'bg-green-100 text-green-600 dark:bg-green-900/30' :
                        activity.type === 'info' ? 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30' :
                        'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30'
                      }`}>
                        {activity.type === 'success' ? <CheckCircle className="h-4 w-4" /> :
                         activity.type === 'info' ? <FileText className="h-4 w-4" /> :
                         <AlertTriangle className="h-4 w-4" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">{activity.equipment} • {activity.user}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and shortcuts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { label: "Create Maintenance Request", icon: FileText, href: "/maintenance-request" },
                  { label: "Add New Equipment", icon: Truck, href: "/equipment" },
                  { label: "View Reports", icon: TrendingUp, href: "/reports" },
                  { label: "Manage Users", icon: Users, href: "/users" },
                  { label: "Schedule Maintenance", icon: Calendar, href: "/schedule" },
                ].map((action, i) => (
                  <a
                    key={i}
                    href={action.href}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <action.icon className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium">{action.label}</span>
                  </a>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Equipment Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Equipment Status Overview</CardTitle>
              <CardDescription>Current status of all equipment categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                  { type: "Earthmoving", count: 45, operational: 42, color: "bg-orange-500" },
                  { type: "Lifting", count: 18, operational: 17, color: "bg-cyan-500" },
                  { type: "Concrete", count: 22, operational: 20, color: "bg-gray-500" },
                  { type: "Transport", count: 65, operational: 62, color: "bg-teal-500" },
                  { type: "Support", count: 12, operational: 11, color: "bg-purple-500" },
                ].map((category, i) => (
                  <div key={i} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{category.type}</span>
                      <div className={`w-3 h-3 rounded-full ${category.color}`} />
                    </div>
                    <div className="text-2xl font-bold">{category.operational}/{category.count}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {Math.round((category.operational / category.count) * 100)}% operational
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



