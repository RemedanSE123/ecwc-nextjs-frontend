'use client';

import { useState, useEffect, Fragment, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { fetchAssets, fetchAssetStats, fetchAssetFacets, fetchAssetCompleteness, getAssetImageUrl } from '@/lib/api/assets';
import { exportAssetsToExcel, exportAssetsToCsv } from '@/lib/export-utils';
import type { Asset, AssetFilters, AssetStats, AssetFacets } from '@/types/asset';
import AssetFiltersComponent from './AssetFilters';
import AssetFormModal from './AssetFormModal';
import ImageLightbox from './ImageLightbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Image as ImageIcon, Search, Download, FileSpreadsheet, FileDown, BarChart2, Plus, Pencil, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { SLUG_TO_DB_CATEGORY } from '@/types/asset';
import { deleteAsset } from '@/lib/api/assets';

/** Escape regex special chars and build a regex that matches any of the search terms (case-insensitive). */
function getSearchRegex(search: string): RegExp | null {
  const trimmed = search.trim();
  if (!trimmed) return null;
  const terms = trimmed.split(/\s+/).filter(Boolean).map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  if (terms.length === 0) return null;
  return new RegExp(`(${terms.join('|')})`, 'gi');
}

/** Status badge colors: OP = green, Down = red, Repair = yellow, Idle = blue, etc. */
function getStatusBadgeClass(status: string | null | undefined): string {
  if (!status) return 'border-border/80 bg-muted/40 text-muted-foreground';
  const s = status.toLowerCase().trim();
  // Green: operational / op / active / in use
  if (s === 'op' || s.includes('operational') || s.includes('active') || s.includes('in use')) return 'border-green-200 text-green-700 dark:text-green-500 dark:border-green-800/50 bg-green-50/80 dark:bg-green-950/30';
  // Red: down / out of service / condemned / scrap / disposed
  if (s === 'down' || s.includes('down') || s.includes('out of service') || s.includes('condemned') || s.includes('scrap') || s.includes('disposed') || s.includes('written off')) return 'border-red-200 text-red-700 dark:text-red-500 dark:border-red-800/50 bg-red-50/80 dark:bg-red-950/30';
  // Yellow: repair / maintenance
  if (s.includes('repair') || s.includes('maintenance')) return 'border-yellow-200 text-yellow-700 dark:text-yellow-500 dark:border-yellow-800/50 bg-yellow-50/80 dark:bg-yellow-950/30';
  // Blue: idle / standby
  if (s.includes('idle') || s.includes('standby')) return 'border-blue-200 text-blue-700 dark:text-blue-500 dark:border-blue-800/50 bg-blue-50/80 dark:bg-blue-950/30';
  // Slate: reserved / allocated / pending / incoming
  if (s.includes('reserved') || s.includes('allocated') || s.includes('pending') || s.includes('incoming')) return 'border-slate-200 text-slate-600 dark:text-slate-400 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/30';
  const n = status.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const palette = ['border-green-200 text-green-700 dark:text-green-500 dark:border-green-800/50 bg-green-50/80 dark:bg-green-950/30', 'border-yellow-200 text-yellow-700 dark:text-yellow-500 dark:border-yellow-800/50 bg-yellow-50/80 dark:bg-yellow-950/30', 'border-blue-200 text-blue-700 dark:text-blue-500 dark:border-blue-800/50 bg-blue-50/80 dark:bg-blue-950/30', 'border-slate-200 text-slate-600 dark:text-slate-400 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/30', 'border-red-200 text-red-700 dark:text-red-500 dark:border-red-800/50 bg-red-50/80 dark:bg-red-950/30'];
  return palette[n % palette.length];
}

/** Wrap matching substrings in <mark> for highlight. */
function highlightText(text: string | null, searchRegex: RegExp | null): React.ReactNode {
  if (text == null || text === '') return '-';
  if (!searchRegex) return text;
  const parts = text.split(searchRegex);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} className="bg-primary/10 dark:bg-primary/20 text-foreground rounded px-0.5 font-medium">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

const INFINITE_SCROLL_PAGE_SIZE = 50;

interface EquipmentDataViewProps {
  categoryGroup?: string;
  categoryName: string;
  /** When set (e.g. 5000), load this many per page so all assets can be displayed. Ignored if useInfiniteScroll is true. */
  initialLimit?: number;
  /** If true, load 50 initially and fetch 50 more when user scrolls to bottom (no Next button). */
  useInfiniteScroll?: boolean;
}

export default function EquipmentDataView({ categoryGroup, categoryName, initialLimit, useInfiniteScroll }: EquipmentDataViewProps) {
  const pageSize = useInfiniteScroll ? INFINITE_SCROLL_PAGE_SIZE : (initialLimit ?? 20);
  const [filters, setFilters] = useState<AssetFilters>({ category_group: categoryGroup, page: 1, limit: pageSize });
  const [data, setData] = useState<Asset[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<AssetStats | null>(null);
  const [facets, setFacets] = useState<Awaited<ReturnType<typeof fetchAssetFacets>> | null>(null);
  const [facetsError, setFacetsError] = useState<string | null>(null);
  /** Facets with each dimension excluded so each dropdown shows full list (selected + unselected) for current other filters */
  const [facetsForDropdown, setFacetsForDropdown] = useState<Partial<AssetFacets> | null>(null);
  const [completeness, setCompleteness] = useState<Awaited<ReturnType<typeof fetchAssetCompleteness>> | null>(null);
  const [exporting, setExporting] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editAsset, setEditAsset] = useState<Asset | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [headerSearch, setHeaderSearch] = useState(filters.search ?? '');
  const headerSearchRef = useRef(filters);
  headerSearchRef.current = filters;
  const loadMoreSentinelRef = useRef<HTMLDivElement>(null);
  /** All Assets table column sort */
  const [assetsTableSortBy, setAssetsTableSortBy] = useState<string>('project_location');
  const [assetsTableSortOrder, setAssetsTableSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const limit = useInfiniteScroll ? INFINITE_SCROLL_PAGE_SIZE : (initialLimit ?? 20);
    setFilters((f) => ({ ...f, category_group: categoryGroup, page: 1, limit }));
  }, [categoryGroup, useInfiniteScroll, initialLimit]);

  useEffect(() => {
    const t = setTimeout(() => {
      const value = headerSearch.trim() || undefined;
      if (headerSearchRef.current.search === value) return;
      setFilters((f) => ({ ...f, search: value, page: 1 }));
    }, 250);
    return () => clearTimeout(t);
  }, [headerSearch]);

  useEffect(() => {
    if ((filters.search ?? '') !== headerSearch) setHeaderSearch(filters.search ?? '');
  }, [filters.search]);

  useEffect(() => {
    const isLoadMore = useInfiniteScroll && (filters.page ?? 1) > 1;
    if (isLoadMore) {
      setLoadingMore(true);
      setError(null);
      fetchAssets(filters)
        .then((res) => {
          setData((prev) => [...prev, ...res.data]);
          setError(null);
        })
        .catch((err) => setError(err instanceof Error ? err.message : String(err)))
        .finally(() => setLoadingMore(false));
      return;
    }
    setLoading(true);
    setError(null);
    Promise.all([
      fetchAssets(filters),
      fetchAssetStats(undefined, categoryGroup),
    ])
      .then(([res, s]) => {
        setData(res.data);
        setTotal(res.total);
        setTotalPages(res.totalPages);
        setStats(s);
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : String(err));
        setData([]);
        setTotal(0);
        setTotalPages(0);
      })
      .finally(() => setLoading(false));
  }, [filters, categoryGroup, useInfiniteScroll]);

  // Infinite scroll: when sentinel is visible, load next page
  useEffect(() => {
    if (!useInfiniteScroll || !loadMoreSentinelRef.current) return;
    const el = loadMoreSentinelRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        if (loading || loadingMore || data.length >= total || (filters.page ?? 1) >= totalPages) return;
        setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }));
      },
      { root: null, rootMargin: '100px', threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [useInfiniteScroll, loading, loadingMore, data.length, total, filters.page, totalPages]);

  // Fetch facets using current filters so Location, Status, etc. only show options that exist for the selected Category (and other filters)
  const toArray = (v: string | string[] | undefined): string[] => (v == null ? [] : Array.isArray(v) ? v : [v]);
  const facetFilterKey = `${toArray(filters.category).join(',')}|${toArray(filters.status).join(',')}|${toArray(filters.project_location).join(',')}|${toArray(filters.make).join(',')}|${toArray(filters.model).join(',')}|${toArray(filters.ownership).join(',')}|${toArray(filters.description).join(',')}|${filters.search ?? ''}|${filters.responsible_person_name ?? ''}|${categoryGroup ?? ''}`;
  useEffect(() => {
    setFacetsError(null);
    fetchAssetFacets(filters)
      .then(setFacets)
      .catch((err) => setFacetsError(err instanceof Error ? err.message : String(err)));
  }, [facetFilterKey]);

  useEffect(() => {
    fetchAssetCompleteness(categoryGroup)
      .then(setCompleteness)
      .catch(() => {});
  }, [categoryGroup]);

  // Fetch facets with each dimension excluded so each dropdown shows full list (selected + unselected) for current other filters
  const baseFilters = useMemo(
    () => ({
      category_group: categoryGroup,
      search: filters.search,
      responsible_person_name: filters.responsible_person_name,
      category: filters.category,
      status: filters.status,
      project_location: filters.project_location,
      make: filters.make,
      model: filters.model,
      ownership: filters.ownership,
      description: filters.description,
    }),
    [categoryGroup, filters.search, filters.responsible_person_name, filters.category, filters.status, filters.project_location, filters.make, filters.model, filters.ownership, filters.description]
  );
  useEffect(() => {
    const base = { ...baseFilters, category_group: categoryGroup };
    Promise.all([
      fetchAssetFacets({ ...base, category: undefined }),
      fetchAssetFacets({ ...base, status: undefined }),
      fetchAssetFacets({ ...base, project_location: undefined }),
      fetchAssetFacets({ ...base, make: undefined }),
      fetchAssetFacets({ ...base, model: undefined }),
      fetchAssetFacets({ ...base, ownership: undefined }),
      fetchAssetFacets({ ...base, description: undefined }),
    ])
      .then(([fCat, fStatus, fLoc, fMake, fModel, fOwn, fDesc]) => {
        setFacetsForDropdown({
          category: fCat?.category ?? [],
          status: fStatus?.status ?? [],
          project_location: fLoc?.project_location ?? [],
          make: fMake?.make ?? [],
          model: fModel?.model ?? [],
          ownership: fOwn?.ownership ?? [],
          description: fDesc?.description ?? [],
        });
      })
      .catch(() => setFacetsForDropdown(null));
  }, [baseFilters, categoryGroup]);

  // Excel-like: only clear a value if it is not in the full option list for that dimension (e.g. deleted from DB), not because it disappeared from cascaded facets
  const filtersRef = useRef(filters);
  filtersRef.current = filters;
  useEffect(() => {
    if (!facets && !facetsForDropdown) return;
    const f = filtersRef.current;
    const next: Partial<AssetFilters> = {};
    let changed = false;
    const statusAllowList = facetsForDropdown?.status ?? facets?.status ?? [];
    const statusArr = toArray(f.status).filter((s) => statusAllowList.includes(s));
    if (statusArr.length !== toArray(f.status).length) {
      next.status = statusArr.length ? statusArr : undefined;
      changed = true;
    }
    const locAllowList = facetsForDropdown?.project_location ?? facets?.project_location ?? [];
    const locArr = toArray(f.project_location).filter((l) => locAllowList.includes(l));
    if (locArr.length !== toArray(f.project_location).length) {
      next.project_location = locArr.length ? locArr : undefined;
      changed = true;
    }
    const makeAllowList = facetsForDropdown?.make ?? facets?.make ?? [];
    const makeArr = toArray(f.make).filter((m) => makeAllowList.includes(m));
    if (makeArr.length !== toArray(f.make).length) {
      next.make = makeArr.length ? makeArr : undefined;
      changed = true;
    }
    const modelAllowList = facetsForDropdown?.model ?? facets?.model ?? [];
    const modelArr = toArray(f.model).filter((m) => modelAllowList.includes(m));
    if (modelArr.length !== toArray(f.model).length) {
      next.model = modelArr.length ? modelArr : undefined;
      changed = true;
    }
    const ownAllowList = facetsForDropdown?.ownership ?? facets?.ownership ?? [];
    const ownArr = toArray(f.ownership).filter((o) => ownAllowList.includes(o));
    if (ownArr.length !== toArray(f.ownership).length) {
      next.ownership = ownArr.length ? ownArr : undefined;
      changed = true;
    }
    const descAllowList = facetsForDropdown?.description ?? facets?.description ?? [];
    const descArr = toArray(f.description).filter((d) => descAllowList.includes(d));
    if (descArr.length !== toArray(f.description).length) {
      next.description = descArr.length ? descArr : undefined;
      changed = true;
    }
    const catAllowList = facetsForDropdown?.category ?? facets?.category ?? [];
    const catArr = toArray(f.category).filter((c) => catAllowList.includes(c));
    if (catArr.length !== toArray(f.category).length) {
      next.category = catArr.length ? catArr : undefined;
      changed = true;
    }
    if (changed) setFilters((prev) => ({ ...prev, ...next, page: 1 }));
  }, [facets, facetsForDropdown]);

  const effectiveFacets = useMemo(() => {
    const empty: AssetFacets = { category: [], description: [], status: [], project_location: [], make: [], model: [], ownership: [], responsible_person_name: [] };
    const fromApi = facets ?? empty;
    const toStr = (v: string | null | undefined): v is string => v != null && v !== '';
    const fromData = {
      category: [...new Set(data.map((a) => a.category).filter(toStr))].sort(),
      description: [...new Set(data.map((a) => a.description).filter(toStr))].sort(),
      status: [...new Set(data.map((a) => a.status).filter(toStr))].sort(),
      project_location: [...new Set(data.map((a) => a.project_location).filter(toStr))].sort(),
      make: [...new Set(data.map((a) => a.make).filter(toStr))].sort(),
      model: [...new Set(data.map((a) => a.model).filter(toStr))].sort(),
      ownership: [...new Set(data.map((a) => a.ownership).filter(toStr))].sort(),
      responsible_person_name: [...new Set(data.map((a) => a.responsible_person_name).filter(toStr))].sort(),
    };
    return {
      category: fromApi.category?.length ? fromApi.category : fromData.category,
      description: fromApi.description?.length ? fromApi.description : fromData.description,
      status: fromApi.status?.length ? fromApi.status : fromData.status,
      project_location: fromApi.project_location?.length ? fromApi.project_location : fromData.project_location,
      make: fromApi.make?.length ? fromApi.make : fromData.make,
      model: fromApi.model?.length ? fromApi.model : fromData.model,
      ownership: fromApi.ownership?.length ? fromApi.ownership : fromData.ownership,
      responsible_person_name: fromApi.responsible_person_name?.length ? fromApi.responsible_person_name : fromData.responsible_person_name,
    };
  }, [facets, data]);

  // Each dropdown: merge selected + options (from facets with that dimension excluded) so user always sees selected and unselected
  const categoryOptionsForFilter = useMemo(() => {
    if (categoryGroup) return [];
    const cats = [...new Set([...toArray(filters.category), ...(facetsForDropdown?.category ?? effectiveFacets.category ?? [])])].sort();
    if (cats.length > 0) return cats.map((c) => ({ value: c, label: c }));
    const fromStats = stats?.byCategory?.map((c) => ({ value: c.category, label: c.category })) ?? [];
    if (fromStats.length > 0) return fromStats;
    const fromData = [...new Set(data.map((a) => a.category).filter(Boolean))].sort().map((cat) => ({ value: cat, label: cat }));
    return fromData;
  }, [categoryGroup, filters.category, facetsForDropdown?.category, effectiveFacets.category, stats?.byCategory, data]);

  const descriptionOptionsForFilter = useMemo(() => {
    const descs = [...new Set([...toArray(filters.description), ...(facetsForDropdown?.description ?? effectiveFacets.description ?? [])])].sort();
    return descs.map((d) => ({ value: d, label: d.length > 60 ? `${d.slice(0, 60)}…` : d } as { value: string; label: string }));
  }, [filters.description, facetsForDropdown?.description, effectiveFacets.description]);

  const statusOptionsForFilter = useMemo(
    () => [...new Set([...toArray(filters.status), ...(facetsForDropdown?.status ?? effectiveFacets.status ?? [])])].sort(),
    [filters.status, facetsForDropdown?.status, effectiveFacets.status]
  );
  const locationOptionsForFilter = useMemo(
    () => [...new Set([...toArray(filters.project_location), ...(facetsForDropdown?.project_location ?? effectiveFacets.project_location ?? [])])].sort(),
    [filters.project_location, facetsForDropdown?.project_location, effectiveFacets.project_location]
  );
  const makeOptionsForFilter = useMemo(
    () => [...new Set([...toArray(filters.make), ...(facetsForDropdown?.make ?? effectiveFacets.make ?? [])])].sort(),
    [filters.make, facetsForDropdown?.make, effectiveFacets.make]
  );
  const modelOptionsForFilter = useMemo(
    () => [...new Set([...toArray(filters.model), ...(facetsForDropdown?.model ?? effectiveFacets.model ?? [])])].sort(),
    [filters.model, facetsForDropdown?.model, effectiveFacets.model]
  );
  const ownershipOptionsForFilter = useMemo(
    () => [...new Set([...toArray(filters.ownership), ...(facetsForDropdown?.ownership ?? effectiveFacets.ownership ?? [])])].sort(),
    [filters.ownership, facetsForDropdown?.ownership, effectiveFacets.ownership]
  );

  const searchRegex = useMemo(() => getSearchRegex(filters.search ?? ''), [filters.search]);

  const sortedData = useMemo(() => {
    const key = assetsTableSortBy;
    const order = assetsTableSortOrder === 'asc' ? 1 : -1;
    const strKeys = ['project_location', 'asset_no', 'description', 'category', 'status'];
    return [...data].sort((a, b) => {
      const va = (a as unknown as Record<string, unknown>)[key];
      const vb = (b as unknown as Record<string, unknown>)[key];
      if (strKeys.includes(key)) {
        const sa = String(va ?? '').trim().toLowerCase();
        const sb = String(vb ?? '').trim().toLowerCase();
        return order * sa.localeCompare(sb);
      }
      return 0;
    });
  }, [data, assetsTableSortBy, assetsTableSortOrder]);

  const resetFilters = () => {
    setFilters({ category_group: categoryGroup, page: 1, limit: pageSize });
  };

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const res = await fetchAssets({ ...filters, limit: 5000 });
      exportAssetsToExcel(res.data as unknown as Record<string, unknown>[], `${categoryName.replace(/\s/g, '-')}-${new Date().toISOString().slice(0, 10)}.xlsx`);
    } finally {
      setExporting(false);
    }
  };

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const res = await fetchAssets({ ...filters, limit: 5000 });
      exportAssetsToCsv(res.data as unknown as Record<string, unknown>[], `${categoryName.replace(/\s/g, '-')}-${new Date().toISOString().slice(0, 10)}.csv`);
    } finally {
      setExporting(false);
    }
  };

  const refetch = () => setFilters((f) => ({ ...f }));

  const defaultCategory = categoryGroup ? SLUG_TO_DB_CATEGORY[categoryGroup] : undefined;

  return (
    <div className="space-y-6">
      {/* Column completeness report */}
      {completeness && completeness.total > 0 && (
        <Card className="border-border bg-muted/20 dark:bg-muted/10">
          <CardHeader className="py-3 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <BarChart2 className="w-4 h-4 text-muted-foreground" />
                Data completeness ({completeness.total} assets)
              </CardTitle>
              <span className="text-xs text-muted-foreground">% empty per column</span>
            </div>
          </CardHeader>
          <CardContent className="pt-0 px-4 pb-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {(['Image', 'Location', 'Asset No', 'Description', 'Serial No', 'Make', 'Model', 'Status', 'Responsible', 'Phone', 'Ownership', 'Remark'] as const)
                .filter((col) => completeness.columns[col] != null)
                .map((col) => {
                  const v = completeness.columns[col]!;
                  return (
                    <div key={col} className="p-3 rounded-lg bg-background border border-border text-[11px]">
                      <div className="flex justify-between items-center font-medium mb-1.5 gap-2">
                        <span className="truncate text-foreground">{col}</span>
                        <span className={`shrink-0 font-semibold tabular-nums ${v.pctEmpty > 50 ? 'text-amber-600 dark:text-amber-400' : v.pctEmpty > 20 ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'}`}>
                          {v.pctEmpty}% empty
                        </span>
                      </div>
                      <Progress value={v.pctFilled} className="h-2 rounded-full" />
                      <p className="text-[10px] text-muted-foreground mt-1 tabular-nums">
                        {v.filled.toLocaleString()} filled · {v.empty.toLocaleString()} empty
                      </p>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className={`border-border shadow-sm bg-card ${!categoryGroup ? 'min-w-0 max-w-full' : ''}`}>
        <CardHeader className="p-4 pb-2 border-b border-border bg-muted/10 dark:bg-muted/5">
          <div className="flex flex-col gap-3">
            {/* Row 1: Title (left), Search (middle), View/Edit/Export (right) */}
            <div className="flex items-center gap-4 flex-wrap">
              <CardTitle className="text-base font-semibold text-foreground shrink-0">
                {categoryName}
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({loading ? '...' : total.toLocaleString()} assets)
                </span>
              </CardTitle>
              <div className="flex-1 flex justify-center items-center gap-2 min-w-0 max-w-md">
                <span className="text-xs text-muted-foreground shrink-0">Search</span>
                <div className="relative flex-1 max-w-xs min-w-[140px]">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search everything"
                    value={headerSearch}
                    onChange={(e) => setHeaderSearch(e.target.value)}
                    className="pl-8 h-9 text-sm w-full border-border bg-background"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-auto">
                <div className="flex rounded-md border border-border bg-muted/30 p-0.5">
                  <button
                    type="button"
                    onClick={() => setIsEditMode(false)}
                    className={`px-2.5 py-1.5 text-xs font-medium rounded transition-colors ${!isEditMode ? 'bg-background shadow-sm text-foreground border border-border' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditMode(true)}
                    className={`px-2.5 py-1.5 text-xs font-medium rounded transition-colors ${isEditMode ? 'bg-background shadow-sm text-foreground border border-border' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    Edit
                  </button>
                </div>
                {isEditMode && (
                  <Button
                    variant="default"
                    size="sm"
                    className="gap-1.5 h-8 text-xs"
                    onClick={() => setShowCreateModal(true)}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Create asset
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" disabled={exporting} className="gap-1.5 h-8 text-xs border-border">
                      <Download className="w-3.5 h-3.5" />
                      Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleExportExcel} className="gap-2 cursor-pointer">
                      <FileSpreadsheet className="w-4 h-4" />
                      Excel (.xlsx)
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleExportCsv} className="gap-2 cursor-pointer">
                      <FileDown className="w-4 h-4" />
                      CSV (.csv)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            {/* Row 2: All filters + KPI in same header row */}
            <div className="flex flex-wrap items-center justify-between gap-2 w-full">
              <AssetFiltersComponent
                filters={filters}
                onFiltersChange={(next) => setFilters((prev) => ({ ...prev, ...next }))}
                onReset={resetFilters}
                categoryOptions={categoryOptionsForFilter}
                descriptionOptions={descriptionOptionsForFilter}
                statusOptions={statusOptionsForFilter}
                locationOptions={locationOptionsForFilter}
                makeOptions={makeOptionsForFilter}
                modelOptions={modelOptionsForFilter}
                ownershipOptions={ownershipOptionsForFilter}
                hideCategoryFilter={!!categoryGroup}
                facets={effectiveFacets}
                facetsError={facetsError}
                compact
                inline
                hideSearch
              />
              {/* KPI in header row: result count based on filters */}
              {(() => {
                const hasFilters = toArray(filters.category).length > 0 || toArray(filters.status).length > 0 || toArray(filters.project_location).length > 0 || toArray(filters.make).length > 0 || toArray(filters.model).length > 0 || toArray(filters.ownership).length > 0 || toArray(filters.description).length > 0 || (filters.search ?? '').trim();
                return (
                  <p className="text-xs text-muted-foreground shrink-0 ml-auto tabular-nums">
                    Showing <span className="font-medium text-foreground">{loading ? '…' : total.toLocaleString()}</span> asset{total !== 1 ? 's' : ''}{hasFilters ? ' matching filters' : ''}
                  </p>
                );
              })()}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-1.5">
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-11 w-full rounded" />
              ))}
            </div>
          ) : error ? (
            <div className="py-10 px-4 text-center rounded-lg border border-border bg-muted/10">
              <p className="text-destructive font-medium mb-1">Error loading data</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-1 rounded-lg border border-border">
              <table className={`w-full text-xs border-collapse ${!categoryGroup ? 'min-w-[600px]' : 'min-w-[720px]'}`}>
                <thead>
                  <tr className="bg-green-600 text-white text-left text-[11px] font-semibold uppercase tracking-wider">
                    <th className="py-2 px-3 w-12 text-right">#</th>
                    <th className="py-2 px-3 whitespace-nowrap w-16">Image</th>
                    {(['project_location', 'asset_no', 'description', 'category', 'status'] as const).map((key) => {
                      const labels: Record<string, string> = {
                        project_location: 'Project location',
                        asset_no: 'Asset number',
                        description: 'Description',
                        category: 'Category',
                        status: 'Status',
                      };
                      const isActive = assetsTableSortBy === key;
                      const handleClick = () => {
                        setAssetsTableSortBy(key);
                        setAssetsTableSortOrder(isActive && assetsTableSortOrder === 'desc' ? 'asc' : 'desc');
                      };
                      return (
                        <th
                          key={key}
                          className="py-2 px-3 whitespace-nowrap cursor-pointer select-none hover:bg-green-700 transition-colors"
                          onClick={handleClick}
                        >
                          <span className="inline-flex items-center gap-0.5">
                            {labels[key]}
                            {isActive ? (
                              <span className="text-white/90">{assetsTableSortOrder === 'asc' ? ' ↑' : ' ↓'}</span>
                            ) : (
                              <span className="text-white/50 text-[10px]">↕</span>
                            )}
                          </span>
                        </th>
                      );
                    })}
                    <th className="py-2 px-3 whitespace-nowrap text-center w-24" title="Click row to expand">
                      {isEditMode ? 'Actions' : 'View more'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedData.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-muted-foreground text-xs">
                        No assets found
                      </td>
                    </tr>
                  ) : (
                    sortedData.map((a, index) => {
                      const imageUrl = getAssetImageUrl(a.image_s3_key);
                      const isExpanded = expandedId === a.id;
                      const rowIndex = useInfiniteScroll ? index + 1 : (filters.page! - 1) * (filters.limit ?? 20) + index + 1;
                      const isEven = index % 2 === 0;
                      return (
                        <Fragment key={a.id}>
                          <tr
                            key={a.id}
                            className={`border-b border-border/60 transition-colors cursor-pointer ${isExpanded ? 'bg-muted/25 dark:bg-muted/15' : isEven ? 'bg-background hover:bg-muted/15 dark:hover:bg-muted/10' : 'bg-muted/5 dark:bg-muted/5 hover:bg-muted/20 dark:hover:bg-muted/15'}`}
                            onClick={() => setExpandedId(isExpanded ? null : a.id)}
                          >
                            <td className="py-2 px-3 align-middle text-right">
                              <span className="tabular-nums text-muted-foreground text-xs">
                                {rowIndex.toLocaleString()}
                              </span>
                            </td>
                            <td className="py-1.5 px-3 align-middle" onClick={(e) => e.stopPropagation()}>
                              <div
                                className="w-10 h-8 rounded bg-muted/50 flex items-center justify-center overflow-hidden cursor-pointer hover:ring-2 ring-border ring-offset-1 ring-offset-background transition-shadow border border-border"
                                onClick={() => {
                                  if (imageUrl) setLightboxSrc(imageUrl);
                                }}
                              >
                                {imageUrl ? (
                                  <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                )}
                              </div>
                            </td>
                            <td className={`py-2 px-3 text-foreground text-xs ${!categoryGroup ? 'max-w-[140px] truncate' : 'whitespace-nowrap'}`} title={a.project_location ?? ''}>{highlightText(a.project_location, searchRegex)}</td>
                            <td className="py-2 px-3 whitespace-nowrap font-medium text-foreground text-xs">{highlightText(a.asset_no, searchRegex)}</td>
                            <td className="py-2 px-3 max-w-[180px] truncate text-foreground/90 text-xs" title={a.description ?? ''}>
                              {highlightText(a.description, searchRegex)}
                            </td>
                            <td className="py-2 px-3 whitespace-nowrap text-muted-foreground text-xs">{highlightText(a.category, searchRegex)}</td>
                            <td className="py-2 px-3">
                              <Badge variant="outline" className={`text-[11px] font-medium shrink-0 ${getStatusBadgeClass(a.status)}`}>
                                {highlightText(a.status, searchRegex)}
                              </Badge>
                            </td>
                            <td className="py-2 px-3 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                              {isEditMode ? (
                                <div className="inline-flex items-center gap-0.5">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40"
                                    title="Edit"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setEditAsset(a);
                                    }}
                                  >
                                    <Pencil className="h-3 w-3" />
                                  </Button>
                                    <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40"
                                    title="Delete"
                                    disabled={deletingId === a.id}
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      if (!confirm('Delete this asset? This cannot be undone.')) return;
                                      setDeletingId(a.id);
                                      try {
                                        await deleteAsset(a.id);
                                        setExpandedId(null);
                                        refetch();
                                      } catch (err) {
                                        alert(err instanceof Error ? err.message : 'Delete failed');
                                      } finally {
                                        setDeletingId(null);
                                      }
                                    }}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              ) : (
                                <span
                                  className="inline-flex items-center gap-0.5 text-[11px] font-medium text-muted-foreground hover:text-foreground whitespace-nowrap cursor-pointer transition-colors"
                                  onClick={(e) => { e.stopPropagation(); setExpandedId(isExpanded ? null : a.id); }}
                                >
                                  {isExpanded ? <ChevronDown className="h-3.5 w-3.5 shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
                                  View more
                                </span>
                              )}
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr key={`${a.id}-exp`} className="border-b border-border/80">
                              <td colSpan={8} className="p-0 align-top">
                                <div className="mx-2 mb-2 rounded-lg border border-border bg-card shadow-sm overflow-hidden">
                                  <div className="px-4 py-2.5 border-b border-border bg-muted/30 dark:bg-muted/20">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-foreground">View details</span>
                                  </div>
                                  <div className="flex gap-0 min-h-[100px]">
                                    <div
                                      className="w-28 sm:w-36 shrink-0 p-3 border-r border-border flex items-center justify-center cursor-pointer hover:bg-muted/20 transition-colors bg-muted/10"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (imageUrl) setLightboxSrc(imageUrl);
                                      }}
                                    >
                                      {imageUrl ? (
                                        <img src={imageUrl} alt="" className="w-full max-h-24 object-contain rounded-lg border border-border shadow-sm" />
                                      ) : (
                                        <div className="w-full h-20 rounded-lg border border-dashed border-border flex items-center justify-center bg-muted/20">
                                          <ImageIcon className="h-6 w-6 text-muted-foreground/50" />
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0 p-4 flex gap-4">
                                      <div className="flex-1 min-w-0 flex flex-col gap-3">
                                        <div>
                                          <span className="text-muted-foreground text-[11px] font-medium uppercase tracking-wide block mb-1">Description</span>
                                          <p className="text-foreground text-xs leading-snug">{highlightText(a.description, searchRegex)}</p>
                                        </div>
                                        <div className="grid grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-3 text-xs">
                                          <div>
                                            <span className="text-muted-foreground text-[11px] font-medium uppercase tracking-wide block mb-1">Asset No</span>
                                            <p className="text-foreground text-xs">{highlightText(a.asset_no, searchRegex)}</p>
                                          </div>
                                          <div>
                                            <span className="text-muted-foreground text-[11px] font-medium uppercase tracking-wide block mb-1">Serial No</span>
                                            <p className="text-foreground text-xs">{highlightText(a.serial_no, searchRegex)}</p>
                                          </div>
                                          <div>
                                            <span className="text-muted-foreground text-[11px] font-medium uppercase tracking-wide block mb-1">Responsible person</span>
                                            <p className="text-foreground text-xs">{highlightText(a.responsible_person_name, searchRegex)}</p>
                                          </div>
                                          <div>
                                            <span className="text-muted-foreground text-[11px] font-medium uppercase tracking-wide block mb-1">Model</span>
                                            <p className="text-foreground text-xs">{highlightText(a.model, searchRegex)}</p>
                                          </div>
                                          <div>
                                            <span className="text-muted-foreground text-[11px] font-medium uppercase tracking-wide block mb-1">Ownership</span>
                                            <p className="text-foreground text-xs">{highlightText(a.ownership, searchRegex)}</p>
                                          </div>
                                          <div>
                                            <span className="text-muted-foreground text-[11px] font-medium uppercase tracking-wide block mb-1">Phone number</span>
                                            <p className="text-xs">
                                              {a.responsible_person_pno ? (
                                                <a href={`tel:${a.responsible_person_pno}`} className="text-foreground hover:underline font-medium">{a.responsible_person_pno}</a>
                                              ) : (
                                                <span className="text-muted-foreground">—</span>
                                              )}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="w-full sm:w-52 shrink-0 flex flex-col min-w-0">
                                        <span className="text-muted-foreground text-[11px] font-medium uppercase tracking-wide block mb-1">Remark</span>
                                        <div className="flex-1 min-h-[3rem] p-3 rounded-lg border border-border bg-muted/10 dark:bg-muted/20 text-foreground text-xs leading-relaxed overflow-auto whitespace-pre-wrap break-words">
                                          {highlightText(a.remark, searchRegex) ?? '—'}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {useInfiniteScroll && (
            <div ref={loadMoreSentinelRef} className="min-h-[40px] flex items-center justify-center py-2">
              {loadingMore && <span className="text-xs text-muted-foreground">Loading more…</span>}
              {!loading && !loadingMore && data.length > 0 && data.length >= total && total > 0 && (
                <span className="text-xs text-muted-foreground">All {total.toLocaleString()} assets loaded</span>
              )}
            </div>
          )}

          {!useInfiniteScroll && !loading && totalPages > 1 && (
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <span className="text-[11px] text-muted-foreground">Page {filters.page} of {totalPages}</span>
              <div className="flex gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters((f) => ({ ...f, page: Math.max(1, f.page! - 1) }))}
                  disabled={filters.page === 1}
                  className="h-7 text-[11px] border-border px-2"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters((f) => ({ ...f, page: Math.min(totalPages, f.page! + 1) }))}
                  disabled={filters.page === totalPages}
                  className="h-7 text-[11px] border-border px-2"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {lightboxSrc && (
        <ImageLightbox
          src={lightboxSrc}
          onClose={() => setLightboxSrc(null)}
        />
      )}

      {showCreateModal && (
        <AssetFormModal
          defaultCategory={defaultCategory}
          categoryGroup={categoryGroup}
          onSuccess={() => {
            refetch();
            setShowCreateModal(false);
          }}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {editAsset && (
        <AssetFormModal
          key={editAsset.id}
          asset={editAsset}
          defaultCategory={defaultCategory}
          categoryGroup={categoryGroup}
          onSuccess={() => {
            refetch();
            setEditAsset(null);
          }}
          onClose={() => setEditAsset(null)}
        />
      )}
    </div>
  );
}
