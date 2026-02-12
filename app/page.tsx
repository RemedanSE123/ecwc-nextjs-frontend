"use client"

import { useState, useEffect, useLayoutEffect, useRef } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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
  ChevronUp,
  ChevronDown,
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
  History,
  X,
  Menu,
  Facebook,
  Twitter,
  Linkedin,
  Send
} from "lucide-react"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { ThemeToggle } from "@/components/theme-toggle"
import Image from "next/image"

const CompoundMap = dynamic(
  () => import("@/components/compound-map/CompoundMap").then((m) => m.default),
  { ssr: false, loading: () => <div className="flex min-h-[480px] items-center justify-center rounded-xl border bg-muted/30 text-muted-foreground">Loading map…</div> }
)

const getEquipmentDescription = (name: string): string => {
  const descMap: { [key: string]: string } = {

    "Dozer, Chain": "Heavy-duty crawler tractor engineered for aggressive earthmoving, terrain shaping, and site preparation activities. Equipped with a large front blade capable of pushing, spreading, ripping, and leveling soil, rock, and construction debris across extensive work areas. Its tracked undercarriage provides superior traction, stability, and low ground pressure, allowing continuous operation on soft, muddy, rocky, or uneven terrain where wheeled equipment cannot function safely. Widely used during the initial phases of construction projects for clearing vegetation, removing overburden, forming embankments, cutting access roads, and shaping slopes. Advanced hydraulic systems allow precise blade control for fine grading, while the reinforced chassis and drivetrain ensure durability under sustained heavy loads. Plays a critical role in accelerating project timelines, reducing manual labor dependency, and ensuring consistent terrain formation that meets engineering and environmental requirements.",

    "Motor Grader": "High-precision grading machine specifically designed for shaping, leveling, and finishing surfaces to exact elevation and slope specifications. Features a long centrally mounted moldboard blade capable of fine material redistribution for road bases, shoulders, drainage channels, and finished surfaces. Extensively used in road construction, highway maintenance, airport runway preparation, and large-scale infrastructure works where accuracy directly impacts performance and longevity. Advanced articulation, hydraulic blade control, and optional GPS or laser guidance systems enable millimeter-level precision, ensuring optimal drainage and surface uniformity. Improves pavement lifespan by preventing water pooling and uneven load distribution. Essential for achieving engineering tolerances, reducing rework, and maintaining consistent surface quality across long distances and large projects.",

    "Excavator, Chain": "Crawler-mounted excavator designed for intensive excavation, trenching, lifting, demolition, and bulk material handling operations. Built with a reinforced undercarriage and high-powered hydraulic system, it delivers exceptional digging force, reach, and stability even in deep excavations and difficult soil conditions. Frequently deployed for foundation excavation, utility trenching, slope cutting, and large-scale earthmoving tasks. Supports a wide range of attachments including buckets, hydraulic breakers, grapples, and augers, making it one of the most versatile machines on a construction site. Enhances operational efficiency by reducing excavation cycle time, improving material control, and enabling precise excavation near structures. A cornerstone machine in civil works, infrastructure development, mining, and industrial construction projects.",

    "Excavator, Wheel": "Highly mobile excavator mounted on rubber tires, designed for operations requiring frequent relocation and rapid response. Combines strong digging capability with superior travel speed, making it ideal for urban construction, road maintenance, drainage systems, and utility installation projects. Equipped with stabilizers and advanced hydraulic controls to ensure stability during excavation despite its wheeled configuration. Minimizes surface damage on paved areas and allows direct road travel without transport trailers. Improves productivity by reducing downtime between tasks and increasing operational flexibility. Essential for city infrastructure projects where space constraints, traffic flow, and mobility are critical factors.",

    "Loader, Chain": "Tracked loader built for powerful and reliable material handling in extreme ground conditions. Designed to load, carry, and stockpile heavy materials such as soil, aggregates, debris, and demolition waste. Its tracked system ensures excellent traction, stability, and load control on soft, wet, or uneven terrain where wheeled loaders may lose effectiveness. Commonly used in quarry operations, earthworks, landfills, and rough construction sites. The machine’s robust hydraulic lifting system allows continuous heavy-duty operation with minimal performance loss. Enhances site productivity by maintaining loading efficiency regardless of terrain limitations.",

    "Loader, Wheel": "High-capacity front-end loader optimized for fast, efficient material movement and truck loading operations. Designed for stockpile management, aggregate handling, and logistics support across construction sites, batching plants, and material yards. Rubber tires allow smooth and rapid movement across paved and compacted surfaces, reducing cycle times and fuel consumption. Equipped with powerful hydraulics and large bucket options to maximize payload efficiency. Improves operational workflow by accelerating loading processes and reducing equipment idle time. Essential for projects with high material throughput and continuous logistics demand.",

    "Backhoe Loader": "Versatile multipurpose machine integrating a front loader and rear excavator arm into a single compact unit. Designed for flexibility and efficiency on small to medium-scale construction sites. Capable of performing excavation, trenching, loading, backfilling, and material handling tasks without the need for multiple machines. Particularly effective in urban environments, roadside works, and utility installations where space is limited. Reduces operational costs by minimizing equipment mobilization and operator requirements. Widely used by municipalities, contractors, and maintenance teams for diverse daily operations.",

    "Roller D/Drum": "Double drum vibratory compaction machine engineered for high-performance soil and asphalt compaction. Applies uniform pressure and vibration across both drums, ensuring consistent density over wide surface areas. Essential for road construction, industrial yards, and large paved surfaces where compaction quality directly affects structural integrity and lifespan. Adjustable vibration frequencies allow adaptation to different material types and layer thicknesses. Enhances construction quality by reducing voids, preventing settlement, and improving long-term pavement durability.",

    "Roller S/Drum": "Single drum roller designed for controlled soil compaction and base preparation. Delivers focused compaction force ideal for edges, shoulders, and confined work zones. Frequently used for embankments, subgrade preparation, and secondary compaction passes. Offers precise maneuverability and depth control, ensuring stable foundation layers. Supports infrastructure longevity by achieving required density levels before surface construction.",

    "Roller Pneumatic": "Rubber-tired roller utilized primarily for asphalt compaction and finishing operations. Applies kneading action that improves aggregate interlock and material bonding without damaging surface texture. Produces smooth, uniform finishes critical for ride quality and surface durability. Commonly used during final compaction stages of asphalt paving. Enhances pavement performance by sealing surface voids and reducing long-term cracking.",

    "Scraper": "High-capacity earthmoving machine capable of cutting, loading, hauling, and spreading soil in a single continuous operation. Designed for long-distance earth transport with minimal support equipment. Ideal for large-scale projects such as highways, airports, dams, and land development works. Reduces reliance on multiple machines, improving efficiency and lowering operational costs. Plays a strategic role in mass earthworks and terrain reshaping projects.",

    "Asphalt Paver": "Specialized paving machine responsible for placing asphalt layers with precise thickness, width, and smoothness. Ensures uniform material distribution and consistent surface finish essential for road performance. Used extensively in highways, urban roads, parking facilities, and industrial pavements. Supports automated screed control systems for accurate leveling. Enhances pavement quality, ride comfort, and structural integrity.",

    "Low bed": "Low-profile heavy transport trailer designed for moving oversized and heavy construction equipment. Allows safe transport of excavators, bulldozers, cranes, and industrial machinery. Its low deck height ensures compliance with transport height restrictions. Essential for equipment mobilization across project sites and long-distance logistics.",

    "Mobile Crane": "Truck-mounted lifting machine combining mobility with powerful hoisting capability. Used for lifting, positioning, and installing heavy materials, structural elements, and equipment. Supports construction, industrial assembly, and infrastructure projects requiring flexible lifting solutions. Reduces reliance on fixed cranes and enhances site adaptability.",

    "Water Truck": "Multi-purpose tanker vehicle supplying water for dust suppression, soil compaction, and site maintenance. Essential for maintaining safe working conditions, environmental compliance, and construction quality. Supports road construction, earthworks, and remote site operations where water access is limited.",

    "Fuel Truck": "Mobile fuel delivery vehicle ensuring continuous equipment operation on construction sites. Supplies diesel and lubricants directly to machinery, minimizing downtime and logistical delays. Essential for large or remote projects where centralized fueling is impractical.",

    "Fork lift": "Material handling equipment designed for lifting, stacking, and transporting palletized loads. Widely used in warehouses, workshops, and construction sites. Enhances efficiency and safety in material logistics and inventory handling.",

    "Bus Passenger": "High-capacity transport vehicle dedicated to moving construction workers safely and efficiently. Supports workforce logistics on large project sites, ensuring punctual crew deployment and operational continuity.",

    "Double Cabin": "Pickup truck with extended seating designed to transport both personnel and tools. Provides flexibility for supervision, inspection, and light logistics tasks across construction sites."

  };

  return (
    descMap[name] ||
    "Heavy construction equipment designed to support earthmoving, compaction, material handling, transportation, and infrastructure development activities. These assets play a critical role in maintaining productivity, safety, quality control, and schedule adherence across complex construction and industrial projects."
  );
};



