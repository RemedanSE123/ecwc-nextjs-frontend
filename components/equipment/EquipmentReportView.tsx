'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { fetchAssetReports } from '@/lib/api/assets';
import type { AssetReportData } from '@/types/asset';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3, PieChart, MapPin, Clock, Activity, MapPinned } from 'lucide-react';
import StatusTrendCard from './StatusTrendCard';

const CATEGORY_COLORS: Record<string, string> = {
  'plant-equipment': '#00c853',
  machinery: '#2962ff',
  'heavy-vehicles': '#ff1744',
  'light-vehicles': '#ff9100',
  'factory-equipment': '#aa00ff',
  'auxiliary-equipment': '#00e5ff',
};

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

  const { categoryBreakdown, statusBreakdown, locationBreakdown } = report;

  return (
    <div className="space-y-4">
      {/* Status Trend — category-specific graph */}
      <StatusTrendCard
        categorySlug={categoryGroup ?? 'all'}
        categoryName={categoryName}
        borderColor={categoryGroup ? CATEGORY_COLORS[categoryGroup] ?? '#f59e0b' : '#f59e0b'}
      />

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

      {/* Status Breakdown & Top Locations — side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Status Breakdown */}
        <Card className="overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-slate-50 to-slate-100/80 dark:from-slate-900/50 dark:to-slate-800/30">
          <CardHeader className="py-3.5 border-b border-slate-200/60 dark:border-slate-700/50 bg-slate-50/80 dark:bg-slate-900/40">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200">
              <Activity className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              Status Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-3">
            {statusBreakdown.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4">No data</p>
            ) : (
              <div className="space-y-3">
                {statusBreakdown.map((s) => (
                  <div key={s.status} className="group">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="font-medium text-foreground">{s.status}</span>
                      <span className="tabular-nums font-semibold text-muted-foreground">{s.total} ({s.percentage}%)</span>
                    </div>
                    <Progress value={s.percentage} className="h-2.5" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Locations */}
        <Card className="overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-sky-50 to-slate-100/80 dark:from-sky-950/30 dark:to-slate-800/30">
          <CardHeader className="py-3.5 border-b border-sky-200/60 dark:border-sky-900/50 bg-sky-50/80 dark:bg-sky-950/40">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200">
              <MapPinned className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              Top Locations
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-3">
            <div className="space-y-0 max-h-[280px] overflow-y-auto pr-1">
              {locationBreakdown.length === 0 ? (
                <p className="text-muted-foreground text-sm py-4">No data</p>
              ) : (
                [...locationBreakdown]
                  .sort((a, b) => (b.total ?? 0) - (a.total ?? 0))
                  .map((l) => (
                    <div
                      key={l.location}
                      className="flex justify-between items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-sky-50/50 dark:hover:bg-sky-950/20 transition-colors border-b border-border/40 last:border-0"
                    >
                      <span className="text-xs truncate flex-1 min-w-0 font-medium text-foreground">{l.location}</span>
                      <span className="text-sm font-bold tabular-nums text-sky-600 dark:text-sky-400 shrink-0">{l.total}</span>
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
