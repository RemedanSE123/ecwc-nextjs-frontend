"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Download, Printer } from "lucide-react"

export default function DryCargoTimeSheet() {
  const [formData, setFormData] = useState({
    vehicleType: "",
    serialGoNumber: "",
    vehicleCapacity: "",
    refNumber: "",
    date: new Date().toISOString().split("T")[0],
    loadingAsphaltModerate: "",
    loadingAsphaltSevere: "",
    loadingGravelModerate: "",
    loadingGravelSevere: "",
    notLoadingAsphaltModerate: "",
    notLoadingAsphaltSevere: "",
    notLoadingGravelModerate: "",
    notLoadingGravelSevere: "",
    cargoType: "",
    cargoOrigin: "",
    cargoDestination: "",
    idleHours: "",
    idleReason: "",
    downHours: "",
    kmReading: "",
    fuelLiters: "",
    operator: "",
    siteManager: "",
    workEquipmentBranchHead: "",
    projectManager: "",
    inspection: "",
    confirmingOfficial: ""
  })

  const handlePrint = () => {
    window.print()
  }

  const lineInput = "border-0 border-b border-black rounded-none px-0 py-1 h-7 text-[14px] bg-transparent focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-black"

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-4 print:p-6 print:space-y-2 print:scale-[0.95] print:font-[Arial]">
      <div className="flex justify-end gap-2 print:hidden mb-4">
        <Button variant="outline" onClick={handlePrint} className="shadow-sm">
          <Printer className="h-4 w-4 mr-2" />
          Print
        </Button>
        <Button className="bg-ecwc-green hover:bg-ecwc-green-dark shadow-sm">
          <Download className="h-4 w-4 mr-2" />
          Download PDF
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
              <p className="text-[15px] font-bold">
                ኢትየጵያ ኮንስትራክሽን ሥራዎች ኮርፖሬሽን
              </p>
              <p className="text-[15px] font-bold">
                Ethiopian Construction and Works Corporation
              </p>
            </div>
            <div className="text-right text-[12px] leading-snug">
              <p>
                TIME SHEET FOR DRY CARGO VEHICLES / የደረቅ ጭነት ተሽከርካሪዎች ታይም ሺት
              </p>
              <p>
                <b>Document No:</b> CSF/EEC/CONSTR/PE/XXX
              </p>
              <p>
                <b>Issue No:</b> 1
              </p>
              <p>
                <b>Page No:</b> 1 of 1
              </p>
            </div>
          </div>
          <h2 className="text-center text-lg font-bold mt-4 underline underline-offset-2">
            TIME SHEET FOR DRY CARGO VEHICLES / የደረቅ ጭነት ተሽከርካሪዎች ታይም ሺት
          </h2>
        </CardHeader>

        <CardContent className="p-4 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-b border-gray-300 pb-6">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">የተሽከርካሪ ዓይነት / Vehicle Type:</Label>
              <Input
                className={lineInput}
                value={formData.vehicleType}
                onChange={(e) => setFormData(prev => ({ ...prev, vehicleType: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">ሠ/ጎ/ቁጥር / Serial/Go Number:</Label>
              <Input
                className={lineInput}
                value={formData.serialGoNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, serialGoNumber: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">የተሽ/አቅም(Capacity) / Vehicle Capacity:</Label>
              <Input
                className={lineInput}
                value={formData.vehicleCapacity}
                onChange={(e) => setFormData(prev => ({ ...prev, vehicleCapacity: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">መ/ቁ / Ref No.:</Label>
              <Input
                className={lineInput}
                value={formData.refNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, refNumber: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2 border-b border-gray-300 pb-6">
            <Label className="text-sm font-semibold">ቀን / Date:</Label>
            <Input
              type="date"
              className={lineInput}
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            />
          </div>

          <div className="space-y-4 border-b border-gray-300 pb-6">
            <h3 className="text-base font-bold">በአስፓልት መንገድ ሲጭን / When loading on asphalt road</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">ሞደሬት ዞን በኪ/ሜ / Moderate Zone in Km:</Label>
                <Input
                  className={lineInput}
                  value={formData.loadingAsphaltModerate}
                  onChange={(e) => setFormData(prev => ({ ...prev, loadingAsphaltModerate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">ሲቨር ዞን በኪ/ሜ / Severe Zone in Km:</Label>
                <Input
                  className={lineInput}
                  value={formData.loadingAsphaltSevere}
                  onChange={(e) => setFormData(prev => ({ ...prev, loadingAsphaltSevere: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 border-b border-gray-300 pb-6">
            <h3 className="text-base font-bold">በግራቭል መንገድ ሲጭን / When loading on gravel road</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">ሞደሬት ዞን በኪ/ሜ / Moderate Zone in Km:</Label>
                <Input
                  className={lineInput}
                  value={formData.loadingGravelModerate}
                  onChange={(e) => setFormData(prev => ({ ...prev, loadingGravelModerate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">ሲቨር ዞን በኪ/ሜ / Severe Zone in Km:</Label>
                <Input
                  className={lineInput}
                  value={formData.loadingGravelSevere}
                  onChange={(e) => setFormData(prev => ({ ...prev, loadingGravelSevere: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 border-b border-gray-300 pb-6">
            <h3 className="text-base font-bold">በአስፓልት መንገድ ሳይጭን / When not loading on asphalt road</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">ሞደሬት ዞን በኪ/ሜ / Moderate Zone in Km:</Label>
                <Input
                  className={lineInput}
                  value={formData.notLoadingAsphaltModerate}
                  onChange={(e) => setFormData(prev => ({ ...prev, notLoadingAsphaltModerate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">ሲቨር ዞን በኪ/ሜ / Severe Zone in Km:</Label>
                <Input
                  className={lineInput}
                  value={formData.notLoadingAsphaltSevere}
                  onChange={(e) => setFormData(prev => ({ ...prev, notLoadingAsphaltSevere: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 border-b border-gray-300 pb-6">
            <h3 className="text-base font-bold">በግራቭል መንገድ ሳይጭን / When not loading on gravel road</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">ሞደሬት ዞን በኪ/ሜ / Moderate Zone in Km:</Label>
                <Input
                  className={lineInput}
                  value={formData.notLoadingGravelModerate}
                  onChange={(e) => setFormData(prev => ({ ...prev, notLoadingGravelModerate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">ሲቨር ዞን በኪ/ሜ / Severe Zone in Km:</Label>
                <Input
                  className={lineInput}
                  value={formData.notLoadingGravelSevere}
                  onChange={(e) => setFormData(prev => ({ ...prev, notLoadingGravelSevere: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 border-b border-gray-300 pb-6">
            <h3 className="text-base font-bold">የጭነት / Cargo</h3>
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">ዓይነት / Type:</Label>
                <Input
                  className={lineInput}
                  value={formData.cargoType}
                  onChange={(e) => setFormData(prev => ({ ...prev, cargoType: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">መነሻ / Origin:</Label>
                <Input
                  className={lineInput}
                  value={formData.cargoOrigin}
                  onChange={(e) => setFormData(prev => ({ ...prev, cargoOrigin: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">መድረሻ / Destination:</Label>
                <Input
                  className={lineInput}
                  value={formData.cargoDestination}
                  onChange={(e) => setFormData(prev => ({ ...prev, cargoDestination: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 border-b border-gray-300 pb-6">
            <h3 className="text-base font-bold">ሥራ ያልሰራበት (Idle) / Idle time</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">ጠቅላላ ሠዓት / Total Hours:</Label>
                <Input
                  className={lineInput}
                  value={formData.idleHours}
                  onChange={(e) => setFormData(prev => ({ ...prev, idleHours: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">ምክንያት / Reason:</Label>
                <Input
                  className={lineInput}
                  value={formData.idleReason}
                  onChange={(e) => setFormData(prev => ({ ...prev, idleReason: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 border-b border-gray-300 pb-6">
            <h3 className="text-base font-bold">በብልሽት ያልሰራበት (Down) / Down time due to breakdown</h3>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">ጠቅላላ ሠዓት / Total Hours:</Label>
              <Input
                className={lineInput}
                value={formData.downHours}
                onChange={(e) => setFormData(prev => ({ ...prev, downHours: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 border-b border-gray-300 pb-6">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">ኪ/ሜ ንባብ / Km Reading:</Label>
              <Input
                className={lineInput}
                value={formData.kmReading}
                onChange={(e) => setFormData(prev => ({ ...prev, kmReading: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">የቀዳው ነዳጅ /ሊትር/ / Fuel dispensed /Liter/:</Label>
              <Input
                className={lineInput}
                value={formData.fuelLiters}
                onChange={(e) => setFormData(prev => ({ ...prev, fuelLiters: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-4 border-b border-gray-300 pb-6">
            <h3 className="text-base font-bold">ፊርማ / Signature</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">ኦፕሬተር / Operator:</Label>
                <Input
                  className={lineInput}
                  value={formData.operator}
                  onChange={(e) => setFormData(prev => ({ ...prev, operator: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">ሣይት ኃላፊ / Site Manager:</Label>
                <Input
                  className={lineInput}
                  value={formData.siteManager}
                  onChange={(e) => setFormData(prev => ({ ...prev, siteManager: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">ወ/ኤ/ቡ/መሪ / Work/Equipment/Branch Head:</Label>
                <Input
                  className={lineInput}
                  value={formData.workEquipmentBranchHead}
                  onChange={(e) => setFormData(prev => ({ ...prev, workEquipmentBranchHead: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">ፕ/ሥራ አስኪያጅ / Project Manager:</Label>
                <Input
                  className={lineInput}
                  value={formData.projectManager}
                  onChange={(e) => setFormData(prev => ({ ...prev, projectManager: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2 border-b border-gray-300 pb-6">
            <Label className="text-sm font-semibold">ምርመራ / Inspection:</Label>
            <Input
              className={lineInput}
              value={formData.inspection}
              onChange={(e) => setFormData(prev => ({ ...prev, inspection: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">ያረጋገጠው ኃላፊ/ ፊርማ / Confirming Official / Signature:</Label>
            <Input
              className={lineInput}
              value={formData.confirmingOfficial}
              onChange={(e) => setFormData(prev => ({ ...prev, confirmingOfficial: e.target.value }))}
            />
          </div>

          <div className="text-center text-xs border-t border-black pt-3 text-gray-600 italic">
            Please make sure that this document is the correct version before use.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
