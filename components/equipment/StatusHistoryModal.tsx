'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { X, History, ArrowRight } from 'lucide-react';
import { fetchAssetStatusHistory, type AssetStatusHistoryEntry } from '@/lib/api/assets';

interface StatusHistoryModalProps {
  assetId: string;
  onClose: () => void;
}

type HistoryEntryWithDuration = AssetStatusHistoryEntry & {
  durationDays?: number;
  durationLabel?: string;
};

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function computeDurations(entries: AssetStatusHistoryEntry[]): HistoryEntryWithDuration[] {
  if (!entries || entries.length === 0) return [];

  // Ensure newest first (matches API, but sort defensively)
  const sorted = [...entries].sort((a, b) => {
    const da = new Date(a.created_at).getTime();
    const db = new Date(b.created_at).getTime();
    return db - da;
  });

  const MS_PER_DAY = 24 * 60 * 60 * 1000;

  return sorted.map((entry, index) => {
    const statusToNorm = (entry.status_to ?? '').trim().toLowerCase();
    // No duration label when status changed TO OP/Operational
    if (statusToNorm === 'op' || statusToNorm === 'operational') {
      return { ...entry };
    }

    const startMs = new Date(entry.created_at).getTime();
    const endMs =
      index === 0
        ? Date.now()
        : new Date(sorted[index - 1].created_at).getTime();

    if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs) {
      return { ...entry };
    }

    let days = Math.floor((endMs - startMs) / MS_PER_DAY);
    if (days < 1) days = 1;

    const baseStatus = entry.status_to || '';
    const labelStatus = baseStatus || 'Status';
    const dayWord = days === 1 ? 'day' : 'days';
    const durationLabel = `${labelStatus} for ${days} ${dayWord}`;

    return { ...entry, durationDays: days, durationLabel };
  });
}

function StatusBadge({ status }: { status: string }) {
  const base = 'inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold';
  const lower = status.toLowerCase();
  if (lower === 'operational' || lower === 'op') return <span className={`${base} bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300`}>{status}</span>;
  if (lower === 'idle') return <span className={`${base} bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300`}>{status}</span>;
  if (lower === 'down') return <span className={`${base} bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300`}>{status}</span>;
  return <span className={`${base} bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300`}>{status}</span>;
}

export default function StatusHistoryModal({ assetId, onClose }: StatusHistoryModalProps) {
  const [history, setHistory] = useState<AssetStatusHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchAssetStatusHistory(assetId);
        setHistory(data ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load status history');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [assetId]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const content = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/30 dark:bg-black/40 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[520px] max-h-[min(560px,85vh)] flex flex-col bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200/80 dark:border-neutral-700/80 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 px-5 py-4 flex items-center justify-between bg-gradient-to-r from-[#137638]/8 to-transparent dark:from-[#137638]/15 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[#137638]/15 dark:bg-[#137638]/25 flex items-center justify-center">
              <History className="h-5 w-5 text-[#137638] dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground leading-tight">Status History</h2>
              <p className="text-sm text-muted-foreground">Equipment changes</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center py-14">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 rounded-full border-2 border-[#137638]/30 border-t-[#137638] animate-spin" />
                <p className="text-sm text-muted-foreground">Loading…</p>
              </div>
            </div>
          ) : error ? (
            <div className="py-12 text-center">
              <p className="text-sm text-destructive font-medium">{error}</p>
            </div>
          ) : history.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-muted-foreground">No status history yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {computeDurations(history).slice().reverse().map((entry) => {
                const isIdle =
                  (entry.status_to ?? '').trim().toLowerCase() === 'idle';
                const durationColorClasses = isIdle
                  ? 'bg-blue-50 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200'
                  : 'bg-red-50 text-red-800 dark:bg-red-900/40 dark:text-red-200';

                return (
                  <div
                    key={entry.id}
                    className="flex items-center gap-4 p-3 rounded-lg bg-neutral-50/80 dark:bg-neutral-800/40 hover:bg-neutral-100/80 dark:hover:bg-neutral-800/60 transition-colors border border-transparent hover:border-neutral-200/60 dark:hover:border-neutral-700/50"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {entry.status_from != null && entry.status_from !== '' ? (
                        <span className="flex items-center gap-1.5 shrink-0">
                          <StatusBadge status={entry.status_from} />
                          <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                          <StatusBadge status={entry.status_to} />
                        </span>
                      ) : (
                        <StatusBadge status={entry.status_to} />
                      )}
                    </div>
                    {entry.durationLabel && (
                      <div className="flex-1 flex justify-center">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${durationColorClasses}`}
                        >
                          {entry.durationLabel}
                        </span>
                      </div>
                    )}
                    <div className="shrink-0 text-right min-w-0">
                      <p
                        className="text-xs font-medium text-foreground truncate max-w-[140px]"
                        title={entry.changed_by_name}
                      >
                        {entry.changed_by_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(entry.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : null;
}
