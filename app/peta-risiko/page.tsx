import { AppShell } from "@/components/dashboard/app-shell";
import { MineNetworkMap } from "@/components/asaba/mine-network-map";

export const dynamic = "force-dynamic";

export default function PetaRisikoPage() {
  return (
    <AppShell
      activePath="/peta-risiko"
      contentPadding={false}
      title="Peta Monitoring Tambang"
    >
      <MineNetworkMap />
    </AppShell>
  );
}
