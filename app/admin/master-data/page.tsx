"use client";

import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  createDepartment,
  createPosition,
  createWorkLocation,
  deleteDepartment,
  deletePosition,
  deleteWorkLocation,
  fetchDepartments,
  fetchPositions,
  fetchWorkLocations,
  updateDepartment,
  updatePosition,
  updateWorkLocation,
} from "@/lib/api/auth";
import { can } from "@/lib/auth";
import { Pencil, Plus, Trash2 } from "lucide-react";

export default function MasterDataCrudPage() {
  const canView = can("page:view:master_data");
  const canCreateWorkLocation = can("master_data:work_location:create");
  const canUpdateWorkLocation = can("master_data:work_location:update");
  const canDeleteWorkLocation = can("master_data:work_location:delete");
  const canCreateDepartment = can("master_data:department:create");
  const canUpdateDepartment = can("master_data:department:update");
  const canDeleteDepartment = can("master_data:department:delete");
  const canCreatePosition = can("master_data:position:create");
  const canUpdatePosition = can("master_data:position:update");
  const canDeletePosition = can("master_data:position:delete");

  const [locations, setLocations] = useState<Array<{ id: string; name: string }>>([]);
  const [departments, setDepartments] = useState<Array<{ id: string; name: string; work_location_id?: string | null }>>([]);
  const [positions, setPositions] = useState<Array<{ id: string; title: string; department_id: string; department_name: string }>>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [locationName, setLocationName] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [positionTitle, setPositionTitle] = useState("");
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");

  const [editingLocationId, setEditingLocationId] = useState<string | null>(null);
  const [editingDepartmentId, setEditingDepartmentId] = useState<string | null>(null);
  const [editingPositionId, setEditingPositionId] = useState<string | null>(null);

  async function refreshAll() {
    const [w, d, p] = await Promise.all([fetchWorkLocations(), fetchDepartments(selectedLocationId || undefined), fetchPositions()]);
    setLocations(w.map((x) => ({ id: x.id, name: x.name })));
    setDepartments(d);
    setPositions(p);
  }

  useEffect(() => {
    if (!canView) return;
    refreshAll().catch((e) => setError(e instanceof Error ? e.message : "Failed to load master data"));
  }, [canView, selectedLocationId]);

  const filteredPositions = useMemo(
    () => positions.filter((p) => (selectedDepartmentId ? p.department_id === selectedDepartmentId : true)),
    [positions, selectedDepartmentId]
  );

  async function run(action: () => Promise<unknown>, okMsg: string) {
    setError("");
    setSuccess("");
    try {
      await action();
      setSuccess(okMsg);
      await refreshAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Operation failed");
    }
  }

  if (!canView) {
    return (
      <Layout>
        <Alert variant="destructive">
          <AlertDescription>You do not have permission for master data.</AlertDescription>
        </Alert>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-3">
        {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
        {success && <Alert><AlertDescription>{success}</AlertDescription></Alert>}

        <Card>
          <CardHeader><CardTitle className="text-base">Connected Master Data CRUD</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label className="text-xs">1) Work Location</Label>
              <Input className="h-8 text-xs" value={locationName} onChange={(e) => setLocationName(e.target.value)} placeholder="Enter work location" />
              <div className="flex gap-1.5">
                <Button size="sm" className="h-8 text-xs" disabled={editingLocationId ? !canUpdateWorkLocation : !canCreateWorkLocation} onClick={() => run(() => editingLocationId ? updateWorkLocation(editingLocationId, locationName) : createWorkLocation(locationName), editingLocationId ? "Work location updated" : "Work location created")}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Save
                </Button>
                <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => { setLocationName(""); setEditingLocationId(null); }}>Reset</Button>
              </div>
              <div className="space-y-1 max-h-56 overflow-auto">
                {locations.map((l) => (
                  <div key={l.id} className="flex items-center justify-between text-xs border rounded px-2 py-1.5">
                    <span className="truncate pr-2">{l.name}</span>
                    <div className="flex gap-1">
                      <button disabled={!canUpdateWorkLocation} className="p-1 rounded hover:bg-muted disabled:opacity-50" onClick={() => { setEditingLocationId(l.id); setLocationName(l.name); }}><Pencil className="h-3.5 w-3.5" /></button>
                      <button disabled={!canDeleteWorkLocation} className="p-1 rounded hover:bg-red-100 text-red-600 disabled:opacity-50" onClick={() => run(() => deleteWorkLocation(l.id), "Work location deleted")}><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">2) Department (select work location first)</Label>
              <select className="w-full h-8 rounded-md border px-2 bg-background text-xs" value={selectedLocationId} onChange={(e) => setSelectedLocationId(e.target.value)}>
                <option value="">Choose work location (context)</option>
                {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
              <Input className="h-8 text-xs" value={departmentName} onChange={(e) => setDepartmentName(e.target.value)} placeholder="Enter department" />
              <div className="flex gap-1.5">
                <Button size="sm" className="h-8 text-xs" disabled={!selectedLocationId || (editingDepartmentId ? !canUpdateDepartment : !canCreateDepartment)} onClick={() => run(() => editingDepartmentId ? updateDepartment(editingDepartmentId, departmentName, selectedLocationId) : createDepartment(departmentName, selectedLocationId), editingDepartmentId ? "Department updated" : "Department created")}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Save
                </Button>
                <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => { setDepartmentName(""); setEditingDepartmentId(null); }}>Reset</Button>
              </div>
              <div className="space-y-1 max-h-56 overflow-auto">
                {departments.map((d) => (
                  <div key={d.id} className="flex items-center justify-between text-xs border rounded px-2 py-1.5">
                    <span className="truncate pr-2">{d.name}</span>
                    <div className="flex gap-1">
                      <button disabled={!canUpdateDepartment} className="p-1 rounded hover:bg-muted disabled:opacity-50" onClick={() => { setEditingDepartmentId(d.id); setDepartmentName(d.name); setSelectedLocationId(d.work_location_id || ""); }}><Pencil className="h-3.5 w-3.5" /></button>
                      <button disabled={!canDeleteDepartment} className="p-1 rounded hover:bg-red-100 text-red-600 disabled:opacity-50" onClick={() => run(() => deleteDepartment(d.id), "Department deleted")}><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">3) Job Title (select work location + department)</Label>
              <select className="w-full h-8 rounded-md border px-2 bg-background text-xs" value={selectedLocationId} onChange={(e) => setSelectedLocationId(e.target.value)}>
                <option value="">Choose work location (context)</option>
                {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
              <select className="w-full h-8 rounded-md border px-2 bg-background text-xs" value={selectedDepartmentId} onChange={(e) => setSelectedDepartmentId(e.target.value)}>
                <option value="">Choose department</option>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              <Input className="h-8 text-xs" value={positionTitle} onChange={(e) => setPositionTitle(e.target.value)} placeholder="Enter job title" />
              <div className="flex gap-1.5">
                <Button size="sm" className="h-8 text-xs" disabled={!selectedLocationId || !selectedDepartmentId || (editingPositionId ? !canUpdatePosition : !canCreatePosition)} onClick={() => run(() => editingPositionId ? updatePosition(editingPositionId, positionTitle, selectedDepartmentId) : createPosition(positionTitle, selectedDepartmentId), editingPositionId ? "Job title updated" : "Job title created")}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Save
                </Button>
                <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => { setPositionTitle(""); setEditingPositionId(null); }}>Reset</Button>
              </div>
              <div className="space-y-1 max-h-56 overflow-auto">
                {filteredPositions.map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-xs border rounded px-2 py-1.5">
                    <span className="truncate pr-2">{p.title} <span className="text-muted-foreground">({p.department_name})</span></span>
                    <div className="flex gap-1">
                      <button disabled={!canUpdatePosition} className="p-1 rounded hover:bg-muted disabled:opacity-50" onClick={() => { setEditingPositionId(p.id); setPositionTitle(p.title); setSelectedDepartmentId(p.department_id); }}><Pencil className="h-3.5 w-3.5" /></button>
                      <button disabled={!canDeletePosition} className="p-1 rounded hover:bg-red-100 text-red-600 disabled:opacity-50" onClick={() => run(() => deletePosition(p.id), "Job title deleted")}><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

