"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Download, Printer } from "lucide-react"

export default function LightVehicleTimeSheet() {
  const [formData, setFormData] = useState({
    vehicleEquipmentType: "",
    serialGoNumber: "",
    vehicleEquipmentCapacity: "",
    operatorName: "",
    refNumber: "",
    date: new Date().toISOString().split("T")[0],
    morningStartTime: "",
    morningEndTime: "",
    afternoonStartTime: "",
    afternoonEndTime: "",
    eveningStartTime: "",
    eveningEndTime: "",
    totalWorkingHours: "",
    typeOfWork: "",
    idleHours: "",
    idleReason: "",
    downHours: "",
    kmReadingOrEngineHours: "",
    fuelLiters: "",
    projectWorkedOn: "",
    operator: "",
    siteManagerSupervisor: "",
    workEquipmentBranchHead: "",
    projectManager: "",
    inspection: "",
  })

  const handlePrint = () => window.print()
  const lineInput = "border-0 border-b border-black rounded-none px-0 py-1 h-7 text-[14px] bg-transparent focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-black"

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-4 print:p-6 print:space-y-2 print:scale-[0.95] print:font-[Arial]">
      <div className="flex justify-end gap-2 print:hidden mb-4">
        <Button variant="outline" onClick={handlePrint} className="shadow-sm">
          <Printer className="h-4 w-4 mr-2" /> Print
        </Button>
        <Button className="bg-ecwc-green hover:bg-ecwc-green-dark shadow-sm">
          <Download className="h-4 w-4 mr-2" /> Download PDF
        </Button>
      </div>

      <Card className="border-2 border-gray-300 shadow-lg print:shadow-none print:border-black">
        <CardHeader className="border-b border-black pb-3">
          <div className="grid grid-cols-3 items-center gap-4">
            <div className="flex justify-start">
              <div className="bg-ecwc-green p-3 rounded-lg border-2 border-ecwc-green-dark shadow-md relative h-32 w-48">
                <Image src="/logo.png" alt="ECWC Logo" fill className="object-contain drop-shadow-sm" />
              </div>
            </div>
            <div className="text-center leading-tight">
              <p className="text-[15px] font-bold">ኢትየጵያ ኮንስትራክሽን ሥራዎች ኮርፖሬሽን</p>
              <p className="text-[15px] font-bold">Ethiopian Construction and Works Corporation</p>
            </div>
            <div className="text-right text-[12px] leading-snug">
              <p>LIGHT VEHICLE &amp; PUBLIC TRANSPORT TIME SHEET / የቀላል ተሽከርካሪና ህዝብ ትራንስፖርት ታይም ሺት</p>
              <p><b>Document No:</b> CSF/EEC/CONSTR/PE/XXX</p>
              <p><b>Issue No:</b> 1</p>
              <p><b>Page No:</b> 1 of 1</p>
            </div>
          </div>
          <h2 className="text-center text-lg font-bold mt-4 underline underline-offset-2">
            LIGHT VEHICLE &amp; PUBLIC TRANSPORT TIME SHEET / የቀላል ተሽከርካሪና ህዝብ ትራንስፖርት ታይም ሺት
          </h2>
        </CardHeader>

        <CardContent className="p-4 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 border-b border-gray-300 pb-6">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">የተሽ/መሣሪያ ዓይነት / Vehicle/Equipment Type:</Label>
              <Input className={lineInput} value={formData.vehicleEquipmentType} onChange={(e) => setFormData(prev => ({ ...prev, vehicleEquipmentType: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">ሠ/ሴ/ጎ/ቁጥር / Serial/Go Number:</Label>
              <Input className={lineInput} value={formData.serialGoNumber} onChange={(e) => setFormData(prev => ({ ...prev, serialGoNumber: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">የተሽ/መሣ/አቅም(Capacity) / Capacity:</Label>
              <Input className={lineInput} value={formData.vehicleEquipmentCapacity} onChange={(e) => setFormData(prev => ({ ...prev, vehicleEquipmentCapacity: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">የኦፕሬተር ሥም / Operator&apos;s Name:</Label>
              <Input className={lineInput} value={formData.operatorName} onChange={(e) => setFormData(prev => ({ ...prev, operatorName: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">መ/ቁ / Ref No.:</Label>
              <Input className={lineInput} value={formData.refNumber} onChange={(e) => setFormData(prev => ({ ...prev, refNumber: e.target.value }))} />
            </div>
          </div>

          <div className="space-y-2 border-b border-gray-300 pb-6">
            <Label className="text-sm font-semibold">ቀን / Date:</Label>
            <Input type="date" className={lineInput} value={formData.date} onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))} />
          </div>

          <div className="space-y-4 border-b border-gray-300 pb-6">
            <h3 className="text-base font-bold">የስራ ሰዓታት / Working Hours</h3>
            <div className="space-y-3 border-b border-gray-200 pb-4">
              <h4 className="text-sm font-semibold">ጠዋት / Morning</h4>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">ሥራ የጀመረበት ሰዓት / Start Time:</Label>
                  <Input type="time" className={lineInput} value={formData.morningStartTime} onChange={(e) => setFormData(prev => ({ ...prev, morningStartTime: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">ሥራ ያቆመበት ሰዓት / End Time:</Label>
                  <Input type="time" className={lineInput} value={formData.morningEndTime} onChange={(e) => setFormData(prev => ({ ...prev, morningEndTime: e.target.value }))} />
                </div>
              </div>
            </div>
            <div className="space-y-3 border-b border-gray-200 pb-4">
              <h4 className="text-sm font-semibold">ከሰዓት / Afternoon</h4>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">ሥራ የጀመረበት ሰዓት / Start Time:</Label>
                  <Input type="time" className={lineInput} value={formData.afternoonStartTime} onChange={(e) => setFormData(prev => ({ ...prev, afternoonStartTime: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">ሥራ ያቆመበት ሰዓት / End Time:</Label>
                  <Input type="time" className={lineInput} value={formData.afternoonEndTime} onChange={(e) => setFormData(prev => ({ ...prev, afternoonEndTime: e.target.value }))} />
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">ማታ / Evening</h4>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">ሥራ የጀመረበት ሰዓት / Start Time:</Label>
                  <Input type="time" className={lineInput} value={formData.eveningStartTime} onChange={(e) => setFormData(prev => ({ ...prev, eveningStartTime: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">ሥራ ያቆመበት ሰዓት / End Time:</Label>
                  <Input type="time" className={lineInput} value={formData.eveningEndTime} onChange={(e) => setFormData(prev => ({ ...prev, eveningEndTime: e.target.value }))} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 border-b border-gray-300 pb-6">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">ጠቅላላ የተሰራ ሰዓት / Total Working Hours:</Label>
              <Input className={lineInput} value={formData.totalWorkingHours} onChange={(e) => setFormData(prev => ({ ...prev, totalWorkingHours: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">የስራው ዓይነት / Type of Work:</Label>
              <Input className={lineInput} value={formData.typeOfWork} onChange={(e) => setFormData(prev => ({ ...prev, typeOfWork: e.target.value }))} />
            </div>
          </div>

          <div className="space-y-4 border-b border-gray-300 pb-6">
            <h3 className="text-base font-bold">ሥራ ያልሰራበት (Idle) / Idle time</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">ጠቅላላ ሠዓት / Total Hours:</Label>
                <Input className={lineInput} value={formData.idleHours} onChange={(e) => setFormData(prev => ({ ...prev, idleHours: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">ምክንያት / Reason:</Label>
                <Input className={lineInput} value={formData.idleReason} onChange={(e) => setFormData(prev => ({ ...prev, idleReason: e.target.value }))} />
              </div>
            </div>
          </div>

          <div className="space-y-4 border-b border-gray-300 pb-6">
            <h3 className="text-base font-bold">በብልሽት ያልሰራበት (Down) / Down time</h3>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">ጠቅላላ ሠዓት / Total Hours:</Label>
              <Input className={lineInput} value={formData.downHours} onChange={(e) => setFormData(prev => ({ ...prev, downHours: e.target.value }))} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 border-b border-gray-300 pb-6">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">ኪ/ሜ ንባብ /የሞተር ቆጣሪ በሰዓት / Km Reading / Engine Hour Meter:</Label>
              <Input className={lineInput} value={formData.kmReadingOrEngineHours} onChange={(e) => setFormData(prev => ({ ...prev, kmReadingOrEngineHours: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">የቀዳው ነዳጅ /ሊትር/ / Fuel dispensed (Liter):</Label>
              <Input className={lineInput} value={formData.fuelLiters} onChange={(e) => setFormData(prev => ({ ...prev, fuelLiters: e.target.value }))} />
            </div>
          </div>

          <div className="space-y-2 border-b border-gray-300 pb-6">
            <Label className="text-sm font-semibold">የሰራበት ፕሮጀክት / Project Worked On:</Label>
            <Input className={lineInput} value={formData.projectWorkedOn} onChange={(e) => setFormData(prev => ({ ...prev, projectWorkedOn: e.target.value }))} />
          </div>

          <div className="space-y-4 border-b border-gray-300 pb-6">
            <h3 className="text-base font-bold">ፊርማ / Signature</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">ኦፕሬተር / Operator:</Label>
                <Input className={lineInput} value={formData.operator} onChange={(e) => setFormData(prev => ({ ...prev, operator: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">ሣይት ኃላፊ/ተቆጣጣሪ / Site Manager/Supervisor:</Label>
                <Input className={lineInput} value={formData.siteManagerSupervisor} onChange={(e) => setFormData(prev => ({ ...prev, siteManagerSupervisor: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">ወ/ኤ/ቡ/መሪ / W/E/B Head:</Label>
                <Input className={lineInput} value={formData.workEquipmentBranchHead} onChange={(e) => setFormData(prev => ({ ...prev, workEquipmentBranchHead: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">ፕ/ሥራ አስኪያጅ / Project Manager:</Label>
                <Input className={lineInput} value={formData.projectManager} onChange={(e) => setFormData(prev => ({ ...prev, projectManager: e.target.value }))} />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">ምርመራ / Inspection:</Label>
            <Input className={lineInput} value={formData.inspection} onChange={(e) => setFormData(prev => ({ ...prev, inspection: e.target.value }))} />
          </div>

          <div className="text-center text-xs border-t border-black pt-3 text-gray-600 italic">
            Please make sure that this document is the correct version before use.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
