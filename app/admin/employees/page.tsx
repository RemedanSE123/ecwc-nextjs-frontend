"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  approveEmployee,
  createEmployee,
  deleteEmployee,
  fetchDepartments,
  fetchManagedEmployees,
  fetchPositions,
  fetchSupervisors,
  fetchWorkLocations,
  getUserImageUrl,
  updateEmployee,
  uploadUserImage,
  type ManagedEmployee,
} from "@/lib/api/auth";
import { can } from "@/lib/auth";
import {
  Building2,
  CheckCircle2,
  Clock3,
  Edit3,
  ImageIcon,
  LayoutGrid,
  List,
  Loader2,
  MapPin,
  Search,
  Trash2,
  UserCheck,
  UserRound,
} from "lucide-react";

type StatusFilter = "all" | "true" | "false";
type ViewMode = "table" | "cards";

export default function EmployeeAccessPage() {
  const canManage = can("employee:read");
  const canCreate = can("employee:create");
  const canUpdate = can("employee:update");
  const canDelete = can("employee:delete");
  const canApprove = can("employee:approve");

  const [employees, setEmployees] = useState<ManagedEmployee[]>([]);
  const [departments, setDepartments] = useState<Array<{ id: string; name: string }>>([]);
  const [locations, setLocations] = useState<Array<{ id: string; name: string }>>([]);
  const [positions, setPositions] = useState<Array<{ id: string; title: string; department_id?: string }>>([]);
  const [supervisors, setSupervisors] = useState<Array<{ id: string; full_name: string; department_id?: string | null; work_location_id?: string | null }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [workLocationId, setWorkLocationId] = useState("");
  const [positionId, setPositionId] = useState("");
  const [supervisorId, setSupervisorId] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [saving, setSaving] = useState(false);
  const [uploadingProfileImage, setUploadingProfileImage] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCrud, setShowCrud] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    employee_id: "",
    profile_image: "",
    department_id: "",
    position_id: "",
    work_location_id: "",
    supervisor_id: "",
    job_title: "",
    site_location: "",
    is_active: false,
    password: "",
  });

  function initials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "NA";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  function profileSrc(url?: string | null): string | null {
    return getUserImageUrl(url);
  }

  const loadFilters = useCallback(async () => {
    try {
      const [d, w, p, s] = await Promise.all([
        fetchDepartments(),
        fetchWorkLocations(),
        fetchPositions(),
        fetchSupervisors(),
      ]);
      setDepartments(d);
      setLocations(w.map((x) => ({ id: x.id, name: x.name })));
      setPositions(p.map((x) => ({ id: x.id, title: x.title, department_id: x.department_id })));
      setSupervisors(s.map((x) => ({ id: x.id, full_name: x.full_name, department_id: x.department_id, work_location_id: x.work_location_id })));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load filter options");
    }
  }, []);

  const loadEmployees = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const rows = await fetchManagedEmployees({
        q: q.trim() || undefined,
        department_id: departmentId || undefined,
        work_location_id: workLocationId || undefined,
        position_id: positionId || undefined,
        supervisor_id: supervisorId || undefined,
        is_active: status,
      });
      setEmployees(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load employees");
    } finally {
      setLoading(false);
    }
  }, [q, departmentId, workLocationId, positionId, supervisorId, status]);

  useEffect(() => {
    if (!canManage) return;
    void loadFilters();
    void loadEmployees();
  }, [canManage, loadFilters, loadEmployees]);

  const pendingCount = useMemo(() => employees.filter((e) => !e.is_active).length, [employees]);
  const approvedCount = useMemo(() => employees.filter((e) => e.is_active).length, [employees]);
  const filteredFormPositions = useMemo(
    () => positions.filter((p) => !formData.department_id || p.department_id === formData.department_id),
    [positions, formData.department_id]
  );
  const filteredFormSupervisors = useMemo(
    () =>
      supervisors.filter(
        (s) =>
          (!formData.department_id || s.department_id === formData.department_id) &&
          (!formData.work_location_id || s.work_location_id === formData.work_location_id)
      ),
    [supervisors, formData.department_id, formData.work_location_id]
  );

  async function handleApprove(employeeId: string) {
    setApprovingId(employeeId);
    setError("");
    setSuccess("");
    try {
      const res = await approveEmployee(employeeId);
      setSuccess(res.message || "Employee approved.");
      await loadEmployees();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve employee");
    } finally {
      setApprovingId(null);
    }
  }

  function resetForm() {
    setEditingId(null);
    setFormData({
      full_name: "",
      email: "",
      phone: "",
      employee_id: "",
      profile_image: "",
      department_id: "",
      position_id: "",
      work_location_id: "",
      supervisor_id: "",
      job_title: "",
      site_location: "",
      is_active: false,
      password: "",
    });
  }

  function startEdit(emp: ManagedEmployee) {
    setShowCrud(true);
    setEditingId(emp.id);
    setFormData({
      full_name: emp.full_name || "",
      email: emp.email || "",
      phone: emp.phone || "",
      employee_id: emp.employee_id || "",
      profile_image: emp.profile_image || "",
      department_id: emp.department_id || "",
      position_id: emp.position_id || "",
      work_location_id: emp.work_location_id || "",
      supervisor_id: emp.supervisor_id || "",
      job_title: emp.job_title || emp.position_title || "",
      site_location: "",
      is_active: !!emp.is_active,
      password: "",
    });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const payload = {
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        employee_id: formData.employee_id.trim() || undefined,
        profile_image: formData.profile_image.trim() || undefined,
        department_id: formData.department_id || undefined,
        position_id: formData.position_id || undefined,
        work_location_id: formData.work_location_id || undefined,
        supervisor_id: formData.supervisor_id || undefined,
        job_title: formData.job_title.trim() || undefined,
        site_location: formData.site_location.trim() || undefined,
        is_active: formData.is_active,
        password: formData.password.trim() || undefined,
      };
      if (editingId) {
        const res = await updateEmployee(editingId, payload);
        setSuccess(res.message || "Employee updated.");
      } else {
        const res = await createEmployee(payload);
        setSuccess(res.message || "Employee created.");
      }
      await loadEmployees();
      resetForm();
      setShowCrud(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save employee");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(employeeId: string) {
    const ok = window.confirm("Delete this employee permanently?");
    if (!ok) return;
    setError("");
    setSuccess("");
    try {
      const res = await deleteEmployee(employeeId);
      setSuccess(res.message || "Employee deleted.");
      await loadEmployees();
      if (editingId === employeeId) {
        resetForm();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete employee");
    }
  }

  async function handleProfileImageUpload(file: File | null) {
    if (!file) return;
    setUploadingProfileImage(true);
    setError("");
    try {
      const uploaded = await uploadUserImage(file);
      setFormData((p) => ({ ...p, profile_image: uploaded.path }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload profile image");
    } finally {
      setUploadingProfileImage(false);
    }
  }

  if (!canManage) {
    return (
      <Layout>
        <Card>
          <CardHeader>
            <CardTitle>Employee Access</CardTitle>
          </CardHeader>
          <CardContent>
              <Alert variant="destructive">
                <AlertDescription>You do not have permission to view employee access.</AlertDescription>
              </Alert>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-3">
        <Card className="border-[#137638]/20 bg-gradient-to-r from-[#137638]/10 via-background to-background shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <UserCheck className="h-5 w-5 text-[#137638]" />
                Employee Access Management
              </CardTitle>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-amber-100 text-amber-800 px-2.5 py-1">
                  Pending: {pendingCount}
                </span>
                <span className="rounded-full bg-green-100 text-green-800 px-2.5 py-1">
                  Approved: {approvedCount}
                </span>
                <span className="rounded-full bg-slate-100 text-slate-700 px-2.5 py-1">
                  Total: {employees.length}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="rounded-xl border bg-background/80 p-3 md:p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Search className="h-3.5 w-3.5" />
                  Smart filters (combine many fields)
                </div>
                <div className="inline-flex rounded-md border p-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCrud((v) => !v);
                      if (!showCrud) resetForm();
                    }}
                    disabled={!canCreate && !canUpdate}
                    className={`px-2 py-1 text-xs rounded ${showCrud ? "bg-[#137638] text-white" : "text-muted-foreground"}`}
                  >
                    {showCrud ? "Close CRUD" : "Open CRUD"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("cards")}
                    className={`px-2 py-1 text-xs rounded ${viewMode === "cards" ? "bg-[#137638] text-white" : "text-muted-foreground"}`}
                  >
                    <LayoutGrid className="h-3.5 w-3.5 inline mr-1" />
                    Cards
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("table")}
                    className={`px-2 py-1 text-xs rounded ${viewMode === "table" ? "bg-[#137638] text-white" : "text-muted-foreground"}`}
                  >
                    <List className="h-3.5 w-3.5 inline mr-1" />
                    Table
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
                <div className="space-y-1">
                  <Label className="text-xs">Search</Label>
                  <Input
                    className="h-8 text-xs"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Name, phone, email, employee ID"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Department</Label>
                  <select className="w-full h-8 rounded-md border px-2 bg-background text-xs" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
                    <option value="">All</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Work Location</Label>
                  <select className="w-full h-8 rounded-md border px-2 bg-background text-xs" value={workLocationId} onChange={(e) => setWorkLocationId(e.target.value)}>
                    <option value="">All</option>
                    {locations.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Job Title</Label>
                  <select className="w-full h-8 rounded-md border px-2 bg-background text-xs" value={positionId} onChange={(e) => setPositionId(e.target.value)}>
                    <option value="">All</option>
                    {positions.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Line Manager</Label>
                  <select className="w-full h-8 rounded-md border px-2 bg-background text-xs" value={supervisorId} onChange={(e) => setSupervisorId(e.target.value)}>
                    <option value="">All</option>
                    {supervisors.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.full_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Status</Label>
                  <select className="w-full h-8 rounded-md border px-2 bg-background text-xs" value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)}>
                    <option value="all">All</option>
                    <option value="false">Pending</option>
                    <option value="true">Approved</option>
                  </select>
                </div>
              </div>

            <div className="flex gap-2 pt-1">
              <Button onClick={() => void loadEmployees()} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Apply Filters"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setQ("");
                  setDepartmentId("");
                  setWorkLocationId("");
                  setPositionId("");
                  setSupervisorId("");
                  setStatus("all");
                }}
              >
                Clear
              </Button>
            </div>
            </div>
          </CardContent>
        </Card>

        {showCrud && (canCreate || canUpdate) && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{editingId ? "Edit Employee" : "Create Employee"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2.5">
                <Input className="h-8 text-xs" placeholder="Full name *" value={formData.full_name} onChange={(e) => setFormData((p) => ({ ...p, full_name: e.target.value }))} required />
                <Input className="h-8 text-xs" placeholder="Email *" value={formData.email} onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))} required />
                <Input className="h-8 text-xs" placeholder="Phone *" value={formData.phone} onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))} required />
                <Input className="h-8 text-xs" placeholder="Employee ID" value={formData.employee_id} onChange={(e) => setFormData((p) => ({ ...p, employee_id: e.target.value }))} />
                <div className="space-y-1">
                  <Input className="h-8 text-xs" type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={(e) => void handleProfileImageUpload(e.target.files?.[0] ?? null)} disabled={uploadingProfileImage} />
                  <Input className="h-8 text-xs" placeholder="Profile image path (/uploads/user/...)" value={formData.profile_image} onChange={(e) => setFormData((p) => ({ ...p, profile_image: e.target.value }))} />
                </div>
                <Input className="h-8 text-xs" placeholder="Job title" value={formData.job_title} onChange={(e) => setFormData((p) => ({ ...p, job_title: e.target.value }))} />
                <Input className="h-8 text-xs" placeholder="Site location" value={formData.site_location} onChange={(e) => setFormData((p) => ({ ...p, site_location: e.target.value }))} />
                <Input className="h-8 text-xs" placeholder={editingId ? "New password (optional)" : "Password (optional)"} value={formData.password} onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))} />
                <select className="w-full h-8 rounded-md border px-2 bg-background text-xs" value={formData.department_id} onChange={(e) => setFormData((p) => ({ ...p, department_id: e.target.value }))}>
                  <option value="">Department</option>
                  {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <select className="w-full h-8 rounded-md border px-2 bg-background text-xs" value={formData.position_id} onChange={(e) => setFormData((p) => ({ ...p, position_id: e.target.value }))}>
                  <option value="">Position</option>
                  {filteredFormPositions.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
                <select className="w-full h-8 rounded-md border px-2 bg-background text-xs" value={formData.work_location_id} onChange={(e) => setFormData((p) => ({ ...p, work_location_id: e.target.value }))}>
                  <option value="">Work location</option>
                  {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
                <select className="w-full h-8 rounded-md border px-2 bg-background text-xs" value={formData.supervisor_id} onChange={(e) => setFormData((p) => ({ ...p, supervisor_id: e.target.value }))}>
                  <option value="">Line manager</option>
                  {filteredFormSupervisors.map((s) => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                </select>
                <label className="flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData((p) => ({ ...p, is_active: e.target.checked }))} />
                  Active (approved login)
                </label>
                <div className="flex items-center gap-2 md:col-span-2 xl:col-span-3">
                  <Button type="submit" size="sm" className="h-8 bg-[#137638] hover:bg-[#0f5c2b]" disabled={saving}>
                    {saving ? "Saving..." : editingId ? "Update Employee" : "Create Employee"}
                  </Button>
                  <Button type="button" size="sm" variant="outline" className="h-8" onClick={resetForm}>
                    Reset
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {viewMode === "table" ? (
          <Card>
            <CardContent className="pt-3">
              <div className="overflow-x-auto">
                <table className="w-full text-xs table-fixed">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="text-left py-2 pr-2 font-medium w-[52px]">Image</th>
                      <th className="text-left py-2 pr-2 font-medium w-[16%]">Name</th>
                      <th className="text-left py-2 pr-2 font-medium w-[11%]">Phone</th>
                      <th className="text-left py-2 pr-2 font-medium w-[12%]">Department</th>
                      <th className="text-left py-2 pr-2 font-medium w-[14%]">Job Title</th>
                      <th className="text-left py-2 pr-2 font-medium w-[12%]">Location</th>
                      <th className="text-left py-2 pr-2 font-medium w-[12%]">Line Manager</th>
                      <th className="text-left py-2 pr-2 font-medium w-[9%]">Status</th>
                      <th className="text-left py-2 pr-2 font-medium w-[90px]">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.length === 0 ? (
                      <tr>
                        <td className="py-4 text-muted-foreground" colSpan={9}>
                          No employees found for selected filters.
                        </td>
                      </tr>
                    ) : (
                      employees.map((e) => (
                        <tr key={e.id} className="border-b hover:bg-muted/30">
                          <td className="py-2 pr-3">
                            {profileSrc(e.profile_image) ? (
                              <Image
                                src={profileSrc(e.profile_image)!}
                                alt={e.full_name}
                                width={36}
                                height={36}
                                className="h-8 w-8 rounded-full object-cover ring-2 ring-[#137638]/20"
                                unoptimized
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#137638] to-[#0f5c2b] text-white flex items-center justify-center text-[11px] font-semibold ring-2 ring-[#137638]/20">
                                {initials(e.full_name)}
                              </div>
                            )}
                          </td>
                          <td className="py-2 pr-2 font-medium truncate">{e.full_name}</td>
                          <td className="py-2 pr-2 truncate">{e.phone}</td>
                          <td className="py-2 pr-2 truncate">{e.department_name || "-"}</td>
                          <td className="py-2 pr-2 truncate">{e.position_title || e.job_title || "-"}</td>
                          <td className="py-2 pr-2 truncate">{e.work_location_name || "-"}</td>
                          <td className="py-2 pr-2 truncate">{e.supervisor_name || "-"}</td>
                          <td className="py-2 pr-3">
                            <span className={`rounded-full px-2 py-0.5 ${e.is_active ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
                              {e.is_active ? "Approved" : "Pending"}
                            </span>
                          </td>
                          <td className="py-2 pr-3">
                            {!e.is_active ? (
                              <div className="flex items-center gap-1">
                                {canUpdate && <button title="Edit" className="h-7 w-7 inline-flex items-center justify-center rounded border hover:bg-muted" onClick={() => startEdit(e)}>
                                  <Edit3 className="h-3.5 w-3.5" />
                                </button>}
                                {canDelete && <button title="Delete" className="h-7 w-7 inline-flex items-center justify-center rounded border border-red-200 text-red-600 hover:bg-red-50" onClick={() => void handleDelete(e.id)}>
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>}
                                {canApprove && <button title="Approve" disabled={approvingId === e.id} className="h-7 w-7 inline-flex items-center justify-center rounded border border-green-200 text-green-700 hover:bg-green-50 disabled:opacity-50" onClick={() => void handleApprove(e.id)}>
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                </button>}
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                {canUpdate && <button title="Edit" className="h-7 w-7 inline-flex items-center justify-center rounded border hover:bg-muted" onClick={() => startEdit(e)}>
                                  <Edit3 className="h-3.5 w-3.5" />
                                </button>}
                                {canDelete && <button title="Delete" className="h-7 w-7 inline-flex items-center justify-center rounded border border-red-200 text-red-600 hover:bg-red-50" onClick={() => void handleDelete(e.id)}>
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {employees.length === 0 ? (
              <Card className="md:col-span-2 xl:col-span-3">
                <CardContent className="pt-6 text-sm text-muted-foreground">
                  No employees found for selected filters.
                </CardContent>
              </Card>
            ) : (
              employees.map((e) => (
                <Card key={e.id} className="group border-border/60 hover:border-[#137638]/30 hover:shadow-md transition-all overflow-hidden">
                  <CardContent className="p-3 space-y-2">
                    <div className="rounded-lg bg-gradient-to-r from-[#137638]/10 to-[#137638]/5 p-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {profileSrc(e.profile_image) ? (
                            <Image
                              src={profileSrc(e.profile_image)!}
                              alt={e.full_name}
                              width={52}
                              height={52}
                              className="h-12 w-12 rounded-full object-cover shrink-0 ring-2 ring-white shadow-sm"
                              unoptimized
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#137638] to-[#0f5c2b] text-white flex items-center justify-center font-semibold text-sm shrink-0 ring-2 ring-white shadow-sm">
                              {initials(e.full_name)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="text-sm font-semibold leading-tight truncate">{e.full_name}</div>
                            <div className="text-xs text-muted-foreground truncate">{e.phone}</div>
                            <div className="text-[11px] text-muted-foreground/80 flex items-center gap-1 mt-0.5">
                              <ImageIcon className="h-3 w-3" />
                              Circular profile style
                            </div>
                          </div>
                        </div>
                        <span className={`text-[11px] rounded-full px-2 py-0.5 ${e.is_active ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
                          {e.is_active ? "Approved" : "Pending"}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-1.5 text-xs">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Building2 className="h-3.5 w-3.5" />
                        <span><strong>Department:</strong> {e.department_name || "-"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <UserCheck className="h-3.5 w-3.5" />
                        <span><strong>Title:</strong> {e.position_title || e.job_title || "-"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        <span><strong>Location:</strong> {e.work_location_name || "-"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <UserRound className="h-3.5 w-3.5" />
                        <span><strong>Line Manager:</strong> {e.supervisor_name || "ECWC Admin"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        {e.is_active ? <CheckCircle2 className="h-3.5 w-3.5 text-green-700" /> : <Clock3 className="h-3.5 w-3.5 text-amber-700" />}
                        <span><strong>Status:</strong> {e.is_active ? "Access granted" : "Waiting for admin approval"}</span>
                      </div>
                    </div>

                    <div className="pt-1">
                      <div className="grid grid-cols-3 gap-1.5">
                        <Button
                          size="sm"
                          className="h-7 w-full bg-[#137638] hover:bg-[#0f5c2b] text-xs"
                          onClick={() => void handleApprove(e.id)}
                          disabled={e.is_active || approvingId === e.id || !canApprove}
                        >
                          {e.is_active ? "Approved" : approvingId === e.id ? "..." : "Approve"}
                        </Button>
                        <button title="Edit" disabled={!canUpdate} className="h-7 w-full inline-flex items-center justify-center rounded border hover:bg-muted disabled:opacity-50" onClick={() => startEdit(e)}>
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button title="Delete" disabled={!canDelete} className="h-7 w-full inline-flex items-center justify-center rounded border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50" onClick={() => void handleDelete(e.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

