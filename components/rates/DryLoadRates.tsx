"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"

const dryLoadRates = [
  { description: "Low Bed & High Bed", capacity: "48 Ton", asphaltLoadMod: 363.16, asphaltLoadSev: 395.85, gravelLoadMod: 437.18, gravelLoadSev: 476.57, asphaltNoMod: 264.62, asphaltNoSev: 277.84, gravelNoMod: 330.85, gravelNoSev: 341.07 },
  { description: "Low Bed & High Bed", capacity: "40 Ton", asphaltLoadMod: 357.76, asphaltLoadSev: 389.94, gravelLoadMod: 430.62, gravelLoadSev: 469.21, asphaltNoMod: 260.27, asphaltNoSev: 273.29, gravelNoMod: 322.29, gravelNoSev: 335.78 },
  { description: "Low Bed & High Bed", capacity: "30 Ton", asphaltLoadMod: 330.45, asphaltLoadSev: 361.35, gravelLoadMod: 390.53, gravelLoadSev: 428.24, asphaltNoMod: 246.03, asphaltNoSev: 258.33, gravelNoMod: 302.86, gravelNoSev: 316.9 },
  { description: "Cargo Truck (Flat Truck)", capacity: "15 Ton", asphaltLoadMod: 289.52, asphaltLoadSev: 318.48, gravelLoadMod: 330.4, gravelLoadSev: 366.77, asphaltNoMod: 224.68, asphaltNoSev: 235.9, gravelNoMod: 273.72, gravelNoSev: 288.13 },
  { description: "Cargo Truck (Flat Truck)", capacity: "10 Ton", asphaltLoadMod: 242.55, asphaltLoadSev: 266.82, gravelLoadMod: 276.8, gravelLoadSev: 307.27, asphaltNoMod: 188.23, asphaltNoSev: 197.64, gravelNoMod: 229.33, gravelNoSev: 241.39 },
]

export default function DryLoadRates() {
  return (
    <Card className="border border-emerald-200 bg-gradient-to-br from-white to-emerald-50/30 shadow-sm">
      <CardHeader className="pb-3">
        <h3 className="text-base font-bold text-emerald-800">
          የትራንስፖርት ዋጋ በተለያየ የመንገድ ሁኔታ / Transport Rate (Birr/K.m)
        </h3>
        <p className="text-xs text-gray-600">Dry cargo & flat truck rates by road type and load</p>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <div className="min-w-[720px]">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-emerald-600 text-white">
                <th className="text-left p-2 font-semibold">Description</th>
                <th className="p-2 font-semibold">Capacity</th>
                <th colSpan={2} className="p-2 text-center border-l border-emerald-500">Asphalt with load</th>
                <th colSpan={2} className="p-2 text-center border-l border-emerald-500">Gravel with load</th>
                <th colSpan={2} className="p-2 text-center border-l border-emerald-500">Asphalt no load</th>
                <th colSpan={2} className="p-2 text-center border-l border-emerald-500">Gravel no load</th>
              </tr>
              <tr className="bg-emerald-500/90 text-white text-xs">
                <th className="p-1"></th>
                <th className="p-1">(Ton)</th>
                <th className="p-1 border-l border-emerald-400">Mod.</th>
                <th className="p-1">Sev.</th>
                <th className="p-1 border-l border-emerald-400">Mod.</th>
                <th className="p-1">Sev.</th>
                <th className="p-1 border-l border-emerald-400">Mod.</th>
                <th className="p-1">Sev.</th>
                <th className="p-1 border-l border-emerald-400">Mod.</th>
                <th className="p-1">Sev.</th>
              </tr>
            </thead>
            <tbody>
              {dryLoadRates.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-emerald-50/50"}>
                  <td className="p-2 font-medium text-gray-800">{row.description}</td>
                  <td className="p-2 text-center">{row.capacity}</td>
                  <td className="p-2 text-center border-l border-emerald-100">{row.asphaltLoadMod}</td>
                  <td className="p-2 text-center">{row.asphaltLoadSev}</td>
                  <td className="p-2 text-center border-l border-emerald-100">{row.gravelLoadMod}</td>
                  <td className="p-2 text-center">{row.gravelLoadSev}</td>
                  <td className="p-2 text-center border-l border-emerald-100">{row.asphaltNoMod}</td>
                  <td className="p-2 text-center">{row.asphaltNoSev}</td>
                  <td className="p-2 text-center border-l border-emerald-100">{row.gravelNoMod}</td>
                  <td className="p-2 text-center">{row.gravelNoSev}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
