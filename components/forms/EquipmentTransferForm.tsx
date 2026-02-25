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

  const inputClass =
    "h-10 w-full min-w-0 rounded-md border border-input bg-background px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
  const compactInputClass =
    "h-9 w-full min-w-0 rounded border border-input bg-background px-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1"
  const labelCol1 = "w-32 shrink-0 text-xs font-medium text-foreground/90 leading-tight"
  const labelCol2 = "w-36 shrink-0 text-xs font-medium text-foreground/90 leading-tight"
  const labelCol3 = "w-24 shrink-0 text-xs font-medium text-foreground/90 leading-tight"
  const sectionTitle = "flex items-center gap-2 text-sm font-semibold text-foreground mb-3 pb-2 border-b border-primary/20 border-l-2 border-l-primary pl-2 rounded-r"

  return (
    <div
      id="form-print-area"
      className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 py-6 print:max-w-[210mm] print:mx-0 print:p-0 print:font-[Arial] min-h-screen"
    >
      {/* Screen-only: page header + actions */}
      <div className="print:hidden mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-foreground border-l-4 border-primary pl-3">
              Equipment Transfer
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Record and approve equipment transfers between projects.
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
          {/* Form header: logo + title (print-friendly structure preserved) */}
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
                  የመሣሪያ ማስተላለፍ ወረቀት
                </p>
                <p className="text-[9px] font-medium text-primary print:text-[9px] print:font-bold print:text-black">
                  EQUIPMENT TRANSFER FORM
                </p>
              </div>
              <div className="col-span-2 flex flex-col justify-center pl-2 text-[11px] text-muted-foreground border-t border-border print:border-t-2 print:border-black print:pl-1.5 print:text-[10px] print:text-black">
                <p><b>Page No.</b></p>
                <p>1 of 1</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 sm:p-8 bg-muted/15 print:p-6 print:bg-white">
            <div className="grid grid-cols-12 gap-x-0 gap-y-6">
              {/* Column 1: Transfer & equipment */}
              <div className="col-span-12 lg:col-span-4 lg:pr-6 lg:border-r lg:border-border space-y-2 [&_button]:h-9 [&_button]:text-sm [&_button]:px-2.5 [&_button]:rounded">
                <p className={sectionTitle}><Truck className="h-4 w-4 text-primary shrink-0" /> Transfer & equipment</p>
                <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label className={labelCol1}>From Project</Label>
                  <div className="flex-1 min-w-0">
                    <Select
                      value={formData.fromProject}
                      onValueChange={(v) => setFormData((p) => ({ ...p, fromProject: v }))}
                    >
                      {PROJECT_OPTIONS.map((o) => (
                        <SelectItem key={o} value={o}>{o}</SelectItem>
                      ))}
                    </Select>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Label className={labelCol1}>Receiving Project</Label>
                  <div className="flex-1 min-w-0">
                    <Select
                      value={formData.receivingProject}
                      onValueChange={(v) => setFormData((p) => ({ ...p, receivingProject: v }))}
                    >
                      {PROJECT_OPTIONS.map((o) => (
                        <SelectItem key={o} value={o}>{o}</SelectItem>
                      ))}
                    </Select>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Label className={labelCol1}>Operator/Driver Name</Label>
                  <div className="relative flex-1 min-w-0">
                    <Input className={`${compactInputClass} flex-1 pr-8`} value={formData.operatorDriverName} onChange={(e) => setFormData((p) => ({ ...p, operatorDriverName: e.target.value }))} />
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Label className={labelCol1}>Equipment Code</Label>
                  <div className="relative flex-1 min-w-0">
                    <Input className={`${compactInputClass} flex-1 pr-8`} value={formData.equipmentCode} onChange={(e) => setFormData((p) => ({ ...p, equipmentCode: e.target.value }))} />
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Label className={labelCol1}>Equipment Type</Label>
                  <div className="relative flex-1 min-w-0">
                    <Input className={`${compactInputClass} flex-1 pr-8`} value={formData.equipmentType} onChange={(e) => setFormData((p) => ({ ...p, equipmentType: e.target.value }))} />
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Label className={labelCol1}>Km/Hr Reading</Label>
                  <Input type="number" className={`${compactInputClass} flex-1`} value={formData.kmHrReading} onChange={(e) => setFormData((p) => ({ ...p, kmHrReading: e.target.value }))} />
                </div>
                <div className="flex items-center gap-2">
                  <Label className={labelCol1}>Fuel Status</Label>
                  <div className="flex-1 min-w-0">
                    <Select value={formData.fuelStatus} onValueChange={(v) => setFormData((p) => ({ ...p, fuelStatus: v }))}>
                      {FUEL_OPTIONS.map((o) => (
                        <SelectItem key={o} value={o}>{o}</SelectItem>
                      ))}
                    </Select>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Label className={labelCol1}>Equip. Transported by</Label>
                  <Input className={`${compactInputClass} flex-1`} value={formData.equipTransportedBy} onChange={(e) => setFormData((p) => ({ ...p, equipTransportedBy: e.target.value }))} />
                </div>
                <div className="flex items-center gap-2">
                  <Label className={labelCol1}>Transported Plate No</Label>
                  <Input className={`${compactInputClass} flex-1`} value={formData.transportedPlateNo} onChange={(e) => setFormData((p) => ({ ...p, transportedPlateNo: e.target.value }))} />
                </div>
                </div>
              </div>

              {/* Column 2: Schedule & assignment — more width */}
              <div className="col-span-12 lg:col-span-5 lg:px-6 lg:border-r lg:border-border space-y-2 [&_button]:h-9 [&_button]:text-sm [&_button]:px-2.5 [&_button]:rounded">
                <p className={sectionTitle}><CalendarClock className="h-4 w-4 text-primary shrink-0" /> Schedule & assignment</p>
                <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 flex-nowrap">
                  <Label className={`${labelCol2} whitespace-nowrap shrink-0`}>Estimated Km to destination</Label>
                  <Input
                    type="number"
                    className={`${compactInputClass} w-36 min-w-0 shrink-0`}
                    value={formData.estimatedKm}
                    onChange={(e) => setFormData((p) => ({ ...p, estimatedKm: e.target.value }))}
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <Label className={labelCol2}>Departure Date</Label>
                  <Input
                    type="date"
                    className={`${compactInputClass} w-36 min-w-0 shrink-0`}
                    value={formData.departureDate}
                    onChange={(e) => setFormData((p) => ({ ...p, departureDate: e.target.value }))}
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <Label className={labelCol2}>Departure Time</Label>
                  <Input
                    type="time"
                    className={`${compactInputClass} w-36 min-w-0 shrink-0`}
                    value={formData.departureTime}
                    onChange={(e) => setFormData((p) => ({ ...p, departureTime: e.target.value }))}
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <Label className={labelCol2}>Assignment Type</Label>
                  <div className="w-36 min-w-0 shrink-0">
                    <Select
                      value={formData.assignmentType}
                      onValueChange={(v) => setFormData((p) => ({ ...p, assignmentType: v }))}
                    >
                      {ASSIGNMENT_OPTIONS.map((o) => (
                        <SelectItem key={o} value={o}>{o}</SelectItem>
                      ))}
                    </Select>
                  </div>
                </div>
                <div className="flex items-center gap-4 pt-1">
                  <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                    <Checkbox
                      checked={formData.void}
                      onChange={(e) => setFormData((p) => ({ ...p, void: e.target.checked }))}
                    />
                    Void
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                    <Checkbox
                      checked={formData.locked}
                      onChange={(e) => setFormData((p) => ({ ...p, locked: e.target.checked }))}
                    />
                    Locked
                  </label>
                </div>
                </div>
              </div>

              {/* Column 3: Reference & approval — narrower (Ref.No. + Date only) */}
              <div className="col-span-12 lg:col-span-3 lg:pl-6 space-y-2 [&_button]:h-9 [&_button]:text-sm [&_button]:px-2.5 [&_button]:rounded">
                <p className={sectionTitle}><FileSignature className="h-4 w-4 text-primary shrink-0" /> Reference & approval</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <Label className="w-14 shrink-0 text-xs font-medium text-foreground/90 leading-tight">Ref.No.</Label>
                    <Input
                      className={`${compactInputClass} flex-1`}
                      value={formData.refNo}
                      onChange={(e) => setFormData((p) => ({ ...p, refNo: e.target.value }))}
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <Label className="w-14 shrink-0 text-xs font-medium text-foreground/90 leading-tight">Date</Label>
                    <Input
                      type="date"
                      className={`${compactInputClass} flex-1`}
                      value={formData.date}
                      onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom row: Transferred by & Approved by — spans columns 2+3 for full width */}
              <div className="col-span-12 lg:col-start-5 lg:col-span-8 pt-4 mt-2 border-t border-border flex flex-wrap items-end gap-x-8 gap-y-3 [&_button]:h-9 [&_button]:text-sm [&_button]:px-2.5 [&_button]:rounded">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Label className="w-24 shrink-0 text-xs font-medium text-foreground/90">Transferred by</Label>
                  <div className="flex-1 min-w-0">
                    <Select
                      value={formData.transferredBy}
                      onValueChange={(v) => setFormData((p) => ({ ...p, transferredBy: v }))}
                    >
                      <SelectItem value="user1">User 1</SelectItem>
                      <SelectItem value="user2">User 2</SelectItem>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Label className="w-24 shrink-0 text-xs font-medium text-foreground/90">Approved by</Label>
                  <div className="flex-1 min-w-0">
                    <Select
                      value={formData.approvedBy}
                      onValueChange={(v) => setFormData((p) => ({ ...p, approvedBy: v }))}
                    >
                      <SelectItem value="mgr1">Manager 1</SelectItem>
                      <SelectItem value="mgr2">Manager 2</SelectItem>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
