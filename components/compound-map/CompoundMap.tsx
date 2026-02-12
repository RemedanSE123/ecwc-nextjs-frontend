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
      const res = await fetch('/ecwc-compound.kml');
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
    <div className="flex h-full w-full min-h-[480px] gap-4">
      {/* Sidebar — clean, professional */}
      <aside className="w-64 lg:w-72 shrink-0 flex flex-col rounded-lg border border-border bg-card shadow-sm overflow-hidden">
        <div className="shrink-0 px-4 py-3 border-b border-border">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2 className="text-sm font-semibold text-foreground">Locations</h2>
            <span className="text-xs text-muted-foreground tabular-nums">{locations.length}</span>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Search locations…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-8 pr-8 text-sm rounded-md border-border bg-background"
            />
            {search.trim() && (
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground tabular-nums">
                {filteredLocations.length}
              </span>
            )}
          </div>
          <div className="flex justify-end mt-1.5">
            <button
              type="button"
              onClick={loadKml}
              disabled={loading}
              className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-50 flex items-center gap-1"
              title="Refresh list"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 border-t border-border">
          {loading ? (
            <div className="p-4 flex items-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin shrink-0" />
              Loading…
            </div>
          ) : locations.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">No locations loaded.</div>
          ) : (
            <ul className="p-2 space-y-0.5">
              {filteredLocations.map((loc) => {
                const selected = loc.id === selectedId;
                const icon = isFacility(loc.name) ? (
                  <Building2 className="h-4 w-4 shrink-0 text-[#15803D] dark:text-green-500" />
                ) : (
                  <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                );
                return (
                  <li key={loc.id} ref={selected ? selectedItemRef : undefined}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(loc.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left text-sm transition-colors border-l-2 ${
                        selected
                          ? 'bg-[#16A34A]/10 dark:bg-[#16A34A]/15 border-[#16A34A] text-foreground font-medium'
                          : 'border-transparent hover:bg-muted/60 text-foreground'
                      }`}
                    >
                      {icon}
                      <span className="min-w-0 flex-1 truncate">{loc.name}</span>
                      {selected && <ChevronRight className="h-4 w-4 shrink-0 text-[#15803D] dark:text-green-500" />}
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

        <div className="shrink-0 p-3 border-t border-border bg-muted/30">
          <a
            href="https://earth.google.com/earth/d/14Qm1aUGZdkw6yf5-CUlJvwqYMJ6DX3CC?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full rounded-md border border-border bg-background py-2 px-3 text-sm font-medium text-foreground hover:bg-muted/60 transition-colors"
          >
            <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
            Open in Google Earth
          </a>
        </div>
      </aside>

      {/* Map area */}
      <div className="flex-1 min-w-0 min-h-[480px] flex flex-col">
        {error && (
          <div className="mb-2 rounded-md bg-amber-500/90 px-4 py-2 text-sm text-white flex items-center justify-between gap-2">
            <span>{error}</span>
            <button type="button" onClick={() => setError(null)} className="underline font-medium">
              Dismiss
            </button>
          </div>
        )}
        <div className="flex-1 min-h-0 rounded-lg border border-border bg-muted/10 overflow-hidden">
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
