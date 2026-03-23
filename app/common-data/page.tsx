'use client';

import SectionPage from '@/components/SectionPage';
import type { FormItem } from '@/components/SectionPage';
import { Database } from 'lucide-react';
import ProjectManager from '@/components/common-data/ProjectManager';

const FORM_ITEMS: FormItem[] = [
  { name: 'Projects (Location + Status)', component: <ProjectManager /> },
  { name: 'Activities List' },
  { name: 'Parts List' },
  { name: 'Fuel Type Entry' },
  { name: 'Machinery List Entry' },
  { name: 'Km/Hr Standard Readings Entry' },
  { name: 'Dump Truck Trip Rate' },
];

export default function CommonDataPage() {
  return (
    <SectionPage
      title="Common Data"
      formItems={FORM_ITEMS}
      icon={<Database className="h-6 w-6" />}
    />
  );
}