// --- Equipment Command Center Data - Aggregated by Category ---
const equipmentCategories = [
  { id: 1, name: "Dozer, Chain", op: 19, idle: 1, ur: 11, down: 2, hr: 16, ui: 0, rfd: 0, afd: 3, totalQty: 52, image: "/Dozer,-Chain.webp" },
  { id: 2, name: "Motor Grader", op: 13, idle: 2, ur: 8, down: 0, hr: 6, ui: 0, rfd: 0, afd: 2, totalQty: 31, image: "/Motor-Grader.webp" },
  { id: 3, name: "Excavator, Chain", op: 28, idle: 1, ur: 13, down: 5, hr: 13, ui: 0, rfd: 1, afd: 1, totalQty: 62, image: "/Excavator,-Chain.webp" },
  { id: 4, name: "Excavator, Wheel", op: 1, idle: 0, ur: 4, down: 2, hr: 4, ui: 0, rfd: 0, afd: 1, totalQty: 12, image: "/Excavator,-Wheel.webp" },
  { id: 5, name: "Loader, Chain", op: 1, idle: 0, ur: 2, down: 0, hr: 2, ui: 0, rfd: 0, afd: 0, totalQty: 5, image: "/Empty-Section.webp" },
  { id: 6, name: "Loader, Wheel", op: 17, idle: 1, ur: 13, down: 3, hr: 25, ui: 0, rfd: 1, afd: 7, totalQty: 67, image: "/Loader,-Wheel.webp" },
  { id: 7, name: "Backhoe Loader", op: 3, idle: 0, ur: 0, down: 0, hr: 0, ui: 0, rfd: 1, afd: 0, totalQty: 4, image: "/Backhoe-Loader.webp" },
  { id: 8, name: "Roller D/Drum", op: 15, idle: 2, ur: 4, down: 0, hr: 5, ui: 0, rfd: 0, afd: 2, totalQty: 28, image: "/Roller-D.Drum.webp" },
  { id: 9, name: "Roller S/Drum", op: 6, idle: 2, ur: 3, down: 2, hr: 7, ui: 0, rfd: 0, afd: 0, totalQty: 20, image: "/Roller-S.Drum.webp" },
  { id: 10, name: "Roller S/foot -D/D", op: 2, idle: 0, ur: 0, down: 1, hr: 3, ui: 0, rfd: 0, afd: 0, totalQty: 6, image: "/Roller-S.foot--D.D.webp" },
  { id: 11, name: "Roller S/foot -S/D", op: 0, idle: 0, ur: 1, down: 0, hr: 0, ui: 0, rfd: 0, afd: 0, totalQty: 1, image: "/Roller-S.foot--S.D.webp" },
  { id: 12, name: "Roller Pneumatic", op: 9, idle: 0, ur: 1, down: 1, hr: 0, ui: 0, rfd: 0, afd: 0, totalQty: 11, image: "/Roller-Pneumatic.webp" },
  { id: 13, name: "Trencher, Chain", op: 0, idle: 1, ur: 0, down: 0, hr: 0, ui: 0, rfd: 0, afd: 0, totalQty: 1, image: "/Empty-Section.webp" },
  { id: 14, name: "Trencher, Wheel", op: 0, idle: 0, ur: 0, down: 1, hr: 0, ui: 0, rfd: 0, afd: 0, totalQty: 1, image: "/Empty-Section.webp" },
  { id: 15, name: "Scraper", op: 0, idle: 1, ur: 0, down: 0, hr: 0, ui: 0, rfd: 0, afd: 0, totalQty: 1, image: "/Empty-Section.webp" },
  { id: 16, name: "Asphalt Paver", op: 4, idle: 0, ur: 1, down: 1, hr: 0, ui: 0, rfd: 0, afd: 0, totalQty: 6, image: "/Asphalt-Paver.webp" },
  { id: 17, name: "Concrete Paver", op: 1, idle: 0, ur: 0, down: 0, hr: 0, ui: 0, rfd: 0, afd: 0, totalQty: 1, image: "/Empty-Section.webp" },
  { id: 18, name: "Asphalt Milling machine", op: 1, idle: 0, ur: 0, down: 0, hr: 0, ui: 0, rfd: 0, afd: 0, totalQty: 1, image: "/Asphalt-Milling-machine.webp" },
  { id: 19, name: "Chip Spreader", op: 1, idle: 0, ur: 0, down: 0, hr: 0, ui: 0, rfd: 0, afd: 0, totalQty: 1, image: "/Chip-Spreader.webp" },
  { id: 20, name: "Power Curber", op: 1, idle: 0, ur: 0, down: 0, hr: 0, ui: 0, rfd: 0, afd: 0, totalQty: 1, image: "/Empty-Section.webp" },
  { id: 21, name: "D/Truck Beiben", op: 43, idle: 3, ur: 11, down: 23, hr: 17, ui: 3, rfd: 0, afd: 0, totalQty: 100, image: "/D.Truck-Beiben.webp" },
  { id: 22, name: "D/Truck Daewoo", op: 22, idle: 0, ur: 12, down: 1, hr: 1, ui: 3, rfd: 0, afd: 1, totalQty: 40, image: "/D.Truck-Daewoo.webp" },
  { id: 23, name: "D/Truck Faw", op: 26, idle: 1, ur: 35, down: 29, hr: 7, ui: 8, rfd: 0, afd: 0, totalQty: 106, image: "/D.Truck-Faw.webp" },
  { id: 24, name: "D/Truck Nissan", op: 20, idle: 4, ur: 31, down: 32, hr: 6, ui: 7, rfd: 2, afd: 7, totalQty: 109, image: "/D.Truck-Nissan.webp" },
  { id: 25, name: "D/Truck Sino", op: 0, idle: 0, ur: 3, down: 1, hr: 1, ui: 0, rfd: 0, afd: 0, totalQty: 5, image: "/D.Truck-Sino.webp" },
  { id: 26, name: "D/Truck Foton", op: 0, idle: 0, ur: 2, down: 2, hr: 0, ui: 1, rfd: 0, afd: 0, totalQty: 5, image: "/D.Truck-Foton.webp" },
  { id: 27, name: "Water Truck", op: 45, idle: 5, ur: 3, down: 9, hr: 5, ui: 1, rfd: 0, afd: 0, totalQty: 68, image: "/Water-Truck.webp" },
  { id: 28, name: "Water Truck Trailer", op: 1, idle: 0, ur: 0, down: 0, hr: 0, ui: 0, rfd: 0, afd: 0, totalQty: 1, image: "/Water-Truck-Trailer.webp" },
  { id: 29, name: "Fuel Truck", op: 14, idle: 1, ur: 2, down: 1, hr: 3, ui: 0, rfd: 1, afd: 0, totalQty: 22, image: "/Fuel-Truck.webp" },
  { id: 30, name: "Fuel Truck Trailer", op: 0, idle: 2, ur: 0, down: 1, hr: 0, ui: 0, rfd: 0, afd: 0, totalQty: 3, image: "/Fuel-Truck-Trailer.webp" },
  { id: 31, name: "Asphalt Distributer", op: 3, idle: 0, ur: 0, down: 1, hr: 2, ui: 2, rfd: 0, afd: 0, totalQty: 8, image: "/Asphalt-Distributer.webp" },
  { id: 32, name: "Low bed", op: 4, idle: 0, ur: 7, down: 0, hr: 1, ui: 0, rfd: 0, afd: 0, totalQty: 12, image: "/Low-bed.webp" },
  { id: 33, name: "Low bed Trailer", op: 5, idle: 0, ur: 3, down: 5, hr: 1, ui: 0, rfd: 0, afd: 0, totalQty: 14, image: "/Low-bed-Trailer.webp" },
  { id: 34, name: "High bed trailer", op: 0, idle: 0, ur: 0, down: 1, hr: 1, ui: 0, rfd: 0, afd: 0, totalQty: 2, image: "/High-bed-trailer.webp" },
  { id: 35, name: "Mobile Crane", op: 4, idle: 0, ur: 1, down: 1, hr: 2, ui: 0, rfd: 0, afd: 0, totalQty: 8, image: "/Mobile-Crane.webp" },
  { id: 36, name: "Cargo Truck", op: 0, idle: 1, ur: 0, down: 1, hr: 0, ui: 0, rfd: 1, afd: 3, totalQty: 6, image: "/Cargo-Truck.webp" },
  { id: 37, name: "Cargo Crane", op: 5, idle: 0, ur: 0, down: 1, hr: 1, ui: 0, rfd: 0, afd: 0, totalQty: 7, image: "/Empty-Section.webp" },
  { id: 38, name: "Water Well Drilling rig", op: 0, idle: 0, ur: 2, down: 1, hr: 1, ui: 0, rfd: 0, afd: 0, totalQty: 4, image: "/Water-Well-Drilling-rig.webp" },
  { id: 39, name: "Shop Truck", op: 4, idle: 0, ur: 1, down: 1, hr: 0, ui: 0, rfd: 0, afd: 1, totalQty: 7, image: "/Empty-Section.webp" },
  { id: 40, name: "Fork lift", op: 5, idle: 0, ur: 0, down: 0, hr: 0, ui: 0, rfd: 0, afd: 0, totalQty: 5, image: "/Fork-lift.webp" },
  { id: 41, name: "Farm Truck", op: 0, idle: 5, ur: 0, down: 1, hr: 0, ui: 0, rfd: 0, afd: 2, totalQty: 8, image: "/Farm-Truck.webp" },
  { id: 42, name: "Automobile", op: 6, idle: 0, ur: 0, down: 0, hr: 1, ui: 0, rfd: 0, afd: 4, totalQty: 11, image: "/Automobile.webp" },
  { id: 43, name: "Bus Passenger", op: 0, idle: 0, ur: 1, down: 0, hr: 0, ui: 0, rfd: 0, afd: 1, totalQty: 2, image: "/Bus-Passenger.webp" },
  { id: 44, name: "Midi Bus", op: 2, idle: 0, ur: 2, down: 0, hr: 0, ui: 0, rfd: 0, afd: 1, totalQty: 5, image: "/Midi-Bus.webp" },
  { id: 45, name: "Station Wagon", op: 24, idle: 1, ur: 6, down: 4, hr: 3, ui: 1, rfd: 0, afd: 14, totalQty: 53, image: "/Empty-Section.webp" },
  { id: 46, name: "Double Cabin", op: 74, idle: 3, ur: 46, down: 14, hr: 24, ui: 8, rfd: 5, afd: 28, totalQty: 202, image: "/Double-Cabin.webp" },
  { id: 47, name: "Single Cabin", op: 5, idle: 0, ur: 6, down: 2, hr: 0, ui: 0, rfd: 0, afd: 2, totalQty: 15, image: "/Single-Cabin.webp" },
];

// Helper function to calculate utilization percentage
const calculateUtilization = (category: typeof equipmentCategories[0]) => {
  const operational = category.op;
  const total = category.totalQty;
  return total > 0 ? Math.round((operational / total) * 100) : 0;
};

// Helper function to get status color based on utilization
const getStatusColor = (utilization: number) => {
  if (utilization >= 80) return "bg-[#70c82a]";
  if (utilization >= 60) return "bg-amber-500";
  if (utilization >= 40) return "bg-orange-500";
  return "bg-red-500";
};

const CommandCenterSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Filter categories based on search
  const filteredCategories = equipmentCategories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const displayCategories = searchQuery ? filteredCategories : equipmentCategories;

  // Scroll carousel to center active item
  const scrollToActive = (index: number) => {
    if (carouselRef.current) {
      // Find the actual index in the displayed categories
      const categoryId = equipmentCategories[index].id;
      const displayIndex = displayCategories.findIndex(cat => cat.id === categoryId);

      if (displayIndex !== -1) {
        const itemWidth = 96; // w-24 = 96px (including gap)
        const scrollPosition = displayIndex * itemWidth - (carouselRef.current.clientWidth / 2) + (itemWidth / 2);
        carouselRef.current.scrollTo({
          left: scrollPosition,
          behavior: 'smooth'
        });
      }
    }
  };

  // Start auto-scroll function
  const startAutoScroll = () => {
    // Clear any existing interval first
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Start auto-scroll - changes data every 8 seconds
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % equipmentCategories.length;
        scrollToActive(nextIndex);
        return nextIndex;
      });
    }, 8000); // 8 seconds between changes
  };

  // Handle manual selection - pauses auto-scroll, then resumes
  const handleSelectCategory = (index: number) => {
    const actualIndex = equipmentCategories.findIndex(cat => cat.id === displayCategories[index].id);
    setCurrentIndex(actualIndex);
    scrollToActive(actualIndex);

    // Clear auto-scroll when user selects
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Resume auto-scroll after 10 seconds of user selection
    setTimeout(() => {
      startAutoScroll();
    }, 10000); // 10 seconds delay before resuming
  };

  // Navigate left/right - pauses auto-scroll, then resumes
  const handleNavigate = (direction: 'left' | 'right') => {
    // Clear auto-scroll when user navigates
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (direction === 'left') {
      const newIndex = (currentIndex - 1 + equipmentCategories.length) % equipmentCategories.length;
      setCurrentIndex(newIndex);
      scrollToActive(newIndex);
    } else {
      const newIndex = (currentIndex + 1) % equipmentCategories.length;
      setCurrentIndex(newIndex);
      scrollToActive(newIndex);
    }

    // Resume auto-scroll after 10 seconds of user navigation
    setTimeout(() => {
      startAutoScroll();
    }, 10000); // 10 seconds delay before resuming
  };

  // Start auto-scroll on mount
  useEffect(() => {
    startAutoScroll();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []); // Empty deps - only run on mount

  // Prevent manual scroll from changing data
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const handleScroll = () => {
      // User is manually scrolling - don't change data
      // Data only changes on click/select or auto-scroll
    };

    carousel.addEventListener('scroll', handleScroll);

    return () => {
      carousel.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const currentCategory = equipmentCategories[currentIndex];
  const utilization = calculateUtilization(currentCategory);
  const statusColor = getStatusColor(utilization);

  return (
    <section className="relative py-12 lg:py-16 bg-background dark:bg-zinc-950">
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Cinematic Background Lighting */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full blur-[120px] bg-[#70c82a]/10"
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
        <div className="mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold text-foreground mb-2 tracking-tight"
          >
            <span className="text-[#70c82a]">Equipment Command Center</span>
          </motion.h2>
          <p className="text-muted-foreground text-lg md:text-xl font-medium">Every machine. Every detail. One intelligent system.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Image Panel */}
          <div className="relative h-[300px] md:h-[500px] flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentCategory.id}
                initial={{ opacity: 0, x: 100, scale: 0.85 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -100, scale: 0.85 }}
                transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-tr ${statusColor === "bg-[#70c82a]"
                      ? "from-[#70c82a]/20"
                      : statusColor === "bg-amber-500"
                        ? "from-amber-500/20"
                        : "from-red-500/20"
                    } to-transparent blur-3xl opacity-30 rounded-full`}
                />
                <motion.div
                  animate={{ x: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={currentCategory.image}
                    alt={currentCategory.name}
                    fill
                    className="object-contain drop-shadow-[0_0_50px_rgba(112,200,42,0.2)]"
                    priority
                    unoptimized
                  />
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: Aggregated Data Panel - Attractive & Descriptive */}
          <div className="relative min-h-[500px] flex flex-col justify-center overflow-visible">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentCategory.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
                className="absolute inset-0 space-y-5"
              >
                <div className="space-y-2">
                  <h3 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight leading-tight">{currentCategory.name}</h3>
                  <p className="text-[#70c82a] font-mono text-base">Fleet Category #{currentCategory.id} of {equipmentCategories.length}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed italic mb-4">{getEquipmentDescription(currentCategory.name)}</p>
                </div>

                {/* Main Stats with Icons and Descriptions */}
                <div className="grid grid-cols-2 gap-3">
               

                  <motion.div
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    className="p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Truck className="w-4 h-4 text-blue-500" />
                      <p className="text-xs font-semibold text-muted-foreground">Total Fleet Size</p>
                    </div>
                    <div className="text-2xl font-bold text-foreground mb-1">
                      <AnimatedCounter value={currentCategory.totalQty} duration={1000} />
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-tight">Total equipment in this category</p>
                  </motion.div>

                  <motion.div
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    className="p-3 rounded-xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Gauge className="w-4 h-4 text-amber-500" />
                      <p className="text-xs font-semibold text-muted-foreground">Utilization Rate</p>
                    </div>
                    <div className="text-2xl font-bold text-amber-500 mb-1">
                      <AnimatedCounter value={utilization} duration={1000} />%
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-tight">Percentage of fleet in use</p>
                  </motion.div>

                 
                </div>


              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Scrollable Image Carousel - Small Images with Names */}
        <div className="mt-6 pt-4 border-t border-border dark:border-zinc-800">
          {/* Search Bar */}
          <div className="mb-6 flex justify-center">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search equipment categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-input dark:bg-zinc-900/50 border border-border dark:border-zinc-700 rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#70c82a] transition-colors"
              />
            </div>
          </div>

          {/* Horizontal Scrollable Image Carousel */}
          <div className="relative">
            {/* Left Scroll Button - Always Visible */}
            <button
              onClick={() => handleNavigate('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-background/95 dark:bg-zinc-900/95 border border-border dark:border-zinc-700 hover:border-[#70c82a] flex items-center justify-center transition-all hover:bg-muted dark:hover:bg-zinc-800 hover:scale-110 shadow-lg"
              aria-label="Scroll left"
            >
              <ChevronRight className="w-5 h-5 text-muted-foreground hover:text-[#70c82a] rotate-180 transition-colors" />
            </button>

            {/* Right Scroll Button - Always Visible */}
            <button
              onClick={() => handleNavigate('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-background/95 dark:bg-zinc-900/95 border border-border dark:border-zinc-700 hover:border-[#70c82a] flex items-center justify-center transition-all hover:bg-muted dark:hover:bg-zinc-800 hover:scale-110 shadow-lg"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5 text-muted-foreground hover:text-[#70c82a] transition-colors" />
            </button>

            <div
              ref={carouselRef}
              className="overflow-x-auto overflow-y-hidden scrollbar-hide pb-4 px-12 cursor-grab active:cursor-grabbing select-none"
              style={{ scrollBehavior: 'smooth' }}
              onMouseDown={(e) => {
                if (!carouselRef.current) return;
                setIsDragging(true);
                setStartX(e.pageX - carouselRef.current.offsetLeft);
                setScrollLeft(carouselRef.current.scrollLeft);
              }}
              onMouseLeave={() => {
                setIsDragging(false);
              }}
              onMouseUp={() => {
                setIsDragging(false);
              }}
              onMouseMove={(e) => {
                if (!isDragging || !carouselRef.current) return;
                e.preventDefault();
                const x = e.pageX - carouselRef.current.offsetLeft;
                const walk = (x - startX) * 2; // Scroll speed multiplier
                carouselRef.current.scrollLeft = scrollLeft - walk;
              }}
            >
              <div className="flex gap-3 min-w-max justify-center">
                {displayCategories.map((category, index) => {
                  const actualIndex = equipmentCategories.findIndex(cat => cat.id === category.id);
                  const isActive = actualIndex === currentIndex;
                  const categoryUtilization = calculateUtilization(category);
                  const categoryStatusColor = getStatusColor(categoryUtilization);

                  return (
                    <motion.button
                      key={category.id}
                      onClick={() => handleSelectCategory(index)}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.02 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      className={`
                          relative flex flex-col items-center gap-2 w-20 sm:w-24 p-3 rounded-xl border-2 transition-all cursor-pointer flex-shrink-0 group
                          ${isActive
                          ? 'bg-[#70c82a]/10 border-[#70c82a] shadow-[0_0_20px_rgba(112,200,42,0.4)] scale-105'
                          : 'bg-card/50 dark:bg-zinc-900/50 border-border dark:border-zinc-800 hover:border-border/80 dark:hover:border-zinc-700 hover:bg-card/70 dark:hover:bg-zinc-900/70'
                        }
                        `}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeCarouselItem"
                          className="absolute inset-0 bg-[#70c82a]/5 rounded-xl"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}

                      {/* Status Indicator */}
                      <div className={`absolute top-1 right-1 w-2.5 h-2.5 rounded-full ${categoryStatusColor} ${isActive ? 'animate-pulse shadow-[0_0_8px_rgba(112,200,42,0.6)]' : ''} z-10`} />

                      {/* Small Image */}
                      <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-muted dark:bg-zinc-800 border border-border dark:border-zinc-700 group-hover:border-[#70c82a]/50 transition-colors">
                        <Image
                          src={category.image}
                          alt={category.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 56px, 64px"
                          unoptimized
                        />
                      </div>

                      {/* Category Name */}
                      <div className="text-center w-full">
                        <p className={`text-[10px] sm:text-[11px] font-semibold line-clamp-2 leading-tight ${isActive ? 'text-foreground' : 'text-foreground/80 dark:text-zinc-300 group-hover:text-foreground'}`}>
                          {category.name}
                        </p>
                        <div className={`mt-1 text-[9px] font-bold ${isActive ? 'text-[#70c82a]' : 'text-muted-foreground'}`}>
                          {categoryUtilization}% · {category.op}/{category.totalQty}
                        </div>
                      </div>

                      {/* Active Indicator Line */}
                      {isActive && (
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "100%" }}
                          className="absolute bottom-0 left-0 h-0.5 bg-[#70c82a] rounded-full"
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>
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
const AnimatedCounter = ({ value, duration = 2000, showPlus = true }: { value: number; duration?: number; showPlus?: boolean }) => {
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

  return <span ref={ref}>{count}{showPlus ? '+' : ''}</span>
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
        <span className="font-medium text-foreground">{name}</span>
        <span className="text-muted-foreground">
          {total}/{operational}
        </span>
      </div>
      <div className="relative h-2 bg-muted dark:bg-zinc-800 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r from-[#70c82a] to-emerald-400`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: duration / 1000, ease: "easeOut" }}
        />
      </div>
    </div>
  )
}

