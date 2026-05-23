import { notFound } from "next/navigation"

import { AppShell } from "@/components/dashboard/app-shell"
import { AreaDetailView } from "@/components/mining/area-detail-view"
import { getMiningAreaById, getMiningAreas } from "@/lib/mining-area-catalog"

export const dynamic = "force-dynamic"

type AreaDetailPageProps = {
  params: Promise<{ areaId: string }>
}

export function generateStaticParams() {
  return getMiningAreas().map((area) => ({ areaId: area.id }))
}

export default async function AreaDetailPage({ params }: AreaDetailPageProps) {
  const { areaId } = await params
  const area = getMiningAreaById(areaId)

  if (!area) notFound()

  return (
    <AppShell activePath="/area-tambang" title={area.name}>
      <AreaDetailView area={area} />
    </AppShell>
  )
}
