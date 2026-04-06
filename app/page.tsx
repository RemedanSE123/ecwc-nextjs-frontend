"use client"

import { useState, useEffect, useLayoutEffect, useRef } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
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
  Send,
  Share2
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

    "Dozer, Chain": "Heavy tracked pushing machine for large-scale earthmoving and site preparation. Performs well in soft, muddy, and uneven terrain. | Clearing vegetation, pushing and spreading soil, forming embankments, cutting access roads.",

    "Motor Grader": "Precision surface-finishing machine with a long adjustable blade. Achieves smooth, level surfaces before paving. | Road base grading, shaping shoulders, forming drainage channels, unpaved road maintenance.",

    "Excavator, Chain": "Tracked hydraulic excavator for heavy digging and lifting. Reliable on unstable and rough ground. | Deep trenching, foundation excavation, bulk earth removal, demolition and material handling.",

    "Excavator, Wheel": "Wheeled excavator for mobility and quick relocation. Travels on paved roads without damage. | Urban projects, road works, utility installations, confined space excavation.",

    "Loader, Chain": "Tracked loader for loading and moving materials in soft ground. Strong traction in muddy or rough conditions. | Quarry operations, landfill work, earthwork projects, waste material handling.",

    "Loader, Wheel": "High-speed loader with rubber tires for efficient material handling. Ideal for hard surfaces. | Loading trucks, moving aggregates, managing stockpiles, cleaning construction yards.",

    "Backhoe Loader": "Multi-purpose machine with front bucket and rear digging arm. Versatile in limited space. | Trench excavation, small foundations, loading materials, utility project backfilling.",

    "Roller D/Drum": "Double drum vibratory compactor for asphalt and granular materials. Achieves uniform density. | Road paving, industrial yards, parking areas, pavement finishing.",

    "Roller S/Drum": "Single drum compactor for soil layers and base courses. Controlled compaction depth. | Embankments, road subgrades, trench backfill, foundation preparation.",

    "Roller S/foot -D/D": "Padfoot roller with double drums for deep soil compaction. Improves soil stability. | Clay compaction, cohesive soils, earthworks, embankment construction.",

    "Roller S/foot -S/D": "Single drum padfoot compactor for heavy-duty soil compaction. Strong compaction force. | Foundation preparation, dam works, large earthfill, target density achievement.",

    "Roller Pneumatic": "Rubber-tired compactor for finishing asphalt surfaces. Improves smoothness and bonding. | Final paving stages, sealing surface voids, ride quality, material bonding.",

    "Trencher, Chain": "Chain trenching machine for narrow, deep trenches. Straight and uniform trench profiles. | Cable installation, pipe laying, drainage lines, utility trenching.",

    "Trencher, Wheel": "Wheeled trenching machine for faster movement between locations. Protects paved surfaces. | Road utility installation, sidewalk trenching, paved area work, long trenching.",

    "Scraper": "Self-loading earthmoving machine that cuts, carries, and spreads soil. Reduces need for separate equipment. | Large-scale earthworks, land leveling, highway projects, site development.",

    "Asphalt Paver": "Paving machine for placing hot asphalt with controlled thickness. Ensures uniform surfaces. | Highway construction, urban roads, parking areas, pavement surfacing.",

    "Concrete Paver": "Concrete paving machine for laying rigid pavement structures. Consistent thickness and alignment. | Concrete roads, industrial floors, channels, pavement slabs.",

    "Asphalt Milling machine": "Road milling machine for removing damaged asphalt layers. Restores road profiles. | Surface rehabilitation, pothole preparation, pavement recycling, resurfacing prep.",

    "Chip Spreader": "Aggregate spreading machine for surface treatment works. Ensures uniform coverage. | Chip seal operations, stone chip distribution, road surface treatment, skid resistance.",

    "Power Curber": "Concrete forming machine for curbs and road edges. Continuous extrusion. | Sidewalks, medians, drainage curbs, concrete edge construction.",

    "D/Truck Beiben": "Heavy-duty dump truck for large volumes of earth and aggregates. High hauling capacity. | Soil transport, sand and gravel hauling, demolition waste, large project earthmoving.",

    "D/Truck Daewoo": "Medium-duty dump truck for general construction hauling. Reliable daily transport. | Earth transport, crushed stone hauling, materials delivery, project site logistics.",

    "D/Truck Faw": "High-capacity dump truck for long-haul material transport. Maintains production rates. | Large earthmoving, continuous soil hauling, aggregate transport, excavation support.",

    "D/Truck Nissan": "Reliable dump truck for routine site hauling. Versatile material transport. | Construction materials, spoil removal, aggregate hauling, disposal area transport.",

    "D/Truck Sino": "Dump truck for supporting earthmoving activities. Supports excavation operations. | Soil hauling, waste material transport, fill delivery, backfilling operations.",

    "D/Truck Foton": "Compact dump truck for small to medium hauling. Suited for tight areas. | Short-distance transport, congested areas, material delivery, small project hauling.",

    "Water Truck": "Water tanker for spraying roads and construction areas. Maintains site conditions. | Dust suppression, soil moisture control, compaction watering, safe working conditions.",

    "Water Truck Trailer": "Towed water tank to increase delivery capacity. Supports large projects. | Extended dust control, long road sections, earthwork areas, high water demand.",

    "Fuel Truck": "Mobile fuel supply for refueling equipment on site. Reduces downtime. | Remote refueling, equipment servicing, spread-out work zones, continuous operations.",

    "Fuel Truck Trailer": "Fuel tanker trailer for bulk fuel transport and storage. Supports large fleets. | Bulk fuel delivery, remote project support, equipment fleet fueling, storage supply.",

    "Asphalt Distributer": "Bitumen spraying vehicle for prime and tack coats. Prepares road surfaces. | Prime coat application, tack coat spraying, pavement layer bonding, paving preparation.",

    "Low bed": "Low-deck heavy transport for oversized machinery. Meets height restrictions. | Excavator transport, dozer relocation, crane moving, equipment mobilization.",

    "Low bed Trailer": "Heavy equipment transport trailer for long-distance relocation. Safe equipment moving. | Large equipment transport, site-to-depot moving, machinery relocation, long-haul equipment.",

    "High bed trailer": "High-deck trailer for bulky materials and equipment. General cargo hauling. | Cargo transport, machinery movement, long route hauling, bulky material delivery.",

    "Mobile Crane": "Truck-mounted crane for lifting and positioning heavy loads. Combines mobility with power. | Steel structure placement, precast elements, equipment installation, loading operations.",

    "Cargo Truck": "Flatbed or box truck for transporting materials and tools. Flexible cargo space. | Pallet transport, construction supplies, equipment delivery, yard-to-site logistics.",

    "Cargo Crane": "Truck with mounted crane for loading and unloading. Replaces fixed cranes. | Material lifting, equipment loading, container handling, flexible crane operations.",

    "Water Well Drilling rig": "Drilling rig for creating groundwater wells and boreholes. Develops water sources. | Water supply projects, irrigation systems, remote area wells, borehole drilling.",

    "Shop Truck": "Mobile service vehicle with tools and spare parts. Supports field operations. | On-site maintenance, minor repairs, emergency support, broken-down equipment.",

    "Fork lift": "Industrial lifting vehicle for palletized loads. Enhances warehouse efficiency. | Warehouse loading, yard material handling, construction site stacking, pallet movement.",

    "Farm Truck": "Light-duty utility truck for general site transport. Versatile utility use. | Supply moving, small equipment transport, personnel transport, project area logistics.",

    "Automobile": "Passenger vehicle for site supervision and transport. Supports management mobility. | Site inspections, coordination travel, work zone access, engineer transport.",

    "Bus Passenger": "Large-capacity bus for transporting workers. Safe crew movement. | Camp-to-site transport, office shuttle, construction site crew, labor logistics.",

    "Midi Bus": "Medium-size bus for transporting supervisors and teams. Daily logistics support. | Crew movement, supervisor transport, team logistics, medium project support.",

    "Station Wagon": "Multi-purpose vehicle for staff and light cargo. Office-to-site transport. | Personnel transport, tools delivery, document carrying, project site access.",

    "Double Cabin": "Pickup truck with rear seating for crew transport. Site supervision vehicle. | Supervisor transport, worker movement, small tools carrying, construction site mobility.",

    "Single Cabin": "Pickup truck with extended cargo space for materials. Light hauling capacity. | Tools transport, spare parts delivery, light materials, project area logistics."

  };

  return (
    descMap[name] ||
    "Construction equipment for earthworks, transport, compaction, and lifting. Critical for productivity and schedule adherence. | Earthworks support, material transport, compaction operations, site logistics."
  );
};

/** Parses description: "Explanation | Application" format - exactly 2 sections */
function parseDescription(text: string): { explanation: string; application: string } {
  const parts = text.split(/\s*\|\s*/).map((p) => p.trim());
  const explanation = parts[0] || "";
  const application = parts[1] || "";
  return { explanation, application };
}

