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
  History,
  X,
  Menu
}  from "lucide-react"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { ThemeToggle } from "@/components/theme-toggle"
import Image from "next/image"

// Helper function to get equipment description
const getEquipmentDescription = (name: string): string => {
  const descMap: { [key: string]: string } = {
    "Dozer, Chain": "Heavy crawler tractor with large blade for pushing earth, rocks, and debris. Used for site clearing and grading.",
    "Motor Grader": "Machine with long blade for creating flat surfaces on roads. Used for fine grading and finishing road surfaces.",
    "Excavator, Chain": "Crawler-mounted excavator with bucket arm for digging trenches, foundations, and moving large amounts of earth.",
    "Excavator, Wheel": "Wheeled excavator with bucket arm, more mobile than chain excavators. Ideal for urban construction sites.",
    "Loader, Chain": "Tracked loader for loading materials into trucks. Excellent traction on rough terrain.",
    "Loader, Wheel": "Wheeled front-end loader for moving and loading materials. Faster on roads than tracked loaders.",
    "Backhoe Loader": "Versatile machine with front loader and rear excavator bucket. Perfect for smaller sites needing multiple functions.",
    "Roller D/Drum": "Double drum roller for compacting soil and asphalt. Essential for road construction density.",
    "Roller S/Drum": "Single drum roller with steel drum for soil compaction and road finishing.",
    "Roller S/foot -D/D": "Double drum sheep's foot roller with projecting feet for deep soil compaction.",
    "Roller S/foot -S/D": "Single drum sheep's foot roller for specialized soil compaction in specific areas.",
    "Roller Pneumatic": "Rubber-tired roller for asphalt compaction. Provides smooth finish without marks.",
    "Trencher, Chain": "Tracked machine for digging trenches. Used for utility installation and drainage.",
    "Trencher, Wheel": "Wheeled trenching machine, more mobile for utility and irrigation work.",
    "Scraper": "Large self-loading earthmoving machine. Moves massive volumes of soil over long distances.",
    "Asphalt Paver": "Machine that lays asphalt for roads and parking lots. Creates smooth, even surfaces.",
    "Concrete Paver": "Specialized machine for laying concrete slabs. Used in highway and runway construction.",
    "Asphalt Milling machine": "Removes old asphalt surfaces for recycling. Prepares surfaces for repaving.",
    "Chip Spreader": "Distributes aggregate chips for chip seal road treatments.",
    "Power Curber": "Creates concrete curbs and gutters automatically. Essential for road edge finishing.",
    "D/Truck Beiben": "Heavy-duty dump truck for transporting construction materials and debris.",
    "D/Truck Daewoo": "Medium to large dump truck for material hauling on construction sites.",
    "D/Truck Faw": "Chinese-made dump truck for heavy material transport.",
    "D/Truck Nissan": "Japanese dump truck, reliable for various construction hauling needs.",
    "D/Truck Sino": "Sino truck dump vehicle for material transportation.",
    "D/Truck Foton": "Foton brand dump truck for construction material delivery.",
    "Water Truck": "Truck with water tank for dust control and compaction. Essential on construction sites.",
    "Water Truck Trailer": "Trailer-mounted water tank for large-scale dust suppression.",
    "Fuel Truck": "Mobile fuel delivery truck. Keeps equipment running on remote sites.",
    "Fuel Truck Trailer": "Trailer system for fuel distribution to multiple locations.",
    "Asphalt Distributer": "Sprays hot asphalt binder for road resurfacing and maintenance.",
    "Low bed": "Low-profile flatbed trailer for transporting heavy machinery and equipment.",
    "Low bed Trailer": "Specialized low trailer for oversized construction equipment transport.",
    "High bed trailer": "Raised trailer bed for transporting tall equipment and structures.",
    "Mobile Crane": "Truck-mounted crane for lifting and moving heavy materials and equipment.",
    "Cargo Truck": "Standard cargo vehicle for transporting construction supplies and tools.",
    "Cargo Crane": "Truck with crane attachment for loading and unloading cargo.",
    "Water Well Drilling rig": "Specialized equipment for drilling water wells and boreholes.",
    "Shop Truck": "Mobile workshop truck for on-site equipment maintenance and repairs.",
    "Fork lift": "Material handling equipment for lifting and moving pallets and heavy items.",
    "Farm Truck": "Agricultural truck adapted for construction site material transport.",
    "Automobile": "Passenger vehicles for staff and site management transportation.",
    "Bus Passenger": "Bus for transporting workers and personnel to construction sites.",
    "Midi Bus": "Medium-sized bus for crew transportation.",
    "Station Wagon": "Utility vehicle for site supervisors and material transport.",
    "Double Cabin": "Pickup truck with extended cab for transporting crew and tools.",
    "Single Cabin": "Standard pickup truck for light material and tool transportation.",
  };
  return descMap[name] || "Construction equipment for various site operations.";
};

