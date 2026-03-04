'use client';

import SectionPage from '@/components/SectionPage';
import type { FormItem } from '@/components/SectionPage';
import { Wrench } from 'lucide-react';

const FORM_ITEMS: FormItem[] = [
  { name: 'Annual Maintenance Plan' },
  { name: 'Maintenance Standard Intervals Execution Guide' },
  { name: 'Inside Maintenance Work Order' },
  { name: 'Outside Maintenance Order' },
  { name: 'Daily Machines Running Hour Record' },
  { name: 'Daily Machines Inspection Record' },
  { name: 'Replaced Spare Parts Returning Form' },
];

export default function MachineryMaintenancePage() {
  return (
    <SectionPage
      title="Machinery Maintenance Management"
      formItems={FORM_ITEMS}
      icon={<Wrench className="h-6 w-6" />}
    />
  );
}
