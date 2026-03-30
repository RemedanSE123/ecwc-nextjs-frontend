const RAW_API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ?? "";

export const API_BASE_URL = RAW_API_BASE.replace(/\/+$/, "");

export function apiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (!API_BASE_URL) return normalized;
  return `${API_BASE_URL}${normalized}`;
}
