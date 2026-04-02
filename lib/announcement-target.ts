export interface AnnouncementTargetable {
  id: number;
  title: string;
  body: string;
  entity_type?: string | null;
  entity_id?: string | null;
  action?: string | null;
}

function extractLegacySearchText(input: string): string | null {
  const text = (input || "").trim();
  if (!text) return null;
  const quoted = text.match(/"([^"]+)"/);
  if (quoted?.[1]?.trim()) return quoted[1].trim();
  return text.slice(0, 120);
}

export function getAnnouncementTargetUrl(item: AnnouncementTargetable): string {
  if (item.entity_type === "asset" && item.entity_id) {
    return `/equipment/dashboard?tab=all-assets&assetId=${encodeURIComponent(item.entity_id)}`;
  }
  const fallback = extractLegacySearchText(item.body || item.title);
  if (fallback) {
    return `/equipment/dashboard?tab=all-assets&search=${encodeURIComponent(fallback)}`;
  }
  return "/announcements";
}
