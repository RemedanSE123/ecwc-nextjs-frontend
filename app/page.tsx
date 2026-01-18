"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  Wrench, 
  TrendingUp, 
  Shield, 
  Clock, 
  BarChart3, 
  ArrowRight, 
  Truck, 
  Settings, 
  FileText, 
  Zap, 
  Target, 
  Award,
  Building,
  Users,
  CheckCircle,
  Calendar,
  Warehouse,
  ClipboardList,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  HardHat,
  Cog,
  Database,
  AlertTriangle,
  ThumbsUp,
  Download,
  Upload,
  Filter,
  Search,
  Bell,
  MessageSquare,
  HelpCircle,
  ChevronRight,
  Star,
  Play,
  Pause,
  RotateCcw,
  Battery,
  Fuel,
  Gauge,
  Thermometer,
  Vibrate,
  CheckCircle2,
  Cpu,
  Layers,
  Scale,
  Server,
  Globe,
  QrCode,
  DollarSign,
  Activity,
  History
}  from "lucide-react"
import { motion, useScroll, useTransform } from "framer-motion"
import { ThemeToggle } from "@/components/theme-toggle"
import Image from "next/image"

// --- Equipment Command Center Data ---
const equipmentData = [
  {
    name: "Caterpillar D8 Dozer",
    assetId: "ECWC-B-042",
    status: "Active",
    statusColor: "bg-[#70c82a]",
    location: "Addis Ababa - Riverside Project",
    utilization: 87,
    lastMaintenance: "2025-12-15",
    nextMaintenance: "2026-03-10",
    totalCost: "$124,500",
    downtime: 14,
    image: "/dozer.jpg",
    accent: "from-[#70c82a]/20 to-transparent"
  },
  {
    name: "Komatsu PC210 Excavator",
    assetId: "ECWC-E-108",
    status: "Under Maintenance",
    statusColor: "bg-amber-500",
    location: "Dire Dawa Industrial Zone",
    utilization: 62,
    lastMaintenance: "2026-01-05",
    nextMaintenance: "2026-01-20",
    totalCost: "$89,200",
    downtime: 72,
    image: "/dozer.jpg", // Placeholder as requested
    accent: "from-amber-500/20 to-transparent"
  },
  {
    name: "John Deere 770G Grader",
    assetId: "ECWC-G-056",
    status: "Active",
    statusColor: "bg-[#70c82a]",
    location: "Hawassa Express Way",
    utilization: 94,
    lastMaintenance: "2025-11-20",
    nextMaintenance: "2026-02-28",
    totalCost: "$156,000",
    downtime: 8,
    image: "/dozer.jpg", // Placeholder as requested
    accent: "from-[#70c82a]/20 to-transparent"
  },
  {
    name: "Volvo L150H Loader",
    assetId: "ECWC-L-023",
    status: "Critical",
    statusColor: "bg-red-500",
    location: "Bahir Dar Site B",
    utilization: 45,
    lastMaintenance: "2025-10-12",
    nextMaintenance: "IMMEDIATE",
    totalCost: "$210,400",
    downtime: 124,
    image: "/dozer.jpg", // Placeholder as requested
    accent: "from-red-500/20 to-transparent"
  }
];

const CommandCenterSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  return (
    <section ref={containerRef} className="relative h-[400vh] bg-zinc-950">
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-center px-4 lg:px-8">
        {/* Cinematic Background Lighting */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full blur-[120px] bg-[#70c82a]/10"
            style={{
              opacity: useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.3, 0.6, 0.6, 0.3])
            }}
          />
        </div>

        <div className="container mx-auto relative z-10">
          <div className="mb-12">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-bold text-white mb-2 tracking-tight"
            >
              ECWC <span className="text-[#70c82a]">Equipment Command Center</span>
            </motion.h2>
            <p className="text-zinc-400 text-lg md:text-xl font-medium">Every machine. Every detail. One intelligent system.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Image Panel */}
            <div className="relative h-[300px] md:h-[500px] flex items-center justify-center">
              {equipmentData.map((item, index) => {
                const start = index / equipmentData.length;
                const end = (index + 1) / equipmentData.length;
                
                // Parallax and slide animations
                const opacity = useTransform(scrollYProgress, 
                  [start, start + 0.1, end - 0.1, end], 
                  [0, 1, 1, 0]
                );
                const x = useTransform(scrollYProgress,
                  [start, start + 0.1, end - 0.1, end],
                  [100, 0, 0, -100]
                );
                const scale = useTransform(scrollYProgress,
                  [start, start + 0.1, end - 0.1, end],
                  [0.8, 1, 1, 0.8]
                );
                const parallaxX = useTransform(scrollYProgress,
                  [start, end],
                  [-20, 20]
                );

                return (
                  <motion.div
                    key={index}
                    style={{ opacity, x, scale }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-tr ${item.accent} blur-3xl opacity-30 rounded-full`} />
                    <motion.div style={{ x: parallaxX }} className="relative w-full h-full">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-contain drop-shadow-[0_0_50px_rgba(112,200,42,0.2)]"
                        priority
                        unoptimized
                      />
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>

            {/* Right: Data Panel */}
            <div className="relative h-[400px] flex flex-col justify-center">
              {equipmentData.map((item, index) => {
                const start = index / equipmentData.length;
                const end = (index + 1) / equipmentData.length;
                
                const opacity = useTransform(scrollYProgress, 
                  [start, start + 0.1, end - 0.1, end], 
                  [0, 1, 1, 0]
                );
                const y = useTransform(scrollYProgress,
                  [start, start + 0.1, end - 0.1, end],
                  [50, 0, 0, -50]
                );

                return (
                  <motion.div
                    key={index}
                    style={{ opacity, y }}
                    className="absolute inset-0 space-y-8"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${item.statusColor} animate-pulse shadow-[0_0_15px_${item.statusColor === 'bg-[#70c82a]' ? 'rgba(112,200,42,0.5)' : 'rgba(245,158,11,0.5)'}]`} />
                        <span className="text-sm font-bold tracking-widest uppercase text-zinc-500">{item.status}</span>
                      </div>
                      <h3 className="text-3xl md:text-5xl font-bold text-white tracking-tight">{item.name}</h3>
                      <p className="text-[#70c82a] font-mono text-xl">{item.assetId}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                      <div className="space-y-1">
                        <p className="text-xs uppercase tracking-wider text-zinc-500">Utilization</p>
                        <div className="text-2xl font-bold text-white">
                          <AnimatedCounter value={item.utilization} duration={1000} />%
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs uppercase tracking-wider text-zinc-500">Downtime</p>
                        <div className="text-2xl font-bold text-white">
                          <AnimatedCounter value={item.downtime} duration={1000} />h
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs uppercase tracking-wider text-zinc-500">Last Service</p>
                        <p className="text-lg font-medium text-white">{item.lastMaintenance}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs uppercase tracking-wider text-zinc-500">Next Due</p>
                        <p className={`text-lg font-medium ${item.status === 'Critical' ? 'text-red-500' : 'text-white'}`}>{item.nextMaintenance}</p>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-zinc-800 space-y-4">
                      <div className="flex items-center gap-3 text-zinc-400">
                        <MapPin className="w-5 h-5 text-[#70c82a]" />
                        <span className="text-sm">{item.location}</span>
                      </div>
                      <div className="flex items-center gap-3 text-zinc-400">
                        <TrendingUp className="w-5 h-5 text-[#70c82a]" />
                        <span className="text-sm">Total Maintenance Investment: <span className="text-white font-bold">{item.totalCost}</span></span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5 }
}

// Animated Counter Component
const AnimatedCounter = ({ value, duration = 2000 }: { value: number; duration?: number }) => {
  const [count, setCount] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0
          const end = value
          const increment = end / (duration / 16)
          const timer = setInterval(() => {
            start += increment
            if (start >= end) {
              setCount(end)
              clearInterval(timer)
            } else {
              setCount(Math.floor(start))
            }
          }, 16)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [value, duration])

  return <span ref={ref}>{count}+</span>
}

// Animated Progress Component
const AnimatedProgress = ({ value, duration = 1500 }: { value: number; duration?: number }) => {
  const [progress, setProgress] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0
          const end = value
          const increment = end / (duration / 16)
          const timer = setInterval(() => {
            start += increment
            if (start >= end) {
              setProgress(end)
              clearInterval(timer)
            } else {
              setProgress(Math.floor(start))
            }
          }, 16)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [value, duration])

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">Equipment Uptime</span>
        <span className="text-muted-foreground">{progress}%</span>
      </div>
      <Progress value={90} className="h-2" />
    </div>
  )
}

