import type { Asset, AssetFilters, AssetsResponse, AssetStats, AssetReportData, AssetFacets, AssetCompleteness } from '@/types/asset';

const API_BASE = '';

/** Build URL for viewing an asset image (redirects to presigned S3 URL). */
export function getAssetImageUrl(key: string | null): string | null {
  if (!key) return null;
  return `${typeof window === 'undefined' ? '' : ''}/api/assets/image?key=${encodeURIComponent(key)}`;
}

const MULTI_KEYS = ['status', 'project_location', 'make', 'model', 'ownership', 'description'] as const;

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
  set('category', filters.category);
  set('category_group', filters.category_group);
  set('search', filters.search);
  set('responsible_person_name', filters.responsible_person_name);
  set('page', String(filters.page ?? 1));
  set('limit', String(filters.limit ?? 20));
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

export async function fetchAssetFacets(categoryGroup?: string): Promise<AssetFacets> {
  const params = new URLSearchParams();
  if (categoryGroup) params.set('category_group', categoryGroup);
  const q = params.toString() ? `?${params}` : '';
  const res = await fetch(`${API_BASE}/api/assets/facets${q}`);
  if (!res.ok) return handleApiError(res, 'Failed to fetch filter options');
  return res.json();
}


export async function fetchAssetCompleteness(categoryGroup?: string): Promise<AssetCompleteness> {
  const params = new URLSearchParams();
  if (categoryGroup) params.set('category_group', categoryGroup);
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

export type CreateAssetPayload = Partial<Omit<Asset, 'id' | 'created_at' | 'updated_at'>> & {
  category: string;
  description: string;
};

export async function createAsset(payload: CreateAssetPayload): Promise<Asset> {
  const res = await fetch(`${API_BASE}/api/assets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) return handleApiError(res, 'Failed to create asset');
  return res.json();
}

export type UpdateAssetPayload = Partial<Omit<Asset, 'id' | 'created_at' | 'updated_at'>>;

export async function updateAsset(id: string, payload: UpdateAssetPayload): Promise<Asset> {
  const res = await fetch(`${API_BASE}/api/assets/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) return handleApiError(res, 'Failed to update asset');
  return res.json();
}

export async function deleteAsset(id: string): Promise<{ success: boolean; id: string }> {
  const res = await fetch(`${API_BASE}/api/assets/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  if (!res.ok) return handleApiError(res, 'Failed to delete asset');
  return res.json();
}

export async function uploadAssetImage(file: File): Promise<{ key: string }> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/api/assets/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) return handleApiError(res, 'Failed to upload image');
  return res.json();
}
