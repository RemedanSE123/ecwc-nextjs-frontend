"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Eye,
  RefreshCw,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Printer,
  Download,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  ArrowUpDown,
  LayoutGrid,
  List,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Truck,
  Calendar,
  DollarSign,
  BarChart3,
  Activity,
  X,
  ZoomIn,
  ZoomOut,
  Building2,
  Briefcase,
  ShieldCheck,
  User,
  MapPin,
  Hash,
  CalendarDays,
  FileSignature,
  Stamp,
} from "lucide-react";
import { apiUrl } from "@/lib/api-client";
import {
  approveDailyStatusChangeRequest,
  deleteRentalAgreement,
  deleteUtilizationRegister,
  getRentalAgreement,
  getUtilizationRegister,
  listDailyStatusChangeRequests,
  listRentalAgreements,
  listUtilizationRegisters,
  rejectDailyStatusChangeRequest,
  updateDailyStatusChangeRequest,
  updateRentalAgreement,
  updateUtilizationRegister,
} from "@/lib/api/machinery-operations";
import Image from "next/image";

// Types
interface RentalAgreement {
  id: string;
  owner_name: string;
  rented_project: string;
  rate_op: number;
  rate_idle: number;
  rate_down: number;
  agreement_pdf_name: string;
  agreement_pdf_key: string;
  start_date?: string;
  end_date?: string;
  asset_name?: string;
  status?: string;
  [key: string]: any;
}

interface StatusRequest {
  id: string;
  description: string;
  asset_no: string;
  status_from: string;
  status_to: string;
  approval_status: string;
  request_date?: string;
  request_note?: string;
  requested_by?: string;
  [key: string]: any;
}

interface UtilizationRegister {
  id: string;
  project_name: string;
  gc_date: string;
  ref_no: string;
  row_count: number;
  header: any;
  rows: any[];
}

type Section = "rental" | "status" | "timesheet";

