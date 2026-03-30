"use client"

import { useState, useRef, useEffect, useContext } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectItem } from "@/components/ui/select"
import { Trash2, ChevronDown, ChevronUp, Eye, X } from "lucide-react"
import { fetchAssetFacets, fetchEquipmentOptions, type EquipmentOption } from "@/lib/api/assets"
import { getSession } from "@/lib/auth"
import { FormModalHeaderActionsContext } from "@/components/FormModal"
import { cn } from "@/lib/utils"

const IDLE_REASONS = [
  { value: "FL", full: "Fuel/Lubricant Shortage" },
  { value: "AD", full: "Activity Dependant" },
  { value: "OP", full: "Operator Problem" },
  { value: "MO", full: "Mobilization/Demobilization" },
  { value: "CR", full: "Contract Renewal" },
  { value: "WD", full: "Waiting for Demobilization" },
  { value: "FM", full: "Force Majeure" },
  { value: "ED", full: "Equipment Dependant" },
  { value: "WS", full: "Water Shortage" },
  { value: "LC", full: "Lack of Co-ordination" },
  { value: "MF", full: "Miscellaneous Factor" },
  { value: "WC", full: "Weather Condition" },
]
const DOWN_REASONS = [
  { value: "PM", full: "Preventive Maintenance" },
  { value: "WP", full: "Waiting for parts" },
  { value: "WM", full: "Waiting for man power" },
  { value: "UR", full: "Under Repair" },
]

/** Parse "HH:mm" to minutes since midnight; returns 0 if invalid. */
function timeToMinutes(hhmm: string): number {
  if (!hhmm || !/^\d{1,2}:\d{2}$/.test(hhmm.trim())) return 0
  const [h, m] = hhmm.trim().split(":").map(Number)
  return h * 60 + m
}

/** Duration in hours between start and end (handles overnight). */
function timeDurationHours(start: string, end: string): number {
  const s = timeToMinutes(start)
  const e = timeToMinutes(end)
  if (s === 0 && e === 0) return 0
  let diff = e - s
  if (diff < 0) diff += 24 * 60
  return diff / 60
}

function timeDurationMinutes(start: string, end: string): number {
  return Math.round(timeDurationHours(start, end) * 60)
}

function formatMinutesAsLabel(totalMinutes: number): string {
  const mins = Math.max(0, Math.round(totalMinutes))
  const h = Math.floor(mins / 60)
  const m = mins % 60
  const mm = m.toString().padStart(2, "0")
  return `${h}:${mm}`
}

type HalfBucket = "dayFirst" | "daySecond" | "nightFirst" | "nightSecond"

function generateHalfOptions(bucket: HalfBucket): string[] {
  const results: string[] = []
  const pushRange = (startMin: number, endMin: number, stepMin = 30) => {
    for (let t = startMin; t <= endMin; t += stepMin) {
      const h = Math.floor(t / 60)
      const m = t % 60
      const hh = h.toString().padStart(2, "0")
      const mm = m.toString().padStart(2, "0")
      results.push(`${hh}:${mm}`)
    }
  }

  if (bucket === "dayFirst") {
    pushRange(6 * 60, 12 * 60, 30)
  } else if (bucket === "daySecond") {
    pushRange(12 * 60, 18 * 60, 30)
  } else if (bucket === "nightFirst") {
    results.push("23:59")
    pushRange(0, 5 * 60 + 30, 30)
    results.push("05:59")
  } else {
    pushRange(6 * 60, 12 * 60, 30)
  }

  return results
}

function formatTimeLabel(hhmm: string): string {
  const [hStr, mStr] = hhmm.split(":")
  let h = parseInt(hStr, 10)
  const m = parseInt(mStr, 10)
  const suffix = h >= 12 ? "PM" : "AM"
  if (h === 0) h = 12
  else if (h > 12) h -= 12
  const mm = m.toString().padStart(2, "0")
  return `${h}:${mm} ${suffix}`
}

/** End must be after start within the same half. */
function isEndAfterStart(bucket: HalfBucket, startHHMM: string, endHHMM: string): boolean {
  if (!startHHMM || !endHHMM) return true
  const s = timeToMinutes(startHHMM)
  const e = timeToMinutes(endHHMM)
  if (bucket === "nightFirst") {
    // Treat 23:59 as before 00:00 for overnight half.
    const norm = (m: number) => (m === 23 * 60 + 59 ? -1 : m)
    return norm(e) > norm(s)
  }
  return s < e
}

