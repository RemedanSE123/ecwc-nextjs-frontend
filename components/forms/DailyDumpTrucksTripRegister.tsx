"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectItem } from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { fetchAssetFacets } from "@/lib/api/assets";

type TripRow = {
  id: string;
  plateNo: string;
  capacityM3: string;
  tripType: string;
  loadingArea: string;
  dumpingArea: string;
  distanceKm: string;
  noOfTrips: string;
  materialType: string;
  blockTripType: string;
};

function newTripRow(): TripRow {
  return {
    id: `r-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    plateNo: "",
    capacityM3: "0.0",
    tripType: "S",
    loadingArea: "",
    dumpingArea: "",
    distanceKm: "0",
    noOfTrips: "0",
    materialType: "",
    blockTripType: "S",
  };
}

export default function DailyDumpTrucksTripRegister() {
  const [projects, setProjects] = useState<string[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [header, setHeader] = useState({
    project: "",
    machineOwnership: "",
    refNo: "",
    date: new Date().toISOString().split("T")[0],
    ethDate: "",
  });
  const [rows, setRows] = useState<TripRow[]>([newTripRow()]);
  const [preparedBy, setPreparedBy] = useState("");
  const [checkedBy, setCheckedBy] = useState("");
  const [approvedBy, setApprovedBy] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoadingProjects(true);
    fetchAssetFacets()
      .then((data) => {
        if (!cancelled) setProjects(data.project_location ?? []);
      })
      .catch(() => {
        if (!cancelled) setProjects([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingProjects(false);
      });
    return () => { cancelled = true; };
  }, []);

  const addRow = () => setRows((prev) => [...prev, newTripRow()]);
  const removeRow = (id: string) => {
    if (rows.length <= 1) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
  };
  const updateRow = (id: string, field: keyof TripRow, value: string) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const cellInput =
    "h-7 border-0 rounded-none px-1.5 text-xs focus-visible:ring-0 focus-visible:ring-offset-0 w-full bg-transparent";
  const cellSelect =
    "[&_button]:h-7 [&_button]:min-h-7 [&_button]:text-xs [&_button]:rounded-none [&_button]:px-1.5 [&_button]:whitespace-nowrap";

  return (
    <div className="w-full min-w-0 mx-auto px-2 py-2">
      <Card className="w-full border border-zinc-200 shadow-sm rounded-lg bg-white overflow-hidden">
        <CardHeader className="p-0 shrink-0">
          <div className="grid grid-cols-[80px_1fr_140px] border-b border-zinc-200 bg-zinc-50/60">
            <div className="border-r border-zinc-200 flex items-center justify-center p-1.5 relative h-14">
              <Image
                src="/ecwc png logo.png"
                alt="ECWC Logo"
                fill
                className="object-contain p-1"
              />
            </div>
            <div className="border-r border-zinc-200 flex flex-col items-center justify-center py-2 px-3 text-center">
              <p className="text-[11px] font-bold text-zinc-800 tracking-wide">
                ETHIOPIAN CONSTRUCTION WORKS CORPORATION
              </p>
              <p className="text-[9px] font-medium text-zinc-500 mt-0.5">
                DAILY DUMP TRUCKS TRIP REGISTER
              </p>
            </div>
            <div className="flex flex-col justify-center pl-3 text-[10px] text-zinc-500">
              <p>
                <b>Document No.</b> OF/ECWC/xxx
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-3 sm:p-4 bg-white space-y-3">
          {/* Top: Project, Machine Ownership, Find Ref No, Ref.No., Date, Eth Date */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex items-center gap-2 flex-1 min-w-0 max-w-[280px]">
              <Label className="text-xs font-medium text-zinc-600 shrink-0 w-20">
                Project
              </Label>
              <Select
                value={header.project || "__none__"}
                onValueChange={(v) =>
                  setHeader((p) => ({ ...p, project: v === "__none__" ? "" : v }))
                }
                className="[&_button]:h-8 [&_button]:text-xs [&_button]:px-2 [&_button]:rounded flex-1"
                disabled={loadingProjects}
              >
                <SelectItem value="__none__">Select project...</SelectItem>
                {projects.map((proj) => (
                  <SelectItem key={proj} value={proj}>
                    {proj}
                  </SelectItem>
                ))}
              </Select>
            </div>
            <div className="flex items-center gap-2 flex-1 min-w-0 max-w-[220px]">
              <Label className="text-xs font-medium text-zinc-600 shrink-0">
                Machine Ownership
              </Label>
              <Select
                value={header.machineOwnership || "__none__"}
                onValueChange={(v) =>
                  setHeader((p) => ({
                    ...p,
                    machineOwnership: v === "__none__" ? "" : v,
                  }))
                }
                className="[&_button]:h-8 [&_button]:text-xs [&_button]:px-2 [&_button]:rounded flex-1"
              >
                <SelectItem value="__none__">Select...</SelectItem>
                <SelectItem value="own">Own</SelectItem>
                <SelectItem value="rented">Rented</SelectItem>
              </Select>
            </div>
            <Button
              type="button"
              variant="link"
              className="h-auto p-0 text-red-600 text-xs font-medium hover:text-red-700"
            >
              Find Ref No
            </Button>
            <div className="flex items-center gap-2">
              <Label className="text-xs font-medium text-zinc-600 shrink-0">
                Ref.No.
              </Label>
              <Input
                className="h-8 border border-zinc-200 rounded px-2 text-xs w-28"
                value={header.refNo}
                onChange={(e) =>
                  setHeader((p) => ({ ...p, refNo: e.target.value }))
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs font-medium text-zinc-600 shrink-0">
                Date
              </Label>
              <Input
                type="date"
                className="h-8 border border-zinc-200 rounded px-2 text-xs w-36"
                value={header.date}
                onChange={(e) =>
                  setHeader((p) => ({ ...p, date: e.target.value }))
                }
              />
            </div>
            <div className="flex items-center gap-1">
              <Label className="text-[10px] text-zinc-500">Eth Date</Label>
              <Input
                className="h-8 border border-zinc-200 rounded px-2 text-xs w-24"
                value={header.ethDate}
                onChange={(e) =>
                  setHeader((p) => ({ ...p, ethDate: e.target.value }))
                }
                placeholder="—"
              />
            </div>
          </div>

          {/* Data grid: Plate No, Capacity in M3, Trip Type, Loading Area, Dumping Area, Distance Km, No of Trips, Material Type, Trip Type */}
          <div className="border border-zinc-200 rounded-lg overflow-x-auto">
            <table className="text-xs border-collapse min-w-[900px] w-full">
              <thead className="bg-zinc-100">
                <tr className="border-b border-zinc-200">
                  <th className="border border-zinc-200 px-1 py-1 text-center w-8"></th>
                  <th className="border border-zinc-200 px-1.5 py-1 text-left font-semibold text-zinc-600">
                    Plate No
                  </th>
                  <th className="border border-zinc-200 px-1.5 py-1 text-left font-semibold text-zinc-600">
                    Capacity in M3
                  </th>
                  <th className="border border-zinc-200 px-1 py-1 text-center font-semibold text-zinc-600">
                    Trip Type
                  </th>
                  <th className="border border-zinc-200 px-1.5 py-1 text-left font-semibold text-zinc-600">
                    Loading Area
                  </th>
                  <th className="border border-zinc-200 px-1.5 py-1 text-left font-semibold text-zinc-600">
                    Dumping Area
                  </th>
                  <th className="border border-zinc-200 px-1 py-1 text-center font-semibold text-zinc-600">
                    Distance Km
                  </th>
                  <th className="border border-zinc-200 px-1 py-1 text-center font-semibold text-zinc-600">
                    No of Trips
                  </th>
                  <th className="border border-zinc-200 px-1.5 py-1 text-left font-semibold text-zinc-600">
                    Material Type
                  </th>
                  <th className="border border-zinc-200 px-1 py-1 text-center font-semibold text-zinc-600">
                    Trip Type
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="bg-white hover:bg-zinc-50/50">
                    <td className="border border-zinc-200 p-0 text-center align-middle w-8">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-400 hover:text-red-600 hover:bg-red-50"
                        onClick={() => removeRow(row.id)}
                        disabled={rows.length <= 1}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </td>
                    <td className="border border-zinc-200 p-0">
                      <Input
                        className={cellInput}
                        value={row.plateNo}
                        onChange={(e) =>
                          updateRow(row.id, "plateNo", e.target.value)
                        }
                      />
                    </td>
                    <td className="border border-zinc-200 p-0">
                      <Input
                        className={cellInput}
                        value={row.capacityM3}
                        onChange={(e) =>
                          updateRow(row.id, "capacityM3", e.target.value)
                        }
                      />
                    </td>
                    <td className="border border-zinc-200 p-0">
                      <Select
                        value={row.tripType}
                        onValueChange={(v) =>
                          updateRow(row.id, "tripType", v)
                        }
                        className={cellSelect}
                      >
                        <SelectItem value="S">S</SelectItem>
                        <SelectItem value="D">D</SelectItem>
                      </Select>
                    </td>
                    <td className="border border-zinc-200 p-0">
                      <Input
                        className={cellInput}
                        value={row.loadingArea}
                        onChange={(e) =>
                          updateRow(row.id, "loadingArea", e.target.value)
                        }
                      />
                    </td>
                    <td className="border border-zinc-200 p-0">
                      <Input
                        className={cellInput}
                        value={row.dumpingArea}
                        onChange={(e) =>
                          updateRow(row.id, "dumpingArea", e.target.value)
                        }
                      />
                    </td>
                    <td className="border border-zinc-200 p-0">
                      <Input
                        className={cellInput}
                        value={row.distanceKm}
                        onChange={(e) =>
                          updateRow(row.id, "distanceKm", e.target.value)
                        }
                      />
                    </td>
                    <td className="border border-zinc-200 p-0">
                      <Input
                        className={cellInput}
                        value={row.noOfTrips}
                        onChange={(e) =>
                          updateRow(row.id, "noOfTrips", e.target.value)
                        }
                      />
                    </td>
                    <td className="border border-zinc-200 p-0">
                      <Input
                        className={cellInput}
                        value={row.materialType}
                        onChange={(e) =>
                          updateRow(row.id, "materialType", e.target.value)
                        }
                      />
                    </td>
                    <td className="border border-zinc-200 p-0">
                      <Select
                        value={row.blockTripType}
                        onValueChange={(v) =>
                          updateRow(row.id, "blockTripType", v)
                        }
                        className={cellSelect}
                      >
                        <SelectItem value="S">S</SelectItem>
                        <SelectItem value="D">D</SelectItem>
                      </Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={addRow}
          >
            Add row
          </Button>

          {/* Footer: Prepared by, Checked by, Approved by + legend */}
          <div className="space-y-2 pt-3 border-t border-zinc-200">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <div className="flex items-center gap-2">
                <Label className="text-xs font-medium text-zinc-600 shrink-0">
                  Prepared by
                </Label>
                <Select
                  value={preparedBy || "__none__"}
                  onValueChange={(v) =>
                    setPreparedBy(v === "__none__" ? "" : v)
                  }
                  className={cellSelect + " min-w-[140px] [&_button]:w-full"}
                >
                  <SelectItem value="__none__">Select...</SelectItem>
                  <SelectItem value="u1">User 1</SelectItem>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs font-medium text-zinc-600 shrink-0">
                  Checked by
                </Label>
                <Select
                  value={checkedBy || "__none__"}
                  onValueChange={(v) =>
                    setCheckedBy(v === "__none__" ? "" : v)
                  }
                  className={cellSelect + " min-w-[140px] [&_button]:w-full"}
                >
                  <SelectItem value="__none__">Select...</SelectItem>
                  <SelectItem value="c1">Checker 1</SelectItem>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs font-medium text-zinc-600 shrink-0">
                  Approved by
                </Label>
                <Select
                  value={approvedBy || "__none__"}
                  onValueChange={(v) =>
                    setApprovedBy(v === "__none__" ? "" : v)
                  }
                  className={cellSelect + " min-w-[140px] [&_button]:w-full"}
                >
                  <SelectItem value="__none__">Select...</SelectItem>
                  <SelectItem value="a1">Approver 1</SelectItem>
                </Select>
              </div>
            </div>
            <p className="text-[11px] text-red-600">
              Trip Type S stands for a truck loaded only the one way trip, D
              stands for a truck loaded the two way trips.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
