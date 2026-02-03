'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectItem } from '@/components/ui/select';
import { Search, Filter, X } from 'lucide-react';
import type { AssetFilters as AssetFiltersType } from '@/types/asset';

interface AssetFiltersProps {
  filters: AssetFiltersType;
  onFiltersChange: (f: AssetFiltersType) => void;
  onReset: () => void;
  categoryOptions?: { value: string; label: string }[];
  statusOptions?: { value: string; label: string }[];
  hideCategoryFilter?: boolean;
}

export default function AssetFilters({
  filters,
  onFiltersChange,
  onReset,
  categoryOptions = [],
  statusOptions = [],
  hideCategoryFilter = false,
}: AssetFiltersProps) {
  const [expanded, setExpanded] = useState(false);
  const [localSearch, setLocalSearch] = useState(filters.search ?? '');

  const handleSearch = () => {
    onFiltersChange({ ...filters, search: localSearch || undefined, page: 1 });
  };

  const hasActiveFilters = !!(
    filters.category ||
    filters.status ||
    filters.project_location ||
    filters.ownership ||
    filters.search
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search asset no, description, serial, make..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-9"
          />
        </div>
        <Button onClick={handleSearch} size="sm">
          Search
        </Button>
        <Button variant="outline" size="sm" onClick={() => setExpanded(!expanded)}>
          <Filter className="w-4 h-4 mr-1" /> Filters {hasActiveFilters && `(${Object.values(filters).filter(Boolean).length})`}
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            <X className="w-4 h-4 mr-1" /> Clear
          </Button>
        )}
      </div>

      {expanded && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 border rounded-lg bg-muted/30">
          <div>
            <label className="text-[11px] text-muted-foreground mb-1 block">Category</label>
            <Select
              value={filters.category ?? ''}
              onValueChange={(v) => onFiltersChange({ ...filters, category: v || undefined, page: 1 })}
            >
              <SelectItem value="">All</SelectItem>
              {categoryOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </Select>
          </div>
          )}
          <div>
            <label className="text-[11px] text-muted-foreground mb-1 block">Status</label>
            <Select
              value={filters.status ?? ''}
              onValueChange={(v) => onFiltersChange({ ...filters, status: v || undefined, page: 1 })}
            >
              <SelectItem value="">All</SelectItem>
              {statusOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </Select>
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground mb-1 block">Location</label>
            <Input
              placeholder="Project location"
              value={filters.project_location ?? ''}
              onChange={(e) => onFiltersChange({ ...filters, project_location: e.target.value || undefined, page: 1 })}
            />
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground mb-1 block">Ownership</label>
            <Input
              placeholder="Ownership"
              value={filters.ownership ?? ''}
              onChange={(e) => onFiltersChange({ ...filters, ownership: e.target.value || undefined, page: 1 })}
            />
          </div>
        </div>
      )}
    </div>
  );
}
