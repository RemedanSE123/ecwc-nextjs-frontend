'use client';

import { useEffect, useRef, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Polygon,
  useMap,
  Popup,
} from 'react-leaflet';
import L from 'leaflet';
import type { MapLocation } from '@/lib/kmlParser';
import { rangeToZoom } from '@/lib/kmlParser';

import 'leaflet/dist/leaflet.css';

// Initial view: ECWC Head Office (zoomed in) so map opens on that location by default
const INITIAL_CENTER: [number, number] = [9.0218, 38.8226]; // ECWC Head Office lookAt
const INITIAL_ZOOM = 17;

// Fix default marker icon in Next.js
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

// Green pin for workshops (point locations)
const greenIcon = L.divIcon({
  className: 'compound-marker-green',
  html: `<div style="
    width:24px;height:24px;
    background:#22c55e;
    border:2px solid white;
    border-radius:50% 50% 50% 0;
    transform:rotate(-45deg);
    box-shadow:0 2px 5px rgba(0,0,0,0.3);
  "></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 24],
});

// Satellite only (Esri World Imagery)
const SATELLITE_LAYER = {
  url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  attribution: '&copy; <a href="https://www.esri.com/">Esri</a>',
};

function FlyTo({ location, locations }: { location: MapLocation | null; locations: MapLocation[] }) {
  const map = useMap();
  const prevId = useRef<string | null>(null);
  const isFirst = useRef(true);

  useEffect(() => {
    if (!location) return;
    // Always fly when location changes (including first selected) so sidebar click always moves the map
    if (prevId.current === location.id && !isFirst.current) return;
    prevId.current = location.id;
    isFirst.current = false;

    const { latitude, longitude, range } = location.lookAt;
    const latLng = L.latLng(latitude, longitude);

    // Run after paint so map instance is ready and no conflict with React updates. Zoom IN to the location (closer view).
    const t = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (location.type === 'polygon' && location.coordinates.length) {
          const rings = location.coordinates as [number, number][][];
          const pts = rings[0].map(([lng, lat]) => L.latLng(lat, lng));
          const bounds = L.latLngBounds(pts).pad(0.08);
          map.flyToBounds(bounds, {
            duration: 1.4,
            easeLinearity: 0.2,
            maxZoom: 18,
          });
        } else {
          const zoom = rangeToZoom(range, latitude);
          const zoomIn = Math.min(20, zoom + 2);
          map.flyTo(latLng, zoomIn, {
            duration: 1.4,
            easeLinearity: 0.2,
          });
        }
      });
    });
    return () => cancelAnimationFrame(t);
  }, [location, locations, map]);

  return null;
}

const polygonStyle = {
  color: '#60a5fa',
  weight: 2,
  opacity: 0.95,
  fillColor: '#3b82f6',
  fillOpacity: 0.25,
};

const polygonStyleGreen = {
  color: '#34d399',
  weight: 2,
  opacity: 0.95,
  fillColor: '#22c55e',
  fillOpacity: 0.25,
};

export default function CompoundMapView({
  locations,
  selectedId,
  onSelectLocation,
}: {
  locations: MapLocation[];
  selectedId: string | null;
  onSelectLocation: (loc: MapLocation) => void;
}) {
  const selectedLocation = locations.find((l) => l.id === selectedId) ?? null;
  const [mapReady, setMapReady] = useState(false);
  const mapKey = useRef(
    typeof window !== 'undefined' ? `compound-map-${Date.now()}-${Math.random().toString(36).slice(2)}` : 'ssr'
  ).current;

  // Render MapContainer only after mount to avoid "Map container is being reused" (Leaflet + React lifecycle)
  useEffect(() => {
    setMapReady(true);
  }, []);

  if (!mapReady) {
    return (
      <div className="h-full w-full min-h-[480px] flex items-center justify-center bg-muted/30 rounded-2xl">
        <div className="animate-pulse text-muted-foreground">Loading map…</div>
      </div>
    );
  }

  return (
    <div className="h-full w-full" data-compound-map-wrapper>
      <MapContainer
        key={mapKey}
        center={INITIAL_CENTER}
        zoom={INITIAL_ZOOM}
        className="h-full w-full z-0 [&_.leaflet-container]:min-h-[480px] [&_.leaflet-container]:rounded-2xl compound-map-satellite"
        scrollWheelZoom
        style={{ minHeight: 480, height: '100%' }}
        zoomControl={true}
      >
      <TileLayer attribution={SATELLITE_LAYER.attribution} url={SATELLITE_LAYER.url} />
      <FlyTo location={selectedLocation} locations={locations} />
      {/* Only show pin and border for the location selected in the sidebar */}
      {selectedLocation && (() => {
        const loc = selectedLocation;
        if (loc.type === 'point') {
          const [lng, lat] = loc.coordinates as [number, number];
          const position: [number, number] = [lat, lng];
          const isWorkshop = /WORKSHOP|FACTORY/i.test(loc.name);
          return (
            <Marker
              key={loc.id}
              position={position}
              icon={isWorkshop ? greenIcon : defaultIcon}
              eventHandlers={{
                click: () => onSelectLocation(loc),
              }}
            >
              <Popup>
                <strong>{loc.name}</strong>
                {loc.description && <p className="mt-1 text-sm text-gray-600">{loc.description}</p>}
              </Popup>
            </Marker>
          );
        }
        const rings = loc.coordinates as [number, number][][];
        const latLngs = rings[0].map(([lng, lat]) => [lat, lng] as [number, number]);
        const isOffice = /Office|Head Office/i.test(loc.name);
        return (
          <Polygon
            key={loc.id}
            positions={latLngs}
            pathOptions={isOffice ? polygonStyleGreen : polygonStyle}
            eventHandlers={{
              click: () => onSelectLocation(loc),
            }}
          >
            <Popup>
              <strong>{loc.name}</strong>
              {loc.description && <p className="mt-1 text-sm text-gray-600">{loc.description}</p>}
            </Popup>
          </Polygon>
        );
      })()}
      </MapContainer>
    </div>
  );
}
