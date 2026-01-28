"use client"

import Layout from "@/components/Layout"
import LightVehicleTimeSheet from "@/components/forms/LightVehicleTimeSheet"
import RatesSection from "@/components/rates/RatesSection"

export default function LightVehicleTimeSheetPage() {
  return (
    <Layout>
      <div className="space-y-0">
        <LightVehicleTimeSheet />
        <RatesSection />
      </div>
    </Layout>
  )
}
