"use client"

import Layout from "@/components/Layout"
import EquipmentUtilizationForm from "@/components/forms/EquipmentUtilizationForm"

export default function EquipmentUtilizationPage() {
  return (
    <Layout>
      <div className="space-y-0 min-w-0 max-w-full">
        <EquipmentUtilizationForm />
      </div>
    </Layout>
  )
}
