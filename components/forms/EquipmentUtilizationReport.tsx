"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectItem } from "@/components/ui/select"
import { fetchAssetFacets } from "@/lib/api/assets"
import type { AssetFacets } from "@/types/asset"
import { SearchableCombobox } from "@/components/ui/searchable-combobox"

type DateRange = {
  from: string
  to: string
}

type ReportType = "project" | "category" | "asset" | "operator"

export default function EquipmentUtilizationReport() {
  const [dateRange, setDateRange] = useState<DateRange>({ from: "", to: "" })
  const [facets, setFacets] = useState<AssetFacets | null>(null)
  const [loadingFacets, setLoadingFacets] = useState(false)

  const [project, setProject] = useState("")
  const [category, setCategory] = useState("")
  const [assetNo, setAssetNo] = useState("")
  const [operator, setOperator] = useState("")

  const [activeReport, setActiveReport] = useState<ReportType | null>(null)
  const [pdfDownloading, setPdfDownloading] = useState(false)
  const a4Ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoadingFacets(true)
    fetchAssetFacets({})
      .then((f) => {
        if (!cancelled) setFacets(f)
      })
      .catch(() => {
        if (!cancelled) setFacets(null)
      })
      .finally(() => {
        if (!cancelled) setLoadingFacets(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const projectOptions = useMemo(
    () => (facets?.project_location ?? []) as string[],
    [facets?.project_location]
  )
  const categoryOptions = useMemo(
    () => (facets?.category ?? []) as string[],
    [facets?.category]
  )
  const assetNoOptions = useMemo(
    () => (((facets as any)?.asset_no as string[] | undefined) ?? []),
    [facets]
  )
  const operatorOptions = useMemo(
    () => (facets?.responsible_person_name ?? []) as string[],
    [facets?.responsible_person_name]
  )

  const ensureDateRange = () => {
    if (!dateRange.from || !dateRange.to) {
      window.alert("Please select both From and To dates for the report.")
      return false
    }
    return true
  }

  const handleSelectReport = (type: ReportType) => {
    if (!ensureDateRange()) return
    setActiveReport(type)
  }

  const formatRangeLabel = () => {
    if (!dateRange.from && !dateRange.to) return "—"
    if (!dateRange.to) return dateRange.from
    if (!dateRange.from) return dateRange.to
    if (dateRange.from === dateRange.to) return dateRange.from
    return `${dateRange.from} – ${dateRange.to}`
  }

  const reportTitleByType: Record<ReportType, string> = {
    project: "Equipment Utilization Summary by Project",
    category: "Equipment Utilization Summary by Category",
    asset: "Equipment Utilization Summary by Asset Number",
    operator: "Equipment Utilization Summary by Operator",
  }

  const handleDownloadPdf = async () => {
    if (!activeReport) return
    if (typeof window === "undefined") return
    const root = a4Ref.current
    if (!root) {
      window.alert("Report preview is not ready yet.")
      return
    }
    if (pdfDownloading) return
    setPdfDownloading(true)
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ])
      const canvas = await html2canvas(root, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff",
      })
      const imgData = canvas.toDataURL("image/png")
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4", compress: false })
      const pageW = 297
      const pageH = 210
      doc.addImage(imgData, "PNG", 0, 0, pageW, pageH)
      const baseName = reportTitleByType[activeReport].toLowerCase().replace(/\s+/g, "-")
      const dateLabel = (dateRange.from || dateRange.to || new Date().toISOString().slice(0, 10)).replaceAll("/", "-")
      doc.save(`utilization-${baseName}-${dateLabel}.pdf`)
    } catch (e) {
      console.error(e)
      window.alert("Failed to download utilization report. Please try again.")
    } finally {
      setPdfDownloading(false)
    }
  }

  return (
    <div className="space-y-4 flex flex-col items-center">
      {/* Date range */}
      <div className="space-y-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            type="date"
            value={dateRange.from}
            onChange={(e) => setDateRange((p) => ({ ...p, from: e.target.value }))}
            className="h-9 text-sm"
            placeholder="mm/dd/yyyy"
          />
          <Input
            type="date"
            value={dateRange.to}
            onChange={(e) => setDateRange((p) => ({ ...p, to: e.target.value }))}
            className="h-9 text-sm"
            placeholder="mm/dd/yyyy"
          />
        </div>
      </div>

      {/* Report types + filters, stacked like your text example */}
      <div className="space-y-2">
        {/* Project report row */}
        <div className="space-y-1.5">
          <Button
            type="button"
            variant={activeReport === "project" ? "default" : "outline"}
            size="sm"
            className="justify-start text-xs font-medium"
            onClick={() => handleSelectReport("project")}
          >
            • Utilization report by project
          </Button>
          <Select
            value={project || "__none__"}
            onValueChange={(v) => setProject(v === "__none__" ? "" : v)}
            className="[&_button]:h-8 [&_button]:text-[11px]"
          >
            <SelectItem value="__none__">All projects</SelectItem>
            {projectOptions.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </Select>
        </div>

        {/* Category report row */}
        <div className="space-y-1.5">
          <Button
            type="button"
            variant={activeReport === "category" ? "default" : "outline"}
            size="sm"
            className="justify-start text-xs font-medium"
            onClick={() => handleSelectReport("category")}
          >
            • Utilization report by category
          </Button>
          <SearchableCombobox
            id="util_category"
            value={category}
            onChange={setCategory}
            options={categoryOptions}
            placeholder="Any category"
            loading={loadingFacets}
            allowEmpty
          />
        </div>

        {/* Asset report row */}
        <div className="space-y-1.5">
          <Button
            type="button"
            variant={activeReport === "asset" ? "default" : "outline"}
            size="sm"
            className="justify-start text-xs font-medium"
            onClick={() => handleSelectReport("asset")}
          >
            • Utilization report by equipment (asset number)
          </Button>
          <SearchableCombobox
            id="util_asset_no"
            value={assetNo}
            onChange={setAssetNo}
            options={assetNoOptions}
            placeholder="Any asset"
            loading={loadingFacets}
            allowEmpty
          />
        </div>

        {/* Operator report row */}
        <div className="space-y-1.5">
          <Button
            type="button"
            variant={activeReport === "operator" ? "default" : "outline"}
            size="sm"
            className="justify-start text-xs font-medium"
            onClick={() => handleSelectReport("operator")}
          >
            • Utilization report by operator
          </Button>
          <SearchableCombobox
            id="util_operator"
            value={operator}
            onChange={setOperator}
            options={operatorOptions}
            placeholder="Any operator"
            loading={loadingFacets}
            allowEmpty
          />
        </div>
      </div>

      {/* A4 landscape preview template fully in the popup */}
      {activeReport && (
        <div
          ref={a4Ref}
          className="relative mx-auto mt-4 shadow-lg bg-white"
          style={{ width: "297mm", minHeight: "210mm", padding: "10mm", boxSizing: "border-box" }}
        >
          <div className="absolute right-4 top-3 z-10">
            <Button
              type="button"
              size="sm"
              className="h-7 px-3 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
              onClick={handleDownloadPdf}
              disabled={pdfDownloading}
            >
              {pdfDownloading ? "Generating PDF…" : "Download PDF"}
            </Button>
          </div>
                <div className="grid grid-cols-[70px_1fr_120px] border-b-2 border-slate-800 mb-4">
                  <div className="relative h-14 flex items-center justify-center border-r-2 border-slate-800 pr-2">
                    <Image src="/ecwc png logo.png" alt="ECWC Logo" width={56} height={56} className="object-contain" />
                  </div>
                  <div className="flex flex-col justify-center px-4 text-center border-r-2 border-slate-800">
                    <p className="text-sm font-bold text-slate-900">
                      ETHIOPIAN CONSTRUCTION WORKS CORPORATION
                    </p>
                    <p className="text-xs font-semibold text-slate-700 mt-0.5">
                      EQUIPMENT DAILY TIME UTILIZATION REGISTER
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {reportTitleByType[activeReport]}
                    </p>
                  </div>
                  <div className="flex flex-col justify-center px-3 text-[10px] text-slate-700 font-medium">
                    <p>
                      <b>Document No.</b>
                    </p>
                    <p>OF/ECWC/xxx</p>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-slate-600 mb-3">
                  <span>Project: {project || (activeReport === "project" ? "—" : "All")}</span>
                  <div className="flex flex-col items-center mx-4 flex-1">
                    <span className="font-medium">Date range</span>
                    <span className="mt-0.5">{formatRangeLabel()}</span>
                  </div>
                  <span>Category: {category || (activeReport === "category" ? "—" : "All")}</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 mb-4">
                  <span>Asset: {assetNo || (activeReport === "asset" ? "—" : "All")}</span>
                  <span>Operator: {operator || (activeReport === "operator" ? "—" : "All")}</span>
                </div>
                <table className="w-full border-collapse text-[10px]">
                  <thead>
                    <tr className="bg-slate-700 text-slate-100">
                      <th className="border border-slate-600 px-1 py-1.5 text-left font-semibold">No</th>
                      <th className="border border-slate-600 px-1.5 py-1.5 text-left font-semibold">Category</th>
                      <th className="border border-slate-600 px-1.5 py-1.5 text-left font-semibold">Description</th>
                      <th className="border border-slate-600 px-1.5 py-1.5 text-left font-semibold">Plate / Asset No</th>
                      <th className="border border-slate-600 px-1.5 py-1.5 text-center font-semibold">Worked Hr</th>
                      <th className="border border-slate-600 px-1.5 py-1.5 text-center font-semibold">Idle Hr</th>
                      <th className="border border-slate-600 px-1.5 py-1.5 text-center font-semibold">Down Hr</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td
                        colSpan={7}
                        className="border border-slate-300 px-1.5 py-6 text-center text-slate-400"
                      >
                        Utilization data aggregation is not yet wired to the database.
                        This template provides a standard A4 landscape layout for the
                        selected utilization report type.
                      </td>
                    </tr>
                  </tbody>
                </table>
        </div>
      )}
    </div>
  )
}


