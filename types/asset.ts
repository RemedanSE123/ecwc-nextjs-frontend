export interface Asset {
  id: string;
  image_s3_key: string | null;
  project_location: string | null;
  category: string;
  asset_no: string | null;
  description: string;
  serial_no: string | null;
  make: string | null;
  model: string | null;
  status: string | null;
  responsible_person_name: string | null;
  responsible_person_pno: string | null;
  ownership: string | null;
  remark: string | null;
  created_at: string;
  updated_at: string;
}

export interface AssetFilters {
  category?: string;
  category_group?: string;  // slug e.g. plant-equipment
  status?: string;
  project_location?: string;
  search?: string;
  ownership?: string;
  page?: number;
  limit?: number;
}

export interface AssetsResponse {
  data: Asset[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AssetStats {
  total: number;
  byCategory: { category: string; count: number; operational?: number }[];
  byStatus: { status: string; count: number }[];
  byLocation: { project_location: string; count: number }[];
}

export interface AssetReportData {
  categoryBreakdown: { category: string; total: number; percentage: number }[];
  statusBreakdown: { status: string; total: number; percentage: number }[];
  locationBreakdown: { location: string; total: number }[];
  recentAssets: Asset[];
}

/** Maps sidebar slugs to exact DB category names (from asset_master.category) */
export const SLUG_TO_DB_CATEGORY: Record<string, string> = {
  'plant-equipment': 'Plant',
  'auxiliary-equipment': 'Auxillary',        // DB spelling (single L)
  'light-vehicles': 'Light Vehicles & Bus',
  'heavy-vehicles': 'Heavy Vehicle',         // singular in DB
  'machinery': 'Machinery',
  'factory-equipment': 'Factory Equipment',
};

export const EQUIPMENT_CATEGORIES = [
  { slug: 'plant-equipment', name: 'Plant Equipment', dbCategory: SLUG_TO_DB_CATEGORY['plant-equipment']! },
  { slug: 'auxiliary-equipment', name: 'Auxiliary Equipment', dbCategory: SLUG_TO_DB_CATEGORY['auxiliary-equipment']! },
  { slug: 'light-vehicles', name: 'Light Vehicles', dbCategory: SLUG_TO_DB_CATEGORY['light-vehicles']! },
  { slug: 'heavy-vehicles', name: 'Heavy Vehicles', dbCategory: SLUG_TO_DB_CATEGORY['heavy-vehicles']! },
  { slug: 'machinery', name: 'Machinery', dbCategory: SLUG_TO_DB_CATEGORY['machinery']! },
  { slug: 'factory-equipment', name: 'Factory Equipment', dbCategory: SLUG_TO_DB_CATEGORY['factory-equipment']! },
] as const;
