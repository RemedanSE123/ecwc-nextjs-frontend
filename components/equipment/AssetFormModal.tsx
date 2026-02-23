'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Asset } from '@/types/asset';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import AssetForm from './AssetForm';

interface AssetFormModalProps {
  asset?: Asset | null;
  defaultCategory?: string;
  /** Category group slug (e.g. plant-equipment) for fetching description/other options by category. */
  categoryGroup?: string;
  onSuccess: (asset: Asset) => void;
  onClose: () => void;
}

export default function AssetFormModal({
  asset,
  defaultCategory,
  categoryGroup,
  onSuccess,
  onClose,
}: AssetFormModalProps) {
  const title = asset ? 'Edit Asset' : 'Create Asset';
  const subtitle = asset ? 'Update equipment details' : 'Register new equipment';

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Full-screen backdrop — covers entire viewport including header */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md animate-in fade-in-0 duration-300"
        onClick={onClose}
        aria-hidden
      />

      {/* Modal card — polished, attractive design */}
      <div
        className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col rounded-2xl border border-border/80 border-t-4 border-t-primary bg-card shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] ring-1 ring-black/5 animate-in zoom-in-95 fade-in-0 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: branding + form title (no logo) */}
        <div className="shrink-0 flex items-center justify-between border-b border-border/80 bg-gradient-to-r from-emerald-50/90 via-green-50/60 to-primary/5 dark:from-emerald-950/40 dark:via-green-950/30 dark:to-primary/10 px-6 py-4 pr-14">
          <div>
            <p className="text-sm font-semibold text-foreground">
              ኢትየጵያ ኮንስትራክሽን ሥራዎች ኮርፖሬሽን
            </p>
            <p className="text-[10px] font-medium text-muted-foreground mt-0.5">
              ETHIOPIAN CONSTRUCTION WORKS CORPORATION
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-foreground">
              {title}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Close button — polished */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/90 dark:bg-gray-900/90 hover:bg-white dark:hover:bg-gray-800 shadow-md hover:shadow-lg ring-1 ring-black/5 hover:ring-primary/30 transition-all z-20"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Form content — scrollable, attractive background */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-gradient-to-b from-muted/10 to-muted/20 dark:from-muted/5 dark:to-muted/10">
          <AssetForm
            asset={asset}
            defaultCategory={defaultCategory}
            categoryGroup={categoryGroup}
            onSuccess={(a) => {
              onSuccess(a);
              onClose();
            }}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modalContent, document.body);
}
