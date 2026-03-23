"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { fetchAssetFacets, fetchAssets } from "@/lib/api/assets";
import { SLUG_TO_DB_CATEGORY, type Asset } from "@/types/asset";
import { cn } from "@/lib/utils";
import { HelpCircle, X, Calculator, Info, ArrowRight, CheckCircle } from "lucide-react";

type PlanRow = {
  id: string;
  assetId: string;
  category: string;
  description: string;
  model: string;
  plateNo: string;
  qty: string;
  workingHrDay: string;
  workingDays: string;
  opHrPlanPct: string;
  idleHrPlanPct: string;
  downHrPlanPct: string;
  opHr: string;
  idleHr: string;
  downHr: string;
  rentalRate: string;
  operationalAmount: string;
  fuelConsHr: string;
  totalFuel: string;
  fuelRate: string;
  fuelInAmt: string;
};

function newPlanRow(): PlanRow {
  return {
    id: `r-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    assetId: "",
    category: "",
    description: "",
    model: "",
    plateNo: "",
    qty: "0",
    workingHrDay: "0",
    workingDays: "0",
    opHrPlanPct: "0.0",
    idleHrPlanPct: "0.0",
    downHrPlanPct: "0.0",
    opHr: "0.00",
    idleHr: "0.00",
    downHr: "0.00",
    rentalRate: "0.00",
    operationalAmount: "0.00",
    fuelConsHr: "0.00",
    totalFuel: "0.00",
    fuelRate: "0.00",
    fuelInAmt: "0.00",
  };
}

export default function EquipmentUtilizationPlan() {
  const [projects, setProjects] = useState<string[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [header, setHeader] = useState({
    project: "",
    dateFrom: new Date().toISOString().split("T")[0],
    dateTo: new Date().toISOString().split("T")[0],
  });
  const [rows, setRows] = useState<PlanRow[]>([newPlanRow()]);
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

  function calculateRow(row: PlanRow): PlanRow {
    const qty = parseFloat(row.qty) || 0;
    const hrDay = parseFloat(row.workingHrDay) || 0;
    const days = parseFloat(row.workingDays) || 0;

    const opPct = parseFloat(row.opHrPlanPct) || 0;
    const idlePct = parseFloat(row.idleHrPlanPct) || 0;
    const downPct = parseFloat(row.downHrPlanPct) || 0;

    const rentalRate = parseFloat(row.rentalRate) || 0;
    const fuelCons = parseFloat(row.fuelConsHr) || 0;
    const fuelRate = parseFloat(row.fuelRate) || 0;

    const totalHours = qty * hrDay * days;

    const opHr = totalHours * (opPct / 100);
    const idleHr = totalHours * (idlePct / 100);
    const downHr = totalHours * (downPct / 100);

    const operationalAmount = opHr * rentalRate;

    const totalFuel = opHr * fuelCons;

    const fuelInAmt = totalFuel * fuelRate;

    return {
      ...row,
      opHr: opHr.toFixed(2),
      idleHr: idleHr.toFixed(2),
      downHr: downHr.toFixed(2),
      operationalAmount: operationalAmount.toFixed(2),
      totalFuel: totalFuel.toFixed(2),
      fuelInAmt: fuelInAmt.toFixed(2),
    };
  }

  const updateRow = (id: string, field: keyof PlanRow, value: string) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, [field]: value };
        return calculateRow(updated);
      })
    );
  };

  // Auto-load all assets for the selected project (Machinery, Heavy Vehicle, Light Vehicles & Bus)
  useEffect(() => {
    let cancelled = false;

    const project = header.project?.trim();
    if (!project) {
      setRows([newPlanRow()]);
      return () => { cancelled = true; };
    }

    const allowedCategories = [
      SLUG_TO_DB_CATEGORY["machinery"],
      SLUG_TO_DB_CATEGORY["heavy-vehicles"],
      SLUG_TO_DB_CATEGORY["light-vehicles"],
    ].filter(Boolean);

    const run = async () => {
      try {
        setLoadingAssets(true);
        const first = await fetchAssets({
          project_name: project,
          category: allowedCategories,
          include_details: true,
          page: 1,
          limit: 500,
        });

        let all: Asset[] = first.data ?? [];
        if (first.totalPages && first.totalPages > 1) {
          const pages = Array.from({ length: first.totalPages - 1 }, (_, i) => i + 2);
          const rest = await Promise.all(
            pages.map((p) =>
              fetchAssets({
                project_name: project,
                category: allowedCategories,
                include_details: true,
                page: p,
                limit: 500,
              })
            )
          );
          rest.forEach((r) => {
            all = all.concat(r.data ?? []);
          });
        }

        if (cancelled) return;
        setRows((prev) => {
          const prevByAssetId = new Map(
            prev.filter((r) => r.assetId).map((r) => [r.assetId, r] as const)
          );
          return all.map((a) => {
            const prevRow = prevByAssetId.get(a.id);
            return {
              id: a.id,
              assetId: a.id,
              category: a.category ?? "",
              description: a.description ?? "",
              model: a.model ?? "",
              plateNo: a.plate_no ?? a.asset_no ?? "",
              qty: prevRow?.qty ?? "0",
              workingHrDay: prevRow?.workingHrDay ?? "0",
              workingDays: prevRow?.workingDays ?? "0",
              opHrPlanPct: prevRow?.opHrPlanPct ?? "0.0",
              idleHrPlanPct: prevRow?.idleHrPlanPct ?? "0.0",
              downHrPlanPct: prevRow?.downHrPlanPct ?? "0.0",
              opHr: prevRow?.opHr ?? "0.00",
              idleHr: prevRow?.idleHr ?? "0.00",
              downHr: prevRow?.downHr ?? "0.00",
              rentalRate: prevRow?.rentalRate ?? "0.00",
              operationalAmount: prevRow?.operationalAmount ?? "0.00",
              fuelConsHr: prevRow?.fuelConsHr ?? "0.00",
              totalFuel: prevRow?.totalFuel ?? "0.00",
              fuelRate: prevRow?.fuelRate ?? "0.00",
              fuelInAmt: prevRow?.fuelInAmt ?? "0.00",
            };
          });
        });
      } catch {
        if (!cancelled) setRows([newPlanRow()]);
      } finally {
        if (!cancelled) setLoadingAssets(false);
      }
    };

    run();
    return () => { cancelled = true; };
  }, [header.project]);

  const handleZeroFocus = (rowId: string, field: keyof PlanRow, current: string) => {
    if (current === "0" || current === "0.0" || current === "0.00") {
      updateRow(rowId, field, "");
    }
  };

  // Style classes for different input types
  const cellInput = "h-6 border-0 rounded-none px-1 text-xs focus-visible:ring-0 focus-visible:ring-offset-0 w-full bg-transparent";
  const readOnlyInput = "h-6 border-0 rounded-none px-1 text-xs w-full bg-slate-50 text-slate-600 cursor-default";
  const userInput = "h-6 border-0 rounded-none px-1 text-xs focus-visible:ring-1 focus-visible:ring-blue-400 focus-visible:ring-offset-0 w-full bg-white hover:bg-blue-50/30 transition-colors";

  return (
    <div className="w-full min-w-0 h-full min-h-0 flex flex-col p-0 m-0 px-2">
      <Card className="w-full min-w-0 flex-1 min-h-0 border-0 shadow-none rounded-none bg-white overflow-hidden flex flex-col">
        {/* Official document header - matching the register form */}
        <CardHeader className="p-0 print:border-2 print:border-black shrink-0">
          <div className="grid grid-cols-[90px_1fr_160px] border-b-2 border-slate-900 bg-gradient-to-r from-slate-50 to-slate-100">
            <div className="border-r-2 border-slate-900 flex items-center justify-center p-2 relative h-16">
              <Image src="/ecwc png logo.png" alt="ECWC Logo" fill className="object-contain p-1.5" />
            </div>
            <div className="border-r-2 border-slate-900 flex flex-col items-center justify-center py-2.5 px-4 text-center">
              <p className="text-[12px] font-bold text-slate-900 tracking-wide">ETHIOPIAN CONSTRUCTION WORKS CORPORATION</p>
              <p className="text-[10px] font-semibold text-slate-600 mt-1">EQUIPMENT UTILIZATION PLAN</p>
            </div>
            <div className="flex flex-col justify-center px-4 text-[11px] text-slate-700 font-medium">
              <p><b>Document No.</b></p>
              <p>OF/ECWC/xxx</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 pb-2 bg-white min-w-0 flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Document info row - with Help button */}
          <div className="shrink-0 space-y-2 mb-3">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg p-2 border border-slate-200">
              <div className="flex items-center gap-2 flex-1 min-w-0 max-w-full">
                <Label className="text-xs font-semibold text-slate-700 shrink-0 w-16">Project</Label>
                <Select
                  value={header.project || "__none__"}
                  onValueChange={(v) => {
                    const nextProject = v === "__none__" ? "" : v;
                    setHeader((p) => ({ ...p, project: nextProject }));
                  }}
                  className="[&_button]:h-8 [&_button]:text-xs [&_button]:px-2 [&_button]:rounded-lg [&_button]:border-slate-300 [&_button]:hover:bg-slate-50 min-w-[320px] flex-1 max-w-[640px]"
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
                <Label className="text-xs font-semibold text-slate-700 shrink-0">Date From</Label>
                <Input
                  type="date"
                  className="h-8 border border-slate-300 rounded-lg px-2 text-xs w-36 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  value={header.dateFrom}
                  onChange={(e) => setHeader((p) => ({ ...p, dateFrom: e.target.value }))}
                />
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs font-semibold text-slate-700 shrink-0">Date To</Label>
                <Input
                  type="date"
                  className="h-8 border border-slate-300 rounded-lg px-2 text-xs w-36 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  value={header.dateTo}
                  onChange={(e) => setHeader((p) => ({ ...p, dateTo: e.target.value }))}
                />
              </div>
              
              {/* Help Button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowHelp(true)}
                className="h-8 text-xs border-blue-300 text-blue-700 hover:bg-blue-50 hover:text-blue-800 ml-auto"
              >
                <HelpCircle className="h-3.5 w-3.5 mr-1" />
                How to Plan
              </Button>
              
              {loadingAssets && header.project ? (
                <span className="text-xs text-slate-500">Loading assets...</span>
              ) : null}
            </div>
          </div>

          {/* Help Popup Modal */}
          {showHelp && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true">
              <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex items-center justify-between px-5 py-3 border-b border-blue-200 bg-gradient-to-r from-blue-50 to-sky-50">
                  <div className="flex items-center gap-2">
                   
                    <span className="text-base font-semibold text-blue-900">Equipment Utilization Plan - Quick Guide</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setShowHelp(false)} 
                    className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-200 hover:text-blue-800 transition-colors"
                    aria-label="Close help"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="overflow-y-auto p-5 text-sm space-y-5">
                  {/* Overview */}
                  <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-800 mb-1">How to use this form</p>
                        <p className="text-xs text-blue-700">
                          Select a project to auto-load all equipment. Enter your planned values in the blue-highlighted fields, 
                          and all calculations will update automatically. Gray fields are read-only and show calculated results.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Color Legend */}
                  <div className="flex flex-wrap items-center gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 bg-white border border-slate-300 rounded"></div>
                      <span className="text-xs text-slate-600">Static Asset Data</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 bg-blue-50 border border-blue-300 rounded ring-1 ring-blue-200"></div>
                      <span className="text-xs text-slate-600">User Input Fields</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 bg-slate-100 border border-slate-300 rounded"></div>
                      <span className="text-xs text-slate-600">Auto-calculated Results</span>
                    </div>
                  </div>

                  {/* Calculation Summary Table */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Calculation Summary
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Input Parameters Card */}
                      <div className="border border-slate-200 rounded-lg overflow-hidden">
                        <div className="bg-slate-100 px-3 py-2 border-b border-slate-200">
                          <p className="text-xs font-semibold text-slate-700"> Input Parameters (You Enter)</p>
                        </div>
                        <div className="p-3 space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-600">Quantity (Qty)</span>
                            <span className="font-mono bg-blue-50 px-2 py-0.5 rounded">Number of equipment</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-600">Working Hr/Day</span>
                            <span className="font-mono bg-blue-50 px-2 py-0.5 rounded">Hours per day</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-600">Working Days</span>
                            <span className="font-mono bg-blue-50 px-2 py-0.5 rounded">Total days in period</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-600">Plan % (Op/Idle/Down)</span>
                            <span className="font-mono bg-blue-50 px-2 py-0.5 rounded">Percentage allocation</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-600">Rental Rate</span>
                            <span className="font-mono bg-blue-50 px-2 py-0.5 rounded">Cost per hour</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-600">Fuel Cons/Hr</span>
                            <span className="font-mono bg-blue-50 px-2 py-0.5 rounded">Liters per hour</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-600">Fuel Rate</span>
                            <span className="font-mono bg-blue-50 px-2 py-0.5 rounded">Cost per liter</span>
                          </div>
                        </div>
                      </div>

                      {/* Calculated Results Card */}
                      <div className="border border-slate-200 rounded-lg overflow-hidden">
                        <div className="bg-slate-100 px-3 py-2 border-b border-slate-200">
                          <p className="text-xs font-semibold text-slate-700">Calculated Results (Auto)</p>
                        </div>
                        <div className="p-3 space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-600">Op/Idle/Down Hours</span>
                            <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">Qty × Hr/Day × Days × (Plan%/100)</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-600">Operational Amount</span>
                            <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">Op Hr × Rental Rate</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-600">Total Fuel</span>
                            <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">Op Hr × Fuel Cons/Hr</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-600">Fuel Amount</span>
                            <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">Total Fuel × Fuel Rate</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Formulas Table */}
                    <div className="mt-4 border border-slate-200 rounded-lg overflow-hidden">
                      <div className="bg-slate-100 px-3 py-2 border-b border-slate-200">
                        <p className="text-xs font-semibold text-slate-700"> Detailed Calculation Formulas</p>
                      </div>
                      <table className="w-full text-xs">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-3 py-2 text-left font-medium text-slate-600 border-b border-slate-200">Field</th>
                            <th className="px-3 py-2 text-left font-medium text-slate-600 border-b border-slate-200">Formula</th>
                            <th className="px-3 py-2 text-left font-medium text-slate-600 border-b border-slate-200">Example</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          <tr>
                            <td className="px-3 py-2 text-slate-700">Total Hours</td>
                            <td className="px-3 py-2 text-slate-600 font-mono">Qty × Working Hr/Day × Working Days</td>
                            <td className="px-3 py-2 text-slate-600">2 × 8 × 20 = 320 hrs</td>
                          </tr>
                          <tr>
                            <td className="px-3 py-2 text-slate-700">Op Hours</td>
                            <td className="px-3 py-2 text-slate-600 font-mono">Total Hours × (Op Plan% / 100)</td>
                            <td className="px-3 py-2 text-slate-600">320 × (75/100) = 240 hrs</td>
                          </tr>
                          <tr>
                            <td className="px-3 py-2 text-slate-700">Idle Hours</td>
                            <td className="px-3 py-2 text-slate-600 font-mono">Total Hours × (Idle Plan% / 100)</td>
                            <td className="px-3 py-2 text-slate-600">320 × (15/100) = 48 hrs</td>
                          </tr>
                          <tr>
                            <td className="px-3 py-2 text-slate-700">Down Hours</td>
                            <td className="px-3 py-2 text-slate-600 font-mono">Total Hours × (Down Plan% / 100)</td>
                            <td className="px-3 py-2 text-slate-600">320 × (10/100) = 32 hrs</td>
                          </tr>
                          <tr>
                            <td className="px-3 py-2 text-slate-700">Operational Amount</td>
                            <td className="px-3 py-2 text-slate-600 font-mono">Op Hours × Rental Rate</td>
                            <td className="px-3 py-2 text-slate-600">240 × 50 = 12,000</td>
                          </tr>
                          <tr>
                            <td className="px-3 py-2 text-slate-700">Total Fuel</td>
                            <td className="px-3 py-2 text-slate-600 font-mono">Op Hours × Fuel Cons/Hr</td>
                            <td className="px-3 py-2 text-slate-600">240 × 5 = 1,200 L</td>
                          </tr>
                          <tr>
                            <td className="px-3 py-2 text-slate-700">Fuel Amount</td>
                            <td className="px-3 py-2 text-slate-600 font-mono">Total Fuel × Fuel Rate</td>
                            <td className="px-3 py-2 text-slate-600">1,200 × 25 = 30,000</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Important Notes */}
                    <div className="bg-amber-50/50 p-4 rounded-lg border border-amber-200 mt-2">
                      <p className="text-xs font-semibold text-amber-800 mb-2">📌 Important Notes:</p>
                      <ul className="space-y-1 text-xs text-amber-700 list-disc pl-4">
                        <li>Plan percentages (Op/Idle/Down) should add up to 100% for accurate planning</li>
                        <li>All calculated fields update automatically when you change any input value</li>
                        <li>Zero values are cleared when you focus on an input field for easier data entry</li>
                        <li>Assets are auto-loaded when you select a project (Machinery, Heavy & Light Vehicles only)</li>
                        <li>Hover over any read-only field to see what calculation produced the value</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end px-5 py-3 border-t border-slate-200 bg-slate-50">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setShowHelp(false)}
                    className="h-8 text-xs bg-blue-600 hover:bg-blue-700"
                  >
                    Got it
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Legend for input types */}
          <div className="shrink-0 mb-2 flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-white border border-slate-300 rounded-sm"></div>
              <span className="text-slate-600">Static Asset Data</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-white border border-blue-300 rounded-sm ring-1 ring-blue-200"></div>
              <span className="text-slate-600">User Input Fields</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-slate-50 border border-slate-300 rounded-sm"></div>
              <span className="text-slate-600">Auto-calculated</span>
            </div>
          </div>

          {/* Equipment entries table - matching register styling */}
          <div className="w-full border border-slate-300 rounded-xl overflow-hidden flex-1 min-h-0 flex flex-col shadow-md">
            <div className="overflow-auto flex-1 min-h-0">
              <table className="text-xs border-collapse min-w-[1400px] w-full">
                <thead className="sticky top-0 z-[1] bg-gradient-to-r from-slate-900 to-slate-800">
                  <tr className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700">
                    <th className="border border-slate-600 px-1.5 py-2 text-center font-semibold text-slate-300 whitespace-nowrap w-8" rowSpan={2}>No</th>
                    <th className="border border-slate-600 px-2 py-2 text-left font-semibold text-slate-300 whitespace-nowrap min-w-[140px]" rowSpan={2}>Category</th>
                    <th className="border border-slate-600 px-2 py-2 text-left font-semibold text-slate-300 whitespace-nowrap min-w-[220px]" rowSpan={2}>Description</th>
                    <th className="border border-slate-600 px-2 py-2 text-left font-semibold text-slate-300 whitespace-nowrap min-w-[140px]" rowSpan={2}>Model</th>
                    <th className="border border-slate-600 px-2 py-2 text-left font-semibold text-slate-300 whitespace-nowrap min-w-[120px]" rowSpan={2}>Plate No</th>
                    <th className="border border-slate-600 px-1.5 py-2 text-center font-semibold text-slate-300 whitespace-nowrap bg-blue-900/30" rowSpan={2}>Qty</th>
                    <th className="border border-slate-600 px-1.5 py-2 text-center font-semibold text-slate-300 whitespace-nowrap bg-blue-900/30" rowSpan={2}>Working Hr/Day</th>
                    <th className="border border-slate-600 px-1.5 py-2 text-center font-semibold text-slate-300 whitespace-nowrap bg-blue-900/30" rowSpan={2}>Working Days</th>
                    <th className="border border-slate-600 px-1.5 py-2 text-center font-semibold text-slate-300 whitespace-nowrap bg-blue-900/30" colSpan={3}>Plan %</th>
                    <th className="border border-slate-600 px-1.5 py-2 text-center font-semibold text-slate-300 whitespace-nowrap bg-slate-700" colSpan={3}>Hours</th>
                    <th className="border border-slate-600 px-1.5 py-2 text-center font-semibold text-slate-300 whitespace-nowrap bg-blue-900/30" rowSpan={2}>Rental Rate</th>
                    <th className="border border-slate-600 px-1.5 py-2 text-center font-semibold text-slate-300 whitespace-nowrap bg-slate-700" rowSpan={2}>Operational Amount</th>
                    <th className="border border-slate-600 px-1.5 py-2 text-center font-semibold text-slate-300 whitespace-nowrap bg-blue-900/30" colSpan={2}>Fuel Input</th>
                    <th className="border border-slate-600 px-1.5 py-2 text-center font-semibold text-slate-300 whitespace-nowrap bg-slate-700" colSpan={2}>Fuel Calculated</th>
                  </tr>
                  <tr className="bg-slate-800 border-b border-slate-700">
                    <th className="border border-slate-600 px-1 py-1 text-center text-slate-400 whitespace-nowrap bg-blue-900/30">Op</th>
                    <th className="border border-slate-600 px-1 py-1 text-center text-slate-400 whitespace-nowrap bg-blue-900/30">Idle</th>
                    <th className="border border-slate-600 px-1 py-1 text-center text-slate-400 whitespace-nowrap bg-blue-900/30">Down</th>
                    <th className="border border-slate-600 px-1 py-1 text-center text-slate-400 whitespace-nowrap bg-slate-700">Op</th>
                    <th className="border border-slate-600 px-1 py-1 text-center text-slate-400 whitespace-nowrap bg-slate-700">Idle</th>
                    <th className="border border-slate-600 px-1 py-1 text-center text-slate-400 whitespace-nowrap bg-slate-700">Down</th>
                    <th className="border border-slate-600 px-1 py-1 text-center text-slate-400 whitespace-nowrap bg-blue-900/30">Cons/Hr</th>
                    <th className="border border-slate-600 px-1 py-1 text-center text-slate-400 whitespace-nowrap bg-blue-900/30">Rate</th>
                    <th className="border border-slate-600 px-1 py-1 text-center text-slate-400 whitespace-nowrap bg-slate-700">Total</th>
                    <th className="border border-slate-600 px-1 py-1 text-center text-slate-400 whitespace-nowrap bg-slate-700">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={row.id} className="bg-white hover:bg-slate-50/40 transition-colors">
                      <td className="border border-slate-200 p-0 text-center text-[11px] text-slate-600 align-middle w-8 font-medium">
                        {index + 1}
                      </td>
                      <td className="border border-slate-200 px-2 py-1 text-[11px] text-slate-700 whitespace-nowrap bg-white">
                        {row.category || "—"}
                      </td>
                      <td className="border border-slate-200 px-2 py-1 text-[11px] text-slate-700">
                        {row.description || "—"}
                      </td>
                      <td className="border border-slate-200 px-2 py-1 text-[11px] text-slate-700 whitespace-nowrap">
                        {row.model || "—"}
                      </td>
                      <td className="border border-slate-200 px-2 py-1 text-[11px] text-slate-700 whitespace-nowrap">
                        {row.plateNo || "—"}
                      </td>
                      <td className="border border-slate-200 p-0 bg-blue-50/20">
                        <Input
                          className={userInput}
                          value={row.qty}
                          onChange={(e) => updateRow(row.id, "qty", e.target.value)}
                          onFocus={(e) => handleZeroFocus(row.id, "qty", e.target.value)}
                          placeholder="Enter qty"
                        />
                      </td>
                      <td className="border border-slate-200 p-0 bg-blue-50/20">
                        <Input
                          className={userInput}
                          value={row.workingHrDay}
                          onChange={(e) => updateRow(row.id, "workingHrDay", e.target.value)}
                          onFocus={(e) => handleZeroFocus(row.id, "workingHrDay", e.target.value)}
                          placeholder="Enter hrs/day"
                        />
                      </td>
                      <td className="border border-slate-200 p-0 bg-blue-50/20">
                        <Input
                          className={userInput}
                          value={row.workingDays}
                          onChange={(e) => updateRow(row.id, "workingDays", e.target.value)}
                          onFocus={(e) => handleZeroFocus(row.id, "workingDays", e.target.value)}
                          placeholder="Enter days"
                        />
                      </td>
                      <td className="border border-slate-200 p-0 bg-blue-50/20">
                        <Input
                          className={userInput}
                          value={row.opHrPlanPct}
                          onChange={(e) => updateRow(row.id, "opHrPlanPct", e.target.value)}
                          onFocus={(e) => handleZeroFocus(row.id, "opHrPlanPct", e.target.value)}
                          placeholder="Enter %"
                        />
                      </td>
                      <td className="border border-slate-200 p-0 bg-blue-50/20">
                        <Input
                          className={userInput}
                          value={row.idleHrPlanPct}
                          onChange={(e) => updateRow(row.id, "idleHrPlanPct", e.target.value)}
                          onFocus={(e) => handleZeroFocus(row.id, "idleHrPlanPct", e.target.value)}
                          placeholder="Enter %"
                        />
                      </td>
                      <td className="border border-slate-200 p-0 bg-blue-50/20">
                        <Input
                          className={userInput}
                          value={row.downHrPlanPct}
                          onChange={(e) => updateRow(row.id, "downHrPlanPct", e.target.value)}
                          onFocus={(e) => handleZeroFocus(row.id, "downHrPlanPct", e.target.value)}
                          placeholder="Enter %"
                        />
                      </td>
                      <td className="border border-slate-200 p-0 bg-slate-50">
                        <Input
                          className={readOnlyInput}
                          value={row.opHr}
                          readOnly
                          title="Auto-calculated from inputs: Total Hours × (Op Plan% / 100)"
                        />
                      </td>
                      <td className="border border-slate-200 p-0 bg-slate-50">
                        <Input
                          className={readOnlyInput}
                          value={row.idleHr}
                          readOnly
                          title="Auto-calculated from inputs: Total Hours × (Idle Plan% / 100)"
                        />
                      </td>
                      <td className="border border-slate-200 p-0 bg-slate-50">
                        <Input
                          className={readOnlyInput}
                          value={row.downHr}
                          readOnly
                          title="Auto-calculated from inputs: Total Hours × (Down Plan% / 100)"
                        />
                      </td>
                      <td className="border border-slate-200 p-0 bg-blue-50/20">
                        <Input
                          className={userInput}
                          value={row.rentalRate}
                          onChange={(e) => updateRow(row.id, "rentalRate", e.target.value)}
                          onFocus={(e) => handleZeroFocus(row.id, "rentalRate", e.target.value)}
                          placeholder="Enter rate"
                        />
                      </td>
                      <td className="border border-slate-200 p-0 bg-slate-50">
                        <Input
                          className={readOnlyInput}
                          value={row.operationalAmount}
                          readOnly
                          title="Auto-calculated: Op Hr × Rental Rate"
                        />
                      </td>
                      <td className="border border-slate-200 p-0 bg-blue-50/20">
                        <Input
                          className={userInput}
                          value={row.fuelConsHr}
                          onChange={(e) => updateRow(row.id, "fuelConsHr", e.target.value)}
                          onFocus={(e) => handleZeroFocus(row.id, "fuelConsHr", e.target.value)}
                          placeholder="Enter cons/hr"
                        />
                      </td>
                      <td className="border border-slate-200 p-0 bg-blue-50/20">
                        <Input
                          className={userInput}
                          value={row.fuelRate}
                          onChange={(e) => updateRow(row.id, "fuelRate", e.target.value)}
                          onFocus={(e) => handleZeroFocus(row.id, "fuelRate", e.target.value)}
                          placeholder="Enter rate"
                        />
                      </td>
                      <td className="border border-slate-200 p-0 bg-slate-50">
                        <Input
                          className={readOnlyInput}
                          value={row.totalFuel}
                          readOnly
                          title="Auto-calculated: Op Hr × Fuel Cons/Hr"
                        />
                      </td>
                      <td className="border border-slate-200 p-0 bg-slate-50">
                        <Input
                          className={readOnlyInput}
                          value={row.fuelInAmt}
                          readOnly
                          title="Auto-calculated: Total Fuel × Fuel Rate"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer: Prepared by, Checked by, Approved by - fixed at bottom */}
          <div className="shrink-0 mt-3 w-full min-w-0 pt-3 border-t-2 border-slate-300 overflow-hidden">
            <div className="w-full min-w-0 max-w-full overflow-hidden">
              <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] gap-3 min-w-0">
                <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                  <Label className="text-xs font-semibold text-slate-700 whitespace-nowrap shrink-0">
                    Prepared by
                  </Label>
                  <Select
                    value={preparedBy || "__none__"}
                    onValueChange={(v) => setPreparedBy(v === "__none__" ? "" : v)}
                    className="flex-1 min-w-0 max-w-[60%] [&_button]:h-8 [&_button]:text-xs [&_button]:rounded-lg [&_button]:border-slate-300 [&_button]:w-full [&_button]:min-w-0 [&_button]:max-w-full"
                  >
                    <SelectItem value="__none__">Select...</SelectItem>
                    <SelectItem value="u1">User 1</SelectItem>
                    <SelectItem value="u2">User 2</SelectItem>
                  </Select>
                </div>
                <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                  <Label className="text-xs font-semibold text-slate-700 whitespace-nowrap shrink-0">
                    Checked by
                  </Label>
                  <Select
                    value={checkedBy || "__none__"}
                    onValueChange={(v) => setCheckedBy(v === "__none__" ? "" : v)}
                    className="flex-1 min-w-0 max-w-[60%] [&_button]:h-8 [&_button]:text-xs [&_button]:rounded-lg [&_button]:border-slate-300 [&_button]:w-full [&_button]:min-w-0 [&_button]:max-w-full"
                  >
                    <SelectItem value="__none__">Select...</SelectItem>
                    <SelectItem value="c1">Checker 1</SelectItem>
                  </Select>
                </div>
                <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                  <Label className="text-xs font-semibold text-slate-700 whitespace-nowrap shrink-0">
                    Approved by
                  </Label>
                  <Select
                    value={approvedBy || "__none__"}
                    onValueChange={(v) => setApprovedBy(v === "__none__" ? "" : v)}
                    className="flex-1 min-w-0 max-w-[60%] [&_button]:h-8 [&_button]:text-xs [&_button]:rounded-lg [&_button]:border-slate-300 [&_button]:w-full [&_button]:min-w-0 [&_button]:max-w-full"
                  >
                    <SelectItem value="__none__">Select...</SelectItem>
                    <SelectItem value="a1">Approver 1</SelectItem>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}