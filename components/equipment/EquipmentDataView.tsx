'use client';

import { useState, useEffect, Fragment, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import StatusHistoryModal from './StatusHistoryModal';
import HeavyVehicleDetailModal from './HeavyVehicleDetailModal';
import LightVehicleDetailModal from './LightVehicleDetailModal';
import MachineryDetailModal from './MachineryDetailModal';
import PlantDetailModal from './PlantDetailModal';
import AuxGeneratorDetailModal from './AuxGeneratorDetailModal';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Skeleton } from '@/components/ui/skeleton';
import { Image as ImageIcon, Search, Download, FileSpreadsheet, FileDown, BarChart2, Plus, Pencil, Trash2, ChevronDown, ChevronRight, FileText, LayoutList, RefreshCw, Settings, MapPin, Users, Calendar, History, Truck, Gauge, Box, Building2, Hash, User, Phone, Clock, Copy, Check, Wrench } from 'lucide-react';
import { SLUG_TO_DB_CATEGORY, EQUIPMENT_CATEGORIES } from '@/types/asset';

const HEAVY_VEHICLE_CATEGORY = SLUG_TO_DB_CATEGORY['heavy-vehicles']; // 'Heavy Vehicle'
const LIGHT_VEHICLE_CATEGORY = SLUG_TO_DB_CATEGORY['light-vehicles']; // 'Light Vehicles & Bus'
const MACHINERY_CATEGORY = SLUG_TO_DB_CATEGORY['machinery']; // 'Machinery'
const PLANT_CATEGORY = SLUG_TO_DB_CATEGORY['plant-equipment']; // 'Plant'
const AUXILIARY_CATEGORY = SLUG_TO_DB_CATEGORY['auxiliary-equipment']; // 'Auxillary'
import { BLANK_FILTER_VALUE } from '@/lib/api/assets';
import { deleteAsset } from '@/lib/api/assets';

/** Escape regex special chars and build a regex that matches any of the search terms (case-insensitive). */
function getSearchRegex(search: string): RegExp | null {
  const trimmed = search.trim();
  if (!trimmed) return null;
  const terms = trimmed.split(/\s+/).filter(Boolean).map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  if (terms.length === 0) return null;
  return new RegExp(`(${terms.join('|')})`, 'gi');
}

