'use client';

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
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0" onClick={onClose} />
      <div
        className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border bg-background shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between border-b bg-muted/50 px-4 py-3">
          <h3 className="font-semibold text-foreground">
            {asset ? 'Edit Asset' : 'Create Asset'}
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-4">
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
}
