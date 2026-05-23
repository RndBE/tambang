import { MineNetwork3DView } from "@/components/asaba/mine-network-3d-view"
import { AppShell } from "@/components/dashboard/app-shell"

export const dynamic = "force-dynamic"

export default function PetaRisikoPage() {
  return (
    <AppShell
      activePath="/peta-risiko"
      contentPadding={false}
      fullBleed
      title="Peta Monitoring Tambang"
    >
      <MineNetwork3DView />
    </AppShell>
  )
}
