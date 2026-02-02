'use client';

import Layout from '@/components/Layout';
import CompoundMap from '@/components/compound-map/CompoundMap';

export default function CompoundMapPage() {
  return (
    <Layout>
 
      
        <div className="flex-1 min-h-[65vh] px-4 sm:px-6 lg:px-12 flex justify-center overflow-hidden">
          <div className="w-full max-w-[1600px] h-full min-h-[560px]">
            <CompoundMap />
          </div>
        </div>
     
    </Layout>
  );
}
