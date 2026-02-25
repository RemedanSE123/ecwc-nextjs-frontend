import { SLUG_TO_DB_CATEGORY } from '@/types/asset';

const BLANK_FILTER_VALUE = '__BLANK__';

export function getParamValues(searchParams: URLSearchParams, key: string): string[] {
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

/** Build WHERE clause and params from filter params (category, status, description, etc.). */
export function buildAssetWhereClause(searchParams: URLSearchParams): { whereClause: string; params: (string | number)[] } {
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
      parts.push(`(status = ${statusVals.map((_, i) => `$${idx + i}`).join(' OR status = ')})`);
      statusVals.forEach((v) => params.push(v));
      idx += statusVals.length;
    }
    if (statusBlanks) parts.push(blankCondition('status'));
    if (parts.length > 0) conditions.push(`(${parts.join(' OR ')})`);
  }
  const { values: locVals, includeBlanks: locBlanks } = splitValues(project_locationArr);
  if (locVals.length > 0 || locBlanks) {
    const parts: string[] = [];
    if (locVals.length > 0) {
      parts.push(`(project_location = ${locVals.map((_, i) => `$${idx + i}`).join(' OR project_location = ')})`);
      locVals.forEach((v) => params.push(v));
      idx += locVals.length;
    }
    if (locBlanks) parts.push(blankCondition('project_location'));
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
      project_location ILIKE $${idx + 6} OR category ILIKE $${idx + 7} OR
      ownership ILIKE $${idx + 8} OR remark ILIKE $${idx + 9} OR
      EXISTS (SELECT 1 FROM heavy_vehicle_details hvd WHERE hvd.asset_id = asset_master.id AND hvd.plate_no ILIKE $${idx + 10}) OR
      EXISTS (SELECT 1 FROM light_vehicle_details lvd WHERE lvd.asset_id = asset_master.id AND lvd.plate_no ILIKE $${idx + 11}) OR
      EXISTS (SELECT 1 FROM machinery_details md WHERE md.asset_id = asset_master.id AND md.plate_no ILIKE $${idx + 12})
    )`);
    params.push(pattern, pattern, pattern, pattern, pattern, pattern, pattern, pattern, pattern, pattern, pattern, pattern, pattern);
    idx += 13;
  }

  return { whereClause: conditions.join(' AND '), params };
}
