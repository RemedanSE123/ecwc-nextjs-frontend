"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectItem } from "@/components/ui/select"
import { Printer, Plus, Trash2, FileText, ListOrdered } from "lucide-react"

const STATUS_OPTIONS = [
  { value: "OP", label: "OP", description: "For operational" },
  { value: "Down", label: "Down", description: "For broken" },
  { value: "Idle", label: "Idle", description: "While it can work but stopped" },
  { value: "WWP", label: "WWP", description: "For working with problem" },
]

type GridRow = {
  id: string
  plateNo: string
  equipType: string
  status: string
  reason: string
  actionTaken: string
  expectedDateOut: string
}

export default function DailyDownForm() {
  const pdfRef = useRef<HTMLDivElement>(null)
  const [header, setHeader] = useState({
    project: "",
    date: new Date().toISOString().split("T")[0],
    refNo: "",
  })
  const newRow = (): GridRow => ({
    id: `row-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    plateNo: "",
    equipType: "",
    status: "",
    reason: "",
    actionTaken: "",
    expectedDateOut: "",
  })
  const [rows, setRows] = useState<GridRow[]>([newRow()])
  const [encodedBy, setEncodedBy] = useState("")

  const handlePrint = () => window.print()

  const addRow = () => {
    setRows((prev) => [...prev, newRow()])
  }

  const removeRow = (id: string) => {
    if (rows.length <= 1) return
    setRows((prev) => prev.filter((r) => r.id !== id))
  }

  const updateRow = (id: string, field: keyof GridRow, value: string) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    )
  }

  const compactInputClass =
    "h-9 w-full min-w-0 rounded border border-input bg-background px-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1"
  const inputClass = `${compactInputClass}`
  const bullet = <span className="shrink-0 w-4 text-primary font-bold text-xs leading-none" aria-hidden>•</span>
  const sectionTitle = "flex items-center gap-2 text-sm font-semibold text-foreground mb-3 pb-2 border-b border-primary/20 border-l-2 border-l-primary pl-2 rounded-r"

  return (
    <div
      id="form-print-area"
      className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 py-6 print:max-w-[210mm] print:mx-0 print:p-0 print:font-[Arial] min-h-screen"
    >
      <div className="print:hidden mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-foreground border-l-4 border-primary pl-3">
              Daily Down
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Record daily down equipment status — broken, idle, or working with problem.
            </p>
          </div>
          <Button onClick={handlePrint} className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90">
            <Printer className="h-4 w-4 mr-2" />
            Print form
          </Button>
        </div>
      </div>

      <div ref={pdfRef} className="w-full max-w-[1200px] mx-auto print:max-w-[210mm]">
        <Card className="overflow-hidden border border-border border-t-4 border-t-primary bg-card shadow-md print:shadow-none print:border print:border-black print:break-inside-avoid rounded-xl">
          <CardHeader className="p-0 print:border-2 print:border-black">
            <div className="grid grid-cols-12 border-b border-border bg-gradient-to-b from-muted/40 to-muted/20 print:border-2 print:border-black print:bg-transparent">
              <div className="col-span-2 border-r border-border flex items-center justify-center p-2 relative h-16 print:border-black print:h-14 print:p-1">
                <Image src="/ecwc png logo.png" alt="ECWC Logo" fill className="object-contain p-1" />
              </div>
              <div className="col-span-8 border-r border-border flex flex-col items-center justify-center py-2 text-center print:border-black print:py-1">
                <p className="text-sm font-semibold text-foreground sm:text-base print:text-[14px] print:font-bold">
                  የኢትየጵያ ኮንስትራክሽን ሥራዎች ኮርፖሬሽን
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
                  ዕለታዊ በብልሽት ያልሰራበት መሣሪያ ሁኔታ መግቢያ
                </p>
                <p className="text-[9px] font-medium text-primary print:text-[9px] print:font-bold print:text-black">
                  DAILY DOWN EQUIPMENT STATUS DATA ENTRY
                </p>
              </div>
              <div className="col-span-2 flex flex-col justify-center pl-2 text-[11px] text-muted-foreground border-t border-border print:border-t-2 print:border-black print:pl-1.5 print:text-[10px] print:text-black">
                <p><b>Page No.</b></p>
                <p>1 of 1</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 sm:p-8 bg-muted/15 space-y-5 print:p-6 print:bg-white">
          {/* Top fields */}
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
                    <SelectItem value="proj1">Project 1</SelectItem>
                    <SelectItem value="proj2">Project 2</SelectItem>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  {bullet}
                  <Label className="text-xs font-bold text-foreground/90 w-16 shrink-0">Date</Label>
                  <Input
                    type="date"
                    className={`${inputClass} w-36`}
                    value={header.date}
                    onChange={(e) => setHeader((p) => ({ ...p, date: e.target.value }))}
                  />
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

          {/* Data grid */}
          <div className="pt-6">
            <p className={sectionTitle}><ListOrdered className="h-4 w-4 text-primary shrink-0" /> Equipment entries</p>
            <div className="border border-border rounded-lg overflow-hidden [&_button]:h-8 [&_button]:text-xs [&_button]:border-0 [&_button]:rounded-none">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-muted/60">
                    <th className="border border-border px-2 py-2 text-left font-bold w-28">Plate No</th>
                    <th className="border border-border px-2 py-2 text-left font-bold w-28">Equip Type</th>
                    <th className="border border-border px-2 py-2 text-left font-bold w-28">Status</th>
                    <th className="border border-border px-2 py-2 text-left font-bold min-w-[120px]">Reason</th>
                    <th className="border border-border px-2 py-2 text-left font-bold min-w-[120px]">Action Taken</th>
                    <th className="border border-border px-2 py-2 text-left font-bold w-36">Expected Date Out</th>
                    <th className="border border-border px-2 py-2 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} className="bg-card">
                      <td className="border border-border p-0 align-middle">
                        <Input
                          className="h-8 border-0 rounded-none px-2 text-xs focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground w-full"
                          placeholder="Plate no"
                          value={row.plateNo}
                          onChange={(e) => updateRow(row.id, "plateNo", e.target.value)}
                        />
                      </td>
                      <td className="border border-border p-0 align-middle">
                        <Input
                          className="h-8 border-0 rounded-none px-2 text-xs focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground w-full"
                          placeholder="Type"
                          value={row.equipType}
                          onChange={(e) => updateRow(row.id, "equipType", e.target.value)}
                        />
                      </td>
                      <td className="border border-border p-0 align-middle">
                        <Select
                          value={row.status || "__placeholder__"}
                          onValueChange={(v) => updateRow(row.id, "status", v === "__placeholder__" ? "" : v)}
                          className="[&_button]:h-8 [&_button]:min-h-8 [&_button]:w-full [&_button]:rounded-none"
                        >
                          <SelectItem value="__placeholder__">Status</SelectItem>
                          {STATUS_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                          ))}
                        </Select>
                      </td>
                      <td className="border border-border p-0 align-middle">
                        <Input
                          className="h-8 border-0 rounded-none px-2 text-xs focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground w-full"
                          placeholder="Reason"
                          value={row.reason}
                          onChange={(e) => updateRow(row.id, "reason", e.target.value)}
                        />
                      </td>
                      <td className="border border-border p-0 align-middle">
                        <Input
                          className="h-8 border-0 rounded-none px-2 text-xs focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground w-full"
                          placeholder="Action taken"
                          value={row.actionTaken}
                          onChange={(e) => updateRow(row.id, "actionTaken", e.target.value)}
                        />
                      </td>
                      <td className="border border-border p-0 align-middle">
                        <Input
                          type="date"
                          className="h-8 border-0 rounded-none px-2 text-xs focus-visible:ring-0 focus-visible:ring-offset-0 text-muted-foreground [color-scheme:light] w-full"
                          value={row.expectedDateOut}
                          onChange={(e) => updateRow(row.id, "expectedDateOut", e.target.value)}
                        />
                      </td>
                      <td className="border border-border p-1 text-center align-middle">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => removeRow(row.id)}
                          disabled={rows.length <= 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                {/* Empty space below for adding more rows */}
                {Array.from({ length: Math.max(0, 5 - rows.length) }).map((_, i) => (
                  <tr key={`empty-${i}`} aria-hidden>
                    <td colSpan={7} className="border border-border bg-muted/10 h-10" />
                  </tr>
                ))}
              </tbody>
            </table>
              <div className="p-3 border-t border-border bg-muted/30">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addRow}
                  className="gap-1 border-primary/30 text-primary hover:bg-primary/10"
                >
                  <Plus className="h-4 w-4" />
                  Add row
                </Button>
              </div>
            </div>
          </div>

          {/* Status legend */}
          <div className="border border-border border-l-4 border-l-primary bg-muted/20 p-4 rounded-r-lg">
            <p className="text-xs font-bold text-foreground mb-2">Status</p>
            <ul className="text-xs space-y-2 text-muted-foreground">
              {STATUS_OPTIONS.map((o) => (
                <li key={o.value} className="flex gap-2 items-baseline">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0 mt-1.5" aria-hidden />
                  <span><span className="font-semibold text-foreground">{o.label}</span> — {o.description}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recorded by - right, wide input */}
          <div className="flex items-center justify-end pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              {bullet}
              <Label className="text-xs font-bold text-foreground/90 shrink-0">Recorded by</Label>
              <Select value={encodedBy} onValueChange={setEncodedBy} className="w-56 min-w-[14rem] [&_button]:h-9 [&_button]:text-sm [&_button]:rounded [&_button]:w-full">
                <SelectItem value="user1">User 1</SelectItem>
                <SelectItem value="user2">User 2</SelectItem>
              </Select>
            </div>
          </div>
        </CardContent>
        </Card>
      </div>
    </div>
  )
}
