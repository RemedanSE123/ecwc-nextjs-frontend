-- Final cutover: drop legacy project_location after project_id migration is complete.
-- Run only after validating all checks below.

-- 1) Any unmapped assets? (must be 0 rows before dropping)
-- SELECT COUNT(*) AS missing_project_id
-- FROM asset_master
-- WHERE project_id IS NULL;

-- 2) Any orphan project references? (must be 0 rows)
-- SELECT COUNT(*) AS orphan_project_ids
-- FROM asset_master am
-- LEFT JOIN projects p ON am.project_id = p.id
-- WHERE am.project_id IS NOT NULL AND p.id IS NULL;

-- 3) Optional smoke check for project names still resolvable
-- SELECT am.id, p.project_name
-- FROM asset_master am
-- LEFT JOIN projects p ON am.project_id = p.id
-- LIMIT 20;

ALTER TABLE asset_master
  DROP COLUMN IF EXISTS project_location;
