'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { RefreshCw, MapPin, Building2, Search, ChevronRight } from 'lucide-react';
import { parseKml, FALLBACK_LOCATIONS, type MapLocation } from '@/lib/kmlParser';
import { Input } from '@/components/ui/input';

const CompoundMapView = dynamic(
  () => import('./CompoundMapView').then((m) => m.default),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-muted/20 rounded-lg min-h-[400px]">
        <p className="text-sm text-muted-foreground">Loading map…</p>
      </div>
    ),
  }
);

export default function CompoundMap() {
  const [locations, setLocations] = useState<MapLocation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const selectedItemRef = useRef<HTMLLIElement>(null);
  const isInitialSelection = useRef(true);

  const loadKml = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/ECWC%20Compound.kml');
      const xml = res.ok ? await res.text() : '';
      const parsed = xml ? parseKml(xml) : [];
      const list = parsed.length > 0 ? parsed : FALLBACK_LOCATIONS;
      setLocations(list);
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
  }, [loadKml]);

  const selectedLocation = locations.find((l) => l.id === selectedId);
  const searchLower = search.trim().toLowerCase();
  const filteredLocations = searchLower
    ? locations.filter((l) => l.name.toLowerCase().includes(searchLower))
    : locations;

  useEffect(() => {
    if (!selectedId || !selectedItemRef.current) return;
    if (isInitialSelection.current) {
      isInitialSelection.current = false;
      return;
    }
    selectedItemRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [selectedId]);

  const isFacility = (name: string) => /Head Office|Kality P&E|Kality Production/i.test(name);

  return (
    <div className="flex h-full w-full min-h-0 gap-4">
      {/* Sidebar — compact, attractive, scrollable */}
      <aside className="w-72 lg:w-80 shrink-0 flex flex-col h-full rounded-xl border border-border bg-card shadow-lg overflow-hidden ring-1 ring-black/5">
        <div className="shrink-0 px-4 py-3.5 border-b border-border bg-gradient-to-br from-primary/5 via-muted/20 to-transparent">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2 className="text-sm font-bold text-foreground tracking-tight">Locations</h2>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center min-w-[1.5rem] h-5 px-1.5 rounded-full bg-primary/20 text-primary text-[10px] font-semibold tabular-nums">
                {locations.length}
              </span>
              <button
                type="button"
                onClick={loadKml}
                disabled={loading}
                className="p-1 rounded-md text-muted-foreground hover:text-primary hover:bg-muted/60 disabled:opacity-50 transition-all"
                title="Refresh list"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Search locations…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-8 pr-8 text-sm rounded-lg border-border bg-background/80 focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all"
            />
            {search.trim() && (
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground tabular-nums">
                {filteredLocations.length}
              </span>
            )}
          </div>
        </div>

        <div className="compound-map-sidebar-list flex-1 overflow-y-auto overflow-x-hidden min-h-0 max-h-[360px] border-t border-border/80 overscroll-contain bg-background/50">
          {loading ? (
            <div className="p-4 flex items-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className="h-3.5 w-3.5 animate-spin shrink-0" />
              Loading…
            </div>
          ) : locations.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">No locations loaded.</div>
          ) : (
            <ul className="p-1.5 space-y-px">
              {filteredLocations.map((loc) => {
                const selected = loc.id === selectedId;
                const icon = isFacility(loc.name) ? (
                  <div className="shrink-0 w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Building2 className="h-3.5 w-3.5 text-primary" />
                  </div>
                ) : (
                  <div className="shrink-0 w-7 h-7 rounded-lg bg-muted/70 flex items-center justify-center">
                    <MapPin className="h-3.5 w-3.5 text-foreground/70" />
                  </div>
                );
                return (
                  <li key={loc.id} ref={selected ? selectedItemRef : undefined}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(loc.id)}
                      className={`w-full flex items-start gap-2 px-2.5 py-1.5 rounded-md text-left transition-all duration-200 border-l-[3px] group ${
                        selected
                          ? 'bg-primary/15 dark:bg-primary/25 border-primary text-foreground font-semibold shadow-sm hover:bg-primary/20'
                          : 'border-transparent hover:bg-muted/60 text-foreground/90 hover:border-primary/20 hover:text-foreground'
                      }`}
                    >
                      {icon}
                      <span className="min-w-0 flex-1 text-sm font-medium text-foreground leading-relaxed break-words text-left pt-0.5">{loc.name}</span>
                      {selected && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-primary mt-0.5" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          {search.trim() && filteredLocations.length === 0 && (
            <div className="px-3 py-4 text-sm text-muted-foreground text-center">
              No locations match &quot;{search}&quot;
            </div>
          )}
        </div>

        <div className="shrink-0 p-2.5 border-t border-border bg-gradient-to-t from-muted/50 to-muted/30">
          <a
            href="https://earth.google.com/earth/d/14Qm1aUGZdkw6yf5-CUlJvwqYMJ6DX3CC?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full rounded-lg border-2 border-primary/30 bg-primary/5 py-2.5 px-3 text-sm font-semibold text-foreground hover:bg-primary/15 hover:border-primary/50 hover:shadow-md transition-all duration-200"
          >
            <MapPin className="h-4 w-4 shrink-0 text-primary" />
            Open in Google Earth
          </a>
        </div>
      </aside>

      {/* Map area — same height as sidebar */}
      <div className="flex-1 min-w-0 h-full flex flex-col min-h-0">
        {error && (
          <div className="mb-2 rounded-md bg-amber-500/90 px-4 py-2 text-sm text-white flex items-center justify-between gap-2">
            <span>{error}</span>
            <button type="button" onClick={() => setError(null)} className="underline font-medium">
              Dismiss
            </button>
          </div>
        )}
        <div className="flex-1 min-h-0 rounded-xl border border-border bg-muted/10 overflow-hidden">
          {locations.length > 0 ? (
            <CompoundMapView
              locations={locations}
              selectedId={selectedId}
              onSelectLocation={(loc) => setSelectedId(loc.id)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted/20 text-muted-foreground text-sm">
              Loading map…
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
