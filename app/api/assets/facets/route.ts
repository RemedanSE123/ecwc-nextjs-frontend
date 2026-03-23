import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { SLUG_TO_DB_CATEGORY } from '@/types/asset';

export const dynamic = 'force-dynamic';

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

const BLANK_FILTER_VALUE = '__BLANK__';

function getParamValues(searchParams: URLSearchParams, key: string): string[] {
  const all = searchParams.getAll(key);
  if (all.length > 0) return all.map((v) => v.trim()).filter((v) => v !== '');
  const single = searchParams.get(key);
  if (single?.trim()) return [single.trim()];
  return [];
}

function splitValues(arr: string[]): { values: string[]; includeBlanks: boolean } {
  const values = arr.filter((v) => v !== BLANK_FILTER_VALUE);
  const includeBlanks = arr.includes(BLANK_FILTER_VALUE);
  return { values, includeBlanks };
}

function blankCondition(column: string): string {
  return `(${column} IS NULL OR TRIM(COALESCE(${column}, '')::text) = '')`;
}

/** Build WHERE clause and params from same filter params as GET /api/assets (cascading facets). */
function buildFacetWhere(request: NextRequest): { whereClause: string; params: (string | number)[] } {
  const { searchParams } = new URL(request.url);
  const categoryArr = getParamValues(searchParams, 'category');
  const categoryGroup = searchParams.get('category_group') || undefined;
  const statusArr = getParamValues(searchParams, 'status');
  const project_nameArr = getParamValues(searchParams, 'project_name');
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
    const { values, includeBlanks } = splitValues(categoryArr);
    const parts: string[] = [];
    if (values.length > 0) {
      parts.push(`(category = ${values.map((_, i) => `$${idx + i}`).join(' OR category = ')})`);
      values.forEach((v) => params.push(v));
      idx += values.length;
    }
    if (includeBlanks) parts.push(blankCondition('category'));
    if (parts.length > 0) conditions.push(`(${parts.join(' OR ')})`);
  }
  const { values: statusVals, includeBlanks: statusBlanks } = splitValues(statusArr);
  if (statusVals.length > 0 || statusBlanks) {
    const parts: string[] = [];
    if (statusVals.length > 0) {
      parts.push(`(am.status = ${statusVals.map((_, i) => `$${idx + i}`).join(' OR am.status = ')})`);
      statusVals.forEach((v) => params.push(v));
      idx += statusVals.length;
    }
    if (statusBlanks) parts.push(blankCondition('am.status'));
    if (parts.length > 0) conditions.push(`(${parts.join(' OR ')})`);
  }
  const { values: locVals, includeBlanks: locBlanks } = splitValues(project_nameArr);
  if (locVals.length > 0 || locBlanks) {
    const parts: string[] = [];
    if (locVals.length > 0) {
      parts.push(`(COALESCE(p.project_name, '') = ${locVals.map((_, i) => `$${idx + i}`).join(" OR COALESCE(p.project_name, '') = ")})`);
      locVals.forEach((v) => params.push(v));
      idx += locVals.length;
    }
    if (locBlanks) parts.push(blankCondition('p.project_name'));
    if (parts.length > 0) conditions.push(`(${parts.join(' OR ')})`);
  }
  const { values: makeVals, includeBlanks: makeBlanks } = splitValues(makeArr);
  if (makeVals.length > 0 || makeBlanks) {
    const parts: string[] = [];
    if (makeVals.length > 0) {
      parts.push(`(make = ${makeVals.map((_, i) => `$${idx + i}`).join(' OR make = ')})`);
      makeVals.forEach((v) => params.push(v));
      idx += makeVals.length;
    }
    if (makeBlanks) parts.push(blankCondition('make'));
    if (parts.length > 0) conditions.push(`(${parts.join(' OR ')})`);
  }
  const { values: modelVals, includeBlanks: modelBlanks } = splitValues(modelArr);
  if (modelVals.length > 0 || modelBlanks) {
    const parts: string[] = [];
    if (modelVals.length > 0) {
      parts.push(`(model = ${modelVals.map((_, i) => `$${idx + i}`).join(' OR model = ')})`);
      modelVals.forEach((v) => params.push(v));
      idx += modelVals.length;
    }
    if (modelBlanks) parts.push(blankCondition('model'));
    if (parts.length > 0) conditions.push(`(${parts.join(' OR ')})`);
  }
  const { values: ownVals, includeBlanks: ownBlanks } = splitValues(ownershipArr);
  if (ownVals.length > 0 || ownBlanks) {
    const parts: string[] = [];
    if (ownVals.length > 0) {
      parts.push(`(ownership = ${ownVals.map((_, i) => `$${idx + i}`).join(' OR ownership = ')})`);
      ownVals.forEach((v) => params.push(v));
      idx += ownVals.length;
    }
    if (ownBlanks) parts.push(blankCondition('ownership'));
    if (parts.length > 0) conditions.push(`(${parts.join(' OR ')})`);
  }
  const { values: descVals, includeBlanks: descBlanks } = splitValues(descriptionArr);
  if (descVals.length > 0 || descBlanks) {
    const parts: string[] = [];
    if (descVals.length > 0) {
      parts.push(`(description = ${descVals.map((_, i) => `$${idx + i}`).join(' OR description = ')})`);
      descVals.forEach((v) => params.push(v));
      idx += descVals.length;
    }
    if (descBlanks) parts.push(blankCondition('description'));
    if (parts.length > 0) conditions.push(`(${parts.join(' OR ')})`);
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
      COALESCE(p.project_name, '') ILIKE $${idx + 6} OR category ILIKE $${idx + 7} OR
      ownership ILIKE $${idx + 8} OR remark ILIKE $${idx + 9} OR
      EXISTS (SELECT 1 FROM heavy_vehicle_details hvd WHERE hvd.asset_id = am.id AND hvd.plate_no ILIKE $${idx + 10}) OR
      EXISTS (SELECT 1 FROM light_vehicle_details lvd WHERE lvd.asset_id = am.id AND lvd.plate_no ILIKE $${idx + 11}) OR
      EXISTS (SELECT 1 FROM machinery_details md WHERE md.asset_id = am.id AND md.plate_no ILIKE $${idx + 12})
    )`);
    params.push(pattern, pattern, pattern, pattern, pattern, pattern, pattern, pattern, pattern, pattern, pattern, pattern, pattern);
    idx += 13;
  }

  return { whereClause: conditions.join(' AND '), params };
}

export async function GET(request: NextRequest) {
  try {
    const { whereClause, params } = buildFacetWhere(request);

    const fromClause = 'asset_master am LEFT JOIN projects p ON am.project_id = p.id';
    const [categoryRes, descriptionRes, statusRes, locationRes, makeRes, modelRes, ownershipRes, responsibleRes] = await Promise.all([
      query<{ category: string }>(`SELECT DISTINCT am.category AS category FROM ${fromClause} WHERE ${whereClause} AND am.category IS NOT NULL AND TRIM(am.category::text) != '' ORDER BY category`, params),
      query<{ description: string }>(`SELECT DISTINCT am.description AS description FROM ${fromClause} WHERE ${whereClause} AND am.description IS NOT NULL AND TRIM(am.description::text) != '' ORDER BY description LIMIT 500`, params),
      query<{ status: string }>(`SELECT DISTINCT am.status AS status FROM ${fromClause} WHERE ${whereClause} AND am.status IS NOT NULL AND TRIM(am.status::text) != '' ORDER BY status`, params),
      query<{ project_name: string }>(`SELECT DISTINCT p.project_name AS project_name FROM ${fromClause} WHERE ${whereClause} AND p.project_name IS NOT NULL AND TRIM(p.project_name::text) != '' ORDER BY project_name`, params),
      query<{ make: string }>(`SELECT DISTINCT am.make AS make FROM ${fromClause} WHERE ${whereClause} AND am.make IS NOT NULL AND TRIM(am.make::text) != '' ORDER BY make`, params),
      query<{ model: string }>(`SELECT DISTINCT am.model AS model FROM ${fromClause} WHERE ${whereClause} AND am.model IS NOT NULL AND TRIM(am.model::text) != '' ORDER BY model`, params),
      query<{ ownership: string }>(`SELECT DISTINCT am.ownership AS ownership FROM ${fromClause} WHERE ${whereClause} AND am.ownership IS NOT NULL AND TRIM(am.ownership::text) != '' ORDER BY ownership`, params),
      query<{ responsible_person_name: string }>(`SELECT DISTINCT am.responsible_person_name AS responsible_person_name FROM ${fromClause} WHERE ${whereClause} AND am.responsible_person_name IS NOT NULL AND TRIM(am.responsible_person_name::text) != '' ORDER BY responsible_person_name`, params),
    ]);

    const toStrings = <T extends Record<string, unknown>>(rows: T[] | undefined, key: keyof T): string[] =>
      (rows ?? []).map((r) => r[key] as unknown).filter((v): v is string => v != null && String(v).trim() !== '');

    return NextResponse.json({
      category: toStrings(categoryRes, 'category'),
      description: toStrings(descriptionRes, 'description'),
      status: toStrings(statusRes, 'status'),
      project_name: toStrings(locationRes, 'project_name'),
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
