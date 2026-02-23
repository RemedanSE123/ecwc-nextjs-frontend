'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, X, ChevronDown } from 'lucide-react';
import type { AssetFilters as AssetFiltersType } from '@/types/asset';
import type { AssetFacets } from '@/types/asset';
import { BLANK_FILTER_VALUE } from '@/lib/api/assets';

function toArray(v: string | string[] | undefined): string[] {
  if (v == null) return [];
  return Array.isArray(v) ? v : [v];
}

const DEBOUNCE_MS = 250;

function MultiSelectFilter({
  label,
  options,
  selected,
  onSelectedChange,
  placeholder,
  className,
  optionDisplay,
  includeBlanksOption = false,
}: {
  label: string;
  options: string[];
  selected: string[];
  onSelectedChange: (values: string[]) => void;
  placeholder: string;
  className?: string;
  optionDisplay?: (opt: string) => React.ReactNode;
  /** When true, add "(Blanks)" option to filter for empty/null values (Excel-like). */
  includeBlanksOption?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<string[]>([]);
  const [filterSearch, setFilterSearch] = useState('');

  // When dropdown opens, sync pending from current selected and reset filter search
  useEffect(() => {
    if (open) {
      setPending([...selected]);
      setFilterSearch('');
    }
  }, [open, selected]);

  const toggle = (value: string) => {
    setPending((prev) => {
      const next = prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value];
      return next;
    });
  };
  const selectAll = () => setPending(filteredOptions.length ? [...filteredOptions] : []);
  const clear = () => setPending([]);
  const apply = () => {
    onSelectedChange(pending.length ? pending : []);
    setOpen(false);
  };

  const displayLabel = selected.length === 0 ? label : `${label} (${selected.length})`;
  const selectedCount = pending.length;
  const filterLower = filterSearch.trim().toLowerCase();
  const optionsWithBlanks = includeBlanksOption ? [...options, BLANK_FILTER_VALUE] : options;
  const filteredOptions = filterLower
    ? optionsWithBlanks.filter((opt) =>
        opt === BLANK_FILTER_VALUE ? /blank|empty/.test(filterLower) : opt.toLowerCase().includes(filterLower)
      )
    : optionsWithBlanks;
  const totalCount = optionsWithBlanks.length;
  const kpiText = totalCount > 0 ? `${selectedCount} of ${totalCount} selected` : 'No options';

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={`h-8 text-xs justify-between gap-1 ${className ?? ''}`}>
          <span className="truncate">{displayLabel}</span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-[320px] overflow-hidden flex flex-col">
        <DropdownMenuLabel className="flex flex-col gap-1.5 text-xs shrink-0">
          <div className="flex items-center justify-between gap-2">
            <span>{placeholder}</span>
            <span className="flex gap-1">
              <Button type="button" variant="ghost" size="sm" className="h-6 px-1.5 text-[10px]" onClick={selectAll}>(Select All)</Button>
              <Button type="button" variant="ghost" size="sm" className="h-6 px-1.5 text-[10px]" onClick={clear}>Clear</Button>
            </span>
          </div>
          <Input
            placeholder="Search in list..."
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
            onKeyDown={(e) => e.stopPropagation()}
            onKeyUp={(e) => e.stopPropagation()}
            className="h-7 text-xs pl-2"
            onClick={(e) => e.stopPropagation()}
          />
          <p className="text-[10px] text-muted-foreground font-medium tabular-nums">{kpiText}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="overflow-y-auto max-h-[220px] min-h-0">
        {filteredOptions.length === 0 ? (
          <div className="py-4 px-3 text-[11px] text-muted-foreground">
            {filterSearch.trim() ? `No matches for "${filterSearch}"` : 'No options'}
          </div>
        ) : (
          filteredOptions.map((opt) => (
            <DropdownMenuItem
              key={opt}
              onSelect={(e) => {
                e.preventDefault();
                toggle(opt);
              }}
              className="flex items-center gap-2 py-1.5 pl-2 pr-2 text-xs cursor-pointer focus:bg-accent"
            >
              <Checkbox
                checked={pending.includes(opt)}
                onChange={() => toggle(opt)}
                onClick={(e) => e.stopPropagation()}
                className="h-3.5 w-3.5 shrink-0 border-2"
              />
              <span className="truncate">{opt === BLANK_FILTER_VALUE ? '(Blanks)' : (optionDisplay ? optionDisplay(opt) : opt)}</span>
            </DropdownMenuItem>
          ))
        )}
        </div>
        <DropdownMenuSeparator />
        <div className="p-2 flex justify-end gap-1 border-t shrink-0">
          <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="button" variant="default" size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-700" onClick={apply}>
            OK
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Which filter columns have blank/empty values (from completeness API). When true, show "(Blanks)" option. */
export interface HasBlanksForFilters {
  category?: boolean;
  project_location?: boolean;
  description?: boolean;
  make?: boolean;
  model?: boolean;
  status?: boolean;
  ownership?: boolean;
}

interface AssetFiltersProps {
  filters: AssetFiltersType;
  onFiltersChange: (f: AssetFiltersType) => void;
  onReset: () => void;
  categoryOptions?: { value: string; label: string }[];
  descriptionOptions?: { value: string; label: string }[];
  /** Merged selected + options so dropdown always shows selected and unselected */
  statusOptions?: string[];
  locationOptions?: string[];
  makeOptions?: string[];
  modelOptions?: string[];
  ownershipOptions?: string[];
  hideCategoryFilter?: boolean;
  facets?: AssetFacets | null;
  /** Which columns have blank values - show "(Blanks)" only for those (Excel-like). */
  hasBlanksFor?: HasBlanksForFilters;
  /** Compact: single row, small search, filters inline */
  compact?: boolean;
  /** When set, show near filter bar (e.g. facets fetch failed) */
  facetsError?: string | null;
  /** When true with compact, render filter row only (no wrapper) for use in a single header row */
  inline?: boolean;
  /** When true with compact, do not render Search input (e.g. search is in header row 1) */
  hideSearch?: boolean;
}

export default function AssetFilters({
  filters,
  onFiltersChange,
  onReset,
  categoryOptions = [],
  descriptionOptions = [],
  statusOptions: statusOptionsProp,
  locationOptions: locationOptionsProp,
  makeOptions: makeOptionsProp,
  modelOptions: modelOptionsProp,
  ownershipOptions: ownershipOptionsProp,
  hideCategoryFilter = false,
  facets,
  hasBlanksFor = {},
  compact = true,
  facetsError,
  inline = false,
  hideSearch = false,
}: AssetFiltersProps) {
  const [localSearch, setLocalSearch] = useState(filters.search ?? '');
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  useEffect(() => {
    if (hideSearch) return;
    const t = setTimeout(() => {
      const value = localSearch.trim() || undefined;
      if (filtersRef.current.search === value) return;
      onFiltersChange({ search: value, page: 1 });
    }, DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [localSearch, onFiltersChange, hideSearch]);

  useEffect(() => {
    if ((filters.search ?? '') !== localSearch) setLocalSearch(filters.search ?? '');
  }, [filters.search]);

  const hasActiveFilters = !!(
    toArray(filters.category).length > 0 ||
    toArray(filters.status).length > 0 ||
    toArray(filters.project_location).length > 0 ||
    toArray(filters.make).length > 0 ||
    toArray(filters.model).length > 0 ||
    toArray(filters.ownership).length > 0 ||
    filters.responsible_person_name ||
    (filters.search ?? '').trim() ||
    toArray(filters.description).length > 0
  );

  const categoryOptionsList = categoryOptions.map((o) => o.value);
  // Excel-like: always use parent-provided full option lists when provided (no fallback to cascaded facets)
  const statusOptions = statusOptionsProp != null ? statusOptionsProp : (facets?.status ?? []);
  const locationOptions = locationOptionsProp != null ? locationOptionsProp : (facets?.project_location ?? []);
  const makeOptions = makeOptionsProp != null ? makeOptionsProp : (facets?.make ?? []);
  const modelOptions = modelOptionsProp != null ? modelOptionsProp : (facets?.model ?? []);
  const ownershipOptions = ownershipOptionsProp != null ? ownershipOptionsProp : (facets?.ownership ?? []);
  const responsibleOptions = facets?.responsible_person_name ?? [];

  if (compact) {
    const filterRow = (
      <div className="flex flex-wrap items-center gap-2">
        {facetsError && inline && (
          <span className="text-[11px] text-amber-600 dark:text-amber-400 shrink-0">Filters: {facetsError}</span>
        )}
        {!hideSearch && (
          <>
            <span className="text-[11px] text-muted-foreground font-medium shrink-0 hidden sm:inline">Search:</span>
            <div className="relative w-40 sm:w-48 shrink-0">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Search everything"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="pl-7 h-8 text-xs transition-shadow focus-visible:ring-2"
              />
            </div>
          </>
        )}
        <span className="text-[11px] text-muted-foreground font-medium shrink-0 hidden sm:inline">Filter by:</span>
        {!hideCategoryFilter && (
          <MultiSelectFilter
            label="Category"
            options={categoryOptionsList}
            selected={toArray(filters.category)}
            onSelectedChange={(v) => onFiltersChange({ category: v.length ? v : undefined, page: 1 })}
            placeholder="All categories"
            className="w-[110px] sm:w-[120px]"
            includeBlanksOption={hasBlanksFor.category !== false}
          />
        )}
        <MultiSelectFilter
          label="Location"
          options={locationOptions}
          selected={toArray(filters.project_location)}
          onSelectedChange={(v) => onFiltersChange({ project_location: v.length ? v : undefined, page: 1 })}
          placeholder="Location"
          className="w-[110px] sm:w-[120px]"
          includeBlanksOption={hasBlanksFor.project_location !== false}
        />
        <MultiSelectFilter
          label="Description"
          options={descriptionOptions.map((o) => o.value)}
          selected={toArray(filters.description)}
          onSelectedChange={(v) => onFiltersChange({ description: v.length ? v : undefined, page: 1 })}
          placeholder="Description"
          className="w-[130px] sm:w-[150px] max-w-[200px]"
          optionDisplay={(opt) => (opt.length > 50 ? `${opt.slice(0, 50)}…` : opt)}
          includeBlanksOption={hasBlanksFor.description !== false}
        />
        <MultiSelectFilter
          label="Make"
          options={makeOptions}
          selected={toArray(filters.make)}
          onSelectedChange={(v) => onFiltersChange({ make: v.length ? v : undefined, page: 1 })}
          placeholder="Make"
          className="w-[95px] sm:w-[100px]"
          includeBlanksOption={hasBlanksFor.make}
        />
        <MultiSelectFilter
          label="Model"
          options={modelOptions}
          selected={toArray(filters.model)}
          onSelectedChange={(v) => onFiltersChange({ model: v.length ? v : undefined, page: 1 })}
          placeholder="Model"
          className="w-[95px] sm:w-[100px]"
          includeBlanksOption={hasBlanksFor.model !== false}
        />
        <MultiSelectFilter
          label="Status"
          options={statusOptions}
          selected={toArray(filters.status)}
          onSelectedChange={(v) => onFiltersChange({ status: v.length ? v : undefined, page: 1 })}
          placeholder="Status"
          className="w-[100px] sm:w-[110px]"
          includeBlanksOption={hasBlanksFor.status}
        />
        <MultiSelectFilter
          label="Ownership"
          options={ownershipOptions}
          selected={toArray(filters.ownership)}
          onSelectedChange={(v) => onFiltersChange({ ownership: v.length ? v : undefined, page: 1 })}
          placeholder="Ownership"
          className="w-[100px] sm:w-[110px]"
          includeBlanksOption={hasBlanksFor.ownership !== false}
        />
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onReset} className="h-8 px-2 text-xs">
            <X className="w-3.5 h-3.5 mr-1" /> Clear
          </Button>
        )}
      </div>
    );
    if (inline) return filterRow;
    return (
      <div className="space-y-1">
        {facetsError && !inline && (
          <p className="text-[11px] text-amber-600 dark:text-amber-400">Filter options could not be loaded: {facetsError}</p>
        )}
        {filterRow}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {facetsError && (
        <p className="text-sm text-amber-600 dark:text-amber-400">Filter options could not be loaded: {facetsError}</p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[160px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search everything"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            <X className="w-4 h-4 mr-1" /> Clear
          </Button>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 p-4 border rounded-lg bg-muted/30">
        {!hideCategoryFilter && (
          <div>
            <label className="text-[11px] text-muted-foreground mb-1 block font-medium">Category</label>
            <MultiSelectFilter
              label="Category"
              options={categoryOptionsList}
              selected={toArray(filters.category)}
              onSelectedChange={(v) => onFiltersChange({ category: v.length ? v : undefined, page: 1 })}
              placeholder="All categories"
              includeBlanksOption={hasBlanksFor.category !== false}
            />
          </div>
        )}
        <div>
          <label className="text-[11px] text-muted-foreground mb-1 block font-medium">Location</label>
          <MultiSelectFilter
            label="Location"
            options={locationOptions}
            selected={toArray(filters.project_location)}
            onSelectedChange={(v) => onFiltersChange({ project_location: v.length ? v : undefined, page: 1 })}
            placeholder="Location"
            includeBlanksOption={hasBlanksFor.project_location !== false}
          />
        </div>
        <div>
          <label className="text-[11px] text-muted-foreground mb-1 block font-medium">Description</label>
          <MultiSelectFilter
            label="Description"
            options={descriptionOptions.map((o) => o.value)}
            selected={toArray(filters.description)}
            onSelectedChange={(v) => onFiltersChange({ description: v.length ? v : undefined, page: 1 })}
            placeholder="Description"
            optionDisplay={(opt) => (opt.length > 50 ? `${opt.slice(0, 50)}…` : opt)}
            includeBlanksOption={hasBlanksFor.description !== false}
          />
        </div>
        <div>
          <label className="text-[11px] text-muted-foreground mb-1 block font-medium">Make</label>
          <MultiSelectFilter
            label="Make"
            options={makeOptions}
            selected={toArray(filters.make)}
            onSelectedChange={(v) => onFiltersChange({ make: v.length ? v : undefined, page: 1 })}
            placeholder="Make"
            includeBlanksOption={hasBlanksFor.make}
          />
        </div>
        <div>
          <label className="text-[11px] text-muted-foreground mb-1 block font-medium">Model</label>
          <MultiSelectFilter
            label="Model"
            options={modelOptions}
            selected={toArray(filters.model)}
            onSelectedChange={(v) => onFiltersChange({ model: v.length ? v : undefined, page: 1 })}
            placeholder="Model"
            includeBlanksOption={hasBlanksFor.model !== false}
          />
        </div>
        <div>
          <label className="text-[11px] text-muted-foreground mb-1 block font-medium">Status</label>
          <MultiSelectFilter
            label="Status"
            options={statusOptions}
            selected={toArray(filters.status)}
            onSelectedChange={(v) => onFiltersChange({ status: v.length ? v : undefined, page: 1 })}
            placeholder="Status"
            includeBlanksOption={hasBlanksFor.status}
          />
        </div>
        <div>
          <label className="text-[11px] text-muted-foreground mb-1 block font-medium">Ownership</label>
          <MultiSelectFilter
            label="Ownership"
            options={ownershipOptions}
            selected={toArray(filters.ownership)}
            onSelectedChange={(v) => onFiltersChange({ ownership: v.length ? v : undefined, page: 1 })}
            placeholder="Ownership"
            includeBlanksOption={hasBlanksFor.ownership !== false}
          />
        </div>
        <div>
          <label className="text-[11px] text-muted-foreground mb-1 block font-medium">Responsible</label>
          <Select
            value={filters.responsible_person_name ?? ''}
            onValueChange={(v) => onFiltersChange({ responsible_person_name: v || undefined, page: 1 })}
          >
            <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">All</SelectItem>
              {responsibleOptions.map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
