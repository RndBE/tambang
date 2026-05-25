import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeftIcon,
  BatteryChargingIcon,
  EyeIcon,
  EyeOffIcon,
  GaugeIcon,
  MapPinIcon,
  RadioTowerIcon,
  SignalIcon,
  TargetIcon,
  TriangleAlertIcon,
} from "lucide-react";

import { AppShell } from "@/components/dashboard/app-shell";
import { InsightPanel } from "@/components/dashboard/insight-panel";
import { PrismFilterBar } from "@/components/dashboard/prism-filter-bar";
import { PrismTrendChart } from "@/components/dashboard/prism-trend-chart";
import {
  StatusBadge,
  statusDotClasses,
} from "@/components/dashboard/status-badge";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getDashboardSummary,
  getPrismMonitoringData,
} from "@/lib/backend/queries";
import { generatePrismInsights } from "@/lib/insights";
import type { PrismAnomaly, PrismMonitoringData, PrismRegressionSummary, PrismSummary } from "@/lib/types";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type AdrDetailPageProps = {
  params: Promise<{ stationId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdrDetailPage({
  params,
  searchParams,
}: AdrDetailPageProps) {
  const { stationId } = await params;
  const sp = await searchParams;

  const [summary, data] = await Promise.all([
    getDashboardSummary(),
    getPrismMonitoringData({
      stationCode: stationId,
      prismCode: firstParam(sp.prism),
      parameter: firstParam(sp.parameter),
      range: firstParam(sp.range),
      dateFrom: firstParam(sp.from),
      dateTo: firstParam(sp.to),
      granularity: firstParam(sp.granularity),
    }),
  ]);

  if (!data) {
    notFound();
  }

  const { station, prisms, selectedPrism } = data;
  const dateFrom = firstParam(sp.from) ?? "";
  const dateTo = firstParam(sp.to) ?? "";
  const insights = generatePrismInsights(data);

  return (
    <AppShell
      activeArea={summary.activeArea}
      activePath="/adr"
      title={`${station.code} - ${station.name}`}
      updatedAt={summary.updatedAt}
    >
      <div className="grid gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Link
            href="/adr"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            <ArrowLeftIcon className="size-4" />
            Kembali ke daftar station
          </Link>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPinIcon className="size-3.5" />
              {station.coordinate}
            </span>
            <span>·</span>
            <span>Update {station.lastUpdate}</span>
          </div>
        </div>

        <StationHeader data={data} />

        <Card className="interactive-card">
          <CardHeader className="border-b">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle className="text-base">
                  Prism dalam {station.code}
                </CardTitle>
                <CardDescription>
                  {prisms.length} prism observed, {station.lostPrismCount} hilang. Klik prism untuk melihat trend.
                </CardDescription>
              </div>
              <Badge variant="outline" className="font-mono">
                {selectedPrism.code}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-2 p-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {prisms.map((prism) => (
              <PrismCard
                key={prism.id}
                prism={prism}
                isActive={prism.code === selectedPrism.code}
                stationId={station.code}
              />
            ))}
          </CardContent>
        </Card>

        <PrismFilterBar
          selectedParameter={data.selectedParameter}
          selectedRange={data.selectedRange}
          selectedGranularity={data.selectedGranularity}
          selectedDateFrom={dateFrom}
          selectedDateTo={dateTo}
          action={
            <InsightPanel
              insights={insights}
              stationName={`${selectedPrism.label} · ${station.name}`}
              mode="prism"
            />
          }
        />

        <div className="grid gap-3 xl:grid-cols-[280px_minmax(0,1fr)]">
          <SelectedPrismCard prism={selectedPrism} />
          <div className="grid gap-3">
            <div className="grid gap-2 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {data.metrics.map((metric) => (
                <div
                  key={metric.key}
                  className="interactive-card rounded-lg border bg-card px-3 py-2"
                >
                  <p className="text-[11px] text-muted-foreground">{metric.label}</p>
                  <p className="mt-0.5 text-sm font-semibold tabular-nums">
                    {metric.value}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {metric.detail}
                  </p>
                </div>
              ))}
            </div>
            <PrismTrendChart
              data={data.trend}
              parameter={data.selectedParameter}
              prismLabel={`${selectedPrism.code} - ${selectedPrism.label}`}
              latestValue={data.analysis.latestValue}
              granularity={data.selectedGranularity}
            />
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <TrendAnalysisCard analysis={data.trendAnalysis} prismLabel={selectedPrism.label} />
          <AnomaliesCard anomalies={data.anomalies} />
        </div>

        <ObservationTable data={data} />
      </div>
    </AppShell>
  );
}

