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

type TyreRow = {
  id: string;
  srNo: string;
  axlePosition: string;
  tyreMake: string;
  tyreSerNo: string;
  tyreSize: string;
};

function newTyreRow(): TyreRow {
  return {
    id: `r-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    srNo: "",
    axlePosition: "",
    tyreMake: "",
    tyreSerNo: "",
    tyreSize: "",
  };
}

export default function MachinesTyreReplacementForm() {
  const [projects, setProjects] = useState<string[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [header, setHeader] = useState({
    project: "",
    date: new Date().toISOString().split("T")[0],
    ethDate: "",
    void: false,
    locked: false,
    refNo: "",
    equipCode: "",
    equipType: "",
    kmHrReading: "0",
    reasonForReplace: "",
  });
  const [rows, setRows] = useState<TyreRow[]>([newTyreRow()]);
  const [preparedBy, setPreparedBy] = useState("");
  const [checkedBy, setCheckedBy] = useState("");
  const [approvedBy, setApprovedBy] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoadingProjects(true);
    fetchAssetFacets()
      .then((data) => {
        if (!cancelled) setProjects(data.project_name ?? []);
      })
      .catch(() => {
        if (!cancelled) setProjects([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingProjects(false);
      });
    return () => { cancelled = true; };
  }, []);

  const addRow = () => setRows((prev) => [...prev, newTyreRow()]);
  const removeRow = (id: string) => {
    if (rows.length <= 1) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
  };
  const updateRow = (id: string, field: keyof TyreRow, value: string) => {
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
                NEW TYRE REPLACEMENT DATA ENTRY
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
          {/* Row 1: Project, Date, Eth Date, Void, Locked, Ref.No. */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex items-center gap-2 flex-1 min-w-0 max-w-[280px]">
              <Label className="text-xs font-medium text-zinc-600 shrink-0 w-16">
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
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={header.void}
                onChange={(e) =>
                  setHeader((p) => ({ ...p, void: e.target.checked }))
                }
                className="rounded border-zinc-300"
              />
              <span className="text-xs text-zinc-600">Void</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={header.locked}
                onChange={(e) =>
                  setHeader((p) => ({ ...p, locked: e.target.checked }))
                }
                className="rounded border-zinc-300"
              />
              <span className="text-xs text-zinc-600">Locked</span>
            </label>
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
          </div>

          {/* Row 2: Equip Code, Equip Type, Km/Hr Reading, Reason for the replace */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex items-center gap-2 flex-1 min-w-0 max-w-[200px]">
              <Label className="text-xs font-medium text-zinc-600 shrink-0">
                Equip Code
              </Label>
              <Select
                value={header.equipCode || "__none__"}
                onValueChange={(v) =>
                  setHeader((p) => ({ ...p, equipCode: v === "__none__" ? "" : v }))
                }
                className="[&_button]:h-8 [&_button]:text-xs [&_button]:px-2 [&_button]:rounded flex-1"
              >
                <SelectItem value="__none__">Select...</SelectItem>
              </Select>
            </div>
            <div className="flex items-center gap-2 flex-1 min-w-0 max-w-[200px]">
              <Label className="text-xs font-medium text-zinc-600 shrink-0">
                Equip Type
              </Label>
              <Input
                className="h-8 border border-zinc-200 rounded px-2 text-xs flex-1"
                value={header.equipType}
                onChange={(e) =>
                  setHeader((p) => ({ ...p, equipType: e.target.value }))
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs font-medium text-zinc-600 shrink-0">
                Km/Hr Reading
              </Label>
              <Input
                className="h-8 border border-zinc-200 rounded px-2 text-xs w-24"
                value={header.kmHrReading}
                onChange={(e) =>
                  setHeader((p) => ({ ...p, kmHrReading: e.target.value }))
                }
              />
            </div>
            <div className="flex items-center gap-2 flex-1 min-w-0 max-w-[240px]">
              <Label className="text-xs font-medium text-zinc-600 shrink-0">
                Reason for the replace
              </Label>
              <Select
                value={header.reasonForReplace || "__none__"}
                onValueChange={(v) =>
                  setHeader((p) => ({
                    ...p,
                    reasonForReplace: v === "__none__" ? "" : v,
                  }))
                }
                className="[&_button]:h-8 [&_button]:text-xs [&_button]:px-2 [&_button]:rounded flex-1"
              >
                <SelectItem value="__none__">Select...</SelectItem>
                <SelectItem value="wear">Wear</SelectItem>
                <SelectItem value="damage">Damage</SelectItem>
                <SelectItem value="puncture">Puncture</SelectItem>
              </Select>
            </div>
          </div>

          {/* Tyre replacement grid: SRNo, Axle Position, Tyre Make, Tyre Ser.No., Tyre Size */}
          <div className="rounded-lg border-2 border-green-700/40 overflow-hidden">
            <div className="border border-zinc-200 overflow-x-auto">
              <table className="text-xs border-collapse min-w-[600px] w-full">
                <thead className="bg-zinc-100">
                  <tr className="border-b border-zinc-200">
                    <th className="border border-zinc-200 px-1 py-1 text-center w-8"></th>
                    <th className="border border-zinc-200 px-1.5 py-1 text-left font-semibold text-zinc-600">
                      SRNo
                    </th>
                    <th className="border border-zinc-200 px-1.5 py-1 text-left font-semibold text-zinc-600">
                      Axle Position
                    </th>
                    <th className="border border-zinc-200 px-1.5 py-1 text-left font-semibold text-zinc-600">
                      Tyre Make
                    </th>
                    <th className="border border-zinc-200 px-1.5 py-1 text-left font-semibold text-zinc-600">
                      Tyre Ser.No.
                    </th>
                    <th className="border border-zinc-200 px-1.5 py-1 text-left font-semibold text-zinc-600">
                      Tyre Size
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
                          value={row.srNo}
                          onChange={(e) =>
                            updateRow(row.id, "srNo", e.target.value)
                          }
                        />
                      </td>
                      <td className="border border-zinc-200 p-0">
                        <Input
                          className={cellInput}
                          value={row.axlePosition}
                          onChange={(e) =>
                            updateRow(row.id, "axlePosition", e.target.value)
                          }
                        />
                      </td>
                      <td className="border border-zinc-200 p-0">
                        <Input
                          className={cellInput}
                          value={row.tyreMake}
                          onChange={(e) =>
                            updateRow(row.id, "tyreMake", e.target.value)
                          }
                        />
                      </td>
                      <td className="border border-zinc-200 p-0">
                        <Input
                          className={cellInput}
                          value={row.tyreSerNo}
                          onChange={(e) =>
                            updateRow(row.id, "tyreSerNo", e.target.value)
                          }
                        />
                      </td>
                      <td className="border border-zinc-200 p-0">
                        <Input
                          className={cellInput}
                          value={row.tyreSize}
                          onChange={(e) =>
                            updateRow(row.id, "tyreSize", e.target.value)
                          }
                        />
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
              className="m-2 text-xs"
              onClick={addRow}
            >
              Add row
            </Button>
          </div>

          {/* Footer: Prepared by, Checked by, Approved by + Record nav */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-3 border-t border-zinc-200">
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
            <div className="flex items-center gap-1.5 ml-auto text-xs text-zinc-500">
              <span>Record:</span>
              <Button type="button" variant="ghost" size="icon" className="h-7 w-7">
                |&lt;
              </Button>
              <Button type="button" variant="ghost" size="icon" className="h-7 w-7">
                &lt;
              </Button>
              <Input
                className="h-7 w-10 text-center text-xs border border-zinc-200 rounded px-1"
                defaultValue={1}
              />
              <Button type="button" variant="ghost" size="icon" className="h-7 w-7">
                &gt;
              </Button>
              <Button type="button" variant="ghost" size="icon" className="h-7 w-7">
                &gt;|
              </Button>
              <Button type="button" variant="ghost" size="icon" className="h-7 w-7">
                *
              </Button>
              <span>of {rows.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
