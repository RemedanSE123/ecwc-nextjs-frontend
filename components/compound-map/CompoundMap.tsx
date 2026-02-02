'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, MoreVertical, MapPin, Building2, Search, ChevronRight } from 'lucide-react';
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
  const [search, setSearch] = useState('');
  const selectedItemRef = useRef<HTMLLIElement>(null);
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
  const searchLower = search.trim().toLowerCase();
  const filteredLocations = searchLower
    ? locations.filter((l) => l.name.toLowerCase().includes(searchLower))
    : locations;

  useEffect(() => {
    if (selectedId && selectedItemRef.current) {
      selectedItemRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedId]);

  const isFacility = (name: string) =>
    /Head Office|Kality P&E|Kality Production/i.test(name);
  const isWorkshop = (name: string) =>
    /WORKSHOP|FACTORY/i.test(name);

  return (
    <div className="flex h-full w-full min-h-0 gap-4">
      {/* Sidebar: interactive list with search and motion */}
      <aside className="w-72 shrink-0 flex flex-col rounded-2xl border-2 border-border dark:border-zinc-700 bg-gradient-to-b from-card to-card/80 dark:from-zinc-900/95 dark:to-zinc-800/90 shadow-xl overflow-hidden text-foreground">
        <div className="flex shrink-0 flex-col gap-2 px-3 py-3 border-b border-border dark:border-zinc-700 bg-[#70c82a]/08 dark:bg-[#70c82a]/12">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <motion.div
                className="w-8 h-8 rounded-lg bg-[#70c82a]/20 flex items-center justify-center shrink-0 border border-[#70c82a]/30"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
              >
                <MapPin className="w-4 h-4 text-[#70c82a]" />
              </motion.div>
              <div className="min-w-0">
                <h2 className="font-bold text-sm truncate text-foreground">Map contents</h2>
                <span className="text-[10px] text-muted-foreground">{locations.length} location{locations.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
            <div className="flex items-center gap-0.5 shrink-0">
              <motion.button
                onClick={loadKml}
                disabled={loading}
                className="rounded-lg p-2 text-muted-foreground hover:bg-[#70c82a]/15 hover:text-[#70c82a] disabled:opacity-50 transition-colors"
                title="Refresh"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </motion.button>
              <motion.button
                className="rounded-lg p-2 text-muted-foreground hover:bg-[#70c82a]/15 hover:text-[#70c82a] transition-colors"
                title="More options"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <MoreVertical className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
          {/* Search – filter locations by name */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search locations…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-border dark:border-zinc-600 bg-background/80 dark:bg-zinc-800/80 pl-8 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#70c82a]/50 focus:border-[#70c82a]/50 transition-all"
            />
            {search.trim() && (
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
                {filteredLocations.length}
              </span>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0 bg-background/30 dark:bg-black/20">
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-5 text-sm text-muted-foreground flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4 animate-spin shrink-0" /> Loading…
            </motion.div>
          ) : locations.length === 0 ? (
            <div className="p-5 text-sm text-muted-foreground">No locations.</div>
          ) : (
            <ul className="p-2 space-y-1">
              <AnimatePresence mode="popLayout">
                {filteredLocations.map((loc, index) => {
                  const selected = loc.id === selectedId;
                  const icon = isFacility(loc.name) ? (
                    <Building2 className="h-4 w-4 shrink-0 text-[#70c82a]" />
                  ) : (
                    <MapPin className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  );
                  return (
                    <motion.li
                      key={loc.id}
                      ref={selected ? selectedItemRef : undefined}
                      layout
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      transition={{ delay: index * 0.02, duration: 0.2 }}
                      className="relative"
                    >
                      <motion.button
                        type="button"
                        onClick={() => setSelectedId(loc.id)}
                        layout
                        whileHover={{ x: 4, scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        className={`group flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm select-none border-l-2 transition-all duration-200 ${
                          selected
                            ? 'bg-[#70c82a]/20 text-foreground font-semibold border-[#70c82a] shadow-md shadow-[#70c82a]/10 ring-1 ring-[#70c82a]/20'
                            : 'border-transparent hover:bg-[#70c82a]/10 hover:border-[#70c82a]/40 text-foreground hover:shadow-sm'
                        }`}
                      >
                        <motion.span
                          className="flex shrink-0 items-center justify-center"
                          whileHover={selected ? {} : { scale: 1.15 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                        >
                          {icon}
                        </motion.span>
                        <span className="min-w-0 flex-1 truncate">{loc.name}</span>
                        <motion.span
                          initial={false}
                          animate={{ opacity: selected ? 1 : 0, x: selected ? 0 : -4 }}
                          className="shrink-0 text-[#70c82a]"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </motion.span>
                      </motion.button>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
              {search.trim() && filteredLocations.length === 0 && (
                <motion.li
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="px-3 py-4 text-xs text-muted-foreground text-center list-none"
                >
                  No locations match &quot;{search}&quot;
                </motion.li>
              )}
            </ul>
          )}
        </div>
        <div className="shrink-0 border-t border-border dark:border-zinc-700 p-3 bg-[#70c82a]/05 dark:bg-[#70c82a]/08">
          <motion.a
            href="https://earth.google.com/earth/d/14Qm1aUGZdkw6yf5-CUlJvwqYMJ6DX3CC?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#70c82a]/40 bg-[#70c82a]/10 py-2.5 px-3 text-sm font-semibold text-[#70c82a] hover:bg-[#70c82a]/20 hover:border-[#70c82a]/60 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <MapPin className="h-4 w-4 shrink-0" />
            Open full map
          </motion.a>
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
