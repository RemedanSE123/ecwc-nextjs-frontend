'use client';

import Layout from '@/components/Layout';
import CompoundMap from '@/components/compound-map/CompoundMap';

export default function CompoundMapPage() {
  return (
    <Layout>
      <div className="flex h-[calc(100vh-5.5rem)] min-h-[900px] flex-col gap-6">
        <div className="shrink-0 relative overflow-hidden rounded-xl border border-border dark:border-zinc-800 bg-gradient-to-b from-background via-muted/30 to-background dark:from-black dark:via-zinc-950 dark:to-black px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#70c82a]/10 text-[#70c82a] text-xs font-bold uppercase tracking-widest mb-6 border border-[#70c82a]/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#70c82a] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#70c82a]"></span>
              </span>
              High-Impact Feature
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
              <span className="text-[#70c82a]">ECWC Compound</span> Map
            </h1>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto mb-3">
              Explore sites, assets, and locations — all in one interactive view
            </p>
            <p className="text-muted-foreground/90 text-sm max-w-2xl mx-auto font-normal leading-relaxed">
              Visualize every ECWC compound on an interactive map. Explore facilities, zoom into specific locations, and add rich content to each site for better planning, monitoring, and decision-making.
            </p>
          </div>
        </div>
        <div className="flex-1 min-h-[65vh] px-4 sm:px-6 lg:px-12 flex justify-center overflow-hidden">
          <div className="w-full max-w-[1600px] h-full min-h-[560px]">
            <CompoundMap />
          </div>
        </div>
      </div>
    </Layout>
  );
}
