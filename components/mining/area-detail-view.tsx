import {
  AlertTriangleIcon,
  ActivityIcon,
  BatteryChargingIcon,
  MapPinnedIcon,
  ShieldCheckIcon,
} from "lucide-react"

import { AreaSensorTable } from "@/components/mining/area-sensor-table"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  formatMiningSensorValue,
  getAreaStatusCounts,
  getPrioritySensors,
  getSensorsByArea,
  miningSensorTypeLabels,
  type MiningArea,
  type MiningAreaStatus,
} from "@/lib/mining-area-catalog"
import { cn } from "@/lib/utils"

const areaStatusStyles: Record<MiningAreaStatus, string> = {
  Normal: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Waspada: "border-amber-200 bg-amber-50 text-amber-800",
  Siaga: "border-orange-200 bg-orange-50 text-orange-800",
  Awas: "border-red-200 bg-red-50 text-red-700",
}

function SummaryTile({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail: string
}) {
  return (
    <div className="interactive-card rounded-lg border bg-card p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </div>
  )
}

export function AreaDetailView({ area }: { area: MiningArea }) {
  const sensors = getSensorsByArea(area.id)
  const counts = getAreaStatusCounts(area.id)
  const prioritySensors = getPrioritySensors(area.id)
  const sensorTypes = Array.from(new Set(sensors.map((sensor) => sensor.type)))
  const primarySensor = prioritySensors[0] ?? sensors[0]

  return (
    <div className="grid gap-3">
      <section className="interactive-card rounded-lg border bg-card p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <MapPinnedIcon className="size-5 text-primary" />
              <h1 className="text-xl font-semibold">{area.name}</h1>
              <Badge className={cn("border", areaStatusStyles[area.status])} variant="outline">
                {area.status}
              </Badge>
            </div>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{area.description}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {sensorTypes.map((type) => (
                <Badge key={type} variant="outline">
                  {miningSensorTypeLabels[type]}
                </Badge>
              ))}
            </div>
          </div>
          <div className="grid min-w-[260px] grid-cols-2 gap-2 text-sm">
            <div className="rounded-lg border bg-muted/25 p-2">
              <p className="text-xs text-muted-foreground">Risk Score</p>
              <p className="font-semibold">{area.riskScore}/100</p>
            </div>
            <div className="rounded-lg border bg-muted/25 p-2">
              <p className="text-xs text-muted-foreground">Sensor</p>
              <p className="font-semibold">{sensors.length} titik</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <SummaryTile label="Awas" value={String(counts.danger)} detail="Sensor prioritas merah" />
        <SummaryTile label="Waspada" value={String(counts.caution)} detail="Butuh pemantauan rapat" />
        <SummaryTile label="Normal" value={String(counts.normal)} detail="Dalam batas operasi" />
        <SummaryTile label="Inspeksi" value={area.nextInspection} detail={area.focus} />
      </div>

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="interactive-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Sensor Area</CardTitle>
            <CardDescription>Data ASABA dan dummy tambang dalam satu area</CardDescription>
          </CardHeader>
          <CardContent>
            <AreaSensorTable sensors={sensors} />
          </CardContent>
        </Card>

        <div className="grid gap-3">
          <Card className="interactive-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <AlertTriangleIcon className="size-4 text-amber-600" />
                Prioritas Inspeksi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {prioritySensors.length > 0 ? (
                prioritySensors.map((sensor) => (
                  <div className="rounded-lg border bg-muted/25 p-2.5" key={sensor.id}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{sensor.id}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{sensor.note}</p>
                      </div>
                      <Badge variant="outline">{formatMiningSensorValue(sensor)}</Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border bg-muted/25 p-3 text-sm text-muted-foreground">
                  Tidak ada sensor waspada di area ini.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="interactive-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <ActivityIcon className="size-4 text-primary" />
                Snapshot Operasional
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {primarySensor ? (
                <>
                  <div className="rounded-lg border bg-muted/25 p-3">
                    <p className="text-xs text-muted-foreground">Sensor utama</p>
                    <p className="mt-1 font-medium">{primarySensor.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatMiningSensorValue(primarySensor)} · {primarySensor.threshold}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg border bg-muted/25 p-2">
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <BatteryChargingIcon className="size-3" />
                        Battery
                      </p>
                      <p className="mt-1 font-semibold">{primarySensor.battery}%</p>
                    </div>
                    <div className="rounded-lg border bg-muted/25 p-2">
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <ShieldCheckIcon className="size-3" />
                        Signal
                      </p>
                      <p className="mt-1 font-semibold">{primarySensor.signal}%</p>
                    </div>
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
