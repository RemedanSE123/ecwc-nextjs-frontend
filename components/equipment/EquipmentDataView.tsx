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

/** Wrap matching substrings in <mark> for highlight. */
function highlightText(text: string | null, searchRegex: RegExp | null): React.ReactNode {
  if (text == null || text === '') return '-';
  if (!searchRegex) return text;
  const parts = text.split(searchRegex);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} className="bg-amber-200 dark:bg-amber-600/50 rounded px-0.5 font-medium">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

interface EquipmentDataViewProps {
  categoryGroup?: string;
  categoryName: string;
  /** When set (e.g. 5000), load this many per page so all assets can be displayed. */
  initialLimit?: number;
}

export default function EquipmentDataView({ categoryGroup, categoryName, initialLimit }: EquipmentDataViewProps) {
  const [filters, setFilters] = useState<AssetFilters>({ category_group: categoryGroup, page: 1, limit: initialLimit ?? 20 });
  const [data, setData] = useState<Asset[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<AssetStats | null>(null);
  const [facets, setFacets] = useState<Awaited<ReturnType<typeof fetchAssetFacets>> | null>(null);
  const [facetsError, setFacetsError] = useState<string | null>(null);
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

  useEffect(() => {
    setFilters((f) => ({ ...f, category_group: categoryGroup, page: 1 }));
  }, [categoryGroup]);

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
  }, [filters, categoryGroup]);

  useEffect(() => {
    Promise.all([fetchAssetFacets(categoryGroup), fetchAssetCompleteness(categoryGroup)])
      .then(([f, c]) => {
        setFacets(f);
        setCompleteness(c);
      })
      .catch(() => {});
  }, [categoryGroup]);

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

  const categoryOptionsForFilter = useMemo(() => {
    if (categoryGroup) return [];
    const cats = effectiveFacets.category ?? [];
    if (cats.length > 0) return cats.map((c) => ({ value: c, label: c }));
    const fromStats = stats?.byCategory?.map((c) => ({ value: c.category, label: c.category })) ?? [];
    if (fromStats.length > 0) return fromStats;
    const fromData = [...new Set(data.map((a) => a.category).filter(Boolean))].sort().map((cat) => ({ value: cat, label: cat }));
    return fromData;
  }, [categoryGroup, effectiveFacets.category, stats?.byCategory, data]);

  const descriptionOptionsForFilter = useMemo(() => {
    const descs = effectiveFacets.description ?? [];
    return descs.map((d) => ({ value: d, label: d.length > 60 ? `${d.slice(0, 60)}…` : d } as { value: string; label: string }));
  }, [effectiveFacets.description]);

  const searchRegex = useMemo(() => getSearchRegex(filters.search ?? ''), [filters.search]);

  const resetFilters = () => {
    setFilters({ category_group: categoryGroup, page: 1, limit: initialLimit ?? 20 });
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
    <div className="space-y-4">
      {/* Column completeness report */}
      {completeness && completeness.total > 0 && (
        <Card className="border-amber-200/50 dark:border-amber-900/30 bg-amber-50/30 dark:bg-amber-950/10">
          <CardHeader className="py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BarChart2 className="w-4 h-4" />
                Data completeness ({completeness.total} assets)
              </CardTitle>
              <span className="text-xs text-muted-foreground">% empty per column</span>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {(['Image', 'Location', 'Asset No', 'Description', 'Serial No', 'Make', 'Model', 'Status', 'Responsible', 'Phone', 'Ownership', 'Remark'] as const)
                .filter((col) => completeness.columns[col] != null)
                .map((col) => {
                  const v = completeness.columns[col]!;
                  return (
                    <div key={col} className="p-3 rounded-lg bg-background/80 border border-border shadow-sm text-[11px]">
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

      <Card className="border-green-200/50 dark:border-green-900/30 shadow-sm">
        <CardHeader className="p-4 pb-2 bg-gradient-to-r from-green-50/50 to-transparent dark:from-green-950/20 dark:to-transparent rounded-t-lg border-b">
          <div className="flex flex-col gap-3">
            {/* Row 1: Title (left), Search (middle), View/Edit/Export (right) */}
            <div className="flex items-center gap-4 flex-wrap">
              <CardTitle className="text-[15px] font-semibold text-foreground shrink-0">
                {categoryName}
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({loading ? '...' : total.toLocaleString()} assets)
                </span>
              </CardTitle>
              <div className="flex-1 flex justify-center items-center gap-2 min-w-0 max-w-md">
                <span className="text-[11px] text-muted-foreground font-medium shrink-0">Search:</span>
                <div className="relative flex-1 max-w-xs min-w-[140px]">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Asset no, make, serial..."
                    value={headerSearch}
                    onChange={(e) => setHeaderSearch(e.target.value)}
                    className="pl-8 h-8 text-xs w-full"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-auto">
                <div className="flex rounded border bg-muted/40 p-0.5">
                  <button
                    type="button"
                    onClick={() => setIsEditMode(false)}
                    className={`px-2 py-1 text-[11px] font-medium rounded transition-colors ${!isEditMode ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditMode(true)}
                    className={`px-2 py-1 text-[11px] font-medium rounded transition-colors ${isEditMode ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    Edit
                  </button>
                </div>
                {isEditMode && (
                  <Button
                    variant="default"
                    size="sm"
                    className="gap-1.5 h-7 text-xs bg-green-600 hover:bg-green-700"
                    onClick={() => setShowCreateModal(true)}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Create asset
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" disabled={exporting} className="gap-1.5 h-7 text-xs">
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
            {/* Row 2: All filters */}
            <AssetFiltersComponent
              filters={filters}
              onFiltersChange={setFilters}
              onReset={resetFilters}
              categoryOptions={categoryOptionsForFilter}
              descriptionOptions={descriptionOptionsForFilter}
              hideCategoryFilter={!!categoryGroup}
              facets={effectiveFacets}
              facetsError={facetsError}
              compact
              inline
              hideSearch
            />
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-1.5">
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="py-8 px-4 text-center">
              <p className="text-destructive font-medium mb-1">Error loading data</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-3">
              <table className="w-full text-[12px] min-w-[800px]">
                <thead>
                  <tr className="border-b border-border/80 bg-muted/50 text-left text-muted-foreground text-[11px] uppercase tracking-wide">
                    <th className="py-2.5 px-3 font-semibold w-14 text-right">#</th>
                    <th className="py-2.5 px-3 font-semibold whitespace-nowrap">Image</th>
                    <th className="py-2.5 px-3 font-semibold whitespace-nowrap">Project location</th>
                    <th className="py-2.5 px-3 font-semibold whitespace-nowrap">Asset number</th>
                    <th className="py-2.5 px-3 font-semibold whitespace-nowrap">Description</th>
                    <th className="py-2.5 px-3 font-semibold whitespace-nowrap">Category</th>
                    <th className="py-2.5 px-3 font-semibold whitespace-nowrap">Status</th>
                    <th className="py-2.5 px-3 font-semibold whitespace-nowrap text-center w-24" title="Click row to expand">View more</th>
                  </tr>
                </thead>
                <tbody>
                  {data.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-muted-foreground">
                        No assets found
                      </td>
                    </tr>
                  ) : (
                    data.map((a, index) => {
                      const imageUrl = getAssetImageUrl(a.image_s3_key);
                      const isExpanded = expandedId === a.id;
                      const rowIndex = (filters.page! - 1) * (filters.limit ?? 20) + index + 1;
                      return (
                        <Fragment key={a.id}>
                          <tr
                            key={a.id}
                            className={`border-b border-border/60 transition-all duration-150 cursor-pointer ${isExpanded ? 'bg-green-50/60 dark:bg-green-950/30 shadow-[inset_0_0_0_1px_rgba(34,197,94,0.15)]' : 'hover:bg-green-50/40 dark:hover:bg-green-950/15'}`}
                            onClick={() => setExpandedId(isExpanded ? null : a.id)}
                          >
                            <td className="py-2.5 px-3 align-middle text-right">
                              <span className="font-medium tabular-nums text-foreground/80 text-[12px]">
                                {rowIndex.toLocaleString()}
                              </span>
                            </td>
                            <td className="py-2 px-3 align-middle" onClick={(e) => e.stopPropagation()}>
                              <div
                                className="w-12 h-10 rounded-lg bg-muted/80 flex items-center justify-center overflow-hidden cursor-pointer hover:ring-2 ring-green-500/80 transition-all border border-border/60 shadow-sm"
                                onClick={() => imageUrl && setLightboxSrc(imageUrl)}
                              >
                                {imageUrl ? (
                                  <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap text-foreground/90 text-[12px]">{highlightText(a.project_location, searchRegex)}</td>
                            <td className="py-2.5 px-3 whitespace-nowrap font-medium text-foreground text-[12px]">{highlightText(a.asset_no, searchRegex)}</td>
                            <td className="py-2.5 px-3 max-w-[200px] truncate text-foreground/85 text-[12px]" title={a.description ?? ''}>
                              {highlightText(a.description, searchRegex)}
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap text-muted-foreground text-[12px]">{highlightText(a.category, searchRegex)}</td>
                            <td className="py-2.5 px-3">
                              <Badge
                                variant="outline"
                                className={`text-[10px] font-medium shadow-sm ${
                                  a.status?.toLowerCase().includes('operational')
                                    ? 'border-green-300 text-green-700 dark:text-green-400 bg-green-50/50 dark:bg-green-950/30'
                                    : a.status?.toLowerCase().includes('repair')
                                    ? 'border-orange-300 text-orange-700 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-950/30'
                                    : a.status?.toLowerCase().includes('idle')
                                    ? 'border-cyan-300 text-cyan-700 dark:text-cyan-400 bg-cyan-50/50 dark:bg-cyan-950/30'
                                    : 'bg-muted/50'
                                }`}
                              >
                                {highlightText(a.status, searchRegex)}
                              </Badge>
                            </td>
                            <td className="py-2.5 px-3 text-center whitespace-nowrap">
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-green-600 dark:text-green-400 whitespace-nowrap">
                                {isExpanded ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
                                View more
                              </span>
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr key={`${a.id}-exp`} className="border-b border-border/60">
                              <td colSpan={8} className="p-0 align-top">
                                <div className="mx-3 mb-3 rounded-xl border border-green-200/60 dark:border-green-800/40 bg-gradient-to-br from-green-50/70 to-white dark:from-green-950/40 dark:to-background shadow-md overflow-hidden">
                                  <div className="flex gap-0">
                                    <div
                                      className="w-40 sm:w-48 shrink-0 p-3 bg-muted/30 border-r border-border/60 flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                                      onClick={(e) => { e.stopPropagation(); imageUrl && setLightboxSrc(imageUrl); }}
                                    >
                                      {imageUrl ? (
                                        <img src={imageUrl} alt="" className="w-full max-h-32 object-contain rounded-lg border border-border/50" />
                                      ) : (
                                        <div className="w-full h-28 rounded-lg border border-dashed border-border flex items-center justify-center">
                                          <ImageIcon className="h-10 w-10 text-muted-foreground/50" />
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0 p-4">
                                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-3 text-[12px]">
                                        <div className="sm:col-span-2"><span className="text-muted-foreground font-medium">Description</span><br /><span className="text-foreground">{highlightText(a.description, searchRegex)}</span></div>
                                        <div><span className="text-muted-foreground font-medium">Responsible</span><br />{highlightText(a.responsible_person_name, searchRegex)}</div>
                                        <div><span className="text-muted-foreground font-medium">Phone</span><br />
                                          {a.responsible_person_pno ? (
                                            <a href={`tel:${a.responsible_person_pno}`} className="text-green-600 dark:text-green-400 hover:underline">{a.responsible_person_pno}</a>
                                          ) : '-'}
                                        </div>
                                        <div><span className="text-muted-foreground font-medium">Remark</span><br /><span className="text-foreground">{highlightText(a.remark, searchRegex)}</span></div>
                                        <div><span className="text-muted-foreground font-medium">Asset No</span><br />{highlightText(a.asset_no, searchRegex)}</div>
                                        <div><span className="text-muted-foreground font-medium">Serial No</span><br />{highlightText(a.serial_no, searchRegex)}</div>
                                        <div><span className="text-muted-foreground font-medium">Make</span><br />{highlightText(a.make, searchRegex)}</div>
                                        <div><span className="text-muted-foreground font-medium">Model</span><br />{highlightText(a.model, searchRegex)}</div>
                                        <div><span className="text-muted-foreground font-medium">Ownership</span><br />{highlightText(a.ownership, searchRegex)}</div>
                                      </div>
                                      {isEditMode && (
                                        <div className="flex gap-2 mt-4 pt-3 border-t border-border/60" onClick={(e) => e.stopPropagation()}>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-1.5 h-7 text-[11px]"
                                            onClick={(e) => { e.stopPropagation(); setEditAsset(a); }}
                                          >
                                            <Pencil className="h-3 w-3" />
                                            Edit
                                          </Button>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-1.5 h-7 text-[11px] text-destructive border-destructive/50 hover:bg-destructive/10"
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
                                            {deletingId === a.id ? 'Deleting…' : 'Delete'}
                                          </Button>
                                        </div>
                                      )}
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

          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t bg-muted/20 -mx-3 px-3 py-2 rounded-b-lg">
              <span className="text-[11px] text-muted-foreground">Page {filters.page} of {totalPages}</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters((f) => ({ ...f, page: Math.max(1, f.page! - 1) }))}
                  disabled={filters.page === 1}
                  className="h-7 text-[11px]"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters((f) => ({ ...f, page: Math.min(totalPages, f.page! + 1) }))}
                  disabled={filters.page === totalPages}
                  className="h-7 text-[11px]"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {lightboxSrc && (
        <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
      )}

      {showCreateModal && (
        <AssetFormModal
          defaultCategory={defaultCategory}
          onSuccess={() => {
            refetch();
            setShowCreateModal(false);
          }}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {editAsset && (
        <AssetFormModal
          asset={editAsset}
          defaultCategory={defaultCategory}
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
