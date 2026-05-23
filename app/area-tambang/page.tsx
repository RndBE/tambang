import { AreaOverviewGrid } from "@/components/mining/area-overview-grid"
import { AppShell } from "@/components/dashboard/app-shell"
import { getMiningAreas } from "@/lib/mining-area-catalog"

export const dynamic = "force-dynamic"

export default function AreaTambangPage() {
  return (
    <AppShell activePath="/area-tambang" title="Area Tambang">
      <AreaOverviewGrid areas={getMiningAreas()} />
    </AppShell>
  )
}
