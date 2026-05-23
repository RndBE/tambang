import { MineSatelliteMap } from "@/components/asaba/mine-satellite-map"
import { AppShell } from "@/components/dashboard/app-shell"

export const dynamic = "force-dynamic"

export default function PetaJaringanTambangPage() {
  return (
    <AppShell
      activePath="/peta-jaringan-tambang"
      contentPadding={false}
      title="Peta Tambang"
    >
      <MineSatelliteMap />
    </AppShell>
  )
}
