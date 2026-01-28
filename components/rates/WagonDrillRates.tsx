"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"

const wagonRates = [
  { depth: "0-3m", softRock: 1762.5, hardRock: 2481.12 },
  { depth: ">3-6m", softRock: 1902.15, hardRock: 2766.16 },
  { depth: ">6-9m", softRock: 2263.44, hardRock: 3048.81 },
]

export default function WagonDrillRates() {
  return (
    <Card className="border border-amber-200 bg-gradient-to-br from-white to-amber-50/30 shadow-sm">
      <CardHeader className="pb-3">
        <h3 className="text-base font-bold text-amber-800">
          ዋገን ድሪል የኪራይ ዋጋ ተመን / Wagon Drill Rental (Birr per 3m depth, VAT incl.)
        </h3>
        <p className="text-xs text-gray-600">For All Temperate Zone • የተሻሻለው</p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-lg border border-amber-200 overflow-hidden">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-amber-600 text-white">
                <th className="text-left p-3 font-semibold">Digging Depth</th>
                <th className="p-3 font-semibold text-center">Soft Rock (Birr)</th>
                <th className="p-3 font-semibold text-center">Hard Rock (Birr)</th>
              </tr>
            </thead>
            <tbody>
              {wagonRates.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-amber-50/50"}>
                  <td className="p-3 font-medium text-gray-800">{row.depth}</td>
                  <td className="p-3 text-center font-semibold text-amber-800">{row.softRock.toLocaleString()}</td>
                  <td className="p-3 text-center font-semibold text-amber-800">{row.hardRock.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
