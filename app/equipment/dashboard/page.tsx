'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { fetchAssetStats } from '@/lib/api/assets';
import { EQUIPMENT_CATEGORIES, SLUG_TO_DB_CATEGORY } from '@/types/asset';
import { LayoutDashboard, Wrench, Truck, Car, FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'plant-equipment': Wrench,
  'auxiliary-equipment': Truck,
  'light-vehicles': Car,
  'heavy-vehicles': Truck,
  'machinery': Wrench,
  'factory-equipment': Wrench,
};

export default function EquipmentDashboardPage() {
  const [stats, setStats] = useState<{ total: number; byCategory: { category: string; count: number }[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssetStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getCountForSlug = (slug: string) => {
    const dbCategory = SLUG_TO_DB_CATEGORY[slug];
    if (!dbCategory) return 0;
    return stats?.byCategory?.find((c) => c.category === dbCategory)?.count ?? 0;
  };

  return (
    <Layout>
      <div className="space-y-4 text-[13px]">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-foreground">Equipment Dashboard</h1>
          <p className="text-muted-foreground text-[12px]">Overview of all equipment categories</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {EQUIPMENT_CATEGORIES.map((cat) => {
              const Icon = iconMap[cat.slug] ?? FileText;
              const count = getCountForSlug(cat.slug);
              return (
                <Link key={cat.slug} href={`/equipment/${cat.slug}`}>
                  <Card className="hover:shadow-md hover:border-green-300 transition-all cursor-pointer h-full">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                          <Icon className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{cat.name}</p>
                          <p className="text-lg font-bold">{count}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}

        <Card>
          <CardHeader className="p-3 pb-1.5">
            <CardTitle className="text-[13px] font-semibold">Total Assets: {loading ? '...' : stats?.total ?? 0}</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1.5">
            {loading ? (
              <Skeleton className="h-24" />
            ) : stats?.byCategory?.length ? (
              <div className="space-y-2">
                {stats.byCategory.slice(0, 10).map((c) => (
                  <div key={c.category}>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span>{c.category}</span>
                      <span>{c.count} ({stats.total ? Math.round((c.count / stats.total) * 100) : 0}%)</span>
                    </div>
                    <Progress value={stats.total ? (c.count / stats.total) * 100 : 0} className="h-2" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No data yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
