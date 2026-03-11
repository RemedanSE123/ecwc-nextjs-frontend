import type { Asset, AssetFilters, AssetsResponse, AssetStats, AssetReportData, AssetFacets, AssetCompleteness } from '@/types/asset';
import { getAuthHeaders } from '@/lib/auth';

const API_BASE = '';

/** Build URL for viewing an asset image (redirects to presigned S3 URL). */
export function getAssetImageUrl(key: string | null): string | null {
  if (!key) return null;
  return `${typeof window === 'undefined' ? '' : ''}/api/assets/image?key=${encodeURIComponent(key)}`;
}

const MULTI_KEYS = ['status', 'project_location', 'make', 'model', 'ownership', 'description'] as const;

/** Special value sent to API to filter for blank/empty cells (Excel-like). */
export const BLANK_FILTER_VALUE = '__BLANK__';

function buildAssetsQuery(filters: AssetFilters): string {
  const search = new URLSearchParams();
  const set = (k: string, v: string | number | undefined) => {
    if (v !== undefined && v !== '' && v !== null) search.set(k, String(v));
  };
  const appendAll = (k: string, val: string | string[] | undefined) => {
    if (val == null) return;
    const arr = Array.isArray(val) ? val : [val];
    arr.filter((v) => v !== '').forEach((v) => search.append(k, v));
  };
  set('category_group', filters.category_group);
  set('search', filters.search);
  set('responsible_person_name', filters.responsible_person_name);
  set('page', String(filters.page ?? 1));
  set('limit', String(filters.limit ?? 20));
  if (filters.include_details) search.set('include_details', 'true');
  appendAll('category', filters.category);
  MULTI_KEYS.forEach((k) => appendAll(k, filters[k]));
  return search.toString();
}

async function handleApiError(res: Response, fallback: string): Promise<never> {
  let detail = fallback;
  try {
    const body = await res.json();
    if (body.detail) detail = `${fallback}: ${body.detail}`;
    else if (body.error) detail = `${fallback}: ${body.error}`;
  } catch {
    detail = `${fallback} (${res.status} ${res.statusText})`;
  }
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
    console.error('[API Error]', fallback, res.status, detail);
  }
  throw new Error(detail);
}

export async function fetchAssets(filters: AssetFilters = {}): Promise<AssetsResponse> {
  const q = buildAssetsQuery(filters);
  const res = await fetch(`${API_BASE}/api/assets${q ? `?${q}` : ''}`);
  if (!res.ok) return handleApiError(res, 'Failed to fetch assets');
  return res.json();
}

export async function fetchAssetStats(category?: string, categoryGroup?: string): Promise<AssetStats> {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (categoryGroup) params.set('category_group', categoryGroup);
  const q = params.toString() ? `?${params}` : '';
  const res = await fetch(`${API_BASE}/api/assets/stats${q}`);
  if (!res.ok) throw new Error('Failed to fetch asset stats');
  return res.json();
}

export async function fetchAssetReports(category?: string, categoryGroup?: string): Promise<AssetReportData> {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (categoryGroup) params.set('category_group', categoryGroup);
  const q = params.toString() ? `?${params}` : '';
  const res = await fetch(`${API_BASE}/api/assets/reports${q}`);
  if (!res.ok) return handleApiError(res, 'Failed to fetch asset reports');
  return res.json();
}

export interface StatusSummaryRow {
  no: number;
  description: string;
  category: string;
  op: number;
  idle: number;
  ur: number;
  down: number;
  hr: number;
  ui: number;
  wi: number;
  uc: number;
  rfd: number;
  afd: number;
  accident: number;
  other: number;
  total: number;
}

export interface StatusSummaryResponse {
  rows: StatusSummaryRow[];
  grandTotal: Record<string, number>;
}

export async function fetchStatusSummary(categoryGroup?: string): Promise<StatusSummaryResponse> {
  const params = categoryGroup ? `?category_group=${encodeURIComponent(categoryGroup)}` : '';
  const res = await fetch(`${API_BASE}/api/assets/reports/status-summary${params}`);
  if (!res.ok) return handleApiError(res, 'Failed to fetch status summary');
  return res.json();
}

