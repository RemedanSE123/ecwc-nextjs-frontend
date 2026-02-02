"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DollarSign, Fuel, Route, Truck, FileText } from "lucide-react"

/** Demo rate reference: Transport Rate (Birr/K.m) by road type and load — used to calculate cost per collected record */
const RATE_REFERENCE = [
  { description: "Low Bed & High Bed", capacity: "48 Ton", asphaltLoadMod: 363.16, asphaltLoadSev: 395.85, gravelLoadMod: 437.18, gravelLoadSev: 476.57, asphaltNoLoadMod: 264.62, asphaltNoLoadSev: 277.84, gravelNoLoadMod: 330.85, gravelNoLoadSev: 341.07 },
  { description: "Low Bed & High Bed", capacity: "40 Ton", asphaltLoadMod: 357.76, asphaltLoadSev: 389.94, gravelLoadMod: 430.62, gravelLoadSev: 469.21, asphaltNoLoadMod: 260.27, asphaltNoLoadSev: 273.29, gravelNoLoadMod: 322.29, gravelNoLoadSev: 335.78 },
  { description: "Low Bed & High Bed", capacity: "30 Ton", asphaltLoadMod: 330.45, asphaltLoadSev: 361.35, gravelLoadMod: 390.53, gravelLoadSev: 428.24, asphaltNoLoadMod: 246.03, asphaltNoLoadSev: 258.33, gravelNoLoadMod: 302.86, gravelNoLoadSev: 316.9 },
  { description: "Cargo Truck (Flat Truck)", capacity: "15 Ton", asphaltLoadMod: 289.52, asphaltLoadSev: 318.48, gravelLoadMod: 330.4, gravelLoadSev: 366.77, asphaltNoLoadMod: 224.68, asphaltNoLoadSev: 235.9, gravelNoLoadMod: 273.72, gravelNoLoadSev: 288.13 },
  { description: "Cargo Truck (Flat Truck)", capacity: "10 Ton", asphaltLoadMod: 242.55, asphaltLoadSev: 266.82, gravelLoadMod: 276.8, gravelLoadSev: 307.27, asphaltNoLoadMod: 188.23, asphaltNoLoadSev: 197.64, gravelNoLoadMod: 229.33, gravelNoLoadSev: 241.39 },
] as const

type RateRow = (typeof RATE_REFERENCE)[number]

/** Approved time sheet record used for cost calculation (matches Collected Data shape) */
type CostRecord = {
  id: string
  serialNo: string
  date: string
  vehicleType: string
  vehicleCapacity: string
  roadType: "Asphalt" | "Gravel"
  loadStatus: "Loading" | "Not Loading"
  zoneSeverity: "Moderate" | "Severe"
  distance: number
  fuel: number
  idleHours: number
  downHours: number
}

/** Demo approved records — vehicleType + capacity must match a row in RATE_REFERENCE for transport cost */
const DEMO_APPROVED_RECORDS: CostRecord[] = [
  { id: "TS-001", serialNo: "SG-1001", date: "2024-01-15", vehicleType: "Cargo Truck (Flat Truck)", vehicleCapacity: "15 Ton", roadType: "Asphalt", loadStatus: "Loading", zoneSeverity: "Moderate", distance: 120, fuel: 40, idleHours: 0, downHours: 0 },
  { id: "TS-002", serialNo: "SG-1002", date: "2024-01-16", vehicleType: "Cargo Truck (Flat Truck)", vehicleCapacity: "15 Ton", roadType: "Gravel", loadStatus: "Loading", zoneSeverity: "Severe", distance: 150, fuel: 50, idleHours: 1, downHours: 0 },
  { id: "TS-003", serialNo: "SG-1003", date: "2024-01-16", vehicleType: "Low Bed & High Bed", vehicleCapacity: "40 Ton", roadType: "Asphalt", loadStatus: "Not Loading", zoneSeverity: "Moderate", distance: 80, fuel: 35, idleHours: 2, downHours: 1 },
]

function normalizeCapacity(cap: string): string {
  const t = cap.replace(/\s/g, "").toUpperCase()
  if (t === "40T" || t === "40TON") return "40 Ton"
  if (t === "48T" || t === "48TON") return "48 Ton"
  if (t === "30T" || t === "30TON") return "30 Ton"
  if (t === "15T" || t === "15TON") return "15 Ton"
  if (t === "10T" || t === "10TON") return "10 Ton"
  return cap
}

