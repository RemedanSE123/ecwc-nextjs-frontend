"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Download, Printer } from "lucide-react"
import html2pdf from "html2pdf.js"

export default function DumpTruckTimeSheet() {
  const pdfRef = useRef<HTMLDivElement>(null)
  const [formData, setFormData] = useState({
    vehicleType: "",
    serialGoNumber: "",
    vehicleCapacity: "",
    refNumber: "",
    date: new Date().toISOString().split("T")[0],
    // Day total work: trips by distance
    trips0to5km: "",
    trips5to10km: "",
    trips10to50km: "",
    trips50to100km: "",
    tripsOver100km: "",
    // Cargo
    cargoType: "",
    cargoOrigin: "",
    cargoDestination: "",
    // Idle
    idleHours: "",
    idleReason: "",
    // Down
    downHours: "",
    kmReading: "",
    fuelLiters: "",
    operator: "",
    siteManager: "",
    workEquipmentBranchHead: "",
    projectManager: "",
    inspection: "",
  })

  const handlePrint = () => window.print()

  const handleDownloadPDF = async () => {
    if (!pdfRef.current) return
    
    const element = pdfRef.current
    const opt = {
      margin: [10, 10, 10, 10],
      filename: 'dump-truck-timesheet.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        logging: false,
        backgroundColor: '#ffffff'
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    }
    
    await html2pdf().set(opt).from(element).save()
  }

  const lineInput = "border-0 border-b-2 border-black rounded-none px-0 py-1 h-7 min-h-[1.75rem] text-[15px] font-medium text-black bg-white focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-black print:text-black print:bg-white print:min-h-[1.25rem] [color-scheme:light]"

  return (
    <div id="form-print-area" className="max-w-5xl mx-auto p-6 space-y-4 print:max-w-[210mm] print:mx-0 print:p-0 print:space-y-2 print:font-[Arial]">
      <div className="flex justify-end gap-2 print:hidden mb-4">
        <Button variant="outline" onClick={handlePrint} className="shadow-sm">
          <Printer className="h-4 w-4 mr-2" /> Print
        </Button>
        <Button onClick={handleDownloadPDF} className="bg-ecwc-green hover:bg-ecwc-green-dark shadow-sm">
          <Download className="h-4 w-4 mr-2" /> Download PDF
        </Button>
      </div>

      <div ref={pdfRef} className="w-full max-w-[210mm] mx-auto bg-white">
        <Card className="border-2 border-gray-300 shadow-lg print:shadow-none print:border-black print:break-inside-avoid">
        <CardHeader className="p-0 border-b-2 border-black">
          <div className="grid grid-cols-12 border-2 border-black">
            <div className="col-span-2 border-r-2 border-black flex items-center justify-center p-1.5 relative h-20">
              <Image src="/ecwc png logo.png" alt="ECWC Logo" fill className="object-contain" />
            </div>
            <div className="col-span-8 border-r-2 border-black flex flex-col items-center justify-center py-1.5 text-center">
              <p className="text-[18px] font-bold">ኢትየጵያ ኮንስትራክሽን ሥራዎች ኮርፖሬሽን</p>
              <p className="text-[10px] font-bold">ETHIOPIAN CONSTRUCTION WORKS CORPORATION</p>
            </div>
            <div className="col-span-2 flex flex-col justify-center pl-2 text-[12px]">
              <p><b>Document No.</b></p>
              <p>OF/ECWC/xxx</p>
            </div>
            <div className="col-span-2 border-r-2 border-t border-black flex flex-col items-center justify-center py-1 text-[12px]">
              <p><b>Issue No.</b></p>
              <p>1</p>
            </div>
            <div className="col-span-8 border-r-2 border-t border-black flex flex-col items-center justify-center py-1 text-center">
              <p className="text-[18px] font-bold">የገልባጭ ተሽከርካሪዎች ታይም ሺት</p>
              <p className="text-[10px] font-bold">DUMP TRUCK TIME SHEET</p>
            </div>
            <div className="col-span-2 flex flex-col justify-center pl-2 text-[12px] border-t-2 border-black">
              <p><b>Page No.</b></p>
              <p>1 of 1</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-b border-gray-300 pb-6">
            <div className="space-y-2">
              <Label className="flex flex-col text-[10px] leading-tight">
                <span>የተሽከርካሪ ዓይነት</span>
                <span>Vehicle Type:</span>
              </Label>
              <Input className={lineInput} value={formData.vehicleType} onChange={(e) => setFormData(prev => ({ ...prev, vehicleType: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">ሠ/ጎ/ቁጥር / Serial/Go Number:</Label>
              <Input className={lineInput} value={formData.serialGoNumber} onChange={(e) => setFormData(prev => ({ ...prev, serialGoNumber: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label className="flex flex-col text-[10px] leading-tight">
                <span>የተሽ/አቅም</span>
                <span>Vehicle Capacity:</span>
              </Label>
              <Input className={lineInput} value={formData.vehicleCapacity} onChange={(e) => setFormData(prev => ({ ...prev, vehicleCapacity: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label className="flex flex-col text-[10px] leading-tight">
                <span>መ/ቁ</span>
                <span>Ref No.:</span>
              </Label>
              <Input className={lineInput} value={formData.refNumber} onChange={(e) => setFormData(prev => ({ ...prev, refNumber: e.target.value }))} />
            </div>
          </div>

          <div className="space-y-2 border-b border-gray-300 pb-6">
            <Label className="flex flex-col text-[10px] leading-tight">
              <span>ቀን</span>
              <span>Date:</span>
            </Label>
            <Input type="date" className={lineInput} value={formData.date} onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))} />
          </div>

          <div className="space-y-4 border-b border-gray-300 pb-6">
            <h3 className="text-base font-bold">በቀን ጠቅላላ የተሰራ ሥራ በኪ/ሜ እና ምልልስ / Day total work (km & trips)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label className="flex flex-col text-[10px] leading-tight">
                  <span>ከ0-5 ኪ/ሜ ጠቅላላ ምልልስ</span>
                  <span>0-5 km Total trips:</span>
                </Label>
                <Input className={lineInput} value={formData.trips0to5km} onChange={(e) => setFormData(prev => ({ ...prev, trips0to5km: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label className="flex flex-col text-[10px] leading-tight">
                  <span>&gt;5-10 ኪ/ሜ ጠቅላላ ምልልስ</span>
                  <span>&gt;5-10 km Total trips:</span>
                </Label>
                <Input className={lineInput} value={formData.trips5to10km} onChange={(e) => setFormData(prev => ({ ...prev, trips5to10km: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">&gt;10-50 ኪ/ሜ ጠቅላላ ምልልስ:</Label>
                <Input className={lineInput} value={formData.trips10to50km} onChange={(e) => setFormData(prev => ({ ...prev, trips10to50km: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label className="flex flex-col text-[10px] leading-tight">
                  <span>&gt;50-100 ኪ/ሜ ጠቅላላ ምልልስ</span>
                  <span>&gt;50-100 km Total trips:</span>
                </Label>
                <Input className={lineInput} value={formData.trips50to100km} onChange={(e) => setFormData(prev => ({ ...prev, trips50to100km: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">&gt;100 ኪ/ሜ ጠቅላላ ምልልስ:</Label>
                <Input className={lineInput} value={formData.tripsOver100km} onChange={(e) => setFormData(prev => ({ ...prev, tripsOver100km: e.target.value }))} />
              </div>
            </div>
          </div>

          <div className="space-y-4 border-b border-gray-300 pb-6">
            <h3 className="text-base font-bold">የጭነት / Cargo</h3>
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="flex flex-col text-[10px] leading-tight">
                  <span>ዓይነት</span>
                  <span>Type:</span>
                </Label>
                <Input className={lineInput} value={formData.cargoType} onChange={(e) => setFormData(prev => ({ ...prev, cargoType: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">መነሻ / Origin:</Label>
                <Input className={lineInput} value={formData.cargoOrigin} onChange={(e) => setFormData(prev => ({ ...prev, cargoOrigin: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label className="flex flex-col text-[10px] leading-tight">
                  <span>መድረሻ</span>
                  <span>Destination:</span>
                </Label>
                <Input className={lineInput} value={formData.cargoDestination} onChange={(e) => setFormData(prev => ({ ...prev, cargoDestination: e.target.value }))} />
              </div>
            </div>
          </div>

          <div className="space-y-4 border-b border-gray-300 pb-6">
            <h3 className="text-base font-bold">ሥራ ያልሰራበት (Idle) / Idle time</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="flex flex-col text-[10px] leading-tight">
                  <span>ጠቅላላ ሠዓት</span>
                  <span>Total Hours:</span>
                </Label>
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
              <Label className="flex flex-col text-[10px] leading-tight">
                <span>ኪ/ሜ ንባብ</span>
                <span>Km Reading:</span>
              </Label>
              <Input className={lineInput} value={formData.kmReading} onChange={(e) => setFormData(prev => ({ ...prev, kmReading: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">የቀዳው ነዳጅ /ሊትር/ / Fuel dispensed (Liter):</Label>
              <Input className={lineInput} value={formData.fuelLiters} onChange={(e) => setFormData(prev => ({ ...prev, fuelLiters: e.target.value }))} />
            </div>
          </div>

          <div className="space-y-4 border-b border-gray-300 pb-6">
            <h3 className="text-base font-bold">ፊርማ / Signature</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="flex flex-col text-[10px] leading-tight">
                  <span>ኦፕሬተር</span>
                  <span>Operator:</span>
                </Label>
                <Input className={lineInput} value={formData.operator} onChange={(e) => setFormData(prev => ({ ...prev, operator: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">ሣይት ኃላፊ / Site Manager:</Label>
                <Input className={lineInput} value={formData.siteManager} onChange={(e) => setFormData(prev => ({ ...prev, siteManager: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label className="flex flex-col text-[10px] leading-tight">
                  <span>ወ/ኤ/ቡ/መሪ</span>
                  <span>W/E/B Head:</span>
                </Label>
                <Input className={lineInput} value={formData.workEquipmentBranchHead} onChange={(e) => setFormData(prev => ({ ...prev, workEquipmentBranchHead: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">ፕ/ሥራ አስኪያጅ / Project Manager:</Label>
                <Input className={lineInput} value={formData.projectManager} onChange={(e) => setFormData(prev => ({ ...prev, projectManager: e.target.value }))} />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex flex-col text-[10px] leading-tight">
              <span>ምርመራ</span>
              <span>Inspection:</span>
            </Label>
            <Input className={lineInput} value={formData.inspection} onChange={(e) => setFormData(prev => ({ ...prev, inspection: e.target.value }))} />
          </div>

          <div className="text-center text-xs border-t border-black pt-3 text-gray-600 italic">
            Please make sure that this document is the correct version before use.
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
