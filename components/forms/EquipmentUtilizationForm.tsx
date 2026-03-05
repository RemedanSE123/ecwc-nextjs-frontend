"use client"

import { useState, useRef, useEffect, useContext } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectItem } from "@/components/ui/select"
import { Trash2, ChevronDown, Eye, X, AlertCircle } from "lucide-react"
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
  row: { id: string; assetId: string; equipType: string; plateNo: string }
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

  const displayValue = isOpen ? search : (row.assetId ? row.equipType : "")
  const [pos, setPos] = useState({ top: 0, left: 0, width: 180 })
  useEffect(() => {
    if (isOpen && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect()
      setPos({ top: rect.bottom + 2, left: rect.left, width: Math.max(rect.width, 180) })
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
            else onSearchChange(row.equipType)
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
          className="fixed z-[9999] overflow-y-auto rounded-md border border-zinc-200 bg-white shadow-lg max-h-[200px] min-w-[180px]"
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
                  "cursor-pointer select-none rounded-sm py-1.5 px-2 text-xs hover:bg-zinc-100 whitespace-nowrap",
                  row.assetId === o.id && "bg-zinc-100"
                )}
                onClick={() => onSelect(o)}
              >
                {`${o.category ?? "—"} — ${o.plate_no ?? "No plate"}`}
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

function PlateNoCombobox({
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
  row: { id: string; assetId: string; equipType: string; plateNo: string }
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
          (o.plate_no ?? "").toLowerCase().includes(q) ||
          (o.category ?? "").toLowerCase().includes(q)
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

  const displayValue = isOpen ? search : (row.assetId ? row.plateNo : "")
  const [pos, setPos] = useState({ top: 0, left: 0, width: 140 })
  useEffect(() => {
    if (isOpen && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect()
      setPos({ top: rect.bottom + 2, left: rect.left, width: Math.max(rect.width, 140) })
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
            else onSearchChange(row.plateNo || "")
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
          className="fixed z-[9999] overflow-y-auto rounded-md border border-zinc-200 bg-white shadow-lg max-h-[200px] min-w-[140px]"
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
                  "cursor-pointer select-none rounded-sm py-1.5 px-2 text-xs hover:bg-zinc-100 whitespace-nowrap",
                  row.assetId === o.id && "bg-zinc-100"
                )}
                onClick={() => onSelect(o)}
              >
                {`${o.plate_no ?? "—"} — ${o.category ?? "—"}`}
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
  equipType: string
  plateNo: string
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

function rowHasAnyData(row: UtilRow): boolean {
  return !!(
    row.assetId ||
    row.equipType ||
    row.plateNo ||
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
    equipType: "",
    plateNo: "",
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
  const [approvedBy, setApprovedBy] = useState("")

  const [projects, setProjects] = useState<string[]>([])
  const [equipmentOptions, setEquipmentOptions] = useState<EquipmentOption[]>([])
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [loadingEquipment, setLoadingEquipment] = useState(false)
  const [openEquipmentRowId, setOpenEquipmentRowId] = useState<string | null>(null)
  const [equipmentSearch, setEquipmentSearch] = useState("")
  const [openPlateRowId, setOpenPlateRowId] = useState<string | null>(null)
  const [plateSearch, setPlateSearch] = useState("")
  const [previewOpen, setPreviewOpen] = useState(false)

  useEffect(() => {
    if (!setHeaderActions) return
    setHeaderActions(
      <button
        type="button"
        onClick={() => setPreviewOpen(true)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 border border-zinc-200"
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

  const setRowEquipment = (rowId: string, option: EquipmentOption | null) => {
    setRows((prev) => {
      const nextRows = prev.map((r) =>
        r.id !== rowId
          ? r
          : {
              ...r,
              assetId: option?.id ?? "",
              equipType: option?.category ?? "",
              plateNo: option?.plate_no ?? "",
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

  return (
    <div id="form-print-area" className="w-full min-w-0 mx-auto px-2 py-2 print:max-w-[210mm] print:mx-0 print:p-0 print:overflow-visible print:font-[Arial]">
      <div ref={pdfRef} className="w-full min-w-0 mx-auto print:max-w-[210mm]">
        {/* Preview overlay — report paper format */}
        {previewOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true">
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-200 bg-zinc-50">
                <span className="text-sm font-medium text-zinc-700">Preview — Report format</span>
                <button type="button" onClick={() => setPreviewOpen(false)} className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-200 hover:text-zinc-800" aria-label="Close preview">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="overflow-y-auto p-6 text-sm">
                <div className="text-center mb-4">
                  <p className="text-base font-bold text-black">ETHIOPIAN CONSTRUCTION WORKS CORPORATION</p>
                  <p className="text-sm font-medium text-black mt-0.5">Daily Equipment Time Register Check-up</p>
                </div>
                <div className="flex justify-between text-zinc-600 mb-4">
                  <span>G.C. Date {formatPreviewDate(header.gcDate)}</span>
                  <span>Shift: {header.shift || "—"}</span>
                </div>
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="bg-zinc-100">
                      <th className="border border-zinc-300 px-2 py-1.5 text-left font-semibold text-blue-700">Equip Type</th>
                      <th className="border border-zinc-300 px-2 py-1.5 text-left font-semibold text-blue-700">Plate No</th>
                      <th className="border border-zinc-300 px-2 py-1.5 text-center font-semibold text-blue-700">Worked Hr</th>
                      <th className="border border-zinc-300 px-2 py-1.5 text-center font-semibold text-blue-700">Idle Hr</th>
                      <th className="border border-zinc-300 px-2 py-1.5 text-center font-semibold text-blue-700">Down Hr</th>
                      <th className="border border-zinc-300 px-2 py-1.5 text-center font-semibold text-blue-700 bg-green-100">Total Hr</th>
                      <th className="border border-zinc-300 px-2 py-1.5 text-center font-semibold text-blue-700 bg-amber-100">Min Agreed Hr</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => {
                      // Recompute worked hours from times so preview is accurate even if label format changes
                      const worked =
                        (row.firstHalfStart && row.firstHalfEnd
                          ? timeDurationHours(row.firstHalfStart, row.firstHalfEnd)
                          : 0) +
                        (row.secondHalfStart && row.secondHalfEnd
                          ? timeDurationHours(row.secondHalfStart, row.secondHalfEnd)
                          : 0)
                      const idle = parseFloat(row.idleHrs) || 0
                      const down = parseFloat(row.downHrs) || 0
                      const totalHr = (worked + idle + down).toFixed(2)
                      return (
                        <tr key={row.id} className="bg-white">
                          <td className="border border-zinc-300 px-2 py-1.5">{row.equipType || "—"}</td>
                          <td className="border border-zinc-300 px-2 py-1.5">{row.plateNo || "—"}</td>
                          <td className="border border-zinc-300 px-2 py-1.5 text-center">{row.workedHrs}</td>
                          <td className="border border-zinc-300 px-2 py-1.5 text-center">{row.idleHrs}</td>
                          <td className="border border-zinc-300 px-2 py-1.5 text-center">{row.downHrs}</td>
                          <td className="border border-zinc-300 px-2 py-1.5 text-center bg-green-50">{totalHr}</td>
                          <td className="border border-zinc-300 px-2 py-1.5 text-center bg-amber-50">—</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        <Card className="w-full min-w-0 border border-zinc-200 shadow-sm print:shadow-none print:border print:border-black rounded-lg bg-white overflow-hidden flex flex-col min-h-[32rem] max-h-[calc(100vh-7rem)] print:min-h-0 print:max-h-none">

          {/* Official document header — 3 columns: logo | titles | doc info */}
          <CardHeader className="p-0 print:border-2 print:border-black shrink-0">
            <div className="grid grid-cols-[80px_1fr_140px] border-b border-zinc-200 bg-zinc-50/60 print:border-2 print:border-black print:bg-transparent">
              <div className="border-r border-zinc-200 flex items-center justify-center p-1.5 relative h-14 print:border-black print:h-14 print:p-1">
                <Image src="/ecwc png logo.png" alt="ECWC Logo" fill className="object-contain p-1" />
              </div>
              <div className="border-r border-zinc-200 flex flex-col items-center justify-center py-2 px-3 text-center print:border-black">
                <p className="text-[11px] font-bold text-zinc-800 tracking-wide print:text-[13px] print:font-bold">ETHIOPIAN CONSTRUCTION WORKS CORPORATION</p>
                <p className="text-[9px] font-medium text-zinc-500 mt-0.5 print:text-[11px] print:font-semibold print:text-black">EQUIPMENT DAILY TIME UTILIZATION REGISTER</p>
              </div>
              <div className="flex flex-col justify-center pl-3 text-[10px] text-zinc-500 print:text-[10px] print:text-black">
                <p><b>Document No.</b> OF/ECWC/xxx</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-2 sm:p-3 bg-white min-w-0 print:p-6 print:bg-white flex flex-col flex-1 min-h-0 overflow-hidden">

            {/* Document info row */}
            <div className="shrink-0 space-y-2 mb-2">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <div className="flex items-center gap-2 flex-1 min-w-0 max-w-full">
                <Label className="text-xs font-medium text-zinc-600 shrink-0 w-14">Project</Label>
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
                    setOpenPlateRowId(null)
                    setPlateSearch("")
                  }}
                  className="[&_button]:h-8 [&_button]:text-xs [&_button]:px-2 [&_button]:rounded min-w-[320px] flex-1 max-w-[520px]"
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
                <Label className="text-xs font-medium text-zinc-600 shrink-0">Date</Label>
                <Input
                  type="date"
                  className="h-8 border border-zinc-200 rounded px-2 text-xs w-36"
                  value={header.gcDate}
                  onChange={(e) => setHeader((p) => ({ ...p, gcDate: e.target.value }))}
                />
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs font-medium text-zinc-600 shrink-0">Shift</Label>
                <Select
                  value={header.shift || "__none__"}
                  onValueChange={(v) =>
                    setHeader((p) => ({
                      ...p,
                      shift: (v === "__none__" ? "" : (v as Exclude<ShiftValue, "">)),
                    }))
                  }
                  className="[&_button]:h-7 [&_button]:text-xs [&_button]:px-2 [&_button]:rounded w-28"
                >
                  <SelectItem value="__none__">Select...</SelectItem>
                  <SelectItem value="Day">Day</SelectItem>
                  <SelectItem value="Night">Night</SelectItem>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs font-medium text-zinc-600 shrink-0">Ref.No.</Label>
                <Input className="h-7 border border-zinc-200 rounded px-2 text-xs w-24" value={header.refNo} onChange={(e) => setHeader((p) => ({ ...p, refNo: e.target.value }))} />
              </div>
            </div>
            </div>

            {/* Equipment entries — only this section scrolls vertically when rows are many */}
            <div className="w-full border border-zinc-200 rounded-lg overflow-hidden flex-1 min-h-0 flex flex-col">
              <div className="overflow-auto flex-1 min-h-0">
                <table className="text-xs border-collapse min-w-[1250px] w-full">
                  <thead className="sticky top-0 z-[1] bg-zinc-100">
                    <tr className="bg-zinc-100 border-b border-zinc-200">
                      <th className="border border-zinc-200 px-1 py-1 text-center font-semibold text-zinc-600 whitespace-nowrap w-8" rowSpan={2}></th>
                      <th className="border border-zinc-200 px-1.5 py-1 text-center font-semibold text-zinc-600 whitespace-nowrap w-8" rowSpan={2}>No</th>
                      <th className="border border-zinc-200 px-2 py-1 text-left font-semibold text-zinc-600 whitespace-nowrap min-w-[190px] w-[190px]" rowSpan={2}>Equip Type</th>
                      <th className="border border-zinc-200 px-2 py-1 text-left font-semibold text-zinc-600 whitespace-nowrap min-w-[120px] w-[120px]" rowSpan={2}>Plate No</th>
                      <th className="border border-zinc-200 border-l-2 border-l-zinc-300 px-2 py-1 text-center font-semibold text-zinc-600 whitespace-nowrap" colSpan={2}>1st Half Hr</th>
                      <th className="border border-zinc-200 px-1.5 py-1 text-center font-semibold text-zinc-600 whitespace-nowrap" colSpan={2}>2nd Half Hr</th>
                      <th className="border border-zinc-200 px-1.5 py-1 text-center font-semibold text-zinc-600 whitespace-nowrap" rowSpan={2}>Worked Hrs</th>
                      <th className="border border-zinc-200 px-1.5 py-1 text-center font-semibold text-zinc-600 whitespace-nowrap" rowSpan={2}>Idle Hrs</th>
                      <th className="border border-zinc-200 px-1.5 py-1 text-center font-semibold text-zinc-600 whitespace-nowrap" rowSpan={2}>Idle Reason</th>
                      <th className="border border-zinc-200 px-1.5 py-1 text-center font-semibold text-zinc-600 whitespace-nowrap" rowSpan={2}>Down Hrs</th>
                      <th className="border border-zinc-200 px-1.5 py-1 text-center font-semibold text-zinc-600 whitespace-nowrap" rowSpan={2}>Down Reason</th>
                      <th className="border border-zinc-200 px-1.5 py-1 text-center font-semibold text-zinc-600 whitespace-nowrap" colSpan={3}>Engine Hr/Km</th>
                      <th className="border border-zinc-200 px-1.5 py-1 text-center font-semibold text-zinc-600 whitespace-nowrap" rowSpan={2}>Fuel in Liters</th>
                      <th className="border border-zinc-200 px-1.5 py-1 text-center font-semibold text-zinc-600 whitespace-nowrap" rowSpan={2}>Hr/Km Reading</th>
                      <th className="border border-zinc-200 px-1.5 py-1 text-center font-semibold text-zinc-600 whitespace-nowrap" colSpan={2}>Operator</th>
                      <th className="border border-zinc-200 px-1.5 py-1 text-center font-semibold text-zinc-600 whitespace-nowrap" rowSpan={2}>Type of Work</th>
                    </tr>
                    <tr className="bg-zinc-50 border-b border-zinc-200">
                      <th
                        className="border border-zinc-200 border-l-2 border-l-zinc-300 px-1 py-0.5 text-center text-zinc-500 whitespace-nowrap"
                        title={!header.shift ? "Select Shift (Day/Night) first, then choose times" : undefined}
                      >
                        <span className="inline-flex items-center gap-1">
                          Start
                          {!header.shift && (
                            <AlertCircle className="h-3 w-3 text-amber-500" />
                          )}
                        </span>
                      </th>
                      <th className="border border-zinc-200 px-1 py-0.5 text-center text-zinc-500 whitespace-nowrap">End</th>
                      <th className="border border-zinc-200 px-1 py-0.5 text-center text-zinc-500 whitespace-nowrap">Start</th>
                      <th className="border border-zinc-200 px-1 py-0.5 text-center text-zinc-500 whitespace-nowrap">End</th>
                      <th className="border border-zinc-200 px-1 py-0.5 text-center text-zinc-500 whitespace-nowrap">Initial</th>
                      <th className="border border-zinc-200 px-1 py-0.5 text-center text-zinc-500 whitespace-nowrap">Final</th>
                      <th className="border border-zinc-200 px-1 py-0.5 text-center text-zinc-500 whitespace-nowrap">Diff</th>
                      <th className="border border-zinc-200 px-1 py-0.5 text-center text-zinc-500 whitespace-nowrap">1st Half</th>
                      <th className="border border-zinc-200 px-1 py-0.5 text-center text-zinc-500 whitespace-nowrap">2nd Half</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, index) => (
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
                        <td className="border border-zinc-200 p-0 text-center text-[11px] text-zinc-600 align-middle w-8">
                          {index + 1}
                        </td>
                        <td className="border border-zinc-200 p-0 min-w-[180px] w-[180px]">
                          <EquipmentCombobox
                            row={row}
                            equipmentOptions={equipmentOptions}
                            openRowId={openEquipmentRowId}
                            search={equipmentSearch}
                            disabled={!header.project || loadingEquipment}
                            placeholder={!header.project ? "Select project first" : equipmentOptions.length === 0 ? "No equipment" : "Type to search..."}
                            onOpen={() => {
                              setOpenEquipmentRowId(row.id)
                              setEquipmentSearch(row.equipType || "")
                              setOpenPlateRowId(null)
                              setPlateSearch("")
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
                        <td className="border border-zinc-200 p-0 min-w-[110px] w-[110px]">
                            <PlateNoCombobox
                              row={row}
                              equipmentOptions={equipmentOptions}
                              openRowId={openPlateRowId}
                              search={plateSearch}
                              disabled={!header.project || loadingEquipment}
                              placeholder={!header.project ? "Select project first" : equipmentOptions.length === 0 ? "No equipment" : "Type to search"}
                              onOpen={() => { setOpenPlateRowId(row.id); setOpenEquipmentRowId(null) }}
                              onClose={() => { setOpenPlateRowId(null); setPlateSearch("") }}
                              onSearchChange={setPlateSearch}
                              onSelect={(opt) => { setRowEquipment(row.id, opt); setOpenPlateRowId(null); setPlateSearch("") }}
                              onClear={() => { setRowEquipment(row.id, null); setOpenPlateRowId(null); setPlateSearch("") }}
                              cellInputClass={cellInput}
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
                            disabled={!header.shift}
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
                            disabled={!header.shift}
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
                            disabled={!header.shift}
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
                            disabled={!header.shift}
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
                            className={cn(cellInput, isInvalidHours(row.idleHrs) && "ring-1 ring-red-500 rounded")}
                            value={row.idleHrs}
                            onChange={(e) => updateRow(row.id, "idleHrs", e.target.value)}
                            onFocus={(e) => handleZeroFocus(row.id, "idleHrs", e.target.value)}
                            title={isInvalidHours(row.idleHrs) ? "Enter a valid number ≥ 0" : undefined}
                          />
                        </td>
                        <td className="border border-zinc-200 p-0">
                          <Select
                            value={row.idleReason || "__none__"}
                            onValueChange={(v) =>
                              updateRow(row.id, "idleReason", v === "__none__" ? "" : v)
                            }
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
                            className={cn(cellInput, isInvalidHours(row.downHrs) && "ring-1 ring-red-500 rounded")}
                            value={row.downHrs}
                            onChange={(e) => updateRow(row.id, "downHrs", e.target.value)}
                            onFocus={(e) => handleZeroFocus(row.id, "downHrs", e.target.value)}
                            title={isInvalidHours(row.downHrs) ? "Enter a valid number ≥ 0" : undefined}
                          />
                        </td>
                        <td className="border border-zinc-200 p-0">
                          <Select
                            value={row.downReason || "__none__"}
                            onValueChange={(v) =>
                              updateRow(row.id, "downReason", v === "__none__" ? "" : v)
                            }
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
                            className={cellInput}
                            value={row.engineInitial}
                            onChange={(e) => updateRow(row.id, "engineInitial", e.target.value)}
                            onFocus={(e) => handleZeroFocus(row.id, "engineInitial", e.target.value)}
                          />
                        </td>
                        <td className="border border-zinc-200 p-0 min-w-[90px] w-[100px]">
                          <Input
                            className={cellInput}
                            value={row.engineFinal}
                            onChange={(e) => updateRow(row.id, "engineFinal", e.target.value)}
                            onFocus={(e) => handleZeroFocus(row.id, "engineFinal", e.target.value)}
                          />
                        </td>
                        <td className="border border-zinc-200 p-0 min-w-[80px] w-[90px]"><Input className={`${cellInput} bg-zinc-50`} value={row.engineDiff} readOnly /></td>
                        <td className="border border-zinc-200 p-0">
                          <Input
                            className={cellInput}
                            value={row.fuelLtrs}
                            onChange={(e) => updateRow(row.id, "fuelLtrs", e.target.value)}
                            onFocus={(e) => handleZeroFocus(row.id, "fuelLtrs", e.target.value)}
                          />
                        </td>
                        <td className="border border-zinc-200 p-0">
                          <Input
                            className={cellInput}
                            value={row.fuelReading}
                            onChange={(e) => updateRow(row.id, "fuelReading", e.target.value)}
                            onFocus={(e) => handleZeroFocus(row.id, "fuelReading", e.target.value)}
                          />
                        </td>
                        <td className="border border-zinc-200 p-0 min-w-[120px] w-[140px]"><Input className={cellInput} value={row.operatorFirstHalf} onChange={(e) => updateRow(row.id, "operatorFirstHalf", e.target.value)} /></td>
                        <td className="border border-zinc-200 p-0 min-w-[120px] w-[140px]"><Input className={cellInput} value={row.operatorSecondHalf} onChange={(e) => updateRow(row.id, "operatorSecondHalf", e.target.value)} /></td>
                        <td className="border border-zinc-200 p-0 min-w-[200px] w-[240px]"><Input className={cellInput} value={row.typeOfWork} onChange={(e) => updateRow(row.id, "typeOfWork", e.target.value)} /></td>
                      </tr>
                    ))}
                    {Array.from({ length: Math.max(0, 4 - rows.length) }).map((_, i) => (
                      <tr key={`empty-${i}`} aria-hidden>
                        <td colSpan={21} className="border border-zinc-200 bg-zinc-50/30 h-7" />
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Legends - 5 Column Layout with executive-style card */}
            <div className="shrink-0 mt-3 flex flex-wrap items-start gap-6 rounded-xl border border-zinc-200 bg-zinc-50/70 px-4 py-3">
              {/* Column 1: First 4 Idle Time Reasons */}
              <div className="flex-1 min-w-[140px]">
                <p className="text-[11px] font-semibold text-zinc-700 uppercase tracking-wide mb-1">Idle Time Reasons</p>
                <div className="space-y-0.5 text-[11px] text-zinc-600">
                  {IDLE_REASONS.slice(0, 4).map((r) => (
                    <p key={r.value}><span className="font-bold text-zinc-700">{r.value}</span> — {r.full}</p>
                  ))}
                </div>
              </div>
              
              {/* Column 2: Next 4 Idle Time Reasons */}
              <div className="flex-1 min-w-[140px]">
                <p className="text-[11px] font-semibold text-zinc-700 uppercase tracking-wide mb-1">Idle Time Reasons</p>
                <div className="space-y-0.5 text-[11px] text-zinc-600">
                  {IDLE_REASONS.slice(4, 8).map((r) => (
                    <p key={r.value}><span className="font-bold text-zinc-700">{r.value}</span> — {r.full}</p>
                  ))}
                </div>
              </div>
              
              {/* Column 3: Last 4 Idle Time Reasons */}
              <div className="flex-1 min-w-[140px]">
                <p className="text-[11px] font-semibold text-zinc-700 uppercase tracking-wide mb-1">Idle Time Reasons</p>
                <div className="space-y-0.5 text-[11px] text-zinc-600">
                  {IDLE_REASONS.slice(8).map((r) => (
                    <p key={r.value}><span className="font-bold text-zinc-700">{r.value}</span> — {r.full}</p>
                  ))}
                </div>
              </div>
              
              {/* Column 4: Shifts */}
              <div className="flex-1 min-w-[140px]">
                <p className="text-[11px] font-semibold text-zinc-700 uppercase tracking-wide mb-1">Shifts</p>
                <div className="text-[11px] text-zinc-700 space-y-0.5">
                  <p>Day — 1st Half: 6:00 AM – 12:00 PM</p>
                  <p className="ml-8">2nd Half: 12:00 PM – 6:00 PM</p>
                  <p>Night — 1st Half: 6:00 PM – 12:00 AM</p>
                  <p className="ml-8">2nd Half: 12:00 AM – 6:00 AM</p>
                </div>
              </div>
              
              {/* Column 5: Down Time Reasons */}
              <div className="flex-1 min-w-[140px]">
                <p className="text-[11px] font-semibold text-zinc-700 uppercase tracking-wide mb-1">Down Time Reasons</p>
                <div className="space-y-0.5 text-[11px] text-zinc-600">
                  {DOWN_REASONS.map((r) => (
                    <p key={r.value}><span className="font-bold text-zinc-700">{r.value}</span> — {r.full}</p>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Full Width Row: Signature Fields */}
            <div className="shrink-0 mt-3 flex flex-wrap items-start gap-4 pt-3 border-t border-zinc-200">
              <div className="flex-1 min-w-[300px]">
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs font-semibold text-zinc-700 whitespace-nowrap">Recorded by</Label>
                    <Select value={recordedBy} onValueChange={setRecordedBy} className="flex-1 [&_button]:h-8 [&_button]:text-xs [&_button]:rounded [&_button]:w-full">
                      <SelectItem value="u1">Select...</SelectItem>
                      <SelectItem value="u2">User 1</SelectItem>
                      <SelectItem value="u3">User 2</SelectItem>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs font-semibold text-zinc-700 whitespace-nowrap">Checked by</Label>
                    <Select value={checkedBy} onValueChange={setCheckedBy} className="flex-1 [&_button]:h-8 [&_button]:text-xs [&_button]:rounded [&_button]:w-full">
                      <SelectItem value="c1">Select...</SelectItem>
                      <SelectItem value="c2">Supervisor A</SelectItem>
                      <SelectItem value="c3">Supervisor B</SelectItem>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs font-semibold text-zinc-700 whitespace-nowrap">Approved by</Label>
                    <Select value={approvedBy} onValueChange={setApprovedBy} className="flex-1 [&_button]:h-8 [&_button]:text-xs [&_button]:rounded [&_button]:w-full">
                      <SelectItem value="a1">Select...</SelectItem>
                      <SelectItem value="a2">Manager A</SelectItem>
                      <SelectItem value="a3">Manager B</SelectItem>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
