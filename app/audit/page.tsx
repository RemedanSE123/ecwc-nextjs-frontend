'use client';

import type { ReactNode } from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { AUTH_ACCOUNTS } from '@/lib/auth';
import { exportAssetsToCsv } from '@/lib/export-utils';
import { History, Download, ChevronLeft, ChevronRight, X, User, Clock, Hash, Activity, FileText, Columns, Calendar, FilterX, Filter } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

const ACTIONS = [
  { value: '', label: 'All actions' },
  { value: 'login', label: 'Login' },
  { value: 'logout', label: 'Logout' },
  { value: 'asset_create', label: 'Asset create' },
  { value: 'asset_update', label: 'Asset update' },
  { value: 'asset_delete', label: 'Asset delete' },
  { value: 'asset_upload', label: 'Asset upload' },
];

const ENTITY_TYPES = [
  { value: '', label: 'All' },
  { value: 'asset', label: 'Asset' },
];

const SORT_OPTIONS = [
  { value: 'created_at_desc', label: 'Newest first' },
  { value: 'created_at_asc', label: 'Oldest first' },
];

const PAGE_SIZES = [10, 25, 50, 100];

export interface AuditLogEntry {
  id: number;
  user_phone: string;
  user_name: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
  session_id: string | null;
}

interface AuditResponse {
  data: AuditLogEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      dateStyle: 'short',
      timeStyle: 'medium',
    });
  } catch {
    return iso;
  }
}

function formatAction(action: string): string {
  const found = ACTIONS.find((a) => a.value === action);
  return found?.label ?? action;
}

/** Badge style by action type for table and modal */
function getActionBadgeClass(action: string): string {
  const base = 'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold';
  switch (action) {
    case 'login':
      return `${base} bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/50`;
    case 'logout':
      return `${base} bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/50`;
    case 'asset_create':
      return `${base} bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/50`;
    case 'asset_update':
      return `${base} bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/50`;
    case 'asset_delete':
      return `${base} bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300 border border-red-200/60 dark:border-red-800/50`;
    case 'asset_upload':
      return `${base} bg-violet-100 text-violet-800 dark:bg-violet-950/50 dark:text-violet-300 border border-violet-200/60 dark:border-violet-800/50`;
    default:
      return `${base} bg-muted text-muted-foreground border border-border`;
  }
}

const DETAIL_KEY_ORDER = [
  'asset_id', 'deleted_id', 'filename', 'key',
  'previous_data', 'updated_data', 'changes', 'changed_fields',
  'created_fields', 'deleted_asset', 'asset_snapshot',
  'reason', 'description',
];

/** Format details object as readable key-value lines (human-friendly) */
function formatDetails(details: Record<string, unknown> | null): ReactNode {
  if (!details || typeof details !== 'object') return <span className="text-muted-foreground">—</span>;
  const entries = Object.entries(details).filter(([, v]) => v !== null && v !== undefined);
  if (entries.length === 0) return <span className="text-muted-foreground">—</span>;
  entries.sort(([a], [b]) => {
    const i = DETAIL_KEY_ORDER.indexOf(a);
    const j = DETAIL_KEY_ORDER.indexOf(b);
    if (i !== -1 && j !== -1) return i - j;
    if (i !== -1) return -1;
    if (j !== -1) return 1;
    return a.localeCompare(b);
  });
  return (
    <div className="space-y-3 text-xs">
      {entries.map(([k, v]) => (
        <div key={k} className="flex flex-col gap-1">
          <span className="font-medium text-muted-foreground shrink-0">{formatDetailKey(k)}</span>
          <div className="break-all min-w-0 pl-0">{formatDetailValue(k, v)}</div>
        </div>
      ))}
    </div>
  );
}

