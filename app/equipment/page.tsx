'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EquipmentPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/equipment/dashboard');
  }, [router]);
  return null;
}
