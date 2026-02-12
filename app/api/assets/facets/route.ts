import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { SLUG_TO_DB_CATEGORY } from '@/types/asset';

export const dynamic = 'force-dynamic';

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

function getParamValues(searchParams: URLSearchParams, key: string): string[] {
  const all = searchParams.getAll(key);
  if (all.length > 0) return all.map((v) => v.trim()).filter(Boolean);
  const single = searchParams.get(key);
  if (single?.trim()) return [single.trim()];
  return [];
}

/** Build WHERE clause and params from same filter params as GET /api/assets (cascading facets). */
function buildFacetWhere(request: NextRequest): { whereClause: string; params: (string | number)[] } {
  const { searchParams } = new URL(request.url);
  const categoryArr = getParamValues(searchParams, 'category');
  const categoryGroup = searchParams.get('category_group') || undefined;
  const statusArr = getParamValues(searchParams, 'status');
  const project_locationArr = getParamValues(searchParams, 'project_location');
  const makeArr = getParamValues(searchParams, 'make');
  const modelArr = getParamValues(searchParams, 'model');
  const ownershipArr = getParamValues(searchParams, 'ownership');
  const descriptionArr = getParamValues(searchParams, 'description');
  const responsible_person_name = searchParams.get('responsible_person_name') || undefined;
  const search = searchParams.get('search') || undefined;

  const conditions: string[] = ['1=1'];
  const params: (string | number)[] = [];
  let idx = 1;

  if (categoryGroup) {
    const dbCategory = SLUG_TO_DB_CATEGORY[categoryGroup];
    if (dbCategory) {
      conditions.push(`category = $${idx}`);
      params.push(dbCategory);
      idx++;
    }
  } else if (categoryArr.length > 0) {
    conditions.push(`(category = ${categoryArr.map((_, i) => `$${idx + i}`).join(' OR category = ')})`);
    categoryArr.forEach((v) => params.push(v));
    idx += categoryArr.length;
  }
  if (statusArr.length > 0) {
    conditions.push(`(status = ${statusArr.map((_, i) => `$${idx + i}`).join(' OR status = ')})`);
    statusArr.forEach((v) => params.push(v));
    idx += statusArr.length;
  }
  if (project_locationArr.length > 0) {
    conditions.push(`(project_location = ${project_locationArr.map((_, i) => `$${idx + i}`).join(' OR project_location = ')})`);
    project_locationArr.forEach((v) => params.push(v));
    idx += project_locationArr.length;
  }
  if (makeArr.length > 0) {
    conditions.push(`(make = ${makeArr.map((_, i) => `$${idx + i}`).join(' OR make = ')})`);
    makeArr.forEach((v) => params.push(v));
    idx += makeArr.length;
  }
  if (modelArr.length > 0) {
    conditions.push(`(model = ${modelArr.map((_, i) => `$${idx + i}`).join(' OR model = ')})`);
    modelArr.forEach((v) => params.push(v));
    idx += modelArr.length;
  }
  if (ownershipArr.length > 0) {
    conditions.push(`(ownership = ${ownershipArr.map((_, i) => `$${idx + i}`).join(' OR ownership = ')})`);
    ownershipArr.forEach((v) => params.push(v));
    idx += ownershipArr.length;
  }
  if (descriptionArr.length > 0) {
    conditions.push(`(description = ${descriptionArr.map((_, i) => `$${idx + i}`).join(' OR description = ')})`);
    descriptionArr.forEach((v) => params.push(v));
    idx += descriptionArr.length;
  }
  if (responsible_person_name) {
    conditions.push(`responsible_person_name ILIKE $${idx}`);
    params.push(responsible_person_name);
    idx++;
  }
  if (search) {
    const pattern = `%${search}%`;
    conditions.push(`(
      description ILIKE $${idx} OR asset_no ILIKE $${idx + 1} OR
      serial_no ILIKE $${idx + 2} OR make ILIKE $${idx + 3} OR
      model ILIKE $${idx + 4} OR responsible_person_name ILIKE $${idx + 5} OR
      project_location ILIKE $${idx + 6} OR category ILIKE $${idx + 7} OR
      ownership ILIKE $${idx + 8} OR remark ILIKE $${idx + 9}
    )`);
    params.push(pattern, pattern, pattern, pattern, pattern, pattern, pattern, pattern, pattern, pattern);
    idx += 10;
  }

  return { whereClause: conditions.join(' AND '), params };
}

export async function GET(request: NextRequest) {
  try {
    const { whereClause, params } = buildFacetWhere(request);

    const [categoryRes, descriptionRes, statusRes, locationRes, makeRes, modelRes, ownershipRes, responsibleRes] = await Promise.all([
      query<{ category: string }>(`SELECT DISTINCT category FROM asset_master WHERE ${whereClause} AND category IS NOT NULL AND TRIM(category::text) != '' ORDER BY category`, params),
      query<{ description: string }>(`SELECT DISTINCT description FROM asset_master WHERE ${whereClause} AND description IS NOT NULL AND TRIM(description::text) != '' ORDER BY description LIMIT 500`, params),
      query<{ status: string }>(`SELECT DISTINCT status FROM asset_master WHERE ${whereClause} AND status IS NOT NULL AND TRIM(status::text) != '' ORDER BY status`, params),
      query<{ project_location: string }>(`SELECT DISTINCT project_location FROM asset_master WHERE ${whereClause} AND project_location IS NOT NULL AND TRIM(project_location::text) != '' ORDER BY project_location`, params),
      query<{ make: string }>(`SELECT DISTINCT make FROM asset_master WHERE ${whereClause} AND make IS NOT NULL AND TRIM(make::text) != '' ORDER BY make`, params),
      query<{ model: string }>(`SELECT DISTINCT model FROM asset_master WHERE ${whereClause} AND model IS NOT NULL AND TRIM(model::text) != '' ORDER BY model`, params),
      query<{ ownership: string }>(`SELECT DISTINCT ownership FROM asset_master WHERE ${whereClause} AND ownership IS NOT NULL AND TRIM(ownership::text) != '' ORDER BY ownership`, params),
      query<{ responsible_person_name: string }>(`SELECT DISTINCT responsible_person_name FROM asset_master WHERE ${whereClause} AND responsible_person_name IS NOT NULL AND TRIM(responsible_person_name::text) != '' ORDER BY responsible_person_name`, params),
    ]);

    const toStrings = <T extends Record<string, unknown>>(rows: T[] | undefined, key: keyof T): string[] =>
      (rows ?? []).map((r) => r[key] as unknown).filter((v): v is string => v != null && String(v).trim() !== '');

    return NextResponse.json({
      category: toStrings(categoryRes, 'category'),
      description: toStrings(descriptionRes, 'description'),
      status: toStrings(statusRes, 'status'),
      project_location: toStrings(locationRes, 'project_location'),
      make: toStrings(makeRes, 'make'),
      model: toStrings(modelRes, 'model'),
      ownership: toStrings(ownershipRes, 'ownership'),
      responsible_person_name: toStrings(responsibleRes, 'responsible_person_name'),
    });
  } catch (err) {
    const msg = getErrorMessage(err);
    console.error('GET /api/assets/facets error:', msg);
    return NextResponse.json(
      { error: 'Failed to fetch facets', detail: msg },
      { status: 500 }
    );
  }
}
