'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Pencil, Trash2, ChevronDown, ChevronUp, PlusCircle, MapPin, UserRound, CalendarDays, FileText } from 'lucide-react';
import { getAuthHeaders } from '@/lib/auth';
import type { ProjectRecord } from '@/lib/api/assets';
import { fetchProjects } from '@/lib/api/assets';
import { apiUrl } from '@/lib/api-client';

type ProjectStatus = 'active' | 'inactive' | 'closed';

type ProjectForm = {
  project_name: string;
  status: ProjectStatus;
  manager_name: string;
  manager_phone: string;
  start_date: string;
  end_date: string;
  remark: string;
};

const EMPTY_FORM: ProjectForm = {
  project_name: '',
  status: 'active',
  manager_name: '',
  manager_phone: '',
  start_date: '',
  end_date: '',
  remark: '',
};

interface ProjectManagerProps {
  initialMode?: 'add' | 'edit';
  hideModeSwitch?: boolean;
}

export default function ProjectManager({ initialMode = 'add', hideModeSwitch = false }: ProjectManagerProps) {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ProjectStatus>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [mode, setMode] = useState<'add' | 'edit'>(initialMode);
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState<ProjectForm>(EMPTY_FORM);
  const [editForm, setEditForm] = useState<ProjectForm>(EMPTY_FORM);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchProjects();
      setProjects(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch projects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return projects.filter((p) => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (!q) return true;
      return [
        p.project_name ?? '',
        p.manager_name ?? '',
        p.manager_phone ?? '',
        p.remark ?? '',
      ].some((v) => v.toLowerCase().includes(q));
    });
  }, [projects, search, statusFilter]);

  const resetEdit = () => {
    setEditingId(null);
    setEditForm(EMPTY_FORM);
  };

  const startEdit = (p: ProjectRecord) => {
    setMessage('');
    setError('');
    setEditingId(p.id);
    setEditForm({
      project_name: p.project_name ?? '',
      status: (p.status as ProjectStatus) ?? 'active',
      manager_name: p.manager_name ?? '',
      manager_phone: p.manager_phone ?? '',
      start_date: p.start_date ?? '',
      end_date: p.end_date ?? '',
      remark: p.remark ?? '',
    });
    setMode('edit');
  };

  const selectEditById = (id: string) => {
    const p = projects.find((x) => x.id === id);
    if (!p) {
      resetEdit();
      return;
    }
    startEdit(p);
  };

  const saveCreate = async () => {
    const name = createForm.project_name.trim();
    if (!name) {
      setError('Project name is required.');
      return;
    }
    setCreating(true);
    setError('');
    setMessage('');
    try {
      const payload = {
        project_name: name,
        status: createForm.status,
        manager_name: createForm.manager_name.trim() || null,
        manager_phone: createForm.manager_phone.trim() || null,
        start_date: createForm.start_date || null,
        end_date: createForm.end_date || null,
        remark: createForm.remark.trim() || null,
      };
      const res = await fetch(apiUrl('/api/v1/projects'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || body.error || 'Failed to save project');
      }
      setMessage('Project created.');
      setCreateForm(EMPTY_FORM);
      setMode('edit');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create project.');
    } finally {
      setCreating(false);
    }
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const name = editForm.project_name.trim();
    if (!name) {
      setError('Project name is required.');
      return;
    }
    setUpdating(true);
    setError('');
    setMessage('');
    try {
      const payload = {
        project_name: name,
        status: editForm.status,
        manager_name: editForm.manager_name.trim() || null,
        manager_phone: editForm.manager_phone.trim() || null,
        start_date: editForm.start_date || null,
        end_date: editForm.end_date || null,
        remark: editForm.remark.trim() || null,
      };
      const res = await fetch(apiUrl(`/api/v1/projects/${encodeURIComponent(editingId)}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || body.error || 'Failed to update project');
      }
      setMessage('Project updated.');
      resetEdit();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update project.');
    } finally {
      setUpdating(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this project? This is blocked if assets are linked.')) return;
    setDeletingId(id);
    setError('');
    setMessage('');
    try {
      const res = await fetch(apiUrl(`/api/v1/projects/${encodeURIComponent(id)}`), {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || body.error || 'Failed to delete project');
      }
      setMessage('Project deleted.');
      if (editingId === id) resetEdit();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete project.');
    } finally {
      setDeletingId(null);
    }
  };

  const statusBadgeVariant = (status?: string) => {
    if (status === 'active') return 'default' as const;
    if (status === 'inactive') return 'secondary' as const;
    return 'outline' as const;
  };

  return (
    <div className="space-y-4">
      {!hideModeSwitch && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Project Actions</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Tabs value={mode} onValueChange={(v) => setMode(v as 'add' | 'edit')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="add">Add New Project</TabsTrigger>
                <TabsTrigger value="edit">Edit Existing Project</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {mode === 'add' && (
      <Card>
        <CardHeader className="pb-3 border-b bg-gradient-to-r from-emerald-50 to-background dark:from-emerald-950/20 dark:to-background">
          <CardTitle className="text-base flex items-center gap-2">
            <PlusCircle className="h-4 w-4 text-emerald-600" />
            Add New Project Location
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Create a project with location, status, and optional management details.
          </p>
        </CardHeader>
        <CardContent className="space-y-5 pt-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="project_name">Project Name *</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="project_name"
                value={createForm.project_name}
                onChange={(e) => setCreateForm((f) => ({ ...f, project_name: e.target.value }))}
                placeholder="e.g. Addis Ababa Ring Road Section A"
                className="pl-9 h-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={createForm.status}
              onChange={(e) => setCreateForm((f) => ({ ...f, status: e.target.value as ProjectStatus }))}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm"
            >
              <option value="active">active</option>
              <option value="inactive">inactive</option>
              <option value="closed">closed</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="manager_name">Manager Name</Label>
            <div className="relative">
              <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="manager_name"
                value={createForm.manager_name}
                onChange={(e) => setCreateForm((f) => ({ ...f, manager_name: e.target.value }))}
                className="pl-9 h-10"
                placeholder="Enter manager name"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="manager_phone">Manager Phone</Label>
            <Input
              id="manager_phone"
              value={createForm.manager_phone}
              onChange={(e) => setCreateForm((f) => ({ ...f, manager_phone: e.target.value }))}
              className="h-10"
              placeholder="e.g. 0911121314"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="start_date">Start Date</Label>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="start_date"
                type="date"
                value={createForm.start_date}
                onChange={(e) => setCreateForm((f) => ({ ...f, start_date: e.target.value }))}
                className="pl-9 h-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="end_date">End Date</Label>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="end_date"
                type="date"
                value={createForm.end_date}
                onChange={(e) => setCreateForm((f) => ({ ...f, end_date: e.target.value }))}
                className="pl-9 h-10"
              />
            </div>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="remark">Remark</Label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <textarea
                id="remark"
                rows={3}
                value={createForm.remark}
                onChange={(e) => setCreateForm((f) => ({ ...f, remark: e.target.value }))}
                className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm"
                placeholder="Add notes, scope, or any project-specific detail..."
              />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button onClick={saveCreate} disabled={creating} className="min-w-[160px] bg-emerald-600 hover:bg-emerald-700">
            {creating ? 'Creating...' : 'Create Project'}
          </Button>
        </div>
        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p>}
        {message && <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2">{message}</p>}
        </CardContent>
      </Card>
      )}

      {mode === 'edit' && (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Update Existing Project Location</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="edit_project_select">Select Project</Label>
            <select
              id="edit_project_select"
              value={editingId ?? ''}
              onChange={(e) => selectEditById(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Select a project to edit</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.project_name}
                </option>
              ))}
            </select>
          </div>
          {editingId ? (
            <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="edit_project_name">Project Name *</Label>
              <Input
                id="edit_project_name"
                value={editForm.project_name}
                onChange={(e) => setEditForm((f) => ({ ...f, project_name: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit_status">Status</Label>
              <select
                id="edit_status"
                value={editForm.status}
                onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value as ProjectStatus }))}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="active">active</option>
                <option value="inactive">inactive</option>
                <option value="closed">closed</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit_manager_name">Manager Name</Label>
              <Input
                id="edit_manager_name"
                value={editForm.manager_name}
                onChange={(e) => setEditForm((f) => ({ ...f, manager_name: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit_manager_phone">Manager Phone</Label>
              <Input
                id="edit_manager_phone"
                value={editForm.manager_phone}
                onChange={(e) => setEditForm((f) => ({ ...f, manager_phone: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit_start_date">Start Date</Label>
              <Input
                id="edit_start_date"
                type="date"
                value={editForm.start_date}
                onChange={(e) => setEditForm((f) => ({ ...f, start_date: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit_end_date">End Date</Label>
              <Input
                id="edit_end_date"
                type="date"
                value={editForm.end_date}
                onChange={(e) => setEditForm((f) => ({ ...f, end_date: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="edit_remark">Remark</Label>
              <textarea
                id="edit_remark"
                rows={2}
                value={editForm.remark}
                onChange={(e) => setEditForm((f) => ({ ...f, remark: e.target.value }))}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={saveEdit} disabled={updating}>
              {updating ? 'Updating...' : 'Update Project'}
            </Button>
            <Button variant="outline" onClick={resetEdit} disabled={updating}>
              Cancel Edit
            </Button>
          </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Select a project above to edit or delete.</p>
          )}
        </CardContent>
      </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          <CardTitle className="text-sm">Projects <Badge variant="secondary" className="ml-2">{filtered.length}</Badge></CardTitle>
          <div className="flex gap-2">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search project/manager..."
              className="h-9 w-56"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | ProjectStatus)}
              className="h-9 rounded-md border border-input bg-background px-2 text-sm"
            >
              <option value="all">all status</option>
              <option value="active">active</option>
              <option value="inactive">inactive</option>
              <option value="closed">closed</option>
            </select>
          </div>
        </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4">
        <div className="rounded-lg border border-border w-full">
          <table className="w-full text-xs border-collapse table-fixed">
            <thead className="bg-muted/60">
              <tr className="bg-green-600 text-white text-left text-[11px] font-semibold uppercase tracking-wider">
                <th className="py-2 px-3 w-12 text-right">#</th>
                <th className="py-2 px-3">Project</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3">Manager</th>
                <th className="py-2 px-3">Phone</th>
                <th className="py-2 px-3 text-center w-24">Details</th>
                <th className="py-2 px-3 text-center w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="px-3 py-3 text-muted-foreground" colSpan={7}>Loading projects...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td className="px-3 py-8 text-muted-foreground text-center" colSpan={7}>No projects found.</td></tr>
              ) : (
                filtered.map((p, index) => (
                  <>
                    <tr key={p.id} className={`border-b border-border/60 ${index % 2 === 0 ? 'bg-background' : 'bg-muted/5'}`}>
                      <td className="py-2 px-3 text-right text-muted-foreground tabular-nums">{index + 1}</td>
                      <td className="py-2 px-3 font-medium truncate" title={p.project_name}>{p.project_name}</td>
                      <td className="py-2 px-3">
                        <Badge variant={statusBadgeVariant(p.status)}>{p.status}</Badge>
                      </td>
                      <td className="py-2 px-3 truncate">{p.manager_name || '—'}</td>
                      <td className="py-2 px-3 truncate">{p.manager_phone || '—'}</td>
                      <td className="py-2 px-3 text-center">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-xs"
                          onClick={() => setExpandedProjectId(expandedProjectId === p.id ? null : p.id)}
                        >
                          {expandedProjectId === p.id ? (
                            <><ChevronUp className="h-3.5 w-3.5 mr-1" /> Hide</>
                          ) : (
                            <><ChevronDown className="h-3.5 w-3.5 mr-1" /> Show</>
                          )}
                        </Button>
                      </td>
                      <td className="py-2 px-3">
                        <div className="inline-flex items-center justify-center w-full gap-1">
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-blue-600 hover:bg-blue-100" onClick={() => startEdit(p)} title="Edit">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-red-600 hover:bg-red-100"
                            onClick={() => remove(p.id)}
                            disabled={deletingId === p.id}
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                    {expandedProjectId === p.id && (
                      <tr className="bg-muted/10 border-b border-border/60">
                        <td colSpan={7} className="px-4 py-3">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                            <div className="rounded-md border bg-background p-2">
                              <p className="text-muted-foreground mb-1">Start Date</p>
                              <p className="font-medium">{p.start_date || '—'}</p>
                            </div>
                            <div className="rounded-md border bg-background p-2">
                              <p className="text-muted-foreground mb-1">End Date</p>
                              <p className="font-medium">{p.end_date || '—'}</p>
                            </div>
                            <div className="rounded-md border bg-background p-2 sm:col-span-1">
                              <p className="text-muted-foreground mb-1">Remark</p>
                              <p className="font-medium break-words">{p.remark || '—'}</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
        </CardContent>
      </Card>
    </div>
  );
}