// KPI Card Component
const KPICard = ({ title, value, change, icon: Icon, color, subtitle }: any) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-gray-500 text-xs uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        {change !== undefined && (
          <div className="flex items-center gap-1 mt-2">
            {change >= 0 ? (
              <TrendingUp className="w-3 h-3 text-emerald-500" />
            ) : (
              <TrendingDown className="w-3 h-3 text-red-500" />
            )}
            <span className={`text-xs ${change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {Math.abs(change)}% vs last period
            </span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  </div>
);

// Helper function to parse worked hours from "HH:mm" or number string
function parseWorkedHours(worked: string): number {
  if (!worked) return 0;
  if (worked.includes(":")) {
    const [h, m] = worked.split(":").map(Number);
    if (Number.isFinite(h) && Number.isFinite(m)) return h + m / 60;
  }
  const n = Number(worked);
  return Number.isFinite(n) ? n : 0;
}

// Professional Document Viewer - A4 Landscape Report Style
const ExecutiveDocumentViewer = ({ item, type, onClose }: any) => {
  const [scale, setScale] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // For utilization register, split rows into pages (22 rows per page as per form design)
  const getPaginatedRows = useCallback((rows: any[]) => {
    const ROWS_PER_PAGE = 22;
    const pages = [];
    for (let i = 0; i < rows.length; i += ROWS_PER_PAGE) {
      pages.push(rows.slice(i, i + ROWS_PER_PAGE));
    }
    return pages.length > 0 ? pages : [[]];
  }, []);

  const utilizationPages = useMemo(() => {
    if (type !== "UTILIZATION REGISTER" || !item?.rows) return [[]];
    return getPaginatedRows(item.rows);
  }, [item, type, getPaginatedRows]);

  useEffect(() => {
    if (type === "UTILIZATION REGISTER") {
      setTotalPages(utilizationPages.length);
    } else {
      setTotalPages(1);
    }
    setCurrentPage(1);
  }, [type, utilizationPages]);

  const calculateTotals = (rows: any[]) => {
    let totalWorked = 0;
    let totalIdle = 0;
    let totalDown = 0;
    let totalRevenue = 0;
    for (const row of rows) {
      const worked = parseWorkedHours(String(row.worked_hrs ?? row.workedHrs ?? "0"));
      const idle = parseFloat(row.idle_hrs ?? row.idleHrs ?? "0");
      const down = parseFloat(row.down_hrs ?? row.downHrs ?? "0");
      const rate = row.rate_op ?? row.rateOp ?? 0;
      totalWorked += worked;
      totalIdle += Number.isFinite(idle) ? idle : 0;
      totalDown += Number.isFinite(down) ? down : 0;
      totalRevenue += rate * worked;
    }
    return { totalWorked, totalIdle, totalDown, totalRevenue };
  };

  const renderUtilizationPage = (pageRows: any[], pageNum: number, isLastPage: boolean) => {
    const totals = calculateTotals(item.rows || []);
    return (
      <div
        key={pageNum}
        className="a4-page bg-white"
        style={{
          width: "297mm",
          minHeight: "210mm",
          padding: "10mm",
          boxSizing: "border-box",
          position: "relative",
        }}
      >
        {/* Standard header with logo - matches form design */}
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

        {/* Project and date info */}
        <div className="flex justify-between text-xs text-slate-600 mb-3">
          <span>Project: {item.project_name || item.header?.project_name || "—"}</span>
          <span>G.C. Date: {item.gc_date || item.header?.gc_date || "—"}</span>
          <span>Ref: {item.ref_no || item.header?.ref_no || "—"}</span>
        </div>

        {/* Main table */}
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
            {pageRows.map((row: any, idx: number) => {
              const worked = parseWorkedHours(String(row.worked_hrs ?? row.workedHrs ?? "0"));
              const idle = parseFloat(row.idle_hrs ?? row.idleHrs ?? "0");
              const down = parseFloat(row.down_hrs ?? row.downHrs ?? "0");
              const rate = row.rate_op ?? row.rateOp ?? 0;
              const revenue = (rate * worked).toFixed(2);
              return (
                <tr key={idx} className="bg-white hover:bg-slate-50/50">
                  <td className="border border-slate-300 px-1.5 py-1 text-center">{idx + 1 + (pageNum - 1) * 22}</td>
                  <td className="border border-slate-300 px-1.5 py-1">{row.category || "—"}</td>
                  <td className="border border-slate-300 px-1.5 py-1">{row.description || "—"}</td>
                  <td className="border border-slate-300 px-1.5 py-1">{row.plate_no || row.plateNo || "—"}</td>
                  <td className="border border-slate-300 px-1.5 py-1">{row.status || "—"}</td>
                  <td className="border border-slate-300 px-1.5 py-1 text-center">{worked.toFixed(2)}</td>
                  <td className="border border-slate-300 px-1.5 py-1 text-center">{idle.toFixed(2)}</td>
                  <td className="border border-slate-300 px-1.5 py-1 text-center">{down.toFixed(2)}</td>
                  <td className="border border-slate-300 px-1.5 py-1 text-center bg-amber-50 font-semibold tabular-nums">{revenue}</td>
                </tr>
              );
            })}
            {isLastPage && (
              <tr className="bg-slate-50">
                <td className="border border-slate-300 px-1.5 py-1 font-bold text-right" colSpan={5}>
                  TOTAL
                </td>
                <td className="border border-slate-300 px-1.5 py-1 text-center font-bold tabular-nums">
                  {totals.totalWorked.toFixed(2)}
                </td>
                <td className="border border-slate-300 px-1.5 py-1 text-center font-bold tabular-nums">
                  {totals.totalIdle?.toFixed(2) || "0.00"}
                </td>
                <td className="border border-slate-300 px-1.5 py-1 text-center font-bold tabular-nums">
                  {totals.totalDown?.toFixed(2) || "0.00"}
                </td>
                <td className="border border-slate-300 px-1.5 py-1 text-center font-bold tabular-nums bg-amber-50">
                  {totals.totalRevenue.toFixed(2)}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Footer */}
        {isLastPage ? (
          <div className="mt-6 pt-4 border-t border-slate-300 flex justify-between text-[10px]">
            <span>Recorded by: {item.recorded_by || item.header?.recorded_by || "—"}</span>
            <span>Checked by: {item.checked_by || item.header?.checked_by || "—"}</span>
          </div>
        ) : (
          <p className="text-[10px] text-slate-500 mt-4 text-center">— Continued on next page —</p>
        )}
        <p className="text-[9px] text-slate-400 mt-2 text-right">Page {pageNum} of {totalPages}</p>
      </div>
    );
  };

  const renderRentalAgreement = () => (
    <div className="p-8" style={{ width: "210mm", minHeight: "297mm", margin: "0 auto", background: "white" }}>
      {/* Header with logo - ECWC Corporate Style */}
      <div className="grid grid-cols-[60px_1fr_100px] border-b-2 border-emerald-700 pb-4 mb-6">
        <div className="flex items-center justify-center">
          <Image src="/ecwc png logo.png" alt="ECWC Logo" width={50} height={50} className="object-contain" />
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-emerald-900">ETHIOPIAN CONSTRUCTION WORKS CORPORATION</p>
          <p className="text-xs text-gray-600 mt-0.5">Machinery Rental Division</p>
          <p className="text-lg font-bold text-emerald-800 mt-1">RENTAL AGREEMENT</p>
        </div>
        <div className="flex flex-col items-end justify-center text-[9px] text-gray-500">
          <p>Document ID</p>
          <p className="font-mono font-semibold">{item.id?.slice(-8) || "N/A"}</p>
        </div>
      </div>

      {/* Agreement Info Bar */}
      <div className="bg-emerald-50 rounded-lg p-4 mb-6 border border-emerald-200">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-emerald-600" />
            <span className="text-xs text-gray-500">Agreement No:</span>
            <span className="text-sm font-semibold text-gray-800">{item.agreement_no || item.id || "N/A"}</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-emerald-600" />
            <span className="text-xs text-gray-500">Issue Date:</span>
            <span className="text-sm font-semibold text-gray-800">{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Parties involved - Professional card styling */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="bg-emerald-700 px-4 py-2 flex items-center gap-2">
            <User className="w-4 h-4 text-white" />
            <h3 className="font-semibold text-white text-sm">LESSOR (Owner)</h3>
          </div>
          <div className="p-4 space-y-2">
            <p className="font-bold text-gray-800">{item.owner_name || "—"}</p>
            <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> {item.owner_address || "Address not provided"}</p>
            <p className="text-xs text-gray-500">Contact: {item.owner_contact || "Not provided"}</p>
          </div>
        </div>
        <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="bg-emerald-700 px-4 py-2 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-white" />
            <h3 className="font-semibold text-white text-sm">LESSEE (Corporation)</h3>
          </div>
          <div className="p-4 space-y-2">
            <p className="font-bold text-gray-800">Ethiopian Construction Works Corporation</p>
            <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> Project: {item.rented_project || "—"}</p>
          </div>
        </div>
      </div>

      {/* Asset Information */}
      <div className="mb-8">
        <div className="bg-gray-100 px-4 py-2 rounded-t-lg border-b-2 border-emerald-500">
          <h3 className="font-semibold text-gray-800 text-sm">EQUIPMENT DETAILS</h3>
        </div>
        <div className="border border-gray-200 rounded-b-lg p-4 bg-white">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Equipment Description</p>
              <p className="font-medium text-gray-800">{item.asset_name || item.description || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Asset / Serial No.</p>
              <p className="font-mono text-sm text-gray-800">{item.asset_no || item.serial_no || "—"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Rate Structure - Professional table */}
      <div className="mb-8">
        <div className="bg-gray-100 px-4 py-2 rounded-t-lg border-b-2 border-emerald-500">
          <h3 className="font-semibold text-gray-800 text-sm">RATE STRUCTURE (USD per hour)</h3>
        </div>
        <div className="border border-gray-200 rounded-b-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-emerald-50">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-emerald-800">Operational Rate</th>
                <th className="px-4 py-2 text-left font-semibold text-amber-800">Idle Rate</th>
                <th className="px-4 py-2 text-left font-semibold text-red-800">Down Rate</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-gray-200">
                <td className="px-4 py-3 text-2xl font-bold text-emerald-600">${item.rate_op || 0}.00</td>
                <td className="px-4 py-3 text-2xl font-bold text-amber-600">${item.rate_idle || 0}.00</td>
                <td className="px-4 py-3 text-2xl font-bold text-red-600">${item.rate_down || 0}.00</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-3 text-xs text-gray-500 bg-gray-50 p-2 rounded">
          <p>* Operational rate applies when equipment is actively working</p>
          <p>* Idle rate applies when equipment is on standby but not working</p>
          <p>* Down rate applies during maintenance or breakdown periods</p>
        </div>
      </div>

      {/* Terms & Conditions */}
      <div className="mb-8">
        <div className="bg-gray-100 px-4 py-2 rounded-t-lg border-b-2 border-emerald-500">
          <h3 className="font-semibold text-gray-800 text-sm">TERMS & CONDITIONS</h3>
        </div>
        <div className="border border-gray-200 rounded-b-lg p-4 text-xs text-gray-600 space-y-2">
          <p>1. This agreement is valid from the effective date until terminated by either party with 30 days written notice.</p>
          <p>2. Payment shall be made monthly based on actual operational hours recorded in the daily utilization register.</p>
          <p>3. The lessee is responsible for fuel, lubricants, and operator costs unless otherwise specified.</p>
          <p>4. The lessor warrants that the equipment is in good working condition and complies with all safety standards.</p>
          <p>5. Any damage to equipment beyond normal wear and tear shall be borne by the lessee.</p>
          <p>6. This agreement shall be governed by the laws of Ethiopia.</p>
        </div>
      </div>

      {/* Signatures Section */}
      <div className="grid grid-cols-2 gap-8 mt-8 pt-4">
        <div className="text-center">
          <div className="border-t-2 border-gray-300 pt-2">
            <p className="text-xs font-semibold text-gray-700">FOR LESSEE</p>
            <p className="text-xs text-gray-500 mt-1">Authorized Signature</p>
          </div>
          <div className="mt-2">
            <p className="text-xs text-gray-400">Name: ____________________</p>
            <p className="text-xs text-gray-400">Title: ____________________</p>
            <p className="text-xs text-gray-400">Date: ____________________</p>
          </div>
        </div>
        <div className="text-center">
          <div className="border-t-2 border-gray-300 pt-2">
            <p className="text-xs font-semibold text-gray-700">FOR LESSOR</p>
            <p className="text-xs text-gray-500 mt-1">Authorized Signature</p>
          </div>
          <div className="mt-2">
            <p className="text-xs text-gray-400">Name: {item.owner_name || "____________________"}</p>
            <p className="text-xs text-gray-400">Title: ____________________</p>
            <p className="text-xs text-gray-400">Date: ____________________</p>
          </div>
        </div>
      </div>

      {/* Corporate Seal / Footer */}
      <div className="mt-8 pt-4 text-center text-[9px] text-gray-400 border-t">
        <p>This is a computer-generated document. Valid without physical signature. | Generated by ECWC System</p>
      </div>
    </div>
  );

  const renderStatusChange = () => (
    <div className="p-8" style={{ width: "210mm", minHeight: "297mm", margin: "0 auto", background: "white" }}>
      {/* Header */}
      <div className="grid grid-cols-[60px_1fr_100px] border-b-2 border-emerald-700 pb-4 mb-6">
        <div className="flex items-center justify-center">
          <Image src="/ecwc png logo.png" alt="ECWC Logo" width={50} height={50} className="object-contain" />
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-emerald-900">ETHIOPIAN CONSTRUCTION WORKS CORPORATION</p>
          <p className="text-xs text-gray-600 mt-0.5">Equipment Management System</p>
          <p className="text-lg font-bold text-emerald-800 mt-1">STATUS CHANGE REQUEST</p>
        </div>
        <div className="flex flex-col items-end justify-center text-[9px] text-gray-500">
          <p>Request ID</p>
          <p className="font-mono font-semibold">{item.id?.slice(-8) || "N/A"}</p>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex justify-center mb-6">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
          item.approval_status === "approved" ? "bg-green-100 text-green-700 border border-green-300" :
          item.approval_status === "rejected" ? "bg-red-100 text-red-700 border border-red-300" :
          "bg-yellow-100 text-yellow-700 border border-yellow-300"
        }`}>
          {item.approval_status === "approved" && <CheckCircle className="w-4 h-4" />}
          {item.approval_status === "rejected" && <XCircle className="w-4 h-4" />}
          {item.approval_status === "pending" && <Clock className="w-4 h-4" />}
          STATUS: {item.approval_status?.toUpperCase() || "PENDING"}
        </div>
      </div>

      {/* Request Info */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-emerald-600" />
            <span className="text-xs text-gray-500">Request Date:</span>
            <span className="text-sm font-semibold text-gray-800">
              {item.request_date ? new Date(item.request_date).toLocaleDateString() : "—"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-600" />
            <span className="text-xs text-gray-500">Requested By:</span>
            <span className="text-sm font-semibold text-gray-800">{item.requested_by || "—"}</span>
          </div>
        </div>
      </div>

      {/* Asset Information */}
      <div className="mb-6">
        <div className="bg-gray-100 px-4 py-2 rounded-t-lg border-b-2 border-emerald-500">
          <h3 className="font-semibold text-gray-800 text-sm">ASSET INFORMATION</h3>
        </div>
        <div className="border border-gray-200 rounded-b-lg p-4 bg-white">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Asset Description</p>
              <p className="font-medium text-gray-800">{item.description || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Asset Number</p>
              <p className="font-mono text-sm text-gray-800">{item.asset_no || "—"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Change Visualization */}
      <div className="mb-6">
        <div className="bg-gray-100 px-4 py-2 rounded-t-lg border-b-2 border-emerald-500">
          <h3 className="font-semibold text-gray-800 text-sm">STATUS TRANSITION</h3>
        </div>
        <div className="border border-gray-200 rounded-b-lg p-6 bg-white">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 text-center">
              <div className="bg-red-100 rounded-lg p-4 border-2 border-red-300">
                <p className="text-xs text-gray-500">Current Status</p>
                <p className="text-xl font-bold text-red-600">{item.status_from || "—"}</p>
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <ArrowRightIcon className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <div className="flex-1 text-center">
              <div className="bg-green-100 rounded-lg p-4 border-2 border-green-300">
                <p className="text-xs text-gray-500">Requested Status</p>
                <p className="text-xl font-bold text-green-600">{item.status_to || "—"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Request Note */}
      <div className="mb-6">
        <div className="bg-gray-100 px-4 py-2 rounded-t-lg border-b-2 border-emerald-500">
          <h3 className="font-semibold text-gray-800 text-sm">REQUEST NOTE / JUSTIFICATION</h3>
        </div>
        <div className="border border-gray-200 rounded-b-lg p-4 bg-white min-h-[100px]">
          <p className="text-sm text-gray-700">{item.request_note || "No additional notes provided."}</p>
        </div>
      </div>

      {/* Approval Section - Only show if not pending */}
      {(item.approval_status === "approved" || item.approval_status === "rejected") && (
        <div className="mb-6">
          <div className="bg-gray-100 px-4 py-2 rounded-t-lg border-b-2 border-emerald-500">
            <h3 className="font-semibold text-gray-800 text-sm">APPROVAL INFORMATION</h3>
          </div>
          <div className="border border-gray-200 rounded-b-lg p-4 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Approved/Rejected By</p>
                <p className="font-medium text-gray-800">{item.approved_by || "System Administrator"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Date</p>
                <p className="font-medium text-gray-800">{item.approved_date ? new Date(item.approved_date).toLocaleDateString() : new Date().toLocaleDateString()}</p>
              </div>
              <div>
                <Stamp className="w-8 h-8 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 pt-4 text-center text-[9px] text-gray-400 border-t">
        <p>This is a system-generated status change request. | Generated by ECWC Equipment Management System</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-8">
      <div className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Toolbar */}
        <div className="bg-gray-800 px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-sm">{type}</h2>
              <p className="text-gray-400 text-xs">Generated {new Date().toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {type === "UTILIZATION REGISTER" && totalPages > 1 && (
              <div className="flex items-center gap-1 mr-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 hover:bg-gray-700 rounded transition disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-400" />
                </button>
                <span className="text-xs text-gray-400 px-2">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 hover:bg-gray-700 rounded transition disabled:opacity-50"
                >
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            )}
            <button className="p-1.5 hover:bg-gray-700 rounded transition" onClick={() => setScale(s => Math.min(1.5, s + 0.1))}>
              <ZoomIn className="w-4 h-4 text-gray-400" />
            </button>
            <button className="p-1.5 hover:bg-gray-700 rounded transition" onClick={() => setScale(s => Math.max(0.5, s - 0.1))}>
              <ZoomOut className="w-4 h-4 text-gray-400" />
            </button>
            <button className="p-1.5 hover:bg-gray-700 rounded transition" onClick={() => window.print()}>
              <Printer className="w-4 h-4 text-gray-400" />
            </button>
            <button className="p-1.5 hover:bg-gray-700 rounded transition" onClick={onClose}>
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Document Content */}
        <div className="overflow-auto p-4 bg-gray-100" style={{ maxHeight: 'calc(90vh - 52px)' }}>
          <div
            className="mx-auto bg-white shadow-xl transition-all origin-top"
            style={{
              transform: `scale(${scale})`,
              width: type === "UTILIZATION REGISTER" ? "297mm" : "210mm",
              minHeight: type === "UTILIZATION REGISTER" ? "210mm" : "297mm",
            }}
          >
            {type === "RENTAL AGREEMENT" && renderRentalAgreement()}
            {type === "STATUS CHANGE" && renderStatusChange()}
            {type === "UTILIZATION REGISTER" && utilizationPages[currentPage - 1] && (
              renderUtilizationPage(utilizationPages[currentPage - 1], currentPage, currentPage === totalPages)
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Arrow Icon for status change
const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
  </svg>
);

// Edit Modal
const EditModal = ({ item, kind, onSave, onClose }: any) => {
  const [formData, setFormData] = useState(item);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="bg-gray-800 px-6 py-4">
          <h2 className="text-white font-semibold">Edit {kind}</h2>
        </div>
        <div className="p-6 space-y-4">
          {Object.entries(formData).map(([key, value]) => {
            if (key === "id" || key === "agreement_pdf_key" || key === "rows" || key === "header") return null;
            const inputValue =
              value == null
                ? ""
                : typeof value === "string" || typeof value === "number"
                  ? value
                  : String(value);
            return (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                  {key.replace(/_/g, " ")}
                </label>
                <input
                  type={key.includes("rate") || key.includes("hrs") ? "number" : "text"}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  value={inputValue}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, [key]: e.target.value }))}
                />
              </div>
            );
          })}
        </div>
        <div className="px-6 py-4 border-t flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(formData)} className="bg-emerald-600 hover:bg-emerald-700">
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

// Main Component
export default function MachineryOperationsDataSection() {
  const [loading, setLoading] = useState(false);
  const [agreements, setAgreements] = useState<RentalAgreement[]>([]);
  const [statusRequests, setStatusRequests] = useState<StatusRequest[]>([]);
  const [utilRegisters, setUtilRegisters] = useState<UtilizationRegister[]>([]);
  const [previewItem, setPreviewItem] = useState<any | null>(null);
  const [previewType, setPreviewType] = useState("");
  const [activeSection, setActiveSection] = useState<Section>("rental");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editItem, setEditItem] = useState<any | null>(null);
  const [editKind, setEditKind] = useState<Section | null>(null);
  const itemsPerPage = 10;

  const loadData = async () => {
    setLoading(true);
    try {
      const [a, s, u] = await Promise.all([
        listRentalAgreements(),
        listDailyStatusChangeRequests(),
        listUtilizationRegisters(),
      ]);
      setAgreements(a || []);
      setStatusRequests(s || []);
      setUtilRegisters(u || []);
    } catch (err) {
      console.error("Failed to load data:", err);
      alert(err instanceof Error ? err.message : "Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getFilteredData = useCallback(() => {
    let data: any[] =
      activeSection === "rental"
        ? agreements
        : activeSection === "status"
          ? statusRequests
          : utilRegisters;
    
    if (searchQuery) {
      data = data.filter(item => 
        JSON.stringify(item).toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return data;
  }, [activeSection, agreements, statusRequests, utilRegisters, searchQuery]);

  const paginatedData = useMemo(() => {
    const filtered = getFilteredData();
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [getFilteredData, currentPage]);

  const totalPages = Math.ceil(getFilteredData().length / itemsPerPage);

  // KPI Calculations
  const kpis = {
    totalAgreements: agreements.length,
    activeAgreements: agreements.filter(a => a.status !== "completed").length,
    pendingRequests: statusRequests.filter(s => s.approval_status === "pending").length,
    approvedRequests: statusRequests.filter(s => s.approval_status === "approved").length,
    totalUtilization: utilRegisters.reduce((sum, u) => sum + (u.row_count || 0), 0),
    totalRevenue: utilRegisters.reduce((sum, u) => {
      const rows = u.rows || [];
      return sum + rows.reduce((s: number, r: any) => {
        const worked = parseWorkedHours(String(r.worked_hrs ?? r.workedHrs ?? "0"));
        return s + (r.rate_op ?? r.rateOp ?? 0) * worked;
      }, 0);
    }, 0),
  };

  const handleApprove = async (id: string) => {
    try {
      await approveDailyStatusChangeRequest(id, "");
      await loadData();
    } catch (err) {
      alert("Failed to approve");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectDailyStatusChangeRequest(id, "");
      await loadData();
    } catch (err) {
      alert("Failed to reject");
    }
  };

  const handleDelete = async (type: string, id: string) => {
    if (!confirm(`Delete this ${type}?`)) return;
    try {
      if (type === "rental") await deleteRentalAgreement(id);
      else if (type === "timesheet") await deleteUtilizationRegister(id);
      await loadData();
    } catch (err) {
      alert("Failed to delete");
    }
  };

  const handleEdit = (item: any, kind: Section) => {
    setEditKind(kind);
    setEditItem({ ...item });
  };

  const handleSaveEdit = async (data: any) => {
    try {
      if (editKind === "rental") {
        await updateRentalAgreement(data.id, data);
      } else if (editKind === "status") {
        await updateDailyStatusChangeRequest(data.id, {
          request_date: data.request_date,
          status_to: data.status_to,
          request_note: data.request_note,
        });
      } else if (editKind === "timesheet") {
        await updateUtilizationRegister(data.id, {
          project_name: data.project_name,
          gc_date: data.gc_date,
          ref_no: data.ref_no,
        });
      }
      setEditItem(null);
      await loadData();
    } catch (err) {
      alert("Failed to update");
    }
  };

  const handleViewDetails = async (item: any, type: string) => {
    try {
      let detail = item;
      if (type === "rental") {
        detail = await getRentalAgreement(item.id);
      } else if (type === "timesheet") {
        detail = await getUtilizationRegister(item.id);
      }
      setPreviewItem(detail);
      setPreviewType(type === "rental" ? "RENTAL AGREEMENT" : type === "status" ? "STATUS CHANGE" : "UTILIZATION REGISTER");
    } catch (err) {
      setPreviewItem(item);
      setPreviewType(type === "rental" ? "RENTAL AGREEMENT" : type === "status" ? "STATUS CHANGE" : "UTILIZATION REGISTER");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Machinery Operations</h1>
              <p className="text-sm text-gray-500">Enterprise Asset Management Dashboard</p>
            </div>
            <Button onClick={loadData} disabled={loading} className="gap-2">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Loading..." : "Refresh"}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 py-6">
        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <KPICard title="Active Agreements" value={kpis.activeAgreements} change={8} icon={FileText} color="bg-emerald-100" subtitle={`${kpis.totalAgreements} total`} />
          <KPICard title="Pending Approvals" value={kpis.pendingRequests} change={-3} icon={Clock} color="bg-amber-100" subtitle={`${kpis.approvedRequests} approved`} />
          <KPICard title="Equipment Utilized" value={kpis.totalUtilization} change={12} icon={Truck} color="bg-blue-100" subtitle="active units" />
          <KPICard title="Total Revenue" value={`$${(kpis.totalRevenue / 1000).toFixed(0)}K`} change={18} icon={DollarSign} color="bg-green-100" subtitle="month to date" />
          <KPICard title="Avg Utilization" value="74%" change={5} icon={BarChart3} color="bg-purple-100" subtitle="+8% vs target" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 mb-6">
          {[
            { id: "rental", label: "Rental Agreements", count: agreements.length, icon: FileText },
            { id: "status", label: "Status Requests", count: statusRequests.length, icon: Activity, badge: kpis.pendingRequests },
            { id: "timesheet", label: "Utilization Registers", count: utilRegisters.length, icon: Calendar },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveSection(tab.id as any); setCurrentPage(1); }}
              className={`px-5 py-2.5 text-sm font-medium transition-all rounded-t-lg ${
                activeSection === tab.id 
                  ? "bg-white text-emerald-600 border-x border-t border-gray-200" 
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center gap-2">
                <tab.icon className="w-4 h-4" />
                {tab.label}
                <span className="text-xs text-gray-400 ml-1">({tab.count})</span>
                {(tab.badge ?? 0) > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-amber-100 text-amber-700 rounded-full">
                    {tab.badge ?? 0}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="flex justify-between items-center mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search records..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-80 pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <div className="text-sm text-gray-500">
            {getFilteredData().length} records found
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                {activeSection === "rental" && (
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Op Rate</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Idle Rate</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Down Rate</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedData.map((agreement: any) => (
                        <tr key={agreement.id} className="hover:bg-gray-50 transition">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{agreement.owner_name || "—"}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{agreement.rented_project || "—"}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">${agreement.rate_op || 0}/hr</td>
                          <td className="px-4 py-3 text-sm text-gray-600">${agreement.rate_idle || 0}/hr</td>
                          <td className="px-4 py-3 text-sm text-gray-600">${agreement.rate_down || 0}/hr</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button onClick={() => handleViewDetails(agreement, "rental")} className="p-1 text-gray-500 hover:text-emerald-600 transition">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleEdit(agreement, "rental")} className="p-1 text-gray-500 hover:text-blue-600 transition">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDelete("rental", agreement.id)} className="p-1 text-gray-500 hover:text-red-600 transition">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {paginatedData.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-gray-500">No rental agreements found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}

                {activeSection === "status" && (
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asset</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">From</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">To</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedData.map((request: any) => (
                        <tr key={request.id} className="hover:bg-gray-50 transition">
                          <td className="px-4 py-3 text-sm text-gray-900">{request.description || request.asset_no || "—"}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{request.status_from || "—"}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{request.status_to || "—"}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                              request.approval_status === "approved" ? "bg-green-100 text-green-700" :
                              request.approval_status === "rejected" ? "bg-red-100 text-red-700" :
                              "bg-yellow-100 text-yellow-700"
                            }`}>
                              {request.approval_status || "pending"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button onClick={() => handleViewDetails(request, "status")} className="p-1 text-gray-500 hover:text-emerald-600 transition">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleEdit(request, "status")} disabled={request.approval_status !== "pending"} className="p-1 text-gray-500 hover:text-blue-600 transition disabled:opacity-50">
                                <Edit className="w-4 h-4" />
                              </button>
                              {request.approval_status === "pending" && (
                                <>
                                  <button onClick={() => handleApprove(request.id)} className="p-1 text-green-600 hover:text-green-700 transition">
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => handleReject(request.id)} className="p-1 text-red-600 hover:text-red-700 transition">
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {paginatedData.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No status requests found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}

                {activeSection === "timesheet" && (
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Equipment</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedData.map((register: any) => (
                        <tr key={register.id} className="hover:bg-gray-50 transition">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{register.project_name || "—"}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{register.gc_date || "—"}</td>
                          <td className="px-4 py-3 text-sm font-mono text-gray-600">{register.ref_no || "—"}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{register.row_count || 0} units</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button onClick={() => handleViewDetails(register, "timesheet")} className="p-1 text-gray-500 hover:text-emerald-600 transition">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleEdit(register, "timesheet")} className="p-1 text-gray-500 hover:text-blue-600 transition">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDelete("timesheet", register.id)} className="p-1 text-gray-500 hover:text-red-600 transition">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {paginatedData.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No utilization registers found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-4 py-3 border-t border-gray-200 flex justify-between items-center bg-gray-50">
                  <p className="text-sm text-gray-500">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, getFilteredData().length)} of {getFilteredData().length} entries
                  </p>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {previewItem && (
        <ExecutiveDocumentViewer
          item={previewItem}
          type={previewType}
          onClose={() => setPreviewItem(null)}
        />
      )}
      {editItem && editKind && (
        <EditModal
          item={editItem}
          kind={editKind}
          onSave={handleSaveEdit}
          onClose={() => setEditItem(null)}
        />
      )}
    </div>
  );
}