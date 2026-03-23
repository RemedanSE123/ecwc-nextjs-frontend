import * as XLSX from 'xlsx';

const HVD_KEYS = ['plate_no', 'chassis_serial_no', 'engine_make', 'engine_model', 'engine_serial_no', 'capacity', 'manuf_year', 'libre', 'tire_size', 'battery_capacity', 'insurance_coverage', 'bolo_renewal_date'] as const;
const LVD_KEYS = ['plate_no', 'engine_serial_no', 'capacity', 'manuf_year', 'libre', 'tire_size', 'battery_capacity', 'insurance_coverage', 'bolo_renewal_date'] as const;
const MD_KEYS = ['plate_no', 'engine_make', 'engine_model', 'engine_serial_no', 'capacity', 'manuf_year', 'libre', 'tire_size', 'battery_capacity'] as const;

function hasDetail(asset: Record<string, unknown>, prefix: string, keys: readonly string[]): boolean {
  return keys.some((k) => {
    const v = asset[`${prefix}${k}`];
    return v != null && String(v).trim() !== '';
  });
}

function pickKeys(obj: Record<string, unknown>, keys: readonly string[], prefix: string): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const k of keys) {
    out[k] = obj[`${prefix}${k}`];
  }
  return out;
}

/** Export assets array to Excel file with separate sheets for main assets and detail tables */
export function exportAssetsToExcel(assets: Record<string, unknown>[], filename?: string) {
  const wb = XLSX.utils.book_new();

  // 1. Assets sheet (base columns only, no detail prefixes)
  const baseKeys = Object.keys(assets[0] ?? {}).filter(
    (k) => !k.startsWith('hvd_') && !k.startsWith('lvd_') && !k.startsWith('md_')
  );
  const assetsSheet = assets.map((a) => {
    const row: Record<string, unknown> = {};
    for (const k of baseKeys) row[k] = a[k];
    return row;
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(assetsSheet), 'Assets');

  // 2. Heavy Vehicle Details sheet (linked by asset_id)
  const hvdRows = assets
    .filter((a) => hasDetail(a, 'hvd_', HVD_KEYS))
    .map((a) => ({
      asset_id: a.id,
      category: a.category,
      description: a.description,
      ...pickKeys(a, HVD_KEYS, 'hvd_'),
    }));
  if (hvdRows.length > 0) {
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(hvdRows), 'Heavy Vehicle Details');
  }

  // 3. Light Vehicle Details sheet (linked by asset_id)
  const lvdRows = assets
    .filter((a) => hasDetail(a, 'lvd_', LVD_KEYS))
    .map((a) => ({
      asset_id: a.id,
      category: a.category,
      description: a.description,
      ...pickKeys(a, LVD_KEYS, 'lvd_'),
    }));
  if (lvdRows.length > 0) {
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(lvdRows), 'Light Vehicle Details');
  }

  // 4. Machinery Details sheet (linked by asset_id)
  const mdRows = assets
    .filter((a) => hasDetail(a, 'md_', MD_KEYS))
    .map((a) => ({
      asset_id: a.id,
      category: a.category,
      description: a.description,
      ...pickKeys(a, MD_KEYS, 'md_'),
    }));
  if (mdRows.length > 0) {
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(mdRows), 'Machinery Details');
  }

  XLSX.writeFile(wb, filename || `assets-${new Date().toISOString().slice(0, 10)}.xlsx`);
}

/** Export assets array to CSV file */
export function exportAssetsToCsv(assets: Record<string, unknown>[], filename?: string) {
  const ws = XLSX.utils.json_to_sheet(assets);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `assets-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToExcel(data: Record<string, unknown>[], filename = 'dashboard-report.xlsx') {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Report');
  XLSX.writeFile(wb, filename);
}

export function exportStatsToExcel(
  byCategory: { category: string; count: number }[],
  byStatus: { status: string; count: number }[],
  byLocation: { project_name: string; count: number }[],
  total: number
) {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([{ total }]), 'Summary');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(byCategory), 'By Category');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(byStatus), 'By Status');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(byLocation.map((l) => ({ location: l.project_name, count: l.count }))), 'By Location');
  XLSX.writeFile(wb, `ecwc-dashboard-${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export async function exportToPdf(elementId: string, filename = 'dashboard-report.pdf') {
  if (typeof window === 'undefined') return;
  const element = document.getElementById(elementId);
  if (!element) return;
  const html2pdf = (await import('html2pdf.js')).default;
  const opt = {
    margin: 10,
    filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' as const },
  };
  await html2pdf().set(opt).from(element).save();
}
