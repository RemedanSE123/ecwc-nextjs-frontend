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
  { id: 2, name: "Motor Grader", op: 13, idle: 2, ur: 8, down: 0, hr: 6, ui: 0, rfd: 0, afd: 2, totalQty: 31, image: "/dozer.jpg" },
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

// Orbital System Visualization Component
const OrbitalSystemVisualization = () => {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((prev) => (prev + 0.5) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const centerX = 200;
  const centerY = 200;
  const planets = [
    { angle: 0, radius: 120, size: 25, color: "#3b82f6", label: "Inventory", speed: 1 },
    { angle: 90, radius: 120, size: 25, color: "#f59e0b", label: "Work Orders", speed: 1 },
    { angle: 180, radius: 160, size: 30, color: "#8b5cf6", label: "Maintenance", speed: 0.7 },
    { angle: 270, radius: 160, size: 25, color: "#ec4899", label: "Reports", speed: 0.7 }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="relative h-[500px] flex items-center justify-center"
    >
      <svg
        viewBox="0 0 400 400"
        className="w-full h-full"
        style={{ filter: 'drop-shadow(0 0 20px rgba(112,200,42,0.3))' }}
      >
        <defs>
          <radialGradient id="coreGradient">
            <stop offset="0%" stopColor="#70c82a" stopOpacity="1" />
            <stop offset="100%" stopColor="#5fa822" stopOpacity="0.8" />
          </radialGradient>
        </defs>

        {/* Central Core */}
        <motion.circle
          cx={centerX}
          cy={centerY}
          r="40"
          fill="url(#coreGradient)"
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, type: "spring" }}
          className="drop-shadow-[0_0_30px_rgba(112,200,42,0.6)]"
        >
          <animate
            attributeName="opacity"
            values="0.8;1;0.8"
            dur="2s"
            repeatCount="indefinite"
          />
        </motion.circle>
        <text x={centerX} y={centerY + 10} textAnchor="middle" className="fill-white text-sm font-bold">ERP Core</text>

        {/* Orbit Paths */}
        <circle cx={centerX} cy={centerY} r="120" fill="none" stroke="rgba(112,200,42,0.2)" strokeWidth="1" strokeDasharray="4,4" />
        <circle cx={centerX} cy={centerY} r="160" fill="none" stroke="rgba(112,200,42,0.15)" strokeWidth="1" strokeDasharray="4,4" />

        {/* Planets */}
        {planets.map((planet, i) => {
          const currentAngle = (planet.angle + rotation * planet.speed) * (Math.PI / 180);
          const x = centerX + planet.radius * Math.cos(currentAngle);
          const y = centerY + planet.radius * Math.sin(currentAngle);

          return (
            <g key={i}>
              {/* Connection Line */}
              <line
                x1={centerX}
                y1={centerY}
                x2={x}
                y2={y}
                stroke="rgba(112,200,42,0.3)"
                strokeWidth="2"
              >
                <animate
                  attributeName="opacity"
                  values="0.3;0.6;0.3"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </line>
              {/* Planet */}
              <g>
                <circle
                  cx={x}
                  cy={y}
                  r={planet.size}
                  fill={planet.color}
                  className="drop-shadow-[0_0_15px_rgba(112,200,42,0.4)]"
                >
                  <animate
                    attributeName="opacity"
                    values="0.8;1;0.8"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </circle>
                <text
                  x={x}
                  y={y + planet.size + 15}
                  textAnchor="middle"
                  className="fill-white text-xs font-semibold"
                >
                  {planet.label}
                </text>
              </g>
            </g>
          );
        })}
      </svg>
    </motion.div>
  );
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
    <section className="relative py-32 bg-zinc-950">
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
              className="text-4xl md:text-6xl font-bold text-white mb-2 tracking-tight"
            >
              ECWC <span className="text-[#70c82a]">Equipment Command Center</span>
            </motion.h2>
            <p className="text-zinc-400 text-lg md:text-xl font-medium">Every machine. Every detail. One intelligent system.</p>
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
                        <span className="text-sm font-bold tracking-widest uppercase text-zinc-400">
                          {categoryUtilization >= 80 ? '🚀 OPTIMAL PERFORMANCE' : categoryUtilization >= 60 ? '✅ GOOD STATUS' : categoryUtilization >= 40 ? '⚠️ NEEDS ATTENTION' : '🔴 CRITICAL ALERT'}
                        </span>
                      </div>
                      <h3 className="text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight">{category.name}</h3>
                      <p className="text-[#70c82a] font-mono text-base">Fleet Category #{category.id} of {equipmentCategories.length}</p>
                      <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed italic mb-4">{getEquipmentDescription(category.name)}</p>
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
                          <p className="text-xs font-semibold text-zinc-400">Operational & Ready</p>
                        </div>
                        <div className="text-2xl font-bold text-[#70c82a] mb-1">
                          <AnimatedCounter value={category.op} duration={1000} />
                        </div>
                        <p className="text-[10px] text-zinc-500 leading-tight">Units actively working on projects</p>
                      </motion.div>

                      <motion.div
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        className="p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20"
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <Truck className="w-4 h-4 text-blue-500" />
                          <p className="text-xs font-semibold text-zinc-400">Total Fleet Size</p>
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">
                          <AnimatedCounter value={category.totalQty} duration={1000} />
                        </div>
                        <p className="text-[10px] text-zinc-500 leading-tight">Total equipment in this category</p>
                      </motion.div>

                      <motion.div
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        className="p-3 rounded-xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20"
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <Gauge className="w-4 h-4 text-amber-500" />
                          <p className="text-xs font-semibold text-zinc-400">Utilization Rate</p>
                        </div>
                        <div className="text-2xl font-bold text-amber-500 mb-1">
                          <AnimatedCounter value={categoryUtilization} duration={1000} />%
                        </div>
                        <p className="text-[10px] text-zinc-500 leading-tight">Percentage of fleet in use</p>
                      </motion.div>

                      <motion.div
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        className="p-3 rounded-xl bg-gradient-to-br from-red-500/10 to-transparent border border-red-500/20"
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                          <p className="text-xs font-semibold text-zinc-400">Out of Service</p>
                        </div>
                        <div className="text-2xl font-bold text-red-500 mb-1">
                          <AnimatedCounter value={category.down} duration={1000} />
                        </div>
                        <p className="text-[10px] text-zinc-500 leading-tight">Units requiring immediate attention</p>
                      </motion.div>
                    </div>

                    {/* Additional Status Info */}
                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-zinc-800">
                      <div className="text-center p-2 rounded-lg bg-zinc-900/50 border border-zinc-800">
                        <Clock className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                        <div className="text-base font-bold text-white mb-0.5">{category.idle}</div>
                        <p className="text-[9px] text-zinc-500 leading-tight">Standby / Idle</p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-zinc-900/50 border border-zinc-800">
                        <Wrench className="w-4 h-4 text-orange-400 mx-auto mb-1" />
                        <div className="text-base font-bold text-white mb-0.5">{category.ur}</div>
                        <p className="text-[9px] text-zinc-500 leading-tight">Under Repair</p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-zinc-900/50 border border-zinc-800">
                        <TrendingUp className="w-4 h-4 text-[#70c82a] mx-auto mb-1" />
                        <div className="text-base font-bold text-white mb-0.5">{category.hr + category.ui + category.rfd + category.afd}</div>
                        <p className="text-[9px] text-zinc-500 leading-tight">In Transit / Other</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Scrollable Image Carousel - Small Images with Names */}
          <div className="mt-12 pt-8 border-t border-zinc-800">
            {/* Search Bar */}
            <div className="mb-6 flex justify-center">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search equipment categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/50 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#70c82a] transition-colors"
                />
              </div>
            </div>

            {/* Horizontal Scrollable Image Carousel */}
            <div className="relative">
              {/* Left Scroll Button - Always Visible */}
              <button
                onClick={() => handleNavigate('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-zinc-900/95 border border-zinc-700 hover:border-[#70c82a] flex items-center justify-center transition-all hover:bg-zinc-800 hover:scale-110 shadow-lg"
                aria-label="Scroll left"
              >
                <ChevronRight className="w-5 h-5 text-zinc-400 hover:text-[#70c82a] rotate-180 transition-colors" />
              </button>

              {/* Right Scroll Button - Always Visible */}
              <button
                onClick={() => handleNavigate('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-zinc-900/95 border border-zinc-700 hover:border-[#70c82a] flex items-center justify-center transition-all hover:bg-zinc-800 hover:scale-110 shadow-lg"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-5 h-5 text-zinc-400 hover:text-[#70c82a] transition-colors" />
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
                            : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/70'
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
                        <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-zinc-800 border border-zinc-700 group-hover:border-[#70c82a]/50 transition-colors">
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
                          <p className={`text-[10px] sm:text-[11px] font-semibold line-clamp-2 leading-tight ${isActive ? 'text-white' : 'text-zinc-300 group-hover:text-white'}`}>
                            {category.name}
                          </p>
                          <div className={`mt-1 text-[9px] font-bold ${isActive ? 'text-[#70c82a]' : 'text-zinc-500'}`}>
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
        <span className="font-medium text-white">{name}</span>
        <span className="text-zinc-400">
          {operational}/{total}
        </span>
      </div>
      <div className="relative h-2 bg-zinc-800 rounded-full overflow-hidden">
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
                ETHIOPIAN CONSTRUCTION WORKS CORPORATION
                </span>
                <span className="text-xs text-muted-foreground font-medium">የኢትዮጵያ ኮንቦትሬክሽን ምልዎት ኮርፖሬሽን</span>
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
      <section className="relative overflow-hidden py-20 lg:py-32 bg-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(112,200,42,0.05),transparent_50%)]" />
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
                <motion.div
                  variants={fadeInUp}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#70c82a]/10 text-[#70c82a] text-sm font-semibold border border-[#70c82a]/20"
                >
                  <Shield className="h-4 w-4" />
                  Internal Enterprise Management Platform
                </motion.div>

                <motion.h1
                  variants={fadeInUp}
                  className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-white"
                >
                  ECWC{" "}
                  <span className="text-[#70c82a]">
                      Maintenance Management System
                  </span>
                </motion.h1>

                <motion.p
                  variants={fadeInUp}
                  className="mt-4 text-base md:text-lg text-zinc-400 leading-relaxed max-w-2xl"
                >
                  Empowering <span className="text-white font-semibold">ETHIOPIAN CONSTRUCTION WORKS CORPORATION (ECWC)</span> / <span className="text-white font-semibold">የኢትዮጵያ ኮንቦትሬክሽን ምልዎት ኮርፖሬሽን</span> with a unified digital system to efficiently manage
                  <span className="text-[#70c82a] font-semibold"> inventory</span>, <span className="text-[#70c82a] font-semibold">work orders</span>, <span className="text-[#70c82a] font-semibold">maintenance</span>, <span className="text-[#70c82a] font-semibold">requests</span>, and <span className="text-[#70c82a] font-semibold">invoices</span> — promoting
                  transparency and operational excellence across all divisions.
                </motion.p>

                <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="gap-2 text-base h-12 px-8 bg-[#70c82a] hover:bg-[#5fa822] text-black font-semibold" asChild>
                    <Link href="/dashboard">
                      Access System
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="gap-2 text-base h-12 px-8 border-zinc-700 text-white hover:bg-zinc-900 hover:border-[#70c82a]">
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
                      <div className="text-2xl font-bold text-[#70c82a]">
                        <AnimatedCounter value={stat.value} />
                      </div>
                      <div className="text-sm text-zinc-400 font-medium">{stat.label}</div>
                    </div>
                  ))}
                </motion.div>
              </motion.div>

              {/* Right Content - Dashboard Preview */}
              <motion.div
                variants={scaleIn}
                className="relative"
              >
                <div className="relative overflow-hidden rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#70c82a]/5 to-transparent" />
                  <div className="p-6 relative z-10">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-800">
                      <h3 className="text-lg font-bold text-white">Live Equipment Dashboard</h3>
                      <Badge className="bg-[#70c82a] text-black font-bold">
                        <div className="h-2 w-2 bg-black rounded-full mr-2 animate-pulse" />
                        Live
                      </Badge>
                    </div>
                    <div className="space-y-6">
                      {/* Equipment Uptime Progress */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-white">Equipment Uptime</span>
                          <span className="text-zinc-400">98%</span>
                        </div>
                        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: "98%" }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.5 }}
                            className="h-full bg-gradient-to-r from-[#70c82a] to-emerald-400 rounded-full"
                          />
                        </div>
                      </div>

                      {/* Equipment Status with Animated Progress Bars */}
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

                      {/* Quick Stats */}
                      <motion.div 
                        className="grid grid-cols-2 gap-4 pt-4"
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                      >
                        {[
                          { value: "24", label: "Active WO", color: "bg-[#70c82a]/10 border-[#70c82a]/20", textColor: "text-[#70c82a]" },
                          { value: "156", label: "Total Assets", color: "bg-[#70c82a]/10 border-[#70c82a]/20", textColor: "text-[#70c82a]" }
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
                            <div className="text-xs text-zinc-400 mt-1">{stat.label}</div>
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

      {/* Design 1: Orbital System - Planets & Connections */}
      <section className="relative py-32 bg-black overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(112,200,42,0.03),transparent_70%)]" />
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#70c82a]/10 text-[#70c82a] text-xs font-bold uppercase tracking-widest border border-[#70c82a]/20">
                <Globe className="w-4 h-4" />
                System Architecture
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white">
                Unified <span className="text-[#70c82a]">Orbital System</span>
              </h2>
              <p className="text-zinc-400 text-lg leading-relaxed">
                Our ERP system operates like a planetary system, with each module orbiting around a central core, seamlessly connected and synchronized for optimal performance.
              </p>
              <div className="space-y-4 pt-4">
                {[
                  "Centralized core managing all operations",
                  "Modular planets representing system components",
                  "Real-time data flow through connections",
                  "Synchronized operations across all modules"
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 text-zinc-300"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-[#70c82a]" />
                    <span className="text-sm">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right: Orbital Visualization */}
            <OrbitalSystemVisualization />
          </div>
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

      {/* Design 3: 3D Layered Architecture */}
      <section className="relative py-32 bg-black overflow-hidden" style={{ perspective: '1000px' }}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(112,200,42,0.02),transparent_70%)]" />
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#70c82a]/10 text-[#70c82a] text-xs font-bold uppercase tracking-widest mb-6 border border-[#70c82a]/20">
              <Layers className="w-4 h-4" />
              System Architecture
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
              <span className="text-[#70c82a]">3D Layered</span> Architecture
            </h2>
            <p className="text-zinc-400 text-lg max-w-3xl mx-auto">
              Experience our system's depth through floating layers that represent the hierarchical structure of our enterprise platform.
            </p>
          </motion.div>

          <div className="relative h-[600px] flex items-center justify-center">
            <div className="relative w-full max-w-4xl" style={{ transformStyle: 'preserve-3d' }}>
              {[
                { 
                  label: "User Interface", 
                  desc: "Frontend Layer", 
                  z: 0, 
                  scale: 1, 
                  color: "from-[#70c82a]/20 to-transparent",
                  borderColor: "border-[#70c82a]/30",
                  delay: 0
                },
                { 
                  label: "API Gateway", 
                  desc: "Integration Layer", 
                  z: -100, 
                  scale: 0.9, 
                  color: "from-blue-500/20 to-transparent",
                  borderColor: "border-blue-500/30",
                  delay: 0.2
                },
                { 
                  label: "Business Logic", 
                  desc: "Core Services", 
                  z: -200, 
                  scale: 0.8, 
                  color: "from-amber-500/20 to-transparent",
                  borderColor: "border-amber-500/30",
                  delay: 0.4
                },
                { 
                  label: "Database", 
                  desc: "Data Layer", 
                  z: -300, 
                  scale: 0.7, 
                  color: "from-purple-500/20 to-transparent",
                  borderColor: "border-purple-500/30",
                  delay: 0.6
                }
              ].map((layer, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 100, rotateX: -45 }}
                  whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: layer.delay }}
                  className={`absolute inset-0 p-8 rounded-2xl bg-gradient-to-br ${layer.color} border-2 ${layer.borderColor} backdrop-blur-sm`}
                  style={{
                    transform: `translateZ(${layer.z}px) scale(${layer.scale})`,
                    transformStyle: 'preserve-3d',
                    boxShadow: `0 ${Math.abs(layer.z) / 10}px ${Math.abs(layer.z) / 5}px rgba(0,0,0,0.5)`
                  }}
                  whileHover={{ 
                    scale: layer.scale + 0.05,
                    z: layer.z + 20,
                    transition: { duration: 0.3 }
                  }}
                >
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">{layer.label}</div>
                    <div className="text-zinc-400 text-sm">{layer.desc}</div>
                    <div className="mt-6 flex justify-center gap-2">
                      {[1, 2, 3].map((dot) => (
                        <motion.div
                          key={dot}
                          className="w-2 h-2 rounded-full bg-[#70c82a]"
                          animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.5, 1, 0.5]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: dot * 0.3
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Side Content */}
          <div className="grid lg:grid-cols-2 gap-12 mt-16">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <h3 className="text-2xl font-bold text-white mb-4">Layered Excellence</h3>
              <p className="text-zinc-400 leading-relaxed">
                Each layer represents a critical component of our system architecture, working in harmony to deliver seamless performance.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <h3 className="text-2xl font-bold text-white mb-4">Depth & Performance</h3>
              <p className="text-zinc-400 leading-relaxed">
                Our multi-layered approach ensures optimal performance, security, and scalability across all system components.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ECWC Equipment Command Center */}
      <CommandCenterSection />

      {/* Design 2: Neural Network / Node Graph */}
      <section className="relative py-32 bg-zinc-950 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(112,200,42,0.02),transparent_70%)]" />
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#70c82a]/10 text-[#70c82a] text-xs font-bold uppercase tracking-widest mb-6 border border-[#70c82a]/20">
              <Activity className="w-4 h-4" />
              Data Flow Network
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Intelligent <span className="text-[#70c82a]">Neural Network</span>
            </h2>
            <p className="text-zinc-400 text-lg max-w-3xl mx-auto">
              Every module is a node, every connection is a pathway. Our system operates like a neural network, with intelligent data flow connecting all components seamlessly.
            </p>
          </motion.div>

          <div className="relative h-[600px] w-full">
            <svg
              viewBox="0 0 1000 600"
              className="w-full h-full"
              style={{ filter: 'drop-shadow(0 0 30px rgba(112,200,42,0.2))' }}
            >
              <defs>
                <linearGradient id="nodeGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#70c82a" stopOpacity="1" />
                  <stop offset="100%" stopColor="#5fa822" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="nodeGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="1" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="nodeGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="1" />
                  <stop offset="100%" stopColor="#d97706" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="nodeGradient4" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="1" />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#70c82a" stopOpacity="0" />
                  <stop offset="50%" stopColor="#70c82a" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#70c82a" stopOpacity="0" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {/* Node positions */}
              {[
                { x: 200, y: 150, label: "Inventory", gradient: "url(#nodeGradient1)", size: 50 },
                { x: 500, y: 100, label: "Work Orders", gradient: "url(#nodeGradient2)", size: 55 },
                { x: 800, y: 150, label: "Maintenance", gradient: "url(#nodeGradient3)", size: 50 },
                { x: 150, y: 350, label: "Reports", gradient: "url(#nodeGradient4)", size: 45 },
                { x: 500, y: 400, label: "Analytics", gradient: "url(#nodeGradient1)", size: 60 },
                { x: 850, y: 350, label: "Dashboard", gradient: "url(#nodeGradient2)", size: 50 },
                { x: 500, y: 250, label: "ERP Core", gradient: "url(#nodeGradient1)", size: 70 }
              ].map((node, i) => (
                <g key={i}>
                  {/* Connections to other nodes */}
                  {i < 6 && (
                    <motion.line
                      x1={node.x}
                      y1={node.y}
                      x2={500}
                      y2={250}
                      stroke="url(#connectionGradient)"
                      strokeWidth="2"
                      initial={{ pathLength: 0, opacity: 0 }}
                      whileInView={{ pathLength: 1, opacity: 0.4 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, delay: i * 0.2 }}
                    >
                      <animate
                        attributeName="opacity"
                        values="0.2;0.5;0.2"
                        dur="3s"
                        repeatCount="indefinite"
                      />
                    </motion.line>
                  )}
                  
                  {/* Node */}
                  <motion.g
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.15, type: "spring" }}
                  >
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={node.size}
                      fill={node.gradient}
                      filter="url(#glow)"
                      className="cursor-pointer"
                    >
                      <animate
                        attributeName="r"
                        values={`${node.size};${node.size + 5};${node.size}`}
                        dur="2s"
                        repeatCount="indefinite"
                      />
                    </circle>
                    <text
                      x={node.x}
                      y={node.y + node.size + 20}
                      textAnchor="middle"
                      className="fill-white text-sm font-semibold"
                    >
                      {node.label}
                    </text>
                  </motion.g>
                </g>
              ))}

              {/* Animated data flow particles */}
              {[0, 1, 2, 3].map((i) => (
                <motion.circle
                  key={`particle-${i}`}
                  r="4"
                  fill="#70c82a"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  animate={{
                    cx: [200, 500, 800, 500, 200],
                    cy: [150, 100, 150, 400, 350],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    delay: i * 2,
                    ease: "linear"
                  }}
                />
              ))}
            </svg>
          </div>
        </div>
      </section>

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

          {/* ECWC Management Dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-32"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">ECWC Management Dashboard</h2>
              <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
                Real-time insights and control over ECWC's entire equipment fleet
              </p>
            </div>

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

      {/* Design 4: Particle Flow System */}
      <section className="relative py-32 bg-black overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(112,200,42,0.02),transparent_70%)]" />
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#70c82a]/10 text-[#70c82a] text-xs font-bold uppercase tracking-widest mb-6 border border-[#70c82a]/20">
              <Zap className="w-4 h-4" />
              Data Flow
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
              <span className="text-[#70c82a]">Particle Flow</span> System
            </h2>
            <p className="text-zinc-400 text-lg max-w-3xl mx-auto">
              Watch data flow like particles through our system, connecting modules in real-time with intelligent routing and seamless transmission.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {[
              { label: "Inventory", icon: Warehouse, color: "#70c82a", x: 100, y: 150 },
              { label: "Work Orders", icon: ClipboardList, color: "#3b82f6", x: 500, y: 150 },
              { label: "Maintenance", icon: Wrench, color: "#f59e0b", x: 900, y: 150 },
              { label: "Reports", icon: BarChart3, color: "#8b5cf6", x: 100, y: 400 },
              { label: "Analytics", icon: Activity, color: "#ec4899", x: 500, y: 400 },
              { label: "Dashboard", icon: Target, color: "#70c82a", x: 900, y: 400 }
            ].map((module, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative p-6 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-[#70c82a]/30 transition-all group"
              >
                <div className="flex flex-col items-center text-center">
                  <div 
                    className="w-16 h-16 rounded-xl bg-[#70c82a]/10 flex items-center justify-center mb-4 border border-[#70c82a]/20 group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: `${module.color}20`, borderColor: `${module.color}40` }}
                  >
                    <module.icon className="w-8 h-8" style={{ color: module.color }} />
                  </div>
                  <h3 className="text-white font-bold text-lg">{module.label}</h3>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Particle Canvas Container */}
          <div className="relative h-[400px] w-full rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden">
            <canvas
              id="particleCanvas"
              className="absolute inset-0 w-full h-full"
              style={{ background: 'transparent' }}
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">Real-Time Data Flow</div>
                <div className="text-zinc-400">Particles represent data streams between modules</div>
              </div>
            </div>
          </div>

          {/* Particle System Script */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  const canvas = document.getElementById('particleCanvas');
                  if (!canvas) return;
                  const ctx = canvas.getContext('2d');
                  canvas.width = canvas.offsetWidth;
                  canvas.height = canvas.offsetHeight;

                  const particles = [];
                  const connections = [
                    { from: { x: canvas.width * 0.15, y: canvas.height * 0.3 }, to: { x: canvas.width * 0.5, y: canvas.height * 0.3 }, color: '#70c82a' },
                    { from: { x: canvas.width * 0.5, y: canvas.height * 0.3 }, to: { x: canvas.width * 0.85, y: canvas.height * 0.3 }, color: '#3b82f6' },
                    { from: { x: canvas.width * 0.15, y: canvas.height * 0.7 }, to: { x: canvas.width * 0.5, y: canvas.height * 0.7 }, color: '#8b5cf6' },
                    { from: { x: canvas.width * 0.5, y: canvas.height * 0.7 }, to: { x: canvas.width * 0.85, y: canvas.height * 0.7 }, color: '#ec4899' },
                    { from: { x: canvas.width * 0.15, y: canvas.height * 0.3 }, to: { x: canvas.width * 0.15, y: canvas.height * 0.7 }, color: '#70c82a' },
                    { from: { x: canvas.width * 0.5, y: canvas.height * 0.3 }, to: { x: canvas.width * 0.5, y: canvas.height * 0.7 }, color: '#f59e0b' },
                    { from: { x: canvas.width * 0.85, y: canvas.height * 0.3 }, to: { x: canvas.width * 0.85, y: canvas.height * 0.7 }, color: '#3b82f6' }
                  ];

                  class Particle {
                    constructor(connection, progress = 0) {
                      this.connection = connection;
                      this.progress = progress;
                      this.speed = 0.005 + Math.random() * 0.005;
                    }

                    update() {
                      this.progress += this.speed;
                      if (this.progress > 1) {
                        this.progress = 0;
                        this.speed = 0.005 + Math.random() * 0.005;
                      }
                    }

                    draw() {
                      const x = this.connection.from.x + (this.connection.to.x - this.connection.from.x) * this.progress;
                      const y = this.connection.from.y + (this.connection.to.y - this.connection.from.y) * this.progress;
                      
                      ctx.beginPath();
                      ctx.arc(x, y, 3, 0, Math.PI * 2);
                      ctx.fillStyle = this.connection.color;
                      ctx.shadowBlur = 10;
                      ctx.shadowColor = this.connection.color;
                      ctx.fill();
                      ctx.shadowBlur = 0;
                    }
                  }

                  connections.forEach(conn => {
                    for (let i = 0; i < 3; i++) {
                      particles.push(new Particle(conn, Math.random()));
                    }
                  });

                  function animate() {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    
                    // Draw connections
                    connections.forEach(conn => {
                      ctx.beginPath();
                      ctx.moveTo(conn.from.x, conn.from.y);
                      ctx.lineTo(conn.to.x, conn.to.y);
                      ctx.strokeStyle = conn.color + '30';
                      ctx.lineWidth = 2;
                      ctx.stroke();
                    });

                    // Update and draw particles
                    particles.forEach(particle => {
                      particle.update();
                      particle.draw();
                    });

                    requestAnimationFrame(animate);
                  }

                  // Start animation when in view
                  const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                      if (entry.isIntersecting) {
                        animate();
                        observer.disconnect();
                      }
                    });
                  }, { threshold: 0.1 });

                  if (canvas) observer.observe(canvas);
                })();
              `
            }}
          />
        </div>
      </section>

      {/* Governance, Security & Audit - Enterprise Standard */}
      <section className="py-32 bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(112,200,42,0.03),transparent_70%)]" />
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          {/* Two Column Layout: Content Left, 4 Quadrants Right */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            {/* Left Side - Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-800/50 text-zinc-400 text-xs font-bold uppercase tracking-widest border border-zinc-800">
                <Shield className="w-4 h-4" />
                Compliance & Security
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white">
                Built for <span className="text-[#70c82a]">Government & Corporate</span> Standards
              </h2>
              <p className="text-zinc-400 text-lg leading-relaxed">
                Enterprise-grade security architecture with full audit compliance and multi-level access control
              </p>
            </motion.div>

            {/* Right Side - 4 Quadrants Grid */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
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
                  className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-[#70c82a]/30 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#70c82a]/10 flex items-center justify-center mb-4 border border-[#70c82a]/20 group-hover:scale-110 transition-transform">
                    <item.icon className="w-6 h-6 text-[#70c82a]" />
                  </div>
                  <h4 className="text-white font-bold text-base mb-2">{item.title}</h4>
                  <p className="text-zinc-500 text-sm mb-3">{item.desc}</p>
                  <div className="text-[#70c82a] text-xs font-bold">{item.stat}</div>
                </motion.div>
              ))}
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

          {/* Compliance Ready Section - Modern Grid Design */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16"
          >
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Left: Content */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#70c82a]/10 flex items-center justify-center border border-[#70c82a]/20">
                    <Award className="w-8 h-8 text-[#70c82a]" />
                  </div>
                  <div>
                    <div className="text-xs text-[#70c82a] font-bold uppercase tracking-wider mb-1">Compliance & Standards</div>
                    <h3 className="text-3xl font-bold text-white">Compliance-Ready Reporting</h3>
                  </div>
                </div>
                <p className="text-zinc-400 text-lg leading-relaxed">
                  Built to support government reporting needs and international audit standards with comprehensive approval workflows and secure data storage.
                </p>
                <div className="space-y-3 pt-4">
                  {[
                    "Full audit trail for all system activities",
                    "Role-based access with approval workflows",
                    "Secure data encryption and storage",
                    "Government and international standard compliance"
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-3 text-zinc-300"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-[#70c82a]" />
                      <span className="text-sm">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Right: Compliance Badges Grid */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative"
              >
                <div className="p-8 rounded-2xl bg-zinc-950 border border-zinc-800">
                  <div className="text-white font-bold mb-6 text-lg">Certifications & Standards</div>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { name: "ISO 27001", desc: "Compatible", icon: Shield, color: "bg-[#70c82a]/10 border-[#70c82a]/20 text-[#70c82a]" },
                      { name: "GDPR", desc: "Compliant", icon: Lock, color: "bg-blue-500/10 border-blue-500/20 text-blue-400" },
                      { name: "SOC 2", desc: "Type II", icon: CheckCircle, color: "bg-amber-500/10 border-amber-500/20 text-amber-400" },
                      { name: "Government", desc: "Audit Ready", icon: Award, color: "bg-[#70c82a]/10 border-[#70c82a]/20 text-[#70c82a]" },
                      { name: "International", desc: "Standards", icon: Globe, color: "bg-purple-500/10 border-purple-500/20 text-purple-400", colSpan: "col-span-2" }
                    ].map((badge, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className={`p-5 rounded-xl border ${badge.color} hover:scale-105 transition-all group ${badge.colSpan || ''}`}
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <badge.icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <div className="font-bold text-white text-sm mb-1">{badge.name}</div>
                            <div className="text-xs opacity-80">{badge.desc}</div>
                          </div>
                        </div>
                        <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: "100%" }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: i * 0.1 + 0.3 }}
                            className="h-full bg-gradient-to-r from-[#70c82a] to-emerald-400"
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Design 5: Hexagonal Grid Network */}
      <section className="relative py-32 bg-zinc-950 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(112,200,42,0.02),transparent_70%)]" />
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#70c82a]/10 text-[#70c82a] text-xs font-bold uppercase tracking-widest mb-6 border border-[#70c82a]/20">
              <Server className="w-4 h-4" />
              Network Architecture
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
              <span className="text-[#70c82a]">Hexagonal Grid</span> Network
            </h2>
            <p className="text-zinc-400 text-lg max-w-3xl mx-auto">
              Modern honeycomb architecture where each hexagon represents a system module, connected in an intelligent network pattern.
            </p>
          </motion.div>

          <div className="relative flex items-center justify-center min-h-[600px]">
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
              {[
                { label: "Inventory", icon: Warehouse, color: "#70c82a", delay: 0 },
                { label: "Work Orders", icon: ClipboardList, color: "#3b82f6", delay: 0.1 },
                { label: "Maintenance", icon: Wrench, color: "#f59e0b", delay: 0.2 },
                { label: "Reports", icon: BarChart3, color: "#8b5cf6", delay: 0.3 },
                { label: "Analytics", icon: Activity, color: "#ec4899", delay: 0.4 },
                { label: "Dashboard", icon: Target, color: "#70c82a", delay: 0.5 },
                { label: "Users", icon: Users, color: "#10b981", delay: 0.6 },
                { label: "Settings", icon: Settings, color: "#6366f1", delay: 0.7 },
                { label: "Security", icon: Shield, color: "#ef4444", delay: 0.8 },
                { label: "API", icon: Server, color: "#70c82a", delay: 0.9 },
                { label: "Database", icon: Database, color: "#f59e0b", delay: 1.0 },
                { label: "Backup", icon: RotateCcw, color: "#8b5cf6", delay: 1.1 }
              ].map((hex, i) => {
                const isEvenRow = Math.floor(i / 6) % 2 === 0;
                const offset = isEvenRow ? 0 : 60;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0, rotate: -180 }}
                    whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ 
                      duration: 0.6, 
                      delay: hex.delay,
                      type: "spring",
                      stiffness: 200
                    }}
                    whileHover={{ 
                      scale: 1.15,
                      zIndex: 10,
                      transition: { duration: 0.3 }
                    }}
                    className="relative group cursor-pointer"
                    style={{ 
                      clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)',
                      width: '120px',
                      height: '104px',
                      marginLeft: `${offset}px`
                    }}
                  >
                    <div
                      className="absolute inset-0 flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all"
                      style={{
                        backgroundColor: `${hex.color}15`,
                        borderColor: `${hex.color}40`,
                        boxShadow: `0 0 20px ${hex.color}30`
                      }}
                    >
                      <hex.icon 
                        className="w-8 h-8 mb-2 transition-transform group-hover:scale-110" 
                        style={{ color: hex.color }}
                      />
                      <span className="text-white text-xs font-bold text-center">{hex.label}</span>
                    </div>
                    
                    {/* Glow effect on hover */}
                    <motion.div
                      className="absolute inset-0 rounded-lg"
                      style={{
                        background: `radial-gradient(circle, ${hex.color}40, transparent 70%)`,
                        opacity: 0
                      }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.div>
                );
              })}
            </div>

            {/* Connection Lines Animation */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
              <defs>
                <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#70c82a" stopOpacity="0" />
                  <stop offset="50%" stopColor="#70c82a" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#70c82a" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <motion.line
                  key={i}
                  x1={`${20 + i * 15}%`}
                  y1="50%"
                  x2={`${25 + i * 15}%`}
                  y2="50%"
                  stroke="url(#connectionGradient)"
                  strokeWidth="2"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 0.3 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, delay: i * 0.2 }}
                >
                  <animate
                    attributeName="opacity"
                    values="0.1;0.4;0.1"
                    dur="3s"
                    repeatCount="indefinite"
                  />
                </motion.line>
              ))}
            </svg>
          </div>

          {/* Bottom Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Each hexagon is a module, each connection is a pathway. Together they form a resilient, scalable network architecture.
            </p>
          </motion.div>
        </div>
      </section>

    {/* Footer */}
<footer className="bg-black py-12">
  <div className="container mx-auto px-4 lg:px-8 text-white">
    <div className="grid md:grid-cols-4 gap-8 mb-8">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
         <div className="relative">
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
        © 2025 ECWC Equipment Management System. Internal use only.
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