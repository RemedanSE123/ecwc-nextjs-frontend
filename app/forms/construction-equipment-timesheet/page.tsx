"use client"

import Layout from "@/components/Layout"
import ConstructionEquipmentTimeSheet from "@/components/forms/ConstructionEquipmentTimeSheet"
import RatesSection from "@/components/rates/RatesSection"

export default function ConstructionEquipmentTimeSheetPage() {
  return (
    <Layout>
      <div className="space-y-0">
        <ConstructionEquipmentTimeSheet />
        <RatesSection />
      </div>
    </Layout>
  )
}