// Animated Progress Bar Component for Equipment Status - KEEPING ORIGINAL COLORS
const AnimatedEquipmentProgress = ({ 
  name, 
  operational, 
  total, 
  duration = 1800 
}: { 
  name: string; 
  operational: number; 
  total: number; 
  duration?: number;
}) => {
  const [progress, setProgress] = useState(0)
  const ref = useRef(null)
  const percentage = (operational / total) * 100

  // Determine color based on percentage (keeping original logic)
  const getProgressColor = (percent: number) => {
    if (percent >= 80) return "bg-green-500"
    if (percent >= 60) return "bg-amber-500"
    return "bg-red-500"
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0
          const end = percentage
          const increment = end / (duration / 16)
          const timer = setInterval(() => {
            start += increment
            if (start >= end) {
              setProgress(end)
              clearInterval(timer)
            } else {
              setProgress(start)
            }
          }, 16)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [percentage, duration])

  return (
    <div className="space-y-2" ref={ref}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{name}</span>
        <span className="text-muted-foreground">
          {operational}/{total}
        </span>
      </div>
      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
      <motion.div
  className={`h-full rounded-full bg-gradient-to-r from-cyan-600 to-cyan-400`}
  initial={{ width: 0 }}
  animate={{ width: `${progress}%` }}
  transition={{ duration: duration / 1000, ease: "easeOut" }}
/>

      </div>
    </div>
  )
}