function EquipmentDescriptionBlock({ text }: { text: string }) {
  const { explanation, application } = parseDescription(text);
  if (!explanation && !application) {
    return <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>;
  }
  const appItems = application
    ? application.replace(/, and /g, ", ").split(/,\s+/).map((s) => s.trim()).filter(Boolean).slice(0, 4)
    : [];
  return (
    <div className="space-y-2 text-sm leading-relaxed">
      <p className="font-bold text-foreground text-base leading-snug">{explanation}</p>
      {application && (
        <div>
          <p className="font-semibold text-foreground/90 underline underline-offset-2 decoration-primary/50 mb-1.5">Application</p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 ml-1 list-none">
            {appItems.map((item, j) => (
              <li key={j} className="text-muted-foreground flex items-start gap-1.5">
                <span className="text-primary font-bold shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

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
    <section className="relative py-4 lg:py-6 bg-background dark:bg-zinc-950 overflow-x-hidden w-full max-w-[100vw]">
      <div className="container mx-auto px-3 sm:px-4 lg:px-8 relative z-10 max-w-full">
        <div className="mb-2">
          <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-foreground mb-0.5 tracking-tight">
            <span className="text-[#70c82a]">Equipment Command Center</span>
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm md:text-base font-medium">Every machine. Every detail. One intelligent system.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 lg:gap-6 items-start min-w-0">
          {/* Left: Image Panel */}
          <div className="relative h-[200px] sm:h-[280px] md:h-[400px] w-full max-w-full min-w-0 flex items-center justify-center overflow-hidden rounded-xl">
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

          {/* Right: Data Panel + Fixed Search & Carousel */}
          <div className="flex flex-col gap-2 min-w-0 max-w-full">
            {/* Name + description (changes per category) */}
            <div className="space-y-1 min-w-0">
              <h3 className="text-xl sm:text-2xl md:text-4xl font-bold text-foreground tracking-tight leading-tight break-words">{currentCategory.name}</h3>
              <p className="text-[#70c82a] font-mono text-sm">Fleet Category #{currentCategory.id} of {equipmentCategories.length}</p>
              <div className="text-xs sm:text-sm p-2.5 sm:p-3 rounded-xl bg-muted/30 border border-border/60 min-w-0">
                <EquipmentDescriptionBlock text={getEquipmentDescription(currentCategory.name)} />
              </div>
            </div>

            {/* Fixed search bar (never animates) */}
            <div className="relative w-full max-w-full min-w-0">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search categories…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full min-w-0 max-w-full pl-9 pr-3 py-2.5 bg-input dark:bg-zinc-900/50 border border-border dark:border-zinc-700 rounded-lg text-xs sm:text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#70c82a] transition-colors box-border"
              />
            </div>

            {/* Fixed carousel (never animates) — scroll contained; no page-wide horizontal scroll */}
            <div className="relative w-full max-w-full min-w-0 -mx-1 px-1">
              <button
                type="button"
                onClick={() => handleNavigate('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-background/95 dark:bg-zinc-900/95 border border-border dark:border-zinc-700 hover:border-[#70c82a] flex items-center justify-center transition-all hover:bg-muted dark:hover:bg-zinc-800 hover:scale-110 shadow-lg"
                aria-label="Scroll left"
              >
                <ChevronRight className="w-4 h-4 text-muted-foreground hover:text-[#70c82a] rotate-180 transition-colors" />
              </button>
              <button
                type="button"
                onClick={() => handleNavigate('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-background/95 dark:bg-zinc-900/95 border border-border dark:border-zinc-700 hover:border-[#70c82a] flex items-center justify-center transition-all hover:bg-muted dark:hover:bg-zinc-800 hover:scale-110 shadow-lg"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-4 h-4 text-muted-foreground hover:text-[#70c82a] transition-colors" />
              </button>

              <div
                ref={carouselRef}
                className="overflow-x-auto overflow-y-hidden overscroll-x-contain scrollbar-hide pb-2 px-8 sm:px-10 cursor-grab active:cursor-grabbing select-none touch-pan-x max-w-full"
                style={{ scrollBehavior: 'smooth' }}
                onMouseDown={(e) => {
                  if (!carouselRef.current) return;
                  setIsDragging(true);
                  setStartX(e.pageX - carouselRef.current.offsetLeft);
                  setScrollLeft(carouselRef.current.scrollLeft);
                }}
                onMouseLeave={() => setIsDragging(false)}
                onMouseUp={() => setIsDragging(false)}
                onMouseMove={(e) => {
                  if (!isDragging || !carouselRef.current) return;
                  e.preventDefault();
                  const x = e.pageX - carouselRef.current.offsetLeft;
                  const walk = (x - startX) * 2;
                  carouselRef.current.scrollLeft = scrollLeft - walk;
                }}
              >
                <div className="flex gap-2 min-w-max">
                  {displayCategories.map((category, index) => {
                    const actualIndex = equipmentCategories.findIndex(cat => cat.id === category.id);
                    const isActive = actualIndex === currentIndex;
                    const categoryUtilization = calculateUtilization(category);
                    const categoryStatusColor = getStatusColor(categoryUtilization);

                    return (
                      <button
                        key={category.id}
                        onClick={() => handleSelectCategory(index)}
                        className={`relative flex flex-col items-center gap-1.5 w-[72px] p-2 rounded-xl border-2 transition-all cursor-pointer flex-shrink-0 group ${
                          isActive
                            ? 'bg-[#70c82a]/10 border-[#70c82a] shadow-[0_0_15px_rgba(112,200,42,0.3)]'
                            : 'bg-card/50 dark:bg-zinc-900/50 border-border dark:border-zinc-800 hover:border-border/80 dark:hover:border-zinc-700 hover:bg-card/70 dark:hover:bg-zinc-900/70'
                        }`}
                      >
                        <div className={`absolute top-1 right-1 w-2 h-2 rounded-full ${categoryStatusColor} ${isActive ? 'animate-pulse' : ''} z-10`} />
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted dark:bg-zinc-800 border border-border dark:border-zinc-700 group-hover:border-[#70c82a]/50 transition-colors">
                          <Image
                            src={category.image}
                            alt={category.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                            unoptimized
                          />
                        </div>
                        <div className="text-center w-full">
                          <p className={`text-[9px] font-semibold line-clamp-2 leading-tight ${isActive ? 'text-foreground' : 'text-foreground/70 dark:text-zinc-400 group-hover:text-foreground'}`}>
                            {category.name}
                          </p>
                          <div className={`mt-0.5 text-[8px] font-bold ${isActive ? 'text-[#70c82a]' : 'text-muted-foreground'}`}>
                            {categoryUtilization}%
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
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

// Animated Progress Bar: count vs grandTotal (e.g. 69/1602)
const AnimatedEquipmentProgress = ({
  name,
  count,
  grandTotal,
  duration = 1800
}: {
  name: string;
  count: number;
  grandTotal: number;
  duration?: number;
}) => {
  const [progress, setProgress] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const percentage = grandTotal > 0 ? (count / grandTotal) * 100 : 0

  useEffect(() => {
    const el = ref.current
    if (!el) return
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
    observer.observe(el)
    return () => observer.disconnect()
  }, [percentage, duration])

  return (
    <div className="space-y-2" ref={ref}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{name}</span>
        <span className="text-muted-foreground">
          {count}/{grandTotal}
        </span>
      </div>
      <div className="relative h-2 bg-muted dark:bg-zinc-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#70c82a] to-emerald-400"
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
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrollToBottom, setScrollToBottom] = useState(true)
  const [chatInput, setChatInput] = useState('')
  const [chatUserMessages, setChatUserMessages] = useState<{ id: number; text: string }[]>([])
  const chatMessageIdRef = useRef(0)
  const [chatInput2, setChatInput2] = useState('')
  const [chatUserMessages2, setChatUserMessages2] = useState<{ id: number; text: string }[]>([])
  const chatMessageIdRef2 = useRef(0)
  const [chatInput3, setChatInput3] = useState('')
  const [chatUserMessages3, setChatUserMessages3] = useState<{ id: number; text: string }[]>([])
  const chatMessageIdRef3 = useRef(0)

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
    router.prefetch('/sign-in')
    router.prefetch('/sign-up')
  }, [router])

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
      const el = event.target instanceof Element ? event.target : (event.target as Node).parentElement
      if (!el) return
      if (mobileMenuOpen && !el.closest('nav') && !el.closest('button[aria-label="Toggle menu"]')) {
        setMobileMenuOpen(false)
      }
    }
    document.addEventListener('pointerdown', handleClickOutside)
    return () => document.removeEventListener('pointerdown', handleClickOutside)
  }, [mobileMenuOpen])

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 w-full border-b border-[#70c82a]/20 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 shadow-sm shadow-[#70c82a]/5"
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
                  className="object-contain relative z-10 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16"
                  quality={100}
                  unoptimized
                  priority
                  style={{ filter: 'drop-shadow(0 0 8px rgba(112, 200, 42, 0.3))' }}
                />
              </motion.div>

              <span className="sm:hidden font-bold text-base tracking-tight text-foreground leading-none bg-gradient-to-r from-[#70c82a] to-[#5aa022] bg-clip-text text-transparent">
                ECWC
              </span>

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
                    <Link
                      href="/sign-in"
                      prefetch
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        buttonVariants({ variant: 'outline', size: 'sm' }),
                        'w-full border-[#70c82a]/30 hover:border-[#70c82a] hover:text-[#70c82a]'
                      )}
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/sign-up"
                      prefetch
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        buttonVariants({ size: 'sm' }),
                        'w-full bg-primary hover:bg-primary/90 text-primary-foreground'
                      )}
                    >
                      Sign Up
                    </Link>
                  </div>
                </div>
              </motion.nav>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      <main className="pt-14 min-h-0">
      {/* Hero Section - main overview (PEMS, Real-Time Monitoring, Live Equipment Dashboard) */}
      <section id="overview" className="relative overflow-hidden py-12 lg:py-16 bg-background dark:bg-black scroll-mt-[4.5rem]">
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
            <div className="grid lg:grid-cols-[1fr_1.15fr] gap-10 items-center">
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

              {/* Right Content - Dashboard Preview (hidden on small screens — avoid cramped table + horizontal scroll) */}
              <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="relative lg:pl-4 hidden lg:block"
              >
                <div className="relative rounded-2xl">
                  {/* Outer glow ring */}
                  <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-[#70c82a]/40 via-[#70c82a]/10 to-[#70c82a]/25 pointer-events-none" />
                  <div className="absolute -inset-3 rounded-3xl bg-[#70c82a]/10 blur-xl pointer-events-none" />
                <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-card dark:bg-zinc-950">
                  {/* Animated scan line */}
                  <motion.div
                    className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#70c82a]/50 to-transparent z-20 pointer-events-none"
                    animate={{ y: [0, 350, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  />

                  {/* Dark gradient header */}
                  <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 px-5 py-4">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(112,200,42,0.15),transparent_50%)]" />
                    <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#70c82a]/30 to-transparent" />
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="absolute inset-0 rounded-xl bg-[#70c82a]/30 blur-md" />
                          <div className="relative w-10 h-10 rounded-xl bg-[#70c82a]/20 border border-[#70c82a]/50 flex items-center justify-center">
                            <Layers className="w-5 h-5 text-[#70c82a]" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-white leading-none">Asset Register</h3>
                          <p className="text-[11px] text-zinc-400 mt-1">Fleet overview · Real-time tracking</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#70c82a]/15 border border-[#70c82a]/30 text-[11px] font-semibold text-[#70c82a]">
                          <span className="w-2 h-2 rounded-full bg-[#70c82a] animate-pulse" />3 On
                        </span>
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-[11px] font-semibold text-amber-400">
                          <span className="w-2 h-2 rounded-full bg-amber-400" />1 Idle
                        </span>
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-[11px] font-semibold text-red-400">
                          <span className="w-2 h-2 rounded-full bg-red-400" />1 Down
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="relative z-10">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 dark:from-zinc-800/60 dark:via-zinc-800/40 dark:to-zinc-800/60 border-b border-border dark:border-zinc-700">
                          <th className="text-left px-5 py-3 text-xs font-bold text-foreground/70 uppercase tracking-widest">Asset ID</th>
                          <th className="text-left px-4 py-3 text-xs font-bold text-foreground/70 uppercase tracking-widest">Type</th>
                          <th className="text-left px-4 py-3 text-xs font-bold text-foreground/70 uppercase tracking-widest">Status</th>
                          <th className="text-left px-4 py-3 text-xs font-bold text-foreground/70 uppercase tracking-widest">Location</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { id: "ECWC-B-042", type: "Dozer",     status: "Operational", dot: "bg-[#70c82a]",  dotPulse: true,  badge: "text-[#70c82a] bg-[#70c82a]/8",                                        location: "Addis Ababa" },
                          { id: "ECWC-E-108", type: "Excavator", status: "Idle",        dot: "bg-amber-400", dotPulse: false, badge: "text-amber-600 dark:text-amber-400 bg-amber-500/8", location: "Bahir Dar"   },
                          { id: "ECWC-G-056", type: "Grader",    status: "Operational", dot: "bg-[#70c82a]",  dotPulse: true,  badge: "text-[#70c82a] bg-[#70c82a]/8",                                        location: "Dire Dawa"   },
                          { id: "ECWC-L-023", type: "Loader",    status: "Down",        dot: "bg-red-500",   dotPulse: false, badge: "text-red-600 dark:text-red-400 bg-red-500/8",         location: "Kality"      },
                          { id: "ECWC-T-091", type: "Truck",     status: "Operational", dot: "bg-[#70c82a]",  dotPulse: true,  badge: "text-[#70c82a] bg-[#70c82a]/8",                                        location: "Semera"      },
                        ].map((row, i) => (
                          <motion.tr
                            key={row.id}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.15 + i * 0.08, duration: 0.4 }}
                            className={`border-b border-border/20 dark:border-zinc-800/30 last:border-0 transition-all duration-200 group cursor-default relative ${i % 2 === 0 ? '' : 'bg-muted/15 dark:bg-zinc-900/20'}`}
                          >
                            <td className="px-5 py-3 relative">
                              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#70c82a] scale-y-0 group-hover:scale-y-100 transition-transform duration-200 origin-top" />
                              <span className="text-[13px] font-semibold text-foreground group-hover:text-[#70c82a] transition-colors">{row.id}</span>
                            </td>
                            <td className="px-4 py-3 text-[13px] text-foreground font-normal">{row.type}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[12px] font-semibold ${row.badge}`}>
                                <span className="relative flex h-2 w-2">
                                  {row.dotPulse && <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${row.dot} opacity-50`} />}
                                  <span className={`relative inline-flex rounded-full h-2 w-2 ${row.dot}`} />
                                </span>
                                {row.status}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5 text-[13px] text-foreground/70">
                                <MapPin className="w-3 h-3 text-[#70c82a]/60 flex-shrink-0" />
                                {row.location}
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Footer CTA */}
                  <div className="relative z-10 flex items-center justify-between px-5 py-3 border-t border-border dark:border-zinc-800 bg-gradient-to-r from-muted/20 to-[#70c82a]/[0.04]">
                    <div className="flex items-center gap-2.5">
                      <div className="flex -space-x-1">
                        {['bg-[#70c82a]', 'bg-amber-400', 'bg-red-400'].map((c, i) => (
                          <div key={i} className={`w-4 h-4 rounded-full ${c} border-2 border-card dark:border-zinc-950`} />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">Showing <span className="font-bold text-foreground">5</span> of <span className="font-bold text-foreground">2,500+</span> assets</span>
                    </div>
                    <Link href="/sign-in" className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#70c82a] to-[#5ab523] hover:from-[#5ab523] hover:to-[#4a9e1d] text-xs font-bold text-black transition-all duration-300 shadow-md shadow-[#70c82a]/25 hover:shadow-lg hover:shadow-[#70c82a]/40 hover:-translate-y-0.5">
                      Access full register <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
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
      <section id="system-overview" className="relative py-10 lg:py-14 bg-gradient-to-b from-background via-muted/30 to-background dark:from-background dark:via-zinc-950 dark:to-black overflow-hidden">
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
            className="text-center mb-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#70c82a]/10 text-[#70c82a] text-xs font-bold uppercase tracking-widest mb-3 border border-[#70c82a]/20">
              <Play className="w-3.5 h-3.5" />
              System Overview
            </div>
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-foreground">
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
      <section id="features" className="pt-16 pb-12 lg:pt-24 lg:pb-16 bg-background dark:bg-black relative overflow-hidden scroll-mt-[4.5rem]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_15%,rgba(112,200,42,0.08),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_85%,rgba(112,200,42,0.06),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(112,200,42,0.03),transparent_70%)]" />
        <div className="absolute inset-0" style={{backgroundImage:"radial-gradient(circle,rgba(112,200,42,0.07) 1px,transparent 1px)",backgroundSize:"52px 52px"}} />
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#70c82a]/10 text-[#70c82a] text-xs font-bold uppercase tracking-widest mb-6 border border-[#70c82a]/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#70c82a] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#70c82a]" />
              </span>
              Enterprise Architecture
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
              Core <span className="text-[#70c82a]">Functional Areas</span>
            </h2>
            <div className="flex items-center justify-center gap-0 mt-8">
              {[
                { n: "01", id: "module-01" },
                { n: "02", id: "module-02" },
                { n: "03", id: "module-03" },
                { n: "04", id: "module-04" },
                { n: "05", id: "module-05" },
              ].map(({ n, id }, idx) => (
                <div key={idx} className="flex items-center">
                  <button
                    onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                    className="w-9 h-9 rounded-full bg-[#70c82a]/10 border border-[#70c82a]/30 flex items-center justify-center text-[11px] font-bold text-[#70c82a] hover:bg-[#70c82a]/25 hover:scale-110 transition-all duration-200 cursor-pointer select-none"
                  >
                    {n}
                  </button>
                  {idx < 4 && <div className="w-10 h-[1px] bg-gradient-to-r from-[#70c82a]/40 via-[#70c82a]/20 to-[#70c82a]/10" />}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Plant & Equipment Management - Left/Right with Table */}
          <div id="module-01" className="relative grid lg:grid-cols-2 gap-16 items-center mb-32">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="relative mb-6">
                <div className="flex items-center gap-4 relative">
                  <div className="relative flex-shrink-0">
                    <span className="text-6xl md:text-7xl font-black text-muted-foreground/15 leading-none tracking-tighter select-none">01</span>
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#70c82a]/10 text-[#70c82a] text-xs font-bold uppercase tracking-wider mb-2 border border-[#70c82a]/25">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#70c82a] animate-pulse" />
                      Module 01
                    </div>
                    <h3 className="text-3xl font-bold text-foreground">Asset & Fleet Management</h3>
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                Know every piece of equipment, where it is, and its condition.
              </p>
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-[2px] w-6 bg-gradient-to-r from-[#70c82a] to-transparent rounded-full" />
                  <h4 className="text-foreground font-semibold text-sm uppercase tracking-widest">What this module does</h4>
                </div>
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
                      className="flex items-center gap-3 group"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#70c82a] flex-shrink-0 group-hover:scale-110 transition-transform" />
                      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
              <div className="relative pl-5 pr-6 py-5 rounded-xl bg-gradient-to-br from-[#70c82a]/[0.07] to-[#70c82a]/[0.02] border border-[#70c82a]/20 overflow-hidden">
                <div className="absolute top-0 left-0 w-[3px] h-full bg-gradient-to-b from-[#70c82a] via-emerald-400 to-[#70c82a]/30 rounded-l-xl" />
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 rounded-full bg-[#70c82a]/15 border border-[#70c82a]/30 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-2.5 h-2.5 text-[#70c82a]" />
                  </div>
                  <h4 className="text-foreground font-semibold text-xs uppercase tracking-widest text-[#70c82a]">Real-World Scenario</h4>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed italic">
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
              <div className="absolute inset-0 bg-[#70c82a]/5 blur-3xl rounded-full transition-all duration-500 group-hover:opacity-150" />
              <div className="relative p-6 rounded-2xl bg-card dark:bg-zinc-950 border border-border dark:border-zinc-800 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#70c82a]/15 hover:border-[#70c82a]/35 cursor-default">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-border dark:border-zinc-800">
                  <div className="text-foreground font-bold">Equipment Registry Overview</div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#70c82a] text-black text-[10px] font-bold uppercase tracking-wider">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-40" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-black" />
                    </span>
                    Live Data
                  </div>
                </div>
                <div className="overflow-x-auto max-w-full">
                  <table className="w-full min-w-0 table-fixed md:table-auto">
                    <thead>
                      <tr className="border-b border-border dark:border-zinc-800 bg-muted/30 dark:bg-zinc-900/40">
                        <th className="text-left py-3 px-2 sm:px-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest w-[28%] md:w-auto">Asset ID</th>
                        <th className="text-left py-3 px-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Type</th>
                        <th className="text-left py-3 px-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Status</th>
                        <th className="text-right py-3 px-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest hidden md:table-cell">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { id: "ECWC-B-042", type: "Dozer", status: "Active", value: "Br 124.5K", color: "bg-[#70c82a]", leftBorder: "border-l-[3px] border-l-[#70c82a]", rowBg: "" },
                        { id: "ECWC-E-108", type: "Excavator", status: "Maint.", value: "Br 89.2K", color: "bg-amber-500", leftBorder: "border-l-[3px] border-l-amber-500", rowBg: "bg-amber-500/[0.04]" },
                        { id: "ECWC-G-056", type: "Grader", status: "Active", value: "Br 156K", color: "bg-[#70c82a]", leftBorder: "border-l-[3px] border-l-[#70c82a]", rowBg: "" },
                        { id: "ECWC-L-023", type: "Loader", status: "Critical", value: "Br 210.4K", color: "bg-red-500", leftBorder: "border-l-[3px] border-l-red-500", rowBg: "bg-red-500/[0.05]" },
                        { id: "ECWC-T-091", type: "Truck", status: "Active", value: "Br 78.3K", color: "bg-[#70c82a]", leftBorder: "border-l-[3px] border-l-[#70c82a]", rowBg: "" }
                      ].map((row, i) => (
                        <motion.tr
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.1 }}
                          className={`border-b border-border/50 dark:border-zinc-800/50 hover:bg-[#70c82a]/[0.04] transition-all duration-200 ${row.rowBg}`}
                        >
                          <td className={`py-3 px-3 text-sm font-mono font-bold text-foreground ${row.leftBorder}`}>{row.id}</td>
                          <td className="py-3 px-2 text-sm text-muted-foreground">{row.type}</td>
                          <td className="py-3 px-2">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              row.status === "Active" ? "bg-[#70c82a]/10 text-[#70c82a] border border-[#70c82a]/20" :
                              row.status === "Maint." ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                              "bg-red-500/10 text-red-500 border border-red-500/20"
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${row.color} ${row.status === "Active" ? "animate-pulse" : ""}`} />
                              {row.status}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-right text-sm font-semibold text-foreground hidden md:table-cell">{row.value}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-6 pt-4 border-t border-border dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Fleet Value</span>
                  <div className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-[#70c82a] to-emerald-400 bg-clip-text text-transparent">Br 12.4M</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Maintenance Management - Right/Left with KPI Grid */}
          <div id="module-02" className="relative grid lg:grid-cols-2 gap-16 items-center mb-32">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="order-2 lg:order-1 relative"
            >
              <div className="relative">
              <div className="absolute inset-0 bg-[#70c82a]/5 blur-3xl rounded-full pointer-events-none" />
              <div className="relative p-8 rounded-2xl bg-card dark:bg-zinc-950 border border-border dark:border-zinc-800 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#70c82a]/15 hover:border-[#70c82a]/35 cursor-default">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#70c82a]" />
                    <span className="text-foreground font-bold">Maintenance KPI Dashboard</span>
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">This Month</span>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    { label: "MTBF", value: "847h", trend: "+12%", icon: TrendingUp, gradient: "from-[#70c82a]/15", border: "border-l-[#70c82a]" },
                    { label: "MTTR", value: "4.2h", trend: "-8%", icon: Clock, gradient: "from-emerald-500/12", border: "border-l-emerald-400" },
                    { label: "Uptime", value: "94.3%", trend: "+2.1%", icon: CheckCircle, gradient: "from-[#70c82a]/20", border: "border-l-[#70c82a]" },
                    { label: "Preventive", value: "78%", trend: "+5%", icon: Shield, gradient: "from-[#70c82a]/12", border: "border-l-emerald-400" }
                  ].map((kpi, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className={`relative p-4 rounded-xl bg-gradient-to-br ${kpi.gradient} to-transparent dark:to-zinc-900/80 border border-[#70c82a]/20 border-l-[3px] ${kpi.border} overflow-hidden group hover:border-[#70c82a]/40 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#70c82a]/15 transition-all duration-300 cursor-default`}
                    >
                      <div className="absolute top-0 right-0 w-12 h-12 rounded-bl-2xl bg-[#70c82a]/5 flex items-end justify-end p-2">
                        <kpi.icon className="w-4 h-4 text-[#70c82a]/60" />
                      </div>
                      <div className="text-2xl font-bold text-foreground mb-1 leading-none">{kpi.value}</div>
                      <div className="text-[10px] text-muted-foreground uppercase font-semibold tracking-widest mb-2">{kpi.label}</div>
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#70c82a]/12 text-[#70c82a] text-[10px] font-semibold border border-[#70c82a]/20">{kpi.trend}</span>
                    </motion.div>
                  ))}
                </div>
                <div className="space-y-3 pt-2 border-t border-border/30 dark:border-zinc-800/50 hidden md:block">
                  {[
                    { label: "Work Orders This Month", value: 124, max: 150, barColor: "from-[#70c82a] to-emerald-400", glowColor: "shadow-[#70c82a]/40" },
                    { label: "Scheduled Maintenance", value: 89, max: 150, barColor: "from-[#70c82a] to-emerald-500", glowColor: "shadow-[#70c82a]/40" },
                    { label: "Emergency Responses", value: 12, max: 150, barColor: "from-red-500 to-red-400", glowColor: "shadow-red-500/40" }
                  ].map((bar, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">{bar.label}</span>
                        <span className="font-medium text-foreground">{bar.value} <span className="text-muted-foreground font-normal">/ {bar.max}</span></span>
                      </div>
                      <div className="h-3 bg-muted/50 dark:bg-zinc-800/80 rounded-full overflow-hidden border border-border/20">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${(bar.value / bar.max) * 100}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.2, delay: i * 0.2, ease: "easeOut" }}
                          className={`h-full bg-gradient-to-r ${bar.barColor} rounded-full shadow-sm ${bar.glowColor}`}
                        />
                      </div>
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
              <div className="relative mb-6">
                <div className="flex items-center gap-4 relative">
                  <div className="relative flex-shrink-0">
                    <span className="text-6xl md:text-7xl font-black text-muted-foreground/15 leading-none tracking-tighter select-none">02</span>
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#70c82a]/10 text-[#70c82a] text-xs font-bold uppercase tracking-wider mb-2 border border-[#70c82a]/25">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#70c82a] animate-pulse" />
                      Module 02
                    </div>
                    <h3 className="text-3xl font-bold text-foreground">Work Order Management</h3>
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                Plan, assign, and track all maintenance work in one place.
              </p>
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-[2px] w-6 bg-gradient-to-r from-[#70c82a] to-transparent rounded-full" />
                  <h4 className="text-foreground font-semibold text-sm uppercase tracking-widest">What this module does</h4>
                </div>
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
                      className="flex items-center gap-3 group"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#70c82a] flex-shrink-0 group-hover:scale-110 transition-transform" />
                      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
              <div className="relative pl-5 pr-6 py-5 rounded-xl bg-gradient-to-br from-[#70c82a]/[0.07] to-[#70c82a]/[0.02] border border-[#70c82a]/20 overflow-hidden">
                <div className="absolute top-0 left-0 w-[3px] h-full bg-gradient-to-b from-[#70c82a] via-emerald-400 to-[#70c82a]/30 rounded-l-xl" />
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 rounded-full bg-[#70c82a]/15 border border-[#70c82a]/30 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-2.5 h-2.5 text-[#70c82a]" />
                  </div>
                  <h4 className="text-foreground font-semibold text-xs uppercase tracking-widest text-[#70c82a]">Real-World Scenario</h4>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed italic">
                  A bulldozer reaches its scheduled service hours.
                  The system automatically creates a work order and notifies the workshop supervisor.
                  Tasks and safety checks are already listed, so the technician knows exactly what to do.
                  Maintenance is completed on time, preventing an unexpected breakdown on site.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Workforce & Time Sheet Management - Left/Right */}
          <div id="module-03" className="relative grid lg:grid-cols-2 gap-16 items-center mb-32">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="relative mb-6">
                <div className="flex items-center gap-4 relative">
                  <div className="relative flex-shrink-0">
                    <span className="text-6xl md:text-7xl font-black text-muted-foreground/15 leading-none tracking-tighter select-none">03</span>
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#70c82a]/10 text-[#70c82a] text-xs font-bold uppercase tracking-wider mb-2 border border-[#70c82a]/25">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#70c82a] animate-pulse" />
                      Module 03
                    </div>
                    <h3 className="text-3xl font-bold text-foreground">Workforce & Time Management</h3>
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                Track technician work time, productivity, and labor cost.
              </p>
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-[2px] w-6 bg-gradient-to-r from-[#70c82a] to-transparent rounded-full" />
                  <h4 className="text-foreground font-semibold text-sm uppercase tracking-widest">What this module does</h4>
                </div>
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
                      className="flex items-center gap-3 group"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#70c82a] flex-shrink-0 group-hover:scale-110 transition-transform" />
                      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
              <div className="relative pl-5 pr-6 py-5 rounded-xl bg-gradient-to-br from-[#70c82a]/[0.07] to-[#70c82a]/[0.02] border border-[#70c82a]/20 overflow-hidden">
                <div className="absolute top-0 left-0 w-[3px] h-full bg-gradient-to-b from-[#70c82a] via-emerald-400 to-[#70c82a]/30 rounded-l-xl" />
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 rounded-full bg-[#70c82a]/15 border border-[#70c82a]/30 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-2.5 h-2.5 text-[#70c82a]" />
                  </div>
                  <h4 className="text-foreground font-semibold text-xs uppercase tracking-widest text-[#70c82a]">Real-World Scenario</h4>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed italic">
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
              <div className="relative">
              <div className="absolute inset-0 bg-[#70c82a]/5 blur-3xl rounded-full pointer-events-none" />
              <div className="relative p-8 rounded-2xl bg-card dark:bg-zinc-950 border border-border dark:border-zinc-800 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#70c82a]/15 hover:border-[#70c82a]/35 cursor-default">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#70c82a]" />
                    <span className="text-foreground font-bold">Weekly Workforce Analytics</span>
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">This Week</span>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    { label: "Total Hours", value: "1,247", icon: Clock, color: "text-[#70c82a]", gradient: "from-[#70c82a]/15", border: "border-[#70c82a]/25" },
                    { label: "Overtime", value: "89h", icon: TrendingUp, color: "text-amber-500", gradient: "from-amber-500/15", border: "border-amber-500/25" },
                    { label: "Technicians", value: "42", icon: Users, color: "text-blue-500", gradient: "from-blue-500/15", border: "border-blue-500/25" }
                  ].map((stat, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className={`p-4 rounded-xl bg-gradient-to-br ${stat.gradient} to-transparent dark:to-zinc-900/80 border ${stat.border} text-center hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-default`}
                    >
                      <stat.icon className={`w-5 h-5 ${stat.color} mx-auto mb-2`} />
                      <div className={`text-2xl font-black ${stat.color} mb-0.5`}>{stat.value}</div>
                      <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
                <div className="space-y-2 mb-6">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Productivity by Shift</div>
                  {[
                    { shift: "Morning Shift", hours: 428, productivity: 96, color: "bg-[#70c82a]", textColor: "text-[#70c82a]", borderColor: "border-l-[#70c82a]", gradient: "from-[#70c82a]/10" },
                    { shift: "Day Shift", hours: 512, productivity: 88, color: "bg-blue-500", textColor: "text-blue-400", borderColor: "border-l-blue-500", gradient: "from-blue-500/10" },
                    { shift: "Night Shift", hours: 307, productivity: 82, color: "bg-amber-500", textColor: "text-amber-400", borderColor: "border-l-amber-500", gradient: "from-amber-500/10" }
                  ].map((shift, i) => (
                    <div key={i} className={`p-3 rounded-xl bg-gradient-to-r ${shift.gradient} to-transparent dark:to-zinc-900/60 border border-border/50 border-l-[3px] ${shift.borderColor} hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 cursor-default`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-foreground font-semibold">{shift.shift}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground">{shift.hours}h</span>
                          <span className={`text-sm font-black ${shift.textColor}`}>{shift.productivity}%</span>
                        </div>
                      </div>
                      <div className="h-2.5 bg-muted/40 dark:bg-zinc-800/60 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${shift.productivity}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.2, delay: i * 0.2, ease: "easeOut" }}
                          className={`h-full ${shift.color} rounded-full shadow-sm`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-border/40 dark:border-zinc-800 flex justify-between items-center">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Labor Cost This Week</span>
                  <div className="text-2xl font-black bg-gradient-to-r from-[#70c82a] to-emerald-400 bg-clip-text text-transparent">Br 47,850</div>
                </div>
              </div>
              </div>
            </motion.div>
          </div>

          {/* Spare Parts & Inventory Control - Right/Left */}
          <div id="module-04" className="relative grid lg:grid-cols-2 gap-16 items-center mb-32">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="order-2 lg:order-1 relative"
            >
              <div className="absolute inset-0 bg-[#70c82a]/5 blur-3xl rounded-full pointer-events-none" />
              <div className="relative p-8 rounded-2xl bg-card dark:bg-zinc-950 border border-border dark:border-zinc-800 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#70c82a]/15 hover:border-[#70c82a]/35 cursor-default">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-foreground font-bold">Inventory Status Overview</span>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#70c82a] text-black text-[10px] font-bold uppercase tracking-wider">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-40" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-black" />
                    </span>
                    Live
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    { label: "Total SKUs", value: "2,847", trend: "+12", color: "text-[#70c82a]", gradient: "from-[#70c82a]/15", border: "border-[#70c82a]/25", shadow: "shadow-[#70c82a]/20", icon: Database },
                    { label: "In Stock", value: "2,681", trend: "+8", color: "text-[#70c82a]", gradient: "from-[#70c82a]/12", border: "border-[#70c82a]/20", shadow: "shadow-[#70c82a]/15", icon: CheckCircle2 },
                    { label: "Low Stock", value: "124", trend: "+4", color: "text-amber-500", gradient: "from-amber-500/15", border: "border-amber-500/25", shadow: "shadow-amber-500/20", icon: AlertTriangle },
                    { label: "Out of Stock", value: "42", trend: "-3", color: "text-red-500", gradient: "from-red-500/15", border: "border-red-500/25", shadow: "shadow-red-500/20", icon: X }
                  ].map((stat, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className={`p-4 rounded-xl bg-gradient-to-br ${stat.gradient} to-transparent dark:to-zinc-900/80 border ${stat.border} shadow-lg ${stat.shadow} hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 cursor-default`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <stat.icon className={`w-4 h-4 ${stat.color}`} />
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                          stat.trend.startsWith('+') ? 'bg-[#70c82a]/10 text-[#70c82a]' : 'bg-red-500/10 text-red-500'
                        }`}>{stat.trend}</span>
                      </div>
                      <div className={`text-2xl font-black ${stat.color} mb-0.5`}>{stat.value}</div>
                      <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
                <div className="mb-2">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Recent Parts Issued</div>
                  <div className="space-y-2">
                    {[
                      { part: "Hydraulic Filter HF-208", qty: "12", wo: "WO-2847", cost: "Br 1,240" },
                      { part: "Engine Oil 15W-40 (Drum)", qty: "8", wo: "WO-2851", cost: "Br 2,880" },
                      { part: "Air Filter Element AF-501", qty: "24", wo: "WO-2856", cost: "Br 960" },
                    
                    ].map((issue, i) => (
                      <div key={i} className="relative flex items-center gap-3 p-3 rounded-lg bg-card/30 dark:bg-zinc-900/40 border border-border/50 dark:border-zinc-800 text-xs hover:border-[#70c82a]/35 hover:bg-[#70c82a]/[0.05] hover:-translate-y-0.5 hover:shadow-md hover:shadow-[#70c82a]/10 transition-all duration-300 cursor-default overflow-hidden">
                        <div className="absolute top-0 left-0 w-[2px] h-full bg-gradient-to-b from-[#70c82a] to-[#70c82a]/20" />
                        <div className="w-7 h-7 rounded-lg bg-[#70c82a]/10 border border-[#70c82a]/20 flex items-center justify-center flex-shrink-0">
                          <Cog className="w-3.5 h-3.5 text-[#70c82a]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-foreground font-semibold truncate mb-1">{issue.part}</div>
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 rounded-full bg-[#70c82a]/10 text-[#70c82a] font-black text-[9px] border border-[#70c82a]/20">QTY {issue.qty}</span>
                            <span className="text-muted-foreground">{issue.wo}</span>
                          </div>
                        </div>
                        <div className="text-foreground font-semibold flex-shrink-0">{issue.cost}</div>
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
              <div className="relative mb-6">
                <div className="flex items-center gap-4 relative">
                  <div className="relative flex-shrink-0">
                    <span className="text-6xl md:text-7xl font-black text-muted-foreground/15 leading-none tracking-tighter select-none">04</span>
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#70c82a]/10 text-[#70c82a] text-xs font-bold uppercase tracking-wider mb-2 border border-[#70c82a]/25">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#70c82a] animate-pulse" />
                      Module 04
                    </div>
                    <h3 className="text-3xl font-bold text-foreground">Inventory Management</h3>
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                Always know what spare parts you have and what you need.
              </p>
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-[2px] w-6 bg-gradient-to-r from-[#70c82a] to-transparent rounded-full" />
                  <h4 className="text-foreground font-semibold text-sm uppercase tracking-widest">What this module does</h4>
                </div>
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
                      className="flex items-center gap-3 group"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#70c82a] flex-shrink-0 group-hover:scale-110 transition-transform" />
                      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
              <div className="relative pl-5 pr-6 py-5 rounded-xl bg-gradient-to-br from-[#70c82a]/[0.07] to-[#70c82a]/[0.02] border border-[#70c82a]/20 overflow-hidden">
                <div className="absolute top-0 left-0 w-[3px] h-full bg-gradient-to-b from-[#70c82a] via-emerald-400 to-[#70c82a]/30 rounded-l-xl" />
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 rounded-full bg-[#70c82a]/15 border border-[#70c82a]/30 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-2.5 h-2.5 text-[#70c82a]" />
                  </div>
                  <h4 className="text-foreground font-semibold text-xs uppercase tracking-widest text-[#70c82a]">Real-World Scenario</h4>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed italic">
                  A work order requires hydraulic filters.
                  Before maintenance starts, the system checks the store and reserves the parts.
                  When stock goes below minimum, the storekeeper receives an alert to reorder.
                  This prevents delays and emergency purchases.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Executive Dashboards & Reports - Right/Left */}
          <div id="module-05" className="relative grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="order-2 lg:order-1 relative"
            >
              <div className="absolute inset-0 bg-[#70c82a]/8 blur-3xl rounded-full pointer-events-none" />
              <div className="relative p-8 rounded-2xl bg-gradient-to-br from-[#70c82a]/8 via-card to-card dark:via-zinc-950 dark:to-zinc-950 border border-[#70c82a]/30 shadow-xl shadow-[#70c82a]/5 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#70c82a]/20 hover:border-[#70c82a]/50 cursor-default">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#70c82a]/60 to-transparent rounded-t-2xl" />
                <div className="flex items-center justify-between mb-6">
                  <div className="text-foreground font-bold text-lg">Executive Command Center</div>
                  <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#70c82a]/10 border border-[#70c82a]/20 text-[10px] font-bold text-[#70c82a] uppercase tracking-wider">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#70c82a] opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#70c82a]" />
                    </span>
                    Live
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Site Performance Comparison - Vertical Bar Chart */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-[#70c82a]/8 to-transparent dark:to-zinc-900/60 border border-[#70c82a]/20 hover:border-[#70c82a]/40 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#70c82a]/10 transition-all duration-300 cursor-default">
                    <div className="flex items-center gap-2 mb-5">
                      <BarChart3 className="w-3.5 h-3.5 text-[#70c82a]" />
                      <span className="text-xs font-semibold text-foreground">Site Performance</span>
                    </div>
                    <div className="relative pt-6 pb-2">
                      <div className="flex items-end justify-center gap-4 h-20">
                        {[
                          { site: "Addis Ababa", value: 94, color: "from-[#70c82a] to-emerald-400" },
                          { site: "Dire Dawa", value: 23, color: "from-red-500 to-red-400" },
                          { site: "Bahir Dar", value: 55, color: "from-amber-500 to-amber-400" }
                        ].map((item, j) => (
                          <div key={j} className="flex flex-col items-center gap-2 flex-1 max-w-[90px]">
                            <div className="relative w-full h-20 flex items-end justify-center">
                              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-muted-foreground whitespace-nowrap z-10">
                                {item.value}%
                              </div>
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                whileInView={{ height: `${item.value}%`, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 1, delay: j * 0.15, ease: "easeOut" }}
                                className={`w-full bg-gradient-to-t ${item.color} rounded-t-lg shadow-lg`}
                                style={{ minHeight: '8px' }}
                              />
                            </div>
                            <span className="text-[10px] text-muted-foreground font-semibold text-center leading-tight">{item.site}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Monthly Cost Trends - Line Chart */}
                  <div className="p-4 rounded-xl bg-card/50 dark:bg-zinc-900/50 border border-border dark:border-zinc-800 hover:border-[#70c82a]/40 hover:bg-[#70c82a]/5 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#70c82a]/10 transition-all duration-300 cursor-default">
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
                  <div className="p-4 rounded-xl bg-card/50 dark:bg-zinc-900/50 border border-border/60 dark:border-zinc-800 hover:border-[#70c82a]/40 hover:bg-[#70c82a]/5 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#70c82a]/10 transition-all duration-300 cursor-default">
                    <div className="flex items-center gap-2 mb-4">
                      <Database className="w-3.5 h-3.5 text-[#70c82a]" />
                      <span className="text-xs font-semibold text-foreground">Inventory Valuation</span>
                    </div>
                    <div className="flex items-center justify-between gap-4 h-24">
                      {[
                        { quarter: "Q1", value: 78, color: "#70c82a", textColor: "#70c82a" },
                        { quarter: "Q2", value: 85, color: "#f59e0b", textColor: "#f59e0b" },
                        { quarter: "Q3", value: 92, color: "#3b82f6", textColor: "#3b82f6" }
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
                                <text x="50" y="57" textAnchor="middle" dominantBaseline="middle" className="text-[8px] font-semibold" fill={item.textColor}>
                                  Br {item.value}K
                                </text>
                              </svg>
                            </div>
                            <span className="text-xs font-bold" style={{ color: item.textColor }}>{item.quarter}: Br {item.value}K</span>
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
              <div className="relative mb-6">
                <div className="flex items-center gap-4 relative">
                  <div className="relative flex-shrink-0">
                    <span className="text-6xl md:text-7xl font-black text-muted-foreground/15 leading-none tracking-tighter select-none">05</span>
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#70c82a]/10 text-[#70c82a] text-xs font-bold uppercase tracking-wider mb-2 border border-[#70c82a]/25">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#70c82a] animate-pulse" />
                      Module 05
                    </div>
                    <h3 className="text-3xl font-bold text-foreground">Executive Dashboard & Reporting</h3>
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                See the full operation at a glance.
              </p>
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-[2px] w-6 bg-gradient-to-r from-[#70c82a] to-transparent rounded-full" />
                  <h4 className="text-foreground font-semibold text-sm uppercase tracking-widest">What this module does</h4>
                </div>
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
                      className="flex items-center gap-3 group"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#70c82a] flex-shrink-0 group-hover:scale-110 transition-transform" />
                      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
              <div className="relative pl-5 pr-6 py-5 rounded-xl bg-gradient-to-br from-[#70c82a]/[0.07] to-[#70c82a]/[0.02] border border-[#70c82a]/20 overflow-hidden">
                <div className="absolute top-0 left-0 w-[3px] h-full bg-gradient-to-b from-[#70c82a] via-emerald-400 to-[#70c82a]/30 rounded-l-xl" />
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 rounded-full bg-[#70c82a]/15 border border-[#70c82a]/30 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-2.5 h-2.5 text-[#70c82a]" />
                  </div>
                  <h4 className="text-foreground font-semibold text-xs uppercase tracking-widest text-[#70c82a]">Real-World Scenario</h4>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed italic">
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
      <section id="ai-support" className="py-32 bg-background dark:bg-zinc-950 relative overflow-hidden scroll-mt-[4.5rem]">
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
                desc: "Uses previous breakdown records and maintenance history to identify equipment that frequently fails. Assets with repeated repairs are flagged for preventive maintenance."
              },
              {
                icon: Zap,
                title: " preventive maintenance actions",
                metric: "2.4x",
                label: "ROI Improvement",
                desc: "Maintenance schedules are created based on usage hours, time intervals, or past service records to reduce unexpected breakdowns and improve equipment availability."
              },
              {
                icon: AlertTriangle,
                title: "Identify abnormal maintenance ",
                metric: "Br 47K",
                label: "Cost Saved/Month",
                desc: "Compares current maintenance costs with past records to highlight equipment that is costing more than usual. Helps management take corrective action early."
              }
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                whileHover={{ y: -4 }}
                className="relative p-6 rounded-2xl bg-card/50 dark:bg-zinc-900/50 border border-border dark:border-zinc-800 hover:border-[#70c82a]/40 hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/30 transition-all duration-300 group overflow-hidden"
              >
                {/* subtle top accent line that fills on hover */}
                <div className="absolute top-0 left-0 h-[2px] w-0 group-hover:w-full bg-gradient-to-r from-[#70c82a]/60 to-[#70c82a]/20 transition-all duration-500 rounded-t-2xl" />
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-[#70c82a]/10 group-hover:bg-[#70c82a]/15 flex items-center justify-center border border-[#70c82a]/20 group-hover:border-[#70c82a]/35 transition-colors duration-300">
                    <card.icon className="w-6 h-6 text-[#70c82a]" />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-foreground group-hover:text-[#70c82a] transition-colors duration-300">{card.metric}</div>
                    <div className="text-[10px] text-muted-foreground uppercase font-bold">{card.label}</div>
                  </div>
                </div>
                <h4 className="text-foreground font-bold text-lg mb-3">{card.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{card.desc}</p>
              </motion.div>
            ))}
          </div>

        

          {/* AI Chat Assistant - Phone + Tablet */}
          <div className="mt-16 flex flex-col xl:flex-row items-start justify-center gap-8">

            {/* ── Portrait Phone ── */}
            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="flex-shrink-0 w-full max-w-[280px] mx-auto xl:mx-0">
              <div className="relative">
                <div className="absolute -inset-3 rounded-[3.5rem] bg-[#70c82a]/20 dark:bg-[#70c82a]/30 blur-2xl" />
                {/* frame */}
                <div className="relative rounded-[3rem] border-[7px] border-gray-900 dark:border-zinc-700 bg-gray-900 dark:bg-zinc-800 shadow-2xl overflow-hidden flex flex-col" style={{ height: 480 }}>
                  {/* side buttons */}
                  <div className="absolute -left-[9px] top-[90px] w-[5px] h-7 bg-gray-700 dark:bg-zinc-600 rounded-l-md" />
                  <div className="absolute -left-[9px] top-[126px] w-[5px] h-10 bg-gray-700 dark:bg-zinc-600 rounded-l-md" />
                  <div className="absolute -left-[9px] top-[148px] w-[5px] h-10 bg-gray-700 dark:bg-zinc-600 rounded-l-md" />
                  <div className="absolute -right-[9px] top-[120px] w-[5px] h-14 bg-gray-700 dark:bg-zinc-600 rounded-r-md" />
                  {/* screen */}
                  <div className="flex-1 bg-white dark:bg-zinc-950 rounded-[2.2rem] m-1 overflow-hidden flex flex-col">
                    {/* notch */}
                    <div className="relative flex justify-center">
                      <div className="absolute top-0 w-20 h-5 bg-gray-900 dark:bg-zinc-800 rounded-b-2xl z-10 flex items-center justify-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-700 dark:bg-zinc-600" />
                        <div className="w-2 h-2 rounded-full bg-gray-800 dark:bg-zinc-700 border border-gray-600 dark:border-zinc-500" />
                      </div>
                    </div>
                    {/* combined header row */}
                    <div className="flex items-center gap-2 px-3 pt-7 pb-2 bg-gradient-to-r from-gray-900 to-gray-800 dark:from-zinc-800 dark:to-zinc-900 border-b border-gray-700 dark:border-zinc-700">
                      <div className="w-7 h-7 rounded-full bg-[#70c82a]/20 border border-[#70c82a]/50 flex items-center justify-center flex-shrink-0">
                        <Cpu className="w-3.5 h-3.5 text-[#70c82a]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-black text-white leading-none">ECWC AI Assistant</p>
                        <p className="text-[9px] text-zinc-400">Online • Ready to help</p>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-[#70c82a] animate-pulse flex-shrink-0" />
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="text-[9px] font-bold text-zinc-400">9:41</span>
                        <div className="flex gap-px items-end h-2.5">{[2,3,4,5].map(h => <div key={h} className="w-0.5 bg-zinc-400 rounded-sm" style={{height: h*2}} />)}</div>
                        <div className="w-3 h-1.5 border border-zinc-500 rounded-sm relative"><div className="absolute inset-y-0.5 left-0.5 right-0 bg-zinc-400 rounded-sm" /></div>
                      </div>
                    </div>
                    {/* messages */}
                    <div className="flex-1 bg-gray-50 dark:bg-zinc-900 px-3 py-2 space-y-2 overflow-hidden">
                      {/* CEO morning briefing */}
                      <div className="flex justify-end items-end gap-1.5">
                        <div className="bg-gray-100 dark:bg-zinc-700 text-gray-900 dark:text-white text-[10px] font-medium leading-relaxed px-3 py-1.5 rounded-2xl rounded-tr-sm max-w-[82%] shadow-sm border border-gray-200 dark:border-zinc-600">
                          Give me today's executive summary
                        </div>
                        <div className="w-5 h-5 rounded-full bg-gray-300 dark:bg-zinc-600 flex items-center justify-center flex-shrink-0">
                          <User className="w-3 h-3 text-gray-600 dark:text-zinc-300" />
                        </div>
                      </div>
                      <div className="flex gap-2 items-end">
                        <div className="w-5 h-5 rounded-full bg-[#70c82a]/15 dark:bg-[#70c82a]/20 border border-[#70c82a]/40 flex items-center justify-center flex-shrink-0">
                          <Cpu className="w-2.5 h-2.5 text-[#70c82a]" />
                        </div>
                        <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-[10px] text-gray-700 dark:text-zinc-200 leading-relaxed px-3 py-1.5 rounded-2xl rounded-tl-sm shadow-sm max-w-[80%]">
                          <span className="font-bold text-gray-900 dark:text-white">2 critical alerts</span> need action. Fleet availability <span className="font-bold text-gray-900 dark:text-white">94.3%</span>, up 1.8% vs last month.
                        </div>
                      </div>
                      {/* KPI summary card */}
                      <div className="flex gap-2 items-end">
                        <div className="w-5 flex-shrink-0" />
                        <div className="flex-1 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl rounded-tl-sm px-3 py-2 shadow-sm">
                          <p className="text-[8px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-2">Fleet Availability by Site</p>
                          <div className="space-y-1.5">
                            {[
                              { site: "Addis Ababa", pct: 94, color: "#70c82a", label: "94%" },
                              { site: "Bahir Dar",   pct: 88, color: "#70c82a", label: "88%" },
                              { site: "Dire Dawa",   pct: 71, color: "#ef4444", label: "71% ⚠" },
                            ].map((s) => (
                              <div key={s.site}>
                                <div className="flex justify-between mb-0.5">
                                  <span className="text-[9px] text-gray-600 dark:text-zinc-400 font-medium">{s.site}</span>
                                  <span className="text-[9px] font-bold" style={{ color: s.color }}>{s.label}</span>
                                </div>
                                <div className="h-1.5 bg-gray-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                                  <motion.div initial={{ width: 0 }} whileInView={{ width: `${s.pct}%` }} viewport={{ once: true }} transition={{ duration: 0.9, delay: 0.3 }} className="h-full rounded-full" style={{ backgroundColor: s.color }} />
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-2 pt-1.5 border-t border-gray-100 dark:border-zinc-700 flex justify-between items-center">
                            <span className="text-[8px] text-gray-400 dark:text-zinc-500">Top risk: Loader ECWC-L-023</span>
                            <span className="text-[8px] font-black text-red-500">Critical</span>
                          </div>
                        </div>
                      </div>
                      {chatUserMessages.map((msg) => (
                        <div key={msg.id} className="space-y-1.5">
                          <div className="flex justify-end items-end gap-1.5">
                            <div className="bg-gray-100 dark:bg-zinc-700 text-gray-900 dark:text-white text-[10px] px-3 py-1.5 rounded-2xl rounded-tr-sm max-w-[82%] border border-gray-200 dark:border-zinc-600">{msg.text}</div>
                            <div className="w-5 h-5 rounded-full bg-gray-300 dark:bg-zinc-600 flex items-center justify-center flex-shrink-0"><User className="w-3 h-3 text-gray-600 dark:text-zinc-300" /></div>
                          </div>
                          <div className="flex gap-2 items-end">
                            <div className="w-5 h-5 rounded-full bg-[#70c82a]/15 dark:bg-[#70c82a]/20 border border-[#70c82a]/40 flex items-center justify-center flex-shrink-0"><Cpu className="w-2.5 h-2.5 text-[#70c82a]" /></div>
                            <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-[10px] text-gray-500 dark:text-zinc-400 px-3 py-1.5 rounded-2xl rounded-tl-sm shadow-sm max-w-[80%]">Coming soon…</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* input */}
                    <div className="flex gap-2 items-center px-3 py-2 bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800">
                      <input type="text" placeholder="Ask a question…" value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { const t = chatInput.trim(); if (t) { chatMessageIdRef.current += 1; setChatUserMessages(m => [...m, { id: chatMessageIdRef.current, text: t }]); setChatInput('') } } }}
                        className="flex-1 rounded-full border border-gray-200 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-800 px-3 py-1.5 text-[10px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#70c82a]/40" />
                      <button type="button" onClick={() => { const t = chatInput.trim(); if (t) { chatMessageIdRef.current += 1; setChatUserMessages(m => [...m, { id: chatMessageIdRef.current, text: t }]); setChatInput('') } }}
                        className="w-8 h-8 rounded-full bg-[#70c82a] hover:bg-[#5ab523] text-white flex items-center justify-center flex-shrink-0 transition-colors shadow-md">
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {/* home bar */}
                    <div className="flex justify-center py-1.5 bg-white dark:bg-zinc-950"><div className="w-16 h-1 bg-gray-300 dark:bg-zinc-600 rounded-full" /></div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ── Landscape Tablet (desktop / large tablet only) ── */}
            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="hidden lg:flex flex-1 w-full max-w-[780px] min-w-0 mx-auto lg:mx-0">
              <div className="relative">
                <div className="absolute -inset-3 rounded-[2rem] bg-[#70c82a]/15 dark:bg-[#70c82a]/25 blur-2xl" />
                {/* tablet frame */}
                <div className="relative rounded-[1.8rem] border-[8px] border-gray-900 dark:border-zinc-700 bg-gray-900 dark:bg-zinc-800 shadow-2xl overflow-hidden" style={{ height: 480 }}>
                  {/* camera dot */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-gray-700 dark:bg-zinc-600 z-10" />
                  {/* home bar right side */}
                  <div className="absolute right-1.5 top-1/2 -translate-y-1/2 w-1 h-12 bg-gray-700 dark:bg-zinc-600 rounded-full z-10" />
                  {/* screen */}
                  <div className="bg-white dark:bg-zinc-950 rounded-[1.2rem] m-1 overflow-hidden flex flex-col" style={{ height: 'calc(100% - 8px)' }}>
                    {/* tablet header — dark like mobile */}
                    <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-gray-900 to-gray-800 dark:from-zinc-800 dark:to-zinc-900 border-b border-gray-700 dark:border-zinc-700 flex-shrink-0">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#70c82a]/20 border border-[#70c82a]/50 flex items-center justify-center flex-shrink-0">
                          <Cpu className="w-3.5 h-3.5 text-[#70c82a]" />
                        </div>
                        <div>
                          <p className="text-[11px] font-black text-white leading-none">ECWC AI Assistant</p>
                          <p className="text-[9px] text-zinc-400">Online • Ready to help</p>
                        </div>
                        <span className="w-2 h-2 rounded-full bg-[#70c82a] animate-pulse ml-1" />
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] text-zinc-500">9:41 AM</span>
                        <div className="flex gap-px items-end h-3">{[2,3,4,5].map(h => <div key={h} className="w-0.5 bg-zinc-500 rounded-sm" style={{height: h*2}} />)}</div>
                        <div className="w-4 h-2 border border-zinc-500 rounded-sm relative"><div className="absolute inset-y-0.5 left-0.5 right-1 bg-zinc-500 rounded-sm" /></div>
                      </div>
                    </div>
                    {/* split layout */}
                    <div className="flex flex-col flex-1 overflow-hidden">
                      <div className="flex flex-1 overflow-hidden">
                      {/* LEFT: chat + fleet status */}
                      <div className="w-[48%] flex flex-col border-r border-gray-100 dark:border-zinc-800">
                        {/* messages — scrollable */}
                        <div className="flex-1 bg-gray-50 dark:bg-zinc-900 px-3 py-3 space-y-2.5 overflow-y-auto">
                          <div className="flex justify-end items-end gap-1.5">
                            <div className="bg-gray-100 dark:bg-zinc-700 text-gray-900 dark:text-white text-[10px] font-medium px-3 py-1.5 rounded-2xl rounded-tr-sm max-w-[85%] shadow-sm leading-relaxed border border-gray-200 dark:border-zinc-600">
                              Which equipment is at highest risk of failure?
                            </div>
                            <div className="w-5 h-5 rounded-full bg-gray-300 dark:bg-zinc-600 flex items-center justify-center flex-shrink-0"><User className="w-3 h-3 text-gray-600 dark:text-zinc-300" /></div>
                          </div>
                          <div className="flex gap-1.5 items-end">
                            <div className="w-5 h-5 rounded-full bg-[#70c82a]/15 dark:bg-[#70c82a]/20 border border-[#70c82a]/40 flex items-center justify-center flex-shrink-0"><Cpu className="w-2.5 h-2.5 text-[#70c82a]" /></div>
                            <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-[10px] text-gray-700 dark:text-zinc-200 px-3 py-1.5 rounded-2xl rounded-tl-sm shadow-sm leading-relaxed max-w-[82%]">
                              <span className="font-bold text-gray-900 dark:text-white">Loader ECWC-L-023</span> seal replacement overdue 45 days. <span className="font-bold text-gray-900 dark:text-white">Excavator ECWC-E-108</span> engine temp 18% above threshold. Details on right →
                            </div>
                          </div>
                          <div className="flex justify-end items-end gap-1.5">
                            <div className="bg-gray-100 dark:bg-zinc-700 text-gray-900 dark:text-white text-[10px] font-medium px-3 py-1.5 rounded-2xl rounded-tr-sm max-w-[85%] shadow-sm leading-relaxed border border-gray-200 dark:border-zinc-600">
                              Show equipment down more than 30 days
                            </div>
                            <div className="w-5 h-5 rounded-full bg-gray-300 dark:bg-zinc-600 flex items-center justify-center flex-shrink-0"><User className="w-3 h-3 text-gray-600 dark:text-zinc-300" /></div>
                          </div>
                          <div className="flex gap-1.5 items-end">
                            <div className="w-5 h-5 rounded-full bg-[#70c82a]/15 dark:bg-[#70c82a]/20 border border-[#70c82a]/40 flex items-center justify-center flex-shrink-0"><Cpu className="w-2.5 h-2.5 text-[#70c82a]" /></div>
                            <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-[10px] text-gray-700 dark:text-zinc-200 px-3 py-1.5 rounded-2xl rounded-tl-sm shadow-sm leading-relaxed max-w-[82%]">
                              <span className="font-bold text-gray-900 dark:text-white">2 units</span> have been down over 30 days. Combined idle cost: <span className="font-bold text-gray-900 dark:text-white">Br 109,000</span>
                            </div>
                          </div>
                          {/* Extended downtime equipment card */}
                          <div className="flex gap-1.5 items-start">
                            <div className="w-5 h-5 flex-shrink-0" />
                            <div className="flex-1 bg-white dark:bg-zinc-800 border border-red-200 dark:border-red-800/40 rounded-2xl rounded-tl-sm shadow-sm px-2.5 py-2">
                              <p className="text-[8px] font-black text-gray-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5">Extended Downtime — 30+ Days</p>
                              <div className="space-y-1.5">
                                {[
                                  { id: "ECWC-L-023", type: "Loader",    days: 45, cost: "Br 78K", site: "Kality" },
                                  { id: "ECWC-E-108", type: "Excavator", days: 38, cost: "Br 31K", site: "Bahir Dar" },
                                ].map((eq) => (
                                  <div key={eq.id} className="flex items-center justify-between bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-800/30 rounded-lg px-2 py-1.5">
                                    <div>
                                      <p className="text-[8px] font-bold text-gray-800 dark:text-zinc-200 leading-none">{eq.type} · {eq.site}</p>
                                      <p className="text-[7px] text-gray-400 dark:text-zinc-500 mt-0.5">{eq.id}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-[9px] font-black text-red-500">{eq.days}d down</p>
                                      <p className="text-[7px] text-gray-400 dark:text-zinc-500">{eq.cost} idle cost</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                          {chatUserMessages2.map((msg) => (
                            <div key={msg.id} className="space-y-1.5">
                              <div className="flex justify-end items-end gap-1.5">
                                <div className="bg-gray-100 dark:bg-zinc-700 text-gray-900 dark:text-white text-[10px] px-3 py-1.5 rounded-2xl rounded-tr-sm max-w-[85%] border border-gray-200 dark:border-zinc-600">{msg.text}</div>
                                <div className="w-5 h-5 rounded-full bg-gray-300 dark:bg-zinc-600 flex items-center justify-center flex-shrink-0"><User className="w-3 h-3 text-gray-600 dark:text-zinc-300" /></div>
                              </div>
                              <div className="flex gap-1.5 items-end">
                                <div className="w-5 h-5 rounded-full bg-[#70c82a]/15 dark:bg-[#70c82a]/20 border border-[#70c82a]/40 flex items-center justify-center flex-shrink-0"><Cpu className="w-2.5 h-2.5 text-[#70c82a]" /></div>
                                <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-[10px] text-gray-500 dark:text-zinc-400 px-3 py-1.5 rounded-2xl rounded-tl-sm shadow-sm max-w-[82%]">Coming soon…</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* RIGHT: data panel */}
                      <div className="flex-1 bg-white dark:bg-zinc-950 overflow-hidden">
                        <div className="h-full overflow-y-auto px-4 py-3 space-y-3">
                          <p className="text-[9px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest">AI Failure Risk Analysis</p>
                          <div className="space-y-2">
                            {/* Critical risk card */}
                            <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-semibold text-gray-800 dark:text-zinc-200">ECWC-L-023 · Loader</span>
                                <span className="text-[9px] font-semibold text-red-500 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 px-2 py-0.5 rounded-full">High Risk</span>
                              </div>
                              <div className="h-1.5 bg-gray-200 dark:bg-zinc-700 rounded-full overflow-hidden mb-1.5">
                                <motion.div initial={{ width: 0 }} whileInView={{ width: '91%' }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.3 }} className="h-full bg-red-400 rounded-full" />
                              </div>
                              <p className="text-[9px] text-gray-500 dark:text-zinc-400 leading-relaxed">Seal replacement overdue 45 days. Failure probability: <span className="font-medium text-gray-700 dark:text-zinc-300">91%</span> within 2 weeks.</p>
                              <p className="text-[9px] text-gray-500 dark:text-zinc-400 mt-1">Reactive cost if failed: <span className="font-semibold text-gray-700 dark:text-zinc-300">Br 78,000</span></p>
                            </div>
                            {/* Medium risk card */}
                            <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-semibold text-gray-800 dark:text-zinc-200">ECWC-E-108 · Excavator</span>
                                <span className="text-[9px] font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/30 px-2 py-0.5 rounded-full">Medium</span>
                              </div>
                              <div className="h-1.5 bg-gray-200 dark:bg-zinc-700 rounded-full overflow-hidden mb-1.5">
                                <motion.div initial={{ width: 0 }} whileInView={{ width: '63%' }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.45 }} className="h-full bg-amber-400 rounded-full" />
                              </div>
                              <p className="text-[9px] text-gray-500 dark:text-zinc-400 leading-relaxed">Engine temp 18% above threshold. Coolant service recommended within 7 days.</p>
                              <p className="text-[9px] text-gray-500 dark:text-zinc-400 mt-1">Preventive cost: <span className="font-semibold text-gray-700 dark:text-zinc-300">Br 8,500</span></p>
                            </div>
                          </div>
                          {/* Savings callout */}
                          <div className="p-3 rounded-xl bg-[#70c82a]/8 dark:bg-[#70c82a]/10 border border-[#70c82a]/30">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-[10px] font-black text-[#70c82a]">Act Now — Save Br 105,500</p>
                            </div>
                            <p className="text-[9px] text-gray-600 dark:text-zinc-400 leading-relaxed">Preventive maintenance this week costs <span className="font-bold text-gray-800 dark:text-white">Br 18,500</span> vs estimated <span className="font-bold text-red-500">Br 124,000</span> in emergency repairs + downtime losses.</p>
                          </div>
                        </div>
                      </div>
                      </div>
                      {/* Full-width input bar */}
                      <div className="flex-shrink-0 flex gap-2 items-center px-4 py-2.5 bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800">
                        <input type="text" placeholder="Ask anything…" value={chatInput2} onChange={(e) => setChatInput2(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') { const t = chatInput2.trim(); if (t) { chatMessageIdRef2.current += 1; setChatUserMessages2(m => [...m, { id: chatMessageIdRef2.current, text: t }]); setChatInput2('') } } }}
                          className="flex-1 rounded-full border border-gray-200 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-800 px-4 py-1.5 text-[10px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#70c82a]/40" />
                        <button type="button" onClick={() => { const t = chatInput2.trim(); if (t) { chatMessageIdRef2.current += 1; setChatUserMessages2(m => [...m, { id: chatMessageIdRef2.current, text: t }]); setChatInput2('') } }}
                          className="w-8 h-8 rounded-full bg-[#70c82a] hover:bg-[#5ab523] text-white flex items-center justify-center flex-shrink-0 transition-colors shadow-md">
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

  

      {/* ECWC Compound Map - below Why PEMS */}
      <section id="compound-map" className="min-h-screen w-full max-w-[100vw] flex flex-col bg-background dark:bg-zinc-950 border-t border-border dark:border-zinc-800/50 overflow-x-hidden">
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

      {/* National Alignment — Digital Ethiopia 2030 (aligned with site ECWC theme) */}
      <section
        id="national-alignment"
        className="relative py-16 lg:py-24 overflow-hidden border-t border-border dark:border-zinc-800/50 scroll-mt-[4.5rem] bg-background dark:bg-zinc-950"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#70c82a]/[0.07] via-muted/20 to-background dark:from-[#70c82a]/[0.06] dark:via-zinc-950/80 dark:to-black pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(112,200,42,0.12),transparent_55%)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(112,200,42,0.08),transparent_55%)] pointer-events-none" />
        <motion.div
          className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#70c82a] to-transparent origin-left"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
        <div className="container mx-auto px-4 lg:px-8 relative z-10 max-w-6xl">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.12fr)] gap-12 lg:gap-14 xl:gap-16 items-center">
            {/* Left: National Alignment + Digital Ethiopia 2030 + Aligned with */}
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-80px" }}
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.14, delayChildren: 0.06 } },
              }}
              className="text-center lg:text-left relative"
            >
              <motion.div
                aria-hidden
                className="pointer-events-none absolute -left-8 top-0 h-48 w-48 rounded-full bg-[#70c82a]/[0.12] blur-[56px] dark:bg-[#70c82a]/[0.14]"
                animate={{ opacity: [0.45, 0.75, 0.45], scale: [1, 1.05, 1] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 16, scale: 0.96 },
                  show: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: { type: "spring", stiffness: 260, damping: 22 },
                  },
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#70c82a]/10 text-[#70c82a] text-xs font-bold uppercase tracking-widest border border-[#70c82a]/20 shadow-sm shadow-[#70c82a]/5 relative z-10"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#70c82a] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#70c82a]" />
                </span>
                National Alignment
              </motion.div>

              {/* Aligned with — above Digital Ethiopia; "with" matches #70c82a like 2030 */}
              <motion.h3
                variants={{
                  hidden: { opacity: 0, y: 28, filter: "blur(10px)" },
                  show: {
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                    transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] },
                  },
                }}
                className="relative z-10 mt-6 sm:mt-7 text-4xl sm:text-5xl lg:text-[3.25rem] font-black tracking-[-0.035em] leading-[1.05]"
              >
                <motion.span
                  className="inline-block text-foreground"
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.15, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                >
                  Aligned
                </motion.span>
                <motion.span
                  className="inline-block ml-2.5 text-[#70c82a] drop-shadow-[0_0_28px_rgba(112,200,42,0.45)] dark:drop-shadow-[0_0_32px_rgba(112,200,42,0.35)]"
                  initial={{ opacity: 0, scale: 0.85, rotate: -6 }}
                  whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 400, damping: 18, delay: 0.22 }}
                >
                  with
                </motion.span>
              </motion.h3>

              <motion.h2
                variants={{
                  hidden: { opacity: 0, y: 22 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { type: "spring", stiffness: 280, damping: 26, delay: 0.08 },
                  },
                }}
                className="relative z-10 mt-4 sm:mt-5 text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-[1.12] tracking-tight"
              >
                <motion.span
                  className="inline-block"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.35, duration: 0.4 }}
                >
                  Digital Ethiopia{" "}
                </motion.span>
                <motion.span
                  className="inline-block text-[#70c82a] drop-shadow-[0_0_24px_rgba(112,200,42,0.35)]"
                  initial={{ opacity: 0, y: 12, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 420, damping: 20, delay: 0.42 }}
                >
                  2030
                </motion.span>
              </motion.h2>

              <motion.div
                variants={{
                  hidden: { opacity: 0, scaleX: 0 },
                  show: {
                    opacity: 1,
                    scaleX: 1,
                    transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: 0.12 },
                  },
                }}
                className="mt-6 flex flex-col gap-2 origin-left mx-auto lg:mx-0 w-fit max-w-full relative z-10"
              >
                <motion.div
                  className="h-[3px] w-[min(100%,14rem)] rounded-full bg-gradient-to-r from-[#70c82a] via-emerald-400 to-[#70c82a]/70 -rotate-[0.25deg] shadow-[0_2px_16px_rgba(112,200,42,0.35)]"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.55, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                />
                <motion.div
                  className="h-[2px] w-[min(100%,11rem)] rounded-full bg-gradient-to-r from-[#70c82a]/50 to-emerald-400/60 ml-1 rotate-[0.35deg]"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.68, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                />
              </motion.div>
            </motion.div>

            {/* Right: 2×2 quadrants — internal cross lines only, no outer box */}
            <motion.div
              initial={{ opacity: 0, x: 28 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full min-w-0"
            >
              <motion.div
                aria-hidden
                className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 h-56 w-56 rounded-full bg-[#70c82a]/[0.06] blur-[48px] dark:bg-[#70c82a]/[0.09]"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
              <div className="relative grid grid-cols-2">
                {[
                  { icon: Zap, title: "Dynamic", desc: "Real-time updates and adaptive workflows that scale with your operations." },
                  { icon: Cpu, title: "AI Support", desc: "Intelligent insights and predictive maintenance powered by AI." },
                  { icon: Share2, title: "Data Sharing", desc: "Seamless, standards-based data sharing across sites and systems." },
                  { icon: Shield, title: "Secure", desc: "Enterprise-grade security to protect data and operations." },
                ].map((item, i) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 28, scale: 0.94 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, margin: "-30px" }}
                    transition={{
                      delay: 0.12 + i * 0.1,
                      type: "spring",
                      stiffness: 360,
                      damping: 26,
                    }}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    className={`group relative flex flex-col items-center justify-center text-center px-3 py-7 sm:px-5 sm:py-9 min-h-[150px] sm:min-h-[170px] border-[#70c82a]/20 dark:border-[#70c82a]/15 transition-colors duration-300 hover:bg-[#70c82a]/[0.07] ${
                      i === 0 ? "border-r border-b" : i === 1 ? "border-b" : i === 2 ? "border-r" : ""
                    }`}
                  >
                    <motion.div
                      className="relative mb-3 sm:mb-4"
                      whileHover={{ scale: 1.06 }}
                      transition={{ type: "spring", stiffness: 400, damping: 18 }}
                    >
                      <span className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#70c82a]/25 to-[#70c82a]/10 text-[#70c82a] ring-1 ring-[#70c82a]/30 shadow-[0_6px_20px_rgba(112,200,42,0.12)] group-hover:shadow-[0_10px_28px_rgba(112,200,42,0.22)] transition-shadow duration-300">
                        <item.icon className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.1} />
                      </span>
                      <CheckCircle2 className="absolute -bottom-0.5 -right-0.5 h-4 w-4 sm:h-5 sm:w-5 text-[#70c82a] bg-background dark:bg-zinc-950 rounded-full ring-2 ring-background" />
                    </motion.div>
                    <h4 className="text-sm sm:text-base font-bold text-foreground mb-1.5 sm:mb-2 tracking-tight">
                      {item.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-[13rem]">
                      {item.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
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
      <footer className="relative bg-gradient-to-br from-muted/90 via-background to-[#70c82a]/[0.12] dark:from-zinc-950 dark:via-black dark:to-[#70c82a]/[0.08] pt-12 pb-4 border-t border-[#70c82a]/10">
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
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm text-muted-foreground hover:text-[#70c82a] transition-colors group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-background to-[#70c82a]/10 dark:from-zinc-900 dark:to-[#70c82a]/15 flex items-center justify-center shadow-md shadow-[#70c82a]/15 border border-[#70c82a]/25 group-hover:shadow-lg group-hover:shadow-[#70c82a]/25 group-hover:scale-105 transition-all duration-200">
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

      </main>

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