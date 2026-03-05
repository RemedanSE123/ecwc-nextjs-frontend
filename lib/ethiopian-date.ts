/**
 * Ethiopian calendar (EC) ↔ Gregorian calendar (GC) conversion.
 * EC has 13 months: 12 × 30 days + Pagumē 5 or 6 days.
 */

function jdFromGregorian(y: number, m: number, d: number): number {
  const a = Math.floor((14 - m) / 12);
  const y2 = y + 4800 - a;
  const m2 = m + 12 * a - 3;
  return (
    d +
    Math.floor((153 * m2 + 2) / 5) +
    365 * y2 +
    Math.floor(y2 / 4) -
    Math.floor(y2 / 100) +
    Math.floor(y2 / 400) -
    32045
  );
}

function gregorianFromJd(jd: number): { y: number; m: number; d: number } {
  let a = jd + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  const y = 100 * b + d - 4800 + Math.floor(m / 10);
  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  return { y: y, m: month, d: day };
}

/** EC epoch: 1 Mäskäräm 1 = JD 1724220.5 (approx 29 Aug 8 CE Julian) */
const EC_EPOCH_JD = 1724220.5;

function jdFromEthiopian(ey: number, em: number, ed: number): number {
  return (
    EC_EPOCH_JD -
    1 +
    365 * (ey - 1) +
    Math.floor(ey / 4) +
    30 * (em - 1) +
    ed
  );
}

function ethiopianFromJd(jd: number): { y: number; m: number; d: number } {
  const n = Math.floor(jd - Math.floor(EC_EPOCH_JD) + 0.5);
  const ey = 1 + 4 * Math.floor(n / 1461);
  let rem = n % 1461;
  if (rem < 0) rem += 1461;
  // 4-year cycle: 365, 365, 365, 366 days
  const dayOfYear =
    rem >= 1095 ? rem - 1095 : rem >= 730 ? rem - 730 : rem >= 365 ? rem - 365 : rem;
  const em = Math.floor(dayOfYear / 30) + 1;
  const ed = (dayOfYear % 30) + 1;
  return { y: ey, m: Math.min(em, 13), d: ed };
}

export interface EthiopianDate {
  year: number;
  month: number;
  day: number;
}

/** Gregorian YYYY-MM-DD → Ethiopian { year, month, day } */
export function gcToEc(gcDate: string): EthiopianDate | null {
  const m = gcDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const y = parseInt(m[1], 10);
  const mo = parseInt(m[2], 10);
  const d = parseInt(m[3], 10);
  const jd = jdFromGregorian(y, mo, d);
  const { y: year, m: month, d: day } = ethiopianFromJd(jd + 0.5);
  return { year, month, day };
}

/** Ethiopian { year, month, day } → Gregorian YYYY-MM-DD */
export function ecToGc(ec: EthiopianDate): string {
  const jd = jdFromEthiopian(ec.year, ec.month, ec.day);
  const g = gregorianFromJd(Math.floor(jd + 0.5));
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${g.y}-${pad(g.m)}-${pad(g.d)}`;
}

/** Format Ethiopian date as DD/MM/YYYY (EC) */
export function formatEc(ec: EthiopianDate): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(ec.day)}/${pad(ec.month)}/${ec.year}`;
}

/** Parse DD/MM/YYYY or D/M/YYYY Ethiopian date string */
export function parseEc(s: string): EthiopianDate | null {
  const t = s.trim().replace(/\s/g, "");
  const m = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  const day = parseInt(m[1], 10);
  const month = parseInt(m[2], 10);
  const year = parseInt(m[3], 10);
  if (month < 1 || month > 13 || day < 1 || day > 30) return null;
  if (month === 13 && day > 6) return null;
  return { year, month, day };
}

/** GC date string (YYYY-MM-DD) to EC display string (DD/MM/YYYY) */
export function gcToEcString(gcDate: string): string {
  const ec = gcToEc(gcDate);
  return ec ? formatEc(ec) : "";
}

/** EC date string (DD/MM/YYYY) to GC date string (YYYY-MM-DD) */
export function ecStringToGc(ecStr: string): string | null {
  const ec = parseEc(ecStr);
  return ec ? ecToGc(ec) : null;
}