function StationHeader({ data }: { data: PrismMonitoringData }) {
  const { station } = data;
  const device = station.device;
  const visiblePct =
    station.prismCount > 0
      ? Math.round((station.visiblePrismCount / station.prismCount) * 100)
      : 0;
  const breakdown = station.statusBreakdown;

  return (
    <Card className="interactive-card">
      <CardContent className="grid gap-4 p-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid gap-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5">
                <Badge variant="outline" className="font-mono text-[10px]">
                  {station.type}
                </Badge>
                <Badge variant="outline" className="font-mono text-[10px]">
                  {station.code}
                </Badge>
                <StatusBadge status={station.status} />
              </div>
              <p className="mt-2 text-lg font-semibold">{station.name}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{station.area}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Instrumen</p>
              <p className="text-sm font-medium">{station.instrumentModel}</p>
              <p className="text-[11px] text-muted-foreground">
                Serial {station.instrumentSerial}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Tile
              icon={TargetIcon}
              label="Total prism"
              value={station.prismCount}
              detail={`${station.visiblePrismCount} terlihat`}
            />
            <Tile
              icon={EyeOffIcon}
              label="Prism hilang"
              value={station.lostPrismCount}
              detail={station.lostPrismCount === 0 ? "Semua terlihat" : "Perlu reset"}
              tone={station.lostPrismCount > 0 ? "text-red-600" : "text-muted-foreground"}
            />
            <Tile
              icon={GaugeIcon}
              label="Worst Δ"
              value={`${station.worstPrismDisplacement.toFixed(1)} mm`}
              detail={station.worstPrismLabel}
            />
            <Tile
              icon={SignalIcon}
              label="Velocity"
              value={`${station.worstPrismVelocity.toFixed(2)} mm/h`}
              detail="prism kritis"
            />
          </div>

          <div className="grid gap-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Coverage prism terlihat</span>
              <span className="font-medium tabular-nums">{visiblePct}%</span>
            </div>
            <Progress value={visiblePct} />
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
              {(["Normal", "Waspada", "Siaga", "Awas"] as const).map((status) => (
                <span
                  key={status}
                  className="flex items-center gap-1 rounded-sm border bg-card px-1.5 py-0.5"
                >
                  <span
                    className={cn("size-1.5 rounded-full", statusDotClasses[status])}
                  />
                  {status} {breakdown[status]}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-muted/30 p-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="flex items-center gap-1.5 text-sm font-medium">
                <RadioTowerIcon className="size-4 text-muted-foreground" />
                Logger station
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {device?.name ?? "Logger belum terhubung"}
              </p>
            </div>
            {device ? <StatusBadge status={station.status} /> : null}
          </div>
          {device ? (
            <div className="mt-3 grid gap-2">
              <Telemetry icon={BatteryChargingIcon} label="Baterai" value={device.battery} />
              <Telemetry icon={SignalIcon} label="Sinyal" value={device.signal} />
              <div className="grid gap-0.5 pt-1 text-xs text-muted-foreground">
                <p>Firmware {device.firmwareVersion}</p>
                <p>Status: {device.status}</p>
                <p>Data terakhir {device.lastData}</p>
              </div>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function Tile({
  icon: Icon,
  label,
  value,
  detail,
  tone,
}: {
  icon: typeof TargetIcon;
  label: string;
  value: string | number;
  detail: string;
  tone?: string;
}) {
  return (
    <div className="rounded-lg border bg-muted/25 p-2.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <Icon className={cn("size-3.5 text-muted-foreground", tone)} />
      </div>
      <p className="mt-1 text-base font-semibold tabular-nums">{value}</p>
      <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{detail}</p>
    </div>
  );
}

function Telemetry({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BatteryChargingIcon;
  label: string;
  value: number;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="flex items-center gap-1 text-muted-foreground">
          <Icon className="size-3" />
          {label}
        </span>
        <span className="font-medium tabular-nums">{value}%</span>
      </div>
      <Progress value={value} />
    </div>
  );
}

function PrismCard({
  prism,
  isActive,
  stationId,
}: {
  prism: PrismSummary;
  isActive: boolean;
  stationId: string;
}) {
  return (
    <Link
      href={`/adr/${stationId}?prism=${prism.code}`}
      className={cn(
        "group/prism relative grid gap-2 rounded-lg border p-3 text-left transition-colors",
        isActive
          ? "border-primary ring-2 ring-primary/40"
          : "hover:border-foreground/30 hover:bg-muted/40",
        !prism.visible && "opacity-70",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-xs font-mono text-muted-foreground">
            {prism.code}
          </p>
          <p className="mt-0.5 truncate text-sm font-semibold">{prism.label}</p>
        </div>
        <StatusBadge status={prism.status} />
      </div>

      <div className="grid grid-cols-3 gap-1 text-[11px]">
        <Mini label="ΔX" value={`${prism.latestDxMm > 0 ? "+" : ""}${prism.latestDxMm.toFixed(1)}`} unit="mm" />
        <Mini label="ΔY" value={`${prism.latestDyMm > 0 ? "+" : ""}${prism.latestDyMm.toFixed(1)}`} unit="mm" />
        <Mini label="ΔZ" value={`${prism.latestDzMm > 0 ? "+" : ""}${prism.latestDzMm.toFixed(1)}`} unit="mm" />
      </div>

      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="font-mono tabular-nums">
          Σ {prism.latestTotalMm.toFixed(1)} mm
        </span>
        <span className="flex items-center gap-1">
          {prism.visible ? (
            <EyeIcon className="size-3" />
          ) : (
            <EyeOffIcon className="size-3 text-red-600" />
          )}
          {prism.lastUpdate}
        </span>
      </div>

      {!prism.visible && prism.notes ? (
        <p className="rounded-sm border border-dashed bg-card px-1.5 py-1 text-[10px] text-red-600">
          {prism.notes}
        </p>
      ) : null}
    </Link>
  );
}

function Mini({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="rounded-sm bg-muted/40 px-1.5 py-1">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="font-semibold tabular-nums">
        {value}
        <span className="ml-0.5 text-[10px] text-muted-foreground">{unit}</span>
      </p>
    </div>
  );
}

function SelectedPrismCard({ prism }: { prism: PrismSummary }) {
  return (
    <Card className="interactive-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Prism Terpilih</CardTitle>
        <CardDescription>{prism.label}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <div className="grid gap-1 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Code</span>
            <span className="font-mono">{prism.code}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Status</span>
            <StatusBadge status={prism.status} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Reflector</span>
            <span className="flex items-center gap-1">
              {prism.visible ? (
                <EyeIcon className="size-3.5 text-emerald-600" />
              ) : (
                <EyeOffIcon className="size-3.5 text-red-600" />
              )}
              {prism.visible ? "Terlihat" : "Hilang"}
            </span>
          </div>
          {prism.latitude && prism.longitude ? (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Koordinat</span>
              <span className="font-mono">
                {prism.latitude.toFixed(5)}, {prism.longitude.toFixed(5)}
              </span>
            </div>
          ) : null}
          {prism.baselineElevationM != null ? (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Baseline elev</span>
              <span className="font-mono">{prism.baselineElevationM.toFixed(2)} m</span>
            </div>
          ) : null}
          {prism.slopeDistanceM != null ? (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Slope distance</span>
              <span className="font-mono">{prism.slopeDistanceM.toFixed(2)} m</span>
            </div>
          ) : null}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Update terakhir</span>
            <span className="font-mono">{prism.lastUpdate}</span>
          </div>
        </div>
        {prism.notes ? (
          <div className="rounded-md border border-dashed bg-muted/30 p-2 text-xs text-muted-foreground">
            {prism.notes}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function ObservationTable({ data }: { data: PrismMonitoringData }) {
  return (
    <Card className="interactive-card">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-sm">Observasi Prism</CardTitle>
            <CardDescription>
              {data.analysis.sampleCount} sampel - delta terakhir {data.analysis.deltaFromPrevious} - delta rentang {data.analysis.periodChange}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Waktu</TableHead>
              <TableHead>ΔX</TableHead>
              <TableHead>ΔY</TableHead>
              <TableHead>ΔZ</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Velocity</TableHead>
              <TableHead>Velocity tahunan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...data.trend].reverse().slice(0, 24).map((row) => (
              <TableRow key={row.recordedAt}>
                <TableCell className="font-medium">{row.period}</TableCell>
                <TableCell className="tabular-nums">{formatSigned(row.dx)} mm</TableCell>
                <TableCell className="tabular-nums">{formatSigned(row.dy)} mm</TableCell>
                <TableCell className="tabular-nums">{formatSigned(row.dz)} mm</TableCell>
                <TableCell className="tabular-nums">{row.total.toFixed(2)} mm</TableCell>
                <TableCell className="tabular-nums">{formatSigned(row.velocity, 3)} mm/h</TableCell>
                <TableCell className="tabular-nums">{formatSigned(row.velocityYear, 1)} cm/thn</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function formatSigned(value: number, digits = 2) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(digits)}`;
}

const trendStatusClasses: Record<PrismRegressionSummary["status"], string> = {
  Membaik: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Stabil: "border-blue-200 bg-blue-50 text-blue-700",
  Memburuk: "border-amber-200 bg-amber-50 text-amber-800",
};

const confidenceClasses: Record<PrismRegressionSummary["confidence"], string> = {
  Tinggi: "text-emerald-600",
  Sedang: "text-amber-600",
  Rendah: "text-red-600",
};

function TrendAnalysisCard({
  analysis,
  prismLabel,
}: {
  analysis: PrismRegressionSummary;
  prismLabel: string;
}) {
  return (
    <Card className="interactive-card">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-sm">Analisis Tren Pergeseran</CardTitle>
        <CardDescription>{prismLabel} — regresi linier displacement total</CardDescription>
      </CardHeader>
      <CardContent className="p-4 grid gap-3">
        <div className="flex items-center justify-between gap-3">
          <span
            className={cn(
              "rounded-full border px-2.5 py-0.5 text-xs font-semibold",
              trendStatusClasses[analysis.status],
            )}
          >
            {analysis.status}
          </span>
          <span className={cn("text-xs font-medium", confidenceClasses[analysis.confidence])}>
            Confidence: {analysis.confidence}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
          <StatRow label="Slope" value={`${analysis.slopeMmPerDay > 0 ? "+" : ""}${analysis.slopeMmPerDay.toFixed(3)} mm/hari`} />
          <StatRow label="Velocity terkini" value={`${analysis.velocityMmDay > 0 ? "+" : ""}${analysis.velocityMmDay.toFixed(3)} mm/hari`} />
          <StatRow label="Δ Velocity" value={`${analysis.velocityChangeMmDay > 0 ? "+" : ""}${analysis.velocityChangeMmDay.toFixed(3)} mm/hari`} />
          <StatRow label="R²" value={analysis.rSquared.toFixed(2)} />
          <StatRow label="Sumbu dominan" value={analysis.dominantAxis} />
        </div>

        <p className="text-[11px] text-muted-foreground border-t pt-2">
          {analysis.detail}
        </p>
      </CardContent>
    </Card>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-muted/30 p-2">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-semibold tabular-nums">{value}</p>
    </div>
  );
}

const anomalySeverityClasses: Record<PrismAnomaly["severity"], string> = {
  Critical: "border-red-200 bg-red-50 text-red-700",
  Warning: "border-amber-200 bg-amber-50 text-amber-800",
  Info: "border-blue-200 bg-blue-50 text-blue-700",
};

function AnomaliesCard({ anomalies }: { anomalies: PrismAnomaly[] }) {
  return (
    <Card className="interactive-card">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle className="text-sm">Deteksi Anomali Prism</CardTitle>
            <CardDescription>
              {anomalies.length > 0
                ? `${anomalies.length} anomali terdeteksi dalam rentang ini`
                : "Tidak ada anomali signifikan dalam rentang ini"}
            </CardDescription>
          </div>
          {anomalies.some((a) => a.severity === "Critical") && (
            <TriangleAlertIcon className="size-4 text-red-600 shrink-0" />
          )}
        </div>
      </CardHeader>
      <CardContent className="p-3">
        {anomalies.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Data konsisten — tidak ada lonjakan terdeteksi
          </p>
        ) : (
          <div className="grid gap-2">
            {anomalies.slice(0, 6).map((anomaly) => (
              <div
                key={anomaly.id}
                className={cn(
                  "rounded-lg border p-2.5 text-xs",
                  anomalySeverityClasses[anomaly.severity],
                )}
              >
                <div className="flex items-center justify-between gap-2 font-semibold">
                  <span>{anomaly.parameter} · {anomaly.delta}</span>
                  <span className="font-mono text-[10px] opacity-70">{anomaly.period}</span>
                </div>
                <p className="mt-1 font-normal opacity-80">{anomaly.message}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
