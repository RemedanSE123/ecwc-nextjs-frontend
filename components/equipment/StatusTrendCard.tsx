'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ensureStatusSnapshot, fetchStatusTrend } from '@/lib/api/assets';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

const TREND_LINE_CONFIG = {
  op: { dataKey: 'op' as const, stroke: '#10b981', fillId: 'opGrad', name: 'OP' },
  idle: { dataKey: 'idle' as const, stroke: '#3b82f6', fillId: 'idleGrad', name: 'Idle' },
  down: { dataKey: 'down' as const, stroke: '#ef4444', fillId: 'downGrad', name: 'Down' },
} as const;

type TrendPeriod = '1d' | 'week' | 'month';
type TrendView = 'single' | 'combined';
const TREND_PERIOD_DAYS: Record<TrendPeriod, number> = { '1d': 1, week: 7, month: 30 };

function getTrendDateRange(period: TrendPeriod): { date: string; op: number; idle: number; down: number }[] {
  const days = TREND_PERIOD_DAYS[period];
  const out: { date: string; op: number; idle: number; down: number }[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    out.push({ date: d.toISOString().slice(0, 10), op: 0, idle: 0, down: 0 });
  }
  return out;
}

function formatDateRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const fmt = (d: Date) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return `${fmt(s)} – ${fmt(e)}`;
}

function slugToId(slug: string): string {
  return slug.replace(/[^a-z0-9]/gi, '-');
}

interface StatusTrendCardProps {
  categorySlug: string;
  categoryName: string;
  borderColor?: string;
}