export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(false)

  // Set dark mode as default
  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="border-b bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 sticky top-0 z-50"
      >
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center justify-center"
              >
                <Image
                  src="/ECWC-Official-Logo.png"
                  alt="ECWC Logo"
                  width={80}
                  height={80}
                  className="object-contain"
                  quality={100}
                  unoptimized
                  priority
                />
              </motion.div>

              <div className="flex flex-col">
                <span className="text-sm font-bold bg-gradient-to-r from-cyan-600 to-teal-500 bg-clip-text text-transparent">
                   Ethiopian Engineering Corporation - Construction
                </span>
                <span className="text-xs text-muted-foreground font-medium">Internal Management System</span>
              </div>
            </motion.div>

            <nav className="hidden md:flex items-center gap-8">
              {["Features", "Equipment", "Dashboard", "Support"].map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  <Link
                    href={`#${item.toLowerCase()}`}
                    className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors relative group"
                  >
                    {item}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-500 transition-all group-hover:w-full" />
                  </Link>
                </motion.div>
              ))}
            </nav>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
              className="flex items-center gap-3"
            >
              <Button variant="outline" size="sm" asChild>
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700" asChild>
                <Link href="/sign-up">Sign Up</Link>
              </Button>
              <ThemeToggle />
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-10 lg:py-16">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/50 via-background to-background dark:from-cyan-950/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(34,211,238,0.1),transparent_50%)]" />
        
        <div className="container mx-auto px-4 lg:px-8 relative">
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="max-w-6xl mx-auto"
          >
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <motion.div variants={fadeInUp} className="space-y-8">
                <motion.div
                  variants={fadeInUp}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 text-sm font-semibold border border-cyan-200 dark:border-cyan-800"
                >
                  <Shield className="h-4 w-4" />
                  Internal Enterprise Management Platform
                </motion.div>

                <motion.h1
                  variants={fadeInUp}
                  className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight"
                >
                  ECWC{" "}
                  <span className="bg-gradient-to-r from-cyan-600 to-teal-500 bg-clip-text text-transparent">
                      Maintenance Management System
                  </span>
                </motion.h1>

                <motion.p
                  variants={fadeInUp}
                  className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl"
                >
                  Empowering <b>ETHIOPIAN CONSTRUCTION WORKS CORPORATION (ECWC)</b> / <b>የኢትዮጵያ ኮንቦትሬክሽን ምልዎት ኮርፖሬሽን</b> with a unified digital system to efficiently manage
                  <b> inventory</b>, <b>work orders</b>, <b>maintenance</b>, <b>requests</b>, and <b>invoices</b> — promoting
                  transparency and operational excellence across all divisions.
                </motion.p>

                <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="gap-2 text-base h-12 px-8 bg-cyan-600 hover:bg-cyan-700" asChild>
                    <Link href="/dashboard">
                      Access System
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="gap-2 text-base h-12 px-8">
                    <Play className="h-5 w-5" />
                    View Demo
                  </Button>
                </motion.div>

                {/* Stats */}
                <motion.div variants={fadeInUp} className="grid grid-cols-3 gap-8 pt-8">
                  {[
                    { value: 150, label: "Equipment" },
                    { value: 98, label: "Uptime" },
                    { value: 24, label: "Monitoring" }
                  ].map((stat, i) => (
                    <div key={i} className="text-center">
                      <div className="text-2xl font-bold text-foreground">
                        <AnimatedCounter value={stat.value} />
                      </div>
                      <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                    </div>
                  ))}
                </motion.div>
              </motion.div>

              {/* Right Content - Dashboard Preview */}
              <motion.div
                variants={scaleIn}
                className="relative"
              >
                <Card className="relative overflow-hidden border-0 shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-teal-500/10" />
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Live Equipment Dashboard</CardTitle>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        <div className="h-2 w-2 bg-green-500 rounded-full mr-2" />
                        Live
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Animated Progress */}
                    <AnimatedProgress value={98} />

                    {/* Equipment Status with Animated Progress Bars - KEEPING ORIGINAL COLORS */}
                    <div className="space-y-4">
                      <AnimatedEquipmentProgress 
                        name="Excavators" 
                        operational={12} 
                        total={15} 
                        duration={1600}
                      />
                      <AnimatedEquipmentProgress 
                        name="Bulldozers" 
                        operational={8} 
                        total={10} 
                        duration={1800}
                      />
                      <AnimatedEquipmentProgress 
                        name="Loaders" 
                        operational={15} 
                        total={18} 
                        duration={2000}
                      />
                      <AnimatedEquipmentProgress 
                        name="Dump Trucks" 
                        operational={22} 
                        total={25} 
                        duration={2200}
                      />
                    </div>

                    {/* Quick Stats with Animation - KEEPING ORIGINAL COLORS */}
                    <motion.div 
                      className="grid grid-cols-2 gap-4 pt-4"
                      initial="initial"
                      whileInView="animate"
                      viewport={{ once: true }}
                      variants={staggerContainer}
                    >
                      {[
                        { value: "24", label: "Active WO", color: "bg-cyan-50 dark:bg-cyan-900/20", textColor: "text-cyan-600" },
                        { value: "156", label: "Total Assets", color: "bg-green-50 dark:bg-green-900/20", textColor: "text-green-600" }
                      ].map((stat, i) => (
                        <motion.div
                          key={i}
                          variants={fadeInUp}
                          className={`text-center p-3 rounded-lg ${stat.color} hover:scale-105 transition-transform duration-300`}
                        >
                          <motion.div 
                            className={`text-lg font-bold ${stat.textColor}`}
                            initial={{ scale: 0 }}
                            whileInView={{ scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.5 + i * 0.1, type: "spring", stiffness: 200 }}
                          >
                            {stat.value}
                          </motion.div>
                          <div className="text-xs text-muted-foreground">{stat.label}</div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </CardContent>
                </Card>

                {/* Floating Animation Elements */}
                <motion.div
                  className="absolute -top-4 -right-4 w-8 h-8 bg-cyan-500 rounded-full opacity-20"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.2, 0.4, 0.2],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <motion.div
                  className="absolute -bottom-2 -left-2 w-6 h-6 bg-teal-500 rounded-full opacity-30"
                  animate={{
                    scale: [1, 1.8, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1,
                  }}
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ECWC System Overview Video Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-b from-background via-zinc-950 to-black overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(112,200,42,0.05),transparent_70%)]" />
        <motion.div 
          className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#70c82a] to-transparent"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5 }}
        />

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#70c82a]/10 text-[#70c82a] text-xs font-bold uppercase tracking-widest mb-6 border border-[#70c82a]/20">
              <Play className="w-4 h-4" />
              System Overview
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Experience <span className="text-[#70c82a]">ECWC Plant Management</span> in Action
            </h2>
            <p className="text-zinc-400 text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed">
              See how our comprehensive digital platform transforms heavy equipment management, maintenance operations, and fleet oversight for Ethiopia's largest construction corporation.
            </p>
          </motion.div>

          {/* Video Container with Cinematic Frame */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
            className="max-w-6xl mx-auto relative group"
          >
            {/* Glowing Border Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#70c82a] via-emerald-500 to-teal-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
            
            {/* Video Frame */}
            <div className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-2xl">
              {/* Video Player */}
              <div className="relative aspect-video bg-black">
                <video
                  controls
                  playsInline
                  className="w-full h-full object-cover"
                  poster="/dozer.jpg"
                >
                  <source src="/erp video.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                
                {/* Video Overlay Stats */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-white">156</div>
                      <div className="text-xs text-zinc-400 uppercase tracking-wider">Equipment Units</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-[#70c82a]">94.3%</div>
                      <div className="text-xs text-zinc-400 uppercase tracking-wider">Fleet Uptime</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">31</div>
                      <div className="text-xs text-zinc-400 uppercase tracking-wider">Active Sites</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Video Info Bar */}
              <div className="p-6 border-t border-zinc-800">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-white font-bold text-lg mb-1">ECWC Plant & Maintenance Management System</h3>
                    <p className="text-zinc-400 text-sm">Comprehensive overview of features, capabilities, and operational excellence</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" className="gap-2 border-zinc-700 hover:border-[#70c82a]">
                      <Download className="w-4 h-4" />
                      Brochure
                    </Button>
                    <Button size="sm" className="gap-2 bg-[#70c82a] hover:bg-[#5fa822] text-black font-semibold">
                      Request Demo
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Feature Cards */}
      <motion.div 
              initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }} 
        viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="hidden lg:block absolute -left-12 top-1/4 w-64 p-4 rounded-xl bg-zinc-900 border border-zinc-800 shadow-xl"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-[#70c82a]/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-[#70c82a]" />
        </div>
                <div>
                  <div className="text-white font-bold text-sm">Government-Grade</div>
                  <div className="text-zinc-500 text-xs">Security & Compliance</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="hidden lg:block absolute -right-12 bottom-1/4 w-64 p-4 rounded-xl bg-zinc-900 border border-zinc-800 shadow-xl"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-[#70c82a]/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-[#70c82a]" />
                </div>
                <div>
                  <div className="text-white font-bold text-sm">Real-Time Analytics</div>
                  <div className="text-zinc-500 text-xs">Live Equipment Monitoring</div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Key Features Grid Below Video */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid md:grid-cols-4 gap-6 mt-16 max-w-6xl mx-auto"
          >
            {[
              { icon: HardHat, label: "Equipment Tracking", value: "Real-time GPS" },
              { icon: Wrench, label: "Smart Maintenance", value: "AI-Powered" },
              { icon: BarChart3, label: "Executive Reports", value: "Live Dashboards" },
              { icon: Server, label: "Multi-Site Ready", value: "31 Locations" }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="text-center p-6 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-[#70c82a]/30 transition-all group"
              >
                <div className="w-12 h-12 rounded-lg bg-[#70c82a]/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-[#70c82a]" />
                </div>
                <h4 className="text-white font-bold text-sm mb-1">{feature.label}</h4>
                <p className="text-zinc-500 text-xs">{feature.value}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ECWC Equipment Command Center */}
      <CommandCenterSection />

      {/* Core Functional Areas - Enterprise Data-Driven */}
      <section id="features" className="py-32 bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(112,200,42,0.03),transparent_70%)]" />
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#70c82a]/10 text-[#70c82a] text-xs font-bold uppercase tracking-widest mb-6 border border-[#70c82a]/20">
              Enterprise Architecture
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Core <span className="text-[#70c82a]">Functional Areas</span>
        </h2>
            <p className="text-zinc-400 text-lg max-w-3xl mx-auto">
              Comprehensive operational intelligence platform built for national-scale infrastructure management
            </p>
          </motion.div>

          {/* Plant & Equipment Management - Left/Right with Table */}
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-32">
      <motion.div 
              initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }} 
        viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-[#70c82a]/10 flex items-center justify-center border border-[#70c82a]/20">
                  <HardHat className="w-8 h-8 text-[#70c82a]" />
        </div>
                <div>
                  <div className="text-xs text-[#70c82a] font-bold uppercase tracking-wider mb-1">Module 01</div>
                  <h3 className="text-3xl font-bold text-white">Plant & Equipment Management</h3>
                </div>
              </div>
              <p className="text-zinc-400 text-lg leading-relaxed">
                Centralized digital asset registry providing complete lifecycle visibility across all ECWC machinery with real-time location tracking and valuation.
              </p>
              <div className="space-y-4">
                {[
                  { icon: Database, label: "Centralized Asset Register", value: "156 Units Tracked" },
                  { icon: MapPin, label: "Location & Condition", value: "GPS-Enabled Live" },
                  { icon: History, label: "Full Maintenance History", value: "2,847 Records" },
                  { icon: DollarSign, label: "Lifecycle Cost Analytics", value: "$12.4M Managed" },
                  { icon: QrCode, label: "QR Code Identification", value: "Instant Mobile ID" }
          ].map((item, i) => (
                  <motion.div
              key={i} 
                    initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-zinc-900/30 border border-zinc-800 hover:border-[#70c82a]/30 transition-all group"
                  >
                    <item.icon className="w-5 h-5 text-[#70c82a] group-hover:scale-110 transition-transform" />
                    <div className="flex-1">
                      <div className="text-white font-semibold text-sm">{item.label}</div>
                      <div className="text-zinc-500 text-xs">{item.value}</div>
              </div>
                    <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-[#70c82a] transition-colors" />
                  </motion.div>
          ))}
              </div>
      </motion.div>

      <motion.div
              initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
              transition={{ duration: 0.8 }}
        className="relative"
      >
              <div className="absolute inset-0 bg-[#70c82a]/5 blur-3xl rounded-full" />
              <div className="relative p-6 rounded-2xl bg-zinc-950 border border-zinc-800">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-800">
                  <div className="text-white font-bold">Equipment Registry Overview</div>
                  <Badge className="bg-[#70c82a] text-black">Live Data</Badge>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-zinc-800">
                        <th className="text-left py-3 px-2 text-xs font-bold text-zinc-400 uppercase">Asset ID</th>
                        <th className="text-left py-3 px-2 text-xs font-bold text-zinc-400 uppercase">Type</th>
                        <th className="text-left py-3 px-2 text-xs font-bold text-zinc-400 uppercase">Status</th>
                        <th className="text-right py-3 px-2 text-xs font-bold text-zinc-400 uppercase">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { id: "ECWC-B-042", type: "Dozer", status: "Active", value: "$124.5K", color: "bg-[#70c82a]" },
                        { id: "ECWC-E-108", type: "Excavator", status: "Maint.", value: "$89.2K", color: "bg-amber-500" },
                        { id: "ECWC-G-056", type: "Grader", status: "Active", value: "$156K", color: "bg-[#70c82a]" },
                        { id: "ECWC-L-023", type: "Loader", status: "Critical", value: "$210.4K", color: "bg-red-500" },
                        { id: "ECWC-T-091", type: "Truck", status: "Active", value: "$78.3K", color: "bg-[#70c82a]" }
                      ].map((row, i) => (
                        <motion.tr 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                          className="border-b border-zinc-800/50 hover:bg-zinc-900/30 transition-colors"
                        >
                          <td className="py-3 px-2 text-sm font-mono text-zinc-300">{row.id}</td>
                          <td className="py-3 px-2 text-sm text-zinc-400">{row.type}</td>
                          <td className="py-3 px-2">
                            <span className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${row.color}`} />
                              <span className="text-xs text-zinc-400">{row.status}</span>
                            </span>
                          </td>
                          <td className="py-3 px-2 text-right text-sm font-semibold text-white">{row.value}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-6 pt-4 border-t border-zinc-800 flex justify-between items-center">
                  <div className="text-xs text-zinc-500">Total Fleet Value</div>
                  <div className="text-2xl font-bold text-[#70c82a]">$12.4M</div>
                  </div>
                </div>
            </motion.div>
          </div>

          {/* Maintenance Management - Right/Left with KPI Grid */}
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-32">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="order-2 lg:order-1 relative"
            >
              <div className="p-8 rounded-2xl bg-zinc-950 border border-zinc-800">
                <div className="text-white font-bold mb-6">Maintenance KPI Dashboard</div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[
                    { label: "MTBF", value: "847h", trend: "+12%", icon: TrendingUp, color: "text-[#70c82a]" },
                    { label: "MTTR", value: "4.2h", trend: "-8%", icon: Clock, color: "text-[#70c82a]" },
                    { label: "Uptime", value: "94.3%", trend: "+2.1%", icon: CheckCircle, color: "text-[#70c82a]" },
                    { label: "Preventive", value: "78%", trend: "+5%", icon: Shield, color: "text-[#70c82a]" }
                  ].map((kpi, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                        <span className="text-xs font-bold text-[#70c82a]">{kpi.trend}</span>
                      </div>
                      <div className="text-2xl font-bold text-white mb-1">{kpi.value}</div>
                      <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">{kpi.label}</div>
              </motion.div>
            ))}
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Work Orders This Month", value: 124, max: 150 },
                    { label: "Scheduled Maintenance", value: 89, max: 150 },
                    { label: "Emergency Responses", value: 12, max: 150 }
                  ].map((bar, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-xs text-zinc-400 mb-1">
                        <span>{bar.label}</span>
                        <span className="font-bold text-white">{bar.value}</span>
                      </div>
                      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${(bar.value / bar.max) * 100}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: i * 0.2 }}
                          className="h-full bg-gradient-to-r from-[#70c82a] to-emerald-400 rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="order-1 lg:order-2 space-y-8"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-[#70c82a]/10 flex items-center justify-center border border-[#70c82a]/20">
                  <Wrench className="w-8 h-8 text-[#70c82a]" />
                </div>
                <div>
                  <div className="text-xs text-[#70c82a] font-bold uppercase tracking-wider mb-1">Module 02</div>
                  <h3 className="text-3xl font-bold text-white">Maintenance Management</h3>
                </div>
              </div>
              <p className="text-zinc-400 text-lg leading-relaxed">
                Unified preventive and corrective maintenance system with automated scheduling, real-time technician tracking, and comprehensive failure analysis.
              </p>
              <div className="space-y-4">
                {[
                  "Preventive & Corrective Maintenance in one system",
                  "Scheduled preventive maintenance",
                  "Emergency & breakdown handling",
                  "Work order planning & approvals",
                  "Technician assignment & tracking",
                  "Downtime and failure analysis"
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-3 text-zinc-300"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-[#70c82a]" />
                    <span className="text-sm">{item}</span>
                  </motion.div>
                ))}
              </div>
      </motion.div>
    </div>

          {/* Workforce & Time Sheet Management - Left/Right */}
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-32">
      <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-[#70c82a]/10 flex items-center justify-center border border-[#70c82a]/20">
                  <Clock className="w-8 h-8 text-[#70c82a]" />
                </div>
                <div>
                  <div className="text-xs text-[#70c82a] font-bold uppercase tracking-wider mb-1">Module 03</div>
                  <h3 className="text-3xl font-bold text-white">Workforce & Time Sheet Management</h3>
                </div>
              </div>
              <p className="text-zinc-400 text-lg leading-relaxed">
                Comprehensive labor management system tracking technician performance, overtime, and productivity with automated payroll integration.
              </p>
              <div className="space-y-4">
                {[
                  "Technician time tracking per job",
                  "Labor cost calculation",
                  "Shift & overtime control",
                  "Productivity monitoring",
                  "Payroll-ready data"
                ].map((item, i) => (
                  <motion.div
                    key={i}
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-3 text-zinc-300"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-[#70c82a]" />
                    <span className="text-sm">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="p-8 rounded-2xl bg-zinc-950 border border-zinc-800">
                <div className="text-white font-bold mb-6">Weekly Workforce Analytics</div>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[
                    { label: "Total Hours", value: "1,247", icon: Clock, color: "text-[#70c82a]" },
                    { label: "Overtime", value: "89h", icon: TrendingUp, color: "text-amber-500" },
                    { label: "Technicians", value: "42", icon: Users, color: "text-blue-500" }
                  ].map((stat, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                      className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 text-center"
                    >
                      <stat.icon className={`w-5 h-5 ${stat.color} mx-auto mb-2`} />
                      <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                      <div className="text-[10px] text-zinc-500 uppercase font-bold">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
                <div className="space-y-3 mb-6">
                  <div className="text-sm text-zinc-400 mb-2">Productivity by Shift</div>
                  {[
                    { shift: "Morning Shift", hours: 428, productivity: 96, color: "bg-[#70c82a]" },
                    { shift: "Day Shift", hours: 512, productivity: 88, color: "bg-blue-500" },
                    { shift: "Night Shift", hours: 307, productivity: 82, color: "bg-amber-500" }
                  ].map((shift, i) => (
                    <div key={i} className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-white font-semibold">{shift.shift}</span>
                        <span className="text-xs text-zinc-400">{shift.hours}h</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${shift.productivity}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: i * 0.2 }}
                            className={`h-full ${shift.color} rounded-full`}
                          />
                        </div>
                        <span className="text-xs font-bold text-white">{shift.productivity}%</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-zinc-800 flex justify-between items-center">
                  <div className="text-xs text-zinc-500">Total Labor Cost This Week</div>
                  <div className="text-2xl font-bold text-[#70c82a]">$47,850</div>
                </div>
                  </div>
            </motion.div>
          </div>

          {/* Spare Parts & Inventory Control - Right/Left */}
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-32">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="order-2 lg:order-1 relative"
            >
              <div className="p-8 rounded-2xl bg-zinc-950 border border-zinc-800">
                <div className="text-white font-bold mb-6">Inventory Status Overview</div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[
                    { label: "Total SKUs", value: "2,847", trend: "+12", color: "text-[#70c82a]" },
                    { label: "In Stock", value: "2,681", trend: "+8", color: "text-[#70c82a]" },
                    { label: "Low Stock", value: "124", trend: "+4", color: "text-amber-500" },
                    { label: "Out of Stock", value: "42", trend: "-3", color: "text-red-500" }
                  ].map((stat, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                        <span className="text-xs font-bold text-zinc-500">{stat.trend}</span>
                      </div>
                      <div className="text-[10px] text-zinc-500 uppercase font-bold">{stat.label}</div>
                </motion.div>
              ))}
            </div>
                <div className="mb-6">
                  <div className="text-sm text-zinc-400 mb-3">Recent Parts Issued</div>
                  <div className="space-y-2">
                    {[
                      { part: "Hydraulic Filter HF-208", qty: "12", wo: "WO-2847", cost: "$1,240" },
                      { part: "Engine Oil 15W-40 (Drum)", qty: "8", wo: "WO-2851", cost: "$2,880" },
                      { part: "Air Filter Element AF-501", qty: "24", wo: "WO-2856", cost: "$960" },
                      { part: "Brake Pad Set BP-410", qty: "6", wo: "WO-2859", cost: "$1,440" }
                    ].map((issue, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/30 border border-zinc-800 text-xs">
                        <div className="flex-1">
                          <div className="text-white font-semibold mb-1">{issue.part}</div>
                          <div className="text-zinc-500">QTY: {issue.qty} • {issue.wo}</div>
                        </div>
                        <div className="text-white font-bold">{issue.cost}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pt-4 border-t border-zinc-800 flex justify-between items-center">
                  <div className="text-xs text-zinc-500">Total Inventory Value</div>
                  <div className="text-2xl font-bold text-[#70c82a]">$1.8M</div>
                </div>
              </div>
      </motion.div>

      <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="order-1 lg:order-2 space-y-8"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-[#70c82a]/10 flex items-center justify-center border border-[#70c82a]/20">
                  <Warehouse className="w-8 h-8 text-[#70c82a]" />
                </div>
                <div>
                  <div className="text-xs text-[#70c82a] font-bold uppercase tracking-wider mb-1">Module 04</div>
                  <h3 className="text-3xl font-bold text-white">Spare Parts & Inventory Control</h3>
                </div>
              </div>
              <p className="text-zinc-400 text-lg leading-relaxed">
                Real-time inventory management across multiple warehouses with automated minimum stock alerts and comprehensive consumption tracking.
              </p>
              <div className="space-y-4">
                {[
                  "Real-time spare parts availability",
                  "Multi-store & warehouse control",
                  "Minimum stock alerts",
                  "Parts issued per work order",
                  "Consumption & wastage analysis"
                ].map((item, i) => (
                  <motion.div
                    key={i}
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-3 text-zinc-300"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-[#70c82a]" />
                    <span className="text-sm">{item}</span>
                  </motion.div>
                ))}
        </div>
            </motion.div>
          </div>

          {/* Cost Control & Budget Monitoring - Left/Right */}
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-32">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-[#70c82a]/10 flex items-center justify-center border border-[#70c82a]/20">
                  <DollarSign className="w-8 h-8 text-[#70c82a]" />
                </div>
                <div>
                  <div className="text-xs text-[#70c82a] font-bold uppercase tracking-wider mb-1">Module 05</div>
                  <h3 className="text-3xl font-bold text-white">Cost Control & Budget Monitoring</h3>
                </div>
              </div>
              <p className="text-zinc-400 text-lg leading-relaxed">
                Comprehensive financial oversight tracking maintenance costs, labor expenses, and budget performance across all sites and projects.
              </p>
              <div className="space-y-4">
                {[
                  "Maintenance cost per equipment",
                  "Labor, spare parts & external service costs",
                  "Budget vs actual monitoring",
                  "Cost comparison by site & project",
                  "Identification of high-cost assets"
          ].map((item, i) => (
                  <motion.div
              key={i} 
                    initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-3 text-zinc-300"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-[#70c82a]" />
                    <span className="text-sm">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="p-8 rounded-2xl bg-zinc-950 border border-zinc-800">
                <div className="text-white font-bold mb-6">Monthly Cost Analysis</div>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[
                    { label: "Budget", value: "$285K", icon: Target },
                    { label: "Actual", value: "$267K", icon: DollarSign },
                    { label: "Variance", value: "-6.3%", icon: TrendingUp }
                  ].map((stat, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
                      className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 text-center"
                    >
                      <stat.icon className="w-5 h-5 text-[#70c82a] mx-auto mb-2" />
                      <div className="text-xl font-bold text-white mb-1">{stat.value}</div>
                      <div className="text-[10px] text-zinc-500 uppercase font-bold">{stat.label}</div>
                    </motion.div>
                  ))}
              </div>
                <div className="space-y-3 mb-6">
                  <div className="text-sm text-zinc-400 mb-2">Cost Breakdown</div>
                  {[
                    { category: "Labor Costs", amount: "$112K", percent: 42, color: "bg-[#70c82a]" },
                    { category: "Spare Parts", amount: "$89K", percent: 33, color: "bg-blue-500" },
                    { category: "External Services", amount: "$47K", percent: 18, color: "bg-amber-500" },
                    { category: "Other Expenses", amount: "$19K", percent: 7, color: "bg-zinc-600" }
                  ].map((item, i) => (
                    <div key={i} className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-white font-semibold">{item.category}</span>
                        <span className="text-sm text-white font-bold">{item.amount}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${item.percent}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: i * 0.2 }}
                            className={`h-full ${item.color} rounded-full`}
                          />
                        </div>
                        <span className="text-xs font-bold text-zinc-400">{item.percent}%</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 rounded-xl bg-[#70c82a]/5 border border-[#70c82a]/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-zinc-500 mb-1">Under Budget</div>
                      <div className="text-2xl font-bold text-[#70c82a]">$18,000</div>
                    </div>
                    <CheckCircle className="w-8 h-8 text-[#70c82a]" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Executive Dashboards & Reports - Right/Left */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
        <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="order-2 lg:order-1 relative"
            >
              <div className="p-8 rounded-2xl bg-gradient-to-br from-[#70c82a]/5 via-zinc-950 to-zinc-950 border border-[#70c82a]/20">
                <div className="text-white font-bold mb-6">Executive Command Center</div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[
                    { metric: "Uptime", value: "94.3%", trend: "+2.1%", color: "text-[#70c82a]" },
                    { metric: "MTBF", value: "847h", trend: "+12%", color: "text-[#70c82a]" },
                    { metric: "MTTR", value: "4.2h", trend: "-8%", color: "text-[#70c82a]" },
                    { metric: "Efficiency", value: "91.7%", trend: "+3.5%", color: "text-[#70c82a]" }
                  ].map((kpi, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800"
                    >
                      <div className="text-xs text-zinc-500 mb-1">{kpi.metric}</div>
                      <div className={`text-2xl font-bold ${kpi.color} mb-1`}>{kpi.value}</div>
                      <div className="text-xs font-bold text-[#70c82a]">{kpi.trend}</div>
                    </motion.div>
                  ))}
                </div>
                <div className="space-y-3 mb-6">
                  {[
                    { label: "Site Performance Comparison", sites: ["Addis Ababa", "Dire Dawa", "Bahir Dar"], values: [94, 87, 91] },
                    { label: "Monthly Cost Trends", sites: ["Jan", "Feb", "Mar"], values: [85, 92, 88] },
                    { label: "Inventory Valuation", sites: ["Q1", "Q2", "Q3"], values: [78, 85, 92] }
                  ].map((chart, i) => (
                    <div key={i} className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
                      <div className="text-xs text-zinc-400 mb-3">{chart.label}</div>
                      <div className="flex items-end gap-2 h-20">
                        {chart.values.map((val, j) => (
                          <div key={j} className="flex-1 flex flex-col items-center gap-1">
                            <motion.div
                              initial={{ height: 0 }}
                              whileInView={{ height: `${val}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 1, delay: i * 0.2 + j * 0.1 }}
                              className="w-full bg-gradient-to-t from-[#70c82a] to-emerald-400 rounded-t"
                            />
                            <span className="text-[10px] text-zinc-500">{chart.sites[j]}</span>
            </div>
          ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-center p-4 rounded-xl bg-zinc-900/30 border border-zinc-800">
                  <div className="text-2xl font-bold text-white mb-1">One dashboard. <span className="text-[#70c82a]">One glance.</span></div>
                  <div className="text-sm text-zinc-500">Full control.</div>
                </div>
              </div>
        </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="order-1 lg:order-2 space-y-8"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-[#70c82a]/10 flex items-center justify-center border border-[#70c82a]/20">
                  <BarChart3 className="w-8 h-8 text-[#70c82a]" />
                </div>
                <div>
                  <div className="text-xs text-[#70c82a] font-bold uppercase tracking-wider mb-1">Module 06</div>
                  <h3 className="text-3xl font-bold text-white">Executive Dashboards & Reports</h3>
                </div>
              </div>
              <p className="text-zinc-400 text-lg leading-relaxed">
                Comprehensive executive-level visibility with real-time KPIs, site performance comparisons, and strategic cost analytics for leadership decision-making.
              </p>
              <div className="space-y-4">
                {[
                  "Equipment uptime & downtime",
                  "Maintenance KPIs (MTBF, MTTR)",
                  "Monthly & annual cost reports",
                  "Inventory valuation",
                  "Site & project performance comparison"
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-3 text-zinc-300"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-[#70c82a]" />
                    <span className="text-sm">{item}</span>
      </motion.div>
                ))}
    </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* AI-Powered Decision Support - Professional Analytics */}
      <section className="py-32 bg-zinc-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950 to-black" />
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
    <motion.div
            initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#70c82a]/10 text-[#70c82a] text-xs font-bold uppercase tracking-widest mb-6 border border-[#70c82a]/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#70c82a] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#70c82a]"></span>
              </span>
              High-Impact Feature
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
              AI-Powered <span className="text-[#70c82a]">Decision Support</span>
            </h2>
            <p className="text-zinc-400 text-lg max-w-3xl mx-auto">
              Transform from reactive maintenance to predictive leadership with advanced machine intelligence
            </p>
          </motion.div>

          {/* Main AI Dashboard */}
          <div className="grid lg:grid-cols-3 gap-6 mb-16">
            {[
              {
                icon: Activity,
                title: "Predict potential equipment failures",
                metric: "87%",
                label: "Prediction Accuracy",
                desc: "Advanced algorithms analyze vibration patterns, temperature fluctuations, and usage data to forecast failures before they occur."
              },
              {
                icon: Zap,
                title: "Suggest preventive maintenance actions",
                metric: "2.4x",
                label: "ROI Improvement",
                desc: "AI-driven scheduling optimizes maintenance windows, reducing downtime and maximizing asset utilization across the fleet."
              },
              {
                icon: AlertTriangle,
                title: "Identify abnormal maintenance spending",
                metric: "$47K",
                label: "Cost Saved/Month",
                desc: "Real-time anomaly detection flags unusual spending patterns and asset wear, enabling immediate corrective action."
              }
            ].map((card, i) => (
        <motion.div
          key={i}
                initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-[#70c82a]/30 transition-all group"
        >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-[#70c82a]/10 flex items-center justify-center border border-[#70c82a]/20">
                    <card.icon className="w-6 h-6 text-[#70c82a]" />
          </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-white">{card.metric}</div>
                    <div className="text-[10px] text-zinc-500 uppercase font-bold">{card.label}</div>
                  </div>
                </div>
                <h4 className="text-white font-bold text-lg mb-3">{card.title}</h4>
                <p className="text-sm text-zinc-400 leading-relaxed">{card.desc}</p>
        </motion.div>
      ))}
    </div>

          {/* Smart Maintenance Intelligence Panel */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Cpu className="w-6 h-6 text-[#70c82a]" />
                  <h3 className="text-2xl font-bold text-white">Smart Maintenance Intelligence</h3>
                </div>
                <p className="text-zinc-400">Real-time predictive analytics and asset health monitoring</p>
              </div>
              <Badge className="bg-[#70c82a] text-black font-bold">LIVE</Badge>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 mb-8">
              <div className="lg:col-span-2 space-y-6">
                {[
                  { 
                    asset: "ECWC-E-108 (Excavator)", 
                    alert: "Abnormal vibration detected - Hydraulic seal failure probability: 87%",
                    action: "Schedule inspection within 48h",
                    cost: "$12,000",
                    priority: "Critical",
                    color: "red"
                  },
                  { 
                    asset: "ECWC-B-042 (Dozer)", 
                    alert: "Engine oil degradation - Service interval approaching",
                    action: "Schedule maintenance in 72h",
                    cost: "$3,200",
                    priority: "Medium",
                    color: "amber"
                  },
                  { 
                    asset: "ECWC-L-023 (Loader)", 
                    alert: "Tire wear pattern suggests alignment issue",
                    action: "Inspection recommended next scheduled maintenance",
                    cost: "$5,800",
                    priority: "Low",
                    color: "blue"
                  }
                ].map((alert, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="p-5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-[#70c82a]/30 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                            alert.color === 'red' ? 'bg-red-500/20 text-red-400' :
                            alert.color === 'amber' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {alert.priority}
                          </span>
                          <span className="text-xs font-mono text-zinc-400">{alert.asset}</span>
                        </div>
                        <p className="text-sm text-white mb-2">{alert.alert}</p>
                        <p className="text-xs text-[#70c82a]">→ {alert.action}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-zinc-500 mb-1">Est. Cost Avoided</div>
                        <div className="text-lg font-bold text-white">{alert.cost}</div>
                      </div>
                    </div>
    </motion.div>
                ))}
  </div>

              <div className="space-y-4">
                <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-800">
                  <div className="text-zinc-400 text-xs mb-2">Predictive Health Score</div>
                  <div className="text-5xl font-bold text-[#70c82a] mb-4">94%</div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: "94%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5 }}
                      className="h-full bg-gradient-to-r from-[#70c82a] to-emerald-400"
                    />
                  </div>
                </div>

                <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-800">
                  <div className="text-zinc-400 text-xs mb-2">Underperforming Assets</div>
                  <div className="text-5xl font-bold text-amber-500 mb-2">03</div>
                  <div className="text-xs text-zinc-500">Requiring immediate attention</div>
                </div>

                <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-800">
                  <div className="text-zinc-400 text-xs mb-2">Cost Optimization</div>
                  <div className="text-5xl font-bold text-[#70c82a] mb-2">12.5%</div>
                  <div className="text-xs text-zinc-500">Potential monthly savings</div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#70c82a]/5 border border-[#70c82a]/20 text-center">
              <p className="text-sm text-zinc-300 italic">
                <span className="text-[#70c82a] font-bold">From reactive maintenance to predictive leadership.</span> AI-powered insights enable proactive decision-making across the entire ECWC fleet.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Governance, Security & Audit - Enterprise Standard */}
      <section className="py-32 bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(112,200,42,0.03),transparent_70%)]" />
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-800/50 text-zinc-400 text-xs font-bold uppercase tracking-widest mb-6 border border-zinc-800">
              <Shield className="w-4 h-4" />
              Compliance & Security
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Built for <span className="text-[#70c82a]">Government & Corporate</span> Standards
            </h2>
            <p className="text-zinc-400 text-lg max-w-3xl mx-auto">
              Enterprise-grade security architecture with full audit compliance and multi-level access control
            </p>
          </motion.div>

          {/* Security Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[
              { icon: Lock, title: "Role-Based Access Control", desc: "Strict permission control", stat: "12 Role Types" },
              { icon: History, title: "Full Audit Trail", desc: "Every action logged", stat: "100% Coverage" },
              { icon: Shield, title: "Data Security", desc: "Government-grade encryption", stat: "AES-256 Standard" },
              { icon: RotateCcw, title: "Secure Backups", desc: "Disaster recovery ready", stat: "24h Recovery" }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-[#70c82a]/30 transition-all group text-center"
              >
                <div className="w-14 h-14 rounded-xl bg-[#70c82a]/10 flex items-center justify-center mx-auto mb-4 border border-[#70c82a]/20 group-hover:scale-110 transition-transform">
                  <item.icon className="w-7 h-7 text-[#70c82a]" />
                </div>
                <h4 className="text-white font-bold text-lg mb-2">{item.title}</h4>
                <p className="text-zinc-500 text-sm mb-3">{item.desc}</p>
                <div className="text-[#70c82a] text-xs font-bold">{item.stat}</div>
              </motion.div>
            ))}
          </div>

          {/* Multi-Site Architecture */}
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-16">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h3 className="text-3xl font-bold text-white mb-6">Multi-Site & Scalable Architecture</h3>
              <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
                Unified platform architecture designed to scale from Head Office oversight down to project-site level operations across all ECWC locations nationwide.
              </p>
              <div className="space-y-4">
                {[
                  { title: "Head Office oversight", desc: "Centralized control and executive dashboards", icon: Building },
                  { title: "Regional office access", desc: "Distributed management and reporting", icon: MapPin },
                  { title: "Project-site level operations", desc: "Field-level data capture and real-time sync", icon: HardHat },
                  { title: "Scales with ECWC growth", desc: "Cloud-native architecture for unlimited expansion", icon: TrendingUp },
                  { title: "Ready for future integrations", desc: "Finance, HR, and IoT systems compatibility", icon: Globe }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-4 p-4 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-[#70c82a]/30 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#70c82a]/10 flex items-center justify-center border border-[#70c82a]/20 flex-shrink-0">
                      <item.icon className="w-5 h-5 text-[#70c82a]" />
                    </div>
                    <div>
                      <h5 className="text-white font-bold mb-1">{item.title}</h5>
                      <p className="text-sm text-zinc-500">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="p-8 rounded-2xl bg-zinc-950 border border-zinc-800">
                <div className="text-white font-bold mb-6">System Architecture Overview</div>
                <div className="space-y-6">
                  {[
                    { level: "Head Office", sites: "1", users: "45", color: "bg-[#70c82a]" },
                    { level: "Regional Offices", sites: "6", users: "128", color: "bg-blue-500" },
                    { level: "Project Sites", sites: "24", users: "412", color: "bg-amber-500" }
                  ].map((tier, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${tier.color}`} />
                          <span className="text-white font-semibold">{tier.level}</span>
                        </div>
                        <div className="text-xs text-zinc-500">{tier.sites} locations • {tier.users} users</div>
                      </div>
                      <div className="h-12 bg-zinc-900 rounded-lg p-3 flex items-center justify-between">
                        <div className="flex gap-1">
                          {[...Array(parseInt(tier.sites))].map((_, j) => (
                    <motion.div 
                              key={j}
                              initial={{ scale: 0 }}
                              whileInView={{ scale: 1 }}
                              viewport={{ once: true }}
                              transition={{ delay: i * 0.2 + j * 0.05 }}
                              className={`w-2 h-6 rounded ${tier.color}`}
                            />
                          ))}
                        </div>
                        <div className="text-xs text-zinc-400">Real-time Sync</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-zinc-800 grid grid-cols-3 gap-4 text-center">
                        <div>
                    <div className="text-2xl font-bold text-white mb-1">31</div>
                    <div className="text-[10px] text-zinc-500 uppercase font-bold">Total Sites</div>
                        </div>
                  <div>
                    <div className="text-2xl font-bold text-[#70c82a] mb-1">585</div>
                    <div className="text-[10px] text-zinc-500 uppercase font-bold">Active Users</div>
                      </div>
                  <div>
                    <div className="text-2xl font-bold text-white mb-1">99.8%</div>
                    <div className="text-[10px] text-zinc-500 uppercase font-bold">Uptime</div>
                  </div>
                </div>
              </div>
                    </motion.div>
          </div>

          {/* Compliance Ready Banner */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-10 rounded-2xl bg-gradient-to-r from-[#70c82a]/5 via-zinc-950 to-[#70c82a]/5 border border-[#70c82a]/20 text-center"
          >
            <div className="inline-flex items-center gap-3 mb-6">
              <Award className="w-8 h-8 text-[#70c82a]" />
              <h3 className="text-2xl font-bold text-white">Compliance-Ready Reporting</h3>
            </div>
            <p className="text-zinc-400 text-lg mb-8 max-w-3xl mx-auto">
              Built to support government reporting needs and international audit standards with comprehensive approval workflows and secure data storage.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                "ISO 27001 Compatible",
                "GDPR Compliant",
                "SOC 2 Type II",
                "Government Audit Ready",
                "International Standards"
              ].map((badge, i) => (
                <span key={i} className="px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 text-sm text-zinc-300 font-semibold">
                  {badge}
                </span>
              ))}
            </div>
            </motion.div>
        </div>
      </section>

      {/* Operational Visibility & Dashboard */}
      <section id="dashboard" className="py-24 bg-zinc-950">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">ECWC Management Dashboard</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Real-time insights and control over ECWC's entire equipment fleet
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card border-0 rounded-3xl p-8 shadow-2xl bg-gradient-to-br from-background to-muted/50 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-teal-500/5" />
            
            <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6 mb-8 relative z-10">
              {[
                { label: "Total Equipment", value: 156, change: "+5%", icon: Truck, color: "cyan" },
                { label: "Operational", value: 142, change: "+2%", icon: CheckCircle, color: "green" },
                { label: "Under Maintenance", value: 14, change: "-3%", icon: Wrench, color: "orange" },
                { label: "Fleet Availability", value: 91, change: "+1%", icon: Target, color: "teal" }
              ].map((stat, i) => (
                <Card key={i} className="p-6 border-0 bg-background/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold mt-1">
                        <AnimatedCounter value={stat.value} duration={1500} />
                        {stat.label.includes("Availability") && "%"}
                      </p>
                      <p className={`text-xs ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.change} from last month
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/30`}>
                      <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-8 relative z-10">
              <Card className="border-0 bg-background/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Maintenance Alerts</CardTitle>
                  <CardDescription>Recent equipment requiring attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { equipment: "Excavator ECWC-EX-001", issue: "Engine oil change due", priority: "High", time: "2 hours ago" },
                      { equipment: "Bulldozer ECWC-BD-015", issue: "Hydraulic leak detected", priority: "Critical", time: "1 hour ago" },
                      { equipment: "Loader ECWC-LD-023", issue: "Tire replacement needed", priority: "Medium", time: "4 hours ago" },
                      { equipment: "Crane ECWC-CR-008", issue: "Scheduled inspection", priority: "Low", time: "6 hours ago" }
                    ].map((alert, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center justify-between p-3 border rounded-lg hover:border-cyan-300 transition-colors bg-background/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${
                            alert.priority === 'Critical' ? 'bg-red-100 text-red-600' :
                            alert.priority === 'High' ? 'bg-orange-100 text-orange-600' :
                            alert.priority === 'Medium' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-cyan-100 text-cyan-600'
                          }`}>
                            <AlertTriangle className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium">{alert.equipment}</p>
                            <p className="text-sm text-muted-foreground">{alert.issue}</p>
                          </div>
                        </div>
                        <Badge variant={
                          alert.priority === 'Critical' ? 'destructive' :
                          alert.priority === 'High' ? 'default' :
                          'secondary'
                        }>
                          {alert.priority}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-background/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Recent ECWC Activity</CardTitle>
                  <CardDescription>Latest equipment operations and maintenance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { action: "Work order completed", equipment: "ECWC-EX-012", user: "Tech. Alemayehu", time: "10 min ago", type: "success" },
                      { action: "Maintenance scheduled", equipment: "ECWC-BD-008", user: "Manager Sofia", time: "25 min ago", type: "info" },
                      { action: "Fuel consumption report", equipment: "ECWC-TR-045", user: "System", time: "1 hour ago", type: "warning" },
                      { action: "New equipment added", equipment: "ECWC-CR-009", user: "Admin Michael", time: "2 hours ago", type: "success" }
                    ].map((activity, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-3 p-3 border rounded-lg hover:border-cyan-300 transition-colors bg-background/50"
                      >
                        <div className={`p-2 rounded-full ${
                          activity.type === 'success' ? 'bg-green-100 text-green-600' :
                          activity.type === 'info' ? 'bg-cyan-100 text-cyan-600' :
                          'bg-yellow-100 text-yellow-600'
                        }`}>
                          {activity.type === 'success' ? <CheckCircle className="h-4 w-4" /> :
                           activity.type === 'info' ? <Bell className="h-4 w-4" /> :
                           <AlertTriangle className="h-4 w-4" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{activity.action}</p>
                          <p className="text-sm text-muted-foreground">{activity.equipment} • {activity.user}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{activity.time}</span>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>



      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mt-16"
      >
        <Card className="border-0 bg-gradient-to-r from-cyan-500/10 via-teal-500/10 to-cyan-500/10 backdrop-blur-sm">
          <CardContent className="p-8">
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent"
            >
              ECWC Management System
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground mb-6 max-w-2xl mx-auto"
            >
              ETHIOPIAN CONSTRUCTION WORKS CORPORATION (ECWC) / የኢትዮጵያ ኮንቦትሬክሽን ምልዎት ኮርፖሬሽን with a unified digital system to efficiently manage Inventory, Work Orders, Maintenance and Requests.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700 px-8 gap-2">
                <Play className="h-4 w-4" />
                Watch Demo
              </Button>
              <Button size="lg" variant="outline" className="gap-2">
                <FileText className="h-4 w-4" />
                Download Brochure
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

    {/* Footer */}
<footer className="bg-black py-12">
  <div className="container mx-auto px-4 lg:px-8 text-white">
    <div className="grid md:grid-cols-4 gap-8 mb-8">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
         <div className="relative">
  <Image
    src="/ECWC-Official-Logo.png"
    alt="EEC Logo"
    width={80}
    height={80}
    className="object-contain"
    quality={100}
    unoptimized
    priority
  />
</div>

          <div>
            <div className="font-bold text-white">ECWC Equipment Manager</div>
            <div className="text-sm text-gray-400">Internal System</div>
          </div>
        </div>
        <p className="text-sm text-gray-400">
          Enterprise equipment management platform designed specifically for ECWC construction operations.
        </p>
      </div>

      {[
        {
          title: "System",
          links: ["Dashboard", "Equipment", "Work Orders", "Reports", "Inventory"]
        },
        {
          title: "Support",
          links: ["IT Help Desk", "User Manual", "Training", "System Status", "Contact"]
        },
        {
          title: "Company",
          links: ["About ECWC", "Departments", "Policies", "Careers", "Contact"]
        }
      ].map((section, i) => (
        <div key={i} className="space-y-4">
          <h4 className="font-semibold text-white">{section.title}</h4>
          <ul className="space-y-2">
            {section.links.map((link, j) => (
              <li key={j}>
                <Link href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
                  {link}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>

    <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
      <p className="text-sm text-gray-400">
        © 2025 EEC Equipment Management System. Internal use only.
      </p>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
          Privacy Policy
        </Button>
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
          Terms of Service
        </Button>
      </div>
    </div>
  </div>
</footer>

    </div>
  )
}