function EquipmentCombobox({
  row,
  equipmentOptions,
  openRowId,
  search,
  disabled,
  placeholder,
  onOpen,
  onClose,
  onSearchChange,
  onSelect,
  onClear,
  cellInputClass,
}: {
  row: { id: string; assetId: string; category: string; description: string; plateNo: string; status: string }
  equipmentOptions: EquipmentOption[]
  openRowId: string | null
  search: string
  disabled: boolean
  placeholder: string
  onOpen: () => void
  onClose: () => void
  onSearchChange: (s: string) => void
  onSelect: (opt: EquipmentOption) => void
  onClear: () => void
  cellInputClass: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const isOpen = openRowId === row.id
  const q = search.trim().toLowerCase()
  const filtered = q
    ? equipmentOptions.filter(
        (o) =>
          (o.category ?? "").toLowerCase().includes(q) ||
          (o.description ?? "").toLowerCase().includes(q) ||
          (o.plate_no ?? "").toLowerCase().includes(q)
      )
    : equipmentOptions

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        inputRef.current && !inputRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        onClose()
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen, onClose])

  const displayValue = isOpen ? search : (row.assetId ? row.category : "")
  const [pos, setPos] = useState({ top: 0, left: 0, width: 220 })
  useEffect(() => {
    if (isOpen && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect()
      setPos({ top: rect.bottom + 2, left: rect.left, width: Math.max(rect.width, 220) })
    }
  }, [isOpen])

  return (
    <div className="relative">
      <div className="relative">
        <Input
          ref={inputRef}
          value={displayValue}
          onChange={(e) => {
            onOpen()
            onSearchChange(e.target.value)
          }}
          onFocus={() => {
            onOpen()
            if (!row.assetId) onSearchChange("")
            else onSearchChange(row.category)
          }}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(cellInputClass, "pr-6")}
        />
        <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-400 pointer-events-none" />
      </div>
      {isOpen && typeof document !== "undefined" && createPortal(
        <div
          ref={dropdownRef}
          className="fixed z-[9999] overflow-y-auto rounded-lg border border-emerald-200 bg-white shadow-xl shadow-emerald-900/10 max-h-[220px] min-w-[220px]"
          style={{ top: pos.top, left: pos.left, width: pos.width }}
        >
          <div className="p-1">
            <button
              type="button"
              className={cn(
                "w-full text-left cursor-pointer select-none rounded-md py-1.5 px-2 text-xs hover:bg-emerald-50 whitespace-nowrap",
                !row.assetId && "bg-emerald-50/80"
              )}
              onClick={onClear}
            >
              — Clear
            </button>
            {filtered.map((o) => (
              <div
                key={o.id}
                className={cn(
                  "cursor-pointer select-none rounded-sm py-1.5 px-2 text-xs hover:bg-zinc-100",
                  row.assetId === o.id && "bg-zinc-100"
                )}
                onClick={() => onSelect(o)}
              >
                {`${o.category ?? "—"} — ${o.description ?? "—"} — ${o.plate_no ?? "—"}`}
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="py-1.5 px-2 text-xs text-zinc-500">No match</div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

type UtilRow = {
  id: string
  assetId: string
  category: string
  description: string
  assetNo: string
  plateNo: string
  status: string
  rateOp: string
  rateIdle: string
  rateDown: string
  firstHalfStart: string
  firstHalfEnd: string
  secondHalfStart: string
  secondHalfEnd: string
  nightFirstHalfStart: string
  nightFirstHalfEnd: string
  nightSecondHalfStart: string
  nightSecondHalfEnd: string
  workedHrs: string
  idleHrs: string
  idleReason: string
  downHrs: string
  downReason: string
  engineInitial: string
  engineFinal: string
  engineDiff: string
  fuelLtrs: string
  fuelReading: string
  operatorFirstHalf: string
  operatorSecondHalf: string
  typeOfWork: string
}

/** Status is op or idle (case-insensitive) — only these rows accept data. */
function isRowEditable(row: UtilRow): boolean {
  const s = (row.status ?? "").trim().toLowerCase()
  return s === "op" || s === "idle"
}

function rowHasAnyData(row: UtilRow): boolean {
  return !!(
    row.assetId ||
    row.category ||
    row.description ||
    row.assetNo ||
    row.plateNo ||
    row.status ||
    row.rateOp ||
    row.rateIdle ||
    row.rateDown ||
    row.firstHalfStart ||
    row.firstHalfEnd ||
    row.secondHalfStart ||
    row.secondHalfEnd ||
    row.nightFirstHalfStart ||
    row.nightFirstHalfEnd ||
    row.nightSecondHalfStart ||
    row.nightSecondHalfEnd ||
    (row.workedHrs !== "0.00" && row.workedHrs !== "") ||
    (row.idleHrs !== "0" && row.idleHrs !== "") ||
    row.idleReason ||
    (row.downHrs !== "0" && row.downHrs !== "") ||
    row.downReason ||
    (row.engineInitial !== "0" && row.engineInitial !== "") ||
    (row.engineFinal !== "0" && row.engineFinal !== "") ||
    (row.fuelLtrs !== "0" && row.fuelLtrs !== "") ||
    (row.fuelReading !== "0" && row.fuelReading !== "") ||
    row.operatorFirstHalf ||
    row.operatorSecondHalf ||
    row.typeOfWork
  )
}

export default function EquipmentUtilizationForm() {
  const pdfRef = useRef<HTMLDivElement>(null)
  const setHeaderActions = useContext(FormModalHeaderActionsContext)
  const [pdfDownloading, setPdfDownloading] = useState(false)
  const [header, setHeader] = useState({
    project: "",
    gcDate: new Date().toISOString().split("T")[0],
    refNo: "",
  })
  const newUtilRow = (): UtilRow => ({
    id: `r-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    assetId: "",
    category: "",
    description: "",
    assetNo: "",
    plateNo: "",
    status: "",
    rateOp: "",
    rateIdle: "",
    rateDown: "",
    firstHalfStart: "",
    firstHalfEnd: "",
    secondHalfStart: "",
    secondHalfEnd: "",
    nightFirstHalfStart: "",
    nightFirstHalfEnd: "",
    nightSecondHalfStart: "",
    nightSecondHalfEnd: "",
    workedHrs: "0.00",
    idleHrs: "0",
    idleReason: "",
    downHrs: "0",
    downReason: "",
    engineInitial: "0",
    engineFinal: "0",
    engineDiff: "0.0",
    fuelLtrs: "0",
    fuelReading: "0",
    operatorFirstHalf: "",
    operatorSecondHalf: "",
    typeOfWork: "",
  })
  const [rows, setRows] = useState<UtilRow[]>([newUtilRow()])
  const [recordedBy, setRecordedBy] = useState("")
  const [checkedBy, setCheckedBy] = useState("")

  const [projects, setProjects] = useState<string[]>([])
  const [equipmentOptions, setEquipmentOptions] = useState<EquipmentOption[]>([])
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [loadingEquipment, setLoadingEquipment] = useState(false)
  const [openEquipmentRowId, setOpenEquipmentRowId] = useState<string | null>(null)
  const [equipmentSearch, setEquipmentSearch] = useState("")
  const [previewOpen, setPreviewOpen] = useState(false)
  const [legendsExpanded, setLegendsExpanded] = useState(false)

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

  useEffect(() => {
    const session = getSession()
    if (session?.user?.name) {
      setRecordedBy(session.user.name)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoadingProjects(true)
    fetchAssetFacets()
      .then((data) => {
        if (!cancelled) setProjects(data.project_name ?? [])
      })
      .catch(() => {
        if (!cancelled) setProjects([])
      })
      .finally(() => {
        if (!cancelled) setLoadingProjects(false)
      })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!header.project.trim()) {
      setEquipmentOptions([])
      return
    }
    let cancelled = false
    setLoadingEquipment(true)
    fetchEquipmentOptions(header.project)
      .then((list) => {
        if (!cancelled) setEquipmentOptions(list)
      })
      .catch(() => {
        if (!cancelled) setEquipmentOptions([])
      })
      .finally(() => {
        if (!cancelled) setLoadingEquipment(false)
      })
    return () => { cancelled = true }
  }, [header.project])

  // When equipment loads for the selected project, populate one row per equipment
  // Sort: op and idle first, then others at bottom
  useEffect(() => {
    if (equipmentOptions.length === 0) return
    const mapped = equipmentOptions.map((opt) => ({
      ...newUtilRow(),
      id: `r-${opt.id}-${Date.now()}`,
      assetId: opt.id,
      category: opt.category ?? "",
      description: opt.description ?? "",
      assetNo: (opt as any).asset_no ?? "",
      plateNo: opt.plate_no ?? "",
      status: opt.status ?? "",
      rateOp: opt.rate_op != null ? String(opt.rate_op) : "",
      rateIdle: opt.rate_idle != null ? String(opt.rate_idle) : "",
      rateDown: opt.rate_down != null ? String(opt.rate_down) : "",
    }))
    const editable = (r: UtilRow) => ((r.status ?? "").trim().toLowerCase() === "op" || (r.status ?? "").trim().toLowerCase() === "idle")
    mapped.sort((a, b) => (editable(a) ? 0 : 1) - (editable(b) ? 0 : 1))
    setRows(mapped)
  }, [header.project, equipmentOptions])

  const setRowEquipment = (rowId: string, option: EquipmentOption | null) => {
    setRows((prev) => {
      const nextRows = prev.map((r) =>
        r.id !== rowId
          ? r
          : {
              ...r,
              assetId: option?.id ?? "",
              category: option?.category ?? "",
              description: option?.description ?? "",
              assetNo: (option as any)?.asset_no ?? "",
              plateNo: option?.plate_no ?? "",
              status: option?.status ?? "",
              rateOp: option?.rate_op != null ? String(option.rate_op) : "",
              rateIdle: option?.rate_idle != null ? String(option.rate_idle) : "",
              rateDown: option?.rate_down != null ? String(option.rate_down) : "",
            }
      )
      const updatedLast = nextRows[nextRows.length - 1]
      if (option && updatedLast?.id === rowId && rowHasAnyData(updatedLast)) {
        return [...nextRows, newUtilRow()]
      }
      return nextRows
    })
  }

  const removeRow = (id: string) => {
    if (rows.length <= 1) return
    setRows((prev) => prev.filter((r) => r.id !== id))
  }
  const updateRow = (id: string, field: keyof UtilRow, value: string) => {
    setRows((prev) => {
      const nextRows = prev.map((r) => {
        if (r.id !== id) return r
        const next = { ...r, [field]: value }
        if (
          (field === "engineInitial" || field === "engineFinal") &&
          (next.engineInitial !== "" || next.engineFinal !== "")
        ) {
          const a = parseFloat(next.engineInitial) || 0
          const b = parseFloat(next.engineFinal) || 0
          next.engineDiff = (b - a).toFixed(1)
        }
        const timeFieldNames: (keyof UtilRow)[] = [
          "firstHalfStart",
          "firstHalfEnd",
          "secondHalfStart",
          "secondHalfEnd",
          "nightFirstHalfStart",
          "nightFirstHalfEnd",
          "nightSecondHalfStart",
          "nightSecondHalfEnd",
        ]
        if (timeFieldNames.includes(field)) {
          const m1 =
            next.firstHalfStart && next.firstHalfEnd
              ? timeDurationMinutes(next.firstHalfStart, next.firstHalfEnd)
              : 0
          const m2 =
            next.secondHalfStart && next.secondHalfEnd
              ? timeDurationMinutes(next.secondHalfStart, next.secondHalfEnd)
              : 0
          const m3 =
            next.nightFirstHalfStart && next.nightFirstHalfEnd
              ? timeDurationMinutes(next.nightFirstHalfStart, next.nightFirstHalfEnd)
              : 0
          const m4 =
            next.nightSecondHalfStart && next.nightSecondHalfEnd
              ? timeDurationMinutes(next.nightSecondHalfStart, next.nightSecondHalfEnd)
              : 0
          const totalMinutes = Math.max(0, m1) + Math.max(0, m2) + Math.max(0, m3) + Math.max(0, m4)
          next.workedHrs = formatMinutesAsLabel(totalMinutes)
        }

        // Enforce Worked + Idle + Down <= 12 hours
        if (
          field === "firstHalfStart" ||
          field === "firstHalfEnd" ||
          field === "secondHalfStart" ||
          field === "secondHalfEnd" ||
          field === "nightFirstHalfStart" ||
          field === "nightFirstHalfEnd" ||
          field === "nightSecondHalfStart" ||
          field === "nightSecondHalfEnd" ||
          field === "idleHrs" ||
          field === "downHrs"
        ) {
          const totalHours = getTotalHoursForRow(next)
          if (totalHours > 12 + 1e-6) {
            window.alert("Worked Hrs + Idle Hrs + Down Hrs cannot be more than 12 hours for a day.")
            return r
          }
        }

        return next
      })
      const updatedLast = nextRows[nextRows.length - 1]
      if (updatedLast?.id === id && rowHasAnyData(updatedLast)) {
        return [...nextRows, newUtilRow()]
      }
      return nextRows
    })
  }

  /* cell input class — slightly compact for more visible rows */
  const cellInput = "h-6 border-0 rounded-none px-1 text-xs focus-visible:ring-0 focus-visible:ring-offset-0 w-full bg-transparent"
  const cellSelect = "[&_button]:h-6 [&_button]:min-h-6 [&_button]:text-xs [&_button]:rounded-none [&_button]:px-1 [&_button]:whitespace-nowrap"
  /** Invalid if non-empty and not a non-negative number */
  const isInvalidHours = (val: string) => val.trim() !== "" && (Number.isNaN(parseFloat(val)) || parseFloat(val) < 0)

  const handleZeroFocus = (rowId: string, field: keyof UtilRow, current: string) => {
    if (current === "0" || current === "0.0" || current === "0.00" || current === "0:00") {
      updateRow(rowId, field, "")
    }
  }

  const getWorkedHoursFromRow = (row: UtilRow): number => {
    const m1 =
      row.firstHalfStart && row.firstHalfEnd
        ? timeDurationMinutes(row.firstHalfStart, row.firstHalfEnd)
        : 0
    const m2 =
      row.secondHalfStart && row.secondHalfEnd
        ? timeDurationMinutes(row.secondHalfStart, row.secondHalfEnd)
        : 0
    const m3 =
      row.nightFirstHalfStart && row.nightFirstHalfEnd
        ? timeDurationMinutes(row.nightFirstHalfStart, row.nightFirstHalfEnd)
        : 0
    const m4 =
      row.nightSecondHalfStart && row.nightSecondHalfEnd
        ? timeDurationMinutes(row.nightSecondHalfStart, row.nightSecondHalfEnd)
        : 0
    const totalMinutes = Math.max(0, m1) + Math.max(0, m2) + Math.max(0, m3) + Math.max(0, m4)
    return totalMinutes / 60
  }

  const getTotalHoursForRow = (row: UtilRow): number => {
    const worked = getWorkedHoursFromRow(row)
    const idle = parseFloat(row.idleHrs || "0") || 0
    const down = parseFloat(row.downHrs || "0") || 0
    return worked + idle + down
  }

  const handleTimeChange = (
    rowId: string,
    field:
      | "firstHalfStart"
      | "firstHalfEnd"
      | "secondHalfStart"
      | "secondHalfEnd"
      | "nightFirstHalfStart"
      | "nightFirstHalfEnd"
      | "nightSecondHalfStart"
      | "nightSecondHalfEnd",
    half: "first" | "second" | "nightFirst" | "nightSecond",
    rawValue: string
  ) => {
    const value = rawValue

    const row = rows.find((r) => r.id === rowId)
    if (row && value) {
      const start = half === "first"
        ? (field === "firstHalfStart" ? value : row.firstHalfStart)
        : half === "second"
          ? (field === "secondHalfStart" ? value : row.secondHalfStart)
          : half === "nightFirst"
            ? (field === "nightFirstHalfStart" ? value : row.nightFirstHalfStart)
            : (field === "nightSecondHalfStart" ? value : row.nightSecondHalfStart)
      const end = half === "first"
        ? (field === "firstHalfEnd" ? value : row.firstHalfEnd)
        : half === "second"
          ? (field === "secondHalfEnd" ? value : row.secondHalfEnd)
          : half === "nightFirst"
            ? (field === "nightFirstHalfEnd" ? value : row.nightFirstHalfEnd)
            : (field === "nightSecondHalfEnd" ? value : row.nightSecondHalfEnd)
      const bucket: HalfBucket =
        half === "first" ? "dayFirst" :
        half === "second" ? "daySecond" :
        half === "nightFirst" ? "nightFirst" :
        "nightSecond"
      if (start && end && !isEndAfterStart(bucket, start, end)) {
        window.alert("End time must be after start time.")
        updateRow(rowId, field, "")
        return
      }
    }

    updateRow(rowId, field, value)
  }

  const formatPreviewDate = (iso: string) => {
    if (!iso) return "—"
    const d = new Date(iso)
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  const recordedByLabel = recordedBy || "—"
  const checkedByLabel = checkedBy === "c2" ? "Supervisor A" : checkedBy === "c3" ? "Supervisor B" : "—"

  const handleSubmitRegister = () => {
    if (!header.project.trim()) {
      window.alert("Please select project before submitting.")
      return
    }
    if (!recordedBy.trim()) {
      window.alert("Recorded by is required.")
      return
    }
    setPreviewOpen(true)
  }

  /** Rows per A4 page — ~22 rows fit with header/footer */
  const ROWS_PER_PAGE = 22
  const previewPages = Math.ceil(Math.max(1, rows.length) / ROWS_PER_PAGE)

  const previewTotals = (() => {
    let worked = 0
    let idle = 0
    let down = 0
    let revenue = 0
    for (const r of rows) {
      if (!r.assetId) continue
      const workedHr =
        (r.firstHalfStart && r.firstHalfEnd ? timeDurationHours(r.firstHalfStart, r.firstHalfEnd) : 0) +
        (r.secondHalfStart && r.secondHalfEnd ? timeDurationHours(r.secondHalfStart, r.secondHalfEnd) : 0) +
        (r.nightFirstHalfStart && r.nightFirstHalfEnd ? timeDurationHours(r.nightFirstHalfStart, r.nightFirstHalfEnd) : 0) +
        (r.nightSecondHalfStart && r.nightSecondHalfEnd ? timeDurationHours(r.nightSecondHalfStart, r.nightSecondHalfEnd) : 0)
      const idleHr = parseFloat(r.idleHrs || "0") || 0
      const downHr = parseFloat(r.downHrs || "0") || 0
      const rate = parseFloat(r.rateOp || "0") || 0
      worked += workedHr
      idle += idleHr
      down += downHr
      revenue += rate * workedHr
    }
    return {
      worked,
      idle,
      down,
      revenue,
    }
  })()

  const handleDownloadPdf = async () => {
    if (typeof window === "undefined") return
    if (pdfDownloading) return
    setPdfDownloading(true)
    try {
      const root = document.getElementById("utilization-preview-print")
      if (!root) throw new Error("Preview not ready")
      const pages = Array.from(root.querySelectorAll<HTMLElement>(".a4-page"))
      if (!pages.length) throw new Error("No pages to export")

      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ])

      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4", compress: false })
      const pageW = 297
      const pageH = 210

      for (let i = 0; i < pages.length; i++) {
        const el = pages[i]
        const canvas = await html2canvas(el, {
          scale: 4,
          useCORS: true,
          backgroundColor: "#ffffff",
        })
        const imgData = canvas.toDataURL("image/png")
        if (i > 0) doc.addPage()
        doc.addImage(imgData, "PNG", 0, 0, pageW, pageH)
      }

      const date = (header.gcDate || new Date().toISOString().slice(0, 10)).replaceAll("/", "-")
      doc.save(`equipment-utilization-${date}.pdf`)
    } catch (e) {
      console.error(e)
      window.alert("Failed to download PDF. Please try again.")
    } finally {
      setPdfDownloading(false)
    }
  }

  return (
    <div id="form-print-area" className="w-full min-w-0 h-full min-h-0 flex flex-col p-0 m-0 overflow-hidden">
      <div ref={pdfRef} className="w-full min-w-0 flex-1 min-h-0 flex flex-col p-0 m-0 overflow-hidden">
        {/* Preview overlay — A4 report format with logo, paginated */}
        {previewOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-2 bg-slate-950/65 backdrop-blur-md" role="dialog" aria-modal="true">
            <Card
              className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-emerald-200/80 ring-1 ring-emerald-100"
              style={{
                width: "297mm",
                maxWidth: "100%",
                maxHeight: "98vh",
              }}
            >
              <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-emerald-300 bg-gradient-to-r from-[#137638] via-emerald-700 to-[#137638]">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-200" />
                  <span className="text-sm font-semibold text-white tracking-wide">Preview — A4 Report</span>
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
              <CardContent id="utilization-preview-print" className="overflow-y-auto flex-1 p-0 bg-white">
                <style jsx global>{`
                  @media print {
                    @page {
                      size: A4 landscape;
                      margin: 0;
                    }
                    .no-print {
                      display: none !important;
                    }
                    body * {
                      visibility: hidden !important;
                    }
                    #utilization-preview-print,
                    #utilization-preview-print * {
                      visibility: visible !important;
                    }
                    #utilization-preview-print {
                      position: absolute !important;
                      left: 0 !important;
                      top: 0 !important;
                      width: 297mm !important;
                      padding: 0 !important;
                      margin: 0 !important;
                      overflow: visible !important;
                      background: white !important;
                    }
                    .a4-page {
                      width: 297mm !important;
                      min-height: 210mm !important;
                      height: 210mm !important;
                      page-break-after: always;
                      break-after: page;
                      box-shadow: none !important;
                      margin: 0 !important;
                    }
                  }
                `}</style>
                {Array.from({ length: previewPages }).map((_, pageIdx) => {
                  const start = pageIdx * ROWS_PER_PAGE
                  const pageRows = rows.slice(start, start + ROWS_PER_PAGE)
                  return (
                    <div
                      key={pageIdx}
                      className="a4-page bg-white mx-auto my-0 shadow-lg"
                      style={{ width: "297mm", minHeight: "210mm", padding: "10mm", boxSizing: "border-box" }}
                    >
                      {/* Standard header with logo — each page */}
                      <div className="grid grid-cols-[70px_1fr_120px] border-b-2 border-slate-800 mb-4">
                        <div className="relative h-14 flex items-center justify-center border-r-2 border-slate-800 pr-2">
                          <Image src="/ecwc png logo.png" alt="ECWC Logo" width={56} height={56} className="object-contain" />
                        </div>
                        <div className="flex flex-col justify-center px-4 text-center border-r-2 border-slate-800">
                          <p className="text-sm font-bold text-slate-900">ETHIOPIAN CONSTRUCTION WORKS CORPORATION</p>
                          <p className="text-xs font-semibold text-slate-700 mt-0.5">EQUIPMENT DAILY TIME UTILIZATION REGISTER</p>
                        </div>
                        <div className="flex flex-col justify-center px-3 text-[10px] text-slate-700 font-medium">
                          <p><b>Document No.</b></p>
                          <p>OF/ECWC/xxx</p>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-slate-600 mb-3">
                        <span>Project: {header.project || "—"}</span>
                        <span>G.C. Date: {formatPreviewDate(header.gcDate)}</span>
                        <span>Ref: {header.refNo || "—"}</span>
                      </div>
                      <table className="w-full border-collapse text-[10px]">
                        <thead>
                          <tr className="bg-emerald-700 text-emerald-50">
                            <th className="border border-emerald-600 px-1.5 py-1.5 text-left font-semibold">No</th>
                            <th className="border border-emerald-600 px-1.5 py-1.5 text-left font-semibold">Category</th>
                            <th className="border border-emerald-600 px-1.5 py-1.5 text-left font-semibold">Description</th>
                            <th className="border border-emerald-600 px-1.5 py-1.5 text-left font-semibold">Plate No</th>
                            <th className="border border-emerald-600 px-1.5 py-1.5 text-left font-semibold">Status</th>
                            <th className="border border-emerald-600 px-1.5 py-1.5 text-center font-semibold">Worked Hr</th>
                            <th className="border border-emerald-600 px-1.5 py-1.5 text-center font-semibold">Idle Hr</th>
                            <th className="border border-emerald-600 px-1.5 py-1.5 text-center font-semibold">Down Hr</th>
                            <th className="border border-emerald-600 px-1.5 py-1.5 text-center font-semibold bg-emerald-800">Total revenue (Birr)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pageRows.map((row, idx) => {
                            const worked =
                              (row.firstHalfStart && row.firstHalfEnd ? timeDurationHours(row.firstHalfStart, row.firstHalfEnd) : 0) +
                              (row.secondHalfStart && row.secondHalfEnd ? timeDurationHours(row.secondHalfStart, row.secondHalfEnd) : 0) +
                              (row.nightFirstHalfStart && row.nightFirstHalfEnd ? timeDurationHours(row.nightFirstHalfStart, row.nightFirstHalfEnd) : 0) +
                              (row.nightSecondHalfStart && row.nightSecondHalfEnd ? timeDurationHours(row.nightSecondHalfStart, row.nightSecondHalfEnd) : 0)
                            const idle = parseFloat(row.idleHrs) || 0
                            const down = parseFloat(row.downHrs) || 0
                            const rate = parseFloat(row.rateOp || "0") || 0
                            const revenue = (rate * worked).toFixed(2)
                            return (
                              <tr key={row.id} className="bg-white hover:bg-slate-50/50">
                                <td className="border border-slate-300 px-1.5 py-1 text-center">{start + idx + 1}</td>
                                <td className="border border-slate-300 px-1.5 py-1">{row.category || "—"}</td>
                                <td className="border border-slate-300 px-1.5 py-1">{row.description || "—"}</td>
                                <td className="border border-slate-300 px-1.5 py-1">{row.plateNo || "—"}</td>
                                <td className="border border-slate-300 px-1.5 py-1">{row.status || "—"}</td>
                                <td className="border border-slate-300 px-1.5 py-1 text-center">{row.workedHrs}</td>
                                <td className="border border-slate-300 px-1.5 py-1 text-center">{row.idleHrs}</td>
                                <td className="border border-slate-300 px-1.5 py-1 text-center">{row.downHrs}</td>
                                <td className="border border-slate-300 px-1.5 py-1 text-center bg-amber-50 font-semibold tabular-nums">{revenue}</td>
                              </tr>
                            )
                          })}
                          {pageIdx === previewPages - 1 && (
                            <tr className="bg-slate-50">
                              <td className="border border-slate-300 px-1.5 py-1 font-bold text-right" colSpan={5}>
                                TOTAL
                              </td>
                              <td className="border border-slate-300 px-1.5 py-1 text-center font-bold tabular-nums">
                                {previewTotals.worked.toFixed(2)}
                              </td>
                              <td className="border border-slate-300 px-1.5 py-1 text-center font-bold tabular-nums">
                                {previewTotals.idle.toFixed(2)}
                              </td>
                              <td className="border border-slate-300 px-1.5 py-1 text-center font-bold tabular-nums">
                                {previewTotals.down.toFixed(2)}
                              </td>
                              <td className="border border-slate-300 px-1.5 py-1 text-center font-bold tabular-nums bg-amber-50">
                                {previewTotals.revenue.toFixed(2)}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                      {pageIdx < previewPages - 1 ? (
                        <p className="text-[10px] text-slate-500 mt-4 text-center">— Continued on next page —</p>
                      ) : (
                        <div className="mt-6 pt-4 border-t border-slate-300 flex justify-between text-[10px]">
                          <span>Recorded by: {recordedByLabel}</span>
                          <span>Checked by: {checkedByLabel}</span>
                        </div>
                      )}
                      <p className="text-[9px] text-slate-400 mt-2 text-right">Page {pageIdx + 1} of {previewPages}</p>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>
        )}

        <Card className="w-full min-w-0 flex-1 min-h-0 border-0 shadow-none rounded-none bg-slate-50/50 overflow-hidden flex flex-col">

          <CardContent className="px-4 pb-4 pt-0 bg-white min-w-0 flex flex-col flex-1 min-h-0 overflow-hidden">

            {/* Document info row — compact, attractive */}
            <div className="shrink-0 py-3">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 bg-transparent rounded-none p-0 border-0 shadow-none">
              <div className="flex items-center gap-2 flex-1 min-w-0 max-w-full">
                <Label className="text-xs font-semibold text-slate-700 shrink-0 w-16">Project</Label>
                <Select
                  value={header.project || "__none__"}
                  onValueChange={(v) => {
                    const nextProject = v === "__none__" ? "" : v
                    // If project is actually changing and there is data in any row,
                    // reset all equipment rows so user can freely switch project.
                    const hasRowData = rows.some((r) => rowHasAnyData(r))
                    setHeader((p) => ({ ...p, project: nextProject }))
                    if (hasRowData) {
                      setRows([newUtilRow()])
                    }
                    // Clear equipment-related UI state so comboboxes refresh correctly
                    setEquipmentOptions([])
                    setOpenEquipmentRowId(null)
                    setEquipmentSearch("")
                  }}
                  className="[&_button]:h-9 [&_button]:text-sm [&_button]:px-3 [&_button]:rounded-lg [&_button]:border-slate-300 [&_button]:hover:bg-slate-50 min-w-[320px] flex-1 max-w-[640px]"
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
                <Label className="text-xs font-semibold text-slate-700 shrink-0">Date</Label>
                <Input
                  type="date"
                  className="h-9 border border-slate-300 rounded-lg px-3 text-sm w-40 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  value={header.gcDate}
                  onChange={(e) => setHeader((p) => ({ ...p, gcDate: e.target.value }))}
                />
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs font-semibold text-slate-700 shrink-0">Ref.No.</Label>
                <Input className="h-9 border border-slate-300 rounded-lg px-3 text-sm w-40 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200" value={header.refNo} onChange={(e) => setHeader((p) => ({ ...p, refNo: e.target.value }))} />
              </div>
            </div>
            </div>

            {/* Equipment entries — scrollable table */}
            <div className="w-full border border-slate-300 rounded-xl overflow-hidden flex-1 min-h-0 flex flex-col shadow-[0_10px_30px_-18px_rgba(2,6,23,0.30)] bg-white">
              <div className="overflow-auto flex-1 min-h-0">
                <table className="text-xs border-collapse min-w-[1540px] w-full">
                  <thead className="sticky top-0 z-[1] bg-gradient-to-r from-[#137638] via-emerald-700 to-[#137638] shadow-[inset_0_-1px_0_rgba(255,255,255,0.12)]">
                    <tr className="bg-gradient-to-r from-[#137638] via-emerald-700 to-[#137638]">
                      <th className="px-1 py-2 text-center font-semibold tracking-wide text-emerald-50 whitespace-nowrap w-8" rowSpan={2}></th>
                      <th className="px-1.5 py-2 text-center font-semibold tracking-wide text-emerald-50/95 whitespace-nowrap w-8" rowSpan={2}>No</th>
                      <th className="px-2 py-2 text-left font-semibold tracking-wide text-emerald-50/95 whitespace-nowrap min-w-[120px] w-[120px]" rowSpan={2}>Category</th>
                      <th className="px-2 py-2 text-left font-semibold tracking-wide text-emerald-50/95 whitespace-nowrap min-w-[140px] w-[140px]" rowSpan={2}>Description</th>
                      <th className="px-2 py-2 text-left font-semibold tracking-wide text-emerald-50/95 whitespace-nowrap min-w-[90px] w-[90px]" rowSpan={2}>Asset No</th>
                      <th className="px-2 py-2 text-left font-semibold tracking-wide text-emerald-50/95 whitespace-nowrap min-w-[100px] w-[100px]" rowSpan={2}>Plate No</th>
                      <th className="px-2 py-2 text-left font-semibold tracking-wide text-emerald-50/95 whitespace-nowrap min-w-[80px] w-[80px]" rowSpan={2}>Status</th>
                      <th className="px-1.5 py-2 text-left font-semibold tracking-wide text-emerald-50/95 whitespace-nowrap min-w-[70px] w-[70px] border-r-2 border-r-emerald-200/80" rowSpan={2}>Rate</th>
                      <th className="px-2 py-2 text-center font-semibold tracking-wide text-emerald-50/95 whitespace-nowrap border-l-2 border-l-emerald-200/80" colSpan={2}>Day 1st Half Hr</th>
                      <th className="px-1.5 py-2 text-center font-semibold tracking-wide text-emerald-50/95 whitespace-nowrap border-l border-emerald-400/40" colSpan={2}>Day 2nd Half Hr</th>
                      <th className="px-1.5 py-2 text-center font-semibold tracking-wide text-emerald-50/95 whitespace-nowrap border-l border-emerald-400/40" colSpan={2}>Night 1st Half Hr</th>
                      <th className="px-1.5 py-2 text-center font-semibold tracking-wide text-emerald-50/95 whitespace-nowrap border-l border-emerald-400/40" colSpan={2}>Night 2nd Half Hr</th>
                      <th className="px-1.5 py-2 text-center font-semibold tracking-wide text-emerald-50/95 whitespace-nowrap border-l border-emerald-400/40" rowSpan={2}>Worked Hrs</th>
                      <th className="px-1.5 py-2 text-center font-semibold tracking-wide text-emerald-50/95 whitespace-nowrap" rowSpan={2}>Idle Hrs</th>
                      <th className="px-1.5 py-2 text-center font-semibold tracking-wide text-emerald-50/95 whitespace-nowrap" rowSpan={2}>Idle Reason</th>
                      <th className="px-1.5 py-2 text-center font-semibold tracking-wide text-emerald-50/95 whitespace-nowrap" rowSpan={2}>Down Hrs</th>
                      <th className="px-1.5 py-2 text-center font-semibold tracking-wide text-emerald-50/95 whitespace-nowrap" rowSpan={2}>Down Reason</th>
                      <th className="px-1.5 py-2 text-center font-semibold tracking-wide text-emerald-50/95 whitespace-nowrap border-l border-emerald-400/40" colSpan={3}>Engine Hr/Km</th>
                      <th className="px-1.5 py-2 text-center font-semibold tracking-wide text-emerald-50/95 whitespace-nowrap" rowSpan={2}>Fuel in Liters</th>
                      <th className="px-1.5 py-2 text-center font-semibold tracking-wide text-emerald-50/95 whitespace-nowrap" rowSpan={2}>Hr/Km Reading</th>
                      <th className="px-1.5 py-2 text-center font-semibold tracking-wide text-emerald-50/95 whitespace-nowrap border-l border-emerald-400/40" colSpan={2}>Operator</th>
                      <th className="px-1.5 py-2 text-center font-semibold tracking-wide text-emerald-50/95 whitespace-nowrap" rowSpan={2}>Type of Work</th>
                    </tr>
                    <tr className="bg-emerald-900/20">
                      <th className="px-1 py-1 text-center text-emerald-100/90 whitespace-nowrap border-l-2 border-l-emerald-200/80">Start</th>
                      <th className="px-1 py-1 text-center text-emerald-100/90 whitespace-nowrap">End</th>
                      <th className="px-1 py-1 text-center text-emerald-100/90 whitespace-nowrap border-l border-emerald-400/40">Start</th>
                      <th className="px-1 py-1 text-center text-emerald-100/90 whitespace-nowrap">End</th>
                      <th className="px-1 py-1 text-center text-emerald-100/90 whitespace-nowrap border-l border-emerald-400/40">Start</th>
                      <th className="px-1 py-1 text-center text-emerald-100/90 whitespace-nowrap">End</th>
                      <th className="px-1 py-1 text-center text-emerald-100/90 whitespace-nowrap border-l border-emerald-400/40">Start</th>
                      <th className="px-1 py-1 text-center text-emerald-100/90 whitespace-nowrap">End</th>
                      <th className="px-1 py-1 text-center text-emerald-100/90 whitespace-nowrap border-l border-emerald-400/40">Initial</th>
                      <th className="px-1 py-1 text-center text-emerald-100/90 whitespace-nowrap">Final</th>
                      <th className="px-1 py-1 text-center text-emerald-100/90 whitespace-nowrap">Diff</th>
                      <th className="px-1 py-1 text-center text-emerald-100/90 whitespace-nowrap border-l border-emerald-400/40">1st Half</th>
                      <th className="px-1 py-1 text-center text-emerald-100/90 whitespace-nowrap">2nd Half</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, index) => {
                      const rowDisabled = !isRowEditable(row)
                      return (
                      <tr
                        key={row.id}
                        className={cn(
                          "transition-colors",
                          rowDisabled
                            ? "bg-amber-50/80 hover:bg-amber-50"
                            : index % 2 === 0
                              ? "bg-white hover:bg-emerald-50/50"
                              : "bg-emerald-50/20 hover:bg-emerald-50/60"
                        )}
                      >
                        <td className="border border-slate-200 p-0 text-center align-middle w-8">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-100"
                            onClick={() => removeRow(row.id)}
                            disabled={rows.length <= 1}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </td>
                        <td className="border border-slate-200 p-0 text-center text-[11px] text-slate-600 align-middle w-8 font-medium">
                          {index + 1}
                        </td>
                        <td className="border border-zinc-200 p-0 min-w-[120px] w-[120px]">
                          <Input
                            className={cn(cellInput, "bg-zinc-50")}
                            value={row.category}
                            readOnly
                            title="Auto-filled from selected project"
                          />
                        </td>
                        <td className="border border-zinc-200 p-0 min-w-[140px] w-[140px]">
                          <Input className={cn(cellInput, "bg-zinc-50")} value={row.description} readOnly />
                        </td>
                        <td className="border border-zinc-200 p-0 min-w-[90px] w-[90px]">
                          <Input className={cn(cellInput, "bg-zinc-50")} value={row.assetNo} readOnly />
                        </td>
                        <td className="border border-zinc-200 p-0 min-w-[100px] w-[100px]">
                          <Input className={cn(cellInput, "bg-zinc-50")} value={row.plateNo} readOnly />
                        </td>
                        <td className="border border-zinc-200 p-0 min-w-[80px] w-[80px]">
                          <Input className={cn(cellInput, "bg-zinc-50")} value={row.status} readOnly />
                        </td>
                        <td className="border border-zinc-200 p-0 min-w-[70px] w-[70px]">
                          <Input
                            className={cn(cellInput, rowDisabled && "bg-zinc-100 cursor-not-allowed")}
                            value={row.rateOp}
                            onChange={(e) => !rowDisabled && updateRow(row.id, "rateOp", e.target.value)}
                            placeholder="—"
                            readOnly={rowDisabled}
                            title="Operational rate (Birr/hr)"
                          />
                        </td>
                        <td className="border border-zinc-200 p-0">
                          <Select
                            value={row.firstHalfStart || "__none__"}
                            onValueChange={(v) =>
                              handleTimeChange(
                                row.id,
                                "firstHalfStart",
                                "first",
                                v === "__none__" ? "" : v
                              )
                            }
                            disabled={rowDisabled}
                            className={cellSelect}
                          >
                            <SelectItem value="__none__">—</SelectItem>
                            {generateHalfOptions("dayFirst").map((t) => (
                              <SelectItem key={t} value={t}>
                                {formatTimeLabel(t)}
                              </SelectItem>
                            ))}
                          </Select>
                        </td>
                        <td className="border border-zinc-200 p-0">
                          <Select
                            value={row.firstHalfEnd || "__none__"}
                            onValueChange={(v) =>
                              handleTimeChange(
                                row.id,
                                "firstHalfEnd",
                                "first",
                                v === "__none__" ? "" : v
                              )
                            }
                            disabled={rowDisabled}
                            className={cellSelect}
                          >
                            <SelectItem value="__none__">—</SelectItem>
                            {generateHalfOptions("dayFirst").map((t) => (
                              <SelectItem key={t} value={t}>
                                {formatTimeLabel(t)}
                              </SelectItem>
                            ))}
                          </Select>
                        </td>
                        <td className="border border-zinc-200 p-0">
                          <Select
                            value={row.secondHalfStart || "__none__"}
                            onValueChange={(v) =>
                              handleTimeChange(
                                row.id,
                                "secondHalfStart",
                                "second",
                                v === "__none__" ? "" : v
                              )
                            }
                            disabled={rowDisabled}
                            className={cellSelect}
                          >
                            <SelectItem value="__none__">—</SelectItem>
                            {generateHalfOptions("daySecond").map((t) => (
                              <SelectItem key={t} value={t}>
                                {formatTimeLabel(t)}
                              </SelectItem>
                            ))}
                          </Select>
                        </td>
                        <td className="border border-zinc-200 p-0">
                          <Select
                            value={row.secondHalfEnd || "__none__"}
                            onValueChange={(v) =>
                              handleTimeChange(
                                row.id,
                                "secondHalfEnd",
                                "second",
                                v === "__none__" ? "" : v
                              )
                            }
                            disabled={rowDisabled}
                            className={cellSelect}
                          >
                            <SelectItem value="__none__">—</SelectItem>
                            {generateHalfOptions("daySecond").map((t) => (
                              <SelectItem key={t} value={t}>
                                {formatTimeLabel(t)}
                              </SelectItem>
                            ))}
                          </Select>
                        </td>
                        <td className="border border-zinc-200 p-0">
                          <Select
                            value={row.nightFirstHalfStart || "__none__"}
                            onValueChange={(v) =>
                              handleTimeChange(
                                row.id,
                                "nightFirstHalfStart",
                                "nightFirst",
                                v === "__none__" ? "" : v
                              )
                            }
                            disabled={rowDisabled}
                            className={cellSelect}
                          >
                            <SelectItem value="__none__">—</SelectItem>
                            {generateHalfOptions("nightFirst").map((t) => (
                              <SelectItem key={t} value={t}>
                                {formatTimeLabel(t)}
                              </SelectItem>
                            ))}
                          </Select>
                        </td>
                        <td className="border border-zinc-200 p-0">
                          <Select
                            value={row.nightFirstHalfEnd || "__none__"}
                            onValueChange={(v) =>
                              handleTimeChange(
                                row.id,
                                "nightFirstHalfEnd",
                                "nightFirst",
                                v === "__none__" ? "" : v
                              )
                            }
                            disabled={rowDisabled}
                            className={cellSelect}
                          >
                            <SelectItem value="__none__">—</SelectItem>
                            {generateHalfOptions("nightFirst").map((t) => (
                              <SelectItem key={t} value={t}>
                                {formatTimeLabel(t)}
                              </SelectItem>
                            ))}
                          </Select>
                        </td>
                        <td className="border border-zinc-200 p-0">
                          <Select
                            value={row.nightSecondHalfStart || "__none__"}
                            onValueChange={(v) =>
                              handleTimeChange(
                                row.id,
                                "nightSecondHalfStart",
                                "nightSecond",
                                v === "__none__" ? "" : v
                              )
                            }
                            disabled={rowDisabled}
                            className={cellSelect}
                          >
                            <SelectItem value="__none__">—</SelectItem>
                            {generateHalfOptions("nightSecond").map((t) => (
                              <SelectItem key={t} value={t}>
                                {formatTimeLabel(t)}
                              </SelectItem>
                            ))}
                          </Select>
                        </td>
                        <td className="border border-zinc-200 p-0">
                          <Select
                            value={row.nightSecondHalfEnd || "__none__"}
                            onValueChange={(v) =>
                              handleTimeChange(
                                row.id,
                                "nightSecondHalfEnd",
                                "nightSecond",
                                v === "__none__" ? "" : v
                              )
                            }
                            disabled={rowDisabled}
                            className={cellSelect}
                          >
                            <SelectItem value="__none__">—</SelectItem>
                            {generateHalfOptions("nightSecond").map((t) => (
                              <SelectItem key={t} value={t}>
                                {formatTimeLabel(t)}
                              </SelectItem>
                            ))}
                          </Select>
                        </td>
                        <td className="border border-zinc-200 p-0"><Input className={cn(cellInput, "bg-zinc-50")} value={row.workedHrs} readOnly title="Auto-calculated from 1st/2nd half and night shift times" /></td>
                        <td className="border border-zinc-200 p-0">
                          <Input
                            className={cn(cellInput, isInvalidHours(row.idleHrs) && "ring-1 ring-red-500 rounded", rowDisabled && "bg-zinc-100 cursor-not-allowed")}
                            value={row.idleHrs}
                            onChange={(e) => !rowDisabled && updateRow(row.id, "idleHrs", e.target.value)}
                            onFocus={(e) => !rowDisabled && handleZeroFocus(row.id, "idleHrs", e.target.value)}
                            readOnly={rowDisabled}
                            title={isInvalidHours(row.idleHrs) ? "Enter a valid number ≥ 0" : undefined}
                          />
                        </td>
                        <td className="border border-zinc-200 p-0">
                          <Select
                            value={row.idleReason || "__none__"}
                            onValueChange={(v) =>
                              !rowDisabled && updateRow(row.id, "idleReason", v === "__none__" ? "" : v)
                            }
                            disabled={rowDisabled}
                            className={cellSelect}
                          >
                            <SelectItem value="__none__">—</SelectItem>
                            {IDLE_REASONS.map((r) => (
                              <SelectItem key={r.value} value={r.value}>
                                {r.value}
                              </SelectItem>
                            ))}
                          </Select>
                        </td>
                        <td className="border border-zinc-200 p-0">
                          <Input
                            className={cn(cellInput, isInvalidHours(row.downHrs) && "ring-1 ring-red-500 rounded", rowDisabled && "bg-zinc-100 cursor-not-allowed")}
                            value={row.downHrs}
                            onChange={(e) => !rowDisabled && updateRow(row.id, "downHrs", e.target.value)}
                            onFocus={(e) => !rowDisabled && handleZeroFocus(row.id, "downHrs", e.target.value)}
                            readOnly={rowDisabled}
                            title={isInvalidHours(row.downHrs) ? "Enter a valid number ≥ 0" : undefined}
                          />
                        </td>
                        <td className="border border-zinc-200 p-0">
                          <Select
                            value={row.downReason || "__none__"}
                            onValueChange={(v) =>
                              !rowDisabled && updateRow(row.id, "downReason", v === "__none__" ? "" : v)
                            }
                            disabled={rowDisabled}
                            className={cellSelect}
                          >
                            <SelectItem value="__none__">—</SelectItem>
                            {DOWN_REASONS.map((r) => (
                              <SelectItem key={r.value} value={r.value}>
                                {r.value}
                              </SelectItem>
                            ))}
                          </Select>
                        </td>
                        <td className="border border-zinc-200 p-0 min-w-[90px] w-[100px]">
                          <Input
                            className={cn(cellInput, rowDisabled && "bg-zinc-100 cursor-not-allowed")}
                            value={row.engineInitial}
                            onChange={(e) => !rowDisabled && updateRow(row.id, "engineInitial", e.target.value)}
                            onFocus={(e) => !rowDisabled && handleZeroFocus(row.id, "engineInitial", e.target.value)}
                            readOnly={rowDisabled}
                          />
                        </td>
                        <td className="border border-zinc-200 p-0 min-w-[90px] w-[100px]">
                          <Input
                            className={cn(cellInput, rowDisabled && "bg-zinc-100 cursor-not-allowed")}
                            value={row.engineFinal}
                            onChange={(e) => !rowDisabled && updateRow(row.id, "engineFinal", e.target.value)}
                            onFocus={(e) => !rowDisabled && handleZeroFocus(row.id, "engineFinal", e.target.value)}
                            readOnly={rowDisabled}
                          />
                        </td>
                        <td className="border border-zinc-200 p-0 min-w-[80px] w-[90px]"><Input className={`${cellInput} bg-zinc-50`} value={row.engineDiff} readOnly /></td>
                        <td className="border border-zinc-200 p-0">
                          <Input
                            className={cn(cellInput, rowDisabled && "bg-zinc-100 cursor-not-allowed")}
                            value={row.fuelLtrs}
                            onChange={(e) => !rowDisabled && updateRow(row.id, "fuelLtrs", e.target.value)}
                            onFocus={(e) => !rowDisabled && handleZeroFocus(row.id, "fuelLtrs", e.target.value)}
                            readOnly={rowDisabled}
                          />
                        </td>
                        <td className="border border-zinc-200 p-0">
                          <Input
                            className={cn(cellInput, rowDisabled && "bg-zinc-100 cursor-not-allowed")}
                            value={row.fuelReading}
                            onChange={(e) => !rowDisabled && updateRow(row.id, "fuelReading", e.target.value)}
                            onFocus={(e) => !rowDisabled && handleZeroFocus(row.id, "fuelReading", e.target.value)}
                            readOnly={rowDisabled}
                          />
                        </td>
                        <td className="border border-zinc-200 p-0 min-w-[120px] w-[140px]"><Input className={cn(cellInput, rowDisabled && "bg-zinc-100 cursor-not-allowed")} value={row.operatorFirstHalf} onChange={(e) => !rowDisabled && updateRow(row.id, "operatorFirstHalf", e.target.value)} readOnly={rowDisabled} /></td>
                        <td className="border border-zinc-200 p-0 min-w-[120px] w-[140px]"><Input className={cn(cellInput, rowDisabled && "bg-zinc-100 cursor-not-allowed")} value={row.operatorSecondHalf} onChange={(e) => !rowDisabled && updateRow(row.id, "operatorSecondHalf", e.target.value)} readOnly={rowDisabled} /></td>
                        <td className="border border-zinc-200 p-0 min-w-[200px] w-[240px]"><Input className={cn(cellInput, rowDisabled && "bg-zinc-100 cursor-not-allowed")} value={row.typeOfWork} onChange={(e) => !rowDisabled && updateRow(row.id, "typeOfWork", e.target.value)} readOnly={rowDisabled} /></td>
                      </tr>
                    )
                    })}
                    {Array.from({ length: Math.max(0, 4 - rows.length) }).map((_, i) => (
                      <tr key={`empty-${i}`} aria-hidden>
                        <td colSpan={24} className="border border-zinc-200 bg-zinc-50/30 h-7" />
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Signature Fields */}
            <div className="shrink-0 mt-4 w-full min-w-0 pt-4 border-t-2 border-emerald-200/80 overflow-hidden">
              <div className="flex items-center justify-between gap-4 px-1">
                <div className="flex items-center gap-2 min-w-[200px]">
                  <Label className="text-sm font-semibold text-slate-900 shrink-0">Recorded by</Label>
                  <Input
                    value={recordedBy || "User"}
                    readOnly
                    className="h-9 min-w-[220px] border-slate-300 bg-white text-sm font-semibold text-slate-900"
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleSubmitRegister}
                  className="h-9 px-5 bg-[#137638] hover:bg-[#0f6430] text-white"
                >
                  Submit Register
                </Button>
              </div>
            </div>

            {/* Collapsible Legends */}
            <div className="shrink-0 mt-4 w-full rounded-xl border border-slate-300 overflow-hidden shadow-sm bg-white">
              <button
                type="button"
                onClick={() => setLegendsExpanded((p) => !p)}
                className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-white hover:bg-slate-50 text-left text-sm font-semibold text-slate-900 border-b border-slate-200 transition-colors"
              >
                <span>Idle Time Reasons & Down Time Reasons</span>
                {legendsExpanded ? <ChevronUp className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0" />}
              </button>
              {legendsExpanded && (
                <div className="flex flex-wrap items-start gap-6 rounded-b-xl bg-white px-5 py-4">
                  <div className="flex-1 min-w-[140px]">
                    <p className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-2">Idle Time Reasons</p>
                    <div className="space-y-1 text-xs text-slate-900">
                      {IDLE_REASONS.slice(0, 4).map((r) => (
                        <p key={r.value}><span className="font-bold text-slate-900">{r.value}</span> — {r.full}</p>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 min-w-[140px]">
                    <p className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-2">Idle Time Reasons</p>
                    <div className="space-y-1 text-xs text-slate-900">
                      {IDLE_REASONS.slice(4, 8).map((r) => (
                        <p key={r.value}><span className="font-bold text-slate-900">{r.value}</span> — {r.full}</p>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 min-w-[140px]">
                    <p className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-2">Idle Time Reasons</p>
                    <div className="space-y-1 text-xs text-slate-900">
                      {IDLE_REASONS.slice(8).map((r) => (
                        <p key={r.value}><span className="font-bold text-slate-900">{r.value}</span> — {r.full}</p>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 min-w-[140px]">
                    <p className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-2">Shifts</p>
                    <div className="text-xs text-slate-900 space-y-1">
                      <p>Day — 1st Half: 6:00 AM – 12:00 PM</p>
                      <p className="ml-6">2nd Half: 12:00 PM – 6:00 PM</p>
                      <p>Night — 1st Half: 11:59 PM – 5:59 AM</p>
                      <p className="ml-6">2nd Half: 6:00 AM – 12:00 PM</p>
                    </div>
                  </div>
                  <div className="flex-1 min-w-[140px]">
                    <p className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-2">Down Time Reasons</p>
                    <div className="space-y-1 text-xs text-slate-900">
                      {DOWN_REASONS.map((r) => (
                        <p key={r.value}><span className="font-bold text-slate-900">{r.value}</span> — {r.full}</p>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
