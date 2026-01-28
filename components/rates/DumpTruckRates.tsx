"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"

const dumpRates = [
  { distance: "0 - 5 km", modSoil: 26.83, modStone: 27.86, sevSoil: 29.88, sevStone: 39.92 },
  { distance: "5 - 10 km", modSoil: 22.76, modStone: 24.63, sevSoil: 27.86, sevStone: 37.37 },
  { distance: "10 - 50 km", modSoil: 20.37, modStone: 21.05, sevSoil: 20.38, sevStone: 29.52 },
  { distance: "50 - 100 km", modSoil: 16.33, modStone: 17.84, sevSoil: 20.02, sevStone: 27.19 },
  { distance: "Above 100 km", modSoil: 12.9, modStone: 13.09, sevSoil: 16.64, sevStone: 23.37 },
]

export default function DumpTruckRates() {
  return (
    <Card className="border border-orange-200 bg-gradient-to-br from-white to-orange-50/30 shadow-sm">
      <CardHeader className="pb-3">
        <h3 className="text-base font-bold text-orange-800">
          የገልባጭ ተሽከርካሪዎች የኪራይ ዋጋ / Dump Truck Rental (Birr/km, fuel & VAT incl.)
        </h3>
        <p className="text-xs text-gray-600">ርቀት በኪሎ ሜትር • Soil / Stone & Sand</p>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <div className="min-w-[520px]">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-orange-600 text-white">
                <th className="text-left p-2 font-semibold">Distance (km)</th>
                <th colSpan={2} className="p-2 text-center border-l border-orange-500">Moderate Zone</th>
                <th colSpan={2} className="p-2 text-center border-l border-orange-500">Severe Zone</th>
              </tr>
              <tr className="bg-orange-500/90 text-white text-xs">
                <th className="p-1"></th>
                <th className="p-1 border-l border-orange-400">Soil</th>
                <th className="p-1">Stone/Sand</th>
                <th className="p-1 border-l border-orange-400">Soil</th>
                <th className="p-1">Stone/Sand</th>
              </tr>
            </thead>
            <tbody>
              {dumpRates.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-orange-50/50"}>
                  <td className="p-2 font-medium text-gray-800">{row.distance}</td>
                  <td className="p-2 text-center border-l border-orange-100">{row.modSoil}</td>
                  <td className="p-2 text-center">{row.modStone}</td>
                  <td className="p-2 text-center border-l border-orange-100">{row.sevSoil}</td>
                  <td className="p-2 text-center">{row.sevStone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
