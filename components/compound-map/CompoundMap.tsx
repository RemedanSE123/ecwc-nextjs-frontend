'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { RefreshCw, MapPin, Search, ChevronRight, ChevronDown, Menu, X } from 'lucide-react';
import { parseKml, FALLBACK_LOCATIONS, type MapLocation } from '@/lib/kmlParser';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

/* ── Group definitions ─────────────────────────────────────────────── */
interface LocationGroup {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  test: (name: string) => boolean;
}

const GROUPS: LocationGroup[] = [
  {
    id: 'head-office',
    label: 'Head Office',
    icon: MapPin,
    color: 'text-[#70c82a]',
    bgColor: 'bg-[#70c82a]/10',
    borderColor: 'border-[#70c82a]/30',
    test: (n) => /head office/i.test(n),
  },
  {
    id: 'kality',
    label: 'Kality Compound',
    icon: MapPin,
    color: 'text-[#70c82a]',
    bgColor: 'bg-[#70c82a]/10',
    borderColor: 'border-[#70c82a]/30',
    test: (n) => /kality|workshop|factory|production|flexi/i.test(n),
  },
  {
    id: 'projects',
    label: 'Project Sites',
    icon: MapPin,
    color: 'text-[#70c82a]',
    bgColor: 'bg-[#70c82a]/10',
    borderColor: 'border-[#70c82a]/30',
    test: (n) => /project|airfield|corridor|negele|yabelo|semera/i.test(n),
  },
];

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
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'head-office': true,
    'kality': true,
    'projects': true,
  });
  const selectedItemRef = useRef<HTMLLIElement>(null);
  const isInitialSelection = useRef(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const sync = () => {
      const desktop = mq.matches;
      setIsDesktop(desktop);
      if (desktop) setSidebarOpen(true);
    };
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

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

  useEffect(() => { loadKml(); }, [loadKml]);

  useEffect(() => {
    if (!selectedId || !selectedItemRef.current) return;
    if (isInitialSelection.current) { isInitialSelection.current = false; return; }
    selectedItemRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [selectedId]);

  const searchLower = search.trim().toLowerCase();

  /* Assign each location to a group, or "other" */
  const getGroup = (name: string) => GROUPS.find((g) => g.test(name)) ?? null;

  const groupedData = GROUPS.map((group) => ({
    group,
    items: locations.filter((l) => {
      const belongs = getGroup(l.name)?.id === group.id;
      if (!belongs) return false;
      if (searchLower) return l.name.toLowerCase().includes(searchLower);
      return true;
    }),
  }));

  const ungrouped = locations.filter((l) => {
    const belongs = getGroup(l.name) === null;
    if (!belongs) return false;
    if (searchLower) return l.name.toLowerCase().includes(searchLower);
    return true;
  });

  const totalFiltered = groupedData.reduce((s, g) => s + g.items.length, 0) + ungrouped.length;

  const toggleGroup = (id: string) =>
    setExpandedGroups((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="relative flex flex-col md:flex-row h-full w-full min-h-[70vh] md:min-h-0 gap-0 md:gap-4 overflow-x-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && !isDesktop && (
        <button
          type="button"
          aria-label="Close locations panel"
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — grouped tree (slides in on mobile) */}
      <aside
        id="compound-map-sidebar"
        className={cn(
          'flex flex-col rounded-xl border border-border bg-card shadow-lg overflow-hidden ring-1 ring-black/5',
          'md:relative md:z-0 md:h-full md:w-72 lg:w-80 md:shrink-0 md:translate-x-0 md:opacity-100',
          'fixed z-50 left-3 top-20 bottom-6 w-[min(18.5rem,calc(100vw-1.5rem))] max-h-[min(calc(100dvh-6rem),560px)]',
          'md:!relative md:!left-auto md:!top-auto md:!bottom-auto md:!right-auto md:!translate-x-0 md:!opacity-100 md:!pointer-events-auto md:!max-h-none',
          !isDesktop && !sidebarOpen && '-translate-x-[calc(100%+2rem)] opacity-0 pointer-events-none',
          !isDesktop && sidebarOpen && 'translate-x-0 opacity-100',
          !isDesktop && 'transition-transform duration-300 ease-out',
        )}
      >
        {/* Header */}
        <div className="shrink-0 px-4 py-3.5 border-b border-border bg-gradient-to-br from-[#70c82a]/5 via-muted/20 to-transparent">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2 className="text-sm font-bold text-foreground tracking-tight">Locations</h2>
            <div className="flex items-center gap-1.5">
              {!isDesktop && (
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="md:hidden p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  aria-label="Close panel"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <span className="inline-flex items-center justify-center min-w-[1.5rem] h-5 px-1.5 rounded-full bg-[#70c82a]/20 text-[#70c82a] text-[10px] font-bold tabular-nums">
                {locations.length}
              </span>
              <button
                type="button"
                onClick={loadKml}
                disabled={loading}
                className="p-1 rounded-md text-muted-foreground hover:text-[#70c82a] hover:bg-muted/60 disabled:opacity-50 transition-all"
                title="Refresh"
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
              className="h-9 pl-8 pr-8 text-sm rounded-lg border-border bg-background/80 focus:ring-2 focus:ring-[#70c82a]/25 focus:border-[#70c82a]/50 transition-all"
            />
            {search.trim() && (
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground tabular-nums">
                {totalFiltered}
              </span>
            )}
          </div>
        </div>

        {/* Grouped list */}
        <div className="compound-map-sidebar-list flex-1 overflow-y-auto overflow-x-hidden min-h-0 max-h-[360px] border-t border-border/80 overscroll-contain bg-background/50">
          {loading ? (
            <div className="p-4 flex items-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className="h-3.5 w-3.5 animate-spin shrink-0" />
              Loading…
            </div>
          ) : locations.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">No locations loaded.</div>
          ) : (
            <div className="p-2 space-y-1">
              {groupedData.map(({ group, items }) => {
                if (items.length === 0 && searchLower) return null;
                const expanded = expandedGroups[group.id] ?? true;
                const GroupIcon = group.icon;
                return (
                  <div key={group.id}>
                    {/* Group header */}
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.id)}
                      className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-muted/50 transition-all duration-200 group"
                    >
                      <div className={`w-6 h-6 rounded-md ${group.bgColor} border ${group.borderColor} flex items-center justify-center flex-shrink-0`}>
                        <GroupIcon className={`h-3.5 w-3.5 ${group.color}`} />
                      </div>
                      <span className="flex-1 text-sm font-medium tracking-wide text-left text-foreground">
                        {group.label}
                      </span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground tabular-nums">
                        {items.length}
                      </span>
                      {expanded
                        ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                        : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />}
                    </button>

                    {/* Sub-items */}
                    {expanded && (
                      <ul className="ml-3 pl-3 border-l-2 border-border/50 space-y-px mt-0.5 mb-1">
                        {items.map((loc) => {
                          const selected = loc.id === selectedId;
                          return (
                            <li key={loc.id} ref={selected ? selectedItemRef : undefined}>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedId(loc.id);
                                  if (!isDesktop) setSidebarOpen(false);
                                }}
                                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-all duration-200 group ${
                                  selected
                                    ? `${group.bgColor} border-l-2 ${group.borderColor} font-semibold`
                                    : 'hover:bg-muted/50 border-l-2 border-transparent hover:border-border'
                                }`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${selected ? group.color.replace('text-', 'bg-') : 'bg-muted-foreground/40'}`} />
                                <span className={`flex-1 text-xs leading-relaxed break-words text-left ${selected ? 'text-foreground font-semibold' : 'text-muted-foreground group-hover:text-foreground'}`}>
                                  {loc.name}
                                </span>
                                {selected && <ChevronRight className={`h-3 w-3 flex-shrink-0 ${group.color}`} />}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                );
              })}

              {/* Ungrouped fallback */}
              {ungrouped.length > 0 && ungrouped.map((loc) => {
                const selected = loc.id === selectedId;
                return (
                  <li key={loc.id} ref={selected ? selectedItemRef : undefined} className="list-none">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedId(loc.id);
                        if (!isDesktop) setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-left transition-all duration-200 border-l-2 ${
                        selected ? 'bg-[#70c82a]/15 border-[#70c82a] font-semibold' : 'border-transparent hover:bg-muted/60 hover:border-border'
                      }`}
                    >
                      <MapPin className={`h-3.5 w-3.5 flex-shrink-0 ${selected ? 'text-[#70c82a]' : 'text-muted-foreground'}`} />
                      <span className="flex-1 text-xs text-foreground break-words">{loc.name}</span>
                    </button>
                  </li>
                );
              })}
            </div>
          )}
          {search.trim() && totalFiltered === 0 && (
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
            className="flex items-center justify-center gap-2 w-full rounded-lg border-2 border-[#70c82a]/30 bg-[#70c82a]/5 py-2.5 px-3 text-sm font-semibold text-foreground hover:bg-[#70c82a]/15 hover:border-[#70c82a]/50 hover:shadow-md transition-all duration-200"
          >
            <MapPin className="h-4 w-4 shrink-0 text-[#70c82a]" />
            Open in Google Earth
          </a>
        </div>
      </aside>

      {/* Map area — full width on mobile; hamburger opens sidebar */}
      <div className="flex-1 min-w-0 h-full flex flex-col min-h-[50vh] md:min-h-0 relative pt-12 md:pt-0">
        <div className="absolute top-0 left-0 right-0 z-30 flex md:hidden items-center justify-between gap-2 px-1 pb-2">
          <button
            type="button"
            onClick={() => setSidebarOpen((o) => !o)}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background/95 px-3 py-2 text-sm font-semibold text-foreground shadow-md backdrop-blur-sm hover:border-[#70c82a]/50 hover:bg-[#70c82a]/5"
            aria-expanded={sidebarOpen}
            aria-controls="compound-map-sidebar"
          >
            {sidebarOpen ? <X className="h-5 w-5 text-[#70c82a]" /> : <Menu className="h-5 w-5 text-[#70c82a]" />}
            Locations
          </button>
          <span className="text-xs font-medium text-muted-foreground truncate">ECWC Compound map</span>
        </div>
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
