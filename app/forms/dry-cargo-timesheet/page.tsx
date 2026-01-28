"use client"

import Layout from "@/components/Layout"
import DryCargoTimeSheet from "@/components/forms/DryCargoTimeSheet"
import RatesSection from "@/components/rates/RatesSection"

export default function DryCargoTimeSheetPage() {
  return (
    <Layout>
      <div className="space-y-0">
        <DryCargoTimeSheet />
        <RatesSection />
      </div>
    </Layout>
  )
}
