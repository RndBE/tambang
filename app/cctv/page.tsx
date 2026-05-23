import { AppShell } from "@/components/dashboard/app-shell";
import { CctvMonitoring } from "@/components/dashboard/cctv-monitoring";
import { cameraFeeds } from "@/lib/cctv-feeds";
import { getDashboardSummary } from "@/lib/backend/queries";

export const dynamic = "force-dynamic";

export default async function CctvPage() {
  const summary = await getDashboardSummary();

  return (
    <AppShell
      activeArea={summary.activeArea}
      activePath="/cctv"
      title="CCTV Monitoring"
      updatedAt={summary.updatedAt}
    >
      <CctvMonitoring cameras={cameraFeeds} />
    </AppShell>
  );
}
