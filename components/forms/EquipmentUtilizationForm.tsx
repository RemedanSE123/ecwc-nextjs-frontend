"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectItem } from "@/components/ui/select"
import { Printer, Plus, Trash2, FileText, ListOrdered } from "lucide-react"

const IDLE_REASONS = [
  { value: "FL", full: "Fuel/Lubricant Shortage" },
  { value: "AD", full: "Activity Dependant" },
  { value: "OP", full: "Operator Problem" },
  { value: "MO", full: "Mobilization/Demobilization" },
  { value: "CR", full: "Contract Renewal" },
  { value: "WD", full: "Waiting for Demobilization" },
  { value: "FM", full: "Force Majeure" },
  { value: "ED", full: "Equipment Dependant" },
  { value: "WS", full: "Water Shortage" },
  { value: "LC", full: "Lack of Co-ordination" },
  { value: "MF", full: "Miscellaneous Factor" },
  { value: "WC", full: "Weather Condition" },
]
const DOWN_REASONS = [
  { value: "PM", full: "Preventive Maintenance" },
  { value: "WP", full: "Waiting for parts" },
  { value: "WM", full: "Waiting for man power" },
  { value: "UR", full: "Under Repair" },
]

type UtilRow = {
  id: string
  equipType: string
  plateNo: string
  firstHalfStart: string
  firstHalfEnd: string
  secondHalfStart: string
  secondHalfEnd: string
  workedHrs: string
  idleHrs: string
  idleReason: string
  downHrs: string
  downReason: string
  engineInitial: string
  engineFinal: string
  engineDiff: string
  fuelLtrs: string
  fuelReading: string
  operatorFirstHalf: string
  operatorSecondHalf: string
  typeOfWork: string
}

