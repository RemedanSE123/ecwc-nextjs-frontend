'use client';

import SectionPage from '@/components/SectionPage';
import type { FormItem } from '@/components/SectionPage';
import { ClipboardList } from 'lucide-react';
import EquipmentUtilizationForm from '@/components/forms/EquipmentUtilizationForm';
import DailyDownForm from '@/components/forms/DailyDownForm';
import EquipmentTransferForm from '@/components/forms/EquipmentTransferForm';
import EquipmentUtilizationPlan from '@/components/forms/EquipmentUtilizationPlan';
import DailyDumpTrucksTripRegister from '@/components/forms/DailyDumpTrucksTripRegister';
import MachineryRentAgreementForm from '@/components/forms/MachineryRentAgreementForm';
import MachinesTyreReplacementForm from '@/components/forms/MachinesTyreReplacementForm';
import CanibalizationForm from '@/components/forms/CanibalizationForm';

const FORM_ITEMS: FormItem[] = [
  { name: 'Equipment Utilization Plan', component: <EquipmentUtilizationPlan /> },
  { name: 'Daily Machines, Trucks and Vehicles Time Utilization Register', component: <EquipmentUtilizationForm /> },
  { name: 'Daily Dump Trucks Trip Register', component: <DailyDumpTrucksTripRegister /> },
  { name: 'Daily Full Rented Service Vehicles Register' },
  { name: 'Morning and Evening Service Vehicles Register' },
  { name: 'Daily Machinery Status Register' },
  { name: 'Down Machinery Daily Status Register', component: <DailyDownForm /> },
  { name: 'Machinery and Service Vehicles Rent Agreement', component: <MachineryRentAgreementForm /> },
  { name: 'Equipment Transfer Register', component: <EquipmentTransferForm /> },
  { name: 'Equipment Arrival Register' },
  { name: 'Machines Tyre Replacement Register', component: <MachinesTyreReplacementForm /> },
  { name: 'Canibalization Form', component: <CanibalizationForm /> },
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
      title={undefined}
      formItems={FORM_ITEMS}
      icon={<ClipboardList className="h-6 w-6" />}
    />
  );
}
