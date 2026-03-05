"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectItem } from "@/components/ui/select"
import { Printer, Plus, Trash2 } from "lucide-react"

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

  const cellInput = "h-8 border-0 rounded-none px-2 text-xs focus-visible:ring-0 focus-visible:ring-offset-0 w-full bg-transparent"
  const cellSelect = "[&_button]:h-8 [&_button]:min-h-8 [&_button]:text-xs [&_button]:rounded-none [&_button]:w-full [&_button]:px-2"

  return (
    <div id="form-print-area" className="w-full min-w-0 mx-auto px-2 py-2 print:max-w-[210mm] print:mx-0 print:p-0 print:font-[Arial]">
      <div ref={pdfRef} className="w-full min-w-0 print:max-w-[210mm]">
        <Card className="overflow-hidden border border-zinc-200 shadow-sm print:shadow-none print:border print:border-black rounded-lg bg-white">
          <CardHeader className="p-0 print:border-2 print:border-black">
            <div className="grid grid-cols-12 border-b border-zinc-200 bg-zinc-50/60 print:border-2 print:border-black print:bg-transparent">
              <div className="col-span-2 border-r border-zinc-200 flex items-center justify-center p-1.5 relative h-12 print:border-black print:h-14 print:p-1">
                <Image src="/ecwc png logo.png" alt="ECWC Logo" fill className="object-contain p-1" />
              </div>
              <div className="col-span-8 border-r border-zinc-200 flex flex-col items-center justify-center py-1.5 text-center print:border-black">
                <p className="text-xs font-semibold text-zinc-800 print:text-[14px] print:font-bold">የኢትየጵያ ኮንስትራክሽን ሥራዎች ኮርፖሬሽን</p>
                <p className="text-[9px] text-zinc-500 print:text-[9px] print:font-bold print:text-black">ETHIOPIAN CONSTRUCTION WORKS CORPORATION</p>
              </div>
              <div className="col-span-2 flex flex-col justify-center pl-1.5 text-[10px] text-zinc-500">
                <p><b>Doc No.</b> OF/ECWC/xxx</p>
                <p><b>Issue No.</b> 1</p>
              </div>
              <div className="col-span-2 border-r border-zinc-200 border-t flex flex-col items-center justify-center py-1 print:border-t print:border-black"></div>
              <div className="col-span-8 border-r border-zinc-200 border-t flex flex-col items-center justify-center py-1 text-center bg-zinc-50 print:border-t print:border-black print:bg-transparent">
                <p className="text-xs font-semibold text-zinc-800 print:text-[14px] print:font-bold">ዕለታዊ በብልሽት ያልሰራበት መሣሪያ ሁኔታ መግቢያ</p>
                <p className="text-[9px] text-zinc-500 print:text-[9px] print:font-bold print:text-black">DAILY DOWN EQUIPMENT STATUS DATA ENTRY</p>
              </div>
              <div className="col-span-2 border-t border-zinc-200 flex flex-col items-center justify-center print:border-t print:border-black">
                <button type="button" onClick={handlePrint} className="print:hidden flex items-center gap-1 px-2 py-1 rounded bg-zinc-800 text-white text-[10px] font-medium hover:bg-zinc-900 transition-colors">
                  <Printer className="h-3 w-3" />Print
                </button>
                <span className="hidden print:block text-[10px]"><b>Page No.</b> 1 of 1</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-3 sm:p-4 bg-white space-y-3 print:p-6 print:bg-white">

            {/* Document info */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <div className="flex items-center gap-2">
                <Label className="text-xs font-medium text-zinc-600 shrink-0 w-14">Project</Label>
                <Select value={header.project} onValueChange={(v) => setHeader((p) => ({ ...p, project: v }))} className="[&_button]:h-8 [&_button]:text-xs [&_button]:px-2 [&_button]:rounded [&_button]:w-36">
                  <SelectItem value="proj1">Project 1</SelectItem>
                  <SelectItem value="proj2">Project 2</SelectItem>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs font-medium text-zinc-600 shrink-0">Date</Label>
                <Input type="date" className="h-8 border border-zinc-200 rounded px-2 text-xs w-32" value={header.date} onChange={(e) => setHeader((p) => ({ ...p, date: e.target.value }))} />
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs font-medium text-zinc-600 shrink-0">Ref.No.</Label>
                <Input className="h-8 border border-zinc-200 rounded px-2 text-xs w-28" value={header.refNo} onChange={(e) => setHeader((p) => ({ ...p, refNo: e.target.value }))} />
              </div>
            </div>

            {/* Data grid */}
            <div className="border border-zinc-200 rounded-lg overflow-hidden">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-zinc-100">
                    <th className="border border-zinc-200 px-2 py-1.5 text-left font-semibold text-zinc-600 w-[110px]">Plate No</th>
                    <th className="border border-zinc-200 px-2 py-1.5 text-left font-semibold text-zinc-600 w-[110px]">Equip Type</th>
                    <th className="border border-zinc-200 px-2 py-1.5 text-left font-semibold text-zinc-600 w-[100px]">Status</th>
                    <th className="border border-zinc-200 px-2 py-1.5 text-left font-semibold text-zinc-600">Reason</th>
                    <th className="border border-zinc-200 px-2 py-1.5 text-left font-semibold text-zinc-600">Action Taken</th>
                    <th className="border border-zinc-200 px-2 py-1.5 text-left font-semibold text-zinc-600 w-[120px]">Exp. Date Out</th>
                    <th className="border border-zinc-200 px-2 py-1.5 w-9"></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} className="bg-white hover:bg-zinc-50/50">
                      <td className="border border-zinc-200 p-0"><Input className={cellInput} placeholder="Plate no" value={row.plateNo} onChange={(e) => updateRow(row.id, "plateNo", e.target.value)} /></td>
                      <td className="border border-zinc-200 p-0"><Input className={cellInput} placeholder="Type" value={row.equipType} onChange={(e) => updateRow(row.id, "equipType", e.target.value)} /></td>
                      <td className="border border-zinc-200 p-0">
                        <Select value={row.status || "__placeholder__"} onValueChange={(v) => updateRow(row.id, "status", v === "__placeholder__" ? "" : v)} className={cellSelect}>
                          <SelectItem value="__placeholder__">Status</SelectItem>
                          {STATUS_OPTIONS.map((o) => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}
                        </Select>
                      </td>
                      <td className="border border-zinc-200 p-0"><Input className={cellInput} placeholder="Reason" value={row.reason} onChange={(e) => updateRow(row.id, "reason", e.target.value)} /></td>
                      <td className="border border-zinc-200 p-0"><Input className={cellInput} placeholder="Action taken" value={row.actionTaken} onChange={(e) => updateRow(row.id, "actionTaken", e.target.value)} /></td>
                      <td className="border border-zinc-200 p-0"><Input type="date" className={`${cellInput} [color-scheme:light]`} value={row.expectedDateOut} onChange={(e) => updateRow(row.id, "expectedDateOut", e.target.value)} /></td>
                      <td className="border border-zinc-200 p-1 text-center">
                        <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => removeRow(row.id)} disabled={rows.length <= 1}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {Array.from({ length: Math.max(0, 4 - rows.length) }).map((_, i) => (
                    <tr key={`empty-${i}`} aria-hidden>
                      <td colSpan={7} className="border border-zinc-200 bg-zinc-50/30 h-8" />
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-2 border-t border-zinc-200 bg-zinc-50/50">
                <Button type="button" variant="outline" size="sm" onClick={addRow} className="gap-1 h-7 text-xs border-zinc-300 text-zinc-600 hover:bg-zinc-50 px-2.5">
                  <Plus className="h-3 w-3" />Add row
                </Button>
              </div>
            </div>

            {/* Status legend + Recorded by */}
            <div className="flex flex-wrap items-start gap-5 pt-2 border-t border-zinc-200">
              <div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide mb-1.5">Status Legend</p>
                <div className="grid grid-cols-2 gap-x-8 gap-y-0.5 text-xs text-zinc-500">
                  {STATUS_OPTIONS.map((o) => (<span key={o.value}><span className="font-bold text-zinc-700">{o.label}</span> — {o.description}</span>))}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <Label className="text-xs font-medium text-zinc-600 shrink-0">Recorded by</Label>
                <Select value={encodedBy} onValueChange={setEncodedBy} className="w-40 [&_button]:h-8 [&_button]:text-xs [&_button]:rounded [&_button]:w-full">
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