// --- Equipment Command Center Data - Aggregated by Category ---
const equipmentCategories = [
  { id: 1, name: "Dozer, Chain", op: 19, idle: 1, ur: 11, down: 2, hr: 16, ui: 0, rfd: 0, afd: 3, totalQty: 52, image: "/dozer.jpg" },
  { id: 2, name: "Motor Grader", op: 13, idle: 2, ur: 8, down: 0, hr: 6, ui: 0, rfd: 0, afd: 2, totalQty: 31, image: "/Grader-ECWC.png" },
  { id: 3, name: "Excavator, Chain", op: 28, idle: 1, ur: 13, down: 5, hr: 13, ui: 0, rfd: 1, afd: 1, totalQty: 62, image: "/dozer.jpg" },
  { id: 4, name: "Excavator, Wheel", op: 1, idle: 0, ur: 4, down: 2, hr: 4, ui: 0, rfd: 0, afd: 1, totalQty: 12, image: "/dozer.jpg" },
  { id: 5, name: "Loader, Chain", op: 1, idle: 0, ur: 2, down: 0, hr: 2, ui: 0, rfd: 0, afd: 0, totalQty: 5, image: "/dozer.jpg" },
  { id: 6, name: "Loader, Wheel", op: 17, idle: 1, ur: 13, down: 3, hr: 25, ui: 0, rfd: 1, afd: 7, totalQty: 67, image: "/dozer.jpg" },
  { id: 7, name: "Backhoe Loader", op: 3, idle: 0, ur: 0, down: 0, hr: 0, ui: 0, rfd: 1, afd: 0, totalQty: 4, image: "/dozer.jpg" },
  { id: 8, name: "Roller D/Drum", op: 15, idle: 2, ur: 4, down: 0, hr: 5, ui: 0, rfd: 0, afd: 2, totalQty: 28, image: "/dozer.jpg" },
  { id: 9, name: "Roller S/Drum", op: 6, idle: 2, ur: 3, down: 2, hr: 7, ui: 0, rfd: 0, afd: 0, totalQty: 20, image: "/dozer.jpg" },
  { id: 10, name: "Roller S/foot -D/D", op: 2, idle: 0, ur: 0, down: 1, hr: 3, ui: 0, rfd: 0, afd: 0, totalQty: 6, image: "/dozer.jpg" },
  { id: 11, name: "Roller S/foot -S/D", op: 0, idle: 0, ur: 1, down: 0, hr: 0, ui: 0, rfd: 0, afd: 0, totalQty: 1, image: "/dozer.jpg" },
  { id: 12, name: "Roller Pneumatic", op: 9, idle: 0, ur: 1, down: 1, hr: 0, ui: 0, rfd: 0, afd: 0, totalQty: 11, image: "/dozer.jpg" },
  { id: 13, name: "Trencher, Chain", op: 0, idle: 1, ur: 0, down: 0, hr: 0, ui: 0, rfd: 0, afd: 0, totalQty: 1, image: "/dozer.jpg" },
  { id: 14, name: "Trencher, Wheel", op: 0, idle: 0, ur: 0, down: 1, hr: 0, ui: 0, rfd: 0, afd: 0, totalQty: 1, image: "/dz.png" },
  { id: 15, name: "Scraper", op: 0, idle: 1, ur: 0, down: 0, hr: 0, ui: 0, rfd: 0, afd: 0, totalQty: 1, image: "/dozer.jpg" },
  { id: 16, name: "Asphalt Paver", op: 4, idle: 0, ur: 1, down: 1, hr: 0, ui: 0, rfd: 0, afd: 0, totalQty: 6, image: "/dozer.jpg" },
  { id: 17, name: "Concrete Paver", op: 1, idle: 0, ur: 0, down: 0, hr: 0, ui: 0, rfd: 0, afd: 0, totalQty: 1, image: "/dz.png" },
  { id: 18, name: "Asphalt Milling machine", op: 1, idle: 0, ur: 0, down: 0, hr: 0, ui: 0, rfd: 0, afd: 0, totalQty: 1, image: "/dozer.jpg" },
  { id: 19, name: "Chip Spreader", op: 1, idle: 0, ur: 0, down: 0, hr: 0, ui: 0, rfd: 0, afd: 0, totalQty: 1, image: "/dozer.jpg" },
  { id: 20, name: "Power Curber", op: 1, idle: 0, ur: 0, down: 0, hr: 0, ui: 0, rfd: 0, afd: 0, totalQty: 1, image: "/dozer.jpg" },
  { id: 21, name: "D/Truck Beiben", op: 43, idle: 3, ur: 11, down: 23, hr: 17, ui: 3, rfd: 0, afd: 0, totalQty: 100, image: "/dozer.jpg" },
  { id: 22, name: "D/Truck Daewoo", op: 22, idle: 0, ur: 12, down: 1, hr: 1, ui: 3, rfd: 0, afd: 1, totalQty: 40, image: "/dz.png" },
  { id: 23, name: "D/Truck Faw", op: 26, idle: 1, ur: 35, down: 29, hr: 7, ui: 8, rfd: 0, afd: 0, totalQty: 106, image: "/dozer.jpg" },
  { id: 24, name: "D/Truck Nissan", op: 20, idle: 4, ur: 31, down: 32, hr: 6, ui: 7, rfd: 2, afd: 7, totalQty: 109, image: "/dozer.jpg" },
  { id: 25, name: "D/Truck Sino", op: 0, idle: 0, ur: 3, down: 1, hr: 1, ui: 0, rfd: 0, afd: 0, totalQty: 5, image: "/dz.png" },
  { id: 26, name: "D/Truck Foton", op: 0, idle: 0, ur: 2, down: 2, hr: 0, ui: 1, rfd: 0, afd: 0, totalQty: 5, image: "/dozer.jpg" },
  { id: 27, name: "Water Truck", op: 45, idle: 5, ur: 3, down: 9, hr: 5, ui: 1, rfd: 0, afd: 0, totalQty: 68, image: "/dozer.jpg" },
  { id: 28, name: "Water Truck Trailer", op: 1, idle: 0, ur: 0, down: 0, hr: 0, ui: 0, rfd: 0, afd: 0, totalQty: 1, image: "/dozer.jpg" },
  { id: 29, name: "Fuel Truck", op: 14, idle: 1, ur: 2, down: 1, hr: 3, ui: 0, rfd: 1, afd: 0, totalQty: 22, image: "/dozer.jpg" },
  { id: 30, name: "Fuel Truck Trailer", op: 0, idle: 2, ur: 0, down: 1, hr: 0, ui: 0, rfd: 0, afd: 0, totalQty: 3, image: "/dozer.jpg" },
  { id: 31, name: "Asphalt Distributer", op: 3, idle: 0, ur: 0, down: 1, hr: 2, ui: 2, rfd: 0, afd: 0, totalQty: 8, image: "/dozer.jpg" },
  { id: 32, name: "Low bed", op: 4, idle: 0, ur: 7, down: 0, hr: 1, ui: 0, rfd: 0, afd: 0, totalQty: 12, image: "/dozer.jpg" },
  { id: 33, name: "Low bed Trailer", op: 5, idle: 0, ur: 3, down: 5, hr: 1, ui: 0, rfd: 0, afd: 0, totalQty: 14, image: "/dozer.jpg" },
  { id: 34, name: "High bed trailer", op: 0, idle: 0, ur: 0, down: 1, hr: 1, ui: 0, rfd: 0, afd: 0, totalQty: 2, image: "/dozer.jpg" },
  { id: 35, name: "Mobile Crane", op: 4, idle: 0, ur: 1, down: 1, hr: 2, ui: 0, rfd: 0, afd: 0, totalQty: 8, image: "/dozer.jpg" },
  { id: 36, name: "Cargo Truck", op: 0, idle: 1, ur: 0, down: 1, hr: 0, ui: 0, rfd: 1, afd: 3, totalQty: 6, image: "/dozer.jpg" },
  { id: 37, name: "Cargo Crane", op: 5, idle: 0, ur: 0, down: 1, hr: 1, ui: 0, rfd: 0, afd: 0, totalQty: 7, image: "/dozer.jpg" },
  { id: 38, name: "Water Well Drilling rig", op: 0, idle: 0, ur: 2, down: 1, hr: 1, ui: 0, rfd: 0, afd: 0, totalQty: 4, image: "/dozer.jpg" },
  { id: 39, name: "Shop Truck", op: 4, idle: 0, ur: 1, down: 1, hr: 0, ui: 0, rfd: 0, afd: 1, totalQty: 7, image: "/dozer.jpg" },
  { id: 40, name: "Fork lift", op: 5, idle: 0, ur: 0, down: 0, hr: 0, ui: 0, rfd: 0, afd: 0, totalQty: 5, image: "/dozer.jpg" },
  { id: 41, name: "Farm Truck", op: 0, idle: 5, ur: 0, down: 1, hr: 0, ui: 0, rfd: 0, afd: 2, totalQty: 8, image: "/dozer.jpg" },
  { id: 42, name: "Automobile", op: 6, idle: 0, ur: 0, down: 0, hr: 1, ui: 0, rfd: 0, afd: 4, totalQty: 11, image: "/dozer.jpg" },
  { id: 43, name: "Bus Passenger", op: 0, idle: 0, ur: 1, down: 0, hr: 0, ui: 0, rfd: 0, afd: 1, totalQty: 2, image: "/dozer.jpg" },
  { id: 44, name: "Midi Bus", op: 2, idle: 0, ur: 2, down: 0, hr: 0, ui: 0, rfd: 0, afd: 1, totalQty: 5, image: "/dozer.jpg" },
  { id: 45, name: "Station Wagon", op: 24, idle: 1, ur: 6, down: 4, hr: 3, ui: 1, rfd: 0, afd: 14, totalQty: 53, image: "/dozer.jpg" },
  { id: 46, name: "Double Cabin", op: 74, idle: 3, ur: 46, down: 14, hr: 24, ui: 8, rfd: 5, afd: 28, totalQty: 202, image: "/dozer.jpg" },
  { id: 47, name: "Single Cabin", op: 5, idle: 0, ur: 6, down: 2, hr: 0, ui: 0, rfd: 0, afd: 2, totalQty: 15, image: "/dozer.jpg" },
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
    <section className="relative py-32 bg-background dark:bg-zinc-950">
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
              {equipmentCategories.map((category, index) => {
                const isActive = index === currentIndex;
                const isNext = index === (currentIndex + 1) % equipmentCategories.length;
                const isPrev = index === (currentIndex - 1 + equipmentCategories.length) % equipmentCategories.length;

                return (
                  <motion.div
                    key={category.id}
                    initial={false}
                    animate={{
                      opacity: isActive ? 1 : 0,
                      x: isActive ? 0 : isNext ? 100 : -100,
                      scale: isActive ? 1 : 0.8,
                      zIndex: isActive ? 10 : isNext || isPrev ? 5 : 1
                    }}
                    transition={{
                      duration: 1.2,
                      ease: [0.4, 0, 0.2, 1]
                    }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-tr ${getStatusColor(calculateUtilization(category)) === 'bg-[#70c82a]' ? 'from-[#70c82a]/20' : getStatusColor(calculateUtilization(category)) === 'bg-amber-500' ? 'from-amber-500/20' : 'from-red-500/20'} to-transparent blur-3xl opacity-30 rounded-full`} />
                    <motion.div 
                      animate={{
                        x: isActive ? [0, -10, 10, -10, 0] : 0,
                      }}
                      transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="relative w-full h-full"
                    >
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        className="object-contain drop-shadow-[0_0_50px_rgba(112,200,42,0.2)]"
                        priority={index === 0}
                        unoptimized
                      />
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>

            {/* Right: Aggregated Data Panel - Attractive & Descriptive */}
            <div className="relative min-h-[500px] flex flex-col justify-center overflow-visible">
              {equipmentCategories.map((category, index) => {
                const isActive = index === currentIndex;
                const isNext = index === (currentIndex + 1) % equipmentCategories.length;
                const isPrev = index === (currentIndex - 1 + equipmentCategories.length) % equipmentCategories.length;
                const categoryUtilization = calculateUtilization(category);
                const categoryStatusColor = getStatusColor(categoryUtilization);

                return (
                  <motion.div
                    key={category.id}
                    initial={false}
                    animate={{
                      opacity: isActive ? 1 : 0,
                      y: isActive ? 0 : isNext ? 50 : -50,
                      zIndex: isActive ? 10 : isNext || isPrev ? 5 : 1
                    }}
                    transition={{
                      duration: 1.2,
                      ease: [0.4, 0, 0.2, 1]
                    }}
                    className="absolute inset-0 space-y-5"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${categoryStatusColor} animate-pulse shadow-[0_0_10px_${categoryStatusColor.replace('bg-', '')}]`} />
                        <span className="text-sm font-bold tracking-widest uppercase text-muted-foreground">
                          {categoryUtilization >= 80 ? '🚀 OPTIMAL PERFORMANCE' : categoryUtilization >= 60 ? '✅ GOOD STATUS' : categoryUtilization >= 40 ? '⚠️ NEEDS ATTENTION' : '🔴 CRITICAL ALERT'}
                        </span>
                      </div>
                      <h3 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight leading-tight">{category.name}</h3>
                      <p className="text-[#70c82a] font-mono text-base">Fleet Category #{category.id} of {equipmentCategories.length}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed italic mb-4">{getEquipmentDescription(category.name)}</p>
                    </div>

                    {/* Main Stats with Icons and Descriptions */}
                    <div className="grid grid-cols-2 gap-3">
                      <motion.div
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        className="p-3 rounded-xl bg-gradient-to-br from-[#70c82a]/10 to-transparent border border-[#70c82a]/20"
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <CheckCircle className="w-4 h-4 text-[#70c82a]" />
                          <p className="text-xs font-semibold text-muted-foreground">Operational & Ready</p>
                        </div>
                        <div className="text-2xl font-bold text-[#70c82a] mb-1">
                          <AnimatedCounter value={category.op} duration={1000} />
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-tight">Units actively working on projects</p>
                      </motion.div>

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
                          <AnimatedCounter value={category.totalQty} duration={1000} />
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
                          <AnimatedCounter value={categoryUtilization} duration={1000} />%
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-tight">Percentage of fleet in use</p>
                      </motion.div>

                      <motion.div
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        className="p-3 rounded-xl bg-gradient-to-br from-red-500/10 to-transparent border border-red-500/20"
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                          <p className="text-xs font-semibold text-muted-foreground">Out of Service</p>
                        </div>
                        <div className="text-2xl font-bold text-red-500 mb-1">
                          <AnimatedCounter value={category.down} duration={1000} />
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-tight">Units requiring immediate attention</p>
                      </motion.div>
                    </div>

                    {/* Additional Status Info */}
                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border dark:border-zinc-800">
                      <div className="text-center p-2 rounded-lg bg-card/50 dark:bg-zinc-900/50 border border-border dark:border-zinc-800">
                        <Clock className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                        <div className="text-base font-bold text-foreground mb-0.5">{category.idle}</div>
                        <p className="text-[9px] text-muted-foreground leading-tight">Standby / Idle</p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-card/50 dark:bg-zinc-900/50 border border-border dark:border-zinc-800">
                        <Wrench className="w-4 h-4 text-orange-400 mx-auto mb-1" />
                        <div className="text-base font-bold text-foreground mb-0.5">{category.ur}</div>
                        <p className="text-[9px] text-muted-foreground leading-tight">Under Repair</p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-card/50 dark:bg-zinc-900/50 border border-border dark:border-zinc-800">
                        <TrendingUp className="w-4 h-4 text-[#70c82a] mx-auto mb-1" />
                        <div className="text-base font-bold text-foreground mb-0.5">{category.hr + category.ui + category.rfd + category.afd}</div>
                        <p className="text-[9px] text-muted-foreground leading-tight">In Transit / Other</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Scrollable Image Carousel - Small Images with Names */}
          <div className="mt-12 pt-8 border-t border-border dark:border-zinc-800">
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
                className="overflow-x-auto overflow-y-hidden scrollbar-hide pb-4 px-12"
                style={{ scrollBehavior: 'smooth' }}
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
  const [isLoading, setIsLoading] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Set dark mode as default
  useEffect(() => {
    document.documentElement.classList.add('dark')
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
          <div className="flex h-16 md:h-20 items-center justify-between">
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
                  width={60}
                  height={60}
                  className="object-contain relative z-10 md:w-16 md:h-16 w-12 h-12"
                  quality={100}
                  unoptimized
                  priority
                  style={{ filter: 'drop-shadow(0 0 8px rgba(112, 200, 42, 0.3))' }}
                />
              </motion.div>

              <div className="hidden sm:flex flex-col">
                <span className="text-xs md:text-sm font-bold bg-gradient-to-r from-[#70c82a] to-[#5aa022] bg-clip-text text-transparent leading-tight">
                  ETHIOPIAN CONSTRUCTION WORKS CORPORATION
                </span>
                <span className="text-[10px] md:text-xs text-muted-foreground font-medium leading-tight">የኢትዮጵያ ኮንስትራክሽን ሥራዎች ኮርፖሬሽን</span>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-4 xl:gap-6">
              {["Overview", "Video", "Module Architecture", "Multi-Site & Scalable Architecture"].map((item, i) => {
                const href = item === "Multi-Site & Scalable Architecture" 
                  ? "#multi-site-architecture" 
                  : `#${item.toLowerCase().replace(/\s+/g, '-')}`
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
              <Button size="sm" className="bg-[#70c82a] hover:bg-[#5aa022] text-white shadow-lg shadow-[#70c82a]/20" asChild>
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
                  {["Overview", "Video", "Module Architecture", "Multi-Site & Scalable Architecture"].map((item, i) => {
                    const href = item === "Multi-Site & Scalable Architecture" 
                      ? "#multi-site-architecture" 
                      : `#${item.toLowerCase().replace(/\s+/g, '-')}`
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
                    <Button size="sm" className="w-full bg-[#70c82a] hover:bg-[#5aa022] text-white" asChild>
                      <Link href="/sign-up" onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>
                    </Button>
                  </div>
                </div>
              </motion.nav>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 lg:py-16 bg-background dark:bg-black">
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
              <motion.div variants={fadeInUp} className="space-y-8">
                {/* CMMS Acronym with Explanations */}
                <div className="relative">
                  {/* Vertical Connecting Line */}
                  <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-black/40 dark:bg-white/40 rounded-full">
                    <motion.div
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ duration: 1.5, delay: 0.5, ease: [0.4, 0, 0.2, 1] }}
                      className="w-full h-full bg-black/40 dark:bg-white/40 rounded-full origin-top"
                    />
                  </div>

                  {/* CMMS Letters with Full Words */}
                  <div className="flex flex-col gap-5">
                    {[
                      { letter: "C", word: "Computerized" },
                      { letter: "M", word: "Maintenance" },
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
                          className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground flex-shrink-0"
                          style={{ 
                            fontFamily: 'var(--font-dm-sans), "DM Sans", sans-serif',
                            lineHeight: 1,
                            width: '40px'
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
                          className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight text-foreground"
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

                <motion.p
                  variants={fadeInUp}
                  className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl"
                  style={{ 
                    fontFamily: 'var(--font-dm-sans), "DM Sans", sans-serif'
                  }}
                >
                  A comprehensive enterprise resource planning system built for Ethiopian Construction Works Corporation. Our modular architecture enables multi-site scalability, real-time equipment tracking, maintenance management, inventory control, and performance monitoring across all construction sites.
                </motion.p>

                {/* Key Features Overview */}
                <motion.div
                  variants={fadeInUp}
                  className="space-y-3 pt-4"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#70c82a] flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Multi-Site & Scalable Architecture</h3>
                      <p className="text-sm text-muted-foreground">Designed to manage multiple construction sites simultaneously with centralized control and distributed operations.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#70c82a] flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Modular System Design</h3>
                      <p className="text-sm text-muted-foreground">Flexible module architecture allowing customization and integration of equipment management, maintenance, inventory, and reporting modules.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#70c82a] flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Real-Time Video Monitoring</h3>
                      <p className="text-sm text-muted-foreground">Integrated video features for live equipment monitoring and site surveillance across all locations.</p>
                    </div>
                  </div>
                </motion.div>

                {/* Stats */}
                <motion.div variants={fadeInUp} className="grid grid-cols-3 gap-6 pt-4">
                  {[
                    { value: 150, label: "Equipment", suffix: "" },
                    { value: 98, label: "Uptime", suffix: "%" },
                    { value: 24, label: "Monitoring", suffix: "/7" }
                  ].map((stat, i) => (
                    <div key={i} className="text-center">
                      <div 
                        className="text-3xl md:text-4xl font-bold text-[#70c82a] mb-1"
                        style={{ 
                          fontFamily: 'var(--font-dm-sans), "DM Sans", sans-serif'
                        }}
                      >
                        <AnimatedCounter value={stat.value} />
                        {stat.suffix && <span className="text-2xl md:text-3xl">{stat.suffix}</span>}
                      </div>
                      <div 
                        className="text-xs text-muted-foreground font-semibold uppercase tracking-wider"
                        style={{ 
                          fontFamily: 'var(--font-dm-sans), "DM Sans", sans-serif'
                        }}
                      >
                        {stat.label}
                      </div>
                    </div>
                  ))}
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
      <section className="relative py-20 lg:py-32 bg-gradient-to-b from-background via-muted/30 to-background dark:from-background dark:via-zinc-950 dark:to-black overflow-hidden">
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
          >
            {/* Glowing Border Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#70c82a] via-emerald-500 to-teal-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
            
            {/* Video Frame */}
            <div className="relative rounded-2xl overflow-hidden border border-border dark:border-zinc-800 bg-card dark:bg-zinc-950 shadow-2xl">
              {/* Video Player */}
              <div className="relative aspect-video bg-black">
                <video
                  controls
                  playsInline
                  className="w-full h-full object-cover"
                  poster="/tn.jpeg"
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
              <div className="p-6 border-t border-border dark:border-zinc-800">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-foreground font-bold text-lg mb-1">ECWC Plant & Maintenance Management System</h3>
                    <p className="text-muted-foreground text-sm">Comprehensive overview of features, capabilities, and operational excellence</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" className="gap-2 border-border hover:border-[#70c82a]">
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
              className="hidden lg:block absolute -left-12 top-1/4 w-64 p-4 rounded-xl bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 shadow-xl"
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
              className="hidden lg:block absolute -right-12 bottom-1/4 w-64 p-4 rounded-xl bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 shadow-xl"
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
      <section id="features" className="py-32 bg-background dark:bg-black relative overflow-hidden">
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
            <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
              Core <span className="text-[#70c82a]">Functional Areas</span>
        </h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
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
                  <h3 className="text-3xl font-bold text-foreground">Maintenance & Work Order Management</h3>
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
                <div className="pt-4 border-t border-border dark:border-zinc-800 flex justify-between items-center">
                  <div className="text-xs text-muted-foreground">Total Inventory Value</div>
                  <div className="text-2xl font-bold text-[#70c82a]">Br 1.8M</div>
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
                  <h3 className="text-3xl font-bold text-foreground">Spare Parts & Inventory Management</h3>
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
                  <h3 className="text-3xl font-bold text-foreground">Cost Control & Budget Management</h3>
                </div>
              </div>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                Understand where maintenance money is going.
              </p>
              <div className="mb-8">
                <h4 className="text-foreground font-semibold mb-4">What this module does</h4>
                <div className="space-y-3">
                  {[
                    "Calculates maintenance cost per equipment",
                    "Tracks labor, spare parts, and external service costs",
                    "Compares budget vs actual spending",
                    "Identifies high-cost equipment",
                    "Supports cost analysis by site or project"
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
                  A manager notices that one excavator has very high maintenance costs compared to others.
                  Using the system, they review its history and decide whether to repair, overhaul, or replace it.
                  This helps ECWC avoid wasting money on inefficient equipment.
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
                <div className="text-foreground font-bold mb-6">Monthly Cost Analysis</div>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[
                    { label: "Budget", value: "Br 285K", icon: Target },
                    { label: "Actual", value: "Br 267K", icon: DollarSign },
                    { label: "Variance", value: "-6.3%", icon: TrendingUp }
                  ].map((stat, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
                      className="p-4 rounded-xl bg-card/50 dark:bg-zinc-900/50 border border-border dark:border-zinc-800 text-center"
                    >
                      <stat.icon className="w-5 h-5 text-[#70c82a] mx-auto mb-2" />
                      <div className="text-xl font-bold text-foreground mb-1">{stat.value}</div>
                      <div className="text-[10px] text-muted-foreground uppercase font-bold">{stat.label}</div>
                    </motion.div>
                  ))}
              </div>
                <div className="space-y-3 mb-6">
                  <div className="text-sm text-muted-foreground mb-2">Cost Breakdown</div>
                  {[
                    { category: "Labor Costs", amount: "Br 112K", percent: 42, color: "bg-[#70c82a]" },
                    { category: "Spare Parts", amount: "Br 89K", percent: 33, color: "bg-blue-500" },
                    { category: "External Services", amount: "Br 47K", percent: 18, color: "bg-amber-500" },
                    { category: "Other Expenses", amount: "Br 19K", percent: 7, color: "bg-zinc-600" }
                  ].map((item, i) => (
                    <div key={i} className="p-4 rounded-xl bg-card/50 dark:bg-zinc-900/50 border border-border dark:border-zinc-800">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-foreground font-semibold">{item.category}</span>
                        <span className="text-sm text-foreground font-bold">{item.amount}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-muted dark:bg-zinc-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${item.percent}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: i * 0.2 }}
                            className={`h-full ${item.color} rounded-full`}
                          />
                        </div>
                        <span className="text-xs font-bold text-muted-foreground">{item.percent}%</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 rounded-xl bg-[#70c82a]/5 border border-[#70c82a]/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Under Budget</div>
                      <div className="text-2xl font-bold text-[#70c82a]">Br 18,000</div>
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
              <div className="p-8 rounded-2xl bg-gradient-to-br from-[#70c82a]/5 via-card to-card dark:via-zinc-950 dark:to-zinc-950 border border-[#70c82a]/20">
                <div className="text-foreground font-bold mb-6">Executive Command Center</div>
                
                <div className="space-y-3 mb-6">
                  {[
                    { label: "Site Performance Comparison", sites: ["Addis Ababa", "Dire Dawa", "Bahir Dar"], values: [94, 87, 91] },
                    { label: "Monthly Cost Trends", sites: ["Jan", "Feb", "Mar"], values: [85, 92, 88] },
                    { label: "Inventory Valuation", sites: ["Q1", "Q2", "Q3"], values: [78, 85, 92] }
                  ].map((chart, i) => (
                    <div key={i} className="p-4 rounded-xl bg-card/50 dark:bg-zinc-900/50 border border-border dark:border-zinc-800">
                      <div className="text-xs text-muted-foreground mb-3">{chart.label}</div>
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
                            <span className="text-[10px] text-muted-foreground">{chart.sites[j]}</span>
            </div>
          ))}
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
                  <BarChart3 className="w-8 h-8 text-[#70c82a]" />
                </div>
                <div>
                  <div className="text-xs text-[#70c82a] font-bold uppercase tracking-wider mb-1">Module 06</div>
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

          {/* ECWC Management Dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-32"
          >
          

            <div className="p-8 rounded-2xl bg-zinc-950 border border-zinc-800">
              {/* Stats Grid */}
              <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6 mb-8">
                {[
                  { label: "Total Equipment", value: 156, change: "+5%", icon: Truck, color: "text-[#70c82a]" },
                  { label: "Operational", value: 142, change: "+2%", icon: CheckCircle, color: "text-[#70c82a]" },
                  { label: "Under Maintenance", value: 14, change: "-3%", icon: Wrench, color: "text-amber-500" },
                  { label: "Fleet Availability", value: 91, change: "+1%", icon: Target, color: "text-[#70c82a]" }
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-[#70c82a]/30 transition-all"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                      <p className={`text-xs font-bold ${stat.change.startsWith('+') ? 'text-[#70c82a]' : 'text-red-500'}`}>
                        {stat.change}
                      </p>
                    </div>
                    <p className="text-sm text-zinc-400 mb-2">{stat.label}</p>
                    <p className={`text-2xl font-bold ${stat.color}`}>
                      <AnimatedCounter value={stat.value} duration={1500} />
                      {stat.label.includes("Availability") && "%"}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">from last month</p>
                  </motion.div>
                ))}
              </div>

              {/* Alerts and Activity Grid */}
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Maintenance Alerts */}
                <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800">
                  <div className="mb-6">
                    <h3 className="text-white font-bold text-lg mb-1">Maintenance Alerts</h3>
                    <p className="text-sm text-zinc-500">Recent equipment requiring attention</p>
                  </div>
                  <div className="space-y-4">
                    {[
                      { equipment: "Excavator ECWC-EX-001", issue: "Engine oil change due", priority: "High", priorityColor: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
                      { equipment: "Bulldozer ECWC-BD-015", issue: "Hydraulic leak detected", priority: "Critical", priorityColor: "bg-red-500/20 text-red-400 border-red-500/30" },
                      { equipment: "Loader ECWC-LD-023", issue: "Tire replacement needed", priority: "Medium", priorityColor: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
                      { equipment: "Crane ECWC-CR-008", issue: "Scheduled inspection", priority: "Low", priorityColor: "bg-zinc-700/50 text-zinc-400 border-zinc-700" }
                    ].map((alert, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center justify-between p-4 rounded-lg border border-zinc-800 hover:border-[#70c82a]/30 transition-all bg-zinc-950/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${alert.priorityColor} border`}>
                            <AlertTriangle className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-white font-semibold text-sm">{alert.equipment}</p>
                            <p className="text-xs text-zinc-500">{alert.issue}</p>
                          </div>
                        </div>
                        <Badge className={`${alert.priorityColor} border text-xs font-bold`}>
                          {alert.priority}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Recent ECWC Activity */}
                <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800">
                  <div className="mb-6">
                    <h3 className="text-white font-bold text-lg mb-1">Recent ECWC Activity</h3>
                    <p className="text-sm text-zinc-500">Latest equipment operations and maintenance</p>
                  </div>
                  <div className="space-y-4">
                    {[
                      { action: "Work order completed", equipment: "ECWC-EX-012", user: "Tech. Alemayehu", time: "10 min ago", type: "success", iconColor: "bg-[#70c82a]/20 text-[#70c82a] border-[#70c82a]/30" },
                      { action: "Maintenance scheduled", equipment: "ECWC-BD-008", user: "Manager Sofia", time: "25 min ago", type: "info", iconColor: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
                      { action: "Fuel consumption report", equipment: "ECWC-TR-045", user: "System", time: "1 hour ago", type: "warning", iconColor: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
                      { action: "New equipment added", equipment: "ECWC-CR-009", user: "Admin Michael", time: "2 hours ago", type: "success", iconColor: "bg-[#70c82a]/20 text-[#70c82a] border-[#70c82a]/30" }
                    ].map((activity, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-3 p-4 rounded-lg border border-zinc-800 hover:border-[#70c82a]/30 transition-all bg-zinc-950/50"
                      >
                        <div className={`p-2 rounded-lg ${activity.iconColor} border flex-shrink-0`}>
                          {activity.type === 'success' ? <CheckCircle className="h-4 w-4" /> :
                           activity.type === 'info' ? <Bell className="h-4 w-4" /> :
                           <AlertTriangle className="h-4 w-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold text-sm">{activity.action}</p>
                          <p className="text-xs text-zinc-500 truncate">{activity.equipment} • {activity.user}</p>
                        </div>
                        <span className="text-xs text-zinc-500 flex-shrink-0">{activity.time}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* AI-Powered Decision Support - Professional Analytics */}
      <section className="py-32 bg-background dark:bg-zinc-950 relative overflow-hidden">
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

          {/* Smart Maintenance Intelligence Panel */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-2xl bg-card/50 dark:bg-zinc-900/50 border border-border dark:border-zinc-800"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Cpu className="w-6 h-6 text-[#70c82a]" />
                  <h3 className="text-2xl font-bold text-foreground">Smart Maintenance Intelligence</h3>
                </div>
                <p className="text-muted-foreground">Real-time predictive analytics and asset health monitoring</p>
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
                    cost: "Br 12,000",
                    priority: "Critical",
                    color: "red"
                  },
                  { 
                    asset: "ECWC-B-042 (Dozer)", 
                    alert: "Engine oil degradation - Service interval approaching",
                    action: "Schedule maintenance in 72h",
                    cost: "Br 3,200",
                    priority: "Medium",
                    color: "amber"
                  },
                  { 
                    asset: "ECWC-L-023 (Loader)", 
                    alert: "Tire wear pattern suggests alignment issue",
                    action: "Inspection recommended next scheduled maintenance",
                    cost: "Br 5,800",
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
                    className="p-5 rounded-xl bg-card dark:bg-zinc-950 border border-border dark:border-zinc-800 hover:border-[#70c82a]/30 transition-all"
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
                          <span className="text-xs font-mono text-muted-foreground">{alert.asset}</span>
                        </div>
                        <p className="text-sm text-foreground mb-2">{alert.alert}</p>
                        <p className="text-xs text-[#70c82a]">→ {alert.action}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground mb-1">Est. Cost Avoided</div>
                        <div className="text-lg font-bold text-foreground">{alert.cost}</div>
                      </div>
                    </div>
    </motion.div>
                ))}
  </div>

              <div className="space-y-4">
                <div className="p-6 rounded-xl bg-card dark:bg-zinc-950 border border-border dark:border-zinc-800">
                  <div className="text-muted-foreground text-xs mb-2">Predictive Health Score</div>
                  <div className="text-5xl font-bold text-[#70c82a] mb-4">94%</div>
                  <div className="h-2 bg-muted dark:bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: "94%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5 }}
                      className="h-full bg-gradient-to-r from-[#70c82a] to-emerald-400"
                    />
                  </div>
                </div>

                <div className="p-6 rounded-xl bg-card dark:bg-zinc-950 border border-border dark:border-zinc-800">
                  <div className="text-muted-foreground text-xs mb-2">Underperforming Assets</div>
                  <div className="text-5xl font-bold text-amber-500 mb-2">03</div>
                  <div className="text-xs text-muted-foreground">Requiring immediate attention</div>
                </div>

                <div className="p-6 rounded-xl bg-card dark:bg-zinc-950 border border-border dark:border-zinc-800">
                  <div className="text-muted-foreground text-xs mb-2">Cost Optimization</div>
                  <div className="text-5xl font-bold text-[#70c82a] mb-2">12.5%</div>
                  <div className="text-xs text-muted-foreground">Potential monthly savings</div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#70c82a]/5 border border-[#70c82a]/20 text-center">
              <p className="text-sm text-foreground/80 dark:text-zinc-300 italic">
                <span className="text-[#70c82a] font-bold">From reactive maintenance to predictive leadership.</span> AI-powered insights enable proactive decision-making across the entire ECWC fleet.
              </p>
            </div>
          </motion.div>

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

              {/* Chat Messages Container */}
              <div className="h-[600px] overflow-y-auto overflow-x-hidden bg-gradient-to-b from-background to-muted/20">
                <div className="divide-y divide-border dark:divide-zinc-800">
                {[
                  {
                    question: "Which site has the highest maintenance cost this month?",
                    answer: "Addis Ababa Site — Br 82,400. Main drivers: high emergency work orders, heavy spare-part consumption for excavators, and increased overtime labor hours."
                  },
                  {
                    question: "What are the main maintenance issues this month and their impact?",
                    answer: {
                      main: "Three primary issues are driving higher costs and equipment downtime:",
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
                        },
                        {
                          issue: "Delayed spare-part availability",
                          percentage: "19%",
                          impact: "Critical parts often take 3-5 days to arrive, extending equipment downtime. This is compounded by insufficient inventory levels for commonly failing components.",
                          cost: "Estimated monthly cost: Br 19,800 in extended downtime and emergency shipping fees"
                        }
                      ],
                      recommendation: "Immediate actions: (1) Implement preventive seal replacement program, (2) Upgrade cooling systems on high-risk equipment, (3) Increase critical spare parts inventory by 40% to reduce delays.",
                      total: "Combined monthly impact: ~Br 90,300 in direct costs and productivity losses."
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
                    <div className="bg-muted/30 dark:bg-zinc-900/50 px-4 sm:px-6 py-4">
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
                    <div className="bg-background dark:bg-zinc-950 px-4 sm:px-6 py-4">
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
                              
                              <div className="space-y-6">
                                {qa.answer.details.map((detail: any, idx: number) => (
                                  <div key={idx} className="border-l-2 border-[#70c82a]/30 pl-4 space-y-2">
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
                                <div className="mt-6 p-4 bg-[#70c82a]/5 dark:bg-[#70c82a]/10 rounded-lg border border-[#70c82a]/20">
                                  <p className="text-sm font-semibold text-foreground mb-2">Recommended Actions:</p>
                                  <p className="text-sm text-muted-foreground leading-relaxed break-words">{qa.answer.recommendation}</p>
                                </div>
                              )}

                              {qa.answer.total && (
                                <div className="mt-4 pt-4 border-t border-border dark:border-zinc-800">
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
            </div>
          </motion.div>
        </div>
      </section>

      {/* CMMS Benefits - Before & After */}
      <section className="py-32 bg-gradient-to-b from-background to-muted/30 dark:from-black dark:to-zinc-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(112,200,42,0.05),transparent_70%)]" />
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Why CMMS Transforms Maintenance Operations
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See how ECWC's CMMS solves critical challenges and delivers measurable results
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Before - Problems */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="bg-red-500/10 dark:bg-red-500/5 border-2 border-red-500/20 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center border-2 border-red-500/30">
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">Before CMMS</h3>
                </div>
                <div className="space-y-4">
                  {[
                    {
                      title: "Reactive Maintenance",
                      desc: "Equipment breaks down unexpectedly, causing costly emergency repairs and production delays."
                    },
                    {
                      title: "Manual Paperwork",
                      desc: "Maintenance records scattered across spreadsheets and paper files, making tracking impossible."
                    },
                    {
                      title: "No Visibility",
                      desc: "Managers can't see equipment status, maintenance history, or costs in real-time."
                    },
                    {
                      title: "Inventory Chaos",
                      desc: "Spare parts inventory unknown, leading to stockouts, delays, and emergency purchases."
                    },
                    {
                      title: "Cost Overruns",
                      desc: "No budget tracking or cost analysis, making it impossible to control maintenance spending."
                    },
                    {
                      title: "Scheduling Nightmare",
                      desc: "Work orders managed manually, causing missed maintenance, double-booking, and confusion."
                    }
                  ].map((problem, i) => (
                    <div key={i} className="flex gap-3 p-4 rounded-lg bg-background/50 dark:bg-zinc-900/50 border border-red-500/10">
                      <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">{problem.title}</h4>
                        <p className="text-sm text-muted-foreground">{problem.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* After - Solutions */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="bg-[#70c82a]/10 dark:bg-[#70c82a]/5 border-2 border-[#70c82a]/30 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-[#70c82a]/20 flex items-center justify-center border-2 border-[#70c82a]/30">
                    <CheckCircle className="w-6 h-6 text-[#70c82a]" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">With ECWC CMMS</h3>
                </div>
                <div className="space-y-4">
                  {[
                    {
                      title: "Predictive Maintenance",
                      desc: "AI-powered alerts predict failures before they happen, reducing downtime by up to 50% and extending equipment life."
                    },
                    {
                      title: "Digital Records",
                      desc: "Complete maintenance history, work orders, and costs stored in one centralized system, accessible from anywhere."
                    },
                    {
                      title: "Real-Time Dashboard",
                      desc: "Executive dashboard shows fleet availability, KPIs, alerts, and costs instantly - no reports needed."
                    },
                    {
                      title: "Smart Inventory",
                      desc: "Real-time stock levels, automatic reorder alerts, and parts tracking per work order prevent delays."
                    },
                    {
                      title: "Cost Control",
                      desc: "Track maintenance costs per equipment, compare budget vs actual, and identify high-cost assets for optimization."
                    },
                    {
                      title: "Automated Scheduling",
                      desc: "System automatically creates work orders, assigns technicians, and tracks progress from start to finish."
                    }
                  ].map((solution, i) => (
                    <div key={i} className="flex gap-3 p-4 rounded-lg bg-background/50 dark:bg-zinc-900/50 border border-[#70c82a]/20">
                      <CheckCircle className="w-5 h-5 text-[#70c82a] flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">{solution.title}</h4>
                        <p className="text-sm text-muted-foreground">{solution.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Key Results */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 max-w-4xl mx-auto"
          >
            <div className="bg-gradient-to-r from-[#70c82a]/10 to-[#70c82a]/5 border-2 border-[#70c82a]/20 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-foreground mb-6 text-center">Measurable Results</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { metric: "50%", label: "Reduction in Downtime", icon: TrendingUp },
                  { metric: "35%", label: "Cost Savings", icon: DollarSign },
                  { metric: "90%", label: "Faster Work Orders", icon: Zap }
                ].map((result, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="text-center p-6 rounded-xl bg-background/50 dark:bg-zinc-900/50 border border-[#70c82a]/10"
                  >
                    <result.icon className="w-8 h-8 text-[#70c82a] mx-auto mb-3" />
                    <div className="text-3xl font-bold text-[#70c82a] mb-2">{result.metric}</div>
                    <div className="text-sm text-muted-foreground">{result.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Governance, Security & Audit - Enterprise Standard */}
      <section className="py-32 bg-background dark:bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(112,200,42,0.03),transparent_70%)]" />
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          {/* Two Column Layout: Security Cards Left, Content Right */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            {/* Left Side - 4 Quadrants Grid */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { icon: Lock, title: "Role-Based Access Control", desc: "Strict permission control", stat: "12 Role Types" },
                { icon: History, title: "Full Audit Trail", desc: "Every action logged", stat: "100% Coverage" },
                { icon: Shield, title: "Data Security", desc: "Government-grade encryption", stat: "AES-256 Standard" },
                { icon: RotateCcw, title: "Secure Backups", desc: "Disaster recovery ready", stat: "24h Recovery" }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 rounded-2xl bg-card dark:bg-zinc-950 border border-border dark:border-zinc-800 hover:border-[#70c82a]/30 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#70c82a]/10 flex items-center justify-center mb-4 border border-[#70c82a]/20 group-hover:scale-110 transition-transform">
                    <item.icon className="w-6 h-6 text-[#70c82a]" />
                  </div>
                  <h4 className="text-foreground font-bold text-base mb-2">{item.title}</h4>
                  <p className="text-muted-foreground text-sm mb-3">{item.desc}</p>
                  <div className="text-[#70c82a] text-xs font-bold">{item.stat}</div>
                </motion.div>
              ))}
            </motion.div>

            {/* Right Side - Content */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 dark:bg-zinc-800/50 text-muted-foreground dark:text-zinc-400 text-xs font-bold uppercase tracking-widest border border-border dark:border-zinc-800">
                <Shield className="w-4 h-4" />
                Compliance & Security
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground">
                Built for <span className="text-[#70c82a]">Government & Corporate</span> Standards
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Enterprise-grade security architecture with full audit compliance and multi-level access control
              </p>
            </motion.div>
          </div>

          {/* Multi-Site Architecture */}
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-16">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h3 className="text-3xl font-bold text-foreground mb-6">Multi-Site & Scalable Architecture</h3>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
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
                    className="flex items-start gap-4 p-4 rounded-xl bg-card dark:bg-zinc-950 border border-border dark:border-zinc-800 hover:border-[#70c82a]/30 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#70c82a]/10 flex items-center justify-center border border-[#70c82a]/20 flex-shrink-0">
                      <item.icon className="w-5 h-5 text-[#70c82a]" />
                    </div>
                    <div>
                      <h5 className="text-foreground font-bold mb-1">{item.title}</h5>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
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
              <div className="p-8 rounded-2xl bg-card dark:bg-zinc-950 border border-border dark:border-zinc-800">
                <div className="text-foreground font-bold mb-6">System Architecture Overview</div>
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
                          <span className="text-foreground font-semibold">{tier.level}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">{tier.sites} locations • {tier.users} users</div>
                      </div>
                      <div className="h-12 bg-muted dark:bg-zinc-900 rounded-lg p-3 flex items-center justify-between">
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
                        <div className="text-xs text-muted-foreground">Real-time Sync</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-border dark:border-zinc-800 grid grid-cols-3 gap-4 text-center">
                        <div>
                    <div className="text-2xl font-bold text-foreground mb-1">31</div>
                    <div className="text-[10px] text-muted-foreground uppercase font-bold">Total Sites</div>
                        </div>
                  <div>
                    <div className="text-2xl font-bold text-[#70c82a] mb-1">585</div>
                    <div className="text-[10px] text-muted-foreground uppercase font-bold">Active Users</div>
                      </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground mb-1">99.8%</div>
                    <div className="text-[10px] text-muted-foreground uppercase font-bold">Uptime</div>
                  </div>
                </div>
              </div>
                    </motion.div>
          </div>

        </div>
      </section>



    {/* Footer */}
<footer className="bg-muted dark:bg-black py-12">
  <div className="container mx-auto px-4 lg:px-8 text-foreground">
    <div className="grid md:grid-cols-4 gap-8 mb-8">
      <div className="space-y-4">
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
            <div className="font-bold text-foreground">ECWC Equipment Manager</div>
            <div className="text-sm text-muted-foreground">Internal System</div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
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
          <h4 className="font-semibold text-foreground">{section.title}</h4>
          <ul className="space-y-2">
            {section.links.map((link, j) => (
              <li key={j}>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {link}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>

    <div className="pt-8 border-t border-border dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
      <p className="text-sm text-muted-foreground">
        © 2025 ECWC Equipment Management System. Internal use only.
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

    </div>
  )
}