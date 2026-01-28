"use client"

import Layout from "@/components/Layout"
import WagonDrillTimeSheet from "@/components/forms/WagonDrillTimeSheet"
import RatesSection from "@/components/rates/RatesSection"

export default function WagonDrillTimeSheetPage() {
  return (
    <Layout>
      <div className="space-y-0">
        <WagonDrillTimeSheet />
        <RatesSection />
      </div>
    </Layout>
  )
}
