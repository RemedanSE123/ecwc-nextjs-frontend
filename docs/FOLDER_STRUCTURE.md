# ECWC ERP - Folder Structure

## Overview

```
ecwc-erp-frontend/
├── app/
│   ├── api/                    # Next.js API routes
│   │   └── assets/
│   │       ├── route.ts        # GET /api/assets - list assets with filters
│   │       ├── stats/
│   │       │   └── route.ts    # GET /api/assets/stats - KPI stats
│   │       └── reports/
│   │           └── route.ts    # GET /api/assets/reports - report data
│   ├── dashboard/              # Main dashboard (all data, KPI graphs)
│   ├── equipment/
│   │   ├── dashboard/          # Equipment overview (6 categories)
│   │   ├── [category]/         # Dynamic route for each category
│   │   │   ├── page.tsx        # Data view
│   │   │   └── report/
│   │   │       └── page.tsx    # Report view
│   │   └── page.tsx            # Redirects to /equipment/dashboard
│   └── ...
├── components/
│   └── equipment/
│       ├── AssetFilters.tsx        # Advanced search & filters
│       ├── EquipmentSectionLayout.tsx  # Data | Report navbar
│       ├── EquipmentDataView.tsx   # Table + pagination
│       └── EquipmentReportView.tsx # KPI graphs & reports
├── lib/
│   ├── api/
│   │   └── assets.ts           # fetchAssets, fetchAssetStats, fetchAssetReports
│   └── db.ts                   # Database connection (local or Neon)
├── types/
│   └── asset.ts                # Asset, AssetFilters, AssetStats, etc.
└── ...
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/assets` | List assets with `category`, `status`, `project_name`, `search`, `ownership`, `page`, `limit` |
| GET/POST | `/api/projects` | List/create projects (`project_name`, `status`, manager, dates) |
| PATCH/DELETE | `/api/projects/[id]` | Update or delete project (delete blocked if linked assets exist) |
| GET | `/api/assets/stats?category=` | KPI stats: total, byCategory, byStatus, byLocation |
| GET | `/api/assets/reports?category=` | Report data: categoryBreakdown, statusBreakdown, locationBreakdown, recentAssets |

## Equipment Categories (6)

- Plant Equipment → `/equipment/plant-equipment`
- Auxiliary Equipment → `/equipment/auxiliary-equipment`
- Light Vehicles → `/equipment/light-vehicles`
- Heavy Vehicles → `/equipment/heavy-vehicles`
- Machinery → `/equipment/machinery`
- Factory Equipment → `/equipment/factory-equipment`

Each category page has a **Data** tab (table + advanced filters) and **Report** tab (KPI graphs).
