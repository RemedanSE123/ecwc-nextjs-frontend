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
  User,
  Hash,
  MapPin,
  Wrench,
  Gauge,
  Fuel,
  Box,
  Calendar as CalendarIcon,
  Clock,
  AlertCircle,
  CheckCircle,
  FileText,
  Printer,
  Download,
  Settings,
  Shield,
  Award,
  Briefcase,
  Truck,
  Fuel as FuelIcon,
  Ruler,
  Phone,
  Mail,
  Globe,
  Star,
  TrendingUp,
  Users,
  Package,
  ClipboardList,
} from "lucide-react";
import { FormModalHeaderActionsContext } from "@/components/FormModal";
import { EQUIPMENT_CATEGORIES } from "@/types/asset";
import type { AssetFacets } from "@/types/asset";
import { fetchAssetFacets, fetchAssets } from "@/lib/api/assets";
import { getSession } from "@/lib/auth";
import { createRentalAgreement, uploadAgreementPdf } from "@/lib/api/machinery-operations";

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

/** Section Header Component */
function SectionHeader({ icon: Icon, title, description }: { icon: any; title: string; description?: string }) {
  return (
    <div className="flex items-center gap-2 mb-4 pb-1.5 border-b-2 border-emerald-500">
      <div className="p-1.5 bg-emerald-50 rounded-lg">
        <Icon className="h-4 w-4 text-emerald-700" />
      </div>
      <div>
        <h2 className="text-sm font-bold text-gray-800">{title}</h2>
        {description && <p className="text-[10px] text-gray-500">{description}</p>}
      </div>
    </div>
  );
}

