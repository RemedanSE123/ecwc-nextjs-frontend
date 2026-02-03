import type { Asset, AssetFilters, AssetsResponse, AssetStats, AssetReportData, AssetFacets, AssetCompleteness } from '@/types/asset';

const API_BASE = '';

function buildQuery(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '' && v !== null) search.set(k, String(v));
  });
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
  throw new Error(detail);
}

export async function fetchAssets(filters: AssetFilters = {}): Promise<AssetsResponse> {
  const q = buildQuery({
    category: filters.category,
    category_group: filters.category_group,
    status: filters.status,
    project_location: filters.project_location,
    search: filters.search,
    ownership: filters.ownership,
    responsible_person_name: filters.responsible_person_name,
    page: filters.page ?? 1,
    limit: filters.limit ?? 20,
  });
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
