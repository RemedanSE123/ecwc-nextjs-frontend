'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectItem } from '@/components/ui/select';
import { Search, Filter, X } from 'lucide-react';
import type { AssetFilters as AssetFiltersType } from '@/types/asset';
import type { AssetFacets } from '@/types/asset';

interface AssetFiltersProps {
  filters: AssetFiltersType;
  onFiltersChange: (f: AssetFiltersType) => void;
  onReset: () => void;
  categoryOptions?: { value: string; label: string }[];
  hideCategoryFilter?: boolean;
  facets?: AssetFacets | null;
}

export default function AssetFilters({
  filters,
  onFiltersChange,
  onReset,
  categoryOptions = [],
  hideCategoryFilter = false,
  facets,
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
    filters.responsible_person_name ||
    filters.search
  );

  const statusOptions = facets?.status ?? [];
  const locationOptions = facets?.project_location ?? [];
  const ownershipOptions = facets?.ownership ?? [];
  const responsibleOptions = facets?.responsible_person_name ?? [];

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
          <Filter className="w-4 h-4 mr-1" />
          Filters {hasActiveFilters && `(${Object.values(filters).filter((v) => v !== undefined && v !== '').length})`}
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            <X className="w-4 h-4 mr-1" /> Clear
          </Button>
        )}
      </div>

      {expanded && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 p-4 border rounded-lg bg-muted/30">
          {!hideCategoryFilter && (
            <div>
              <label className="text-[11px] text-muted-foreground mb-1 block font-medium">Category</label>
              <Select
                value={filters.category ?? ''}
                onValueChange={(v) => onFiltersChange({ ...filters, category: v || undefined, page: 1 })}
              >
                <SelectItem value="">All</SelectItem>
                {categoryOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </Select>
            </div>
          )}
          <div>
            <label className="text-[11px] text-muted-foreground mb-1 block font-medium">Status</label>
            <Select
              value={filters.status ?? ''}
              onValueChange={(v) => onFiltersChange({ ...filters, status: v || undefined, page: 1 })}
            >
              <SelectItem value="">All</SelectItem>
              {statusOptions.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </Select>
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground mb-1 block font-medium">Location</label>
            {locationOptions.length > 0 ? (
              <Select
                value={filters.project_location ?? ''}
                onValueChange={(v) => onFiltersChange({ ...filters, project_location: v || undefined, page: 1 })}
              >
                <SelectItem value="">All</SelectItem>
                {locationOptions.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </Select>
            ) : (
              <Input
                placeholder="Type location"
                value={filters.project_location ?? ''}
                onChange={(e) => onFiltersChange({ ...filters, project_location: e.target.value || undefined, page: 1 })}
                className="h-9"
              />
            )}
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground mb-1 block font-medium">Ownership</label>
            {ownershipOptions.length > 0 ? (
              <Select
                value={filters.ownership ?? ''}
                onValueChange={(v) => onFiltersChange({ ...filters, ownership: v || undefined, page: 1 })}
              >
                <SelectItem value="">All</SelectItem>
                {ownershipOptions.map((o) => (
                  <SelectItem key={o} value={o}>
                    {o}
                  </SelectItem>
                ))}
              </Select>
            ) : (
              <Input
                placeholder="Type ownership"
                value={filters.ownership ?? ''}
                onChange={(e) => onFiltersChange({ ...filters, ownership: e.target.value || undefined, page: 1 })}
                className="h-9"
              />
            )}
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground mb-1 block font-medium">Responsible</label>
            {responsibleOptions.length > 0 ? (
              <Select
                value={filters.responsible_person_name ?? ''}
                onValueChange={(v) => onFiltersChange({ ...filters, responsible_person_name: v || undefined, page: 1 })}
              >
                <SelectItem value="">All</SelectItem>
                {responsibleOptions.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </Select>
            ) : (
              <Input
                placeholder="Type name"
                value={filters.responsible_person_name ?? ''}
                onChange={(e) => onFiltersChange({ ...filters, responsible_person_name: e.target.value || undefined, page: 1 })}
                className="h-9"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
