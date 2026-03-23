"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectItem } from "@/components/ui/select";
import { Trash2, Search } from "lucide-react";
import { fetchAssetFacets } from "@/lib/api/assets";

type ItemRow = {
  id: string;
  itemCategory: string;
  partNo: string;
  description: string;
  unit: string;
  qty: string;
  remark: string;
};

function newItemRow(): ItemRow {
  return {
    id: `r-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    itemCategory: "",
    partNo: "",
    description: "",
    unit: "",
    qty: "",
    remark: "",
  };
}

export default function CanibalizationForm() {
  const [projects, setProjects] = useState<string[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [header, setHeader] = useState({
    project: "",
    date: new Date().toISOString().split("T")[0],
    ethDate: "",
    void: false,
    locked: false,
    refNo: "",
  });
  const [fromSection, setFromSection] = useState({
    equipCode: "",
    equipType: "",
    model: "",
  });
  const [toSection, setToSection] = useState({
    equipCode: "",
    equipType: "",
    model: "",
  });
  const [rows, setRows] = useState<ItemRow[]>([newItemRow()]);
  const [reason, setReason] = useState("");
  const [requestedBy, setRequestedBy] = useState("");
  const [checkedBy, setCheckedBy] = useState("");
  const [approvedBy, setApprovedBy] = useState("");
  const [canibalizedBy, setCanibalizedBy] = useState("");

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

  const addRow = () => setRows((prev) => [...prev, newItemRow()]);
  const removeRow = (id: string) => {
    if (rows.length <= 1) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
  };
  const updateRow = (id: string, field: keyof ItemRow, value: string) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const cellInput =
    "h-6 border-0 rounded-none px-1 text-[11px] focus-visible:ring-0 focus-visible:ring-offset-0 w-full bg-transparent";
  const cellSelect =
    "[&_button]:h-6 [&_button]:min-h-6 [&_button]:text-[11px] [&_button]:rounded-none [&_button]:px-1 [&_button]:whitespace-nowrap";

  return (
    <div className="w-full min-w-0 mx-auto px-2 py-1.5 max-h-[calc(100vh-6rem)] flex flex-col min-h-0">
      <Card className="w-full border border-zinc-200 shadow-sm rounded-lg bg-white overflow-hidden flex flex-col min-h-0 flex-1">
        <CardHeader className="p-0 shrink-0">
          <div className="grid grid-cols-[64px_1fr_100px] border-b border-zinc-200 bg-zinc-50/60">
            <div className="border-r border-zinc-200 flex items-center justify-center p-1 relative h-10">
              <Image
                src="/ecwc png logo.png"
                alt="ECWC Logo"
                fill
                className="object-contain p-1"
              />
            </div>
            <div className="border-r border-zinc-200 flex flex-col items-center justify-center py-1 px-2 text-center">
              <p className="text-[10px] font-bold text-zinc-800 tracking-wide leading-tight">
                ETHIOPIAN CONSTRUCTION WORKS CORPORATION
              </p>
              <p className="text-[8px] font-medium text-zinc-500 mt-0.5 leading-tight">
                EQUIPMENT CANIBALIZATION DATA ENTRY
              </p>
            </div>
            <div className="flex flex-col justify-center pl-2 text-[9px] text-zinc-500">
              <p><b>Doc No.</b> OF/ECWC/xxx</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-2 bg-white flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* General + Parts from | Fitted to — one compact block */}
          <div className="shrink-0 space-y-1.5 mb-1.5">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <div className="flex items-center gap-1.5 min-w-0 max-w-[200px]">
                <Label className="text-[11px] font-medium text-zinc-600 shrink-0 w-12">Project</Label>
                <Select
                  value={header.project || "__none__"}
                  onValueChange={(v) =>
                    setHeader((p) => ({ ...p, project: v === "__none__" ? "" : v }))
                  }
                  className="[&_button]:h-6 [&_button]:text-[11px] [&_button]:px-1.5 [&_button]:rounded flex-1"
                  disabled={loadingProjects}
                >
                  <SelectItem value="__none__">Select...</SelectItem>
                  {projects.map((proj) => (
                    <SelectItem key={proj} value={proj}>{proj}</SelectItem>
                  ))}
                </Select>
              </div>
              <div className="flex items-center gap-1">
                <Label className="text-[11px] text-zinc-600 shrink-0">Date</Label>
                <Input type="date" className="h-6 border border-zinc-200 rounded px-1.5 text-[11px] w-28" value={header.date} onChange={(e) => setHeader((p) => ({ ...p, date: e.target.value }))} />
              </div>
              <div className="flex items-center gap-1">
                <Label className="text-[10px] text-zinc-500">Eth</Label>
                <Input className="h-6 border border-zinc-200 rounded px-1.5 text-[11px] w-20" value={header.ethDate} onChange={(e) => setHeader((p) => ({ ...p, ethDate: e.target.value }))} placeholder="—" />
              </div>
              <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={header.void} onChange={(e) => setHeader((p) => ({ ...p, void: e.target.checked }))} className="rounded border-zinc-300" /><span className="text-[11px] text-zinc-600">Void</span></label>
              <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={header.locked} onChange={(e) => setHeader((p) => ({ ...p, locked: e.target.checked }))} className="rounded border-zinc-300" /><span className="text-[11px] text-zinc-600">Locked</span></label>
              <div className="flex items-center gap-1">
                <Label className="text-[11px] text-zinc-600 shrink-0">Ref.No.</Label>
                <Input className="h-6 border border-zinc-200 rounded px-1.5 text-[11px] w-20" value={header.refNo} onChange={(e) => setHeader((p) => ({ ...p, refNo: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded border border-red-200 bg-zinc-50/50 p-1.5 space-y-1">
                <p className="text-[10px] font-semibold text-red-700 border-b border-red-200 pb-0.5">Parts canibalized from</p>
                <div className="grid grid-cols-[60px_1fr] gap-x-1 gap-y-0.5 items-center">
                  <Label className="text-[10px] text-zinc-600">Equip Code</Label>
                  <Select value={fromSection.equipCode || "__none__"} onValueChange={(v) => setFromSection((p) => ({ ...p, equipCode: v === "__none__" ? "" : v }))} className={cellSelect + " [&_button]:w-full"}>
                    <SelectItem value="__none__">Select...</SelectItem>
                  </Select>
                  <Label className="text-[10px] text-zinc-600">Equip Type</Label>
                  <Input className="h-6 border border-zinc-200 rounded px-1 text-[11px]" value={fromSection.equipType} onChange={(e) => setFromSection((p) => ({ ...p, equipType: e.target.value }))} />
                  <Label className="text-[10px] text-zinc-600">Model</Label>
                  <Input className="h-6 border border-zinc-200 rounded px-1 text-[11px]" value={fromSection.model} onChange={(e) => setFromSection((p) => ({ ...p, model: e.target.value }))} />
                </div>
              </div>
              <div className="rounded border border-red-200 bg-zinc-50/50 p-1.5 space-y-1">
                <p className="text-[10px] font-semibold text-red-700 border-b border-red-200 pb-0.5">Fitted to</p>
                <div className="grid grid-cols-[60px_1fr] gap-x-1 gap-y-0.5 items-center">
                  <Label className="text-[10px] text-zinc-600">Equip Code</Label>
                  <Select value={toSection.equipCode || "__none__"} onValueChange={(v) => setToSection((p) => ({ ...p, equipCode: v === "__none__" ? "" : v }))} className={cellSelect + " [&_button]:w-full"}>
                    <SelectItem value="__none__">Select...</SelectItem>
                  </Select>
                  <Label className="text-[10px] text-zinc-600">Equip Type</Label>
                  <Input className="h-6 border border-zinc-200 rounded px-1 text-[11px]" value={toSection.equipType} onChange={(e) => setToSection((p) => ({ ...p, equipType: e.target.value }))} />
                  <Label className="text-[10px] text-zinc-600">Model</Label>
                  <Input className="h-6 border border-zinc-200 rounded px-1 text-[11px]" value={toSection.model} onChange={(e) => setToSection((p) => ({ ...p, model: e.target.value }))} />
                </div>
              </div>
            </div>
          </div>

          {/* Item grid — scrollable only this block */}
          <div className="rounded border-2 border-green-700/40 overflow-hidden flex-1 min-h-0 flex flex-col">
            <div className="border border-zinc-200 overflow-auto flex-1 min-h-0" style={{ minHeight: '100px' }}>
              <table className="text-[11px] border-collapse min-w-[600px] w-full">
                <thead className="bg-zinc-100 sticky top-0">
                  <tr className="border-b border-zinc-200">
                    <th className="border border-zinc-200 px-0.5 py-0.5 text-center w-6"></th>
                    <th className="border border-zinc-200 px-1 py-0.5 text-left font-semibold text-zinc-600">Item Category</th>
                    <th className="border border-zinc-200 px-1 py-0.5 text-left font-semibold text-zinc-600">Part No</th>
                    <th className="border border-zinc-200 px-1 py-0.5 text-left font-semibold text-zinc-600">Description</th>
                    <th className="border border-zinc-200 px-1 py-0.5 text-left font-semibold text-zinc-600">Unit</th>
                    <th className="border border-zinc-200 px-0.5 py-0.5 text-center font-semibold text-zinc-600">Qty</th>
                    <th className="border border-zinc-200 px-1 py-0.5 text-left font-semibold text-zinc-600">Remark</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} className="bg-white hover:bg-zinc-50/50">
                      <td className="border border-zinc-200 p-0 text-center align-middle w-6">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 text-red-400 hover:text-red-600 hover:bg-red-50"
                          onClick={() => removeRow(row.id)}
                          disabled={rows.length <= 1}
                        >
                          <Trash2 className="h-2.5 w-2.5" />
                        </Button>
                      </td>
                      <td className="border border-zinc-200 p-0">
                        <Input
                          className={cellInput}
                          value={row.itemCategory}
                          onChange={(e) =>
                            updateRow(row.id, "itemCategory", e.target.value)
                          }
                        />
                      </td>
                      <td className="border border-zinc-200 p-0">
                        <Input
                          className={cellInput}
                          value={row.partNo}
                          onChange={(e) =>
                            updateRow(row.id, "partNo", e.target.value)
                          }
                        />
                      </td>
                      <td className="border border-zinc-200 p-0">
                        <Input
                          className={cellInput}
                          value={row.description}
                          onChange={(e) =>
                            updateRow(row.id, "description", e.target.value)
                          }
                        />
                      </td>
                      <td className="border border-zinc-200 p-0">
                        <Input
                          className={cellInput}
                          value={row.unit}
                          onChange={(e) =>
                            updateRow(row.id, "unit", e.target.value)
                          }
                        />
                      </td>
                      <td className="border border-zinc-200 p-0">
                        <Input
                          className={cellInput}
                          value={row.qty}
                          onChange={(e) =>
                            updateRow(row.id, "qty", e.target.value)
                          }
                        />
                      </td>
                      <td className="border border-zinc-200 p-0">
                        <Input
                          className={cellInput}
                          value={row.remark}
                          onChange={(e) =>
                            updateRow(row.id, "remark", e.target.value)
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="shrink-0 flex items-center gap-1.5 p-1 border-t border-zinc-200">
              <Button type="button" variant="outline" size="sm" className="h-6 text-[11px]" onClick={addRow}>Add row</Button>
            </div>
          </div>

          {/* Reason + Approval + Record — one compact footer row */}
          <div className="shrink-0 pt-1.5 border-t border-zinc-200 space-y-1">
            <div className="flex items-center gap-2">
              <Label className="text-[10px] font-medium text-zinc-600 shrink-0">Reason of canibalization</Label>
              <input
                type="text"
                className="flex-1 min-w-0 h-6 border border-zinc-200 rounded px-2 text-[11px]"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason..."
              />
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <div className="flex items-center gap-1">
                <Label className="text-[10px] text-zinc-600 shrink-0">Requested by</Label>
                <Select value={requestedBy || "__none__"} onValueChange={(v) => setRequestedBy(v === "__none__" ? "" : v)} className={cellSelect + " w-28 [&_button]:w-full"}>
                  <SelectItem value="__none__">Select...</SelectItem>
                  <SelectItem value="u1">User 1</SelectItem>
                </Select>
              </div>
              <div className="flex items-center gap-1">
                <Label className="text-[10px] text-zinc-600 shrink-0">Checked by</Label>
                <Select value={checkedBy || "__none__"} onValueChange={(v) => setCheckedBy(v === "__none__" ? "" : v)} className={cellSelect + " w-28 [&_button]:w-full"}>
                  <SelectItem value="__none__">Select...</SelectItem>
                  <SelectItem value="c1">Checker 1</SelectItem>
                </Select>
              </div>
              <div className="flex items-center gap-1">
                <Label className="text-[10px] text-zinc-600 shrink-0">Approved by</Label>
                <Select value={approvedBy || "__none__"} onValueChange={(v) => setApprovedBy(v === "__none__" ? "" : v)} className={cellSelect + " w-28 [&_button]:w-full"}>
                  <SelectItem value="__none__">Select...</SelectItem>
                  <SelectItem value="a1">Approver 1</SelectItem>
                </Select>
              </div>
              <div className="flex items-center gap-1">
                <Label className="text-[10px] text-zinc-600 shrink-0">Canibalized by</Label>
                <Select value={canibalizedBy || "__none__"} onValueChange={(v) => setCanibalizedBy(v === "__none__" ? "" : v)} className={cellSelect + " w-28 [&_button]:w-full"}>
                  <SelectItem value="__none__">Select...</SelectItem>
                  <SelectItem value="cb1">User 1</SelectItem>
                </Select>
              </div>
              <div className="flex items-center gap-0.5 ml-auto text-[10px] text-zinc-500">
                <span>Record:</span>
                <Button type="button" variant="ghost" size="icon" className="h-6 w-6">|&lt;</Button>
                <Button type="button" variant="ghost" size="icon" className="h-6 w-6">&lt;</Button>
                <Input className="h-6 w-8 text-center text-[11px] border border-zinc-200 rounded px-0.5" defaultValue={1} />
                <Button type="button" variant="ghost" size="icon" className="h-6 w-6">&gt;</Button>
                <Button type="button" variant="ghost" size="icon" className="h-6 w-6">&gt;|</Button>
                <Button type="button" variant="ghost" size="icon" className="h-6 w-6" title="Search"><Search className="h-3 w-3" /></Button>
                <span>of 1</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
