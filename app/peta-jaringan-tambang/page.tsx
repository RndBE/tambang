import { MineNetworkMapOverlay } from "@/components/asaba/mine-network-map-overlay"
import { AppShell } from "@/components/dashboard/app-shell"

export const dynamic = "force-dynamic"

export default function PetaJaringanTambangPage() {
  return (
    <AppShell
      activePath="/peta-jaringan-tambang"
      contentPadding={false}
      title="Peta Tambang"
    >
      <div className="p-4">
        <MineNetworkMapOverlay />
      </div>
    </AppShell>
  )
}
