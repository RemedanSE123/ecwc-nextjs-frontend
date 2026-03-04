'use client';

import SectionPage from '@/components/SectionPage';
import type { FormItem } from '@/components/SectionPage';
import { ClipboardList } from 'lucide-react';

const FORM_ITEMS: FormItem[] = [
  { name: 'Daily Machines, Trucks and Vehicles Time Utilization Register', href: '/equipment-utilization/standalone' },
  { name: 'Daily Dump Trucks Trip Register' },
  { name: 'Daily Full Rented Service Vehicles Register' },
  { name: 'Morning and Evening Service Vehicles Register' },
  { name: 'Daily Machinery Status Register' },
  { name: 'Down Machinery Daily Status Register', href: '/daily-down/standalone' },
  { name: 'Machinery and Service Vehicles Rent Agreement' },
  { name: 'Equipment Transfer Register', href: '/equipment-transfer/standalone' },
  { name: 'Equipment Arrival Register' },
  { name: 'Machines Tyre Replacement Register' },
  { name: 'Equipment Accident Report' },
  { name: 'Canibalization Form' },
  { name: 'Equipment Disposal Proposal Form' },
  { name: 'Equipment Disposal Voucher' },
  { name: 'Rented Dump Trucks Issued Fuel Registration' },
  { name: "Lessors' Advance Payment" },
  { name: 'Reason for deviation of equip from Km/Hr standards' },
  { name: 'Rental Machineries Maintenance Labor Cost Entry' },
];

export default function MachineryOperationsPage() {
  return (
    <SectionPage
      title="Machinery Operations Management"
      formItems={FORM_ITEMS}
      icon={<ClipboardList className="h-6 w-6" />}
    />
  );
}
