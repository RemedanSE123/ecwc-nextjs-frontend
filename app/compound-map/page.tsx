'use client';

import Layout from '@/components/Layout';
import CompoundMap from '@/components/compound-map/CompoundMap';
import { MapPin } from 'lucide-react';

export default function CompoundMapPage() {
  return (
    <Layout>
      <div className="space-y-4">
       

        <div className="h-[560px] w-full overflow-hidden flex">
          <CompoundMap />
        </div>
      </div>
    </Layout>
  );
}
