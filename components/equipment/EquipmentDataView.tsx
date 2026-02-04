'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { fetchAssets, fetchAssetStats, fetchAssetFacets, fetchAssetCompleteness } from '@/lib/api/assets';
import { exportAssetsToExcel, exportAssetsToCsv } from '@/lib/export-utils';
import type { Asset, AssetFilters, AssetStats } from '@/types/asset';
import AssetFiltersComponent from './AssetFilters';
import AssetDetailModal from './AssetDetailModal';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, Image as ImageIcon, Download, FileSpreadsheet, FileDown, BarChart2 } from 'lucide-react';

interface EquipmentDataViewProps {
  categoryGroup?: string;
  categoryName: string;
}

export default function EquipmentDataView({ categoryGroup, categoryName }: EquipmentDataViewProps) {
  const [filters, setFilters] = useState<AssetFilters>({ category_group: categoryGroup, page: 1, limit: 20 });
  const [data, setData] = useState<Asset[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<AssetStats | null>(null);
  const [facets, setFacets] = useState<Awaited<ReturnType<typeof fetchAssetFacets>> | null>(null);
  const [completeness, setCompleteness] = useState<Awaited<ReturnType<typeof fetchAssetCompleteness>> | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    setFilters((f) => ({ ...f, category_group: categoryGroup, page: 1 }));
  }, [categoryGroup]);

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
    if (categoryGroup) {
      Promise.all([fetchAssetFacets(categoryGroup), fetchAssetCompleteness(categoryGroup)])
        .then(([f, c]) => {
          setFacets(f);
          setCompleteness(c);
        })
        .catch(() => {});
    }
  }, [categoryGroup]);

  const categoryOptions = stats ? [{ value: categoryGroup || '', label: categoryName }] : [];

  const resetFilters = () => {
    setFilters({ category_group: categoryGroup, page: 1, limit: 20 });
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

  return (
    <div className="space-y-4">
      <AssetFiltersComponent
        filters={filters}
        onFiltersChange={setFilters}
        onReset={resetFilters}
        categoryOptions={categoryGroup ? [] : (stats?.byCategory?.map((c) => ({ value: c.category, label: c.category })) ?? [])}
        hideCategoryFilter={!!categoryGroup}
        facets={facets}
      />

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
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {Object.entries(completeness.columns).map(([col, v]) => (
                <div key={col} className="p-2 rounded-lg bg-background/60 border text-[11px]">
                  <div className="flex justify-between font-medium mb-1">
                    <span className="truncate">{col}</span>
                    <span className={v.pctEmpty > 50 ? 'text-amber-600' : v.pctEmpty > 20 ? 'text-orange-600' : 'text-green-600'}>
                      {v.pctEmpty}% empty
                    </span>
                  </div>
                  <Progress value={v.pctFilled} className="h-1.5" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-green-200/50 dark:border-green-900/30 shadow-sm">
        <CardHeader className="p-4 pb-2 bg-gradient-to-r from-green-50/50 to-transparent dark:from-green-950/20 dark:to-transparent rounded-t-lg border-b">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-[15px] font-semibold text-foreground">
              {categoryName}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({loading ? '...' : total.toLocaleString()} assets)
              </span>
            </CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={exporting} className="gap-2">
                  <Download className="w-4 h-4" />
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
              <table className="w-full text-[12px] min-w-[900px]">
                <thead>
                  <tr className="border-b bg-muted/40 text-left text-muted-foreground">
                    <th className="py-2.5 px-3 font-medium whitespace-nowrap">Image</th>
                    <th className="py-2.5 px-3 font-medium whitespace-nowrap">Asset No</th>
                    <th className="py-2.5 px-3 font-medium whitespace-nowrap">Description</th>
                    <th className="py-2.5 px-3 font-medium whitespace-nowrap">Category</th>
                    <th className="py-2.5 px-3 font-medium whitespace-nowrap">Status</th>
                    <th className="py-2.5 px-3 font-medium whitespace-nowrap">Responsible</th>
                    <th className="py-2.5 px-3 font-medium whitespace-nowrap">Phone</th>
                    <th className="py-2.5 px-3 font-medium whitespace-nowrap">Remark</th>
                    <th className="py-2.5 px-3 font-medium whitespace-nowrap text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-muted-foreground">
                        No assets found
                      </td>
                    </tr>
                  ) : (
                    data.map((a) => (
                      <tr key={a.id} className="border-b hover:bg-green-50/30 dark:hover:bg-green-950/10 transition-colors">
                        <td className="py-2 px-3 align-middle">
                          <div className="w-10 h-8 rounded bg-muted flex items-center justify-center">
                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </td>
                        <td className="py-2 px-3 font-medium whitespace-nowrap">{a.asset_no ?? '-'}</td>
                        <td className="py-2 px-3 max-w-[180px] truncate" title={a.description ?? ''}>
                          {a.description ?? '-'}
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap text-muted-foreground">{a.category ?? '-'}</td>
                        <td className="py-2 px-3">
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${
                              a.status?.toLowerCase().includes('operational')
                                ? 'border-green-300 text-green-700 dark:text-green-400'
                                : a.status?.toLowerCase().includes('repair')
                                ? 'border-orange-300 text-orange-700 dark:text-orange-400'
                                : a.status?.toLowerCase().includes('idle')
                                ? 'border-cyan-300 text-cyan-700 dark:text-cyan-400'
                                : ''
                            }`}
                          >
                            {a.status ?? '-'}
                          </Badge>
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap">{a.responsible_person_name ?? '-'}</td>
                        <td className="py-2 px-3 whitespace-nowrap">
                          <a
                            href={a.responsible_person_pno ? `tel:${a.responsible_person_pno}` : '#'}
                            className="text-green-600 hover:underline text-[11px]"
                          >
                            {a.responsible_person_pno ?? '-'}
                          </a>
                        </td>
                        <td className="py-2 px-3 max-w-[120px] truncate" title={a.remark ?? ''}>
                          {a.remark ?? '-'}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-[11px] gap-1"
                            onClick={() => setSelectedAsset(a)}
                          >
                            <Eye className="h-3 w-3" />
                            Detail
                          </Button>
                        </td>
                      </tr>
                    ))
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

      {selectedAsset && (
        <AssetDetailModal asset={selectedAsset} onClose={() => setSelectedAsset(null)} />
      )}
    </div>
  );
}
