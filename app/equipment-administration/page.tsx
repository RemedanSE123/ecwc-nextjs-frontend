'use client';

import SectionPage from '@/components/SectionPage';
import type { FormItem } from '@/components/SectionPage';
import { Settings } from 'lucide-react';

const FORM_ITEMS: FormItem[] = [
  { name: 'Vehicles Daily Km Reading Record' },
  { name: 'Fuel Request and Permit Form' },
  { name: 'Machines Running Hr Monthly Plan' },
];

export default function EquipmentAdministrationPage() {
  return (
    <SectionPage
      title="Equipment Administration"
      formItems={FORM_ITEMS}
      icon={<Settings className="h-6 w-6" />}
    />
  );
}
