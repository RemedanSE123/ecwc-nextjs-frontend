'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { RefreshCw, MoreVertical, MapPin, Building2 } from 'lucide-react';
import { parseKml, FALLBACK_LOCATIONS, type MapLocation } from '@/lib/kmlParser';

const CompoundMapView = dynamic(
  () => import('./CompoundMapView').then((m) => m.default),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-muted/30 rounded-lg min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading map…</div>
      </div>
    ),
  }
);

export default function CompoundMap() {
  const [locations, setLocations] = useState<MapLocation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadKml = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/ecwc-compound.kml');
      const xml = res.ok ? await res.text() : '';
      const parsed = xml ? parseKml(xml) : [];
      const list = parsed.length > 0 ? parsed : FALLBACK_LOCATIONS;
      setLocations(list);
      // Default selection to ECWC Head Office so map and sidebar show it on load
      const headOffice = list.find((l) => l.id === 'head-office' || /ECWC Head Office/i.test(l.name));
      setSelectedId(headOffice?.id ?? list[0]?.id ?? null);
      if (parsed.length === 0 && xml) setError('Could not parse KML; showing default locations.');
    } catch {
      setLocations(FALLBACK_LOCATIONS);
      const headOffice = FALLBACK_LOCATIONS.find((l) => l.id === 'head-office' || /ECWC Head Office/i.test(l.name));
      setSelectedId(headOffice?.id ?? FALLBACK_LOCATIONS[0]?.id ?? null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadKml();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedLocation = locations.find((l) => l.id === selectedId);

  const isFacility = (name: string) =>
    /Head Office|Kality P&E|Kality Production/i.test(name);
  const isWorkshop = (name: string) =>
    /WORKSHOP|FACTORY/i.test(name);

  return (
    <div className="flex h-full w-full min-h-0 gap-4">
      {/* Sidebar: own section, attractive card */}
      <aside className="w-72 shrink-0 flex flex-col rounded-2xl border-2 border-border dark:border-zinc-700 bg-gradient-to-b from-card to-card/80 dark:from-zinc-900/95 dark:to-zinc-800/90 shadow-xl overflow-hidden text-sidebar-foreground">
        <div className="flex shrink-0 items-center justify-between gap-2 min-h-[56px] px-4 py-3 border-b border-border dark:border-zinc-700 bg-[#70c82a]/08 dark:bg-[#70c82a]/12">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#70c82a]/20 flex items-center justify-center shrink-0 border border-[#70c82a]/30">
              <MapPin className="w-4 h-4 text-[#70c82a]" />
            </div>
            <h2 className="font-bold text-sm truncate text-foreground">Map contents</h2>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              onClick={loadKml}
              disabled={loading}
              className="rounded-lg p-2 text-muted-foreground hover:bg-[#70c82a]/15 hover:text-[#70c82a] disabled:opacity-50 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              className="rounded-lg p-2 text-muted-foreground hover:bg-[#70c82a]/15 hover:text-[#70c82a] transition-colors"
              title="More options"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0 bg-background/30 dark:bg-black/20">
          {loading ? (
            <div className="p-5 text-sm text-muted-foreground flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin shrink-0" /> Loading…
            </div>
          ) : locations.length === 0 ? (
            <div className="p-5 text-sm text-muted-foreground">No locations.</div>
          ) : (
            <ul className="p-2 space-y-0.5">
              {locations.map((loc) => {
                const selected = loc.id === selectedId;
                const icon = isFacility(loc.name) ? (
                  <Building2 className="h-4 w-4 shrink-0 text-[#70c82a]" />
                ) : (
                  <MapPin className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                );
                return (
                  <li key={loc.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(loc.id)}
                      className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-all duration-200 ease-out select-none border-l-2 ${
                        selected
                          ? 'bg-[#70c82a]/15 text-foreground font-semibold border-[#70c82a] shadow-sm'
                          : 'hover:bg-sidebar-accent/80 text-sidebar-foreground border-transparent hover:border-[#70c82a]/30 hover:bg-[#70c82a]/5'
                      }`}
                    >
                      {icon}
                      <span className="min-w-0 flex-1 truncate">{loc.name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div className="shrink-0 border-t border-border dark:border-zinc-700 p-3 bg-[#70c82a]/05 dark:bg-[#70c82a]/08">
          <a
            href="https://earth.google.com/earth/d/14Qm1aUGZdkw6yf5-CUlJvwqYMJ6DX3CC?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#70c82a]/40 bg-[#70c82a]/10 py-2.5 px-3 text-sm font-semibold text-[#70c82a] hover:bg-[#70c82a]/20 hover:border-[#70c82a]/60 transition-all"
          >
            <MapPin className="h-4 w-4 shrink-0" />
            Open full map
          </a>
        </div>
      </aside>

      {/* Map: dedicated area with frame */}
      <div className="flex-1 min-h-0 relative flex flex-col">
        {error && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1001] rounded-lg bg-amber-500/95 px-4 py-2 text-center text-sm text-white shadow-lg">
            {error}{' '}
            <button type="button" onClick={() => setError(null)} className="underline ml-1">Dismiss</button>
          </div>
        )}
        <div className="flex-1 min-h-0 rounded-2xl border-2 border-border dark:border-zinc-600 bg-muted/20 shadow-xl overflow-hidden ring-2 ring-black/5">
          {locations.length > 0 ? (
            <CompoundMapView
              locations={locations}
              selectedId={selectedId}
              onSelectLocation={(loc) => setSelectedId(loc.id)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted/30 text-muted-foreground">
              Loading map…
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
