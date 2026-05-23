import Link from "next/link"
import { ArrowRightIcon, MapPinIcon, ShieldAlertIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  getAreaStatusCounts,
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

function StatusBadge({ status }: { status: MiningAreaStatus }) {
  return (
    <Badge className={cn("border", areaStatusStyles[status])} variant="outline">
      {status}
    </Badge>
  )
}

export function AreaOverviewGrid({ areas }: { areas: MiningArea[] }) {
  return (
    <div className="grid gap-3">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="interactive-card rounded-lg border bg-card p-3">
          <p className="text-xs text-muted-foreground">Area aktif</p>
          <p className="mt-1 text-2xl font-semibold">{areas.length}</p>
        </div>
        <div className="interactive-card rounded-lg border bg-card p-3">
          <p className="text-xs text-muted-foreground">Area awas</p>
          <p className="mt-1 text-2xl font-semibold">
            {areas.filter((area) => area.status === "Awas").length}
          </p>
        </div>
        <div className="interactive-card rounded-lg border bg-card p-3">
          <p className="text-xs text-muted-foreground">Area waspada/siaga</p>
          <p className="mt-1 text-2xl font-semibold">
            {areas.filter((area) => area.status === "Waspada" || area.status === "Siaga").length}
          </p>
        </div>
        <div className="interactive-card rounded-lg border bg-card p-3">
          <p className="text-xs text-muted-foreground">Total sensor</p>
          <p className="mt-1 text-2xl font-semibold">
            {areas.reduce((total, area) => total + area.sensorIds.length, 0)}
          </p>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
        {areas.map((area) => {
          const sensors = getSensorsByArea(area.id)
          const counts = getAreaStatusCounts(area.id)
          const visibleTypes = Array.from(new Set(sensors.map((sensor) => sensor.type))).slice(0, 5)
          const prioritySensor = sensors.find((sensor) => sensor.status === "danger") ??
            sensors.find((sensor) => sensor.status === "caution") ??
            sensors[0]

          return (
            <article className="interactive-card rounded-lg border bg-card p-4" key={area.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="size-4 text-primary" />
                    <h2 className="truncate text-base font-semibold">{area.name}</h2>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{area.description}</p>
                </div>
                <StatusBadge status={area.status} />
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                <div className="rounded-lg border bg-muted/30 px-2 py-1.5">
                  <p className="text-[11px] text-muted-foreground">Risk</p>
                  <p className="text-sm font-semibold">{area.riskScore}/100</p>
                </div>
                <div className="rounded-lg border bg-muted/30 px-2 py-1.5">
                  <p className="text-[11px] text-muted-foreground">Awas</p>
                  <p className="text-sm font-semibold">{counts.danger}</p>
                </div>
                <div className="rounded-lg border bg-muted/30 px-2 py-1.5">
                  <p className="text-[11px] text-muted-foreground">Waspada</p>
                  <p className="text-sm font-semibold">{counts.caution}</p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {visibleTypes.map((type) => (
                  <Badge key={type} variant="outline">
                    {miningSensorTypeLabels[type]}
                  </Badge>
                ))}
              </div>

              <div className="mt-3 rounded-lg border bg-muted/25 p-2.5">
                <div className="flex items-start gap-2">
                  <ShieldAlertIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium">{area.focus}</p>
                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                      {prioritySensor ? `${prioritySensor.id} - ${prioritySensor.note}` : area.nextInspection}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">{area.nextInspection}</p>
                <Button
                  nativeButton={false}
                  render={<Link href={`/area-tambang/${area.id}`} />}
                  size="sm"
                  variant="outline"
                >
                  Detail
                  <ArrowRightIcon className="size-3.5" />
                </Button>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
