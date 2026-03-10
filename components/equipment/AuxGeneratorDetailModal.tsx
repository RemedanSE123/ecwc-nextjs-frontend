'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { X, Zap } from 'lucide-react';
import { fetchAuxGeneratorDetails, type AuxGeneratorDetails } from '@/lib/api/assets';

interface AuxGeneratorDetailModalProps {
  assetId: string;
  onClose: () => void;
}

function BrIcon({ className }: { className?: string }) {
  return (
    <span className={className}>
      Br
    </span>
  );
}

function DetailRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: React.ReactNode }) {
  const display = value ?? '—';
  return (
    <div className="flex gap-3 py-2.5 px-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#137638]/12 dark:bg-[#137638]/20 text-[#137638] dark:text-emerald-400">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-0.5">{label}</p>
        <p className="text-sm font-medium text-foreground">{display}</p>
      </div>
    </div>
  );
}

export default function AuxGeneratorDetailModal({ assetId, onClose }: AuxGeneratorDetailModalProps) {
  const [details, setDetails] = useState<AuxGeneratorDetails | null>(null);
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
      const result = await fetchAuxGeneratorDetails(assetId);
      setDetails(result.error ? null : result.data);
      if (result.error) setError(result.error);
      setLoading(false);
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
        className="relative w-full max-w-[420px] max-h-[min(480px,85vh)] flex flex-col bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200/80 dark:border-neutral-700/80 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 px-5 py-4 flex items-center justify-between bg-gradient-to-r from-[#137638]/8 to-transparent dark:from-[#137638]/15 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[#137638]/15 dark:bg-[#137638]/25 flex items-center justify-center">
              <Zap className="h-5 w-5 text-[#137638] dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground leading-tight">Generator Rates</h2>
              <p className="text-sm text-muted-foreground">Hourly rates for this auxiliary generator</p>
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
            <div className="flex items-center justify-center py-10">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 rounded-full border-2 border-[#137638]/30 border-t-[#137638] animate-spin" />
                <p className="text-sm text-muted-foreground">Loading…</p>
              </div>
            </div>
          ) : error ? (
            <div className="py-10 text-center">
              <p className="text-sm text-destructive font-medium">{error}</p>
            </div>
          ) : (
            // Always show the three rate rows; if there's no DB row yet, values show as "—"
            (() => {
              const d: AuxGeneratorDetails = details ?? {
                asset_id: assetId,
                rate_op: null,
                rate_idle: null,
                rate_down: null,
                created_at: '',
                updated_at: '',
              };
              return (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <DetailRow
                icon={BrIcon}
                label="Rate/hr (OP) Birr"
                value={
                  d.rate_op != null
                    ? `${Number(d.rate_op).toLocaleString(undefined, { minimumFractionDigits: 2 })} Birr`
                    : null
                }
              />
              <DetailRow
                icon={BrIcon}
                label="Rate/hr (Idle) Birr"
                value={
                  d.rate_idle != null
                    ? `${Number(d.rate_idle).toLocaleString(undefined, { minimumFractionDigits: 2 })} Birr`
                    : null
                }
              />
              <DetailRow
                icon={BrIcon}
                label="Rate/hr (Down) Birr"
                value={
                  d.rate_down != null
                    ? `${Number(d.rate_down).toLocaleString(undefined, { minimumFractionDigits: 2 })} Birr`
                    : null
                }
              />
            </div>
              );
            })()
          )}
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : null;
}

