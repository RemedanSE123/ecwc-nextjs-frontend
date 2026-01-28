"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"

const lightVehicleRates = [
  { no: 1, type: "Pick Up D/Cab (≤ 2004)", addis: 4414.68, out: 6024.36 },
  { no: 2, type: "Pick Up D/Cab (> 2004-2014)", addis: 4893.22, out: 6681.77 },
  { no: 3, type: "Pick Up D/Cab (≥ 2015)", addis: 5424.96, out: 7412.24 },
  { no: 4, type: "Pick Up Single Cab", addis: 4377.79, out: 5973.94 },
  { no: 5, type: "Station Wagon (≤ 2000)", addis: 3950.78, out: 5387.3 },
  { no: 6, type: "Station Wagon (> 2000-2010)", addis: 4377.79, out: 5973.94 },
  { no: 7, type: "Station Wagon (≥ 2011)", addis: 4852.23, out: 6625.74 },
  { no: 8, type: "Long Base", addis: 6363.32, out: 8701.62 },
  { no: 9, type: "Automobile", addis: 4893.22, out: 6681.77 },
  { no: 10, type: "Mini Bus < 25 Seat", addis: 3747.36, out: 3747.36 },
  { no: 11, type: "Mid Bus 25-45 Seat", addis: 5233.04, out: 5233.04 },
  { no: 12, type: "Bus Passenger > 45 Seat", addis: 4414.68, out: 6024.36 },
  { no: 13, type: "Dump Truck (service)", addis: 3880.02, out: 3880.02 },
]

export default function LightVehicleRates() {
  return (
    <Card className="border border-sky-200 bg-gradient-to-br from-white to-sky-50/30 shadow-sm">
      <CardHeader className="pb-3">
        <h3 className="text-base font-bold text-sky-800">
          Light Vehicle & Service Rental Rate (Birr/Day)
        </h3>
        <p className="text-xs text-gray-600">Without fuel cost • የቀላል ተሽከርካሪ እና አገልግሎት</p>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <div className="min-w-[480px]">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-sky-600 text-white">
                <th className="w-10 p-2 font-semibold">No.</th>
                <th className="text-left p-2 font-semibold">Equipment Type</th>
                <th className="p-2 font-semibold text-center border-l border-sky-500">Around Addis Ababa</th>
                <th className="p-2 font-semibold text-center border-l border-sky-500">Out of Addis Ababa</th>
              </tr>
            </thead>
            <tbody>
              {lightVehicleRates.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-sky-50/50"}>
                  <td className="p-2 text-center text-gray-600">{row.no}</td>
                  <td className="p-2 font-medium text-gray-800">{row.type}</td>
                  <td className="p-2 text-center font-semibold text-sky-800 border-l border-sky-100">{row.addis.toLocaleString()}</td>
                  <td className="p-2 text-center font-semibold text-sky-800 border-l border-sky-100">{row.out.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