function getRateFromReference(record: CostRecord): number | null {
  const cap = normalizeCapacity(record.vehicleCapacity)
  const row = RATE_REFERENCE.find(
    (r) => r.description === record.vehicleType && r.capacity === cap
  ) as RateRow | undefined
  if (!row) return null
  const isAsphalt = record.roadType === "Asphalt"
  const isLoad = record.loadStatus === "Loading"
  const isSev = record.zoneSeverity === "Severe"
  if (isAsphalt && isLoad) return isSev ? row.asphaltLoadSev : row.asphaltLoadMod
  if (isAsphalt && !isLoad) return isSev ? row.asphaltNoLoadSev : row.asphaltNoLoadMod
  if (!isAsphalt && isLoad) return isSev ? row.gravelLoadSev : row.gravelLoadMod
  return isSev ? row.gravelNoLoadSev : row.gravelNoLoadMod
}

export default function DryCargoCost() {
  const [fuelPerLiter, setFuelPerLiter] = useState<string>("65")
  const [hourlyIdleDown, setHourlyIdleDown] = useState<string>("200")

  const records = useMemo(() => DEMO_APPROVED_RECORDS, [])

  const { rows, totalTransport, totalFuel, totalIdleDown, grandTotal } = useMemo(() => {
    const fuelRate = parseFloat(fuelPerLiter) || 0
    const idleRate = parseFloat(hourlyIdleDown) || 0
    let sumTransport = 0
    let sumFuel = 0
    let sumIdleDown = 0
    const rows = records.map((rec) => {
      const rateBirrPerKm = getRateFromReference(rec)
      const transportCost = rateBirrPerKm != null ? rec.distance * rateBirrPerKm : 0
      const fuelCost = rec.fuel * fuelRate
      const idleDownCost = (rec.idleHours + rec.downHours) * idleRate
      const total = transportCost + fuelCost + idleDownCost
      sumTransport += transportCost
      sumFuel += fuelCost
      sumIdleDown += idleDownCost
      return {
        ...rec,
        rateBirrPerKm: rateBirrPerKm ?? undefined,
        transportCost,
        fuelCost,
        idleDownCost,
        total,
      }
    })
    return {
      rows,
      totalTransport: sumTransport,
      totalFuel: sumFuel,
      totalIdleDown: sumIdleDown,
      grandTotal: sumTransport + sumFuel + sumIdleDown,
    }
  }, [records, fuelPerLiter, hourlyIdleDown])

  return (
    <div className="space-y-6">
      <Card className="border shadow-md">
        <CardHeader>
          <CardTitle>Cost Parameters</CardTitle>
          <CardDescription>Set rates for cost analysis. Values are used to compute totals from time sheet data.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Fuel className="h-4 w-4" />
                Fuel cost per liter (ETB)
              </Label>
              <Input type="number" min={0} step={0.01} placeholder="e.g. 65" value={fuelPerLiter} onChange={(e) => setFuelPerLiter(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Route className="h-4 w-4" />
                Cost per km (ETB) — fallback if no rate match
              </Label>
              <Input type="number" min={0} step={0.01} placeholder="e.g. 15" />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Hourly rate – idle/down (ETB)
              </Label>
              <Input type="number" min={0} step={0.01} placeholder="e.g. 200" value={hourlyIdleDown} onChange={(e) => setHourlyIdleDown(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4" />
            የትራንስፖርት ዋጋ በተለያየ የመንገድ ሁኔታ / Transport Rate (Birr/K.m)
          </CardTitle>
          <CardDescription>Dry cargo & flat truck rates by road type and load. Each collected record&apos;s cost is calculated from the matching row (description + capacity).</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-2 font-medium">Description</th>
                <th className="text-left py-2 px-2 font-medium">Capacity (Ton)</th>
                <th colSpan={2} className="text-center py-2 px-2 font-medium border-l border-border">Asphalt with load</th>
                <th colSpan={2} className="text-center py-2 px-2 font-medium border-l border-border">Gravel with load</th>
                <th colSpan={2} className="text-center py-2 px-2 font-medium border-l border-border">Asphalt no load</th>
                <th colSpan={2} className="text-center py-2 px-2 font-medium border-l border-border">Gravel no load</th>
              </tr>
              <tr className="border-b border-border text-muted-foreground">
                <th className="py-1.5 px-2 font-normal" />
                <th className="py-1.5 px-2 font-normal" />
                <th className="py-1.5 px-2 font-normal border-l border-border">Mod.</th>
                <th className="py-1.5 px-2 font-normal">Sev.</th>
                <th className="py-1.5 px-2 font-normal border-l border-border">Mod.</th>
                <th className="py-1.5 px-2 font-normal">Sev.</th>
                <th className="py-1.5 px-2 font-normal border-l border-border">Mod.</th>
                <th className="py-1.5 px-2 font-normal">Sev.</th>
                <th className="py-1.5 px-2 font-normal border-l border-border">Mod.</th>
                <th className="py-1.5 px-2 font-normal">Sev.</th>
              </tr>
            </thead>
            <tbody>
              {RATE_REFERENCE.map((row, i) => (
                <tr key={i} className="border-b border-border hover:bg-muted/30">
                  <td className="py-2 px-2">{row.description}</td>
                  <td className="py-2 px-2">{row.capacity}</td>
                  <td className="py-2 px-2 text-right border-l border-border">{row.asphaltLoadMod.toFixed(2)}</td>
                  <td className="py-2 px-2 text-right">{row.asphaltLoadSev.toFixed(2)}</td>
                  <td className="py-2 px-2 text-right border-l border-border">{row.gravelLoadMod.toFixed(2)}</td>
                  <td className="py-2 px-2 text-right">{row.gravelLoadSev.toFixed(2)}</td>
                  <td className="py-2 px-2 text-right border-l border-border">{row.asphaltNoLoadMod.toFixed(2)}</td>
                  <td className="py-2 px-2 text-right">{row.asphaltNoLoadSev.toFixed(2)}</td>
                  <td className="py-2 px-2 text-right border-l border-border">{row.gravelNoLoadMod.toFixed(2)}</td>
                  <td className="py-2 px-2 text-right">{row.gravelNoLoadSev.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Estimated Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-700">{grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })} ETB</p>
            <p className="text-xs text-muted-foreground mt-1">Based on approved time sheets</p>
          </CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Fuel className="h-4 w-4" />
              Fuel Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalFuel.toLocaleString("en-US", { minimumFractionDigits: 2 })} ETB</p>
            <p className="text-xs text-muted-foreground mt-1">Fuel × rate</p>
          </CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Route className="h-4 w-4" />
              Transport (Distance) Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalTransport.toLocaleString("en-US", { minimumFractionDigits: 2 })} ETB</p>
            <p className="text-xs text-muted-foreground mt-1">Distance × rate reference</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border shadow-md">
        <CardHeader>
          <CardTitle>Cost Summary by Time Sheet</CardTitle>
          <CardDescription>Cost breakdown per record when parameters are set and data is loaded. Each record uses the rate reference above (by description and capacity) to compute transport cost from km by road type and load.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse min-w-[720px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-2 font-medium text-muted-foreground">Serial No</th>
                  <th className="text-left py-2 px-2 font-medium text-muted-foreground">Date</th>
                  <th className="text-left py-2 px-2 font-medium text-muted-foreground">Vehicle</th>
                  <th className="text-left py-2 px-2 font-medium text-muted-foreground">Capacity</th>
                  <th className="text-left py-2 px-2 font-medium text-muted-foreground">Road</th>
                  <th className="text-left py-2 px-2 font-medium text-muted-foreground">Load</th>
                  <th className="text-left py-2 px-2 font-medium text-muted-foreground">Sev.</th>
                  <th className="text-right py-2 px-2 font-medium text-muted-foreground">Dist. (km)</th>
                  <th className="text-right py-2 px-2 font-medium text-muted-foreground">Rate (Birr/km)</th>
                  <th className="text-right py-2 px-2 font-medium text-muted-foreground">Transport (ETB)</th>
                  <th className="text-right py-2 px-2 font-medium text-muted-foreground">Fuel (ETB)</th>
                  <th className="text-right py-2 px-2 font-medium text-muted-foreground">Idle/Down (ETB)</th>
                  <th className="text-right py-2 px-2 font-medium text-muted-foreground">Total (ETB)</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-border hover:bg-muted/30">
                    <td className="py-2 px-2 font-medium">{row.serialNo}</td>
                    <td className="py-2 px-2">{row.date}</td>
                    <td className="py-2 px-2">{row.vehicleType}</td>
                    <td className="py-2 px-2">{row.vehicleCapacity}</td>
                    <td className="py-2 px-2">{row.roadType}</td>
                    <td className="py-2 px-2">{row.loadStatus}</td>
                    <td className="py-2 px-2">{row.zoneSeverity}</td>
                    <td className="py-2 px-2 text-right">{row.distance}</td>
                    <td className="py-2 px-2 text-right">{row.rateBirrPerKm != null ? row.rateBirrPerKm.toFixed(2) : "—"}</td>
                    <td className="py-2 px-2 text-right">{row.transportCost.toFixed(2)}</td>
                    <td className="py-2 px-2 text-right">{row.fuelCost.toFixed(2)}</td>
                    <td className="py-2 px-2 text-right">{row.idleDownCost.toFixed(2)}</td>
                    <td className="py-2 px-2 text-right font-medium">{row.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length === 0 && (
            <p className="text-sm text-muted-foreground py-4">Enter cost parameters above and ensure approved time sheets are available in the Collected Data tab. Cost totals will appear here.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
