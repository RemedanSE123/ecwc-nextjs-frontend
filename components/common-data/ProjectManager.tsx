'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getAuthHeaders } from '@/lib/auth';
import type { ProjectRecord } from '@/lib/api/assets';
import { fetchProjects } from '@/lib/api/assets';

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

export default function ProjectManager() {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ProjectStatus>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProjectForm>(EMPTY_FORM);

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

  const resetForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const startEdit = (p: ProjectRecord) => {
    setMessage('');
    setError('');
    setEditingId(p.id);
    setForm({
      project_name: p.project_name ?? '',
      status: (p.status as ProjectStatus) ?? 'active',
      manager_name: p.manager_name ?? '',
      manager_phone: p.manager_phone ?? '',
      start_date: p.start_date ?? '',
      end_date: p.end_date ?? '',
      remark: p.remark ?? '',
    });
  };

  const save = async () => {
    const name = form.project_name.trim();
    if (!name) {
      setError('Project name is required.');
      return;
    }
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const payload = {
        project_name: name,
        status: form.status,
        manager_name: form.manager_name.trim() || null,
        manager_phone: form.manager_phone.trim() || null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        remark: form.remark.trim() || null,
      };
      const url = editingId ? `/api/projects/${encodeURIComponent(editingId)}` : '/api/projects';
      const method = editingId ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || body.error || 'Failed to save project');
      }
      setMessage(editingId ? 'Project updated.' : 'Project created.');
      resetForm();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save project.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this project? This is blocked if assets are linked.')) return;
    setDeletingId(id);
    setError('');
    setMessage('');
    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || body.error || 'Failed to delete project');
      }
      setMessage('Project deleted.');
      if (editingId === id) resetForm();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete project.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-background p-4 space-y-3">
        <h3 className="text-sm font-semibold">{editingId ? 'Edit Project' : 'Create Project'}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="project_name">Project Name *</Label>
            <Input
              id="project_name"
              value={form.project_name}
              onChange={(e) => setForm((f) => ({ ...f, project_name: e.target.value }))}
              placeholder="e.g. Addis Ababa Ring Road Section A"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as ProjectStatus }))}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="active">active</option>
              <option value="inactive">inactive</option>
              <option value="closed">closed</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="manager_name">Manager Name</Label>
            <Input
              id="manager_name"
              value={form.manager_name}
              onChange={(e) => setForm((f) => ({ ...f, manager_name: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="manager_phone">Manager Phone</Label>
            <Input
              id="manager_phone"
              value={form.manager_phone}
              onChange={(e) => setForm((f) => ({ ...f, manager_phone: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="start_date">Start Date</Label>
            <Input
              id="start_date"
              type="date"
              value={form.start_date}
              onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="end_date">End Date</Label>
            <Input
              id="end_date"
              type="date"
              value={form.end_date}
              onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="remark">Remark</Label>
            <textarea
              id="remark"
              rows={2}
              value={form.remark}
              onChange={(e) => setForm((f) => ({ ...f, remark: e.target.value }))}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={save} disabled={saving}>
            {saving ? 'Saving...' : editingId ? 'Update Project' : 'Create Project'}
          </Button>
          {editingId && (
            <Button variant="outline" onClick={resetForm} disabled={saving}>
              Cancel Edit
            </Button>
          )}
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {message && <p className="text-sm text-emerald-700">{message}</p>}
      </div>

      <div className="rounded-lg border bg-background p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          <h3 className="text-sm font-semibold">Projects ({filtered.length})</h3>
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

        <div className="overflow-auto rounded border">
          <table className="w-full text-xs">
            <thead className="bg-muted/60">
              <tr>
                <th className="text-left px-2 py-2">Project</th>
                <th className="text-left px-2 py-2">Status</th>
                <th className="text-left px-2 py-2">Manager</th>
                <th className="text-left px-2 py-2">Phone</th>
                <th className="text-left px-2 py-2">Start</th>
                <th className="text-left px-2 py-2">End</th>
                <th className="text-left px-2 py-2">Remark</th>
                <th className="text-right px-2 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="px-2 py-3 text-muted-foreground" colSpan={8}>Loading projects...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td className="px-2 py-3 text-muted-foreground" colSpan={8}>No projects found.</td></tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="px-2 py-2 font-medium">{p.project_name}</td>
                    <td className="px-2 py-2">{p.status}</td>
                    <td className="px-2 py-2">{p.manager_name || '—'}</td>
                    <td className="px-2 py-2">{p.manager_phone || '—'}</td>
                    <td className="px-2 py-2">{p.start_date || '—'}</td>
                    <td className="px-2 py-2">{p.end_date || '—'}</td>
                    <td className="px-2 py-2 max-w-[220px] truncate" title={p.remark ?? ''}>{p.remark || '—'}</td>
                    <td className="px-2 py-2">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => startEdit(p)}>Edit</Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => remove(p.id)}
                          disabled={deletingId === p.id}
                        >
                          {deletingId === p.id ? 'Deleting...' : 'Delete'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