/** Build query string for facets (same filter params as list, no page/limit) so facets are cascaded. */
function buildFacetsQuery(filters: AssetFilters): string {
  const search = new URLSearchParams();
  const set = (k: string, v: string | number | undefined) => {
    if (v !== undefined && v !== '' && v !== null) search.set(k, String(v));
  };
  const appendAll = (k: string, val: string | string[] | undefined) => {
    if (val == null) return;
    const arr = Array.isArray(val) ? val : [val];
    arr.filter((v) => v !== '').forEach((v) => search.append(k, v));
  };
  set('category_group', filters.category_group);
  set('search', filters.search);
  set('responsible_person_name', filters.responsible_person_name);
  appendAll('category', filters.category);
  MULTI_KEYS.forEach((k) => appendAll(k, filters[k]));
  return search.toString();
}

export async function fetchAssetFacets(filtersOrGroup?: AssetFilters | string): Promise<AssetFacets> {
  const filters: AssetFilters =
    typeof filtersOrGroup === 'string'
      ? { category_group: filtersOrGroup }
      : filtersOrGroup ?? {};
  const q = buildFacetsQuery(filters);
  const res = await fetch(`${API_BASE}/api/assets/facets${q ? `?${q}` : ''}`);
  if (!res.ok) return handleApiError(res, 'Failed to fetch filter options');
  return res.json();
}

export interface EquipmentOption {
  id: string;
  category: string | null;
  description: string | null;
  asset_no?: string | null;
  plate_no: string | null;
  status: string | null;
  rate_op?: number | null;
  rate_idle?: number | null;
  rate_down?: number | null;
}

export async function fetchEquipmentOptions(projectLocation: string): Promise<EquipmentOption[]> {
  const params = new URLSearchParams();
  params.set('project_location', projectLocation);
  const res = await fetch(`${API_BASE}/api/assets/equipment-options?${params.toString()}`);
  if (!res.ok) return handleApiError(res, 'Failed to fetch equipment options');
  return res.json();
}

export async function fetchAssetCompleteness(filtersOrGroup?: AssetFilters | string): Promise<AssetCompleteness> {
  const params = new URLSearchParams();
  if (typeof filtersOrGroup === 'string') {
    params.set('category_group', filtersOrGroup);
  } else if (filtersOrGroup) {
    const f = filtersOrGroup;
    if (f.category_group) params.set('category_group', f.category_group);
    if (f.search) params.set('search', f.search);
    if (f.responsible_person_name) params.set('responsible_person_name', f.responsible_person_name);
    const appendAll = (k: string, val: string | string[] | undefined) => {
      if (val == null) return;
      const arr = Array.isArray(val) ? val : [val];
      arr.filter((v) => v !== '').forEach((v) => params.append(k, v));
    };
    appendAll('category', f.category);
    MULTI_KEYS.forEach((key) => appendAll(key, f[key]));
  }
  const q = params.toString() ? `?${params}` : '';
  const res = await fetch(`${API_BASE}/api/assets/completeness${q}`);
  if (!res.ok) return handleApiError(res, 'Failed to fetch completeness');
  return res.json();
}

export async function fetchAsset(id: string): Promise<Asset> {
  const res = await fetch(`${API_BASE}/api/assets/${encodeURIComponent(id)}`);
  if (!res.ok) return handleApiError(res, 'Failed to fetch asset');
  return res.json();
}

export interface AssetStatusHistoryEntry {
  id: string;
  asset_id: string;
  status_from: string | null;
  status_to: string;
  changed_by_phone: string;
  changed_by_name: string;
  created_at: string;
}

export async function fetchAssetStatusHistory(assetId: string): Promise<AssetStatusHistoryEntry[]> {
  const res = await fetch(`${API_BASE}/api/assets/${encodeURIComponent(assetId)}/status-history`);
  if (!res.ok) return handleApiError(res, 'Failed to fetch status history');
  return res.json();
}

export interface HeavyVehicleDetails {
  asset_id: string;
  plate_no: string | null;
  chassis_serial_no: string | null;
  engine_make: string | null;
  engine_model: string | null;
  engine_serial_no: string | null;
  capacity: string | null;
  manuf_year: number | null;
  libre: boolean | null;
  tire_size: string | null;
  battery_capacity: string | null;
  insurance_coverage: string | null;
  bolo_renewal_date: string | null;
  rate_op: number | null;
  rate_idle: number | null;
  rate_down: number | null;
  created_at: string;
  updated_at: string;
}

export type VehicleDetailsResult<T> = { data: T | null; error: string | null };

