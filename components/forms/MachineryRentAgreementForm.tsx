"use client";

import { useState, useRef, useEffect, useContext, useMemo } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectItem } from "@/components/ui/select";
import { SearchableCombobox } from "@/components/ui/searchable-combobox";
import {
  Building2,
  Banknote,
  Upload,
  X,
  Eye,
  FileSignature,
} from "lucide-react";
import { FormModalHeaderActionsContext } from "@/components/FormModal";
import { EQUIPMENT_CATEGORIES } from "@/types/asset";
import type { AssetFacets } from "@/types/asset";
import { fetchAssetFacets } from "@/lib/api/assets";
import { getSession } from "@/lib/auth";

const CATEGORY_SELECT_OPTIONS = EQUIPMENT_CATEGORIES.map((c) => ({
  value: c.dbCategory,
  label: c.name,
}));

function defaultContractToDate(fromIso: string): string {
  const d = new Date(fromIso + "T12:00:00");
  if (Number.isNaN(d.getTime())) return "";
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().split("T")[0];
}

/** Arabic order prefix for column 1 fields (1–11). */
function num(n: number): string {
  return `${n}.`;
}

/** Same header block as EquipmentUtilizationForm preview (grid + logo + title + document no). */
function UtilizationStyleHeader({ subtitle }: { subtitle: string }) {
  return (
    <div className="grid grid-cols-[70px_1fr_120px] border-b-2 border-slate-800 mb-4">
      <div className="relative h-14 flex items-center justify-center border-r-2 border-slate-800 pr-2">
        <Image src="/ecwc png logo.png" alt="ECWC Logo" width={56} height={56} className="object-contain" />
      </div>
      <div className="flex flex-col justify-center px-4 text-center border-r-2 border-slate-800">
        <p className="text-sm font-bold text-slate-900">ETHIOPIAN CONSTRUCTION WORKS CORPORATION</p>
        <p className="text-xs font-semibold text-slate-700 mt-0.5">{subtitle}</p>
      </div>
      <div className="flex flex-col justify-center px-3 text-[10px] text-slate-700 font-medium">
        <p>
          <b>Document No.</b>
        </p>
        <p>OF/ECWC/xxx</p>
      </div>
    </div>
  );
}

