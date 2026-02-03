import * as XLSX from 'xlsx';

/** Export assets array to Excel file */
export function exportAssetsToExcel(assets: Record<string, unknown>[], filename?: string) {
  const ws = XLSX.utils.json_to_sheet(assets);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Assets');
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
  byLocation: { project_location: string; count: number }[],
  total: number
) {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([{ total }]), 'Summary');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(byCategory), 'By Category');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(byStatus), 'By Status');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(byLocation.map((l) => ({ location: l.project_location, count: l.count }))), 'By Location');
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