export default function StatusTrendCard({ categorySlug, categoryName, borderColor = '#f59e0b' }: StatusTrendCardProps) {
  const [trendData, setTrendData] = useState<{ date: string; op: number; idle: number; down: number }[]>([]);
  const [trendLineStatus, setTrendLineStatus] = useState<'op' | 'idle' | 'down'>('op');
  const [trendPeriod, setTrendPeriod] = useState<TrendPeriod>('week');
  const [trendView, setTrendView] = useState<TrendView>('combined');
  const [trendLoading, setTrendLoading] = useState(false);
  const [trendError, setTrendError] = useState<string | null>(null);

  const idPrefix = `trend-${slugToId(categorySlug)}`;

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setTrendLoading(true);
      setTrendError(null);
      try {
        // Best effort: if this fails, still fetch existing trend rows.
        try {
          await ensureStatusSnapshot();
        } catch (snapshotErr) {
          console.warn('status-snapshot failed, continuing with existing trend data', snapshotErr);
        }

        // Always fetch daily snapshots so week/month show each day individually.
        const rows = await fetchStatusTrend('day', categorySlug);
        if (cancelled) return;
        const normalized = (rows ?? []).map((r) => ({
          date: String(r.date).slice(0, 10),
          op: Number(r.op ?? 0),
          idle: Number(r.idle ?? 0),
          down: Number(r.down ?? 0),
        }));
        setTrendData(normalized);
      } catch (err) {
        console.error(err);
        if (cancelled) return;
        setTrendData([]);
        setTrendError(err instanceof Error ? err.message : 'Failed to load trend data');
      } finally {
        if (!cancelled) setTrendLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [categorySlug, trendPeriod]);

  const days = TREND_PERIOD_DAYS[trendPeriod];
  const dateRange = getTrendDateRange(trendPeriod);
  const displayData = trendData.length ? trendData.slice(-days) : dateRange;
  const dateRangeStr = displayData.length
    ? formatDateRange(displayData[0]!.date, displayData[displayData.length - 1]!.date)
    : '';
  const currentVal = displayData.length ? (displayData[displayData.length - 1]?.[trendLineStatus] ?? 0) : 0;
  const activeLine = TREND_LINE_CONFIG[trendLineStatus];

  return (
    <Card
      className="shadow-xl overflow-hidden rounded-xl border-l-4 min-w-0 hover:shadow-2xl transition-shadow duration-300"
      style={{ borderLeftColor: borderColor }}
    >
      <CardHeader className="py-3 border-b">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: activeLine.stroke }} />
              {categoryName} — {activeLine.name}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">{dateRangeStr}</p>
          </div>
          <span className="text-lg font-bold tabular-nums shrink-0" style={{ color: activeLine.stroke }}>
            {currentVal.toLocaleString()}
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-3 min-w-0 overflow-hidden">
        <div className="flex flex-wrap gap-2 mb-2">
          <div className="flex gap-1 rounded-lg bg-muted/50 p-1">
            {(['op', 'idle', 'down'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setTrendLineStatus(s)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${trendLineStatus === s ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {TREND_LINE_CONFIG[s].name}
              </button>
            ))}
          </div>
          <div className="flex gap-1 rounded-lg bg-muted/50 p-1">
            {(['1d', 'week', 'month'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setTrendPeriod(p)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${trendPeriod === p ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {p === '1d' ? '1 Day' : p === 'week' ? 'Week' : 'Month'}
              </button>
            ))}
          </div>
          <div className="flex gap-1 rounded-lg bg-muted/50 p-1">
            {(['combined', 'single'] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setTrendView(v)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${trendView === v ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {v === 'combined' ? '3 Lines' : 'Single'}
              </button>
            ))}
          </div>
        </div>
        <div className="h-[260px] min-w-0 w-full">
          {trendLoading ? (
            <Skeleton className="h-full w-full" />
          ) : trendError ? (
            <div className="h-full w-full rounded-lg border border-dashed border-border/80 bg-muted/20 flex items-center justify-center px-4">
              <p className="text-xs text-muted-foreground text-center">
                Could not load chart data. {trendError}
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              {trendView === 'single' ? (
              <AreaChart data={displayData} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                <defs>
                  <linearGradient id={`${idPrefix}-opGrad`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id={`${idPrefix}-idleGrad`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id={`${idPrefix}-downGrad`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(v) => new Date(v).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  tick={{ fontSize: 10 }}
                />
                <YAxis tick={{ fontSize: 10 }} />
                <RechartsTooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    const p = payload[0]?.payload as { date?: string; op?: number; idle?: number; down?: number } | undefined;
                    const date = new Date(String(label ?? p?.date ?? '')).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                    const val = (p?.[trendLineStatus] ?? 0) as number;
                    return (
                      <div className="rounded-xl border border-border/80 bg-background/95 backdrop-blur-sm px-3 py-2.5 shadow-xl text-xs font-medium text-foreground ring-1 ring-black/5">
                        <div className="font-semibold mb-1">{date}</div>
                        <div style={{ color: activeLine.stroke }}>{activeLine.name}: {val.toLocaleString()}</div>
                      </div>
                    );
                  }}
                />
                <Area type="monotone" dataKey={activeLine.dataKey} stroke={activeLine.stroke} fill={`url(#${idPrefix}-${activeLine.fillId})`} strokeWidth={2} name={activeLine.name} dot={false} />
              </AreaChart>
              ) : (
                <LineChart data={displayData} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                  <defs>
                    <linearGradient id={`${idPrefix}-lineOp`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0.6} />
                    </linearGradient>
                    <linearGradient id={`${idPrefix}-lineIdle`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.6} />
                    </linearGradient>
                    <linearGradient id={`${idPrefix}-lineDown`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(v) => new Date(v).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis tick={{ fontSize: 10 }} />
                  <RechartsTooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      const p = payload[0]?.payload as { date?: string; op?: number; idle?: number; down?: number } | undefined;
                      const date = new Date(String(label ?? p?.date ?? '')).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                      return (
                        <div className="rounded-xl border border-border/80 bg-background/95 backdrop-blur-sm px-3 py-2.5 shadow-xl text-xs font-medium text-foreground ring-1 ring-black/5">
                          <div className="font-semibold mb-1">{date}</div>
                          <div style={{ color: TREND_LINE_CONFIG.op.stroke }}>OP: {(p?.op ?? 0).toLocaleString()}</div>
                          <div style={{ color: TREND_LINE_CONFIG.idle.stroke }}>Idle: {(p?.idle ?? 0).toLocaleString()}</div>
                          <div style={{ color: TREND_LINE_CONFIG.down.stroke }}>Down: {(p?.down ?? 0).toLocaleString()}</div>
                        </div>
                      );
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="op"
                    stroke={`url(#${idPrefix}-lineOp)`}
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 4, stroke: '#10b981', strokeWidth: 1.5, fill: '#ffffff' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="idle"
                    stroke={`url(#${idPrefix}-lineIdle)`}
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 4, stroke: '#3b82f6', strokeWidth: 1.5, fill: '#ffffff' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="down"
                    stroke={`url(#${idPrefix}-lineDown)`}
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 4, stroke: '#ef4444', strokeWidth: 1.5, fill: '#ffffff' }}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          )}
        </div>
        {trendView === 'combined' && (
          <div className="mt-2 flex flex-wrap gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-emerald-500/10 px-2.5 py-1 text-[11px]">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="font-medium">OP</span>
              <span className="tabular-nums text-emerald-600 dark:text-emerald-400">
                {(displayData[displayData.length - 1]?.op ?? 0).toLocaleString()}
              </span>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-blue-500/10 px-2.5 py-1 text-[11px]">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              <span className="font-medium">Idle</span>
              <span className="tabular-nums text-blue-600 dark:text-blue-400">
                {(displayData[displayData.length - 1]?.idle ?? 0).toLocaleString()}
              </span>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-red-500/10 px-2.5 py-1 text-[11px]">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              <span className="font-medium">Down</span>
              <span className="tabular-nums text-red-600 dark:text-red-400">
                {(displayData[displayData.length - 1]?.down ?? 0).toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