export default function EquipmentUtilizationForm() {
  const pdfRef = useRef<HTMLDivElement>(null)
  const [header, setHeader] = useState({
    project: "",
    gcDate: new Date().toISOString().split("T")[0],
    shift: "Day",
    refNo: "",
  })
  const newUtilRow = (): UtilRow => ({
    id: `r-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    equipType: "",
    plateNo: "",
    firstHalfStart: "",
    firstHalfEnd: "",
    secondHalfStart: "",
    secondHalfEnd: "",
    workedHrs: "0.00",
    idleHrs: "0",
    idleReason: "",
    downHrs: "0",
    downReason: "",
    engineInitial: "0",
    engineFinal: "0",
    engineDiff: "0.0",
    fuelLtrs: "0",
    fuelReading: "0",
    operatorFirstHalf: "",
    operatorSecondHalf: "",
    typeOfWork: "",
  })
  const [rows, setRows] = useState<UtilRow[]>([newUtilRow()])
  const [recordedBy, setRecordedBy] = useState("")

  const handlePrint = () => window.print()

  const addRow = () => setRows((prev) => [...prev, newUtilRow()])
  const removeRow = (id: string) => {
    if (rows.length <= 1) return
    setRows((prev) => prev.filter((r) => r.id !== id))
  }
  const updateRow = (id: string, field: keyof UtilRow, value: string) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r
        const next = { ...r, [field]: value }
        if (
          (field === "engineInitial" || field === "engineFinal") &&
          (next.engineInitial !== "" || next.engineFinal !== "")
        ) {
          const a = parseFloat(next.engineInitial) || 0
          const b = parseFloat(next.engineFinal) || 0
          next.engineDiff = (b - a).toFixed(1)
        }
        return next
      })
    )
  }

  const inputClass = "h-9 w-full min-w-0 rounded border border-input bg-background px-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1"
  const bullet = <span className="shrink-0 w-4 text-primary font-bold text-xs leading-none" aria-hidden>•</span>
  const sectionTitle = "flex items-center gap-2 text-sm font-semibold text-foreground mb-3 pb-2 border-b border-primary/20 border-l-2 border-l-primary pl-2 rounded-r"

  return (
    <div
      id="form-print-area"
      className="w-full max-w-[1075px] min-w-0 mx-auto px-4 sm:px-6 py-6 overflow-x-hidden print:max-w-[210mm] print:mx-0 print:p-0 print:overflow-visible print:font-[Arial] min-h-screen"
    >
      <div className="print:hidden mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-foreground border-l-4 border-primary pl-3">
              Equipment Utilization
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Equipment daily time utilization register — hours, idle, down, fuel, operator.
            </p>
          </div>
          <Button onClick={handlePrint} className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90">
            <Printer className="h-4 w-4 mr-2" />
            Print form
          </Button>
        </div>
      </div>

      <div ref={pdfRef} className="w-full max-w-[1075px] min-w-0 mx-auto print:max-w-[210mm]">
        <Card className="w-full min-w-0 overflow-visible border border-border border-t-4 border-t-primary bg-card shadow-md print:shadow-none print:border print:border-black print:break-inside-avoid rounded-xl print:overflow-hidden">
          <CardHeader className="p-0 print:border-2 print:border-black">
            <div className="grid grid-cols-12 border-b border-border bg-gradient-to-b from-muted/40 to-muted/20 print:border-2 print:border-black print:bg-transparent">
              <div className="col-span-2 border-r border-border flex items-center justify-center p-2 relative h-16 print:border-black print:h-14 print:p-1">
                <Image src="/ecwc png logo.png" alt="ECWC Logo" fill className="object-contain p-1" />
              </div>
              <div className="col-span-8 border-r border-border flex flex-col items-center justify-center py-2 text-center print:border-black print:py-1">
                <p className="text-sm font-semibold text-foreground sm:text-base print:text-[14px] print:font-bold">
                  ኢትየጵያ ኮንስትራክሽን ሥራዎች ኮርፖሬሽን
                </p>
                <p className="text-[9px] font-medium text-muted-foreground sm:text-[10px] print:text-[9px] print:font-bold print:text-black">
                  ETHIOPIAN CONSTRUCTION WORKS CORPORATION
                </p>
              </div>
              <div className="col-span-2 flex flex-col justify-center pl-2 text-[11px] text-muted-foreground print:pl-1.5 print:text-[10px] print:text-black">
                <p><b>Document No.</b></p>
                <p>OF/ECWC/xxx</p>
              </div>
              <div className="col-span-2 border-r border-border flex flex-col items-center justify-center py-1.5 text-[11px] text-muted-foreground print:border-t print:border-black print:py-0.5 print:text-[10px] print:text-black">
                <p><b>Issue No.</b></p>
                <p>1</p>
              </div>
              <div className="col-span-8 border-r border-border flex flex-col items-center justify-center py-1.5 text-center bg-primary/5 print:border-t print:border-black print:py-0.5 print:bg-transparent">
                <p className="text-sm font-semibold text-foreground sm:text-base print:text-[14px] print:font-bold">
                  የመሣሪያ ዕለታዊ ጊዜ አጠቃቀም ምዝበራ
                </p>
                <p className="text-[9px] font-medium text-primary print:text-[9px] print:font-bold print:text-black">
                  EQUIPMENT DAILY TIME UTILIZATION REGISTER
                </p>
              </div>
              <div className="col-span-2 flex flex-col justify-center pl-2 text-[11px] text-muted-foreground border-t border-border print:border-t-2 print:border-black print:pl-1.5 print:text-[10px] print:text-black">
                <p><b>Page No.</b></p>
                <p>1 of 1</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 sm:p-8 bg-muted/15 space-y-5 min-w-0 print:p-6 print:bg-white">
          {/* Document info - same style as Daily Down */}
          <div>
            <p className={sectionTitle}><FileText className="h-4 w-4 text-primary shrink-0" /> Document info</p>
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <div className="flex items-center gap-2 flex-1 min-w-[280px] max-w-[520px]">
                  {bullet}
                  <Label className="text-xs font-bold text-foreground/90 w-20 shrink-0">Project</Label>
                  <Select
                    value={header.project}
                    onValueChange={(v) => setHeader((p) => ({ ...p, project: v }))}
                    className="w-full [&_button]:h-10 [&_button]:text-sm [&_button]:px-3 [&_button]:rounded [&_button]:w-full"
                  >
                    <SelectItem value="p1">Project 1</SelectItem>
                    <SelectItem value="p2">Project 2</SelectItem>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  {bullet}
                  <Label className="text-xs font-bold text-foreground/90 w-16 shrink-0">GC Date</Label>
                  <Input
                    type="date"
                    className={`${inputClass} w-36`}
                    value={header.gcDate}
                    onChange={(e) => setHeader((p) => ({ ...p, gcDate: e.target.value }))}
                  />
                </div>
                <div className="flex items-center gap-2">
                  {bullet}
                  <Label className="text-xs font-bold text-foreground/90 w-12 shrink-0">Shift</Label>
                  <Select
                    value={header.shift}
                    onValueChange={(v) => setHeader((p) => ({ ...p, shift: v }))}
                    className="[&_button]:h-9 [&_button]:text-sm [&_button]:rounded"
                  >
                    <SelectItem value="Day">Day</SelectItem>
                    <SelectItem value="Night">Night</SelectItem>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  {bullet}
                  <Label className="text-xs font-bold text-foreground/90 w-14 shrink-0">Ref.No.</Label>
                  <Input
                    className={`${inputClass} w-32`}
                    value={header.refNo}
                    onChange={(e) => setHeader((p) => ({ ...p, refNo: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Equipment entries - horizontal scroll so table is never cut off */}
          <div className="pt-6 min-w-0">
            <p className={sectionTitle}><ListOrdered className="h-4 w-4 text-primary shrink-0" /> Equipment entries</p>
          <div className="w-full max-w-full min-w-0 border border-border rounded-lg [&_button]:h-7 [&_button]:text-xs [&_button]:border-0 [&_button]:rounded-none">
            <div className="w-full max-w-full min-w-0 overflow-x-auto overflow-y-visible rounded-lg">
              <table className="w-full text-xs border-collapse min-w-[1200px]">
                <thead>
                  <tr className="bg-muted/60 border-b border-border">
                    <th className="border border-border px-1.5 py-1.5 text-left font-semibold w-20 whitespace-nowrap">Equip Type</th>
                    <th className="border border-border px-1.5 py-1.5 text-left font-semibold w-20 whitespace-nowrap">Plate No</th>
                    <th className="border border-border px-1.5 py-1.5 text-center font-semibold w-24 whitespace-nowrap" colSpan={2}>
                      1st Half Hr
                    </th>
                    <th className="border border-border px-1.5 py-1.5 text-center font-semibold w-24 whitespace-nowrap" colSpan={2}>
                      2nd Half Hr
                    </th>
                    <th className="border border-border px-1.5 py-1.5 text-left font-semibold w-16 whitespace-nowrap">Worked Hrs</th>
                    <th className="border border-border px-1.5 py-1.5 text-left font-semibold w-14 whitespace-nowrap">Idle Hrs</th>
                    <th className="border border-border px-1.5 py-1.5 text-left font-semibold w-20 whitespace-nowrap">Idle Reason</th>
                    <th className="border border-border px-1.5 py-1.5 text-left font-semibold w-14 whitespace-nowrap">Down Hrs</th>
                    <th className="border border-border px-1.5 py-1.5 text-left font-semibold w-20 whitespace-nowrap">Down Reason</th>
                    <th className="border border-border px-1.5 py-1.5 text-center font-semibold w-28 whitespace-nowrap" colSpan={3}>
                      Engine Hr/Km
                    </th>
                    <th className="border border-border px-1.5 py-1.5 text-center font-semibold w-20 whitespace-nowrap" colSpan={2}>
                      Fuel in
                    </th>
                    <th className="border border-border px-1.5 py-1.5 text-center font-semibold w-24 whitespace-nowrap" colSpan={2}>
                      Operator Name
                    </th>
                    <th className="border border-border px-1.5 py-1.5 text-left font-semibold w-24 whitespace-nowrap">Type of Work</th>
                    <th className="border border-border px-1.5 py-1.5 w-8" aria-label="Actions"></th>
                  </tr>
                  <tr className="bg-muted/40 border-b border-border text-xs">
                    <th className="border border-border"></th>
                    <th className="border border-border"></th>
                    <th className="border border-border px-1 py-0.5">Start</th>
                    <th className="border border-border px-1 py-0.5">End</th>
                    <th className="border border-border px-1 py-0.5">Start</th>
                    <th className="border border-border px-1 py-0.5">End</th>
                    <th className="border border-border"></th>
                    <th className="border border-border"></th>
                    <th className="border border-border"></th>
                    <th className="border border-border"></th>
                    <th className="border border-border"></th>
                    <th className="border border-border px-1 py-0.5">Initial</th>
                    <th className="border border-border px-1 py-0.5">Final</th>
                    <th className="border border-border px-1 py-0.5">Diff</th>
                    <th className="border border-border px-1 py-0.5">Ltrs</th>
                    <th className="border border-border px-1 py-0.5">Reading</th>
                    <th className="border border-border px-1 py-0.5">1st Half</th>
                    <th className="border border-border px-1 py-0.5">2nd Half</th>
                    <th className="border border-border"></th>
                    <th className="border border-border"></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} className="bg-card">
                      <td className="border border-border p-0">
                        <Input
                          className="h-7 border-0 rounded-none px-1 text-xs focus-visible:ring-0 focus-visible:ring-offset-0 w-full"
                          value={row.equipType}
                          onChange={(e) =>
                            updateRow(row.id, "equipType", e.target.value)
                          }
                        />
                      </td>
                      <td className="border border-border p-0">
                        <Input
                          className="h-7 border-0 rounded-none px-1 text-xs focus-visible:ring-0 focus-visible:ring-offset-0 w-full"
                          value={row.plateNo}
                          onChange={(e) =>
                            updateRow(row.id, "plateNo", e.target.value)
                          }
                        />
                      </td>
                      <td className="border border-border p-0">
                      <Input
                        type="time"
                        className="h-7 border-0 rounded-none px-1 text-xs"
                        value={row.firstHalfStart}
                        onChange={(e) =>
                          updateRow(row.id, "firstHalfStart", e.target.value)
                        }
                      />
                    </td>
                    <td className="border border-border p-0">
                      <Input
                        type="time"
                        className="h-7 border-0 rounded-none px-1 text-xs"
                        value={row.firstHalfEnd}
                        onChange={(e) =>
                          updateRow(row.id, "firstHalfEnd", e.target.value)
                        }
                      />
                    </td>
                    <td className="border border-border p-0">
                      <Input
                        type="time"
                        className="h-7 border-0 rounded-none px-1 text-xs"
                        value={row.secondHalfStart}
                        onChange={(e) =>
                          updateRow(row.id, "secondHalfStart", e.target.value)
                        }
                      />
                    </td>
                    <td className="border border-border p-0">
                      <Input
                        type="time"
                        className="h-7 border-0 rounded-none px-1 text-xs"
                        value={row.secondHalfEnd}
                        onChange={(e) =>
                          updateRow(row.id, "secondHalfEnd", e.target.value)
                        }
                      />
                    </td>
                    <td className="border border-border p-0">
                      <Input
                        className="h-7 border-0 rounded-none px-1 text-xs"
                        value={row.workedHrs}
                        onChange={(e) =>
                          updateRow(row.id, "workedHrs", e.target.value)
                        }
                      />
                    </td>
                    <td className="border border-border p-0">
                      <Input
                        className="h-7 border-0 rounded-none px-1 text-xs"
                        value={row.idleHrs}
                        onChange={(e) =>
                          updateRow(row.id, "idleHrs", e.target.value)
                        }
                      />
                    </td>
                    <td className="border border-border p-0">
                      <Select
                        value={row.idleReason}
                        onValueChange={(v) =>
                          updateRow(row.id, "idleReason", v)
                        }
                        className="[&_button]:h-7 [&_button]:min-h-7 [&_button]:rounded-none"
                      >
                        {IDLE_REASONS.map((r) => (
                          <SelectItem key={r.value} value={r.value}>
                            {r.value}
                          </SelectItem>
                        ))}
                      </Select>
                    </td>
                    <td className="border border-border p-0">
                      <Input
                        className="h-7 border-0 rounded-none px-1 text-xs"
                        value={row.downHrs}
                        onChange={(e) =>
                          updateRow(row.id, "downHrs", e.target.value)
                        }
                      />
                    </td>
                    <td className="border border-border p-0">
                      <Select
                        value={row.downReason}
                        onValueChange={(v) =>
                          updateRow(row.id, "downReason", v)
                        }
                        className="[&_button]:h-7 [&_button]:min-h-7 [&_button]:rounded-none"
                      >
                        {DOWN_REASONS.map((r) => (
                          <SelectItem key={r.value} value={r.value}>
                            {r.value}
                          </SelectItem>
                        ))}
                      </Select>
                    </td>
                    <td className="border border-border p-0">
                      <Input
                        className="h-7 border-0 rounded-none px-1 text-xs"
                        value={row.engineInitial}
                        onChange={(e) =>
                          updateRow(row.id, "engineInitial", e.target.value)
                        }
                      />
                    </td>
                    <td className="border border-border p-0">
                      <Input
                        className="h-7 border-0 rounded-none px-1 text-xs"
                        value={row.engineFinal}
                        onChange={(e) =>
                          updateRow(row.id, "engineFinal", e.target.value)
                        }
                      />
                    </td>
                    <td className="border border-border p-0">
                      <Input
                        className="h-7 border-0 rounded-none px-1 text-xs bg-muted/30"
                        value={row.engineDiff}
                        readOnly
                      />
                    </td>
                    <td className="border border-border p-0">
                      <Input
                        className="h-7 border-0 rounded-none px-1 text-xs"
                        value={row.fuelLtrs}
                        onChange={(e) =>
                          updateRow(row.id, "fuelLtrs", e.target.value)
                        }
                      />
                    </td>
                    <td className="border border-border p-0">
                      <Input
                        className="h-7 border-0 rounded-none px-1 text-xs"
                        value={row.fuelReading}
                        onChange={(e) =>
                          updateRow(row.id, "fuelReading", e.target.value)
                        }
                      />
                    </td>
                    <td className="border border-border p-0">
                      <Input
                        className="h-7 border-0 rounded-none px-1 text-xs"
                        value={row.operatorFirstHalf}
                        onChange={(e) =>
                          updateRow(row.id, "operatorFirstHalf", e.target.value)
                        }
                      />
                    </td>
                    <td className="border border-border p-0">
                      <Input
                        className="h-7 border-0 rounded-none px-1 text-xs"
                        value={row.operatorSecondHalf}
                        onChange={(e) =>
                          updateRow(row.id, "operatorSecondHalf", e.target.value)
                        }
                      />
                    </td>
                    <td className="border border-border p-0">
                      <Input
                        className="h-7 border-0 rounded-none px-1 text-xs"
                        value={row.typeOfWork}
                        onChange={(e) =>
                          updateRow(row.id, "typeOfWork", e.target.value)
                        }
                      />
                    </td>
                    <td className="border border-border p-0.5 text-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => removeRow(row.id)}
                        disabled={rows.length <= 1}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {/* Empty space below for adding more rows - same as Daily Down (up to 5 total slots) */}
                {Array.from({ length: Math.max(0, 5 - rows.length) }).map((_, i) => (
                  <tr key={`empty-${i}`} aria-hidden>
                    <td colSpan={20} className="border border-border bg-muted/10 h-8" />
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
            <div className="p-3 border-t border-border bg-muted/30">
              <Button type="button" variant="outline" size="sm" onClick={addRow} className="gap-1 border-primary/30 text-primary hover:bg-primary/10">
                <Plus className="h-4 w-4" />
                Add row
              </Button>
            </div>
          </div>
          </div>

          {/* Legends - compact layout */}
          <div className="rounded-lg border border-border bg-muted/20 p-3">
            <div className="grid grid-cols-1 sm:grid-cols-[1.6fr_1fr_1fr] gap-4 text-[11px]">
              <div className="pl-2 border-l-2 border-l-primary/50 rounded-r bg-card/40 py-1.5 px-2 min-w-0 overflow-x-auto">
                <p className="font-bold text-primary uppercase tracking-wide mb-2 text-[10px]">Idle Time Reasons</p>
                <ul className="grid grid-cols-2 gap-x-3 gap-y-1 text-muted-foreground">
                  {IDLE_REASONS.map((r) => (
                    <li key={r.value} className="flex gap-1.5 items-baseline min-w-0">
                      <span className="shrink-0 w-1 h-1 rounded-full bg-primary/60 mt-1" aria-hidden />
                      <span className="whitespace-nowrap min-w-0"><span className="font-bold text-foreground">{r.value}</span> — {r.full}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pl-2 border-l-2 border-l-primary/50 rounded-r bg-card/40 py-1.5 px-2">
                <p className="font-bold text-primary uppercase tracking-wide mb-2 text-[10px]">Shifts</p>
                <div className="space-y-2 text-muted-foreground">
                  <div className="rounded border border-border/50 bg-muted/30 px-2 py-1.5">
                    <p className="font-semibold text-foreground mb-0.5">Day — 12:00T - 12:00K</p>
                    <p className="pl-1.5">1st Half: 12:00T - 6:00K</p>
                    <p className="pl-1.5">2nd Half: 6:00K - 12:00K</p>
                  </div>
                  <div className="rounded border border-border/50 bg-muted/30 px-2 py-1.5">
                    <p className="font-semibold text-foreground mb-0.5">Night — 12:00K - 12:00T</p>
                    <p className="pl-1.5">1st Half: 11:59K - 5:59M</p>
                    <p className="pl-1.5">2nd Half: 6:00L - 12:00T</p>
                  </div>
                </div>
              </div>
              <div className="pl-2 border-l-2 border-l-primary/50 rounded-r bg-card/40 py-1.5 px-2">
                <p className="font-bold text-primary uppercase tracking-wide mb-2 text-[10px]">Down Time Reasons</p>
                <ul className="space-y-1 text-muted-foreground">
                  {DOWN_REASONS.map((r) => (
                    <li key={r.value} className="flex gap-1.5 items-baseline">
                      <span className="shrink-0 w-1 h-1 rounded-full bg-primary/60 mt-1" aria-hidden />
                      <span className="whitespace-nowrap"><span className="font-bold text-foreground">{r.value}</span> — {r.full}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Recorded by - same as Daily Down */}
          <div className="flex items-center justify-end pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              {bullet}
              <Label className="text-xs font-bold text-foreground/90 shrink-0">Recorded by</Label>
              <Select value={recordedBy} onValueChange={setRecordedBy} className="w-56 min-w-[14rem] [&_button]:h-9 [&_button]:text-sm [&_button]:rounded [&_button]:w-full">
                <SelectItem value="u1">User 1</SelectItem>
                <SelectItem value="u2">User 2</SelectItem>
              </Select>
            </div>
          </div>
        </CardContent>
        </Card>
      </div>
    </div>
  )
}
