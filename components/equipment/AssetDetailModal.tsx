'use client';

import type { Asset } from '@/types/asset';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, User, Phone, MapPin, FileText } from 'lucide-react';

interface AssetDetailModalProps {
  asset: Asset | null;
  onClose: () => void;
}

export default function AssetDetailModal({ asset, onClose }: AssetDetailModalProps) {
  if (!asset) return null;

  const statusColor =
    asset.status?.toLowerCase().includes('operational') ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
    asset.status?.toLowerCase().includes('repair') ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
    asset.status?.toLowerCase().includes('idle') ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400' :
    'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border bg-background shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b bg-muted/50 px-4 py-3">
          <h3 className="font-semibold text-foreground">
            {asset.asset_no || 'Asset Details'}
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Image placeholder */}
        <div className="flex justify-center p-4 border-b bg-muted/30">
          <div className="w-32 h-24 rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-xs">
            {asset.image_s3_key ? (
              <span>Image</span>
            ) : (
              <span>No image</span>
            )}
          </div>
        </div>

        {/* Details grid */}
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Badge className={statusColor}>{asset.status || 'Unknown'}</Badge>
            <span className="text-sm text-muted-foreground">{asset.category}</span>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground mb-0.5">Description</p>
            <p className="text-sm">{asset.description || '-'}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Asset No</p>
              <p className="text-sm font-medium">{asset.asset_no || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Serial No</p>
              <p className="text-sm font-medium">{asset.serial_no || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Make</p>
              <p className="text-sm font-medium">{asset.make || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Model</p>
              <p className="text-sm font-medium">{asset.model || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Ownership</p>
              <p className="text-sm font-medium">{asset.ownership || '-'}</p>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
            <User className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Responsible Person</p>
              <p className="text-sm font-medium">{asset.responsible_person_name || '-'}</p>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
            <Phone className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Phone Number</p>
              <a href={`tel:${asset.responsible_person_pno}`} className="text-sm font-medium text-green-600 hover:underline">
                {asset.responsible_person_pno || '-'}
              </a>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Project Location</p>
              <p className="text-sm font-medium">{asset.project_location || '-'}</p>
            </div>
          </div>

          {asset.remark && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30">
              <FileText className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Remark</p>
                <p className="text-sm">{asset.remark}</p>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
