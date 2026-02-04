'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { fetchAssetStats } from '@/lib/api/assets';
import type { AssetStats } from '@/types/asset';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Percent,
} from 'lucide-react';
import { motion } from 'framer-motion';

/** DB statuses mapped to OP (Operational) */
const OP_STATUSES = ['op'];
/** DB statuses mapped to Idle */
const IDLE_STATUSES = ['idle', '0', 'unknown'];
/** DB statuses mapped to Down - everything not OP or Idle */
const DOWN_STATUS_LABELS: Record<string, string> = {
  down: 'Down',
  ur: 'Under Repair',
  hr: 'Heavy Repair',
  accident: 'Accident',
  'approved for disposal': 'Approved For Disposal',
  'waiting for installation': 'Waiting for Installation',
  'under installation': 'Under Installation',
  'under commissioning': 'Under Commissioning',
  rfd: 'Ready For Disposal',
  ui: 'Under Installation',
};

function getDisplayLabel(status: string): string {
  const raw = status.trim();
  const key = raw.toLowerCase();
  if (DOWN_STATUS_LABELS[key]) return DOWN_STATUS_LABELS[key];
  // Match prefix (e.g. "HR (currently missing)" -> Heavy Repair)
  for (const [k, label] of Object.entries(DOWN_STATUS_LABELS)) {
    if (key === k || key.startsWith(k + ' ') || key.startsWith(k + '(')) return label;
  }
  return raw;
}

function categorizeStatuses(byStatus: { status: string; count: number }[]) {
  let op = 0;
  let idle = 0;
  const downMap = new Map<string, number>();

  for (const s of byStatus ?? []) {
    const raw = (s.status ?? '').trim();
    const key = raw.toLowerCase();
    const count = s.count;

    if (OP_STATUSES.includes(key)) {
      op += count;
    } else if (IDLE_STATUSES.includes(key)) {
      idle += count;
    } else {
      const label = getDisplayLabel(raw);
      downMap.set(label, (downMap.get(label) ?? 0) + count);
    }
  }

  const downBreakdown = Array.from(downMap.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
  const down = downBreakdown.reduce((sum, d) => sum + d.count, 0);
  return { op, idle, down, downBreakdown };
}

interface CategoryKPICardsProps {
  categoryGroup: string;
}

const KPI_CONFIG = [
  {
    key: 'total',
    title: 'Total Assets',
    subLabel: 'In category',
    icon: Activity,
    bg: 'bg-slate-500/10',
    iconBg: 'bg-slate-500/20',
    iconColor: 'text-slate-600 dark:text-slate-400',
  },
  {
    key: 'op',
    title: 'OP',
    subLabel: 'Operational',
    icon: CheckCircle2,
    bg: 'bg-emerald-500/10',
    iconBg: 'bg-emerald-500/20',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    key: 'down',
    title: 'Down',
    subLabel: 'Hover for breakdown',
    icon: AlertTriangle,
    bg: 'bg-red-500/10',
    iconBg: 'bg-red-500/20',
    iconColor: 'text-red-600 dark:text-red-400',
  },
  {
    key: 'idle',
    title: 'Idle',
    subLabel: 'Available',
    icon: Clock,
    bg: 'bg-cyan-500/10',
    iconBg: 'bg-cyan-500/20',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
  },
  {
    key: 'availability',
    title: 'Availability',
    subLabel: 'OP %',
    icon: Percent,
    bg: 'bg-green-500/10',
    iconBg: 'bg-green-500/20',
    iconColor: 'text-green-600 dark:text-green-400',
  },
];

export default function CategoryKPICards({ categoryGroup }: CategoryKPICardsProps) {
  const [stats, setStats] = useState<AssetStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssetStats(undefined, categoryGroup)
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [categoryGroup]);

  const { op, idle, down, downBreakdown } = useMemo(
    () => categorizeStatuses(stats?.byStatus ?? []),
    [stats?.byStatus]
  );
  const total = stats?.total ?? 0;
  const availability = total ? Math.round((op / total) * 100) : 0;

  const values: Record<string, string | number> = {
    total: total.toLocaleString(),
    op: op.toLocaleString(),
    down: down.toLocaleString(),
    idle: idle.toLocaleString(),
    availability: `${availability}%`,
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {KPI_CONFIG.map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {KPI_CONFIG.map((config, i) => {
          const Icon = config.icon;
          const value = values[config.key];
          const isDownWithTooltip = config.key === 'down' && downBreakdown.length > 0;
          const card = (
            <Card
              className={`overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 group ${config.bg} hover:scale-[1.02] ${isDownWithTooltip ? 'cursor-help' : ''}`}
            >
              <CardContent className="p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold truncate">
                      {config.title}
                    </p>
                    <p className="text-xl font-bold mt-0.5 tabular-nums truncate">{value}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                      {config.subLabel}
                    </p>
                  </div>
                  <div
                    className={`p-2 rounded-lg ${config.iconBg} shrink-0 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className={`h-4 w-4 ${config.iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
          return (
            <motion.div
              key={config.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              {isDownWithTooltip ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="h-full">{card}</div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <div className="space-y-1.5 py-1">
                      <p className="font-semibold text-xs border-b pb-1">Down breakdown</p>
                      {downBreakdown.map((d) => (
                        <div key={d.label} className="flex justify-between gap-4 text-xs">
                          <span>{d.label}</span>
                          <span className="font-medium tabular-nums">{d.count}</span>
                        </div>
                      ))}
                    </div>
                  </TooltipContent>
                </Tooltip>
              ) : (
                card
              )}
            </motion.div>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
