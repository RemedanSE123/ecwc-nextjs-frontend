/**
 * Parses KML (Google Earth export) and returns structured location data for the map.
 */

export interface LookAt {
  longitude: number;
  latitude: number;
  altitude: number;
  range: number; // meters - used to derive zoom
  heading: number;
  tilt: number;
}

export interface MapLocation {
  id: string;
  name: string;
  description: string;
  type: 'point' | 'polygon';
  /** [lng, lat] for point; array of [lng, lat] rings for polygon */
  coordinates: [number, number] | [number, number][][];
  lookAt: LookAt;
}

function stripHtml(html: string): string {
  if (!html || typeof html !== 'string') return '';
  if (typeof document !== 'undefined') {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return (tmp.textContent || tmp.innerText || '').trim().replace(/\s+/g, ' ');
  }
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function parseCoordString(coordStr: string): [number, number][] {
  return coordStr
    .trim()
    .split(/\s+/)
    .map((triple) => {
      const [lng, lat] = triple.split(',').map(Number);
      return [lng, lat] as [number, number];
    })
    .filter(([lng, lat]) => !isNaN(lng) && !isNaN(lat));
}

const KML_NS = 'http://www.opengis.net/kml/2.2';

function getFirstByTag(el: Element, tagName: string): Element | null {
  if (!el) return null;
  const byNs = el.getElementsByTagNameNS?.(KML_NS, tagName)[0];
  return byNs ?? el.getElementsByTagName(tagName)[0] ?? null;
}

function getText(el: Element | null, tagName: string): string {
  if (!el) return '';
  const child = getFirstByTag(el, tagName);
  return child?.textContent?.trim() ?? '';
}

function getNumber(el: Element | null, tagName: string): number {
  const t = getText(el, tagName);
  const n = parseFloat(t);
  return isNaN(n) ? 0 : n;
}

/**
 * Convert Google Earth "range" (meters) to Leaflet zoom level (approx).
 */
export function rangeToZoom(range: number, latitude: number): number {
  if (range <= 0) return 17;
  // Approximate: at equator, zoom 17 ≈ 200m, zoom 15 ≈ 800m, zoom 13 ≈ 3km
  const zoom = Math.round(15.5 - Math.log2(range / 200));
  return Math.max(10, Math.min(20, zoom));
}

/**
 * Parse KML XML string and return array of MapLocation.
 */
export function parseKml(kmlXml: string): MapLocation[] {
  if (typeof window === 'undefined') {
    // SSR: use a minimal DOM parser or return empty (data will load on client)
    return [];
  }
  const parser = new DOMParser();
  const doc = parser.parseFromString(kmlXml, 'text/xml');
  // KML uses default namespace; try NS first, then local name, then any namespace
  let placemarks: HTMLCollectionOf<Element>;
  if (doc.getElementsByTagNameNS) {
    placemarks = doc.getElementsByTagNameNS(KML_NS, 'Placemark');
    if (placemarks.length === 0) placemarks = doc.getElementsByTagNameNS('*', 'Placemark');
    if (placemarks.length === 0) placemarks = doc.getElementsByTagName('Placemark');
  } else {
    placemarks = doc.getElementsByTagName('Placemark');
  }
  const locations: MapLocation[] = [];

  for (let i = 0; i < placemarks.length; i++) {
    const pm = placemarks[i];
    const name = getText(pm, 'name') || `Location ${i + 1}`;
    const descEl = getFirstByTag(pm, 'description');
    const description = descEl ? stripHtml(descEl.textContent || '') : '';

    const lookAt = getFirstByTag(pm, 'LookAt');
    const look: LookAt = {
      longitude: getNumber(lookAt, 'longitude'),
      latitude: getNumber(lookAt, 'latitude'),
      altitude: getNumber(lookAt, 'altitude'),
      range: getNumber(lookAt, 'range') || 300,
      heading: getNumber(lookAt, 'heading'),
      tilt: getNumber(lookAt, 'tilt'),
    };

    const point = getFirstByTag(pm, 'Point');
    const polygon = getFirstByTag(pm, 'Polygon');

    let type: 'point' | 'polygon';
    let coordinates: [number, number] | [number, number][][];

    if (point) {
      const coordStr = getText(point, 'coordinates');
      const [lng, lat] = coordStr.split(',').map(Number);
      type = 'point';
      coordinates = [lng, lat];
    } else if (polygon) {
      const ring = getFirstByTag(polygon, 'LinearRing');
      const coordStr = ring ? getText(ring, 'coordinates') : '';
      const ringCoords = parseCoordString(coordStr);
      type = 'polygon';
      coordinates = [ringCoords];
    } else {
      continue;
    }

    const id = pm.getAttribute('id') || `placemark-${i}`;
    locations.push({
      id,
      name,
      description,
      type,
      coordinates,
      lookAt: look,
    });
  }

  return locations;
}

/** Fallback locations when KML fetch/parse fails - ECWC Compound from KML */
export const FALLBACK_LOCATIONS: MapLocation[] = [
  { id: 'head-office', name: 'ECWC Head Office', description: '', type: 'polygon', coordinates: [[[38.82334, 9.02084], [38.8235, 9.02239], [38.82218, 9.02251], [38.82208, 9.02138], [38.82216, 9.02128], [38.82214, 9.02096], [38.82334, 9.02084]]], lookAt: { longitude: 38.8226, latitude: 9.0218, altitude: 2381, range: 480, heading: 13, tilt: 0 } },
  { id: 'kality-pe', name: 'ECWC Kality P&E', description: '', type: 'polygon', coordinates: [[[38.77153, 8.93094], [38.76853, 8.92928], [38.76836, 8.92891], [38.76919, 8.92743], [38.7694, 8.92712], [38.77112, 8.92518], [38.7731, 8.92656], [38.77377, 8.9267], [38.77206, 8.92949], [38.77227, 8.92962], [38.77153, 8.93094]]], lookAt: { longitude: 38.7697, latitude: 8.9268, altitude: 2182, range: 1119, heading: 143, tilt: 0 } },
  { id: 'metal-workshop', name: 'METAL WORKSHOP', description: 'Performs cutting, welding, and shaping of metal parts.', type: 'point', coordinates: [38.77051, 8.92737], lookAt: { longitude: 38.77041, latitude: 8.92739, altitude: 2180, range: 162, heading: 148, tilt: 1.37 } },
  { id: 'modification-workshop', name: 'MODIFICATION WORKSHOP', description: 'Modifies and upgrades equipment, vehicles, and metal structures.', type: 'point', coordinates: [38.76983, 8.92697], lookAt: { longitude: 38.77003, latitude: 8.92701, altitude: 2181, range: 161, heading: 148, tilt: 1.37 } },
  { id: 'flexi-flume', name: 'FLEXI FLUME FACTORY', description: 'Produces flume pipes used for water transport and irrigation systems.', type: 'point', coordinates: [38.77108, 8.9279], lookAt: { longitude: 38.77081, latitude: 8.92767, altitude: 2177, range: 257, heading: 148, tilt: 1.37 } },
  { id: 'fabrication-workshop', name: 'FABRICATION WORKSHOP', description: 'Manufactures steel structures and metal components.', type: 'point', coordinates: [38.77006, 8.92714], lookAt: { longitude: 38.77028, latitude: 8.92738, altitude: 2180, range: 254, heading: 148, tilt: 1.37 } },
  { id: 'kality-production', name: 'ECWC Kality Production', description: '', type: 'polygon', coordinates: [[[38.76855, 8.92839], [38.7683, 8.92797], [38.76814, 8.92802], [38.76809, 8.92796], [38.76805, 8.92799], [38.76798, 8.92808], [38.76792, 8.92823], [38.76669, 8.92599], [38.7688, 8.92357], [38.77083, 8.92537], [38.76957, 8.92678], [38.76942, 8.92696], [38.76924, 8.92716], [38.76913, 8.92732], [38.76906, 8.92746], [38.76855, 8.92839]]], lookAt: { longitude: 38.7676, latitude: 8.92737, altitude: 2180, range: 712, heading: 143, tilt: 0 } },
];
