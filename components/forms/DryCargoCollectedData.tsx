"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Check, X, Search, Filter, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

type TimeSheetData = {
    id: string
    status: "Pending" | "Approved" | "Rejected"
    // Vehicle Info
    vehicleType: string
    serialNo: string
    vehicleCapacity: string
    refNumber: string
    // Road Usage
    date: string
    roadType: "Asphalt" | "Gravel"
    loadStatus: "Loading" | "Not Loading"
    zoneSeverity: "Moderate" | "Severe"
    distance: number
    // Cargo
    cargoType: string
    cargoOrigin: string
    cargoDestination: string
    // Time/Fuel
    idleHours: number
    idleReason: string
    downHours: number
    kmReading: number
    fuel: number
    // Personnel
    operator: string
    siteManager: string
    confirmingOfficial: string
}

const MOCK_DATA: TimeSheetData[] = [
    {
        id: "TS-001", status: "Approved",
        vehicleType: "Dump Truck", serialNo: "SG-1001", vehicleCapacity: "20m3", refNumber: "REF-001",
        date: "2024-01-15", roadType: "Asphalt", loadStatus: "Loading", zoneSeverity: "Moderate", distance: 120,
        cargoType: "Soil", cargoOrigin: "Site A", cargoDestination: "Site B",
        idleHours: 0, idleReason: "-", downHours: 0, kmReading: 50120, fuel: 40,
        operator: "Abebe Kebede", siteManager: "Bekele", confirmingOfficial: "Chala"
    },
    {
        id: "TS-002", status: "Pending",
        vehicleType: "Dump Truck", serialNo: "SG-1002", vehicleCapacity: "20m3", refNumber: "REF-002",
        date: "2024-01-16", roadType: "Gravel", loadStatus: "Loading", zoneSeverity: "Severe", distance: 150,
        cargoType: "Gravel", cargoOrigin: "Quarry", cargoDestination: "Site A",
        idleHours: 1, idleReason: "Traffic", downHours: 0, kmReading: 50270, fuel: 50,
        operator: "Abebe Kebede", siteManager: "Bekele", confirmingOfficial: "Chala"
    },
    {
        id: "TS-003", status: "Pending",
        vehicleType: "Flatbed", serialNo: "SG-1003", vehicleCapacity: "40T", refNumber: "REF-003",
        date: "2024-01-16", roadType: "Asphalt", loadStatus: "Not Loading", zoneSeverity: "Moderate", distance: 80,
        cargoType: "-", cargoOrigin: "Base", cargoDestination: "Site C",
        idleHours: 2, idleReason: "Waiting for load", downHours: 1, kmReading: 12050, fuel: 35,
        operator: "Chala Tesfaye", siteManager: "Dawit", confirmingOfficial: "Tigist"
    },
    {
        id: "TS-004", status: "Rejected",
        vehicleType: "Dump Truck", serialNo: "SG-1004", vehicleCapacity: "20m3", refNumber: "REF-004",
        date: "2024-01-17", roadType: "Gravel", loadStatus: "Loading", zoneSeverity: "Moderate", distance: 0,
        cargoType: "Sand", cargoOrigin: "River", cargoDestination: "Site A",
        idleHours: 8, idleReason: "Rain", downHours: 0, kmReading: 50270, fuel: 0,
        operator: "Abebe Kebede", siteManager: "Bekele", confirmingOfficial: "Chala"
    },
    {
        id: "TS-005", status: "Pending",
        vehicleType: "Water Truck", serialNo: "SG-1005", vehicleCapacity: "15000L", refNumber: "REF-005",
        date: "2024-01-18", roadType: "Gravel", loadStatus: "Loading", zoneSeverity: "Moderate", distance: 200,
        cargoType: "Water", cargoOrigin: "Well", cargoDestination: "Road Section 1",
        idleHours: 0, idleReason: "-", downHours: 0, kmReading: 8000, fuel: 25,
        operator: "Dawit Alemu", siteManager: "Solomon", confirmingOfficial: "Hana"
    },
]