export default function MachineryRentAgreementForm() {
  const pdfRef = useRef<HTMLDivElement>(null);
  const agreementPdfInputRef = useRef<HTMLInputElement>(null);
  const setHeaderActions = useContext(FormModalHeaderActionsContext);

  const [header, setHeader] = useState(() => {
    const from = new Date().toISOString().split("T")[0];
    return {
      owner: "",
      tinNo: "",
      address: "",
      category: "",
      description: "",
      rentedForProject: "",
      makeModel: "",
      plateNo: "",
      kmHrReading: "",
      fuelFilled: "",
      capacity: "",
      remark: "",
      contractStatus: "Active",
      minHourPerDay: "",
      contractFromDate: from,
      contractToDate: defaultContractToDate(from),
    };
  });

  const [agreedRates, setAgreedRates] = useState({
    operationalRate: "",
    idleRate: "",
    downRate: "",
  });

  const [refGenerated, setRefGenerated] = useState("");
  const [facets, setFacets] = useState<AssetFacets | null>(null);
  const [allFacets, setAllFacets] = useState<AssetFacets | null>(null);
  const [facetsLoading, setFacetsLoading] = useState(false);
  const [allFacetsLoading, setAllFacetsLoading] = useState(false);

  /** Today’s date only (auto when the form is opened; not agreement dates). */
  const [formDateAuto] = useState(() => new Date().toISOString().split("T")[0]);
  const [preparedByName, setPreparedByName] = useState("");
  const [agreementPdfFile, setAgreementPdfFile] = useState<File | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [pdfDownloading, setPdfDownloading] = useState(false);

  useEffect(() => {
    const s = getSession();
    setPreparedByName(s?.user?.name?.trim() || "");
  }, []);

  useEffect(() => {
    if (!setHeaderActions) return;
    setHeaderActions(
      <button
        type="button"
        onClick={() => setPreviewOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
        aria-label="Preview agreement"
      >
        <Eye className="h-4 w-4" /> Preview
      </button>
    );
    return () => setHeaderActions(null);
  }, [setHeaderActions]);

  useEffect(() => {
    const y = new Date().getFullYear();
    const n = Math.floor(100000 + Math.random() * 900000);
    setRefGenerated(`OF/ECWC/MRA/${y}/${String(n)}`);
  }, []);

  useEffect(() => {
    setAllFacetsLoading(true);
    fetchAssetFacets({})
      .then(setAllFacets)
      .catch(() => setAllFacets(null))
      .finally(() => setAllFacetsLoading(false));
  }, []);

  useEffect(() => {
    if (!header.category.trim()) {
      setFacets(null);
      return;
    }
    setFacetsLoading(true);
    fetchAssetFacets({ category: [header.category], ownership: ["Rental"] })
      .then(setFacets)
      .catch(() => setFacets(null))
      .finally(() => setFacetsLoading(false));
  }, [header.category]);

  const descriptionOptions = useMemo(() => {
    const list = [...new Set(facets?.description ?? [])].filter(Boolean).sort();
    if (header.description && !list.includes(header.description)) {
      return [header.description, ...list];
    }
    return list;
  }, [facets?.description, header.description]);

  const projectLocationOptions = useMemo(() => {
    return [...new Set(allFacets?.project_name ?? [])].filter(Boolean).sort() as string[];
  }, [allFacets?.project_name]);

  useEffect(() => {
    if (!header.category.trim()) return;
    const list = facets?.description ?? [];
    if (list.length > 0 && header.description && !list.includes(header.description)) {
      setHeader((h) => ({ ...h, description: "" }));
    }
  }, [header.category, facets?.description, header.description]);

  const handleDownloadPdf = async () => {
    setPdfDownloading(true);
    try {
      const root = document.getElementById("machinery-rent-preview-print");
      if (!root) throw new Error("Preview not ready");
      const pages = Array.from(root.querySelectorAll<HTMLElement>(".a4-page"));
      if (!pages.length) throw new Error("No pages to export");

      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas"), import("jspdf")]);

      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
      const pageW = 210;
      const pageH = 297;

      for (let i = 0; i < pages.length; i++) {
        const el = pages[i];
        const canvas = await html2canvas(el, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
        });
        const imgData = canvas.toDataURL("image/png");
        if (i > 0) doc.addPage();
        doc.addImage(imgData, "PNG", 0, 0, pageW, pageH);
      }

      const date = (formDateAuto || new Date().toISOString().slice(0, 10)).replaceAll("/", "-");
      doc.save(`machinery-rent-agreement-${date}.pdf`);
    } catch (e) {
      console.error(e);
      window.alert("Failed to download PDF. Please try again.");
    } finally {
      setPdfDownloading(false);
    }
  };

  const handleSubmitAgreement = () => {
    if (!header.owner.trim()) {
      window.alert("Please enter owner name before submitting.");
      return;
    }
    if (!header.rentedForProject.trim()) {
      window.alert("Please select rented project / location before submitting.");
      return;
    }
    setPreviewOpen(true);
  };

  const fi =
    "h-8 min-w-0 rounded-md border-2 border-slate-600 bg-white px-2 text-xs font-semibold text-slate-900 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-600";
  /** Native date inputs need min width + room for picker icon; avoid min-w-0 shrink. */
  const fiContractDate =
    `${fi} h-9 min-h-9 min-w-[13rem] w-full max-w-full px-2.5 py-1 text-sm tabular-nums [color-scheme:light] [&::-webkit-datetime-edit]:p-0 [&::-webkit-datetime-edit-fields-wrapper]:pr-1 [&::-webkit-calendar-picker-indicator]:ml-0.5 [&::-webkit-calendar-picker-indicator]:h-[1.125rem] [&::-webkit-calendar-picker-indicator]:w-[1.125rem] [&::-webkit-calendar-picker-indicator]:shrink-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer`;
  /** Party column: field grows; label has fixed width on sm+ so rows align. */
  const fiParty = `${fi} w-full min-w-0 flex-1`;
  const sel =
    "[&_button]:h-8 [&_button]:text-[11px] [&_button]:font-semibold [&_button]:px-2 [&_button]:rounded-md [&_button]:w-full [&_button]:border-2 [&_button]:border-slate-600";
  const comboWrap =
    "rounded-md border-2 border-slate-600 bg-white text-xs shadow-sm focus-within:ring-2 focus-within:ring-emerald-500/40 [&_input]:border-0 [&_input]:shadow-none [&_input]:ring-0 [&_input]:focus-visible:ring-0";
  const partyLbl =
    "flex min-w-0 shrink-0 flex-nowrap items-baseline gap-2 text-sm font-extrabold leading-snug text-slate-950 sm:w-44 sm:min-w-[11rem]";
  const partyLblTop = `${partyLbl} sm:pt-1`;
  const partyNumCls = "font-black tabular-nums text-emerald-800";
  const secTitle =
    "flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-emerald-900 mb-2 pb-1.5 border-b-2 border-emerald-400/90";
  const lbl2 =
    "min-w-0 shrink-0 text-sm font-extrabold text-slate-950 leading-snug";

  const onAgreementPdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== "application/pdf") {
      e.target.value = "";
      return;
    }
    setAgreementPdfFile(f);
  };

  const clearAgreementPdf = () => {
    setAgreementPdfFile(null);
    if (agreementPdfInputRef.current) agreementPdfInputRef.current.value = "";
  };

  return (
    <div
      id="form-print-area"
      className="flex flex-1 min-h-0 w-full min-w-0 flex-col overflow-y-auto overscroll-contain bg-gradient-to-br from-slate-100 via-emerald-50/40 to-slate-100 print:min-h-0 print:flex-none print:overflow-visible print:bg-white"
    >
      <div ref={pdfRef} className="w-full min-w-0 max-w-none mx-0 px-0 py-0 print:p-0 print:max-w-[210mm]">
        <Card className="overflow-visible border-x-0 border-t-0 border-b border-emerald-200/60 sm:border-x sm:rounded-none shadow-md shadow-emerald-950/5 ring-0 ring-transparent bg-white print:shadow-none print:border print:border-slate-900 print:rounded-none">
          <CardContent className="px-3 py-2.5 sm:px-4 sm:py-3 print:p-5 text-[13px]">
            {/* Document header — identical structure to EquipmentUtilizationForm */}
            <UtilizationStyleHeader subtitle="RENTED MACHINERIES AGREEMENT" />

            <div className="flex flex-wrap justify-between gap-x-3 gap-y-1 text-xs text-slate-700 mb-4 pb-2 border-b border-slate-100">
              <span>
                <span className="font-bold text-slate-900">Project:</span>{" "}
                {header.rentedForProject || "—"}
              </span>
              <span title="Today’s date (automatic when this form is opened)">
                <span className="font-bold text-slate-900">Form date (auto):</span> {formDateAuto}
              </span>
              <span>
                <span className="font-bold text-slate-900">Ref:</span> {refGenerated || "—"}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
              {/* Column 1 — Owner & equipment */}
              <div className="space-y-2 min-w-0">
                <p className={secTitle}>
                  <Building2 className="h-3 w-3 text-emerald-700 shrink-0" />
                  Party &amp; equipment
                </p>
                <div className="space-y-3 min-w-0">
                  <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
                    <Label className={partyLbl} htmlFor="mra-owner">
                      <span className={partyNumCls}>{num(1)}</span>
                      <span>Owner name</span>
                    </Label>
                    <Input
                      id="mra-owner"
                      className={fiParty}
                      value={header.owner}
                      onChange={(e) => setHeader((p) => ({ ...p, owner: e.target.value }))}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
                    <Label className={partyLbl} htmlFor="mra-tin">
                      <span className={partyNumCls}>{num(2)}</span>
                      <span>TIN No</span>
                    </Label>
                    <Input
                      id="mra-tin"
                      className={fiParty}
                      value={header.tinNo}
                      onChange={(e) => setHeader((p) => ({ ...p, tinNo: e.target.value }))}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
                    <div className={partyLbl}>
                      <span className={partyNumCls}>{num(3)}</span>
                      <span>Category</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <Select
                        value={header.category || "__none__"}
                        onValueChange={(v) =>
                          setHeader((p) => ({ ...p, category: v === "__none__" ? "" : v }))
                        }
                        className={sel}
                      >
                        <SelectItem value="__none__">—</SelectItem>
                        {CATEGORY_SELECT_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </Select>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:gap-3">
                    <div className={partyLblTop}>
                      <span className={partyNumCls}>{num(4)}</span>
                      <span>Description</span>
                    </div>
                    <div className={`min-w-0 flex-1 ${comboWrap}`}>
                      {descriptionOptions.length === 0 && !facetsLoading ? (
                        <Input
                          id="mra-desc-fallback"
                          className={`${fi} w-full border-0 shadow-none focus-visible:ring-0`}
                          value={header.description}
                          onChange={(e) => setHeader((p) => ({ ...p, description: e.target.value }))}
                          placeholder={
                            header.category
                              ? "No Rental assets in DB for this category — type to add"
                              : "Select category first"
                          }
                        />
                      ) : (
                        <div className="px-0.5 py-0.5">
                          <SearchableCombobox
                            id="machinery-rent-desc"
                            value={header.description}
                            onChange={(v) => setHeader((p) => ({ ...p, description: v }))}
                            options={descriptionOptions}
                            placeholder="Rental equipment descriptions (database)"
                            loading={facetsLoading}
                            allowEmpty
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
                    <Label className={partyLbl} htmlFor="machinery-rent-project">
                      <span className={partyNumCls}>{num(5)}</span>
                      <span>Rented project</span>
                    </Label>
                    <div className={`min-w-0 flex-1 ${comboWrap} px-0.5 py-0.5`}>
                      <SearchableCombobox
                        id="machinery-rent-project"
                        value={header.rentedForProject}
                        onChange={(v) => setHeader((p) => ({ ...p, rentedForProject: v }))}
                        options={projectLocationOptions}
                        placeholder="Search project / location"
                        loading={allFacetsLoading}
                        allowEmpty
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
                    <Label className={partyLbl} htmlFor="mra-makemodel">
                      <span className={partyNumCls}>{num(6)}</span>
                      <span>Make / Model</span>
                    </Label>
                    <Input
                      id="mra-makemodel"
                      className={fiParty}
                      value={header.makeModel}
                      onChange={(e) => setHeader((p) => ({ ...p, makeModel: e.target.value }))}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
                    <Label className={partyLbl} htmlFor="mra-plate">
                      <span className={partyNumCls}>{num(7)}</span>
                      <span>Plate No</span>
                    </Label>
                    <Input
                      id="mra-plate"
                      className={fiParty}
                      value={header.plateNo}
                      onChange={(e) => setHeader((p) => ({ ...p, plateNo: e.target.value }))}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
                    <Label className={partyLbl} htmlFor="mra-kmhr">
                      <span className={partyNumCls}>{num(8)}</span>
                      <span>Km/Hr reading</span>
                    </Label>
                    <Input
                      id="mra-kmhr"
                      className={fiParty}
                      value={header.kmHrReading}
                      onChange={(e) => setHeader((p) => ({ ...p, kmHrReading: e.target.value }))}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
                    <Label className={partyLbl} htmlFor="mra-fuel">
                      <span className={partyNumCls}>{num(9)}</span>
                      <span>Fuel (L)</span>
                    </Label>
                    <Input
                      id="mra-fuel"
                      className={fiParty}
                      value={header.fuelFilled}
                      onChange={(e) => setHeader((p) => ({ ...p, fuelFilled: e.target.value }))}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
                    <Label className={partyLbl} htmlFor="mra-capacity">
                      <span className={partyNumCls}>{num(10)}</span>
                      <span>Capacity (M³)</span>
                    </Label>
                    <Input
                      id="mra-capacity"
                      className={fiParty}
                      value={header.capacity}
                      onChange={(e) => setHeader((p) => ({ ...p, capacity: e.target.value }))}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:gap-3">
                    <Label className={partyLblTop} htmlFor="mra-address">
                      <span className={partyNumCls}>{num(11)}</span>
                      <span>Address</span>
                    </Label>
                    <textarea
                      id="mra-address"
                      className={`${fiParty} min-h-[48px] py-1.5 resize-y`}
                      value={header.address}
                      onChange={(e) => setHeader((p) => ({ ...p, address: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* Column 2 — Contract, reference, rates (title + fields together) */}
              <div className="space-y-4 min-w-0 lg:border-l lg:border-emerald-100 lg:pl-6">
                <div>
                  <p className={secTitle}>
                    <FileSignature className="h-3 w-3 text-emerald-700 shrink-0" />
                    Contract &amp; reference
                  </p>
                  <div className="space-y-2">
                    <div className="space-y-2">
                      <Label className={lbl2}>Agreement duration</Label>
                      <div className="grid w-full max-w-[min(100%,20rem)] gap-2 overflow-x-auto">
                        <div className="grid min-w-0 grid-cols-[2.5rem_minmax(0,1fr)] items-center gap-2">
                          <span className="text-xs font-bold text-slate-600">From</span>
                          <Input
                            type="date"
                            className={fiContractDate}
                            value={header.contractFromDate}
                            onChange={(e) => {
                              const v = e.target.value;
                              setHeader((p) => ({
                                ...p,
                                contractFromDate: v,
                                contractToDate:
                                  p.contractToDate && v && p.contractToDate < v ? v : p.contractToDate,
                              }));
                            }}
                          />
                        </div>
                        <div className="grid min-w-0 grid-cols-[2.5rem_minmax(0,1fr)] items-center gap-2">
                          <span className="text-xs font-bold text-slate-600">To</span>
                          <Input
                            type="date"
                            className={fiContractDate}
                            value={header.contractToDate}
                            min={header.contractFromDate || undefined}
                            onChange={(e) => setHeader((p) => ({ ...p, contractToDate: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>
                    {/* Same control width as From/To date inputs (12rem ≈ 1fr in the 15rem-wide From/To grid). */}
                    <div className="grid grid-cols-2 items-center gap-2 gap-y-3 sm:gap-4">
                      <div className="flex min-w-0 items-center gap-2">
                        <Label className={`${lbl2} shrink-0`}>Status</Label>
                        <div className="min-w-0 w-full max-w-[min(100%,12rem)]">
                          <Select
                            value={header.contractStatus}
                            onValueChange={(v) => setHeader((p) => ({ ...p, contractStatus: v }))}
                            className={sel}
                          >
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Inactive">Inactive</SelectItem>
                            <SelectItem value="Suspended">Suspended</SelectItem>
                          </Select>
                        </div>
                      </div>
                      <div className="flex min-w-0 items-center gap-2">
                        <Label className={`${lbl2} shrink-0`}>Min hr/day</Label>
                        <div className="min-w-0 w-full max-w-[min(100%,12rem)]">
                          <Input
                            type="number"
                            className={`${fi} w-full min-w-0`}
                            value={header.minHourPerDay}
                            onChange={(e) => setHeader((p) => ({ ...p, minHourPerDay: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <Label className="shrink-0 text-sm font-extrabold text-slate-950 whitespace-nowrap">
                        Agreement scan (PDF)
                      </Label>
                      <input
                        ref={agreementPdfInputRef}
                        type="file"
                        accept="application/pdf,.pdf"
                        className="hidden"
                        onChange={onAgreementPdfChange}
                      />
                      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 shrink-0 text-xs font-semibold gap-1.5 border-emerald-200"
                          onClick={() => agreementPdfInputRef.current?.click()}
                        >
                          <Upload className="h-3.5 w-3.5" />
                          Choose PDF
                        </Button>
                        {agreementPdfFile && (
                          <>
                            <span
                              className="min-w-0 flex-1 text-xs font-semibold text-slate-800 truncate"
                              title={agreementPdfFile.name}
                            >
                              {agreementPdfFile.name}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 shrink-0 px-1.5"
                              onClick={clearAgreementPdf}
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <p className={secTitle}>
                    <Banknote className="h-3 w-3 text-emerald-700 shrink-0" />
                    Agreed rates
                  </p>
                  <div className="space-y-2 rounded-lg border-2 border-emerald-300/90 bg-gradient-to-br from-emerald-50/90 via-white to-emerald-50/40 p-3 shadow-sm ring-1 ring-emerald-100">
                    <p className="text-center text-[10px] font-extrabold uppercase tracking-wider text-emerald-900">
                      Rates in Ethiopian Birr (ETB)
                    </p>
                    <div className="space-y-2">
                      {(
                        [
                          ["Operational / hr", "operationalRate", agreedRates.operationalRate] as const,
                          ["Idle / hr", "idleRate", agreedRates.idleRate] as const,
                          ["Down / hr", "downRate", agreedRates.downRate] as const,
                        ]
                      ).map(([label, key, val], i) => (
                        <div key={key}>
                          {i > 0 ? <div className="mb-2 h-px bg-emerald-200/80" /> : null}
                          <div className="flex flex-col gap-2 sm:grid sm:grid-cols-[10.5rem_minmax(0,1fr)_auto] sm:items-center sm:gap-3">
                            <Label className="text-sm font-extrabold text-slate-950 sm:min-h-[2rem] sm:self-center sm:leading-snug">
                              {label}
                            </Label>
                            <div className="flex min-w-0 items-center gap-2 sm:contents">
                              <Input
                                type="number"
                                step="0.01"
                                className={`${fi} min-w-0 w-full`}
                                value={val}
                                onChange={(e) =>
                                  setAgreedRates((p) => ({ ...p, [key]: e.target.value }))
                                }
                                placeholder="0.00"
                              />
                              <span className="inline-flex h-8 shrink-0 items-center justify-center rounded-md bg-emerald-800 px-3 text-xs font-bold text-white min-w-[3.5rem]">
                                Birr
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2 pt-1">
                  <Label className={`${lbl2} pt-2`}>Remark</Label>
                  <textarea
                    className={`${fi} min-h-[60px] flex-1 py-1.5 resize-y`}
                    value={header.remark}
                    onChange={(e) => setHeader((p) => ({ ...p, remark: e.target.value }))}
                    placeholder="Notes or conditions"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex w-full min-w-0 flex-col gap-3 border-t-2 border-emerald-200/80 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className="text-sm font-extrabold text-slate-950">Prepared by</span>
                <span
                  className="min-w-0 truncate text-sm font-semibold text-slate-800"
                  title={preparedByName || undefined}
                >
                  {preparedByName || "—"}
                </span>
              </div>
              <Button
                type="button"
                onClick={handleSubmitAgreement}
                className="h-9 w-full shrink-0 bg-[#137638] px-5 text-white hover:bg-[#0f6430] sm:w-auto"
              >
                Submit agreement
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview — same shell as EquipmentUtilizationForm (emerald bar + Download PDF) */}
      {previewOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center overflow-x-hidden overflow-y-auto p-2 bg-slate-950/65 backdrop-blur-md print:hidden"
          role="dialog"
          aria-modal="true"
        >
          <Card
            className="flex min-h-0 w-full min-w-0 max-w-full flex-col overflow-hidden rounded-2xl border border-emerald-200/80 bg-white shadow-2xl ring-1 ring-emerald-100 sm:max-h-[98vh]"
            style={{ maxWidth: "min(210mm, calc(100vw - 1rem))" }}
          >
            <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-3 border-b border-emerald-300 bg-gradient-to-r from-[#137638] via-emerald-700 to-[#137638]">
              <div className="flex min-w-0 items-center gap-2">
                <span className="inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-200" />
                <span className="truncate text-sm font-semibold text-white tracking-wide">
                  Preview — A4 portrait
                </span>
              </div>
              <div className="flex items-center gap-2 no-print">
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={handleDownloadPdf}
                  disabled={pdfDownloading}
                  className="h-8 bg-white/15 border border-white/40 hover:bg-white/25 text-white backdrop-blur-sm disabled:opacity-60"
                >
                  {pdfDownloading ? "Generating..." : "Download PDF"}
                </Button>
                <button
                  type="button"
                  onClick={() => setPreviewOpen(false)}
                  className="p-2 rounded-lg text-white/85 hover:bg-white/20 hover:text-white transition-colors"
                  aria-label="Close preview"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <CardContent
              id="machinery-rent-preview-print"
              className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto bg-white p-0"
            >
              <style jsx global>{`
                @media print {
                  @page {
                    size: A4 portrait;
                    margin: 10mm;
                  }
                  .no-print {
                    display: none !important;
                  }
                  body * {
                    visibility: hidden !important;
                  }
                  #machinery-rent-preview-print,
                  #machinery-rent-preview-print * {
                    visibility: visible !important;
                  }
                  #machinery-rent-preview-print {
                    position: absolute !important;
                    left: 0 !important;
                    top: 0 !important;
                    width: 210mm !important;
                    padding: 0 !important;
                    margin: 0 !important;
                    overflow: visible !important;
                    background: white !important;
                  }
                  .a4-page {
                    width: 210mm !important;
                    max-width: 210mm !important;
                    min-height: 297mm !important;
                    box-shadow: none !important;
                    margin: 0 auto !important;
                  }
                }
              `}</style>
              <div
                className="a4-page box-border mx-auto w-full max-w-full min-w-0 bg-white shadow-inner print:shadow-none"
                style={{
                  width: "100%",
                  maxWidth: "210mm",
                  minHeight: "297mm",
                  padding: "8mm 10mm",
                  boxSizing: "border-box",
                }}
              >
                <div className="mb-3 max-w-full overflow-hidden text-slate-900">
                  <UtilizationStyleHeader subtitle="RENTED MACHINERIES AGREEMENT" />
                </div>

                <div className="mb-3 space-y-1.5 border-l-4 border-emerald-700 bg-slate-50/90 px-3 py-2 font-sans text-[9px] leading-snug text-slate-800 shadow-sm">
                  <div className="flex justify-between gap-3 border-b border-slate-200/90 pb-1">
                    <span className="font-serif text-[10px] font-bold text-emerald-950">Project</span>
                    <span className="max-w-[65%] text-right text-[9px] font-semibold text-slate-800">
                      {header.rentedForProject || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3 border-b border-slate-200/90 pb-1">
                    <span className="font-serif text-[10px] font-bold text-emerald-950">Form date (auto)</span>
                    <span className="font-mono text-[9px] font-semibold text-slate-700">{formDateAuto}</span>
                  </div>
                  <div className="flex justify-between gap-3 border-b border-slate-200/90 pb-1">
                    <span className="font-serif text-[10px] font-bold text-emerald-950">Agreement duration</span>
                    <span className="text-right text-[9px] font-medium text-slate-800">
                      {header.contractFromDate || "—"} → {header.contractToDate || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="font-serif text-[10px] font-bold text-emerald-950">Reference</span>
                    <span className="max-w-[65%] break-all text-right text-[8px] font-medium text-slate-700">
                      {refGenerated || "—"}
                    </span>
                  </div>
                </div>

                <section className="mb-3">
                  <h3 className="mb-1.5 border-b-2 border-emerald-700/80 font-serif text-[10px] font-bold uppercase tracking-wide text-emerald-950">
                    Party &amp; equipment
                  </h3>
                  <dl className="space-y-1 text-[9px] leading-snug">
                    {(
                      [
                        [1, "Owner", header.owner],
                        [2, "TIN No", header.tinNo],
                        [3, "Category", header.category],
                        [4, "Description", header.description],
                        [5, "Rented project", header.rentedForProject],
                        [6, "Make / Model", header.makeModel],
                        [7, "Plate No", header.plateNo],
                        [8, "Km/Hr reading", header.kmHrReading],
                        [9, "Fuel (L)", header.fuelFilled],
                        [10, "Capacity (M³)", header.capacity],
                        [11, "Address", header.address],
                      ] as const
                    ).map(([n, label, val]) => (
                      <div key={label} className="flex gap-2 border-b border-dotted border-slate-200/90 pb-1 last:border-0">
                        <dt className="w-5 shrink-0 font-black tabular-nums text-emerald-800">{num(n)}</dt>
                        <dd className="min-w-0 flex-1">
                          <span className="font-bold text-slate-900">{label}:</span>{" "}
                          <span className="text-slate-800">{val || "—"}</span>
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>

                <section className="mb-3 rounded-md bg-emerald-50/40 px-2 py-2 font-sans text-[9px] text-slate-800 ring-1 ring-emerald-200/80">
                  <h3 className="mb-1.5 font-serif text-[10px] font-bold uppercase tracking-wide text-emerald-950">
                    Contract &amp; reference
                  </h3>
                  <p className="mb-1 leading-relaxed">
                    <span className="font-bold text-slate-900">Agreement duration:</span>{" "}
                    {header.contractFromDate || "—"} → {header.contractToDate || "—"}
                  </p>
                  <p className="mb-1">
                    <span className="font-bold text-slate-900">Status:</span> {header.contractStatus || "—"}
                  </p>
                  <p className="mb-1">
                    <span className="font-bold text-slate-900">Min hr/day:</span> {header.minHourPerDay || "—"}
                  </p>
                  <p className="break-all leading-relaxed">
                    <span className="font-bold text-slate-900">Agreement scan:</span>{" "}
                    {agreementPdfFile ? agreementPdfFile.name : "—"}
                  </p>
                </section>

                <section className="mb-2">
                  <h3 className="mb-1 font-serif text-[10px] font-bold uppercase tracking-wide text-emerald-950">
                    Agreed rates (ETB)
                  </h3>
                  <div className="inline-block max-w-full overflow-x-auto">
                    <table className="w-auto min-w-[12rem] border-collapse border border-slate-700 text-[9px] shadow-sm">
                      <thead>
                        <tr className="bg-emerald-900 text-white">
                          <th className="border border-emerald-950 px-2 py-1 text-left font-serif font-bold">Rate type</th>
                          <th className="border border-emerald-950 px-2 py-1 text-right font-serif font-bold">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        <tr>
                          <td className="border border-slate-600 px-2 py-1 font-semibold text-slate-900">
                            Operational / hr
                          </td>
                          <td className="border border-slate-600 px-2 py-1 text-right font-mono text-slate-800">
                            {agreedRates.operationalRate || "0.00"} Birr
                          </td>
                        </tr>
                        <tr className="bg-slate-50/80">
                          <td className="border border-slate-600 px-2 py-1 font-semibold text-slate-900">Idle / hr</td>
                          <td className="border border-slate-600 px-2 py-1 text-right font-mono text-slate-800">
                            {agreedRates.idleRate || "0.00"} Birr
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-slate-600 px-2 py-1 font-semibold text-slate-900">Down / hr</td>
                          <td className="border border-slate-600 px-2 py-1 text-right font-mono text-slate-800">
                            {agreedRates.downRate || "0.00"} Birr
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-2 border-l-2 border-amber-400/90 pl-2 text-[9px] italic leading-relaxed text-slate-800">
                    <span className="font-bold not-italic text-slate-900">Remark:</span> {header.remark || "—"}
                  </p>
                </section>

                <div className="mt-2 flex flex-col gap-1 border-t-2 border-slate-700 pt-2 font-sans text-[9px] text-slate-900">
                  <span className="font-bold">Prepared by: {preparedByName || "—"}</span>
                  <span className="break-all text-[8px] font-medium text-slate-600">
                    Attachment: {agreementPdfFile ? agreementPdfFile.name : "—"}
                  </span>
                </div>
                <p className="mt-2 text-center font-serif text-[7px] text-slate-500">
                  Machinery and Service Vehicles Rent Agreement — ECWC
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
