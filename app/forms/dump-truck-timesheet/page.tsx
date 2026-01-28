"use client"

import Layout from "@/components/Layout"
import DumpTruckTimeSheet from "@/components/forms/DumpTruckTimeSheet"

export default function DumpTruckTimeSheetPage() {
  return (
    <Layout>
      <div className="space-y-0">
        <DumpTruckTimeSheet />
      </div>
    </Layout>
  )
}
