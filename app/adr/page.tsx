import Link from "next/link";
import {
  ActivityIcon,
  ChevronRightIcon,
  EyeOffIcon,
  MapPinIcon,
  RadioTowerIcon,
  SignalIcon,
  TargetIcon,
  TriangleAlertIcon,
} from "lucide-react";

import { AppShell } from "@/components/dashboard/app-shell";
import { StatusBadge, statusDotClasses } from "@/components/dashboard/status-badge";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getDashboardSummary, getPrismStations } from "@/lib/backend/queries";
import type { PrismStationSummary, RiskStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const statusOrder: Record<RiskStatus, number> = {
  Awas: 3,
  Siaga: 2,
  Waspada: 1,
  Normal: 0,
};

export default async function AdrIndexPage() {
  const [summary, stations] = await Promise.all([
    getDashboardSummary(),
    getPrismStations(),
  ]);

  const sortedStations = [...stations].sort(
    (a, b) => statusOrder[b.status] - statusOrder[a.status],
  );

  const totalPrisms = stations.reduce((sum, s) => sum + s.prismCount, 0);
  const visiblePrisms = stations.reduce((sum, s) => sum + s.visiblePrismCount, 0);
  const lostPrisms = totalPrisms - visiblePrisms;
  const criticalStations = stations.filter((s) => s.status !== "Normal").length;
  const adrCount = stations.filter((s) => s.type === "ADR").length;
  const rtsCount = stations.filter((s) => s.type === "RTS").length;

  return (
    <AppShell
      activeArea={summary.activeArea}
      activePath="/adr"
      title="ADR / RTS Monitoring"
      updatedAt={summary.updatedAt}
    >
      <div className="grid gap-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Station aktif"
            value={stations.length}
            detail={`${adrCount} ADR, ${rtsCount} RTS`}
            icon={RadioTowerIcon}
            tone="text-sky-600"
          />
          <KpiCard
            label="Total prism"
            value={totalPrisms}
            detail={`${visiblePrisms} terlihat, ${lostPrisms} hilang`}
            icon={TargetIcon}
            tone="text-violet-600"
          />
          <KpiCard
            label="Station perlu pantau"
            value={criticalStations}
            detail={
              criticalStations === 0
                ? "Semua station normal"
                : "Status di atas Normal"
            }
            icon={TriangleAlertIcon}
            tone="text-amber-600"
          />
          <KpiCard
            label="Prism hilang"
            value={lostPrisms}
            detail={
              lostPrisms === 0
                ? "Tidak ada prism hilang"
                : "Perlu pemasangan ulang reflector"
            }
            icon={EyeOffIcon}
            tone="text-red-600"
          />
        </div>

        <Card className="interactive-card">
          <CardHeader className="border-b">
            <CardTitle>Daftar Station ADR / RTS</CardTitle>
            <CardDescription>
              Setiap station mengamati banyak prism. Klik untuk melihat detail
              dan trend per prism.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 p-3 md:grid-cols-2 xl:grid-cols-3">
            {sortedStations.map((station) => (
              <StationCard key={station.id} station={station} />
            ))}
            {sortedStations.length === 0 ? (
              <div className="col-span-full rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                Belum ada station ADR/RTS terdaftar.
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function KpiCard({
  label,
  value,
  detail,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  detail: string;
  icon: typeof RadioTowerIcon;
  tone: string;
}) {
  return (
    <Card className="interactive-card">
      <CardContent className="flex items-center justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
          <p className="mt-1 truncate text-xs text-muted-foreground">{detail}</p>
        </div>
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-md border bg-muted/40",
            tone,
          )}
        >
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}

function StationCard({ station }: { station: PrismStationSummary }) {
  const visiblePct =
    station.prismCount > 0
      ? Math.round((station.visiblePrismCount / station.prismCount) * 100)
      : 0;
  const breakdown = station.statusBreakdown;

  return (
    <Link
      href={`/adr/${station.code}`}
      className="group/station relative grid gap-3 rounded-lg border bg-card p-3 transition-colors hover:border-foreground/30 hover:bg-muted/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="font-mono text-[10px]">
              {station.type}
            </Badge>
            <Badge variant="outline" className="font-mono text-[10px]">
              {station.code}
            </Badge>
          </div>
          <p className="mt-1.5 truncate text-sm font-semibold">{station.name}</p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPinIcon className="size-3" />
            {station.area}
          </p>
        </div>
        <StatusBadge status={station.status} />
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="rounded-md border bg-muted/30 p-2">
          <p className="text-muted-foreground">Prism</p>
          <p className="mt-0.5 font-semibold tabular-nums">
            {station.visiblePrismCount}/{station.prismCount}
          </p>
        </div>
        <div className="rounded-md border bg-muted/30 p-2">
          <p className="text-muted-foreground">Worst Δ</p>
          <p className="mt-0.5 font-semibold tabular-nums">
            {station.worstPrismDisplacement.toFixed(1)} mm
          </p>
        </div>
        <div className="rounded-md border bg-muted/30 p-2">
          <p className="text-muted-foreground">Velocity</p>
          <p className="mt-0.5 font-semibold tabular-nums">
            {station.worstPrismVelocity > 0 ? "+" : ""}
            {station.worstPrismVelocity.toFixed(2)}
            <span className="ml-0.5 text-[10px] text-muted-foreground">mm/h</span>
          </p>
        </div>
      </div>

      <div className="grid gap-1">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Coverage prism</span>
          <span className="tabular-nums">{visiblePct}%</span>
        </div>
        <Progress value={visiblePct} />
      </div>

      <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          {(["Normal", "Waspada", "Siaga", "Awas"] as RiskStatus[]).map(
            (status) =>
              breakdown[status] > 0 ? (
                <span
                  key={status}
                  className="flex items-center gap-1 rounded-sm border bg-card px-1.5 py-0.5"
                >
                  <span
                    className={cn("size-1.5 rounded-full", statusDotClasses[status])}
                  />
                  {breakdown[status]}
                </span>
              ) : null,
          )}
        </div>
        <span className="flex items-center gap-1">
          <ActivityIcon className="size-3" />
          {station.lastUpdate}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2 border-t pt-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <SignalIcon className="size-3.5" />
          {station.instrumentModel}
        </span>
        <span className="flex items-center gap-1 font-medium text-foreground group-hover/station:underline">
          Detail
          <ChevronRightIcon className="size-3.5" />
        </span>
      </div>
    </Link>
  );
}