/** Form Field Component */
function FormField({ 
  number, 
  label, 
  required, 
  children,
  description 
}: { 
  number?: number; 
  label: string; 
  required?: boolean; 
  children: React.ReactNode;
  description?: string;
}) {
  return (
    <div className="group">
      <div className="flex flex-col sm:flex-row sm:items-start gap-2">
        {number && (
          <div className="w-7 shrink-0">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
              {number}
            </span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <Label className="block text-xs font-semibold text-gray-700 mb-1.5">
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </Label>
          {children}
          {description && <p className="text-[10px] text-gray-400 mt-1">{description}</p>}
        </div>
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
      minHourPerDay: "8",
      contractFromDate: from,
      contractToDate: defaultContractToDate(from),
    };
  });

  const [agreedRates, setAgreedRates] = useState({
    operationalRate: "",
    idleRate: "",
    downRate: "0",
  });

  const [refGenerated, setRefGenerated] = useState("");
  const [facets, setFacets] = useState<AssetFacets | null>(null);
  const [allFacets, setAllFacets] = useState<AssetFacets | null>(null);
  const [rentalAssets, setRentalAssets] = useState<Array<{ id: string; description: string; project_name: string; category: string }>>([]);
  const [facetsLoading, setFacetsLoading] = useState(false);
  const [allFacetsLoading, setAllFacetsLoading] = useState(false);

  /** Today's date only (auto when the form is opened; not agreement dates). */
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
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all shadow-sm"
      >
        <Eye className="h-4 w-4" /> Preview Agreement
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

  useEffect(() => {
    if (!header.category.trim()) {
      setRentalAssets([]);
      return;
    }
    let cancelled = false;
    fetchAssets({ category: [header.category], ownership: ["Rental"], limit: 2000, page: 1 })
      .then((res) => {
        if (cancelled) return;
        const mapped = (res?.data ?? []).map((a: any) => ({
          id: a.id,
          description: a.description ?? "",
          project_name: a.project_name ?? "",
          category: a.category ?? "",
        }));
        setRentalAssets(mapped);
      })
      .catch(() => {
        if (!cancelled) setRentalAssets([]);
      });
    return () => {
      cancelled = true;
    };
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

  useEffect(() => {
    if (!header.description.trim() || !header.category.trim()) return;
    const match = rentalAssets.find(
      (a) =>
        a.category?.toLowerCase().trim() === header.category.toLowerCase().trim() &&
        a.description?.toLowerCase().trim() === header.description.toLowerCase().trim()
    );
    if (match?.project_name) {
      setHeader((h) => ({ ...h, rentedForProject: match.project_name }));
    }
  }, [header.description, header.category, rentalAssets]);

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

  const handleSubmitAgreement = async () => {
    if (!header.owner.trim()) {
      window.alert("Please enter owner name before submitting.");
      return;
    }
    if (!header.rentedForProject.trim()) {
      window.alert("Please select rented project / location before submitting.");
      return;
    }
    if (agreedRates.downRate.trim() === "" || Number(agreedRates.downRate) < 0) {
      window.alert("Down / hr is required and cannot be negative.");
      return;
    }
    if (!agreementPdfFile) {
      window.alert("Supporting Document (Agreement PDF) is required.");
      return;
    }
    try {
      let pdfKey = "";
      let pdfName = "";
      if (agreementPdfFile) {
        const up = await uploadAgreementPdf(agreementPdfFile);
        pdfKey = up.key;
        pdfName = up.name;
      }
      const selectedAsset = rentalAssets.find(
        (a) =>
          a.category?.toLowerCase().trim() === header.category.toLowerCase().trim() &&
          a.description?.toLowerCase().trim() === header.description.toLowerCase().trim() &&
          a.project_name?.toLowerCase().trim() === header.rentedForProject.toLowerCase().trim()
      );
      await createRentalAgreement({
        asset_id: selectedAsset?.id ?? null,
        owner_name: header.owner,
        tin_no: header.tinNo,
        owner_address: header.address,
        category: header.category,
        description: header.description,
        rented_project: header.rentedForProject,
        make_model: header.makeModel,
        plate_no: header.plateNo,
        km_hr_reading: header.kmHrReading,
        fuel_filled: header.fuelFilled,
        capacity: header.capacity,
        contract_from_date: header.contractFromDate || null,
        contract_to_date: header.contractToDate || null,
        contract_status: header.contractStatus,
        min_hour_per_day: header.minHourPerDay || null,
        rate_op: agreedRates.operationalRate || 0,
        rate_idle: agreedRates.idleRate || 0,
        rate_down: agreedRates.downRate || 0,
        agreement_pdf_key: pdfKey || null,
        agreement_pdf_name: pdfName || null,
        remark: header.remark,
      });
      window.alert("Agreement submitted successfully.");
      setPreviewOpen(true);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Failed to submit agreement.");
    }
  };

  const clearAgreementPdf = () => {
    setAgreementPdfFile(null);
    if (agreementPdfInputRef.current) agreementPdfInputRef.current.value = "";
  };

  // Professional form input classes
  const inputClass = "w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-white";
  const textareaClass = "w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-white resize-y";
  const selectClass = "w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-white";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30">
      <div ref={pdfRef} className="w-full min-w-0 max-w-none mx-0 px-0 py-0">
        <Card className="overflow-visible border-0 shadow-none bg-transparent">
          <CardContent className="px-3 py-2.5 sm:px-4 sm:py-3">
            {/* Original Header - Keep as is */}
            <UtilizationStyleHeader subtitle="RENTED ASSET AGREEMENT" />

            {/* Header Info Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
              <div className="flex flex-wrap justify-between items-center gap-3">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-lg">
                    <CalendarIcon className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-medium text-gray-700">{formDateAuto}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-mono text-gray-600">{refGenerated}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-gray-500">Draft Mode</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Form - Left 2 columns */}
              <div className="lg:col-span-2 space-y-6">
                {/* Party Information Section */}
                <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <SectionHeader icon={Building2} title="Party Information" description="Owner / Lessor Details" />
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField number={1} label="Owner / Company Name" required>
                          <Input
                            placeholder="Enter full name or company name"
                            value={header.owner}
                            onChange={(e) => setHeader((p) => ({ ...p, owner: e.target.value }))}
                            className={inputClass}
                          />
                        </FormField>
                        <FormField number={2} label="TIN Number">
                          <Input
                            placeholder="Tax Identification Number"
                            value={header.tinNo}
                            onChange={(e) => setHeader((p) => ({ ...p, tinNo: e.target.value }))}
                            className={inputClass}
                          />
                        </FormField>
                      </div>
                      <FormField number={3} label="Physical Address">
                        <textarea
                          rows={2}
                          placeholder="Full address of the owner/lessor"
                          value={header.address}
                          onChange={(e) => setHeader((p) => ({ ...p, address: e.target.value }))}
                          className={textareaClass}
                        />
                      </FormField>
                    </div>
                  </CardContent>
                </Card>

                {/* Equipment Information Section */}
                <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <SectionHeader icon={Truck} title="Equipment Information" description="Asset / Machinery Details" />
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField number={4} label="Equipment Category" required>
                          <Select
                            value={header.category || "__none__"}
                            onValueChange={(v) => setHeader((p) => ({ ...p, category: v === "__none__" ? "" : v }))}
                            className="w-full"
                          >
                            <SelectItem value="__none__">Select category...</SelectItem>
                            {CATEGORY_SELECT_OPTIONS.map((o) => (
                              <SelectItem key={o.value} value={o.value}>
                                {o.label}
                              </SelectItem>
                            ))}
                          </Select>
                        </FormField>
                        <FormField number={5} label="Equipment Description" required>
                          <SearchableCombobox
                            id="machinery-rent-desc"
                            value={header.description}
                            onChange={(v) => setHeader((p) => ({ ...p, description: v }))}
                            options={descriptionOptions}
                            placeholder="Select or type equipment description"
                            loading={facetsLoading}
                            allowEmpty
                          />
                        </FormField>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField number={6} label="Make / Model">
                          <Input
                            placeholder="Manufacturer and model"
                            value={header.makeModel}
                            onChange={(e) => setHeader((p) => ({ ...p, makeModel: e.target.value }))}
                            className={inputClass}
                          />
                        </FormField>
                        <FormField number={7} label="Plate / Serial Number">
                          <Input
                            placeholder="Vehicle plate or serial number"
                            value={header.plateNo}
                            onChange={(e) => setHeader((p) => ({ ...p, plateNo: e.target.value }))}
                            className={inputClass}
                          />
                        </FormField>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField number={8} label="KM/HM Reading">
                          <Input
                            type="number"
                            placeholder="Current reading"
                            value={header.kmHrReading}
                            onChange={(e) => setHeader((p) => ({ ...p, kmHrReading: e.target.value }))}
                            className={inputClass}
                          />
                        </FormField>
                        <FormField number={9} label="Fuel (Liters)">
                          <Input
                            type="number"
                            placeholder="Fuel on delivery"
                            value={header.fuelFilled}
                            onChange={(e) => setHeader((p) => ({ ...p, fuelFilled: e.target.value }))}
                            className={inputClass}
                          />
                        </FormField>
                        <FormField number={10} label="Capacity (M³)">
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Capacity"
                            value={header.capacity}
                            onChange={(e) => setHeader((p) => ({ ...p, capacity: e.target.value }))}
                            className={inputClass}
                          />
                        </FormField>
                      </div>
                      <FormField number={11} label="Rented For Project / Location" required>
                        <SearchableCombobox
                          id="machinery-rent-project"
                          value={header.rentedForProject}
                          onChange={(v) => setHeader((p) => ({ ...p, rentedForProject: v }))}
                          options={projectLocationOptions}
                          placeholder="Search project name or location"
                          loading={allFacetsLoading}
                          allowEmpty
                        />
                      </FormField>
                    </div>
                  </CardContent>
                </Card>

                {/* Contract Details Section */}
                <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <SectionHeader icon={FileSignature} title="Contract Details" description="Terms & Duration" />
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField number={12} label="Contract Start Date">
                          <Input
                            type="date"
                            value={header.contractFromDate}
                            onChange={(e) => {
                              const v = e.target.value;
                              setHeader((p) => ({
                                ...p,
                                contractFromDate: v,
                                contractToDate: p.contractToDate && v && p.contractToDate < v ? v : p.contractToDate,
                              }));
                            }}
                            className={inputClass}
                          />
                        </FormField>
                        <FormField number={13} label="Contract End Date">
                          <Input
                            type="date"
                            value={header.contractToDate}
                            min={header.contractFromDate || undefined}
                            onChange={(e) => setHeader((p) => ({ ...p, contractToDate: e.target.value }))}
                            className={inputClass}
                          />
                        </FormField>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField number={14} label="Contract Status">
                          <Select
                            value={header.contractStatus}
                            onValueChange={(v) => setHeader((p) => ({ ...p, contractStatus: v }))}
                            className="w-full"
                          >
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Inactive">Inactive</SelectItem>
                            <SelectItem value="Suspended">Suspended</SelectItem>
                          </Select>
                        </FormField>
                        <FormField number={15} label="Minimum Hours / Day">
                          <Input
                            type="number"
                            placeholder="Minimum daily operating hours"
                            value={header.minHourPerDay}
                            onChange={(e) => setHeader((p) => ({ ...p, minHourPerDay: e.target.value }))}
                            className={inputClass}
                          />
                        </FormField>
                      </div>
                      <FormField number={16} label="Additional Remarks / Conditions">
                        <textarea
                          rows={3}
                          placeholder="Any special terms, conditions, or remarks"
                          value={header.remark}
                          onChange={(e) => setHeader((p) => ({ ...p, remark: e.target.value }))}
                          className={textareaClass}
                        />
                      </FormField>
                      <FormField label="Supporting Document" required>
                        <div className="flex items-center gap-3">
                          <input
                            ref={agreementPdfInputRef}
                            type="file"
                            accept="application/pdf,.pdf"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f && f.type === "application/pdf") setAgreementPdfFile(f);
                              else if (f) alert("Only PDF files are allowed");
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => agreementPdfInputRef.current?.click()}
                            className="gap-2"
                          >
                            <Upload className="h-4 w-4" />
                            Upload Agreement PDF
                          </Button>
                          {agreementPdfFile && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <FileText className="h-4 w-4 text-emerald-600" />
                              <span className="truncate max-w-xs">{agreementPdfFile.name}</span>
                              <button
                                onClick={clearAgreementPdf}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">Upload signed agreement in PDF format (max 10MB)</p>
                      </FormField>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Rates & Summary */}
              <div className="space-y-6">
                {/* Rate Card */}
                <Card className="border-2 border-emerald-200 shadow-md bg-gradient-to-br from-white to-emerald-50/30">
                  <CardContent className="p-6">
                    <SectionHeader icon={Banknote} title="Rate Structure" description="Agreed Rates (ETB)" />
                    <div className="space-y-4">
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs font-semibold text-gray-700 mb-1 block">Operational Rate</Label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">ETB</span>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={agreedRates.operationalRate}
                                onChange={(e) => setAgreedRates((p) => ({ ...p, operationalRate: e.target.value }))}
                                className="pl-12 text-base font-semibold"
                              />
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1">per operating hour</p>
                          </div>
                          <div className="h-px bg-gray-200"></div>
                          <div>
                            <Label className="text-xs font-semibold text-gray-700 mb-1 block">Idle Rate</Label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">ETB</span>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={agreedRates.idleRate}
                                onChange={(e) => setAgreedRates((p) => ({ ...p, idleRate: e.target.value }))}
                                className="pl-12"
                              />
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1">per idle hour</p>
                          </div>
                          <div className="h-px bg-gray-200"></div>
                          <div>
                            <Label className="text-xs font-semibold text-gray-700 mb-1 block">Down Rate</Label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">ETB</span>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={agreedRates.downRate}
                                onChange={(e) => setAgreedRates((p) => ({ ...p, downRate: e.target.value }))}
                                className="pl-12"
                              />
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1">per down hour</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Summary Card */}
                <Card className="border border-gray-200 shadow-sm bg-gray-50">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <ClipboardList className="h-4 w-4 text-emerald-600" />
                      <h3 className="text-sm font-bold text-gray-800">Form Summary</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Owner:</span>
                        <span className="font-medium text-gray-800 truncate max-w-[180px]">{header.owner || "—"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Equipment:</span>
                        <span className="font-medium text-gray-800 truncate max-w-[180px]">{header.description || "—"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Project:</span>
                        <span className="font-medium text-gray-800 truncate max-w-[180px]">{header.rentedForProject || "—"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Duration:</span>
                        <span className="font-medium text-gray-800">{header.contractFromDate?.slice(0,10) || "—"} → {header.contractToDate?.slice(0,10) || "—"}</span>
                      </div>
                      <div className="border-t border-gray-200 pt-2 mt-2">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Operational:</span>
                          <span className="font-semibold text-emerald-700">ETB {agreedRates.operationalRate || "0"}/hr</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Idle:</span>
                          <span className="font-semibold text-amber-700">ETB {agreedRates.idleRate || "0"}/hr</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Down:</span>
                          <span className="font-semibold text-red-700">ETB {agreedRates.downRate || "0"}/hr</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Prepared By & Submit */}
                <div className="bg-white rounded-lg border border-gray-200 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Prepared by</span>
                  </div>
                  <p className="text-base font-semibold text-gray-900 mb-4">{preparedByName || "—"}</p>
                  <Button
                    onClick={handleSubmitAgreement}
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-2.5 text-base font-semibold gap-2"
                  >
                    <CheckCircle className="h-5 w-5" />
                    Submit Rental Agreement
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Modal */}
      {previewOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center overflow-x-hidden overflow-y-auto p-2 bg-slate-950/65 backdrop-blur-md print:hidden">
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
                  <UtilizationStyleHeader subtitle="RENTED ASSET AGREEMENT" />
                </div>

                <div className="mb-3 space-y-1.5 border-l-4 border-emerald-700 bg-slate-50/90 px-3 py-2 font-sans text-[9px] leading-snug text-slate-800 shadow-sm">
                  <div className="flex justify-between gap-3 border-b border-slate-200/90 pb-1">
                    <span className="font-serif text-[10px] font-bold text-emerald-950">Project</span>
                    <span className="max-w-[65%] text-right text-[9px] font-semibold text-slate-800">
                      {header.rentedForProject || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3 border-b border-slate-200/90 pb-1">
                    <span className="font-serif text-[10px] font-bold text-emerald-950">Date</span>
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