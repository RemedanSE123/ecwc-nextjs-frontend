"use client"

import Layout from "@/components/Layout"
import DailyDownForm from "@/components/forms/DailyDownForm"

export default function DailyDownPage() {
  return (
    <Layout>
      <div className="space-y-0">
        <DailyDownForm />
      </div>
    </Layout>
  )
}
