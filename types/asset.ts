export interface Asset {
  id: string;
  image_s3_key: string | null;
  project_location: string | null;
  category: string;
  asset_no: string | null;
  description: string;
  serial_no: string | null;
  /** Plate number from heavy_vehicle_details (only for Heavy Vehicle category) */
  plate_no?: string | null;
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
  category?: string | string[];
  category_group?: string;  // slug e.g. plant-equipment
  status?: string | string[];
  project_location?: string | string[];
  search?: string;
  description?: string | string[];  // filter by exact description(s), multi-select
  make?: string | string[];
  model?: string | string[];
  ownership?: string | string[];
  responsible_person_name?: string;
  page?: number;
  limit?: number;
  /** Include heavy/light vehicle and machinery detail columns in response (for export) */
  include_details?: boolean;
}

export interface AssetFacets {
  category?: string[];
  description?: string[];
  status: string[];
  project_location: string[];
  make: string[];
  model: string[];
  ownership: string[];
  responsible_person_name: string[];
}

export interface AssetCompleteness {
  total: number;
  columns: Record<string, { filled: number; empty: number; pctEmpty: number; pctFilled: number }>;
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
  /** Number of distinct project_location values (excluding null, empty, Unassigned). */
  uniqueProjectSites?: number;
}

export interface AssetReportData {
  categoryBreakdown: { category: string; total: number; percentage: number }[];
  statusBreakdown: { status: string; total: number; percentage: number }[];
  locationBreakdown: {
    location: string;
    total: number;
    op: number;
    idle: number;
    down: number;
    plant: number;
    machinery: number;
    heavy_vehicle: number;
    light_vehicles: number;
    factory_equipment: number;
    auxiliary: number;
  }[];
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

/** Order: Plant, Machinery, Heavy Vehicles, Light Vehicles, Factory Equipment, Auxiliary */
export const EQUIPMENT_CATEGORIES = [
  { slug: 'plant-equipment', name: 'Plant', dbCategory: SLUG_TO_DB_CATEGORY['plant-equipment']! },
  { slug: 'machinery', name: 'Machinery', dbCategory: SLUG_TO_DB_CATEGORY['machinery']! },
  { slug: 'heavy-vehicles', name: 'Heavy Vehicles', dbCategory: SLUG_TO_DB_CATEGORY['heavy-vehicles']! },
  { slug: 'light-vehicles', name: 'Light Vehicles', dbCategory: SLUG_TO_DB_CATEGORY['light-vehicles']! },
  { slug: 'factory-equipment', name: 'Factory Equipment', dbCategory: SLUG_TO_DB_CATEGORY['factory-equipment']! },
  { slug: 'auxiliary-equipment', name: 'Auxiliary Equipment', dbCategory: SLUG_TO_DB_CATEGORY['auxiliary-equipment']! },
] as const;