/** Detail row for Equipment Details section — sidebar green theme */
function DetailRow({ icon: Icon, label, value, badge, mono, copyable, rawValue }: { icon: React.ComponentType<{ className?: string }>; label: string; value: React.ReactNode; badge?: boolean; mono?: boolean; copyable?: boolean; rawValue?: string | null }) {
  const [copied, setCopied] = useState(false);
  const display = value ?? '—';
  const toCopy = rawValue ?? (typeof display === 'string' ? display : '');
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (toCopy && toCopy !== '—') {
      navigator.clipboard.writeText(toCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };
  return (
    <div className="group/row flex gap-2.5 min-w-0 py-2 px-2.5 -mx-2.5 rounded-md border-l-2 border-transparent hover:border-l-[#0d5c32] hover:bg-[#0d5c32]/5 dark:hover:bg-[#0d5c32]/10 transition-all duration-200">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[#0d5c32]/12 dark:bg-[#0d5c32]/20 text-[#0d5c32] dark:text-emerald-400 group-hover/row:bg-[#0d5c32]/20 dark:group-hover/row:bg-[#0d5c32]/30 group-hover/row:text-[#0a4d28] dark:group-hover/row:text-emerald-300 transition-colors">
        <Icon className="h-3 w-3" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mb-0.5 font-medium uppercase tracking-wider group-hover/row:text-[#0d5c32]/80 dark:group-hover/row:text-emerald-400/80 transition-colors">{label}</p>
        <div className="flex items-center gap-1 min-w-0">
          {badge ? (
            <span className="inline-flex rounded px-2 py-0.5 text-[10px] font-medium bg-[#0d5c32]/15 text-[#0d5c32] dark:bg-[#0d5c32]/25 dark:text-emerald-400 border border-[#0d5c32]/25 dark:border-[#0d5c32]/40">{display}</span>
          ) : (
            <p className={`text-xs font-medium text-neutral-800 dark:text-neutral-200 leading-tight truncate flex-1 min-w-0 group-hover/row:text-[#0a4d28] dark:group-hover/row:text-emerald-300/90 transition-colors ${mono ? 'font-mono' : ''}`} title={typeof display === 'string' ? display : undefined}>{display}</p>
          )}
          {copyable && toCopy && toCopy !== '—' && (
            <button type="button" onClick={handleCopy} className="shrink-0 p-0.5 rounded hover:bg-[#0d5c32]/15 dark:hover:bg-[#0d5c32]/25 text-[#0d5c32]/70 dark:text-emerald-400/70 hover:text-[#0d5c32] dark:hover:text-emerald-400 transition-colors" title="Copy">
              {copied ? <Check className="h-3 w-3 text-[#0d5c32] dark:text-emerald-400" /> : <Copy className="h-3 w-3" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** KPI colors for 6 categories: Plant, Machinery, Heavy, Light, Factory, Auxiliary */
const CATEGORY_KPI_COLORS = ['#00c853', '#2962ff', '#ff1744', '#ff9100', '#aa00ff', '#00e5ff'];

function getCategoryColor(category: string | null | undefined): string {
  if (!category?.trim()) return '#64748b';
  const c = category.trim().toLowerCase();
  const idx = EQUIPMENT_CATEGORIES.findIndex(
    (ec) => ec.dbCategory.toLowerCase() === c || ec.name.toLowerCase() === c || (ec.dbCategory.toLowerCase().includes('auxill') && (c.includes('auxill') || c.includes('auxiliary')))
  );
  return idx >= 0 ? CATEGORY_KPI_COLORS[idx] : CATEGORY_KPI_COLORS[0];
}

/** Status badge colors: OP = green, Down = red, Repair = yellow, Idle = blue, etc. */
function getStatusBadgeClass(status: string | null | undefined): string {
  if (status == null || status === '') return 'border-border/80 bg-muted/40 text-muted-foreground';
  const s = String(status).toLowerCase().trim();
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

/** Safe date format for display. */
function formatDateSafe(iso: string | null | undefined): string | null {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    return isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return iso;
  }
}

/** Wrap matching substrings in <mark> for highlight. */
function highlightText(text: string | null | undefined, searchRegex: RegExp | null): React.ReactNode {
  if (text == null || text === '') return '—';
  const str = typeof text === 'string' ? text : String(text ?? '');
  if (!str) return '—';
  if (!searchRegex) return str;
  try {
    const parts = str.split(searchRegex);
    return parts.map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} className="bg-primary/10 dark:bg-primary/20 text-foreground rounded px-0.5 font-medium">
        {part}
      </mark>
    ) : (
      part
    )
  );
  } catch {
    return str;
  }
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
  const [statusHistoryAssetId, setStatusHistoryAssetId] = useState<string | null>(null);
  const [heavyVehicleDetailAssetId, setHeavyVehicleDetailAssetId] = useState<string | null>(null);
  const [lightVehicleDetailAssetId, setLightVehicleDetailAssetId] = useState<string | null>(null);
  const [machineryDetailAssetId, setMachineryDetailAssetId] = useState<string | null>(null);
  const [plantDetailAssetId, setPlantDetailAssetId] = useState<string | null>(null);
  const [auxGeneratorDetailAssetId, setAuxGeneratorDetailAssetId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [headerSearch, setHeaderSearch] = useState(filters.search ?? '');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
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
    if (!successMessage) return;
    const t = setTimeout(() => setSuccessMessage(null), 3000);
    return () => clearTimeout(t);
  }, [successMessage]);

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
    setFacets(null);
    fetchAssetFacets(filters)
      .then(setFacets)
      .catch((err) => setFacetsError(err instanceof Error ? err.message : String(err)));
  }, [facetFilterKey]);

  useEffect(() => {
    fetchAssetCompleteness(filters)
      .then(setCompleteness)
      .catch(() => {});
  }, [facetFilterKey]);

  // Fetch facets with each dimension excluded so each dropdown shows full list (selected + unselected) for current other filters.
  // Cascading: when user filters by Category, Location/Status/Make/etc. options update to only show values that exist for that Category.
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
  const facetsFetchIdRef = useRef(0);
  useEffect(() => {
    setFacetsForDropdown(null);
    const base = { ...baseFilters, category_group: categoryGroup };
    const fetchId = ++facetsFetchIdRef.current;
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
        if (fetchId !== facetsFetchIdRef.current) return;
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
      .catch(() => {
        if (fetchId === facetsFetchIdRef.current) setFacetsForDropdown(null);
      });
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
    const statusArr = toArray(f.status).filter((s) => s === BLANK_FILTER_VALUE || statusAllowList.includes(s));
    if (statusArr.length !== toArray(f.status).length) {
      next.status = statusArr.length ? statusArr : undefined;
      changed = true;
    }
    const locAllowList = facetsForDropdown?.project_location ?? facets?.project_location ?? [];
    const locArr = toArray(f.project_location).filter((l) => l === BLANK_FILTER_VALUE || locAllowList.includes(l));
    if (locArr.length !== toArray(f.project_location).length) {
      next.project_location = locArr.length ? locArr : undefined;
      changed = true;
    }
    const makeAllowList = facetsForDropdown?.make ?? facets?.make ?? [];
    const makeArr = toArray(f.make).filter((m) => m === BLANK_FILTER_VALUE || makeAllowList.includes(m));
    if (makeArr.length !== toArray(f.make).length) {
      next.make = makeArr.length ? makeArr : undefined;
      changed = true;
    }
    const modelAllowList = facetsForDropdown?.model ?? facets?.model ?? [];
    const modelArr = toArray(f.model).filter((m) => m === BLANK_FILTER_VALUE || modelAllowList.includes(m));
    if (modelArr.length !== toArray(f.model).length) {
      next.model = modelArr.length ? modelArr : undefined;
      changed = true;
    }
    const ownAllowList = facetsForDropdown?.ownership ?? facets?.ownership ?? [];
    const ownArr = toArray(f.ownership).filter((o) => o === BLANK_FILTER_VALUE || ownAllowList.includes(o));
    if (ownArr.length !== toArray(f.ownership).length) {
      next.ownership = ownArr.length ? ownArr : undefined;
      changed = true;
    }
    const descAllowList = facetsForDropdown?.description ?? facets?.description ?? [];
    const descArr = toArray(f.description).filter((d) => d === BLANK_FILTER_VALUE || descAllowList.includes(d));
    if (descArr.length !== toArray(f.description).length) {
      next.description = descArr.length ? descArr : undefined;
      changed = true;
    }
    const catAllowList = facetsForDropdown?.category ?? facets?.category ?? [];
    const catArr = toArray(f.category).filter((c) => c === BLANK_FILTER_VALUE || catAllowList.includes(c));
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

  /** Which filter columns have blank values - show "(Blanks)" only for those (Excel-like). */
  const hasBlanksFor = useMemo(() => {
    const cols = completeness?.columns ?? {};
    return {
      category: (cols['Category']?.empty ?? 0) > 0,
      project_location: (cols['Location']?.empty ?? 0) > 0,
      description: (cols['Description']?.empty ?? 0) > 0,
      make: (cols['Make']?.empty ?? 0) > 0,
      model: (cols['Model']?.empty ?? 0) > 0,
      status: (cols['Status']?.empty ?? 0) > 0,
      ownership: (cols['Ownership']?.empty ?? 0) > 0,
    };
  }, [completeness?.columns]);

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
      const res = await fetchAssets({ ...filters, limit: 5000, include_details: true });
      exportAssetsToExcel(res.data as unknown as Record<string, unknown>[], `${categoryName.replace(/\s/g, '-')}-${new Date().toISOString().slice(0, 10)}.xlsx`);
    } finally {
      setExporting(false);
    }
  };

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const res = await fetchAssets({ ...filters, limit: 5000, include_details: true });
      exportAssetsToCsv(res.data as unknown as Record<string, unknown>[], `${categoryName.replace(/\s/g, '-')}-${new Date().toISOString().slice(0, 10)}.csv`);
    } finally {
      setExporting(false);
    }
  };

  const refetch = () => setFilters((f) => ({ ...f }));

  const defaultCategory = categoryGroup ? SLUG_TO_DB_CATEGORY[categoryGroup] : undefined;

  const [dataCompletenessOpen, setDataCompletenessOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Column completeness report — collapsed by default */}
      {completeness && completeness.total > 0 && (
        <Card className="border-border bg-muted/20 dark:bg-muted/10">
          <CardHeader
            className="py-3 px-4 cursor-pointer hover:bg-muted/30 dark:hover:bg-muted/20 transition-colors rounded-t-lg"
            onClick={() => setDataCompletenessOpen((o) => !o)}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                {dataCompletenessOpen ? <ChevronDown className="w-4 h-4 shrink-0" /> : <ChevronRight className="w-4 h-4 shrink-0" />}
                <BarChart2 className="w-4 h-4 text-muted-foreground" />
                Data completeness ({completeness.total} assets)
              </CardTitle>
              <span className="text-xs text-muted-foreground">% empty per column</span>
            </div>
          </CardHeader>
          {dataCompletenessOpen && (
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
          )}
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
              <div className="hidden sm:flex flex-1 justify-center items-center gap-2 min-w-0 max-w-md">
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
                hasBlanksFor={hasBlanksFor}
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
                            className={`border-b border-border/60 transition-all duration-300 ease-out cursor-pointer ${isExpanded ? 'bg-muted/25 dark:bg-muted/15 border-l-4 border-l-[#137638]' : isEven ? 'bg-background hover:bg-muted/15 dark:hover:bg-muted/10 border-l-4 border-l-transparent' : 'bg-muted/5 dark:bg-muted/5 hover:bg-muted/20 dark:hover:bg-muted/15 border-l-4 border-l-transparent'}`}
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
                            <td className="py-2 px-3 whitespace-nowrap">
                              <span className="inline-flex items-center rounded px-2 py-0.5 text-[11px] font-normal bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-500 border border-emerald-300 dark:border-emerald-700/60">
                                {highlightText(a.asset_no, searchRegex) || '—'}
                              </span>
                            </td>
                            <td className="py-2 px-3 max-w-[180px] truncate text-foreground/90 text-xs" title={a.description ?? ''}>
                              {highlightText(a.description, searchRegex)}
                            </td>
                            <td className="py-2 px-3 whitespace-nowrap">
                              <span
                                className="inline-flex items-center rounded px-2 py-0.5 text-[11px] font-normal text-foreground truncate max-w-full border"
                                style={{
                                  backgroundColor: `${getCategoryColor(a.category)}18`,
                                  borderColor: `${getCategoryColor(a.category)}25`,
                                }}
                              >
                                {highlightText(a.category, searchRegex) || '—'}
                              </span>
                            </td>
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
                                  className="inline-flex items-center gap-0.5 text-[11px] font-medium text-muted-foreground hover:text-foreground whitespace-nowrap cursor-pointer transition-all duration-300"
                                  onClick={(e) => { e.stopPropagation(); setExpandedId(isExpanded ? null : a.id); }}
                                >
                                  <motion.span
                                    animate={{ rotate: isExpanded ? 90 : 0 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                    className="inline-flex shrink-0"
                                  >
                                    <ChevronRight className="h-3.5 w-3.5" />
                                  </motion.span>
                                  View more
                                </span>
                              )}
                            </td>
                          </tr>
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.tr
                                key={`${a.id}-exp`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                                className="border-b border-border/80"
                              >
                                <td colSpan={8} className="p-0 align-top overflow-hidden">
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{
                                      height: { duration: 0.45, ease: [0.32, 0.72, 0, 1] },
                                      opacity: { duration: 0.3, ease: 'easeOut' },
                                    }}
                                    className="overflow-hidden"
                                  >
                                    <ErrorBoundary>
                                    <motion.div
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0 }}
                                      transition={{ duration: 0.35, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
                                      className="mx-2 mb-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 shadow-sm overflow-hidden"
                                    >
                                  {/* Top accent line when expanded */}
                                  <div className="h-1 bg-[#137638]" />
                                  <div className="flex flex-col sm:flex-row">
                                    {/* Left: Image + Remarks */}
                                    <div className="w-full sm:w-[45%] sm:min-w-0 sm:shrink-0 p-4 sm:border-r border-neutral-100 dark:border-neutral-800 flex flex-col gap-4">
                                      <div>
                                        <p className="text-[10px] font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">Equipment Image</p>
                                        <div
                                          className="group relative w-full min-h-[187px] h-[238px] rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 flex flex-col items-center justify-center cursor-pointer overflow-hidden hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors"
                                          onClick={(e) => { e.stopPropagation(); if (imageUrl) setLightboxSrc(imageUrl); }}
                                        >
                                          {imageUrl ? (
                                            <>
                                              <img
                                                src={imageUrl}
                                                alt=""
                                                className="max-w-full max-h-full w-auto h-auto object-contain transition-transform group-hover:scale-[1.02]"
                                                loading="lazy"
                                                decoding="async"
                                              />
                                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none" />
                                            </>
                                          ) : (
                                            <div className="flex flex-col items-center justify-center p-3">
                                              <div className="w-12 h-12 rounded-lg bg-neutral-200/80 dark:bg-neutral-700/50 flex items-center justify-center mb-2">
                                                <ImageIcon className="h-5 w-5 text-neutral-400 dark:text-neutral-500" />
                                              </div>
                                              <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">No Image</span>
                                              <span className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-0.5">Upload for this equipment</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      <div className="w-full flex-1 min-w-0">
                                        <p className="text-[10px] font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">Remarks & Notes</p>
                                        <div className="min-h-[100px] w-full p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/30 text-xs leading-relaxed overflow-auto">
                                          <span className={(a.remark || '').trim() ? 'text-neutral-800 dark:text-neutral-200' : 'text-neutral-400 dark:text-neutral-500 italic'}>
                                            {highlightText(a.remark, searchRegex) || 'No additional remarks'}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    {/* Right: Equipment Details — sidebar green theme */}
                                    <div className="w-full sm:w-[55%] sm:min-w-0 flex-1 p-4 flex flex-col sm:border-l-2 sm:border-l-[#0d5c32]/30">
                                      <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-[#0d5c32]/25 dark:border-[#0d5c32]/35">
                                        <div className="h-5 w-1 rounded-full bg-gradient-to-b from-[#0d5c32] via-[#0a4d28] to-[#064320]" />
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#0d5c32] dark:text-emerald-400">Equipment Details</p>
                                      </div>
                                      <div className="rounded-lg bg-[#0d5c32]/5 dark:bg-[#0d5c32]/10 border border-[#0d5c32]/15 dark:border-[#0d5c32]/25 p-3 -mx-1">
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5 flex-1">
                                        <DetailRow icon={Truck} label="Category" value={highlightText(a.category, searchRegex)} />
                                        <DetailRow icon={FileText} label="Description" value={highlightText(a.description, searchRegex)} />
                                        <DetailRow icon={MapPin} label="Location" value={highlightText(a.project_location, searchRegex)} />
                                        <DetailRow icon={Building2} label="Ownership" value={highlightText(a.ownership, searchRegex)} />
                                        <DetailRow icon={Settings} label="Make" value={highlightText(a.make, searchRegex)} />
                                        <DetailRow icon={Box} label="Model" value={highlightText(a.model, searchRegex)} />
                                        {((a.category ?? '') === HEAVY_VEHICLE_CATEGORY || (a.category ?? '') === LIGHT_VEHICLE_CATEGORY || (a.category ?? '') === MACHINERY_CATEGORY) && (
                                          <DetailRow icon={Hash} label="Plate No" value={highlightText(a.plate_no, searchRegex)} mono copyable rawValue={a.plate_no ?? undefined} />
                                        )}
                                        <DetailRow icon={Gauge} label="Status" value={highlightText(a.status, searchRegex)} badge />
                                        <DetailRow icon={User} label="Responsible person" value={highlightText(a.responsible_person_name, searchRegex)} />
                                        <DetailRow icon={Phone} label="Phone number" value={highlightText(a.responsible_person_pno, searchRegex)} />
                                        <DetailRow icon={Hash} label="Serial No" value={highlightText(a.serial_no, searchRegex)} mono copyable rawValue={a.serial_no} />
                                        <DetailRow icon={Clock} label="Updated" value={formatDateSafe(a.updated_at)} />
                                      </div>
                                      </div>
                                      <div className="flex flex-wrap gap-2 mt-4">
                                        <Button
                                          variant="default"
                                          className="gap-1.5 h-9 bg-[#137638] hover:bg-[#0f5a2e] dark:bg-[#137638] dark:hover:bg-[#0f5a2e] text-white font-medium text-xs rounded-md shadow-sm transition-all duration-200"
                                          onClick={(e) => { e.stopPropagation(); setStatusHistoryAssetId(a.id); }}
                                        >
                                          <History className="h-3.5 w-3.5" />
                                          Status History
                                        </Button>
                                        {((a.category ?? '') === HEAVY_VEHICLE_CATEGORY || (a.category ?? '') === LIGHT_VEHICLE_CATEGORY || (a.category ?? '') === MACHINERY_CATEGORY || (a.category ?? '') === PLANT_CATEGORY) && (
                                          <Button
                                            variant="outline"
                                            className="gap-1.5 h-9 border-[#0d5c32]/40 text-[#0d5c32] dark:text-emerald-400 hover:bg-[#0d5c32]/10 dark:hover:bg-[#0d5c32]/20 font-medium text-xs rounded-md transition-all duration-200"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              const cat = a.category ?? '';
                                              if (cat === HEAVY_VEHICLE_CATEGORY) setHeavyVehicleDetailAssetId(a.id);
                                              else if (cat === LIGHT_VEHICLE_CATEGORY) setLightVehicleDetailAssetId(a.id);
                                              else if (cat === MACHINERY_CATEGORY) setMachineryDetailAssetId(a.id);
                                              else if (cat === PLANT_CATEGORY) setPlantDetailAssetId(a.id);
                                            }}
                                          >
                                            {(a.category ?? '') === MACHINERY_CATEGORY ? <Wrench className="h-3.5 w-3.5" /> : <Truck className="h-3.5 w-3.5" />}
                                            View Detail
                                          </Button>
                                        )}
                                        {(a.category ?? '') === AUXILIARY_CATEGORY && (a.description ?? '').toLowerCase().includes('generator') && (
                                          <Button
                                            variant="outline"
                                            className="gap-1.5 h-9 border-[#0d5c32]/40 text-[#0d5c32] dark:text-emerald-400 hover:bg-[#0d5c32]/10 dark:hover:bg-[#0d5c32]/20 font-medium text-xs rounded-md transition-all duration-200"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setAuxGeneratorDetailAssetId(a.id);
                                            }}
                                          >
                                            Generator Rate
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                    </motion.div>
                                    </ErrorBoundary>
                                  </motion.div>
                                </td>
                              </motion.tr>
                            )}
                          </AnimatePresence>
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

      {statusHistoryAssetId && (
        <StatusHistoryModal
          assetId={statusHistoryAssetId}
          onClose={() => setStatusHistoryAssetId(null)}
        />
      )}

      {heavyVehicleDetailAssetId && (
        <HeavyVehicleDetailModal
          assetId={heavyVehicleDetailAssetId}
          onClose={() => setHeavyVehicleDetailAssetId(null)}
        />
      )}

      {lightVehicleDetailAssetId && (
        <LightVehicleDetailModal
          assetId={lightVehicleDetailAssetId}
          onClose={() => setLightVehicleDetailAssetId(null)}
        />
      )}

      {machineryDetailAssetId && (
        <MachineryDetailModal
          assetId={machineryDetailAssetId}
          onClose={() => setMachineryDetailAssetId(null)}
        />
      )}

      {plantDetailAssetId && (
        <PlantDetailModal
          assetId={plantDetailAssetId}
          onClose={() => setPlantDetailAssetId(null)}
        />
      )}

      {auxGeneratorDetailAssetId && (
        <AuxGeneratorDetailModal
          assetId={auxGeneratorDetailAssetId}
          onClose={() => setAuxGeneratorDetailAssetId(null)}
        />
      )}

      {showCreateModal && (
        <AssetFormModal
          defaultCategory={defaultCategory}
          categoryGroup={categoryGroup}
          onSuccess={() => {
            refetch();
            setShowCreateModal(false);
            setSuccessMessage('Asset created successfully.');
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
            setSuccessMessage('Asset updated successfully.');
          }}
          onClose={() => setEditAsset(null)}
        />
      )}

      {successMessage && (
        <div className="fixed bottom-4 right-4 z-[10000]">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-md text-sm text-emerald-800">
            <span className="font-semibold">Success: </span>
            {successMessage}
          </div>
        </div>
      )}
    </div>
  );
}