/** Human-readable labels for all possible detail keys (for non-technical users) */
const FIELD_LABELS: Record<string, string> = {
  reason: 'Reason',
  description: 'Description',
  category: 'Category',
  changed_fields: 'Updated fields',
  changes: 'What changed',
  created_fields: 'Created asset (all values)',
  previous_data: 'Previous data (before edit)',
  updated_data: 'Updated data (after edit)',
  deleted_asset: 'Deleted asset (all values)',
  deleted_id: 'Deleted asset ID',
  asset_snapshot: 'Which asset (at time of upload)',
  asset_id: 'Asset ID',
  key: 'File key',
  filename: 'Filename',
  image_s3_key: 'Image',
  project_location: 'Project location',
  asset_no: 'Asset number',
  serial_no: 'Serial number',
  make: 'Make',
  model: 'Model',
  status: 'Status',
  responsible_person_name: 'Responsible person',
  responsible_person_pno: 'Responsible person phone',
  ownership: 'Ownership',
  remark: 'Remark',
  id: 'ID',
};

function emptyLabel(val: string | null): string {
  return val === null || val === '' ? '—' : val;
}

function formatDetailKey(key: string): string {
  return FIELD_LABELS[key] ?? key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Render a full asset object (previous_data, updated_data, deleted_asset, asset_snapshot) as key-value list */
function renderAssetData(data: Record<string, unknown>): ReactNode {
  const order = [
    'id', 'asset_no', 'description', 'category', 'project_location', 'serial_no', 'make', 'model',
    'status', 'responsible_person_name', 'responsible_person_pno', 'ownership',
    'image_s3_key', 'remark',
  ];
  const keys = order.filter((k) => k in data);
  const rest = Object.keys(data).filter((k) => !keys.includes(k));
  const allKeys = [...keys, ...rest];
  if (allKeys.length === 0) return <span className="text-muted-foreground">—</span>;
  return (
    <ul className="list-none space-y-1.5 mt-1 text-sm">
      {allKeys.map((k) => {
        const v = data[k];
        const val = v == null || v === '' ? '—' : String(v);
        return (
          <li key={k} className="flex flex-wrap gap-x-2 gap-y-0.5">
            <span className="font-medium text-muted-foreground shrink-0">{formatDetailKey(k)}:</span>
            <span className="break-all">{val}</span>
          </li>
        );
      })}
    </ul>
  );
}

/** Render one detail value for display (handles changes, created_fields, changed_fields) */
function formatDetailValue(key: string, v: unknown): ReactNode {
  if (key === 'changes' && Array.isArray(v)) {
    if (v.length === 0) return <span className="text-muted-foreground">No value changes</span>;
    return (
      <ul className="list-none space-y-2 mt-1">
        {v.map((item: { field?: string; from?: string | null; to?: string | null }, i: number) => {
          const field = item?.field ?? '';
          const from = item?.from ?? null;
          const to = item?.to ?? null;
          const label = FIELD_LABELS[field] ?? formatDetailKey(field);
          return (
            <li key={i} className="flex flex-col gap-0.5 text-sm border-l-2 border-green-500/50 pl-2">
              <span className="font-medium text-muted-foreground">{label}</span>
              <span className="break-words">
                Changed from <strong>{emptyLabel(from)}</strong> to <strong>{emptyLabel(to)}</strong>
              </span>
            </li>
          );
        })}
      </ul>
    );
  }
  if (key === 'created_fields' && v !== null && typeof v === 'object' && !Array.isArray(v)) {
    return renderAssetData(v as Record<string, unknown>);
  }
  if ((key === 'previous_data' || key === 'updated_data' || key === 'deleted_asset' || key === 'asset_snapshot') && v !== null && typeof v === 'object' && !Array.isArray(v)) {
    return renderAssetData(v as Record<string, unknown>);
  }
  if (key === 'changed_fields' && Array.isArray(v)) {
    const labels = v.map((k) => (typeof k === 'string' ? FIELD_LABELS[k] ?? formatDetailKey(k) : String(k)));
    if (labels.length === 0) return <span className="text-muted-foreground">—</span>;
    return (
      <ul className="list-none space-y-1 mt-1">
        {labels.map((label, i) => (
          <li key={i} className="flex items-center gap-2 text-sm">
            <span className="text-green-600 dark:text-green-400">•</span>
            <span>{label}</span>
          </li>
        ))}
      </ul>
    );
  }
  if (v === null || v === undefined) return <span className="text-muted-foreground">—</span>;
  if (typeof v === 'object') return <span className="break-all font-mono text-xs">{JSON.stringify(v)}</span>;
  return <span className="break-all">{String(v)}</span>;
}

function detailsToCsvString(details: Record<string, unknown> | null): string {
  if (!details || typeof details !== 'object') return '';
  return Object.entries(details)
    .filter(([, v]) => v !== null && v !== undefined)
    .map(([k, v]) => `${formatDetailKey(k)}: ${typeof v === 'object' ? JSON.stringify(v) : String(v)}`)
    .join('; ');
}

/** One-sentence plain-English summary for non-technical users */
function getPlainEnglishSummary(entry: AuditLogEntry): string {
  const who = entry.user_name || 'Someone';
  const action = entry.action;
  const entityId = entry.entity_id ? ` #${entry.entity_id}` : '';
  const details = entry.details && typeof entry.details === 'object' ? entry.details : {};

  if (action === 'login') {
    return `${who} signed in.`;
  }
  if (action === 'logout') {
    const reason = details.reason as string | undefined;
    return reason ? `${who} signed out (${reason}).` : `${who} signed out.`;
  }
  if (action === 'asset_create') {
    const created = details.created_fields as Record<string, unknown> | undefined;
    const parts = created && typeof created === 'object' ? Object.entries(created).filter(([, v]) => v != null && v !== '') : [];
    if (parts.length === 0) return `${who} created a new asset${entityId}.`;
    const preview = parts.slice(0, 3).map(([k]) => FIELD_LABELS[k] ?? formatDetailKey(k)).join(', ');
    const more = parts.length > 3 ? ` and ${parts.length - 3} more` : '';
    return `${who} created a new asset${entityId} with: ${preview}${more}.`;
  }
  if (action === 'asset_update') {
    const changes = details.changes as Array<{ field: string; from?: string | null; to?: string | null }> | undefined;
    if (changes?.length) {
      const first = changes[0];
      const label = FIELD_LABELS[first.field] ?? formatDetailKey(first.field);
      const from = emptyLabel(first.from ?? null);
      const to = emptyLabel(first.to ?? null);
      if (changes.length === 1) {
        return `${who} updated asset${entityId}: changed ${label} from "${from}" to "${to}".`;
      }
      return `${who} updated asset${entityId}: changed ${label} from "${from}" to "${to}", and ${changes.length - 1} other field${changes.length === 2 ? '' : 's'}.`;
    }
    const oldFields = details.changed_fields as string[] | undefined;
    if (oldFields?.length) {
      return `${who} updated asset${entityId}: ${oldFields.length} field${oldFields.length === 1 ? '' : 's'} updated.`;
    }
    return `${who} updated asset${entityId}.`;
  }
  if (action === 'asset_delete') {
    const deleted = details.deleted_asset as Record<string, unknown> | undefined;
    const idStr = details.deleted_id ?? entry.entity_id ?? '';
    if (deleted && typeof deleted === 'object' && (deleted.asset_no || deleted.description)) {
      const label = [deleted.asset_no, deleted.description].filter(Boolean).join(' – ');
      return `${who} deleted asset #${idStr} (${label}).`;
    }
    return `${who} deleted asset #${idStr}.`;
  }
  if (action === 'asset_upload') {
    const fn = details.filename as string | undefined;
    const snap = details.asset_snapshot as Record<string, unknown> | undefined;
    const which = snap && typeof snap === 'object' ? [snap.asset_no, snap.description].filter(Boolean).join(' – ') : null;
    if (which) return fn ? `${who} uploaded "${fn}" for asset: ${which}.` : `${who} uploaded image for asset: ${which}.`;
    return fn ? `${who} uploaded a file "${fn}" for asset${entityId}.` : `${who} uploaded a file for asset${entityId}.`;
  }
  return `${who} performed ${formatAction(action)}${entityId ? ` on ${entry.entity_type ?? 'item'}${entityId}` : ''}.`;
}

export default function AuditPage() {
  const [userPhone, setUserPhone] = useState('');
  const [action, setAction] = useState('');
  const [entityType, setEntityType] = useState('');
  const [sessionIdFilter, setSessionIdFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [sort, setSort] = useState('created_at_desc');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [response, setResponse] = useState<AuditResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [selectedRow, setSelectedRow] = useState<AuditLogEntry | null>(null);
  const [showEntityId, setShowEntityId] = useState(false);
  const [showSessionId, setShowSessionId] = useState(false);
  const [showPhoneNumber, setShowPhoneNumber] = useState(false);
  const [showEntityType, setShowEntityType] = useState(false);
  const [showEntityTypeFilter, setShowEntityTypeFilter] = useState(false);
  const [showSessionFilter, setShowSessionFilter] = useState(false);
  const fromDateInputRef = useRef<HTMLInputElement>(null);
  const toDateInputRef = useRef<HTMLInputElement>(null);

  const hasActiveFilters = !!(userPhone || action || entityType || sessionIdFilter || fromDate || toDate || sort !== 'created_at_desc');
  const clearFilters = () => {
    setUserPhone('');
    setAction('');
    setEntityType('');
    setSessionIdFilter('');
    setFromDate('');
    setToDate('');
    setSort('created_at_desc');
    setPage(1);
  };

  const fetchAudit = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (userPhone) params.set('user_phone', userPhone);
    if (action) params.set('action', action);
    if (entityType) params.set('entity_type', entityType);
    if (sessionIdFilter) params.set('session_id', sessionIdFilter);
    if (fromDate && fromDate.trim()) {
      const from = new Date(fromDate.trim());
      if (!isNaN(from.getTime())) params.set('from_date', from.toISOString());
    }
    if (toDate && toDate.trim()) {
      const to = new Date(toDate.trim());
      if (!isNaN(to.getTime())) params.set('to_date', to.toISOString());
    }
    params.set('page', String(page));
    params.set('limit', String(limit));
    params.set('sort', sort);
    try {
      const res = await fetch(`/api/audit?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch audit log');
      const data: AuditResponse = await res.json();
      setResponse(data);
    } catch (err) {
      console.error(err);
      setResponse(null);
    } finally {
      setLoading(false);
    }
  }, [userPhone, action, entityType, sessionIdFilter, fromDate, toDate, page, limit, sort]);

  useEffect(() => {
    fetchAudit();
  }, [fetchAudit]);

  const handleExportCsv = () => {
    if (!response?.data?.length) return;
    setExporting(true);
    const rows = response.data.map((row) => ({
      id: row.id,
      created_at: row.created_at,
      user_name: row.user_name,
      user_phone: row.user_phone,
      session_id: row.session_id ?? '',
      action: row.action,
      entity_type: row.entity_type ?? '',
      entity_id: row.entity_id ?? '',
      details: detailsToCsvString(row.details),
    }));
    exportAssetsToCsv(rows, `audit-trail-${new Date().toISOString().slice(0, 10)}.csv`);
    setExporting(false);
  };

  const total = response?.total ?? 0;
  const totalPages = response?.totalPages ?? 0;
  const data = response?.data ?? [];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Hero header */}
        <div className="relative overflow-hidden rounded-xl border border-border/80 bg-gradient-to-br from-emerald-50/80 via-teal-50/40 to-slate-50/60 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-slate-950/40 shadow-sm">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.15),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.08),transparent)]" />
          <div className="relative flex flex-wrap items-center justify-between gap-4 p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/15 dark:bg-emerald-400/10 border border-emerald-200/50 dark:border-emerald-800/50 shadow-inner">
                <History className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Audit Trail</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Track logins, asset changes, and activity across your team
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {total > 0 && (
                <span className="rounded-lg bg-background/80 dark:bg-background/60 px-3 py-1.5 text-xs font-semibold tabular-nums text-muted-foreground border border-border/60">
                  {total.toLocaleString()} record{total !== 1 ? 's' : ''}
                </span>
              )}
              <Button
                variant="default"
                size="sm"
                onClick={handleExportCsv}
                disabled={!data.length || exporting}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white shadow-sm"
              >
                <Download className="h-4 w-4" />
                {exporting ? 'Exporting...' : 'Export CSV'}
              </Button>
            </div>
          </div>
        </div>

        <Card className="border-border/80 shadow-sm overflow-hidden bg-gradient-to-b from-card to-muted/20 dark:to-muted/10">
          <CardHeader className="pb-3 flex flex-row items-center justify-between gap-2 border-b border-border/60 bg-muted/20 dark:bg-muted/10">
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Filters
            </CardTitle>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                <FilterX className="h-4 w-4" />
                Clear filters
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">User</Label>
                <Select value={userPhone || 'all'} onValueChange={(v) => setUserPhone(v === 'all' ? '' : v)}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="All users" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All users</SelectItem>
                    {AUTH_ACCOUNTS.map((a) => (
                      <SelectItem key={a.phone} value={a.phone}>
                        {a.name} ({a.phone})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Action</Label>
                <Select value={action || 'all'} onValueChange={(v) => setAction(v === 'all' ? '' : v)}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="All actions" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIONS.map((a) => (
                      <SelectItem key={a.value || 'all'} value={a.value || 'all'}>
                        {a.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {showEntityTypeFilter && (
                <div className="space-y-2">
                  <Label className="text-xs">Entity type</Label>
                  <Select value={entityType || 'all'} onValueChange={(v) => setEntityType(v === 'all' ? '' : v)}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      {ENTITY_TYPES.map((e) => (
                        <SelectItem key={e.value || 'all'} value={e.value || 'all'}>
                          {e.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {showSessionFilter && (
                <div className="space-y-2">
                  <Label className="text-xs">Filter by session (one login)</Label>
                  <Input
                    placeholder="Session ID"
                    value={sessionIdFilter}
                    onChange={(e) => setSessionIdFilter(e.target.value.trim())}
                    className="h-9 font-mono text-xs"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label className="text-xs">From date</Label>
                <div
                  className="flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 cursor-pointer"
                  onClick={() => {
                    fromDateInputRef.current?.focus();
                    if (typeof (fromDateInputRef.current as HTMLInputElement & { showPicker?: () => void })?.showPicker === 'function') {
                      (fromDateInputRef.current as HTMLInputElement & { showPicker?: () => void }).showPicker?.();
                    }
                  }}
                >
                  <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <input
                    ref={fromDateInputRef}
                    type="datetime-local"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="flex-1 min-w-0 bg-transparent border-0 p-0 text-foreground outline-none cursor-pointer [color-scheme:inherit]"
                    title="Click to open calendar and time"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">To date</Label>
                <div
                  className="flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 cursor-pointer"
                  onClick={() => {
                    toDateInputRef.current?.focus();
                    if (typeof (toDateInputRef.current as HTMLInputElement & { showPicker?: () => void })?.showPicker === 'function') {
                      (toDateInputRef.current as HTMLInputElement & { showPicker?: () => void }).showPicker?.();
                    }
                  }}
                >
                  <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <input
                    ref={toDateInputRef}
                    type="datetime-local"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="flex-1 min-w-0 bg-transparent border-0 p-0 text-foreground outline-none cursor-pointer [color-scheme:inherit]"
                    title="Click to open calendar and time"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Sort</Label>
                <Select value={sort} onValueChange={setSort}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-3 pt-2 border-t border-border">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">Show filters</span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    type="checkbox"
                    checked={showEntityTypeFilter}
                    onChange={(e) => setShowEntityTypeFilter(e.target.checked)}
                  />
                  <span className="text-xs">Entity type</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    type="checkbox"
                    checked={showSessionFilter}
                    onChange={(e) => setShowSessionFilter(e.target.checked)}
                  />
                  <span className="text-xs">Filter by session (one login)</span>
                </label>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Columns className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">Show columns</span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    type="checkbox"
                    checked={showEntityId}
                    onChange={(e) => setShowEntityId(e.target.checked)}
                  />
                  <span className="text-xs">Entity ID</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    type="checkbox"
                    checked={showSessionId}
                    onChange={(e) => setShowSessionId(e.target.checked)}
                  />
                  <span className="text-xs">Filter by session (one login)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    type="checkbox"
                    checked={showPhoneNumber}
                    onChange={(e) => setShowPhoneNumber(e.target.checked)}
                  />
                  <span className="text-xs">Phone number</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    type="checkbox"
                    checked={showEntityType}
                    onChange={(e) => setShowEntityType(e.target.checked)}
                  />
                  <span className="text-xs">Entity type</span>
                </label>
                <div className="flex flex-wrap items-center gap-2 ml-auto">
                  <Label className="text-xs">Page size</Label>
                  <Select value={String(limit)} onValueChange={(v) => { setLimit(Number(v)); setPage(1); }}>
                    <SelectTrigger className="h-9 w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAGE_SIZES.map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 space-y-3">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-700 dark:to-teal-700 text-white">
                        <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider">Record ID</th>
                        <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider">Date &amp; time</th>
                        <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider">User name</th>
                        {showPhoneNumber && <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider">Phone number</th>}
                        {showSessionId && <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider">Session ID</th>}
                        <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider">Action</th>
                        {showEntityType && <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider">Entity type</th>}
                        {showEntityId && <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider">Entity ID</th>}
                        <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.length === 0 ? (
                        <tr>
                          <td colSpan={5 + (showPhoneNumber ? 1 : 0) + (showSessionId ? 1 : 0) + (showEntityType ? 1 : 0) + (showEntityId ? 1 : 0)} className="p-12 text-center">
                            <div className="flex flex-col items-center gap-3 text-muted-foreground">
                              <div className="rounded-full bg-muted/80 p-4">
                                <History className="h-8 w-8 text-muted-foreground/70" />
                              </div>
                              <p className="text-sm font-medium">No audit entries found</p>
                              <p className="text-xs max-w-sm">Try adjusting your filters or date range.</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        data.map((row, idx) => (
                          <tr
                            key={row.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => setSelectedRow(row)}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedRow(row); } }}
                            className={`border-b border-border/60 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 cursor-pointer transition-colors ${idx % 2 === 1 ? 'bg-muted/30' : 'bg-background'}`}
                          >
                            <td className="p-4 text-sm tabular-nums text-muted-foreground font-medium">{row.id}</td>
                            <td className="p-4 text-sm tabular-nums whitespace-nowrap text-foreground/90">{formatDateTime(row.created_at)}</td>
                            <td className="p-4 text-sm font-semibold text-foreground">{row.user_name}</td>
                            {showPhoneNumber && <td className="p-4 text-sm font-mono text-muted-foreground">{row.user_phone}</td>}
                            {showSessionId && (
                              <td className="p-4 text-xs font-mono max-w-[12rem]" onClick={(e) => e.stopPropagation()}>
                                {row.session_id ? (
                                  <button
                                    type="button"
                                    onClick={() => { setSessionIdFilter(row.session_id!); setPage(1); }}
                                    className="text-left hover:underline text-emerald-600 dark:text-emerald-400 break-all font-medium"
                                    title="Click to filter by this session"
                                  >
                                    {row.session_id}
                                  </button>
                                ) : (
                                  <span className="text-muted-foreground">—</span>
                                )}
                              </td>
                            )}
                            <td className="p-4">
                              <span className={getActionBadgeClass(row.action)}>{formatAction(row.action)}</span>
                            </td>
                            {showEntityType && <td className="p-4 text-sm">{row.entity_type ?? <span className="text-muted-foreground">—</span>}</td>}
                            {showEntityId && <td className="p-4 text-sm font-mono">{row.entity_id ?? <span className="text-muted-foreground">—</span>}</td>}
                            <td className="p-4 text-sm min-w-[10rem] max-w-md align-top h-16 max-h-16 overflow-hidden">
                              <p className="text-xs text-muted-foreground leading-snug line-clamp-2">{getPlainEnglishSummary(row)}</p>
                              <span className="block mt-0.5 text-emerald-600 dark:text-emerald-400 text-xs font-medium">Click row for full detail →</span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-between gap-4 px-4 py-3 border-t border-border/60 bg-muted/20 dark:bg-muted/10">
                    <span className="text-xs text-muted-foreground tabular-nums">
                      Showing <span className="font-semibold text-foreground">{(page - 1) * limit + 1}–{Math.min(page * limit, total)}</span> of {total.toLocaleString()}
                    </span>
                    <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-background p-0.5 shadow-sm">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1}
                        className="h-8 px-2 rounded-md"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="min-w-[6rem] text-center text-xs font-medium tabular-nums px-2">
                        Page {page} of {totalPages}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages}
                        className="h-8 px-2 rounded-md"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Detail flow popup — click any row to see full flow */}
        {selectedRow && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedRow(null)}
            role="dialog"
            aria-modal="true"
            aria-label="Audit record details"
          >
            <Card
              className="w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border-2 border-emerald-200/50 dark:border-emerald-800/50"
              onClick={(e) => e.stopPropagation()}
            >
              <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-border/60 bg-gradient-to-r from-emerald-50/80 to-teal-50/50 dark:from-emerald-950/40 dark:to-teal-950/30 pb-4">
                <CardTitle className="text-lg flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20 dark:bg-emerald-400/10 border border-emerald-200/50 dark:border-emerald-800/50">
                    <Activity className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span>Audit record <span className="font-mono text-emerald-700 dark:text-emerald-300">#{selectedRow.id}</span></span>
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setSelectedRow(null)} aria-label="Close" className="rounded-full hover:bg-destructive/10 hover:text-destructive">
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-0 overflow-y-auto flex-1 bg-muted/5">
                <div className="p-4 space-y-4">
                  <p className="text-sm font-medium text-foreground bg-background rounded-xl border border-border shadow-sm p-4 leading-relaxed">
                    {getPlainEnglishSummary(selectedRow)}
                  </p>
                  <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-card p-3 shadow-sm">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800/50">
                      <Clock className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">When</p>
                      <p className="text-sm font-medium mt-0.5">{formatDateTime(selectedRow.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-card p-3 shadow-sm">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Who</p>
                      <p className="text-sm font-medium mt-0.5">{selectedRow.user_name}</p>
                      <p className="text-xs font-mono text-muted-foreground mt-0.5">{selectedRow.user_phone}</p>
                    </div>
                  </div>
                  {selectedRow.session_id && (
                    <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-card p-3 shadow-sm">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
                        <Hash className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Session ID</p>
                        <p className="text-xs font-mono break-all mt-0.5">{selectedRow.session_id}</p>
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 mt-1 text-emerald-600 dark:text-emerald-400 font-medium"
                          onClick={() => { setSessionIdFilter(selectedRow.session_id!); setPage(1); setSelectedRow(null); }}
                        >
                          Filter by this session
                        </Button>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-card p-3 shadow-sm">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                      <Activity className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Action</p>
                      <p className="mt-0.5"><span className={getActionBadgeClass(selectedRow.action)}>{formatAction(selectedRow.action)}</span></p>
                    </div>
                  </div>
                  {(selectedRow.entity_type || selectedRow.entity_id) && (
                    <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-card p-3 shadow-sm">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900/30">
                        <FileText className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Entity</p>
                        <p className="text-sm mt-0.5">
                          {selectedRow.entity_type && <span className="font-medium">{selectedRow.entity_type}</span>}
                          {selectedRow.entity_type && selectedRow.entity_id && ' · '}
                          {selectedRow.entity_id && <span className="font-mono text-muted-foreground">{selectedRow.entity_id}</span>}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="rounded-xl border border-border/60 bg-card p-3 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Details</p>
                    {selectedRow.details && typeof selectedRow.details === 'object' && Object.keys(selectedRow.details).length > 0 ? (
                      formatDetails(selectedRow.details)
                    ) : (
                      <p className="text-sm text-muted-foreground">— No extra details</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}
