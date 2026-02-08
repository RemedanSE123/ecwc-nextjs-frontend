'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { fetchAssetReports } from '@/lib/api/assets';
import type { AssetReportData } from '@/types/asset';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3, PieChart, MapPin, Clock } from 'lucide-react';

interface EquipmentReportViewProps {
  categoryGroup?: string;  // slug e.g. plant-equipment
  categoryName: string;
}

export default function EquipmentReportView({ categoryGroup, categoryName }: EquipmentReportViewProps) {
  const [report, setReport] = useState<AssetReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchAssetReports(undefined, categoryGroup)
      .then((r) => { setReport(r); setError(null); })
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false));
  }, [categoryGroup]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 px-4 text-center">
        <p className="text-destructive font-medium mb-1">Error loading report</p>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!report) return <div className="text-muted-foreground">No report data</div>;

  const { categoryBreakdown, statusBreakdown, locationBreakdown, recentAssets } = report;

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <BarChart3 className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Categories</p>
                <p className="text-lg font-bold">{categoryBreakdown.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <PieChart className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Status Types</p>
                <p className="text-lg font-bold">{statusBreakdown.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <MapPin className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Locations</p>
                <p className="text-lg font-bold">{locationBreakdown.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Total</p>
                <p className="text-lg font-bold">{categoryBreakdown.reduce((s, c) => s + c.total, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Category Breakdown */}
        <Card>
          <CardHeader className="p-3 pb-1.5">
            <CardTitle className="text-[13px] font-semibold">Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1.5 space-y-3">
            {categoryBreakdown.length === 0 ? (
              <p className="text-muted-foreground text-sm">No data</p>
            ) : (
              categoryBreakdown.map((c) => (
                <div key={c.category}>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span>{c.category}</span>
                    <span className="font-medium">{c.total} ({c.percentage}%)</span>
                  </div>
                  <Progress value={c.percentage} className="h-2" />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Status Breakdown */}
        <Card>
          <CardHeader className="p-3 pb-1.5">
            <CardTitle className="text-[13px] font-semibold">Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1.5 space-y-3">
            {statusBreakdown.length === 0 ? (
              <p className="text-muted-foreground text-sm">No data</p>
            ) : (
              statusBreakdown.map((s) => (
                <div key={s.status}>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span>{s.status}</span>
                    <span className="font-medium">{s.total} ({s.percentage}%)</span>
                  </div>
                  <Progress value={s.percentage} className="h-2" />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Location & Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="p-3 pb-1.5">
            <CardTitle className="text-[13px] font-semibold">Top Locations</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1.5">
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {locationBreakdown.length === 0 ? (
                <p className="text-muted-foreground text-sm">No data</p>
              ) : (
                [...locationBreakdown]
                  .sort((a, b) => (a.location ?? '').localeCompare(b.location ?? '', undefined, { sensitivity: 'base' }))
                  .map((l) => (
                  <div key={l.location} className="flex justify-between text-[11px] py-1 border-b last:border-0">
                    <span className="truncate flex-1">{l.location}</span>
                    <span className="font-medium ml-2">{l.total}</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-3 pb-1.5">
            <CardTitle className="text-[13px] font-semibold">Recent Assets</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1.5">
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {recentAssets.length === 0 ? (
                <p className="text-muted-foreground text-sm">No data</p>
              ) : (
                recentAssets.map((a) => (
                  <div key={a.id} className="text-[11px] py-1 border-b last:border-0">
                    <span className="font-medium">{a.asset_no ?? a.description?.slice(0, 30)}</span>
                    <span className="text-muted-foreground ml-1">• {a.status ?? '-'}</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
