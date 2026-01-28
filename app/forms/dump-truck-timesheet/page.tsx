"use client"

import Layout from "@/components/Layout"
import DumpTruckTimeSheet from "@/components/forms/DumpTruckTimeSheet"
import RatesSection from "@/components/rates/RatesSection"

export default function DumpTruckTimeSheetPage() {
  return (
    <Layout>
      <div className="space-y-0">
        <DumpTruckTimeSheet />
        <RatesSection />
      </div>
    </Layout>
  )
}
