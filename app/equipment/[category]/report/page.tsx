'use client';

import { useParams } from 'next/navigation';
import Layout from '@/components/Layout';
import EquipmentSectionLayout from '@/components/equipment/EquipmentSectionLayout';
import EquipmentReportView from '@/components/equipment/EquipmentReportView';
import { EQUIPMENT_CATEGORIES } from '@/types/asset';

const slugToName: Record<string, string> = Object.fromEntries(
  EQUIPMENT_CATEGORIES.map((c) => [c.slug, c.name])
);

export default function EquipmentCategoryReportPage() {
  const params = useParams();
  const slug = (params?.category as string) || 'plant-equipment';
  const title = slugToName[slug] ?? slug;
  const basePath = `/equipment/${slug}`;

  return (
    <Layout>
      <div className="space-y-4 text-[13px]">
        <EquipmentSectionLayout title={title} basePath={basePath}>
          <EquipmentReportView categoryGroup={slug} categoryName={title} />
        </EquipmentSectionLayout>
      </div>
    </Layout>
  );
}
