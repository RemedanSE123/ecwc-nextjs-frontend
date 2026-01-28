"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Truck, Drill, Car, Package } from "lucide-react"
import DryLoadRates from "./DryLoadRates"
import WagonDrillRates from "./WagonDrillRates"
import LightVehicleRates from "./LightVehicleRates"
import DumpTruckRates from "./DumpTruckRates"

type RateTab = "dryload" | "wagon" | "light" | "dumptruck"

const tabs: { id: RateTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "dryload", label: "Dry Load", icon: Truck },
  { id: "wagon", label: "Wagon Drill", icon: Drill },
  { id: "light", label: "Light Vehicle", icon: Car },
  { id: "dumptruck", label: "Dump Truck", icon: Package },
]

export default function RatesSection() {
  const [activeTab, setActiveTab] = useState<RateTab>("dryload")

  return (
    <section className="mt-8 print:hidden">
      <Card className="border-2 border-emerald-200/80 bg-white shadow-md overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-3">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/20">
              <Truck className="w-4 h-4" />
            </span>
            የዋጋ ተመን / Rate Reference
          </h2>
          <p className="text-sm text-emerald-100">Select a category to view rates (Birr)</p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row min-h-[320px]">
            {/* Mini sidebar */}
            <nav className="sm:w-44 shrink-0 border-b sm:border-b-0 sm:border-r border-gray-200 bg-gray-50/80">
              <ul className="flex sm:flex-col p-2 gap-1">
                {tabs.map(({ id, label, icon: Icon }) => (
                  <li key={id}>
                    <button
                      type="button"
                      onClick={() => setActiveTab(id)}
                      className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        activeTab === id
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "text-gray-700 hover:bg-emerald-100 hover:text-emerald-800"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
            {/* Rate content */}
            <div className="flex-1 p-4 sm:p-5 overflow-x-auto bg-gray-50/30 min-w-0">
              {activeTab === "dryload" && <DryLoadRates />}
              {activeTab === "wagon" && <WagonDrillRates />}
              {activeTab === "light" && <LightVehicleRates />}
              {activeTab === "dumptruck" && <DumpTruckRates />}
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
