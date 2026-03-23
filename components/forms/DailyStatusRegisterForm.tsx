"use client"

import { useEffect, useState, useContext } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectItem } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { fetchAssetFacets, fetchEquipmentOptions, type EquipmentOption } from "@/lib/api/assets"
import { Eye, X } from "lucide-react"
import { FormModalHeaderActionsContext } from "@/components/FormModal"

type StatusRow = {
  id: string
  assetId: string
  category: string
  description: string
  assetNo: string
  plateNo: string
  status: string
  unchanged: boolean
  changed: boolean
  newStatus: string
}

export default function DailyStatusRegisterForm() {
  const [projects, setProjects] = useState<string[]>([])
  const [statusOptions, setStatusOptions] = useState<string[]>([])
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [loadingEquipment, setLoadingEquipment] = useState(false)
  const setHeaderActions = useContext(FormModalHeaderActionsContext)

  const [header, setHeader] = useState({
    project: "",
    gcDate: new Date().toISOString().split("T")[0],
  })

  const [rows, setRows] = useState<StatusRow[]>([])
  const [search, setSearch] = useState("")
  const [previewOpen, setPreviewOpen] = useState(false)

  // Load all projects and global status options once
  useEffect(() => {
    let cancelled = false
    setLoadingProjects(true)
    fetchAssetFacets()
      .then((facets) => {
        if (cancelled) return
        setProjects(facets.project_name ?? [])
        const uniqStatus = Array.from(new Set(facets.status ?? [])).filter(Boolean).sort()
        setStatusOptions(uniqStatus)
      })
      .catch(() => {
        if (!cancelled) {
          setProjects([])
          setStatusOptions([])
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingProjects(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Attach Preview button to modal header (like utilization form)
  useEffect(() => {
    if (!setHeaderActions) return
    setHeaderActions(
      <button
        type="button"
        onClick={() => setPreviewOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
        aria-label="Preview report"
      >
        <Eye className="h-4 w-4" /> Preview
      </button>
    )
    return () => setHeaderActions(null)
  }, [setHeaderActions])

  // Load equipment list for selected project
  useEffect(() => {
    if (!header.project.trim()) {
      setRows([])
      return
    }
    let cancelled = false
    setLoadingEquipment(true)
    fetchEquipmentOptions(header.project)
      .then((list: EquipmentOption[]) => {
        if (cancelled) return
        const mapped: StatusRow[] = (list ?? []).map((opt, index) => ({
          id: `row-${opt.id}-${index}`,
          assetId: opt.id,
          category: opt.category ?? "",
          description: opt.description ?? "",
          assetNo: (opt as any).asset_no ?? "",
          plateNo: opt.plate_no ?? "",
          status: opt.status ?? "",
          unchanged: true,
          changed: false,
          newStatus: opt.status ?? "",
        }))
        setRows(mapped)
      })
      .catch(() => {
        if (!cancelled) setRows([])
      })
      .finally(() => {
        if (!cancelled) setLoadingEquipment(false)
      })
    return () => {
      cancelled = true
    }
  }, [header.project])

  const handleToggle = (rowId: string, field: "unchanged" | "changed", value: boolean) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== rowId) return r
        if (field === "unchanged") {
          const nextUnchanged = value
          return {
            ...r,
            unchanged: nextUnchanged,
            changed: nextUnchanged ? false : r.changed,
            newStatus: nextUnchanged ? r.status : r.newStatus,
          }
        }
        const nextChanged = value
        return {
          ...r,
          changed: nextChanged,
          unchanged: nextChanged ? false : r.unchanged,
          newStatus: nextChanged && !r.newStatus ? r.status : r.newStatus,
        }
      })
    )
  }

  const handleStatusChange = (rowId: string, newStatus: string) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === rowId
          ? {
              ...r,
              newStatus,
              changed: true,
              unchanged: false,
            }
          : r
      )
    )
  }

  const total = rows.length

  const filteredRows = rows.filter((r) => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    return (
      r.category.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.assetNo.toLowerCase().includes(q) ||
      r.plateNo.toLowerCase().includes(q) ||
      r.status.toLowerCase().includes(q) ||
      r.newStatus.toLowerCase().includes(q)
    )
  })

  const changedRows = rows.filter(
    (r) => r.changed && r.newStatus && r.newStatus !== r.status
  )

  return (
    <div className="w-full max-w-6xl mx-auto min-w-0 h-full min-h-0 flex flex-col p-0 m-0 overflow-hidden">
      <Card className="w-full min-w-0 flex-1 min-h-0 border-0 shadow-none rounded-none bg-white overflow-hidden flex flex-col">
        <CardContent className="px-4 pb-4 pt-2 bg-white min-w-0 flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Header */}
         

          {/* Project & date row */}
          <div className="shrink-0 mb-4 px-1">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 bg-gradient-to-r from-emerald-50/80 via-slate-50 to-sky-50/60 rounded-xl p-4 border border-slate-200/80 shadow-sm">
              <div className="flex items-center gap-2 flex-1 min-w-[260px] max-w-full">
                <Label className="text-xs font-semibold text-slate-700 shrink-0 w-20">
                  Project
                </Label>
                <Select
                  value={header.project || "__none__"}
                  onValueChange={(v) => {
                    const nextProject = v === "__none__" ? "" : v
                    setHeader((p) => ({ ...p, project: nextProject }))
                  }}
                  disabled={loadingProjects}
                  className="[&_button]:h-9 [&_button]:text-xs [&_button]:px-3 [&_button]:rounded-lg [&_button]:border-slate-300 [&_button]:hover:bg-slate-50 min-w-[260px] flex-1 max-w-[480px]"
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
                <Label className="text-xs font-semibold text-slate-700 shrink-0">
                  Date
                </Label>
                <Input
                  type="date"
                  className="h-9 border border-slate-300 rounded-lg px-3 text-sm w-40 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  value={header.gcDate}
                  onChange={(e) =>
                    setHeader((p) => ({ ...p, gcDate: e.target.value }))
                  }
                />
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold">Total equipment:</span>
                <span className="font-mono">{total}</span>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="shrink-0 mb-3 px-1 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Label className="text-xs font-semibold text-slate-700 shrink-0">
                Search
              </Label>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter by category, description, asset, plate, or status..."
                className="h-8 w-64 border border-slate-300 rounded-md px-2 text-xs focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              />
            </div>
            <div className="text-[11px] text-slate-500">
              Showing{" "}
              <span className="font-mono font-semibold">
                {filteredRows.length}
              </span>{" "}
              of{" "}
              <span className="font-mono font-semibold">{total}</span> equipment
            </div>
          </div>

          {/* Table */}
          <div className="w-full border border-slate-300 rounded-xl overflow-hidden flex-1 min-h-0 flex flex-col shadow-md bg-white">
            <div className="overflow-auto flex-1 min-h-0">
              <table className="w-full border-collapse text-[11px] min-w-[900px]">
                <thead className="sticky top-0 z-[1] bg-slate-800 text-slate-50">
                  <tr>
                    <th className="border border-slate-600 px-1.5 py-1 text-center w-10">
                      No
                    </th>
                    <th className="border border-slate-600 px-1.5 py-1 text-left min-w-[140px]">
                      Category
                    </th>
                    <th className="border border-slate-600 px-1.5 py-1 text-left min-w-[180px]">
                      Description
                    </th>
                    <th className="border border-slate-600 px-1.5 py-1 text-left min-w-[90px]">
                      Asset No
                    </th>
                    <th className="border border-slate-600 px-1.5 py-1 text-left min-w-[90px]">
                      Plate No
                    </th>
                    <th className="border border-slate-600 px-1.5 py-1 text-left min-w-[80px]">
                      Current status
                    </th>
                    <th className="border border-slate-600 px-1.5 py-1 text-center min-w-[80px]">
                      Unchanged
                    </th>
                    <th className="border border-slate-600 px-1.5 py-1 text-center min-w-[80px]">
                      Changed
                    </th>
                    <th className="border border-slate-600 px-1.5 py-1 text-left min-w-[140px]">
                      New status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="border border-slate-200 py-6 text-center text-xs text-slate-500"
                      >
                        {header.project
                          ? loadingEquipment
                            ? "Loading equipment..."
                            : "No equipment found for this project."
                          : "Select a project to load equipment."}
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((row, index) => (
                      <tr
                        key={row.id}
                        className="bg-white odd:bg-slate-50/40 hover:bg-emerald-50/40"
                      >
                        <td className="border border-slate-200 px-1.5 py-1 text-center font-mono text-[11px] text-slate-600">
                          {index + 1}
                        </td>
                        <td className="border border-slate-200 px-1.5 py-1">
                          {row.category || "—"}
                        </td>
                        <td className="border border-slate-200 px-1.5 py-1">
                          {row.description || "—"}
                        </td>
                        <td className="border border-slate-200 px-1.5 py-1">
                          {row.assetNo || "—"}
                        </td>
                        <td className="border border-slate-200 px-1.5 py-1">
                          {row.plateNo || "—"}
                        </td>
                        <td className="border border-slate-200 px-1.5 py-1">
                          {row.status || "—"}
                        </td>
                        <td className="border border-slate-200 px-1.5 py-1 text-center">
                          <Checkbox
                            checked={row.unchanged}
                            onChange={(e) =>
                              handleToggle(row.id, "unchanged", e.target.checked)
                            }
                            className="mx-auto"
                          />
                        </td>
                        <td className="border border-slate-200 px-1.5 py-1 text-center">
                          <Checkbox
                            checked={row.changed}
                            onChange={(e) =>
                              handleToggle(row.id, "changed", e.target.checked)
                            }
                            className="mx-auto"
                          />
                        </td>
                        <td className="border border-slate-200 px-1.5 py-1">
                          <Select
                            value={row.newStatus || "__none__"}
                            onValueChange={(v) =>
                              handleStatusChange(
                                row.id,
                                v === "__none__" ? "" : v
                              )
                            }
                            disabled={!row.changed}
                            className="[&_button]:h-7 [&_button]:min-h-7 [&_button]:text-xs [&_button]:px-1.5 [&_button]:rounded-md [&_button]:border-slate-300"
                          >
                            <SelectItem value="__none__">— Select —</SelectItem>
                            {statusOptions.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </Select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* A4-style preview overlay for changed statuses only */}
      {previewOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-2 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-zinc-200 max-h-[98vh]">
            {/* Preview header */}
            <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-zinc-200 bg-gradient-to-r from-slate-50 to-white">
              <span className="text-sm font-semibold text-slate-700">
                Preview — Daily Status Register (A4)
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
                {/* Standard header with logo */}
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
                      DAILY STATUS REGISTER (CHANGES ONLY)
                    </p>
                  </div>
                  <div className="flex flex-col justify-center px-3 text-[10px] text-slate-700 font-medium">
                    <p>
                      <b>Date:</b> {header.gcDate || "—"}
                    </p>
                    <p className="mt-1">
                      <b>Project:</b> {header.project || "—"}
                    </p>
                  </div>
                </div>

                {/* Changes table */}
                {changedRows.length === 0 ? (
                  <p className="text-[11px] text-slate-500">
                    No equipment has been marked as changed.
                  </p>
                ) : (
                  <table className="w-full border-collapse text-[11px]">
                    <thead>
                      <tr className="bg-slate-700 text-slate-50">
                        <th className="border border-slate-600 px-1.5 py-1 text-center w-10">
                          No
                        </th>
                        <th className="border border-slate-600 px-1.5 py-1 text-left">
                          Category
                        </th>
                        <th className="border border-slate-600 px-1.5 py-1 text-left">
                          Description
                        </th>
                        <th className="border border-slate-600 px-1.5 py-1 text-left">
                          Asset No
                        </th>
                        <th className="border border-slate-600 px-1.5 py-1 text-left">
                          Plate No
                        </th>
                        <th className="border border-slate-600 px-1.5 py-1 text-left">
                          Status (old → new)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {changedRows.map((r, idx) => (
                        <tr
                          key={r.id}
                          className="bg-white odd:bg-slate-50/40"
                        >
                          <td className="border border-slate-300 px-1.5 py-1 text-center">
                            {idx + 1}
                          </td>
                          <td className="border border-slate-300 px-1.5 py-1">
                            {r.category || "—"}
                          </td>
                          <td className="border border-slate-300 px-1.5 py-1">
                            {r.description || "—"}
                          </td>
                          <td className="border border-slate-300 px-1.5 py-1">
                            {r.assetNo || "—"}
                          </td>
                          <td className="border border-slate-300 px-1.5 py-1">
                            {r.plateNo || "—"}
                          </td>
                          <td className="border border-slate-300 px-1.5 py-1">
                            {(r.status || "—") +
                              " → " +
                              (r.newStatus || r.status || "—")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

