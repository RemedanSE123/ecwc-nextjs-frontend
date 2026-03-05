"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectItem } from "@/components/ui/select"
import { Printer, ChevronDown, Truck, CalendarClock, FileSignature } from "lucide-react"

const PROJECT_OPTIONS = ["Project A", "Project B", "Site 1", "Branch HQ"]
const ASSIGNMENT_OPTIONS = ["Permanent", "Temporary", "Rental Return"]
const FUEL_OPTIONS = ["Full", "3/4", "1/2", "1/4", "Empty"]

export default function EquipmentTransferForm() {
  const pdfRef = useRef<HTMLDivElement>(null)
  const [formData, setFormData] = useState({
    fromProject: "",
    receivingProject: "",
    operatorDriverName: "",
    equipmentCode: "",
    equipmentType: "",
    kmHrReading: "0",
    fuelStatus: "",
    equipTransportedBy: "",
    transportedPlateNo: "",
    estimatedKm: "0",
    departureDate: new Date().toISOString().split("T")[0],
    departureTime: "",
    assignmentType: "",
    void: false,
    locked: false,
    refNo: "",
    date: new Date().toISOString().split("T")[0],
    transferredBy: "",
    approvedBy: "",
  })
  const handlePrint = () => window.print()

  const fi = "h-8 w-full min-w-0 rounded border border-zinc-200 bg-white px-2.5 text-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400"
  const sel = "[&_button]:h-8 [&_button]:text-xs [&_button]:px-2.5 [&_button]:rounded [&_button]:w-full"
  const lbl1 = "w-32 shrink-0 text-xs font-medium text-zinc-600 leading-tight"
  const lbl2 = "w-36 shrink-0 text-xs font-medium text-zinc-600 leading-tight"
  const secTitle = "flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2.5 pb-2 border-b border-zinc-200"

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
                <p className="text-xs font-semibold text-zinc-800 print:text-[14px] print:font-bold">የመሣሪያ ማስተላለፍ ወረቀት</p>
                <p className="text-[9px] text-zinc-500 print:text-[9px] print:font-bold print:text-black">EQUIPMENT TRANSFER FORM</p>
              </div>
              <div className="col-span-2 border-t border-zinc-200 flex flex-col items-center justify-center print:border-t print:border-black">
                <button type="button" onClick={handlePrint} className="print:hidden flex items-center gap-1 px-2 py-1 rounded bg-zinc-800 text-white text-[10px] font-medium hover:bg-zinc-900 transition-colors">
                  <Printer className="h-3 w-3" />Print
                </button>
                <span className="hidden print:block text-[10px]"><b>Page No.</b> 1 of 1</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-3 sm:p-4 bg-white print:p-6 print:bg-white">
            <div className="grid grid-cols-12 gap-x-0 gap-y-3">
              {/* Column 1: Transfer & equipment */}
              <div className="col-span-12 lg:col-span-4 lg:pr-4 lg:border-r lg:border-zinc-200 space-y-1.5">
                <p className={secTitle}><Truck className="h-3 w-3 shrink-0" /> Transfer & equipment</p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5"><Label className={lbl1}>From Project</Label><div className="flex-1 min-w-0"><Select value={formData.fromProject} onValueChange={(v) => setFormData((p) => ({ ...p, fromProject: v }))} className={sel}>{PROJECT_OPTIONS.map((o) => (<SelectItem key={o} value={o}>{o}</SelectItem>))}</Select></div></div>
                  <div className="flex items-center gap-1.5"><Label className={lbl1}>Receiving Project</Label><div className="flex-1 min-w-0"><Select value={formData.receivingProject} onValueChange={(v) => setFormData((p) => ({ ...p, receivingProject: v }))} className={sel}>{PROJECT_OPTIONS.map((o) => (<SelectItem key={o} value={o}>{o}</SelectItem>))}</Select></div></div>
                  <div className="flex items-center gap-1.5"><Label className={lbl1}>Operator/Driver</Label><div className="relative flex-1 min-w-0"><Input className={`${fi} pr-6`} value={formData.operatorDriverName} onChange={(e) => setFormData((p) => ({ ...p, operatorDriverName: e.target.value }))} /><ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-400 pointer-events-none" /></div></div>
                  <div className="flex items-center gap-1.5"><Label className={lbl1}>Equipment Code</Label><div className="relative flex-1 min-w-0"><Input className={`${fi} pr-6`} value={formData.equipmentCode} onChange={(e) => setFormData((p) => ({ ...p, equipmentCode: e.target.value }))} /><ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-400 pointer-events-none" /></div></div>
                  <div className="flex items-center gap-1.5"><Label className={lbl1}>Equipment Type</Label><div className="relative flex-1 min-w-0"><Input className={`${fi} pr-6`} value={formData.equipmentType} onChange={(e) => setFormData((p) => ({ ...p, equipmentType: e.target.value }))} /><ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-400 pointer-events-none" /></div></div>
                  <div className="flex items-center gap-1.5"><Label className={lbl1}>Km/Hr Reading</Label><Input type="number" className={`${fi} flex-1`} value={formData.kmHrReading} onChange={(e) => setFormData((p) => ({ ...p, kmHrReading: e.target.value }))} /></div>
                  <div className="flex items-center gap-1.5"><Label className={lbl1}>Fuel Status</Label><div className="flex-1 min-w-0"><Select value={formData.fuelStatus} onValueChange={(v) => setFormData((p) => ({ ...p, fuelStatus: v }))} className={sel}>{FUEL_OPTIONS.map((o) => (<SelectItem key={o} value={o}>{o}</SelectItem>))}</Select></div></div>
                  <div className="flex items-center gap-1.5"><Label className={lbl1}>Transported by</Label><Input className={`${fi} flex-1`} value={formData.equipTransportedBy} onChange={(e) => setFormData((p) => ({ ...p, equipTransportedBy: e.target.value }))} /></div>
                  <div className="flex items-center gap-1.5"><Label className={lbl1}>Transport Plate No</Label><Input className={`${fi} flex-1`} value={formData.transportedPlateNo} onChange={(e) => setFormData((p) => ({ ...p, transportedPlateNo: e.target.value }))} /></div>
                </div>
              </div>

              {/* Column 2: Schedule & assignment */}
              <div className="col-span-12 lg:col-span-5 lg:px-4 lg:border-r lg:border-zinc-200 space-y-1.5">
                <p className={secTitle}><CalendarClock className="h-3 w-3 shrink-0" /> Schedule & assignment</p>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2"><Label className={`${lbl2} whitespace-nowrap`}>Est. Km to destination</Label><Input type="number" className={`${fi} w-32 shrink-0`} value={formData.estimatedKm} onChange={(e) => setFormData((p) => ({ ...p, estimatedKm: e.target.value }))} /></div>
                  <div className="flex items-center justify-between gap-2"><Label className={lbl2}>Departure Date</Label><Input type="date" className={`${fi} w-32 shrink-0`} value={formData.departureDate} onChange={(e) => setFormData((p) => ({ ...p, departureDate: e.target.value }))} /></div>
                  <div className="flex items-center justify-between gap-2"><Label className={lbl2}>Departure Time</Label><Input type="time" className={`${fi} w-32 shrink-0`} value={formData.departureTime} onChange={(e) => setFormData((p) => ({ ...p, departureTime: e.target.value }))} /></div>
                  <div className="flex items-center justify-between gap-2"><Label className={lbl2}>Assignment Type</Label><div className="w-32 min-w-0 shrink-0"><Select value={formData.assignmentType} onValueChange={(v) => setFormData((p) => ({ ...p, assignmentType: v }))} className={sel}>{ASSIGNMENT_OPTIONS.map((o) => (<SelectItem key={o} value={o}>{o}</SelectItem>))}</Select></div></div>
                  <div className="flex items-center gap-4 pt-1">
                    <label className="flex items-center gap-2 text-xs font-medium cursor-pointer"><Checkbox checked={formData.void} onChange={(e) => setFormData((p) => ({ ...p, void: e.target.checked }))} />Void</label>
                    <label className="flex items-center gap-2 text-xs font-medium cursor-pointer"><Checkbox checked={formData.locked} onChange={(e) => setFormData((p) => ({ ...p, locked: e.target.checked }))} />Locked</label>
                  </div>
                </div>
              </div>

              {/* Column 3: Reference */}
              <div className="col-span-12 lg:col-span-3 lg:pl-4 space-y-1.5">
                <p className={secTitle}><FileSignature className="h-3 w-3 shrink-0" /> Reference</p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2"><Label className="w-14 shrink-0 text-xs font-medium text-zinc-600">Ref.No.</Label><Input className={`${fi} flex-1`} value={formData.refNo} onChange={(e) => setFormData((p) => ({ ...p, refNo: e.target.value }))} /></div>
                  <div className="flex items-center gap-2"><Label className="w-14 shrink-0 text-xs font-medium text-zinc-600">Date</Label><Input type="date" className={`${fi} flex-1`} value={formData.date} onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value }))} /></div>
                </div>
              </div>

              {/* Approval row */}
              <div className="col-span-12 pt-3 mt-1 border-t border-zinc-200 flex flex-wrap items-end gap-x-6 gap-y-2">
                <div className="flex items-center gap-2 min-w-0 flex-1"><Label className="w-28 shrink-0 text-xs font-medium text-zinc-600">Transferred by</Label><div className="flex-1 min-w-0"><Select value={formData.transferredBy} onValueChange={(v) => setFormData((p) => ({ ...p, transferredBy: v }))} className={sel}><SelectItem value="user1">User 1</SelectItem><SelectItem value="user2">User 2</SelectItem></Select></div></div>
                <div className="flex items-center gap-2 min-w-0 flex-1"><Label className="w-28 shrink-0 text-xs font-medium text-zinc-600">Approved by</Label><div className="flex-1 min-w-0"><Select value={formData.approvedBy} onValueChange={(v) => setFormData((p) => ({ ...p, approvedBy: v }))} className={sel}><SelectItem value="mgr1">Manager 1</SelectItem><SelectItem value="mgr2">Manager 2</SelectItem></Select></div></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