export async function fetchHeavyVehicleDetails(assetId: string): Promise<VehicleDetailsResult<HeavyVehicleDetails>> {
  try {
    const res = await fetch(`${API_BASE}/api/assets/${encodeURIComponent(assetId)}/heavy-vehicle-details`);
    const body = await res.json().catch(() => null);
    if (!res.ok) {
      const msg = (body && (body.detail || body.error)) || res.statusText || 'Failed to fetch heavy vehicle details';
      return { data: null, error: msg };
    }
    return { data: body ?? null, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Failed to fetch heavy vehicle details' };
  }
}

export interface LightVehicleDetails {
  asset_id: string;
  plate_no: string | null;
  engine_serial_no: string | null;
  capacity: string | null;
  manuf_year: number | null;
  libre: boolean | null;
  tire_size: string | null;
  battery_capacity: string | null;
  insurance_coverage: string | null;
  bolo_renewal_date: string | null;
  rate_op: number | null;
  rate_idle: number | null;
  rate_down: number | null;
  created_at: string;
  updated_at: string;
}

export async function fetchLightVehicleDetails(assetId: string): Promise<VehicleDetailsResult<LightVehicleDetails>> {
  try {
    const res = await fetch(`${API_BASE}/api/assets/${encodeURIComponent(assetId)}/light-vehicle-details`);
    const body = await res.json().catch(() => null);
    if (!res.ok) {
      const msg = (body && (body.detail || body.error)) || res.statusText || 'Failed to fetch light vehicle details';
      return { data: null, error: msg };
    }
    return { data: body ?? null, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Failed to fetch light vehicle details' };
  }
}

export interface MachineryDetails {
  asset_id: string;
  plate_no: string | null;
  engine_make: string | null;
  engine_model: string | null;
  engine_serial_no: string | null;
  capacity: string | null;
  manuf_year: number | null;
  libre: boolean | null;
  tire_size: string | null;
  battery_capacity: string | null;
  rate_op: number | null;
  rate_idle: number | null;
  rate_down: number | null;
  created_at: string;
  updated_at: string;
}

export async function fetchMachineryDetails(assetId: string): Promise<VehicleDetailsResult<MachineryDetails>> {
  try {
    const res = await fetch(`${API_BASE}/api/assets/${encodeURIComponent(assetId)}/machinery-details`);
    const body = await res.json().catch(() => null);
    if (!res.ok) {
      const msg = (body && (body.detail || body.error)) || res.statusText || 'Failed to fetch machinery details';
      return { data: null, error: msg };
    }
    return { data: body ?? null, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Failed to fetch machinery details' };
  }
}

export async function updateHeavyVehicleRates(assetId: string, payload: { rate_op: number | null; rate_idle: number | null; rate_down: number | null }): Promise<void> {
  const res = await fetch(`${API_BASE}/api/assets/${encodeURIComponent(assetId)}/heavy-vehicle-details`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) await handleApiError(res, 'Failed to update heavy vehicle rates');
}

export async function updateLightVehicleRates(assetId: string, payload: { rate_op: number | null; rate_idle: number | null; rate_down: number | null }): Promise<void> {
  const res = await fetch(`${API_BASE}/api/assets/${encodeURIComponent(assetId)}/light-vehicle-details`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) await handleApiError(res, 'Failed to update light vehicle rates');
}

export async function updateMachineryRates(assetId: string, payload: { rate_op: number | null; rate_idle: number | null; rate_down: number | null }): Promise<void> {
  const res = await fetch(`${API_BASE}/api/assets/${encodeURIComponent(assetId)}/machinery-details`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) await handleApiError(res, 'Failed to update machinery rates');
}

export async function updateHeavyVehicleSpecs(
  assetId: string,
  payload: Omit<HeavyVehicleDetails, 'asset_id' | 'created_at' | 'updated_at'>
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/assets/${encodeURIComponent(assetId)}/heavy-vehicle-details`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) await handleApiError(res, 'Failed to update heavy vehicle specs');
}

export async function updateLightVehicleSpecs(
  assetId: string,
  payload: Omit<LightVehicleDetails, 'asset_id' | 'created_at' | 'updated_at'>
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/assets/${encodeURIComponent(assetId)}/light-vehicle-details`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) await handleApiError(res, 'Failed to update light vehicle specs');
}

export async function updateMachinerySpecs(
  assetId: string,
  payload: Omit<MachineryDetails, 'asset_id' | 'created_at' | 'updated_at'>
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/assets/${encodeURIComponent(assetId)}/machinery-details`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) await handleApiError(res, 'Failed to update machinery specs');
}

export interface PlantDetails {
  asset_id: string;
  rate_op: number | null;
  rate_idle: number | null;
  rate_down: number | null;
  created_at: string;
  updated_at: string;
}

export async function fetchPlantDetails(assetId: string): Promise<VehicleDetailsResult<PlantDetails>> {
  try {
    const res = await fetch(`${API_BASE}/api/assets/${encodeURIComponent(assetId)}/plant-details`);
    const body = await res.json().catch(() => null);
    if (!res.ok) {
      const msg = (body && (body.detail || body.error)) || res.statusText || 'Failed to fetch plant details';
      return { data: null, error: msg };
    }
    return { data: body ?? null, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Failed to fetch plant details' };
  }
}

export async function updatePlantRates(assetId: string, payload: { rate_op: number | null; rate_idle: number | null; rate_down: number | null }): Promise<void> {
  const res = await fetch(`${API_BASE}/api/assets/${encodeURIComponent(assetId)}/plant-details`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) await handleApiError(res, 'Failed to update plant rates');
}

export interface AuxGeneratorDetails {
  asset_id: string;
  rate_op: number | null;
  rate_idle: number | null;
  rate_down: number | null;
  created_at: string;
  updated_at: string;
}

export async function fetchAuxGeneratorDetails(assetId: string): Promise<VehicleDetailsResult<AuxGeneratorDetails>> {
  try {
    const res = await fetch(`${API_BASE}/api/assets/${encodeURIComponent(assetId)}/aux-generator-details`);
    const body = await res.json().catch(() => null);
    if (!res.ok) {
      const msg = (body && (body.detail || body.error)) || res.statusText || 'Failed to fetch auxiliary generator details';
      return { data: null, error: msg };
    }
    return { data: body ?? null, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Failed to fetch auxiliary generator details' };
  }
}

export async function updateAuxGeneratorRates(assetId: string, payload: { rate_op: number | null; rate_idle: number | null; rate_down: number | null }): Promise<void> {
  const res = await fetch(`${API_BASE}/api/assets/${encodeURIComponent(assetId)}/aux-generator-details`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) await handleApiError(res, 'Failed to update generator rates');
}

export interface StatusTrendPoint {
  date: string;
  op: number;
  idle: number;
  down: number;
}

export async function ensureStatusSnapshot(): Promise<{ ok: boolean }> {
  const res = await fetch(`${API_BASE}/api/assets/reports/status-snapshot`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (!res.ok) return handleApiError(res, 'Failed to ensure status snapshot');
  return res.json();
}

export async function fetchStatusTrend(period: 'day' | 'week' | 'month' = 'day', category: string = 'all'): Promise<StatusTrendPoint[]> {
  const params = new URLSearchParams();
  params.set('period', period);
  params.set('category', category);
  const res = await fetch(`${API_BASE}/api/assets/reports/status-trend?${params}`);
  if (!res.ok) return handleApiError(res, 'Failed to fetch status trend');
  return res.json();
}

export type CreateAssetPayload = Partial<Omit<Asset, 'id' | 'created_at' | 'updated_at'>> & {
  category: string;
  description: string;
};

export async function createAsset(payload: CreateAssetPayload): Promise<Asset> {
  const res = await fetch(`${API_BASE}/api/assets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) return handleApiError(res, 'Failed to create asset');
  return res.json();
}

export type UpdateAssetPayload = Partial<Omit<Asset, 'id' | 'created_at' | 'updated_at'>>;

export async function updateAsset(id: string, payload: UpdateAssetPayload): Promise<Asset> {
  const res = await fetch(`${API_BASE}/api/assets/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) return handleApiError(res, 'Failed to update asset');
  return res.json();
}

export async function deleteAsset(id: string): Promise<{ success: boolean; id: string }> {
  const res = await fetch(`${API_BASE}/api/assets/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) return handleApiError(res, 'Failed to delete asset');
  return res.json();
}

export async function uploadAssetImage(file: File, assetId?: string): Promise<{ key: string }> {
  const formData = new FormData();
  formData.append('file', file);
  if (assetId) formData.append('asset_id', assetId);
  const res = await fetch(`${API_BASE}/api/assets/upload`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });
  if (!res.ok) return handleApiError(res, 'Failed to upload image');
  return res.json();
}
