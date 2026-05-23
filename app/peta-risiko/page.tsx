import { MineSatelliteMap } from "@/components/asaba/mine-satellite-map"
import { AppShell } from "@/components/dashboard/app-shell"

export const dynamic = "force-dynamic"

export default function PetaRisikoPage() {
  return (
    <AppShell
      activePath="/peta-risiko"
      contentPadding={false}
      title="Peta Monitoring Tambang"
    >
      <MineSatelliteMap />
    </AppShell>
  )
}
