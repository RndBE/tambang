import { MineNetwork3DView } from "@/components/asaba/mine-network-3d-view"
import { AppShell } from "@/components/dashboard/app-shell"

export const dynamic = "force-dynamic"

export default function PetaJaringanTambang3DPage() {
  return (
    <AppShell
      activePath="/peta-jaringan-tambang"
      contentPadding={false}
      title="Peta Tambang 3D"
    >
      <div className="p-4">
        <MineNetwork3DView />
      </div>
    </AppShell>
  )
}