export default function LandingPage() {
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrollToBottom, setScrollToBottom] = useState(true)
  const [chatInput, setChatInput] = useState('')
  const [chatUserMessages, setChatUserMessages] = useState<{ id: number; text: string }[]>([])
  const chatMessageIdRef = useRef(0)

  // Force overview (top) when on landing page — back from login/sign-up or refresh
  useLayoutEffect(() => {
    if (typeof window === 'undefined' || pathname !== '/') return
    window.history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)
    window.history.replaceState(null, '', '/#overview')
    const scrollToOverview = () => {
      window.scrollTo(0, 0)
      window.history.replaceState(null, '', '/#overview')
    }
    const delays = [50, 150, 400, 800, 1200]
    const timers = delays.map((d) => setTimeout(scrollToOverview, d))
    return () => timers.forEach((t) => clearTimeout(t))
  }, [pathname])

  // Scroll lock: for ~1.5s after mount, keep scroll at top to override late restoration
  useEffect(() => {
    if (pathname !== '/') return
    const interval = 100
    const duration = 1500
    const id = setInterval(() => {
      if (window.scrollY !== 0) window.scrollTo(0, 0)
    }, interval)
    const stop = setTimeout(() => clearInterval(id), duration)
    return () => {
      clearInterval(id)
      clearTimeout(stop)
    }
  }, [pathname])

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      if (maxScroll <= 0) return
      setScrollToBottom(scrollY < maxScroll * 0.5)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleScrollClick = () => {
    if (scrollToBottom) {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Set light mode as default
  useEffect(() => {
    document.documentElement.classList.remove('dark')
  }, [])

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (mobileMenuOpen && !target.closest('nav') && !target.closest('button[aria-label="Toggle menu"]')) {
        setMobileMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [mobileMenuOpen])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="border-b border-[#70c82a]/20 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 sticky top-0 z-50 shadow-sm"
      >
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            {/* Logo Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 md:gap-3 flex-shrink-0"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center justify-center relative"
              >
                <div className="absolute inset-0 bg-[#70c82a]/10 rounded-full blur-xl"></div>
                <Image
                  src="/ecwc png logo.png"
                  alt="ECWC Logo"
                  width={64}
                  height={64}
                  className="object-contain relative z-10 w-14 h-14 md:w-16 md:h-16"
                  quality={100}
                  unoptimized
                  priority
                  style={{ filter: 'drop-shadow(0 0 8px rgba(112, 200, 42, 0.3))' }}
                />
              </motion.div>

              <div className="hidden sm:flex flex-col">
                <span className="text-[10px] md:text-xs font-bold bg-gradient-to-r from-[#70c82a] to-[#5aa022] bg-clip-text text-transparent leading-tight">
                  ETHIOPIAN CONSTRUCTION WORKS CORPORATION
                </span>
                <span className="text-[13px] font-bold text-muted-foreground leading-tight">የኢትዮጵያ ኮንስትራክሽን ሥራዎች ኮርፖሬሽን</span>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-4 xl:gap-6">
              {["Overview", "Video", "Features ", "AI Support"].map((item, i) => {
                let href = "#overview"
                if (item === "Video") {
                  href = "#system-overview"
                } else if (item === "Features ") {
                  href = "#features"
                } else if (item === "AI Support") {
                  href = "#ai-support"
                } else if (item === "Overview") {
                  href = "#overview"
                }
                return (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                  >
                    <Link
                      href={href}
                      className="text-xs xl:text-sm font-semibold text-muted-foreground hover:text-[#70c82a] transition-colors relative group px-2 py-1 whitespace-nowrap"
                    >
                      {item}
                      <span className="absolute -bottom-1 left-2 right-2 h-0.5 bg-[#70c82a] scale-x-0 transition-transform group-hover:scale-x-100 rounded-full" />
                    </Link>
                  </motion.div>
                )
              })}
            </nav>

            {/* Desktop Actions */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
              className="hidden lg:flex items-center gap-3"
            >
              <Button variant="outline" size="sm" asChild className="border-[#70c82a]/30 hover:border-[#70c82a] hover:text-[#70c82a]">
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20" asChild>
                <Link href="/sign-up">Sign Up</Link>
              </Button>
              <ThemeToggle />
            </motion.div>

            {/* Mobile Menu Button */}
            <div className="flex lg:hidden items-center gap-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5 text-[#70c82a]" />
                ) : (
                  <Menu className="h-5 w-5 text-[#70c82a]" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.nav
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="lg:hidden border-t border-[#70c82a]/20 overflow-hidden"
              >
                <div className="py-4 space-y-3">
                  {["Overview", "Video", "Features", "AI Support  "].map((item, i) => {
                    let href = "#overview"
                    if (item === "Video") {
                      href = "#system-overview"
                    } else if (item === "Features") {
                      href = "#features"
                    } else if (item === "AI Support  ") {
                      href = "#ai-support"
                    } else if (item === "Overview") {
                      href = "#overview"
                    }
                    return (
                      <motion.div
                        key={item}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <Link
                          href={href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-[#70c82a] hover:bg-[#70c82a]/5 rounded-lg transition-colors"
                        >
                          {item}
                        </Link>
                      </motion.div>
                    )
                  })}
                  <div className="pt-2 px-4 space-y-2 border-t border-[#70c82a]/10 mt-2">
                    <Button variant="outline" size="sm" className="w-full border-[#70c82a]/30 hover:border-[#70c82a] hover:text-[#70c82a]" asChild>
                      <Link href="/sign-in" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                    </Button>
                    <Button size="sm" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
                      <Link href="/sign-up" onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>
                    </Button>
                  </div>
                </div>
              </motion.nav>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      {/* Hero Section - main overview (PEMS, Real-Time Monitoring, Live Equipment Dashboard) */}
      <section id="overview" className="relative overflow-hidden py-12 lg:py-16 bg-background dark:bg-black scroll-mt-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(112,200,42,0.05),transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_50%,rgba(112,200,42,0.05),transparent_50%)]" />
        <motion.div
          className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#70c82a] to-transparent"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.5 }}
        />

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="max-w-6xl mx-auto"
          >
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <motion.div variants={fadeInUp} className="space-y-4">
                {/* PMMS Acronym with Explanations */}
                <div className="relative">
                  {/* Vertical Connecting Line - starts after first circle, ends before last circle */}
                  <div className="absolute left-3 top-6 bottom-6 w-0.5 bg-black/40 dark:bg-white/40 rounded-full">
                    <motion.div
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ duration: 1.5, delay: 0.5, ease: [0.4, 0, 0.2, 1] }}
                      className="w-full h-full bg-black/40 dark:bg-white/40 rounded-full origin-top"
                    />
                  </div>

                  {/* PEMS Letters with Full Words */}
                  <div className="flex flex-col gap-5">
                    {[
                      { letter: "P", word: "Plant " },
                      { letter: "E", word: "Equipment" },
                      { letter: "M", word: "Management" },
                      { letter: "S", word: "System" }
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ x: -30, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{
                          duration: 0.7,
                          delay: 0.6 + i * 0.25,
                          ease: [0.4, 0, 0.2, 1]
                        }}
                        className="flex items-center gap-4 relative"
                      >
                        {/* Bullet Point aligned with letter */}
                        <div className="relative flex-shrink-0" style={{ width: '24px' }}>
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.3 + i * 0.3, type: "spring", stiffness: 200 }}
                            className="relative z-10"
                          >
                            <div className="w-3 h-3 rounded-full bg-black dark:bg-white shadow-lg flex items-center justify-center mx-auto">
                              <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-black"></div>
                            </div>
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                              transition={{ duration: 2, repeat: Infinity, delay: 0.8 + i * 0.3 }}
                              className="absolute inset-0 rounded-full border border-black/30 dark:border-white/30"
                            />
                          </motion.div>
                        </div>

                        {/* Large Letter */}
                        <div
                          className="text-2xl md:text-3xl lg:text-4xl font-black text-foreground flex-shrink-0"
                          style={{
                            fontFamily: 'var(--font-dm-sans), "DM Sans", sans-serif',
                            lineHeight: 1,
                            width: '32px'
                          }}
                        >
                          {item.letter}
                        </div>

                        {/* Animated Arrow Connector */}
                        <motion.div
                          initial={{ width: 0, opacity: 0 }}
                          animate={{ width: "auto", opacity: 1 }}
                          transition={{ duration: 0.5, delay: 0.8 + i * 0.25 }}
                          className="flex items-center gap-2"
                        >
                          <div className="h-0.5 w-6 bg-black/60 dark:bg-white/60"></div>
                          <motion.div
                            animate={{ x: [0, 3, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: 1 + i * 0.25 }}
                          >
                            <ChevronRight className="w-4 h-4 text-foreground" />
                          </motion.div>
                          <div className="h-0.5 w-3 bg-black/30 dark:bg-white/30"></div>
                        </motion.div>

                        {/* Full Word */}
                        <h1
                          className="text-lg md:text-xl lg:text-2xl font-bold tracking-tight text-foreground"
                          style={{
                            fontFamily: 'var(--font-dm-sans), "DM Sans", sans-serif',
                            letterSpacing: '-0.01em',
                            fontWeight: 700
                          }}
                        >
                          {item.word}
                        </h1>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Subheading with Vertical Line */}
                <motion.div
                  variants={fadeInUp}
                  className="flex items-start gap-5"
                >
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "100%", opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                    className="w-2 bg-[#70c82a] rounded-full shrink-0 mt-2 shadow-lg shadow-[#70c82a]/40"
                  />

                </motion.div>


                {/* Key Features Overview */}
                <motion.div
                  variants={fadeInUp}
                  className="space-y-4"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#70c82a] flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Real-Time Monitoring</h3>
                      <p className="text-sm text-muted-foreground">View live equipment status and site activity across all locations.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#70c82a] flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Multi-Site & Scalable Architecture</h3>
                      <p className="text-sm text-muted-foreground">Manage multiple construction sites from one centralized system.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#70c82a] flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Flexible System Design</h3>
                      <p className="text-sm text-muted-foreground">Easily manage assets, maintenance, inventory, and reporting.</p>
                    </div>
                  </div>
                </motion.div>

              </motion.div>

              {/* Right Content - Dashboard Preview */}
              <motion.div
                variants={scaleIn}
                className="relative"
              >
                <div className="relative overflow-hidden rounded-2xl bg-card dark:bg-zinc-950 border border-border dark:border-zinc-800 shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#70c82a]/5 to-transparent" />
                  <div className="p-6 relative z-10">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-border dark:border-zinc-800">
                      <h3 className="text-lg font-bold text-foreground">Live Equipment Dashboard</h3>
                      <Badge className="bg-[#70c82a] text-black font-bold">
                        <div className="h-2 w-2 bg-black rounded-full mr-2 animate-pulse" />
                        Live
                      </Badge>
                    </div>
                    <div className="space-y-6">
                      {/* Equipment Uptime Progress */}


                      {/* Equipment Status with Animated Progress Bars */}
                      <div className="space-y-4">
                        <AnimatedEquipmentProgress
                          name="Machinery"
                          operational={122}
                          total={312}
                          duration={1600}
                        />
                        <AnimatedEquipmentProgress
                          name="Dump Trucks"
                          operational={111}
                          total={365}
                          duration={1800}
                        />
                        <AnimatedEquipmentProgress
                          name="Heavy Vehicles"
                          operational={201}
                          total={540}
                          duration={2000}
                        />
                        <AnimatedEquipmentProgress
                          name="Light Vehicles"
                          operational={111}
                          total={288}
                          duration={2200}
                        />
                      </div>

                      {/* Quick Stats */}
                      <motion.div
                        className="grid grid-cols-2 gap-4 pt-4"
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                      >
                        {[
                          { value: "434", label: "Active Assets", color: "bg-[#70c82a]/10 border-[#70c82a]/20", textColor: "text-[#70c82a]" },
                          { value: "1140", label: "Total Assets", color: "bg-[#70c82a]/10 border-[#70c82a]/20", textColor: "text-[#70c82a]" }
                        ].map((stat, i) => (
                          <motion.div
                            key={i}
                            variants={fadeInUp}
                            className={`text-center p-4 rounded-xl border ${stat.color} hover:scale-105 transition-transform duration-300`}
                          >
                            <motion.div
                              className={`text-2xl font-bold ${stat.textColor}`}
                              initial={{ scale: 0 }}
                              whileInView={{ scale: 1 }}
                              viewport={{ once: true }}
                              transition={{ delay: 0.5 + i * 0.1, type: "spring", stiffness: 200 }}
                            >
                              {stat.value}
                            </motion.div>
                            <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                          </motion.div>
                        ))}
                      </motion.div>
                    </div>
                  </div>
                </div>


                {/* Floating Animation Elements */}
                <motion.div
                  className="absolute -top-4 -right-4 w-8 h-8 bg-[#70c82a] rounded-full opacity-20"
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
                  className="absolute -bottom-2 -left-2 w-6 h-6 bg-[#70c82a] rounded-full opacity-30"
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
      <section id="system-overview" className="relative py-20 lg:py-32 bg-gradient-to-b from-background via-muted/30 to-background dark:from-background dark:via-zinc-950 dark:to-black overflow-hidden">
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
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              <span className="text-[#70c82a]">ECWC Plant Management</span> in Action
            </h2>

          </motion.div>

          {/* Video Container with Cinematic Frame */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
            className="max-w-6xl mx-auto relative group"
            style={{ zIndex: 10 }}
          >
            {/* Glowing Border Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#70c82a] via-emerald-500 to-teal-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />

            {/* Video Frame */}
            <div className="relative rounded-2xl overflow-hidden border border-border dark:border-zinc-800 bg-card dark:bg-zinc-950 shadow-2xl" style={{ zIndex: 15 }}>
              {/* Video Player */}
              <div className="relative aspect-video bg-black">
                <video
                  controls
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-cover"
                  poster="/ps.jpg"
                  style={{ pointerEvents: 'auto' }}
                >
                  <source src="/erp.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>

                {/* Video Overlay Stats */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 pointer-events-none">
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
              <div className="p-6 border-t border-border dark:border-zinc-800">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-foreground font-bold text-lg mb-1">ECWC Plant & Maintenance Management System</h3>
                    <p className="text-muted-foreground text-sm">Comprehensive overview of features, capabilities, and operational excellence</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 border-border hover:border-[#70c82a]"
                      onClick={() => {
                        // Add brochure download functionality
                        const link = document.createElement('a');
                        link.href = '/brochure.pdf'; // Update with actual brochure path
                        link.download = 'ECWC-PEMS-Brochure.pdf';
                        link.click();
                      }}
                    >
                      <Download className="w-4 h-4" />
                      Brochure
                    </Button>
                    <Link href="/sign-up">
                      <Button
                        size="sm"
                        className="gap-2 bg-[#70c82a] hover:bg-[#5fa822] text-black font-semibold"
                      >
                        Request Demo
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
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
              className="hidden lg:block absolute -left-12 top-1/4 w-64 p-4 rounded-xl bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 shadow-xl z-20"
              style={{ pointerEvents: 'auto' }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-[#70c82a]/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-[#70c82a]" />
                </div>
                <div>
                  <div className="text-foreground font-bold text-sm">Government-Grade</div>
                  <div className="text-muted-foreground text-xs">Security & Compliance</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="hidden lg:block absolute -right-12 bottom-1/4 w-64 p-4 rounded-xl bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 shadow-xl z-20"
              style={{ pointerEvents: 'auto' }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-[#70c82a]/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-[#70c82a]" />
                </div>
                <div>
                  <div className="text-foreground font-bold text-sm">Real-Time Analytics</div>
                  <div className="text-muted-foreground text-xs">Live Equipment Monitoring</div>
                </div>
              </div>
            </motion.div>
          </motion.div>


        </div>
      </section>

      {/* ECWC Equipment Command Center */}
      <CommandCenterSection />

      {/* Core Functional Areas - Enterprise Data-Driven */}
      <section id="features" className="pt-6 pb-12 lg:pt-8 lg:pb-16 bg-background dark:bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(112,200,42,0.03),transparent_70%)]" />
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#70c82a]/10 text-[#70c82a] text-xs font-bold uppercase tracking-widest mb-6 border border-[#70c82a]/20">
              Enterprise Architecture
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
              Core <span className="text-[#70c82a]">Functional Areas</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
              Comprehensive operational intelligence platform built for ECWC infrastructure management
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
                  <h3 className="text-3xl font-bold text-foreground">Asset & Fleet Management</h3>
                </div>
              </div>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                Know every piece of equipment, where it is, and its condition.
              </p>
              <div className="mb-8">
                <h4 className="text-foreground font-semibold mb-4">What this module does</h4>
                <div className="space-y-3">
                  {[
                    "Keeps a single list of all ECWC equipment",
                    "Stores equipment type, value, site, and condition",
                    "Tracks full maintenance and usage history",
                    "Supports QR code for quick mobile access",
                    "Shows equipment availability in real time"
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-center gap-3 text-foreground"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-[#70c82a]" />
                      <span className="text-sm">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
              <div className="p-6 rounded-xl bg-[#70c82a]/5 border border-[#70c82a]/20">
                <h4 className="text-foreground font-semibold mb-3">ECWC Scenario</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  ECWC receives a new excavator for a road project in Bahir Dar.
                  The asset officer registers it in the system, assigns an ID and QR code, and records its value and location.
                  From that day, every maintenance job, part replacement, and cost is automatically linked to this excavator.
                  Managers can see its status anytime without calling the site.
                </p>
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
              <div className="relative p-6 rounded-2xl bg-card dark:bg-zinc-950 border border-border dark:border-zinc-800">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-border dark:border-zinc-800">
                  <div className="text-foreground font-bold">Equipment Registry Overview</div>
                  <Badge className="bg-[#70c82a] text-black">Live Data</Badge>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border dark:border-zinc-800">
                        <th className="text-left py-3 px-2 text-xs font-bold text-muted-foreground uppercase">Asset ID</th>
                        <th className="text-left py-3 px-2 text-xs font-bold text-muted-foreground uppercase">Type</th>
                        <th className="text-left py-3 px-2 text-xs font-bold text-muted-foreground uppercase">Status</th>
                        <th className="text-right py-3 px-2 text-xs font-bold text-muted-foreground uppercase">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { id: "ECWC-B-042", type: "Dozer", status: "Active", value: "Br 124.5K", color: "bg-[#70c82a]" },
                        { id: "ECWC-E-108", type: "Excavator", status: "Maint.", value: "Br 89.2K", color: "bg-amber-500" },
                        { id: "ECWC-G-056", type: "Grader", status: "Active", value: "Br 156K", color: "bg-[#70c82a]" },
                        { id: "ECWC-L-023", type: "Loader", status: "Critical", value: "Br 210.4K", color: "bg-red-500" },
                        { id: "ECWC-T-091", type: "Truck", status: "Active", value: "Br 78.3K", color: "bg-[#70c82a]" }
                      ].map((row, i) => (
                        <motion.tr
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.1 }}
                          className="border-b border-border/50 dark:border-zinc-800/50 hover:bg-muted/30 dark:hover:bg-zinc-900/30 transition-colors"
                        >
                          <td className="py-3 px-2 text-sm font-mono text-foreground">{row.id}</td>
                          <td className="py-3 px-2 text-sm text-muted-foreground">{row.type}</td>
                          <td className="py-3 px-2">
                            <span className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${row.color}`} />
                              <span className="text-xs text-muted-foreground">{row.status}</span>
                            </span>
                          </td>
                          <td className="py-3 px-2 text-right text-sm font-semibold text-foreground">{row.value}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-6 pt-4 border-t border-border dark:border-zinc-800 flex justify-between items-center">
                  <div className="text-xs text-muted-foreground">Total Fleet Value</div>
                  <div className="text-2xl font-bold text-[#70c82a]">Br 12.4M</div>
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
              <div className="p-8 rounded-2xl bg-card dark:bg-zinc-950 border border-border dark:border-zinc-800">
                <div className="text-foreground font-bold mb-6">Maintenance KPI Dashboard</div>
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
                      className="p-4 rounded-xl bg-card/50 dark:bg-zinc-900/50 border border-border dark:border-zinc-800"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                        <span className="text-xs font-bold text-[#70c82a]">{kpi.trend}</span>
                      </div>
                      <div className="text-2xl font-bold text-foreground mb-1">{kpi.value}</div>
                      <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{kpi.label}</div>
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
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>{bar.label}</span>
                        <span className="font-bold text-foreground">{bar.value}</span>
                      </div>
                      <div className="h-2 bg-muted dark:bg-zinc-800 rounded-full overflow-hidden">
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
                  <h3 className="text-3xl font-bold text-foreground"> Work Order Management</h3>
                </div>
              </div>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                Plan, assign, and track all maintenance work in one place.
              </p>
              <div className="mb-8">
                <h4 className="text-foreground font-semibold mb-4">What this module does</h4>
                <div className="space-y-3">
                  {[
                    "Creates preventive maintenance schedules",
                    "Handles breakdown and emergency repairs",
                    "Automatically generates work orders",
                    "Tracks work order status from start to finish",
                    "Records downtime and failure reasons"
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-center gap-3 text-foreground"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-[#70c82a]" />
                      <span className="text-sm">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
              <div className="p-6 rounded-xl bg-[#70c82a]/5 border border-[#70c82a]/20">
                <h4 className="text-foreground font-semibold mb-3">ECWC Scenario</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  A bulldozer reaches its scheduled service hours.
                  The system automatically creates a work order and notifies the workshop supervisor.
                  Tasks and safety checks are already listed, so the technician knows exactly what to do.
                  Maintenance is completed on time, preventing an unexpected breakdown on site.
                </p>
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
                  <h3 className="text-3xl font-bold text-foreground">Workforce & Time Management</h3>
                </div>
              </div>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                Track technician work time, productivity, and labor cost.
              </p>
              <div className="mb-8">
                <h4 className="text-foreground font-semibold mb-4">What this module does</h4>
                <div className="space-y-3">
                  {[
                    "Records technician working hours per job",
                    "Tracks shifts and overtime",
                    "Calculates labor cost automatically",
                    "Monitors technician productivity",
                    "Generates payroll-ready reports"
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-center gap-3 text-foreground"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-[#70c82a]" />
                      <span className="text-sm">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
              <div className="p-6 rounded-xl bg-[#70c82a]/5 border border-[#70c82a]/20">
                <h4 className="text-foreground font-semibold mb-3">ECWC Scenario</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  A technician repairs a loader and records start and end time using a mobile phone.
                  The system calculates labor hours and cost automatically.
                  At the end of the week, the manager sees who worked overtime and which jobs took longer than planned.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="p-8 rounded-2xl bg-card dark:bg-zinc-950 border border-border dark:border-zinc-800">
                <div className="text-foreground font-bold mb-6">Weekly Workforce Analytics</div>
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
                      className="p-4 rounded-xl bg-card/50 dark:bg-zinc-900/50 border border-border dark:border-zinc-800 text-center"
                    >
                      <stat.icon className={`w-5 h-5 ${stat.color} mx-auto mb-2`} />
                      <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
                      <div className="text-[10px] text-muted-foreground uppercase font-bold">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
                <div className="space-y-3 mb-6">
                  <div className="text-sm text-muted-foreground mb-2">Productivity by Shift</div>
                  {[
                    { shift: "Morning Shift", hours: 428, productivity: 96, color: "bg-[#70c82a]" },
                    { shift: "Day Shift", hours: 512, productivity: 88, color: "bg-blue-500" },
                    { shift: "Night Shift", hours: 307, productivity: 82, color: "bg-amber-500" }
                  ].map((shift, i) => (
                    <div key={i} className="p-4 rounded-xl bg-card/50 dark:bg-zinc-900/50 border border-border dark:border-zinc-800">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-foreground font-semibold">{shift.shift}</span>
                        <span className="text-xs text-muted-foreground">{shift.hours}h</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-muted dark:bg-zinc-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${shift.productivity}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: i * 0.2 }}
                            className={`h-full ${shift.color} rounded-full`}
                          />
                        </div>
                        <span className="text-xs font-bold text-foreground">{shift.productivity}%</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-border dark:border-zinc-800 flex justify-between items-center">
                  <div className="text-xs text-muted-foreground">Total Labor Cost This Week</div>
                  <div className="text-2xl font-bold text-[#70c82a]">Br 47,850</div>
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
              <div className="p-8 rounded-2xl bg-card dark:bg-zinc-950 border border-border dark:border-zinc-800">
                <div className="text-foreground font-bold mb-6">Inventory Status Overview</div>
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
                      className="p-4 rounded-xl bg-card/50 dark:bg-zinc-900/50 border border-border dark:border-zinc-800"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                        <span className="text-xs font-bold text-muted-foreground">{stat.trend}</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground uppercase font-bold">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
                <div className="mb-6">
                  <div className="text-sm text-muted-foreground mb-3">Recent Parts Issued</div>
                  <div className="space-y-2">
                    {[
                      { part: "Hydraulic Filter HF-208", qty: "12", wo: "WO-2847", cost: "Br 1,240" },
                      { part: "Engine Oil 15W-40 (Drum)", qty: "8", wo: "WO-2851", cost: "Br 2,880" },
                      { part: "Air Filter Element AF-501", qty: "24", wo: "WO-2856", cost: "Br 960" },
                      { part: "Brake Pad Set BP-410", qty: "6", wo: "WO-2859", cost: "Br 1,440" }
                    ].map((issue, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-card/30 dark:bg-zinc-900/30 border border-border dark:border-zinc-800 text-xs">
                        <div className="flex-1">
                          <div className="text-foreground font-semibold mb-1">{issue.part}</div>
                          <div className="text-muted-foreground">QTY: {issue.qty} • {issue.wo}</div>
                        </div>
                        <div className="text-foreground font-bold">{issue.cost}</div>
                      </div>
                    ))}
                  </div>
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
                  <h3 className="text-3xl font-bold text-foreground">Inventory Management</h3>
                </div>
              </div>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                Always know what spare parts you have and what you need.
              </p>
              <div className="mb-8">
                <h4 className="text-foreground font-semibold mb-4">What this module does</h4>
                <div className="space-y-3">
                  {[
                    "Shows real-time spare parts availability",
                    "Manages multiple stores and warehouses",
                    "Sends alerts when stock is low",
                    "Tracks parts issued per work order",
                    "Calculates inventory value"
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-center gap-3 text-foreground"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-[#70c82a]" />
                      <span className="text-sm">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
              <div className="p-6 rounded-xl bg-[#70c82a]/5 border border-[#70c82a]/20">
                <h4 className="text-foreground font-semibold mb-3">ECWC Scenario</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  A work order requires hydraulic filters.
                  Before maintenance starts, the system checks the store and reserves the parts.
                  When stock goes below minimum, the storekeeper receives an alert to reorder.
                  This prevents delays and emergency purchases.
                </p>
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
              <div className="p-8 rounded-2xl bg-gradient-to-br from-[#70c82a]/5 via-card to-card dark:via-zinc-950 dark:to-zinc-950 border border-[#70c82a]/20">
                <div className="text-foreground font-bold mb-6 text-lg">Executive Command Center</div>

                <div className="space-y-4">
                  {/* Site Performance Comparison - Vertical Bar Chart */}
                  <div className="p-4 rounded-xl bg-card/50 dark:bg-zinc-900/50 border border-border dark:border-zinc-800">
                    <div className="text-xs font-semibold text-foreground mb-6">Site Performance Comparison</div>
                    <div className="relative pt-6 pb-4">
                      <div className="flex items-end justify-center gap-6 h-16">
                        {[
                          { site: "Addis Ababa", value: 94 },
                          { site: "Dire Dawa", value: 23 },
                          { site: "Bahir Dar", value: 55 }
                        ].map((item, j) => (
                          <div key={j} className="flex flex-col items-center gap-2 flex-1 max-w-[100px]">
                            <div className="relative w-full h-16 flex items-end justify-center">
                              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-[10px] font-bold text-[#70c82a] whitespace-nowrap z-10">
                                {item.value}%
                              </div>
                              <motion.div
                                initial={{ height: 0 }}
                                whileInView={{ height: `${item.value}%` }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: j * 0.15 }}
                                className="w-full bg-gradient-to-t from-[#70c82a] via-[#70c82a]/80 to-emerald-400 rounded-t-md relative group shadow-lg shadow-[#70c82a]/20"
                                style={{ height: `${item.value}%`, minHeight: '10px' }}
                              />
                            </div>
                            <span className="text-[11px] text-foreground font-semibold text-center leading-tight">{item.site}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Monthly Cost Trends - Line Chart */}
                  <div className="p-4 rounded-xl bg-card/50 dark:bg-zinc-900/50 border border-border dark:border-zinc-800">
                    <div className="text-xs font-semibold text-foreground mb-4">Monthly Cost Trends</div>
                    <div className="relative h-24">
                      <svg className="w-full h-full" viewBox="0 0 200 80" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#70c82a" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#70c82a" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        {/* Grid lines */}
                        {[0, 20, 40, 60, 80, 100].map((y) => (
                          <line key={y} x1="0" y1={80 - y * 0.8} x2="200" y2={80 - y * 0.8} stroke="currentColor" strokeWidth="0.5" className="text-border opacity-20" />
                        ))}
                        {/* Area under line */}
                        <motion.path
                          initial={{ pathLength: 0 }}
                          whileInView={{ pathLength: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.2 }}
                          d="M 10 40 L 70 20 L 130 30 L 190 25 L 190 80 L 10 80 Z"
                          fill="url(#lineGradient)"
                        />
                        {/* Line */}
                        <motion.path
                          initial={{ pathLength: 0 }}
                          whileInView={{ pathLength: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.2 }}
                          d="M 10 40 L 70 20 L 130 30 L 190 25"
                          stroke="#70c82a"
                          strokeWidth="2"
                          fill="none"
                          strokeLinecap="round"
                        />
                        {/* Data points */}
                        {[
                          { x: 10, y: 40, month: "Jan" },
                          { x: 70, y: 20, month: "Feb" },
                          { x: 130, y: 30, month: "Mar" },
                          { x: 190, y: 25, month: "Apr" }
                        ].map((point, i) => (
                          <motion.circle
                            key={i}
                            initial={{ scale: 0 }}
                            whileInView={{ scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.5 + i * 0.2 }}
                            cx={point.x}
                            cy={point.y}
                            r="3"
                            fill="#70c82a"
                            stroke="white"
                            strokeWidth="2"
                          />
                        ))}
                      </svg>
                      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-muted-foreground px-2">
                        <span>Jan</span>
                        <span>Feb</span>
                        <span>Mar</span>
                        <span>Apr</span>
                      </div>
                    </div>
                  </div>

                  {/* Inventory Valuation - Three Separate Pie Charts */}
                  <div className="p-4 rounded-xl bg-card/50 dark:bg-zinc-900/50 border border-border dark:border-zinc-800">
                    <div className="text-xs font-semibold text-foreground mb-4">Inventory Valuation</div>
                    <div className="flex items-center justify-between gap-4 h-24">
                      {[
                        { quarter: "Q1", value: 78, color: "#70c82a" },
                        { quarter: "Q2", value: 85, color: "#8dd63a" },
                        { quarter: "Q3", value: 92, color: "#a8e55c" }
                      ].map((item, j) => {
                        // Calculate percentage for donut chart (value out of 100 for visual)
                        const percentage = item.value;
                        const circumference = 2 * Math.PI * 35; // radius 35
                        const offset = circumference - (percentage / 100) * circumference;

                        // Gradient IDs for each quarter
                        const gradientId = `pieGradient${j}`;
                        const shadowId = `pieShadow${j}`;

                        return (
                          <div key={j} className="flex flex-col items-center gap-3 flex-1 group">
                            <div className="relative">
                              <svg width="70" height="70" viewBox="0 0 100 100" style={{ display: 'block' }} className="drop-shadow-lg">
                                <defs>
                                  <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor={item.color} stopOpacity="1" />
                                    <stop offset="100%" stopColor={item.color} stopOpacity="0.7" />
                                  </linearGradient>
                                  <filter id={shadowId}>
                                    <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
                                    <feOffset dx="0" dy="2" result="offsetblur" />
                                    <feComponentTransfer>
                                      <feFuncA type="linear" slope="0.3" />
                                    </feComponentTransfer>
                                    <feMerge>
                                      <feMergeNode />
                                      <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                  </filter>
                                </defs>
                                {/* Background circle with glow */}
                                <circle
                                  cx="50"
                                  cy="50"
                                  r="35"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="10"
                                  className="text-muted opacity-10"
                                />
                                {/* Value circle with gradient and shadow */}
                                <motion.circle
                                  cx="50"
                                  cy="50"
                                  r="35"
                                  fill="none"
                                  stroke={`url(#${gradientId})`}
                                  strokeWidth="10"
                                  strokeDasharray={circumference}
                                  initial={{ strokeDashoffset: circumference, opacity: 0 }}
                                  whileInView={{ strokeDashoffset: offset, opacity: 1 }}
                                  viewport={{ once: true }}
                                  transition={{ duration: 1.2, delay: j * 0.2, ease: "easeOut" }}
                                  strokeLinecap="round"
                                  transform="rotate(-90 50 50)"
                                  filter={`url(#${shadowId})`}
                                  className="group-hover:stroke-[12] transition-all"
                                />
                                {/* Center circle with gradient background */}
                                <circle cx="50" cy="50" r="22" fill="white" className="dark:fill-zinc-950 opacity-90" />
                                <circle cx="50" cy="50" r="22" fill={`url(#${gradientId})`} opacity="0.1" />
                                {/* Center text */}
                                <text x="50" y="47" textAnchor="middle" dominantBaseline="middle" className="text-[9px] font-bold fill-foreground">
                                  {item.quarter}
                                </text>
                                <text x="50" y="57" textAnchor="middle" dominantBaseline="middle" className="text-[8px] font-semibold fill-[#70c82a]">
                                  Br {item.value}K
                                </text>
                              </svg>
                            </div>
                            <span className="text-xs text-foreground font-semibold">{item.quarter}: Br {item.value}K</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                 
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
                  <div className="text-xs text-[#70c82a] font-bold uppercase tracking-wider mb-1">Module 05</div>
                  <h3 className="text-3xl font-bold text-foreground">Executive Dashboard & Reporting</h3>
                </div>
              </div>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                See the full operation at a glance.
              </p>
              <div className="mb-8">
                <h4 className="text-foreground font-semibold mb-4">What this module does</h4>
                <div className="space-y-3">
                  {[
                    "Shows fleet availability and uptime",
                    "Displays key maintenance KPIs (MTBF, MTTR)",
                    "Highlights critical alerts and risks",
                    "Compares performance across sites",
                    "Provides clear reports for leadership"
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-center gap-3 text-foreground"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-[#70c82a]" />
                      <span className="text-sm">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
              <div className="p-6 rounded-xl bg-[#70c82a]/5 border border-[#70c82a]/20">
                <h4 className="text-foreground font-semibold mb-3">ECWC Scenario</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  An ECWC executive opens the dashboard in the morning.
                  They immediately see fleet availability, equipment under maintenance, and critical alerts.
                  Without asking for reports, they know where attention is needed and can take action quickly.
                </p>
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* AI-Powered Decision Support - Professional Analytics */}
      <section id="ai-support" className="py-32 bg-background dark:bg-zinc-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background dark:from-black dark:via-zinc-950 dark:to-black" />
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
            <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
              AI-Powered <span className="text-[#70c82a]">Decision Support</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
              Transform from reactive maintenance to predictive leadership with AI Support
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
                title: " preventive maintenance actions",
                metric: "2.4x",
                label: "ROI Improvement",
                desc: "AI-driven scheduling optimizes maintenance windows, reducing downtime and maximizing asset utilization across the fleet."
              },
              {
                icon: AlertTriangle,
                title: "Identify abnormal maintenance ",
                metric: "Br 47K",
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
                className="p-6 rounded-2xl bg-card/50 dark:bg-zinc-900/50 border border-border dark:border-zinc-800 hover:border-[#70c82a]/30 transition-all group"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-[#70c82a]/10 flex items-center justify-center border border-[#70c82a]/20">
                    <card.icon className="w-6 h-6 text-[#70c82a]" />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-foreground">{card.metric}</div>
                    <div className="text-[10px] text-muted-foreground uppercase font-bold">{card.label}</div>
                  </div>
                </div>
                <h4 className="text-foreground font-bold text-lg mb-3">{card.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{card.desc}</p>
              </motion.div>
            ))}
          </div>

        

          {/* AI Chat Assistant - ChatGPT Style */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16"
          >
            <div className="max-w-4xl mx-auto bg-background dark:bg-zinc-950 rounded-2xl border border-border dark:border-zinc-800 overflow-hidden shadow-2xl">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-[#70c82a]/10 to-[#70c82a]/5 border-b border-border dark:border-zinc-800 px-4 sm:px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#70c82a]/20 flex items-center justify-center border-2 border-[#70c82a]/30 flex-shrink-0">
                    <Cpu className="w-5 h-5 text-[#70c82a]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-foreground truncate">ECWC AI Assistant</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="w-2 h-2 rounded-full bg-[#70c82a] animate-pulse flex-shrink-0"></span>
                      <span className="truncate">Online • Ready to help</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat Messages Container - no vertical scroll, compact */}
              <div className="overflow-hidden bg-gradient-to-b from-background to-muted/20">
                <div className="divide-y divide-border dark:divide-zinc-800 px-1">
                  {[
                    {
                      question: "Which site has the highest maintenance cost this month?",
                      answer: "Addis Ababa Site — Br 82,400. Main drivers: high emergency work orders, heavy spare-part consumption for excavators, and increased overtime labor hours."
                    },
                    {
                      question: "What are the main maintenance issues this month and their impact?",
                      answer: {
                        main: "Two primary issues are driving higher costs and equipment downtime:",
                        details: [
                          {
                            issue: "Hydraulic system failures",
                            percentage: "38%",
                            impact: "This is the leading cause of downtime, affecting multiple excavators and loaders. Most failures occur due to seal degradation and contamination from harsh operating conditions.",
                            cost: "Estimated monthly cost: Br 42,000 in repairs and lost productivity"
                          },
                          {
                            issue: "Engine overheating",
                            percentage: "27%",
                            impact: "Primarily affecting older equipment and those operating in high-temperature conditions. Coolant system failures and radiator blockages are common causes.",
                            cost: "Estimated monthly cost: Br 28,500 including engine repairs and preventive measures"
                          }
                        ],
                        recommendation: "Immediate actions: (1) Implement preventive seal replacement program, (2) Upgrade cooling systems on high-risk equipment.",
                        total: "Combined monthly impact: ~Br 70,500 in direct costs and productivity losses."
                      }
                    }
                  ].map((qa, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="group"
                    >
                      {/* User Question - Right Side */}
                      <div className="bg-muted/30 dark:bg-zinc-900/50 px-4 sm:px-6 py-3">
                        <div className="flex gap-3 sm:gap-4 justify-end items-start">
                          <div className="flex-1 min-w-0 flex justify-end">
                            <p className="text-sm font-medium text-foreground leading-relaxed whitespace-pre-wrap text-right max-w-full sm:max-w-[85%] break-words">{qa.question}</p>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-[#70c82a] dark:bg-[#70c82a] flex items-center justify-center flex-shrink-0 mt-1">
                            <User className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      </div>

                      {/* AI Answer - Left Side */}
                      <div className="bg-background dark:bg-zinc-950 px-4 sm:px-6 py-3">
                        <div className="flex gap-3 sm:gap-4 items-start">
                          <div className="w-8 h-8 rounded-full bg-[#70c82a]/20 dark:bg-[#70c82a]/20 flex items-center justify-center flex-shrink-0 mt-1 border border-[#70c82a]/30">
                            <Cpu className="w-4 h-4 text-[#70c82a]" />
                          </div>
                          <div className="flex-1 min-w-0 pt-1">
                            {typeof qa.answer === 'string' ? (
                              <div className="prose prose-sm dark:prose-invert max-w-none">
                                <p className="text-foreground leading-relaxed whitespace-pre-wrap break-words">{qa.answer}</p>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <p className="text-foreground leading-relaxed break-words">{qa.answer.main}</p>

                                <div className="space-y-4">
                                  {qa.answer.details.map((detail: any, idx: number) => (
                                    <div key={idx} className="border-l-2 border-[#70c82a]/30 pl-3 space-y-1.5">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <h4 className="text-base font-semibold text-foreground break-words">{detail.issue}</h4>
                                        <span className="px-2 py-0.5 rounded bg-[#70c82a]/10 text-[#70c82a] text-xs font-bold flex-shrink-0">{detail.percentage}</span>
                                      </div>
                                      <p className="text-sm text-muted-foreground leading-relaxed break-words">{detail.impact}</p>
                                      <p className="text-xs text-[#70c82a] font-medium break-words">{detail.cost}</p>
                                    </div>
                                  ))}
                                </div>

                                {qa.answer.recommendation && (
                                  <div className="mt-4 p-3 bg-[#70c82a]/5 dark:bg-[#70c82a]/10 rounded-lg border border-[#70c82a]/20">
                                    <p className="text-sm font-semibold text-foreground mb-1">Recommended Actions:</p>
                                    <p className="text-sm text-muted-foreground leading-relaxed break-words">{qa.answer.recommendation}</p>
                                  </div>
                                )}

                                {qa.answer.total && (
                                  <div className="mt-3 pt-3 border-t border-border dark:border-zinc-800">
                                    <p className="text-sm font-bold text-foreground break-words">{qa.answer.total}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* User-sent messages + "Coming soon" reply */}
              {chatUserMessages.length > 0 && (
                <div className="divide-y divide-border dark:divide-zinc-800 px-1">
                  {chatUserMessages.map((msg) => (
                    <div key={msg.id} className="group">
                      <div className="bg-muted/30 dark:bg-zinc-900/50 px-4 sm:px-6 py-3">
                        <div className="flex gap-3 sm:gap-4 justify-end items-start">
                          <div className="flex-1 min-w-0 flex justify-end">
                            <p className="text-sm font-medium text-foreground leading-relaxed whitespace-pre-wrap text-right max-w-full sm:max-w-[85%] break-words">{msg.text}</p>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-[#70c82a] flex items-center justify-center flex-shrink-0 mt-1">
                            <User className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      </div>
                      <div className="bg-background dark:bg-zinc-950 px-4 sm:px-6 py-3">
                        <div className="flex gap-3 sm:gap-4 items-start">
                          <div className="w-8 h-8 rounded-full bg-[#70c82a]/20 flex items-center justify-center flex-shrink-0 mt-1 border border-[#70c82a]/30">
                            <Cpu className="w-4 h-4 text-[#70c82a]" />
                          </div>
                          <div className="flex-1 min-w-0 pt-1">
                            <div className="rounded-xl border-2 border-[#70c82a]/25 bg-gradient-to-br from-[#70c82a]/10 to-[#70c82a]/5 dark:from-[#70c82a]/15 dark:to-[#70c82a]/5 p-4 shadow-sm">
                              <p className="text-sm font-semibold text-[#70c82a] mb-2 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#70c82a] animate-pulse" />
                                We appreciate you want to use the chatbot
                              </p>
                              <p className="text-sm text-foreground leading-relaxed mb-3">
                                The ECWC AI Assistant is currently in development. We are building a smart AI assistant to help you with maintenance insights, cost analysis, and recommendations.
                              </p>
                              <p className="text-sm font-medium text-foreground">
                                Coming soon — stay tuned.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Input + Send */}
              <div className="border-t border-border dark:border-zinc-800 px-4 sm:px-6 py-3 bg-background dark:bg-zinc-950">
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Ask a follow-up question…"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        const text = chatInput.trim()
                        if (text) {
                          chatMessageIdRef.current += 1
                          setChatUserMessages((m) => [...m, { id: chatMessageIdRef.current, text }])
                          setChatInput('')
                        }
                      }
                    }}
                    className="flex-1 min-w-0 rounded-xl border border-border dark:border-zinc-700 bg-muted/30 dark:bg-zinc-800/50 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#70c82a]/50 focus:border-[#70c82a]/50"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const text = chatInput.trim()
                      if (text) {
                        chatMessageIdRef.current += 1
                        setChatUserMessages((m) => [...m, { id: chatMessageIdRef.current, text }])
                        setChatInput('')
                      }
                    }}
                    className="shrink-0 w-10 h-10 rounded-xl bg-[#70c82a] hover:bg-[#70c82a]/90 text-white flex items-center justify-center transition-colors disabled:opacity-50"
                    aria-label="Send"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <p className="mt-2 text-[10px] sm:text-xs text-muted-foreground text-center">
                  AI Assistant is in development — your message will receive a &quot;Coming soon&quot; reply.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

  

      {/* ECWC Compound Map - below Why PEMS */}
      <section id="compound-map" className="min-h-screen w-full flex flex-col bg-background dark:bg-zinc-950 border-t border-border dark:border-zinc-800/50">
        <div className="shrink-0 relative overflow-hidden border-b border-border dark:border-zinc-800">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background dark:from-black dark:via-zinc-950 dark:to-black" />
          <div className="container mx-auto px-4 lg:px-8 relative z-10 py-8 sm:py-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#70c82a]/10 text-[#70c82a] text-xs font-bold uppercase tracking-widest mb-6 border border-[#70c82a]/20">
                Sites & Locations
              </div>
              <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
                ECWC Compound <span className="text-[#70c82a]">Map</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
                Explore sites, assets, and locations — all in one interactive view
              </p>
            </motion.div>
          </div>
        </div>
        <div className="flex-1 min-h-[85vh] w-full px-4 sm:px-6 lg:px-12 flex justify-center py-4">
          <div className="w-full max-w-[1600px] h-full min-h-[75vh]">
            <CompoundMap />
          </div>
        </div>
      </section>

      {/* Ethiopia Digital 2030 – Alignment & Pillars */}
      <section className="relative py-16 lg:py-24 overflow-hidden border-t border-border dark:border-zinc-800/50">
        {/* Layered background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#70c82a]/[0.07] via-[#70c82a]/[0.02] to-background dark:from-[#70c82a]/[0.08] dark:via-[#70c82a]/[0.03] dark:to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(112,200,42,0.15),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(112,200,42,0.12),transparent)]" />
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#70c82a]/10 text-[#70c82a] text-xs font-bold uppercase tracking-widest mb-6 border border-[#70c82a]/20">
              National Alignment
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
              Aligned with <span className="text-[#70c82a]"> Digital Ethiopia 2030</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
              Built for the future: dynamic, intelligent, connected, and secure.
            </p>
          </motion.div>

          {/* Pillar cards – premium style */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 max-w-6xl mx-auto">
            {[
              { icon: Zap, title: 'Dynamic', desc: 'Real-time updates and adaptive workflows that scale with your operations.', accent: 'from-amber-500/20 to-[#70c82a]/20' },
              { icon: Cpu, title: 'AI Support', desc: 'Intelligent insights and predictive maintenance powered by AI.', accent: 'from-violet-500/20 to-[#70c82a]/20' },
              { icon: Database, title: 'Data Sharing', desc: 'Seamless, standards-based data sharing across sites and systems.', accent: 'from-blue-500/20 to-[#70c82a]/20' },
              { icon: Shield, title: 'Secure', desc: 'Enterprise-grade security to protect data and operations.', accent: 'from-emerald-500/20 to-[#70c82a]/20' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + i * 0.1, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                whileHover={{ y: -4 }}
                className="group relative"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#70c82a]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <div className="relative h-full rounded-2xl border-2 border-border dark:border-zinc-700/80 bg-card/80 dark:bg-zinc-900/90 backdrop-blur-sm p-6 md:p-7 shadow-lg shadow-black/5 dark:shadow-black/20 hover:shadow-xl hover:shadow-[#70c82a]/10 dark:hover:shadow-[#70c82a]/5 hover:border-[#70c82a]/40 transition-all duration-300 overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#70c82a] to-[#8fd936] rounded-l-2xl opacity-90" />
                  <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${item.accent} rounded-bl-full opacity-60`} />
                  <div className="relative">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#70c82a]/25 to-[#70c82a]/10 flex items-center justify-center border border-[#70c82a]/30 shadow-[0_4px_14px_rgba(112,200,42,0.2)] group-hover:scale-110 transition-transform duration-300">
                        <item.icon className="w-6 h-6 text-[#70c82a]" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground">{item.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed pl-0.5">{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Motto Section with Dual-Row Auto-Scroll */}
      <section className="py-6 md:py-8 mb-0 bg-gradient-to-b from-[#70c82a]/5 via-background to-[#70c82a]/5 dark:from-[#70c82a]/3 dark:via-background dark:to-[#70c82a]/3 overflow-hidden relative w-full">
        <div className="relative w-full space-y-4">
          {/* English Row - Left to Right */}
          <div className="relative w-full overflow-hidden">
            <div className="flex animate-scroll whitespace-nowrap will-change-transform">
              {/* Multiple sets for seamless scrolling */}
              {[...Array(4)].map((_, setIndex) => (
                <div key={setIndex} className="flex items-center gap-4 md:gap-6 shrink-0">
                  <span className="text-base md:text-lg lg:text-xl font-bold text-[#70c82a]">
                    We Build a Better Tomorrow!
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#70c82a]/40"></div>
                  <span className="text-base md:text-lg lg:text-xl font-bold text-[#70c82a]">
                    We Build a Better Tomorrow!
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#70c82a]/40"></div>
                  <span className="text-base md:text-lg lg:text-xl font-bold text-[#70c82a]">
                    We Build a Better Tomorrow!
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#70c82a]/40"></div>
                  <span className="text-base md:text-lg lg:text-xl font-bold text-[#70c82a]">
                    We Build a Better Tomorrow!
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#70c82a]/40"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Amharic Row - Right to Left */}
          <div className="relative w-full overflow-hidden">
            <div className="flex animate-scroll-reverse whitespace-nowrap will-change-transform">
              {/* Multiple sets for seamless scrolling */}
              {[...Array(4)].map((_, setIndex) => (
                <div key={setIndex} className="flex items-center gap-4 md:gap-6 shrink-0">
                  <span className="text-base md:text-lg lg:text-xl font-bold text-[#70c82a]">
                    የተሻለ ነገን እንገነባለን!
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#70c82a]/40"></div>
                  <span className="text-base md:text-lg lg:text-xl font-bold text-[#70c82a]">
                    የተሻለ ነገን እንገነባለን!
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#70c82a]/40"></div>
                  <span className="text-base md:text-lg lg:text-xl font-bold text-[#70c82a]">
                    የተሻለ ነገን እንገነባለን!
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#70c82a]/40"></div>
                  <span className="text-base md:text-lg lg:text-xl font-bold text-[#70c82a]">
                    የተሻለ ነገን እንገነባለን!
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#70c82a]/40"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted dark:bg-black pt-12 pb-4">
        <div className="container mx-auto px-4 lg:px-8 text-foreground">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-8">
            {/* Logo Section */}
            <div className="space-y-4 md:col-span-1">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Image
                    src="/ecwc png logo.png"
                    alt="ECWC Logo"
                    width={80}
                    height={80}
                    className="object-contain"
                    quality={100}
                    unoptimized
                    priority
                  />
                </div>

                <div>
                  <div className="font-bold text-foreground">ECWC  </div>

                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Enterprise equipment management platform designed specifically for ECWC construction operations.
              </p>
            </div>

            {/* Footer Links - Mobile: 2 rows with 2 columns each, Desktop: 4 columns */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:col-span-4">
              {/* Row 1: System and Support */}
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">System</h4>
                <ul className="space-y-2">
                  {["Dashboard", "Equipment", "Work Orders", "Reports", "Inventory"].map((link, j) => (
                    <li key={j}>
                      <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">Support</h4>
                <ul className="space-y-2">
                  {["IT Help Desk", "User Manual", "Training", "System Status", "Contact"].map((link, j) => (
                    <li key={j}>
                      <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Row 2: Company and Follow Us */}
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">Company</h4>
                <ul className="space-y-2">
                  {["About ECWC", "Departments", "Policies", "Careers", "Contact"].map((link, j) => (
                    <li key={j}>
                      <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">Socials</h4>
                <div className="space-y-2">
                  {[
                    { name: "Website", icon: Globe, href: "http://ecwc.gov.et/" },
                    { name: "LinkedIn", icon: Linkedin, href: "https://www.linkedin.com/company/ethiopian-construction-work-corporation/about/" },
                    { name: "Telegram", icon: Send, href: "https://t.me/s/ECWCCOM" },
                    { name: "Facebook", icon: Facebook, href: "https://web.facebook.com/EthiopianConstructionWorksCorporation" }
                  ].map((social, i) => (
                    <Link
                      key={i}
                      href={social.href}
                      className="flex items-center gap-3 text-sm text-muted-foreground hover:text-[#70c82a] transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#70c82a]/10 dark:bg-[#70c82a]/20 flex items-center justify-center group-hover:bg-[#70c82a]/20 dark:group-hover:bg-[#70c82a]/30 transition-colors border border-[#70c82a]/20">
                        <social.icon className="w-4 h-4 text-[#70c82a]" />
                      </div>
                      <span>{social.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Motto - E,C,W,C in ECWC green - below footer links */}
          <div className="pt-6 pb-4 text-center border-t border-border dark:border-gray-800">
            <p className="text-xs sm:text-sm text-muted-foreground font-medium tracking-wide mb-0">
              <span className="text-base sm:text-lg font-bold text-[#70c82a]">E</span>XECUTION | <span className="text-base sm:text-lg font-bold text-[#70c82a]">C</span>OMMERCIAL AWARENESS | <span className="text-base sm:text-lg font-bold text-[#70c82a]">W</span>INNING LEADERSHIP | <span className="text-base sm:text-lg font-bold text-[#70c82a]">C</span>LEAR STANDARDS & PROCEDURES
            </p>
          </div>

          <div className="pt-8 border-t border-border dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2026 ECWC Plant Equipment Management System. Internal use only.
            </p>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Privacy Policy
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Terms of Service
              </Button>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to top / bottom – corner arrow: down when above, up when below */}
      <AnimatePresence mode="wait">
        <motion.button
          key={scrollToBottom ? 'down' : 'up'}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          onClick={handleScrollClick}
          className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#70c82a]/40 bg-background/95 shadow-lg backdrop-blur-sm hover:border-[#70c82a] hover:bg-[#70c82a]/10 hover:shadow-[0_0_20px_rgba(112,200,42,0.2)] focus:outline-none focus:ring-2 focus:ring-[#70c82a]/50 focus:ring-offset-2 dark:bg-zinc-900/95"
          aria-label={scrollToBottom ? 'Scroll to bottom' : 'Scroll to top'}
        >
          {scrollToBottom ? (
            <ChevronDown className="h-6 w-6 text-[#70c82a]" />
          ) : (
            <ChevronUp className="h-6 w-6 text-[#70c82a]" />
          )}
        </motion.button>
      </AnimatePresence>
    </div>
  )
}