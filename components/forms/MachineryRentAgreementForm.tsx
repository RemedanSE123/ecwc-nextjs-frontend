"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectItem } from "@/components/ui/select";
import {
  Trash2,
  Plus,
  Search,
  Save,
  Printer,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  X,
} from "lucide-react";

type DumpRateRow = {
  id: string;
  serNo: string;
  fromKm: string;
  toKm: string;
  rate: string;
};

function newDumpRateRow(): DumpRateRow {
  return {
    id: `dr-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    serNo: String(Date.now()).slice(-4),
    fromKm: "0",
    toKm: "0",
    rate: "0",
  };
}

export default function MachineryRentAgreementForm() {
  const [header, setHeader] = useState({
    searchOwner: "",
    searchPlateNo: "",
    owner: "",
    ownerAmharic: "",
    licenceType: "None",
    equipType: "",
    makeModel: "",
    kmHrReading: "",
    fuelFilled: "",
    remark: "",
    tinNo: "",
    void: false,
    locked: false,
    checked: false,
    address: "",
    mfgYear: "",
    plateNo: "",
    capacity: "",
    contractDuration: "Unlimited",
    contractStatus: "Active",
    rentedForProject: "",
    minHourPerDay: "",
    refNo: "",
    date: new Date().toISOString().split('T')[0],
    ethDate: "",
    manualRefNo: "",
  });
  const [agreedRates, setAgreedRates] = useState({
    operationalRate: "",
    idleRate: "",
    dayRate: "1000",
    nightRate: "0",
    gasOilRate: "0.00",
    gasOilSubsidy: "0.00",
  });
  const [dumpRows, setDumpRows] = useState<DumpRateRow[]>([newDumpRateRow()]);
  const [preparedBy, setPreparedBy] = useState("");
  const [activeTab, setActiveTab] = useState("owner");
  const [previewOpen, setPreviewOpen] = useState(false);

  const updateDumpRow = (id: string, field: keyof DumpRateRow, value: string) => {
    setDumpRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };
  const addDumpRow = () => setDumpRows((prev) => [...prev, newDumpRateRow()]);
  const removeDumpRow = (id: string) => {
    if (dumpRows.length <= 1) return;
    setDumpRows((prev) => prev.filter((r) => r.id !== id));
  };

  const cellInput = "h-7 border-0 rounded-none px-2 text-xs focus-visible:ring-1 focus-visible:ring-blue-500 w-full bg-white border-b border-zinc-200 hover:bg-zinc-50 transition-colors";
  const cellSelect = "[&_button]:h-7 [&_button]:min-h-7 [&_button]:text-xs [&_button]:rounded-none [&_button]:px-2";

  return (
    <div className="w-full min-w-0 mx-auto px-3 py-2 h-screen flex flex-col bg-zinc-50/50">
      <Card className="w-full border border-zinc-200 shadow-lg rounded-xl bg-white overflow-hidden flex flex-col h-full">
        {/* Header with improved styling */}
        <CardHeader className="p-0 shrink-0 border-b border-zinc-200 bg-gradient-to-r from-zinc-50 to-white">
          <div className="grid grid-cols-[70px_1fr_auto] items-center">
            <div className="border-r border-zinc-200 flex items-center justify-center p-2 relative h-14">
              <Image
                src="/ecwc png logo.png"
                alt="ECWC Logo"
                fill
                className="object-contain p-1"
              />
            </div>
            <div className="flex flex-col items-center justify-center py-1 px-4 text-center">
              <p className="text-sm font-bold text-zinc-800 tracking-wide">
                ETHIOPIAN CONSTRUCTION WORKS CORPORATION
              </p>
              <p className="text-xs font-medium text-zinc-500">
                RENTED MACHINERIES AGREEMENT DATA ENTRY
              </p>
            </div>
            <div className="px-4 py-2 bg-blue-50/50 border-l border-zinc-200">
              <p className="text-xs text-zinc-600"><span className="font-semibold text-blue-700">Doc No.</span> <span className="font-mono">OF/ECWC/2024/001</span></p>
              <p className="text-xs text-zinc-500 mt-1">Date: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 bg-white flex flex-col flex-1 min-h-0 gap-3">
          {/* Action Bar */}
          <div className="shrink-0 flex items-center justify-between">
            <div className="flex gap-2">
              <Button size="sm" variant="default" className="h-8 text-xs gap-1 bg-blue-600 hover:bg-blue-700">
                <Save className="h-3.5 w-3.5" /> Save
              </Button>
              <Button size="sm" variant="outline" className="h-8 text-xs gap-1">
                <Printer className="h-3.5 w-3.5" /> Print
              </Button>
              <Button size="sm" variant="outline" className="h-8 text-xs gap-1">
                <RefreshCw className="h-3.5 w-3.5" /> Reset
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs gap-1 text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                type="button"
                onClick={() => setPreviewOpen(true)}
              >
                <Eye className="h-3.5 w-3.5" /> Preview
              </Button>
            </div>
            
            {/* Search Section */}
            <div className="flex gap-3">
              <div className="flex items-center gap-2 bg-zinc-50 px-3 py-1 rounded-lg border border-zinc-200">
                <Search className="h-3.5 w-3.5 text-zinc-400" />
                <Select value={header.searchOwner || "__none__"} onValueChange={(v) => setHeader((p) => ({ ...p, searchOwner: v === "__none__" ? "" : v }))} className="min-w-[140px] [&_button]:h-7 [&_button]:text-xs">
                  <SelectItem value="__none__">Select Owner...</SelectItem>
                  <SelectItem value="owner1">Owner 1</SelectItem>
                  <SelectItem value="owner2">Owner 2</SelectItem>
                </Select>
              </div>
              <div className="flex items-center gap-2 bg-zinc-50 px-3 py-1 rounded-lg border border-zinc-200">
                <Search className="h-3.5 w-3.5 text-zinc-400" />
                <Select value={header.searchPlateNo || "__none__"} onValueChange={(v) => setHeader((p) => ({ ...p, searchPlateNo: v === "__none__" ? "" : v }))} className="min-w-[120px] [&_button]:h-7 [&_button]:text-xs">
                  <SelectItem value="__none__">Select Plate...</SelectItem>
                  <SelectItem value="plate1">AA 12345</SelectItem>
                  <SelectItem value="plate2">AA 67890</SelectItem>
                </Select>
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="shrink-0 flex border-b border-zinc-200">
            <button
              className={`px-4 py-2 text-xs font-medium transition-colors ${activeTab === 'owner' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-zinc-500 hover:text-zinc-700'}`}
              onClick={() => setActiveTab('owner')}
            >
              Owner Details
            </button>
            <button
              className={`px-4 py-2 text-xs font-medium transition-colors ${activeTab === 'equipment' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-zinc-500 hover:text-zinc-700'}`}
              onClick={() => setActiveTab('equipment')}
            >
              Equipment Details
            </button>
            <button
              className={`px-4 py-2 text-xs font-medium transition-colors ${activeTab === 'contract' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-zinc-500 hover:text-zinc-700'}`}
              onClick={() => setActiveTab('contract')}
            >
              Contract Details
            </button>
            <button
              className={`px-4 py-2 text-xs font-medium transition-colors ${activeTab === 'rates' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-zinc-500 hover:text-zinc-700'}`}
              onClick={() => setActiveTab('rates')}
            >
              Rates & Pricing
            </button>
          </div>

          {/* Main Content Area - Scrollable */}
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
            {/* Owner Details Tab */}
            {activeTab === 'owner' && (
              <div className="grid grid-cols-2 gap-6 p-2">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-zinc-700 border-b border-zinc-200 pb-1">Owner Information</h3>
                  <div className="grid gap-3">
                    <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                      <Label className="text-xs font-medium text-zinc-600">Owner Name</Label>
                      <Input className="h-8 text-sm border-zinc-200 rounded-lg focus:ring-1 focus:ring-blue-500" value={header.owner} onChange={(e) => setHeader((p) => ({ ...p, owner: e.target.value }))} />
                    </div>
                    <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                      <Label className="text-xs font-medium text-zinc-600">የባለቤቱ ስም</Label>
                      <Input className="h-8 text-sm border-zinc-200 rounded-lg" value={header.ownerAmharic} onChange={(e) => setHeader((p) => ({ ...p, ownerAmharic: e.target.value }))} />
                    </div>
                    <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                      <Label className="text-xs font-medium text-zinc-600">TIN No</Label>
                      <Input className="h-8 text-sm border-zinc-200 rounded-lg" value={header.tinNo} onChange={(e) => setHeader((p) => ({ ...p, tinNo: e.target.value }))} />
                    </div>
                    <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                      <Label className="text-xs font-medium text-zinc-600">Address</Label>
                      <textarea className="min-h-[60px] border border-zinc-200 rounded-lg px-3 py-2 text-sm resize-y focus:ring-1 focus:ring-blue-500" value={header.address} onChange={(e) => setHeader((p) => ({ ...p, address: e.target.value }))} />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-zinc-700 border-b border-zinc-200 pb-1">License & Status</h3>
                  <div className="grid gap-3">
                    <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                      <Label className="text-xs font-medium text-zinc-600">Licence Type</Label>
                      <Select value={header.licenceType} onValueChange={(v) => setHeader((p) => ({ ...p, licenceType: v }))} className="[&_button]:h-8 [&_button]:text-sm">
                        <SelectItem value="None">None</SelectItem>
                        <SelectItem value="A">Class A</SelectItem>
                        <SelectItem value="B">Class B</SelectItem>
                        <SelectItem value="C">Class C</SelectItem>
                      </Select>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={header.void} onChange={(e) => setHeader((p) => ({ ...p, void: e.target.checked }))} className="rounded border-zinc-300 text-blue-600" />
                        <span className="text-xs text-zinc-600">Void</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={header.locked} onChange={(e) => setHeader((p) => ({ ...p, locked: e.target.checked }))} className="rounded border-zinc-300 text-blue-600" />
                        <span className="text-xs text-zinc-600">Locked</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={header.checked} onChange={(e) => setHeader((p) => ({ ...p, checked: e.target.checked }))} className="rounded border-zinc-300 text-blue-600" />
                        <span className="text-xs text-zinc-600">Checked</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Equipment Details Tab */}
            {activeTab === 'equipment' && (
              <div className="grid grid-cols-2 gap-6 p-2">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-zinc-700 border-b border-zinc-200 pb-1">Equipment Specifications</h3>
                  <div className="grid gap-3">
                    <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                      <Label className="text-xs font-medium text-zinc-600">Equip Type</Label>
                      <Input className="h-8 text-sm border-zinc-200 rounded-lg" value={header.equipType} onChange={(e) => setHeader((p) => ({ ...p, equipType: e.target.value }))} />
                    </div>
                    <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                      <Label className="text-xs font-medium text-zinc-600">Make/Model</Label>
                      <Input className="h-8 text-sm border-zinc-200 rounded-lg" value={header.makeModel} onChange={(e) => setHeader((p) => ({ ...p, makeModel: e.target.value }))} />
                    </div>
                    <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                      <Label className="text-xs font-medium text-zinc-600">Plate No</Label>
                      <Input className="h-8 text-sm border-zinc-200 rounded-lg" value={header.plateNo} onChange={(e) => setHeader((p) => ({ ...p, plateNo: e.target.value }))} />
                    </div>
                    <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                      <Label className="text-xs font-medium text-zinc-600">Mfg Year</Label>
                      <Input className="h-8 text-sm border-zinc-200 rounded-lg" value={header.mfgYear} onChange={(e) => setHeader((p) => ({ ...p, mfgYear: e.target.value }))} />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-zinc-700 border-b border-zinc-200 pb-1">Operational Details</h3>
                  <div className="grid gap-3">
                    <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                      <Label className="text-xs font-medium text-zinc-600">Km/Hr Reading</Label>
                      <Input className="h-8 text-sm border-zinc-200 rounded-lg" value={header.kmHrReading} onChange={(e) => setHeader((p) => ({ ...p, kmHrReading: e.target.value }))} />
                    </div>
                    <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                      <Label className="text-xs font-medium text-zinc-600">Fuel Filled (L)</Label>
                      <Input className="h-8 text-sm border-zinc-200 rounded-lg" value={header.fuelFilled} onChange={(e) => setHeader((p) => ({ ...p, fuelFilled: e.target.value }))} />
                    </div>
                    <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                      <Label className="text-xs font-medium text-zinc-600">Capacity (M³)</Label>
                      <Input className="h-8 text-sm border-zinc-200 rounded-lg" value={header.capacity} onChange={(e) => setHeader((p) => ({ ...p, capacity: e.target.value }))} />
                    </div>
                    <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                      <Label className="text-xs font-medium text-zinc-600">Remark</Label>
                      <Input className="h-8 text-sm border-zinc-200 rounded-lg" value={header.remark} onChange={(e) => setHeader((p) => ({ ...p, remark: e.target.value }))} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Contract Details Tab */}
            {activeTab === 'contract' && (
              <div className="grid grid-cols-2 gap-6 p-2">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-zinc-700 border-b border-zinc-200 pb-1">Contract Information</h3>
                  <div className="grid gap-3">
                    <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                      <Label className="text-xs font-medium text-zinc-600">Contract Duration</Label>
                      <Select value={header.contractDuration} onValueChange={(v) => setHeader((p) => ({ ...p, contractDuration: v }))} className="[&_button]:h-8 [&_button]:text-sm">
                        <SelectItem value="Unlimited">Unlimited</SelectItem>
                        <SelectItem value="1Y">1 Year</SelectItem>
                        <SelectItem value="2Y">2 Years</SelectItem>
                        <SelectItem value="3Y">3 Years</SelectItem>
                      </Select>
                    </div>
                    <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                      <Label className="text-xs font-medium text-zinc-600">Contract Status</Label>
                      <Select value={header.contractStatus} onValueChange={(v) => setHeader((p) => ({ ...p, contractStatus: v }))} className="[&_button]:h-8 [&_button]:text-sm">
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        <SelectItem value="Suspended">Suspended</SelectItem>
                      </Select>
                    </div>
                    <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                      <Label className="text-xs font-medium text-zinc-600">Rented For Project</Label>
                      <Select value={header.rentedForProject || "__none__"} onValueChange={(v) => setHeader((p) => ({ ...p, rentedForProject: v === "__none__" ? "" : v }))} className="[&_button]:h-8 [&_button]:text-sm">
                        <SelectItem value="__none__">Select Project...</SelectItem>
                        <SelectItem value="proj1">Project 1 - Road Construction</SelectItem>
                        <SelectItem value="proj2">Project 2 - Building</SelectItem>
                        <SelectItem value="proj3">Project 3 - Bridge</SelectItem>
                      </Select>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-zinc-700 border-b border-zinc-200 pb-1">Reference & Dates</h3>
                  <div className="grid gap-3">
                    <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                      <Label className="text-xs font-medium text-zinc-600">Ref.No</Label>
                      <Input className="h-8 text-sm border-zinc-200 rounded-lg" value={header.refNo} onChange={(e) => setHeader((p) => ({ ...p, refNo: e.target.value }))} />
                    </div>
                    <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                      <Label className="text-xs font-medium text-zinc-600">Date</Label>
                      <Input type="date" className="h-8 text-sm border-zinc-200 rounded-lg" value={header.date} onChange={(e) => setHeader((p) => ({ ...p, date: e.target.value }))} />
                    </div>
                    <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                      <Label className="text-xs font-medium text-zinc-600">Eth Date</Label>
                      <Input className="h-8 text-sm border-zinc-200 rounded-lg" value={header.ethDate} onChange={(e) => setHeader((p) => ({ ...p, ethDate: e.target.value }))} placeholder="YYYY-MM-DD" />
                    </div>
                    <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                      <Label className="text-xs font-medium text-zinc-600">Manual Ref.No</Label>
                      <Input className="h-8 text-sm border-zinc-200 rounded-lg" value={header.manualRefNo} onChange={(e) => setHeader((p) => ({ ...p, manualRefNo: e.target.value }))} />
                    </div>
                    <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                      <Label className="text-xs font-medium text-zinc-600">Min Hr/day</Label>
                      <Input className="h-8 text-sm border-zinc-200 rounded-lg" value={header.minHourPerDay} onChange={(e) => setHeader((p) => ({ ...p, minHourPerDay: e.target.value }))} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Rates & Pricing Tab */}
            {activeTab === 'rates' && (
              <div className="space-y-4 p-2">
                <div className="grid grid-cols-2 gap-6">
                  {/* Machinery & Vehicle Rates */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-zinc-700 border-b border-zinc-200 pb-1">Machinery Rates</h3>
                    <div className="bg-blue-50/30 p-4 rounded-lg border border-blue-100">
                      <div className="space-y-3">
                        <div className="flex items-center gap-4">
                          <Label className="text-xs font-medium text-zinc-600 w-20">Operational Rate</Label>
                          <Input className="h-8 text-sm border-zinc-200 rounded-lg w-32" value={agreedRates.operationalRate} onChange={(e) => setAgreedRates((p) => ({ ...p, operationalRate: e.target.value }))} />
                          <span className="text-xs text-zinc-500">birr/hr</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <Label className="text-xs font-medium text-zinc-600 w-20">Idle Rate</Label>
                          <Input className="h-8 text-sm border-zinc-200 rounded-lg w-32" value={agreedRates.idleRate} onChange={(e) => setAgreedRates((p) => ({ ...p, idleRate: e.target.value }))} />
                          <span className="text-xs text-zinc-500">birr/hr</span>
                        </div>
                      </div>
                    </div>

                    <h3 className="text-sm font-semibold text-zinc-700 border-b border-zinc-200 pb-1 mt-4">Vehicle Rates</h3>
                    <div className="bg-green-50/30 p-4 rounded-lg border border-green-100">
                      <div className="space-y-3">
                        <div className="flex items-center gap-4">
                          <Label className="text-xs font-medium text-zinc-600 w-20">Day Rate</Label>
                          <Input className="h-8 text-sm border-zinc-200 rounded-lg w-32" value={agreedRates.dayRate} onChange={(e) => setAgreedRates((p) => ({ ...p, dayRate: e.target.value }))} />
                          <span className="text-xs text-zinc-500">birr/day</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <Label className="text-xs font-medium text-zinc-600 w-20">Night Rate</Label>
                          <Input className="h-8 text-sm border-zinc-200 rounded-lg w-32" value={agreedRates.nightRate} onChange={(e) => setAgreedRates((p) => ({ ...p, nightRate: e.target.value }))} />
                          <span className="text-xs text-zinc-500">birr/night</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dump Trucks Rates */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-zinc-700 border-b border-zinc-200 pb-1">Dump Trucks Rates</h3>
                    <div className="bg-amber-50/30 p-4 rounded-lg border border-amber-100">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                          <thead>
                            <tr className="bg-amber-100/50">
                              <th className="border border-amber-200 px-2 py-1.5 text-xs font-semibold text-zinc-600">Ser No</th>
                              <th className="border border-amber-200 px-2 py-1.5 text-xs font-semibold text-zinc-600">From Km</th>
                              <th className="border border-amber-200 px-2 py-1.5 text-xs font-semibold text-zinc-600">To Km</th>
                              <th className="border border-amber-200 px-2 py-1.5 text-xs font-semibold text-zinc-600">Rate (birr/km)</th>
                              <th className="border border-amber-200 px-2 py-1.5 w-10"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {dumpRows.map((row) => (
                              <tr key={row.id} className="hover:bg-amber-50/50">
                                <td className="border border-amber-200 p-0">
                                  <Input className={cellInput} value={row.serNo} onChange={(e) => updateDumpRow(row.id, "serNo", e.target.value)} />
                                </td>
                                <td className="border border-amber-200 p-0">
                                  <Input className={cellInput} value={row.fromKm} onChange={(e) => updateDumpRow(row.id, "fromKm", e.target.value)} />
                                </td>
                                <td className="border border-amber-200 p-0">
                                  <Input className={cellInput} value={row.toKm} onChange={(e) => updateDumpRow(row.id, "toKm", e.target.value)} />
                                </td>
                                <td className="border border-amber-200 p-0">
                                  <Input className={cellInput} value={row.rate} onChange={(e) => updateDumpRow(row.id, "rate", e.target.value)} />
                                </td>
                                <td className="border border-amber-200 p-0 text-center">
                                  <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => removeDumpRow(row.id)} disabled={dumpRows.length <= 1}>
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <Button type="button" variant="outline" size="sm" className="mt-2 h-7 text-xs gap-1 border-amber-200 text-amber-700 hover:bg-amber-50" onClick={addDumpRow}>
                        <Plus className="h-3.5 w-3.5" /> Add Rate Row
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Fuel Rates */}
                <div className="mt-4 p-4 bg-purple-50/30 rounded-lg border border-purple-100">
                  <h3 className="text-sm font-semibold text-zinc-700 mb-3">Fuel Rates</h3>
                  <div className="flex flex-wrap items-center gap-6">
                    <div className="flex items-center gap-3">
                      <Label className="text-xs font-medium text-zinc-600">Gas Oil Rate</Label>
                      <Input className="h-8 text-sm border-zinc-200 rounded-lg w-24" value={agreedRates.gasOilRate} onChange={(e) => setAgreedRates((p) => ({ ...p, gasOilRate: e.target.value }))} />
                      <span className="text-xs text-zinc-500">birr/L</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Label className="text-xs font-medium text-zinc-600">Subsidy</Label>
                      <Input className="h-8 text-sm border-zinc-200 rounded-lg w-24" value={agreedRates.gasOilSubsidy} onChange={(e) => setAgreedRates((p) => ({ ...p, gasOilSubsidy: e.target.value }))} />
                      <span className="text-xs text-zinc-500">birr/L</span>
                    </div>
                    <div className="flex items-center gap-3 ml-auto">
                      <Label className="text-xs font-medium text-zinc-600">Prepared by</Label>
                      <Select value={preparedBy || "__none__"} onValueChange={(v) => setPreparedBy(v === "__none__" ? "" : v)} className="min-w-[140px] [&_button]:h-8 [&_button]:text-sm">
                        <SelectItem value="__none__">Select User...</SelectItem>
                        <SelectItem value="u1">John Doe</SelectItem>
                        <SelectItem value="u2">Jane Smith</SelectItem>
                        <SelectItem value="u3">Mike Johnson</SelectItem>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Navigation */}
          <div className="shrink-0 flex items-center justify-between pt-3 border-t border-zinc-200">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span className="font-medium">Record Navigation:</span>
              <Button variant="outline" size="icon" className="h-7 w-7">
                <ChevronsLeft className="h-3.5 w-3.5" />
              </Button>
              <Button variant="outline" size="icon" className="h-7 w-7">
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <div className="flex items-center gap-1">
                <Input className="h-7 w-12 text-center text-xs border-zinc-200 rounded-lg" defaultValue={1} />
                <span className="text-zinc-400">/</span>
                <span className="text-zinc-600">10</span>
              </div>
              <Button variant="outline" size="icon" className="h-7 w-7">
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
              <Button variant="outline" size="icon" className="h-7 w-7">
                <ChevronsRight className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400">Last updated: Just now</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* A4-style preview overlay */}
      {previewOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-2 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-zinc-200 max-h-[98vh]">
            {/* Preview header */}
            <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-zinc-200 bg-gradient-to-r from-slate-50 to-white">
              <span className="text-sm font-semibold text-slate-700">
                Preview — Machinery Rent Agreement (A4)
              </span>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-200 hover:text-zinc-800 transition-colors"
                aria-label="Close preview"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-auto flex-1 bg-slate-100">
              <div
                className="a4-page bg-white mx-auto my-4 shadow-lg"
                style={{
                  width: "297mm",
                  minHeight: "210mm",
                  padding: "12mm",
                  boxSizing: "border-box",
                }}
              >
                {/* A4 content */}
                <div className="grid grid-cols-[70px_1fr_120px] border-b-2 border-slate-800 mb-4">
                  <div className="relative h-14 flex items-center justify-center border-r-2 border-slate-800 pr-2">
                    <Image
                      src="/ecwc png logo.png"
                      alt="ECWC Logo"
                      width={56}
                      height={56}
                      className="object-contain"
                    />
                  </div>
                  <div className="flex flex-col justify-center px-4 text-center border-r-2 border-slate-800">
                    <p className="text-sm font-bold text-slate-900">
                      ETHIOPIAN CONSTRUCTION WORKS CORPORATION
                    </p>
                    <p className="text-xs font-semibold text-slate-700 mt-0.5">
                      RENTED MACHINERIES AGREEMENT
                    </p>
                  </div>
                  <div className="flex flex-col justify-center px-3 text-[10px] text-slate-700 font-medium">
                    <p>
                      <b>Document No.</b>
                    </p>
                    <p>OF/ECWC/2024/001</p>
                    <p className="mt-1">
                      <b>Date:</b> {header.date || new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Owner & Equipment summary */}
                <div className="grid grid-cols-2 gap-6 text-[11px] text-slate-800 mb-4">
                  <div className="space-y-1.5">
                    <p className="font-semibold border-b border-slate-200 pb-1">
                      Owner information
                    </p>
                    <p>
                      <span className="font-medium">Owner:</span>{" "}
                      {header.owner || "—"}
                    </p>
                    <p>
                      <span className="font-medium">የባለቤቱ ስም:</span>{" "}
                      {header.ownerAmharic || "—"}
                    </p>
                    <p>
                      <span className="font-medium">TIN No:</span>{" "}
                      {header.tinNo || "—"}
                    </p>
                    <p>
                      <span className="font-medium">Address:</span>{" "}
                      {header.address || "—"}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="font-semibold border-b border-slate-200 pb-1">
                      Equipment information
                    </p>
                    <p>
                      <span className="font-medium">Equipment type:</span>{" "}
                      {header.equipType || "—"}
                    </p>
                    <p>
                      <span className="font-medium">Make / Model:</span>{" "}
                      {header.makeModel || "—"}
                    </p>
                    <p>
                      <span className="font-medium">Plate No:</span>{" "}
                      {header.plateNo || "—"}
                    </p>
                    <p>
                      <span className="font-medium">Capacity:</span>{" "}
                      {header.capacity || "—"}
                    </p>
                    <p>
                      <span className="font-medium">Mfg. year:</span>{" "}
                      {header.mfgYear || "—"}
                    </p>
                  </div>
                </div>

                {/* Contract summary */}
                <div className="grid grid-cols-2 gap-6 text-[11px] text-slate-800 mb-4">
                  <div className="space-y-1.5">
                    <p className="font-semibold border-b border-slate-200 pb-1">
                      Contract details
                    </p>
                    <p>
                      <span className="font-medium">Duration:</span>{" "}
                      {header.contractDuration || "—"}
                    </p>
                    <p>
                      <span className="font-medium">Status:</span>{" "}
                      {header.contractStatus || "—"}
                    </p>
                    <p>
                      <span className="font-medium">Rented for project:</span>{" "}
                      {header.rentedForProject || "—"}
                    </p>
                    <p>
                      <span className="font-medium">Min hours per day:</span>{" "}
                      {header.minHourPerDay || "—"}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="font-semibold border-b border-slate-200 pb-1">
                      References
                    </p>
                    <p>
                      <span className="font-medium">Ref. No:</span>{" "}
                      {header.refNo || "—"}
                    </p>
                    <p>
                      <span className="font-medium">Manual Ref. No:</span>{" "}
                      {header.manualRefNo || "—"}
                    </p>
                    <p>
                      <span className="font-medium">Eth. date:</span>{" "}
                      {header.ethDate || "—"}
                    </p>
                  </div>
                </div>

                {/* Rates */}
                <div className="mb-4">
                  <p className="font-semibold border-b border-slate-200 pb-1 text-[11px] text-slate-800">
                    Rates & pricing
                  </p>
                  <table className="w-full border-collapse text-[11px] mt-1">
                    <tbody>
                      <tr>
                        <td className="border border-slate-300 px-2 py-1 font-medium w-48">
                          Operational rate (Birr/hr)
                        </td>
                        <td className="border border-slate-300 px-2 py-1">
                          {agreedRates.operationalRate || "—"}
                        </td>
                        <td className="border border-slate-300 px-2 py-1 font-medium w-48">
                          Idle rate (Birr/hr)
                        </td>
                        <td className="border border-slate-300 px-2 py-1">
                          {agreedRates.idleRate || "—"}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 px-2 py-1 font-medium">
                          Day rate (Birr/hr)
                        </td>
                        <td className="border border-slate-300 px-2 py-1">
                          {agreedRates.dayRate || "—"}
                        </td>
                        <td className="border border-slate-300 px-2 py-1 font-medium">
                          Night rate (Birr/hr)
                        </td>
                        <td className="border border-slate-300 px-2 py-1">
                          {agreedRates.nightRate || "—"}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 px-2 py-1 font-medium">
                          Gas oil rate (Birr/ltr)
                        </td>
                        <td className="border border-slate-300 px-2 py-1">
                          {agreedRates.gasOilRate || "—"}
                        </td>
                        <td className="border border-slate-300 px-2 py-1 font-medium">
                          Gas oil subsidy (Birr/ltr)
                        </td>
                        <td className="border border-slate-300 px-2 py-1">
                          {agreedRates.gasOilSubsidy || "—"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Dump rates table */}
                <div>
                  <p className="font-semibold border-b border-slate-200 pb-1 text-[11px] text-slate-800 mb-1">
                    Distance based dump truck rates
                  </p>
                  <table className="w-full border-collapse text-[11px]">
                    <thead>
                      <tr className="bg-slate-700 text-slate-50">
                        <th className="border border-slate-600 px-1.5 py-1 text-center w-12">
                          No
                        </th>
                        <th className="border border-slate-600 px-1.5 py-1 text-center">
                          From (km)
                        </th>
                        <th className="border border-slate-600 px-1.5 py-1 text-center">
                          To (km)
                        </th>
                        <th className="border border-slate-600 px-1.5 py-1 text-center">
                          Rate (Birr/trip)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {dumpRows.map((r, i) => (
                        <tr
                          key={r.id}
                          className="bg-white odd:bg-slate-50/40"
                        >
                          <td className="border border-slate-300 px-1.5 py-1 text-center">
                            {i + 1}
                          </td>
                          <td className="border border-slate-300 px-1.5 py-1 text-center">
                            {r.fromKm}
                          </td>
                          <td className="border border-slate-300 px-1.5 py-1 text-center">
                            {r.toKm}
                          </td>
                          <td className="border border-slate-300 px-1.5 py-1 text-center">
                            {r.rate}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}