export default function DryCargoCollectedData() {
    const [data, setData] = useState<TimeSheetData[]>(MOCK_DATA)
    const [statusFilter, setStatusFilter] = useState("all")

    const handleApprove = (id: string) => {
        setData(prev => prev.map(item => item.id === id ? { ...item, status: "Approved" } : item))
    }

    const handleReject = (id: string) => {
        setData(prev => prev.map(item => item.id === id ? { ...item, status: "Rejected" } : item))
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Approved": return <Badge className="bg-green-600 hover:bg-green-700 shadow-sm">Approved</Badge>
            case "Rejected": return <Badge className="bg-red-600 hover:bg-red-700 shadow-sm">Rejected</Badge>
            default: return <Badge className="bg-yellow-600 hover:bg-yellow-700 shadow-sm">Pending</Badge>
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-lg border shadow-sm">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search serial no, operator..." className="pl-8" />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[130px]">
                            <Filter className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon">
                        <SlidersHorizontal className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <Card className="w-full shadow-md border-0 ring-1 ring-gray-200">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Collected Time Sheets</CardTitle>
                            <CardDescription>Manage and approve daily dry cargo time sheets.</CardDescription>
                        </div>
                        <Badge variant="outline" className="text-xs">{data.length} Records</Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm whitespace-nowrap">
                            <thead className="bg-gray-50/50">
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th className="h-12 px-4 text-left align-middle font-semibold text-muted-foreground sticky left-0 bg-gray-50 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Status</th>
                                    <th className="h-12 px-4 text-left align-middle font-semibold text-muted-foreground sticky left-[80px] bg-gray-50 z-20 border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Serial No</th>
                                    <th className="h-12 px-4 text-left align-middle font-semibold text-muted-foreground">Date</th>
                                    <th className="h-12 px-4 text-left align-middle font-semibold text-muted-foreground">Vehicle Type</th>
                                    <th className="h-12 px-4 text-left align-middle font-semibold text-muted-foreground">Capacity</th>
                                    <th className="h-12 px-4 text-left align-middle font-semibold text-muted-foreground">Ref No</th>
                                    <th className="h-12 px-4 text-left align-middle font-semibold text-muted-foreground">Road Type</th>
                                    <th className="h-12 px-4 text-left align-middle font-semibold text-muted-foreground">Load Status</th>
                                    <th className="h-12 px-4 text-left align-middle font-semibold text-muted-foreground">Severity</th>
                                    <th className="h-12 px-4 text-left align-middle font-semibold text-muted-foreground">Dist (km)</th>
                                    <th className="h-12 px-4 text-left align-middle font-semibold text-muted-foreground">Cargo Type</th>
                                    <th className="h-12 px-4 text-left align-middle font-semibold text-muted-foreground">Origin</th>
                                    <th className="h-12 px-4 text-left align-middle font-semibold text-muted-foreground">Dest</th>
                                    <th className="h-12 px-4 text-left align-middle font-semibold text-muted-foreground">Idle (h)</th>
                                    <th className="h-12 px-4 text-left align-middle font-semibold text-muted-foreground">Idle Reason</th>
                                    <th className="h-12 px-4 text-left align-middle font-semibold text-muted-foreground">Down (h)</th>
                                    <th className="h-12 px-4 text-left align-middle font-semibold text-muted-foreground">Km Read</th>
                                    <th className="h-12 px-4 text-left align-middle font-semibold text-muted-foreground">Fuel (L)</th>
                                    <th className="h-12 px-4 text-left align-middle font-semibold text-muted-foreground">Operator</th>
                                    <th className="h-12 px-4 text-left align-middle font-semibold text-muted-foreground">Site Mgr</th>
                                    <th className="h-12 px-4 text-left align-middle font-semibold text-muted-foreground">Official</th>
                                    <th className="h-12 px-4 text-left align-middle font-semibold text-muted-foreground border-l sticky right-0 bg-gray-50 z-20 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {data.map((row) => (
                                    <tr key={row.id} className="group transition-colors hover:bg-blue-50/30 data-[state=selected]:bg-muted">
                                        <td className="p-4 align-middle sticky left-0 bg-white group-hover:bg-blue-50/30 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">{getStatusBadge(row.status)}</td>
                                        <td className="p-4 align-middle font-medium sticky left-[80px] bg-white group-hover:bg-blue-50/30 z-10 border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] text-blue-600">{row.serialNo}</td>
                                        <td className="p-4 align-middle">{row.date}</td>
                                        <td className="p-4 align-middle">{row.vehicleType}</td>
                                        <td className="p-4 align-middle">{row.vehicleCapacity}</td>
                                        <td className="p-4 align-middle text-muted-foreground">{row.refNumber}</td>
                                        <td className="p-4 align-middle">{row.roadType}</td>
                                        <td className="p-4 align-middle">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.loadStatus === "Loading" ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-800"}`}>
                                                {row.loadStatus}
                                            </span>
                                        </td>
                                        <td className="p-4 align-middle">{row.zoneSeverity}</td>
                                        <td className="p-4 align-middle font-medium">{row.distance}</td>
                                        <td className="p-4 align-middle">{row.cargoType}</td>
                                        <td className="p-4 align-middle">{row.cargoOrigin}</td>
                                        <td className="p-4 align-middle">{row.cargoDestination}</td>
                                        <td className="p-4 align-middle text-orange-600 font-medium">{row.idleHours > 0 ? row.idleHours : "-"}</td>
                                        <td className="p-4 align-middle text-muted-foreground italic text-xs truncate max-w-[100px]" title={row.idleReason}>{row.idleReason}</td>
                                        <td className="p-4 align-middle text-red-600 font-medium">{row.downHours > 0 ? row.downHours : "-"}</td>
                                        <td className="p-4 align-middle">{row.kmReading.toLocaleString()}</td>
                                        <td className="p-4 align-middle font-medium">{row.fuel}</td>
                                        <td className="p-4 align-middle">{row.operator}</td>
                                        <td className="p-4 align-middle">{row.siteManager}</td>
                                        <td className="p-4 align-middle">{row.confirmingOfficial}</td>
                                        <td className="p-4 align-middle border-l sticky right-0 bg-white group-hover:bg-blue-50/30 z-10 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                            {row.status === "Pending" && (
                                                <div className="flex gap-2">
                                                    <Button size="icon" variant="outline" className="h-8 w-8 text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700 hover:border-green-300 shadow-sm" onClick={() => handleApprove(row.id)}>
                                                        <Check className="h-4 w-4" />
                                                        <span className="sr-only">Approve</span>
                                                    </Button>
                                                    <Button size="icon" variant="outline" className="h-8 w-8 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 shadow-sm" onClick={() => handleReject(row.id)}>
                                                        <X className="h-4 w-4" />
                                                        <span className="sr-only">Reject</span>
                                                    </Button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center justify-between px-4 py-4 border-t bg-gray-50/50">
                        <div className="text-xs text-muted-foreground">
                            Showing <strong>1-5</strong> of <strong>{data.length}</strong> entries
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" disabled>
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </Button>
                            <Button variant="outline" size="sm" disabled>
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
