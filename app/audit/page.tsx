'use client';

import type { ReactNode } from 'react';
import { useState, useEffect, useCallback } from 'react';
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
import { History, Download, ChevronLeft, ChevronRight, X, User, Clock, Hash, Activity, FileText } from 'lucide-react';

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

  const fetchAudit = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (userPhone) params.set('user_phone', userPhone);
    if (action) params.set('action', action);
    if (entityType) params.set('entity_type', entityType);
    if (sessionIdFilter) params.set('session_id', sessionIdFilter);
    if (fromDate) params.set('from_date', fromDate);
    if (toDate) params.set('to_date', toDate);
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
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-muted-foreground" />
            <h1 className="text-xl font-semibold text-foreground">Audit Trail</h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            disabled={!data.length || exporting}
          >
            <Download className="h-4 w-4 mr-2" />
            {exporting ? 'Exporting...' : 'Export to CSV'}
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
              <div className="space-y-2">
                <Label className="text-xs">Session ID</Label>
                <Input
                  placeholder="Filter by session (one login)"
                  value={sessionIdFilter}
                  onChange={(e) => setSessionIdFilter(e.target.value.trim())}
                  className="h-9 font-mono text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">From date</Label>
                <Input
                  type="datetime-local"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">To date</Label>
                <Input
                  type="datetime-local"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="h-9"
                />
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
            <div className="flex flex-wrap items-center gap-2">
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
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-muted/70 border-b-2 border-border">
                        <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Record ID</th>
                        <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date &amp; time</th>
                        <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">User name</th>
                        <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Phone number</th>
                        <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Session ID</th>
                        <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Action</th>
                        <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Entity type</th>
                        <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Entity ID</th>
                        <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="p-8 text-center text-muted-foreground">
                            No audit entries found.
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
                            className={`border-b border-border hover:bg-muted/20 cursor-pointer ${idx % 2 === 1 ? 'bg-muted/5' : ''}`}
                          >
                            <td className="p-4 text-sm tabular-nums text-muted-foreground">{row.id}</td>
                            <td className="p-4 text-sm tabular-nums whitespace-nowrap">{formatDateTime(row.created_at)}</td>
                            <td className="p-4 text-sm font-medium">{row.user_name}</td>
                            <td className="p-4 text-sm font-mono text-muted-foreground">{row.user_phone}</td>
                            <td className="p-4 text-xs font-mono max-w-[12rem]" onClick={(e) => e.stopPropagation()}>
                              {row.session_id ? (
                                <button
                                  type="button"
                                  onClick={() => { setSessionIdFilter(row.session_id!); setPage(1); }}
                                  className="text-left hover:underline text-green-600 dark:text-green-400 break-all"
                                  title="Click to filter by this session"
                                >
                                  {row.session_id}
                                </button>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </td>
                            <td className="p-4 text-sm font-medium">{formatAction(row.action)}</td>
                            <td className="p-4 text-sm">{row.entity_type ?? <span className="text-muted-foreground">—</span>}</td>
                            <td className="p-4 text-sm font-mono">{row.entity_id ?? <span className="text-muted-foreground">—</span>}</td>
                            <td className="p-4 text-sm min-w-[10rem] max-w-md align-top max-h-48 overflow-y-auto">
                              <p className="text-xs text-muted-foreground mb-1.5 leading-snug">{getPlainEnglishSummary(row)}</p>
                              {formatDetails(row.details)}
                              <span className="block mt-1 text-green-600 dark:text-green-400 text-xs font-medium">Click row for full flow →</span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-between gap-4 p-3 border-t border-border">
                    <span className="text-xs text-muted-foreground">
                      Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-xs tabular-nums">
                        Page {page} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages}
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setSelectedRow(null)}
            role="dialog"
            aria-modal="true"
            aria-label="Audit record details"
          >
            <Card
              className="w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <CardHeader className="flex flex-row items-start justify-between gap-4 border-b bg-muted/30 pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-600" />
                  Audit record #{selectedRow.id}
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setSelectedRow(null)} aria-label="Close">
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-0 overflow-y-auto flex-1">
                <div className="p-4 space-y-4">
                  <p className="text-sm font-medium text-foreground bg-muted/50 rounded-lg border border-border p-3 leading-relaxed">
                    {getPlainEnglishSummary(selectedRow)}
                  </p>
                  <div className="flex items-start gap-3 rounded-lg border bg-card p-3">
                    <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">When</p>
                      <p className="text-sm font-medium mt-0.5">{formatDateTime(selectedRow.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-lg border bg-card p-3">
                    <User className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Who</p>
                      <p className="text-sm font-medium mt-0.5">{selectedRow.user_name}</p>
                      <p className="text-xs font-mono text-muted-foreground mt-0.5">{selectedRow.user_phone}</p>
                    </div>
                  </div>
                  {selectedRow.session_id && (
                    <div className="flex items-start gap-3 rounded-lg border bg-card p-3">
                      <Hash className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Session ID</p>
                        <p className="text-xs font-mono break-all mt-0.5">{selectedRow.session_id}</p>
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 mt-1 text-green-600"
                          onClick={() => { setSessionIdFilter(selectedRow.session_id!); setPage(1); setSelectedRow(null); }}
                        >
                          Filter by this session
                        </Button>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3 rounded-lg border bg-card p-3">
                    <Activity className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Action</p>
                      <p className="text-sm font-medium mt-0.5">{formatAction(selectedRow.action)}</p>
                    </div>
                  </div>
                  {(selectedRow.entity_type || selectedRow.entity_id) && (
                    <div className="flex items-start gap-3 rounded-lg border bg-card p-3">
                      <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
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
                  <div className="rounded-lg border bg-card p-3">
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
