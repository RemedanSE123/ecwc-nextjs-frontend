"use client"

import { useState, useRef, useEffect, useContext } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectItem } from "@/components/ui/select"
import { Trash2, ChevronDown, ChevronUp, Eye, X, AlertCircle } from "lucide-react"
import { fetchAssetFacets, fetchEquipmentOptions, type EquipmentOption } from "@/lib/api/assets"
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

type ShiftValue = "" | "Day" | "Night"

/** Check if a time is within the allowed range for the given shift and half. */
function isTimeInShiftRange(value: string, shift: ShiftValue, half: "first" | "second"): boolean {
  if (!shift || !value) return false
  const minutes = timeToMinutes(value)

  const DAY_FIRST_MIN = 6 * 60
  const DAY_FIRST_MAX = 12 * 60
  const DAY_SECOND_MIN = 12 * 60
  const DAY_SECOND_MAX = 18 * 60

  const NIGHT_FIRST_EDGE = 23 * 60 + 59 // 23:59
  const NIGHT_FIRST_MAX = 5 * 60 + 59  // 05:59
  const NIGHT_SECOND_MIN = 6 * 60
  const NIGHT_SECOND_MAX = 12 * 60

  if (shift === "Day") {
    if (half === "first") {
      return minutes >= DAY_FIRST_MIN && minutes <= DAY_FIRST_MAX
    }
    return minutes >= DAY_SECOND_MIN && minutes <= DAY_SECOND_MAX
  }

  // Night shift
  if (half === "first") {
    // 11:59 PM–5:59 AM → [23:59, 24:00) U [00:00, 05:59]
    return minutes >= NIGHT_FIRST_EDGE || minutes <= NIGHT_FIRST_MAX
  }
  // Night 2nd half: 6:00 AM–12:00 PM
  return minutes >= NIGHT_SECOND_MIN && minutes <= NIGHT_SECOND_MAX
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

function generateHalfOptions(shift: ShiftValue, half: "first" | "second"): string[] {
  if (!shift) return []

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

  if (shift === "Day") {
    if (half === "first") {
      // 6:00–12:00
      pushRange(6 * 60, 12 * 60, 30)
    } else {
      // 12:00–18:00
      pushRange(12 * 60, 18 * 60, 30)
    }
  } else {
    if (half === "first") {
      // Night 1st half: include 23:59, then 00:00–05:30 and 05:59
      results.push("23:59")
      pushRange(0, 5 * 60 + 30, 30)
      results.push("05:59")
    } else {
      // Night 2nd half: 6:00–12:00
      pushRange(6 * 60, 12 * 60, 30)
    }
  }

  return results
}

/** End must be after start within the same half. Night 1st half: 23:59 is before 00:00–05:59. */
function isEndAfterStart(shift: ShiftValue, half: "first" | "second", startHHMM: string, endHHMM: string): boolean {
  if (!startHHMM || !endHHMM) return true
  const s = timeToMinutes(startHHMM)
  const e = timeToMinutes(endHHMM)

  if (shift === "Day") {
    if (half === "first") return s < e
    return s < e
  }
  // Night
  if (half === "first") {
    const NIGHT_EDGE = 23 * 60 + 59
    const NIGHT_END = 5 * 60 + 59
    if (s >= NIGHT_EDGE) return e <= NIGHT_END
    return e <= NIGHT_END && s < e
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
          className="fixed z-[9999] overflow-y-auto rounded-md border border-zinc-200 bg-white shadow-lg max-h-[200px] min-w-[220px]"
          style={{ top: pos.top, left: pos.left, width: pos.width }}
        >
          <div className="p-1">
            <button
              type="button"
              className={cn(
                "w-full text-left cursor-pointer select-none rounded-sm py-1.5 px-2 text-xs hover:bg-zinc-100 whitespace-nowrap",
                !row.assetId && "bg-zinc-50"
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
  plateNo: string
  status: string
  rate: string
  firstHalfStart: string
  firstHalfEnd: string
  secondHalfStart: string
  secondHalfEnd: string
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
    row.plateNo ||
    row.status ||
    row.firstHalfStart ||
    row.firstHalfEnd ||
    row.secondHalfStart ||
    row.secondHalfEnd ||
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
  const [header, setHeader] = useState({
    project: "",
    gcDate: new Date().toISOString().split("T")[0],
    shift: "" as ShiftValue,
    refNo: "",
  })
  const newUtilRow = (): UtilRow => ({
    id: `r-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    assetId: "",
    category: "",
    description: "",
    plateNo: "",
    status: "",
    rate: "",
    firstHalfStart: "",
    firstHalfEnd: "",
    secondHalfStart: "",
    secondHalfEnd: "",
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
    let cancelled = false
    setLoadingProjects(true)
    fetchAssetFacets()
      .then((data) => {
        if (!cancelled) setProjects(data.project_location ?? [])
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
      plateNo: opt.plate_no ?? "",
      status: opt.status ?? "",
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
              plateNo: option?.plate_no ?? "",
              status: option?.status ?? "",
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
        const timeFieldNames: (keyof UtilRow)[] = ["firstHalfStart", "firstHalfEnd", "secondHalfStart", "secondHalfEnd"]
        if (timeFieldNames.includes(field)) {
          const m1 =
            next.firstHalfStart && next.firstHalfEnd
              ? timeDurationMinutes(next.firstHalfStart, next.firstHalfEnd)
              : 0
          const m2 =
            next.secondHalfStart && next.secondHalfEnd
              ? timeDurationMinutes(next.secondHalfStart, next.secondHalfEnd)
              : 0
          const totalMinutes = Math.max(0, m1) + Math.max(0, m2)
          next.workedHrs = formatMinutesAsLabel(totalMinutes)
        }

        // Enforce Worked + Idle + Down <= 12 hours
        if (
          field === "firstHalfStart" ||
          field === "firstHalfEnd" ||
          field === "secondHalfStart" ||
          field === "secondHalfEnd" ||
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
    const totalMinutes = Math.max(0, m1) + Math.max(0, m2)
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
    field: "firstHalfStart" | "firstHalfEnd" | "secondHalfStart" | "secondHalfEnd",
    half: "first" | "second",
    rawValue: string
  ) => {
    const value = rawValue

    if (!header.shift) {
      if (value) {
        window.alert("Please select Shift (Day/Night) first.")
      }
      updateRow(rowId, field, "")
      return
    }

    if (value && !isTimeInShiftRange(value, header.shift, half)) {
      const msg =
        header.shift === "Day"
          ? half === "first"
            ? "Day shift 1st half time must be between 6:00 AM and 12:00 PM."
            : "Day shift 2nd half time must be between 12:00 PM and 6:00 PM."
          : half === "first"
            ? "Night shift 1st half time must be between 11:59 PM and 5:59 AM."
            : "Night shift 2nd half time must be between 6:00 AM and 12:00 PM."
      window.alert(msg)
      updateRow(rowId, field, "")
      return
    }

    const row = rows.find((r) => r.id === rowId)
    if (row && value) {
      const start = half === "first" ? (field === "firstHalfStart" ? value : row.firstHalfStart) : (field === "secondHalfStart" ? value : row.secondHalfStart)
      const end = half === "first" ? (field === "firstHalfEnd" ? value : row.firstHalfEnd) : (field === "secondHalfEnd" ? value : row.secondHalfEnd)
      if (start && end && !isEndAfterStart(header.shift, half, start, end)) {
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

  const recordedByLabel = recordedBy === "u2" ? "User 1" : recordedBy === "u3" ? "User 2" : "—"
  const checkedByLabel = checkedBy === "c2" ? "Supervisor A" : checkedBy === "c3" ? "Supervisor B" : "—"

  /** Rows per A4 page — ~22 rows fit with header/footer */
  const ROWS_PER_PAGE = 22
  const previewPages = Math.ceil(Math.max(1, rows.length) / ROWS_PER_PAGE)

  return (
    <div id="form-print-area" className="w-full min-w-0 h-full min-h-0 flex flex-col p-0 m-0 overflow-hidden">
      <div ref={pdfRef} className="w-full min-w-0 flex-1 min-h-0 flex flex-col p-0 m-0 overflow-hidden">
        {/* Preview overlay — A4 report format with logo, paginated */}
        {previewOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-zinc-200" style={{ width: "210mm", maxWidth: "100%", maxHeight: "95vh" }}>
              <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-200 bg-gradient-to-r from-slate-50 to-white">
                <span className="text-sm font-semibold text-slate-700">Preview — A4 Report</span>
                <button type="button" onClick={() => setPreviewOpen(false)} className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-200 hover:text-zinc-800 transition-colors" aria-label="Close preview">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="overflow-y-auto flex-1 p-0 bg-zinc-100/50">
                {Array.from({ length: previewPages }).map((_, pageIdx) => {
                  const start = pageIdx * ROWS_PER_PAGE
                  const pageRows = rows.slice(start, start + ROWS_PER_PAGE)
                  return (
                    <div
                      key={pageIdx}
                      className="a4-page bg-white mx-auto my-4 shadow-lg"
                      style={{ width: "210mm", height: "297mm", minHeight: "297mm", padding: "12mm", boxSizing: "border-box" }}
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
                        <span>Shift: {header.shift || "—"}</span>
                        <span>Ref: {header.refNo || "—"}</span>
                      </div>
                      <table className="w-full border-collapse text-[10px]">
                        <thead>
                          <tr className="bg-slate-700 text-slate-100">
                            <th className="border border-slate-600 px-1.5 py-1.5 text-left font-semibold">No</th>
                            <th className="border border-slate-600 px-1.5 py-1.5 text-left font-semibold">Category</th>
                            <th className="border border-slate-600 px-1.5 py-1.5 text-left font-semibold">Description</th>
                            <th className="border border-slate-600 px-1.5 py-1.5 text-left font-semibold">Plate No</th>
                            <th className="border border-slate-600 px-1.5 py-1.5 text-left font-semibold">Status</th>
                            <th className="border border-slate-600 px-1.5 py-1.5 text-center font-semibold">Worked Hr</th>
                            <th className="border border-slate-600 px-1.5 py-1.5 text-center font-semibold">Idle Hr</th>
                            <th className="border border-slate-600 px-1.5 py-1.5 text-center font-semibold">Down Hr</th>
                            <th className="border border-slate-600 px-1.5 py-1.5 text-center font-semibold bg-slate-600">Total Hr</th>
                            <th className="border border-slate-600 px-1.5 py-1.5 text-center font-semibold bg-amber-700/80">Min Agreed Hr</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pageRows.map((row, idx) => {
                            const worked =
                              (row.firstHalfStart && row.firstHalfEnd ? timeDurationHours(row.firstHalfStart, row.firstHalfEnd) : 0) +
                              (row.secondHalfStart && row.secondHalfEnd ? timeDurationHours(row.secondHalfStart, row.secondHalfEnd) : 0)
                            const idle = parseFloat(row.idleHrs) || 0
                            const down = parseFloat(row.downHrs) || 0
                            const totalHr = (worked + idle + down).toFixed(2)
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
                                <td className="border border-slate-300 px-1.5 py-1 text-center bg-green-50 font-medium">{totalHr}</td>
                                <td className="border border-slate-300 px-1.5 py-1 text-center bg-amber-50">—</td>
                              </tr>
                            )
                          })}
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
              </div>
            </div>
          </div>
        )}

        <Card className="w-full min-w-0 flex-1 min-h-0 border-0 shadow-none rounded-none bg-white overflow-hidden flex flex-col">

          <CardContent className="px-4 pb-4 pt-0 bg-white min-w-0 flex flex-col flex-1 min-h-0 overflow-hidden">

            {/* Document info row — compact, attractive */}
            <div className="shrink-0 mb-4 px-4">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 bg-gradient-to-r from-emerald-50/80 via-slate-50 to-sky-50/60 rounded-xl p-4 border border-slate-200/80 shadow-sm">
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
                <Label className="text-xs font-semibold text-slate-700 shrink-0">Date</Label>
                <Input
                  type="date"
                  className="h-9 border border-slate-300 rounded-lg px-3 text-sm w-40 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  value={header.gcDate}
                  onChange={(e) => setHeader((p) => ({ ...p, gcDate: e.target.value }))}
                />
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs font-semibold text-slate-700 shrink-0">Shift</Label>
                <Select
                  value={header.shift || "__none__"}
                  onValueChange={(v) =>
                    setHeader((p) => ({ ...p, shift: (v === "__none__" ? "" : (v as Exclude<ShiftValue, "">)) }))
                  }
                  className="[&_button]:h-9 [&_button]:text-sm [&_button]:px-3 [&_button]:rounded-lg [&_button]:border-slate-300 [&_button]:hover:bg-white [&_button]:shadow-sm w-32"
                >
                  <SelectItem value="__none__">Select...</SelectItem>
                  <SelectItem value="Day">Day</SelectItem>
                  <SelectItem value="Night">Night</SelectItem>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs font-semibold text-slate-700 shrink-0">Ref.No.</Label>
                <Input className="h-9 border border-slate-300 rounded-lg px-3 text-sm w-32 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200" value={header.refNo} onChange={(e) => setHeader((p) => ({ ...p, refNo: e.target.value }))} />
              </div>
            </div>
            </div>

            {/* Equipment entries — scrollable table */}
            <div className="w-full border border-slate-300 rounded-xl overflow-hidden flex-1 min-h-0 flex flex-col shadow-md bg-white">
              <div className="overflow-auto flex-1 min-h-0">
                <table className="text-xs border-collapse min-w-[1250px] w-full">
                  <thead className="sticky top-0 z-[1] bg-gradient-to-r from-slate-900 to-slate-800">
                    <tr className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700">
                      <th className="border border-slate-600 px-1 py-2 text-center font-semibold text-slate-300 whitespace-nowrap w-8" rowSpan={2}></th>
                      <th className="border border-slate-600 px-1.5 py-2 text-center font-semibold text-slate-300 whitespace-nowrap w-8" rowSpan={2}>No</th>
                      <th className="border border-slate-600 px-2 py-2 text-left font-semibold text-slate-300 whitespace-nowrap min-w-[120px] w-[120px]" rowSpan={2}>Category</th>
                      <th className="border border-slate-600 px-2 py-2 text-left font-semibold text-slate-300 whitespace-nowrap min-w-[140px] w-[140px]" rowSpan={2}>Description</th>
                      <th className="border border-slate-600 px-2 py-2 text-left font-semibold text-slate-300 whitespace-nowrap min-w-[100px] w-[100px]" rowSpan={2}>Plate No</th>
                      <th className="border border-slate-600 px-2 py-2 text-left font-semibold text-slate-300 whitespace-nowrap min-w-[80px] w-[80px]" rowSpan={2}>Status</th>
                      <th className="border border-slate-600 px-2 py-2 text-left font-semibold text-slate-300 whitespace-nowrap min-w-[70px] w-[70px]" rowSpan={2}>Rate</th>
                      <th className="border border-slate-600 border-l-2 border-l-blue-400 px-2 py-2 text-center font-semibold text-slate-300 whitespace-nowrap" colSpan={2}>1st Half Hr</th>
                      <th className="border border-slate-600 px-1.5 py-2 text-center font-semibold text-slate-300 whitespace-nowrap" colSpan={2}>2nd Half Hr</th>
                      <th className="border border-slate-600 px-1.5 py-2 text-center font-semibold text-slate-300 whitespace-nowrap" rowSpan={2}>Worked Hrs</th>
                      <th className="border border-slate-600 px-1.5 py-2 text-center font-semibold text-slate-300 whitespace-nowrap" rowSpan={2}>Idle Hrs</th>
                      <th className="border border-slate-600 px-1.5 py-2 text-center font-semibold text-slate-300 whitespace-nowrap" rowSpan={2}>Idle Reason</th>
                      <th className="border border-slate-600 px-1.5 py-2 text-center font-semibold text-slate-300 whitespace-nowrap" rowSpan={2}>Down Hrs</th>
                      <th className="border border-slate-600 px-1.5 py-2 text-center font-semibold text-slate-300 whitespace-nowrap" rowSpan={2}>Down Reason</th>
                      <th className="border border-slate-600 px-1.5 py-2 text-center font-semibold text-slate-300 whitespace-nowrap" colSpan={3}>Engine Hr/Km</th>
                      <th className="border border-slate-600 px-1.5 py-2 text-center font-semibold text-slate-300 whitespace-nowrap" rowSpan={2}>Fuel in Liters</th>
                      <th className="border border-slate-600 px-1.5 py-2 text-center font-semibold text-slate-300 whitespace-nowrap" rowSpan={2}>Hr/Km Reading</th>
                      <th className="border border-slate-600 px-1.5 py-2 text-center font-semibold text-slate-300 whitespace-nowrap" colSpan={2}>Operator</th>
                      <th className="border border-slate-600 px-1.5 py-2 text-center font-semibold text-slate-300 whitespace-nowrap" rowSpan={2}>Type of Work</th>
                    </tr>
                    <tr className="bg-slate-800 border-b border-slate-700">
                      <th
                        className="border border-slate-600 border-l-2 border-l-blue-400 px-1 py-1 text-center text-slate-400 whitespace-nowrap"
                        title={!header.shift ? "Select Shift (Day/Night) first, then choose times" : undefined}
                      >
                        <span className="inline-flex items-center gap-1">
                          Start
                          {!header.shift && (
                            <AlertCircle className="h-3 w-3 text-yellow-400" />
                          )}
                        </span>
                      </th>
                      <th className="border border-slate-600 px-1 py-1 text-center text-slate-400 whitespace-nowrap">End</th>
                      <th className="border border-slate-600 px-1 py-1 text-center text-slate-400 whitespace-nowrap">Start</th>
                      <th className="border border-slate-600 px-1 py-1 text-center text-slate-400 whitespace-nowrap">End</th>
                      <th className="border border-slate-600 px-1 py-1 text-center text-slate-400 whitespace-nowrap">Initial</th>
                      <th className="border border-slate-600 px-1 py-1 text-center text-slate-400 whitespace-nowrap">Final</th>
                      <th className="border border-slate-600 px-1 py-1 text-center text-slate-400 whitespace-nowrap">Diff</th>
                      <th className="border border-slate-600 px-1 py-1 text-center text-slate-400 whitespace-nowrap">1st Half</th>
                      <th className="border border-slate-600 px-1 py-1 text-center text-slate-400 whitespace-nowrap">2nd Half</th>
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
                          rowDisabled ? "bg-amber-50/70 hover:bg-amber-50" : "bg-white hover:bg-slate-50/40"
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
                          <EquipmentCombobox
                            row={row}
                            equipmentOptions={equipmentOptions}
                            openRowId={openEquipmentRowId}
                            search={equipmentSearch}
                            disabled={!header.project || loadingEquipment || rowDisabled}
                            placeholder={!header.project ? "Select project first" : equipmentOptions.length === 0 ? "No equipment" : "Type to search..."}
                            onOpen={() => {
                              setOpenEquipmentRowId(row.id)
                              setEquipmentSearch(row.category || "")
                            }}
                            onClose={() => {
                              setOpenEquipmentRowId(null)
                              setEquipmentSearch("")
                            }}
                            onSearchChange={setEquipmentSearch}
                            onSelect={(opt) => {
                              setRowEquipment(row.id, opt)
                              setOpenEquipmentRowId(null)
                              setEquipmentSearch("")
                            }}
                            onClear={() => {
                              setRowEquipment(row.id, null)
                              setOpenEquipmentRowId(null)
                              setEquipmentSearch("")
                            }}
                            cellInputClass={cellInput}
                          />
                        </td>
                        <td className="border border-zinc-200 p-0 min-w-[140px] w-[140px]">
                          <Input className={cn(cellInput, "bg-zinc-50")} value={row.description} readOnly />
                        </td>
                        <td className="border border-zinc-200 p-0 min-w-[100px] w-[100px]">
                          <Input className={cn(cellInput, "bg-zinc-50")} value={row.plateNo} readOnly />
                        </td>
                        <td className="border border-zinc-200 p-0 min-w-[80px] w-[80px]">
                          <Input className={cn(cellInput, "bg-zinc-50")} value={row.status} readOnly />
                        </td>
                        <td className="border border-zinc-200 p-0 min-w-[70px] w-[70px]">
                          <Input className={cn(cellInput, rowDisabled && "bg-zinc-100 cursor-not-allowed")} value={row.rate} onChange={(e) => !rowDisabled && updateRow(row.id, "rate", e.target.value)} placeholder="—" readOnly={rowDisabled} />
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
                            disabled={!header.shift || rowDisabled}
                            className={cellSelect}
                          >
                            <SelectItem value="__none__">—</SelectItem>
                            {generateHalfOptions(header.shift, "first").map((t) => (
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
                            disabled={!header.shift || rowDisabled}
                            className={cellSelect}
                          >
                            <SelectItem value="__none__">—</SelectItem>
                            {generateHalfOptions(header.shift, "first").map((t) => (
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
                            disabled={!header.shift || rowDisabled}
                            className={cellSelect}
                          >
                            <SelectItem value="__none__">—</SelectItem>
                            {generateHalfOptions(header.shift, "second").map((t) => (
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
                            disabled={!header.shift || rowDisabled}
                            className={cellSelect}
                          >
                            <SelectItem value="__none__">—</SelectItem>
                            {generateHalfOptions(header.shift, "second").map((t) => (
                              <SelectItem key={t} value={t}>
                                {formatTimeLabel(t)}
                              </SelectItem>
                            ))}
                          </Select>
                        </td>
                        <td className="border border-zinc-200 p-0"><Input className={cn(cellInput, "bg-zinc-50")} value={row.workedHrs} readOnly title="Auto-calculated from 1st & 2nd half times" /></td>
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
            <div className="shrink-0 mt-4 w-full min-w-0 pt-4 border-t-2 border-slate-200 overflow-hidden">
              <div className="flex flex-wrap items-center gap-8 px-1">
                <div className="flex items-center gap-2 min-w-[200px]">
                  <Label className="text-sm font-semibold text-slate-700 shrink-0">Recorded by</Label>
                  <Select
                    value={recordedBy || "__none__"}
                    onValueChange={(v) => setRecordedBy(v === "__none__" ? "" : v)}
                    className="min-w-[180px] [&_button]:h-9 [&_button]:text-sm [&_button]:rounded-lg [&_button]:border-slate-300"
                  >
                    <SelectItem value="__none__">Select...</SelectItem>
                    <SelectItem value="u2">User 1</SelectItem>
                    <SelectItem value="u3">User 2</SelectItem>
                  </Select>
                </div>
                <div className="flex items-center gap-2 min-w-[200px]">
                  <Label className="text-sm font-semibold text-slate-700 shrink-0">Checked by</Label>
                  <Select
                    value={checkedBy || "__none__"}
                    onValueChange={(v) => setCheckedBy(v === "__none__" ? "" : v)}
                    className="min-w-[180px] [&_button]:h-9 [&_button]:text-sm [&_button]:rounded-lg [&_button]:border-slate-300"
                  >
                    <SelectItem value="__none__">Select...</SelectItem>
                    <SelectItem value="c2">Supervisor A</SelectItem>
                    <SelectItem value="c3">Supervisor B</SelectItem>
                  </Select>
                </div>
              </div>
            </div>

            {/* Collapsible Legends */}
            <div className="shrink-0 mt-4 w-full rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <button
                type="button"
                onClick={() => setLegendsExpanded((p) => !p)}
                className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-gradient-to-r from-slate-100 to-slate-50 hover:from-slate-200 hover:to-slate-100 text-left text-sm font-semibold text-slate-700 border-b border-slate-200 transition-colors"
              >
                <span>Idle Time Reasons, Shifts & Down Time Reasons</span>
                {legendsExpanded ? <ChevronUp className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0" />}
              </button>
              {legendsExpanded && (
                <div className="flex flex-wrap items-start gap-6 rounded-b-xl bg-gradient-to-br from-slate-50 to-slate-100 px-5 py-4">
                  <div className="flex-1 min-w-[140px]">
                    <p className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-2">Idle Time Reasons</p>
                    <div className="space-y-1 text-xs text-slate-700">
                      {IDLE_REASONS.slice(0, 4).map((r) => (
                        <p key={r.value}><span className="font-bold text-slate-900">{r.value}</span> — {r.full}</p>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 min-w-[140px]">
                    <p className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-2">Idle Time Reasons</p>
                    <div className="space-y-1 text-xs text-slate-700">
                      {IDLE_REASONS.slice(4, 8).map((r) => (
                        <p key={r.value}><span className="font-bold text-slate-900">{r.value}</span> — {r.full}</p>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 min-w-[140px]">
                    <p className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-2">Idle Time Reasons</p>
                    <div className="space-y-1 text-xs text-slate-700">
                      {IDLE_REASONS.slice(8).map((r) => (
                        <p key={r.value}><span className="font-bold text-slate-900">{r.value}</span> — {r.full}</p>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 min-w-[140px]">
                    <p className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-2">Shifts</p>
                    <div className="text-xs text-slate-700 space-y-1">
                      <p>Day — 1st Half: 6:00 AM – 12:00 PM</p>
                      <p className="ml-6">2nd Half: 12:00 PM – 6:00 PM</p>
                      <p>Night — 1st Half: 11:59 PM – 5:59 AM</p>
                      <p className="ml-6">2nd Half: 6:00 AM – 12:00 PM</p>
                    </div>
                  </div>
                  <div className="flex-1 min-w-[140px]">
                    <p className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-2">Down Time Reasons</p>
                    <div className="space-y-1 text-xs text-slate-700">
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
