"use client"

import type { ElementType } from "react"
import { useMemo, useState } from "react"
import {
  ActivityIcon,
  BatteryIcon,
  CloudRainIcon,
  CrosshairIcon,
  GaugeIcon,
  Layers3Icon,
  MapPinIcon,
  RulerIcon,
  SatelliteIcon,
  SearchIcon,
  SignalIcon,
  SlidersHorizontalIcon,
  WavesIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  formatMineNetworkValue,
  getMineNetworkStatusSummary,
  getMineNetworkTypeSummary,
  mineNetworkLines,
  mineNetworkSensors,
  mineNetworkTypeLabels,
  type MineNetworkSensor,
  type MineNetworkSensorStatus,
  type MineNetworkSensorType,
} from "@/lib/asaba-mine-network"
import { cn } from "@/lib/utils"

const sensorTypes: MineNetworkSensorType[] = [
  "tiltmeter",
  "crack-meter",
  "piezometer",
  "rain-gauge",
  "vibration",
  "gnss",
  "adr",
]

const sensorTypeIcons = {
  tiltmeter: GaugeIcon,
  "crack-meter": RulerIcon,
  piezometer: WavesIcon,
  "rain-gauge": CloudRainIcon,
  vibration: ActivityIcon,
  gnss: SatelliteIcon,
  adr: CrosshairIcon,
} satisfies Record<MineNetworkSensorType, ElementType>

const sensorTypeColors = {
  tiltmeter: "#2f6fed",
  "crack-meter": "#c05621",
  piezometer: "#0891b2",
  "rain-gauge": "#2563eb",
  vibration: "#7c3aed",
  gnss: "#0f766e",
  adr: "#15803d",
} satisfies Record<MineNetworkSensorType, string>

const statusStyles = {
  normal: {
    label: "Normal",
    dot: "bg-emerald-500",
    text: "text-emerald-700",
    border: "border-emerald-200",
    bg: "bg-emerald-50",
    ring: "ring-emerald-400",
  },
  caution: {
    label: "Waspada",
    dot: "bg-amber-500",
    text: "text-amber-700",
    border: "border-amber-200",
    bg: "bg-amber-50",
    ring: "ring-amber-400",
  },
  danger: {
    label: "Awas",
    dot: "bg-red-500",
    text: "text-red-700",
    border: "border-red-200",
    bg: "bg-red-50",
    ring: "ring-red-500",
  },
} satisfies Record<
  MineNetworkSensorStatus,
  {
    label: string
    dot: string
    text: string
    border: string
    bg: string
    ring: string
  }
>

function getSensorById(id: string) {
  return mineNetworkSensors.find((sensor) => sensor.id === id)
}

function StatusPill({ status }: { status: MineNetworkSensorStatus }) {
  const style = statusStyles[status]

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-semibold",
        style.bg,
        style.border,
        style.text,
      )}
    >
      <span className={cn("h-2 w-2 rounded-full", style.dot)} />
      {style.label}
    </span>
  )
}

function SensorMarker({
  sensor,
  selected,
  onSelect,
}: {
  sensor: MineNetworkSensor
  selected: boolean
  onSelect: (sensor: MineNetworkSensor) => void
}) {
  const Icon = sensorTypeIcons[sensor.type]
  const color = sensorTypeColors[sensor.type]
  const status = statusStyles[sensor.status]

  return (
    <button
      className={cn(
        "absolute z-20 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 bg-background shadow-md transition hover:scale-110 focus-visible:outline-none focus-visible:ring-4",
        selected && "scale-110 ring-4",
        status.ring,
      )}
      onClick={() => onSelect(sensor)}
      style={{ left: `${sensor.x}%`, top: `${sensor.y}%`, borderColor: color }}
      title={`${sensor.id} - ${sensor.name}`}
      type="button"
    >
      <span
        className={cn(
          "absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-background",
          status.dot,
        )}
      />
      <Icon className="h-4 w-4" style={{ color }} />
    </button>
  )
}

function MetricBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-muted/25 p-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 truncate text-base font-bold">{value}</p>
    </div>
  )
}

export function MineNetworkMap() {
  const [selectedType, setSelectedType] = useState<MineNetworkSensorType | "all">("all")
  const [selectedId, setSelectedId] = useState<string | null>(
    mineNetworkSensors[0]?.id ?? null,
  )
  const [query, setQuery] = useState("")
  const statusSummary = getMineNetworkStatusSummary(mineNetworkSensors)
  const typeSummary = getMineNetworkTypeSummary(mineNetworkSensors)

  const filteredSensors = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return mineNetworkSensors.filter((sensor) => {
      const matchesType = selectedType === "all" || sensor.type === selectedType
      const matchesQuery =
        !normalizedQuery ||
        sensor.name.toLowerCase().includes(normalizedQuery) ||
        sensor.id.toLowerCase().includes(normalizedQuery) ||
        sensor.zone.toLowerCase().includes(normalizedQuery)

      return matchesType && matchesQuery
    })
  }, [query, selectedType])

  const selectedSensor = selectedId
    ? mineNetworkSensors.find((sensor) => sensor.id === selectedId) ?? null
    : null

  const prioritySensors = mineNetworkSensors
    .filter((sensor) => sensor.status !== "normal")
    .sort((sensorA, sensorB) => {
      const severity = { danger: 0, caution: 1, normal: 2 }
      return severity[sensorA.status] - severity[sensorB.status]
    })

  return (
    <div className="grid gap-3 px-4 py-3 lg:px-6">
      <section className="grid gap-3 lg:grid-cols-[290px_minmax(0,1fr)] 2xl:grid-cols-[290px_minmax(0,1fr)_320px]">
        <aside className="grid gap-3 lg:content-start">
          <div className="interactive-card rounded-lg border bg-card p-3 shadow-xs">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  ASABA Mine Network
                </p>
                <h2 className="truncate text-lg font-bold">Peta Tambang</h2>
              </div>
              <MapPinIcon className="h-5 w-5 shrink-0 text-primary" />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <MetricBox label="Sensor" value={String(statusSummary.total)} />
              <MetricBox label="Awas" value={String(statusSummary.danger)} />
              <MetricBox label="Waspada" value={String(statusSummary.caution)} />
            </div>
          </div>

          <div className="interactive-card rounded-lg border bg-card p-3 shadow-xs">
            <div className="flex items-center gap-2">
              <SlidersHorizontalIcon className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold">Filter Sensor</h3>
            </div>
            <label className="mt-3 flex h-9 items-center gap-2 rounded-lg border bg-background px-3 text-sm">
              <SearchIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cari ID, zona, sensor"
                value={query}
              />
            </label>
            <div className="mt-3 grid gap-2">
              <Button
                className="justify-start"
                onClick={() => setSelectedType("all")}
                variant={selectedType === "all" ? "default" : "outline"}
              >
                Semua Sensor
                <span className="ml-auto text-xs">{statusSummary.total}</span>
              </Button>
              {sensorTypes.map((type) => {
                const Icon = sensorTypeIcons[type]

                return (
                  <Button
                    className="justify-start"
                    key={type}
                    onClick={() => setSelectedType(type)}
                    variant={selectedType === type ? "default" : "outline"}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="truncate">{mineNetworkTypeLabels[type]}</span>
                    <span className="ml-auto text-xs">{typeSummary[type]}</span>
                  </Button>
                )
              })}
            </div>
          </div>

          <div className="interactive-card rounded-lg border bg-card p-3 shadow-xs">
            <h3 className="text-sm font-bold">Prioritas Inspeksi</h3>
            <div className="mt-2 grid gap-2">
              {prioritySensors.map((sensor) => (
                <button
                  className={cn(
                    "rounded-lg border bg-background p-2 text-left transition hover:bg-muted/60",
                    selectedSensor?.id === sensor.id && "border-primary/50 bg-primary/5",
                  )}
                  key={sensor.id}
                  onClick={() => setSelectedId(sensor.id)}
                  type="button"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold">{sensor.id}</p>
                      <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                        {sensor.criticalPoint}
                      </p>
                    </div>
                    <StatusPill status={sensor.status} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <section className="interactive-card min-h-[560px] overflow-hidden rounded-lg border bg-[#e8eef0] shadow-xs">
          <div className="relative h-[560px] min-h-[560px] overflow-hidden">
            <svg
              aria-hidden="true"
              className="absolute inset-0 h-full w-full"
              preserveAspectRatio="none"
              viewBox="0 0 100 100"
            >
              <defs>
                <pattern id="asaba-mine-grid" width="8" height="8" patternUnits="userSpaceOnUse">
                  <path
                    d="M 8 0 L 0 0 0 8"
                    fill="none"
                    opacity="0.5"
                    stroke="#cbd5e1"
                    strokeWidth="0.18"
                  />
                </pattern>
                <linearGradient
                  gradientUnits="userSpaceOnUse"
                  id="asaba-pit-outer"
                  x1="20"
                  x2="86"
                  y1="20"
                  y2="72"
                >
                  <stop stopColor="#f6fafc" />
                  <stop offset="0.5" stopColor="#d2dde6" />
                  <stop offset="1" stopColor="#93a6b8" />
                </linearGradient>
                <linearGradient
                  gradientUnits="userSpaceOnUse"
                  id="asaba-pit-floor"
                  x1="40"
                  x2="65"
                  y1="43"
                  y2="57"
                >
                  <stop stopColor="#8fa3b6" />
                  <stop offset="1" stopColor="#41576c" />
                </linearGradient>
              </defs>
              <rect fill="#e8eef0" height="100" width="100" />
              <rect fill="url(#asaba-mine-grid)" height="100" width="100" />
              <path d="M0 66 L11 55 L24 51 L36 63 L34 78 L18 91 L0 100 Z" fill="#c6d7cb" />
              <path d="M73 0 L100 0 L100 44 L92 47 L84 41 L78 24 Z" fill="#d9e8dc" />
              <path
                d="M16 27 L30 18 L55 13 L76 18 L88 29 L93 43 L88 57 L75 68 L54 75 L32 70 L17 58 L10 43 Z"
                fill="#d7e0e6"
                stroke="#b5c3cd"
                strokeWidth="0.65"
              />
              <path
                d="M19 30 L33 22 L55 17 L74 21 L86 31 L90 43 L84 56 L72 65 L53 70 L34 66 L21 56 L14 43 Z"
                fill="url(#asaba-pit-outer)"
                stroke="#9fb1c0"
                strokeWidth="0.95"
              />
              <path
                d="M24 38 L39 30 L58 27 L73 32 L81 42 L78 53 L66 61 L49 64 L34 58 L25 49 Z"
                fill="#bdcbd7"
                stroke="#91a5b7"
                strokeWidth="0.78"
              />
              <path
                d="M33 44 L45 38 L60 36 L70 41 L73 49 L65 56 L50 59 L39 55 L32 49 Z"
                fill="#a9bac8"
                stroke="#7f94a8"
                strokeWidth="0.72"
              />
              <path
                d="M41 47 L51 43 L61 44 L66 49 L61 54 L50 56 L42 53 Z"
                fill="url(#asaba-pit-floor)"
                stroke="#5d7389"
                strokeWidth="0.68"
              />
              <path
                d="M4 88 C18 79 30 73 43 64 C56 56 68 46 83 34 C89 29 94 23 98 18"
                fill="none"
                stroke="#9aa9b9"
                strokeLinecap="round"
                strokeWidth="2.05"
              />
              <path
                d="M5 86 C19 78 32 71 44 62 C57 54 69 44 84 33 C90 28 94 22 99 17"
                fill="none"
                stroke="#ffffff"
                strokeDasharray="2.3 2.3"
                strokeLinecap="round"
                strokeWidth="0.7"
              />
            </svg>

            <div className="absolute left-4 right-4 top-4 z-30 flex flex-wrap items-start justify-between gap-3">
              <div className="rounded-lg border bg-background/95 px-3 py-2 shadow-sm backdrop-blur">
                <div className="flex items-center gap-2 text-xs font-bold text-primary">
                  <MapPinIcon className="h-4 w-4" />
                  Peta Tambang ASABA
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {filteredSensors.length} dari {statusSummary.total} titik sensor dummy
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {(["normal", "caution", "danger"] as MineNetworkSensorStatus[]).map((status) => (
                  <StatusPill key={status} status={status} />
                ))}
              </div>
            </div>

            <svg
              className="pointer-events-none absolute inset-0 z-10 h-full w-full"
              preserveAspectRatio="none"
              viewBox="0 0 100 100"
            >
              {mineNetworkLines.map(([fromId, toId]) => {
                const from = getSensorById(fromId)
                const to = getSensorById(toId)
                if (!from || !to) return null

                return (
                  <line
                    key={`${fromId}-${toId}`}
                    stroke="#475569"
                    strokeDasharray="1.5 1.2"
                    strokeOpacity="0.34"
                    strokeWidth="0.45"
                    x1={from.x}
                    x2={to.x}
                    y1={from.y}
                    y2={to.y}
                  />
                )
              })}
            </svg>

            {filteredSensors.map((sensor) => (
              <SensorMarker
                key={sensor.id}
                onSelect={(nextSensor) => setSelectedId(nextSensor.id)}
                selected={sensor.id === selectedSensor?.id}
                sensor={sensor}
              />
            ))}

            <div className="absolute bottom-4 left-4 right-4 z-30 flex flex-wrap gap-2 rounded-lg border bg-background/95 p-2 shadow-sm backdrop-blur">
              {sensorTypes.map((type) => {
                const Icon = sensorTypeIcons[type]

                return (
                  <Badge className="gap-1.5" key={type} variant="outline">
                    <Icon className="h-3.5 w-3.5" style={{ color: sensorTypeColors[type] }} />
                    {mineNetworkTypeLabels[type]}
                  </Badge>
                )
              })}
            </div>
          </div>
        </section>

        <aside className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-1 2xl:content-start">
          {selectedSensor ? (
            <div className="interactive-card rounded-lg border bg-card p-3 shadow-xs">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {selectedSensor.id}
                  </p>
                  <h3 className="mt-0.5 text-base font-bold leading-tight">
                    {selectedSensor.name}
                  </h3>
                </div>
                <StatusPill status={selectedSensor.status} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <MetricBox label="Nilai" value={formatMineNetworkValue(selectedSensor)} />
                <MetricBox label="Trend" value={selectedSensor.trend} />
              </div>
              <dl className="mt-3 grid gap-2 text-xs">
                <div className="flex justify-between gap-3 border-b pb-2">
                  <dt className="text-muted-foreground">Tipe</dt>
                  <dd className="font-semibold">{mineNetworkTypeLabels[selectedSensor.type]}</dd>
                </div>
                <div className="flex justify-between gap-3 border-b pb-2">
                  <dt className="text-muted-foreground">Zona</dt>
                  <dd className="text-right font-semibold">{selectedSensor.zone}</dd>
                </div>
                <div className="flex justify-between gap-3 border-b pb-2">
                  <dt className="text-muted-foreground">Titik kritis</dt>
                  <dd className="text-right font-semibold">{selectedSensor.criticalPoint}</dd>
                </div>
                <div className="flex justify-between gap-3 border-b pb-2">
                  <dt className="text-muted-foreground">Ambang</dt>
                  <dd className="text-right font-semibold">{selectedSensor.threshold}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Update</dt>
                  <dd className="font-semibold">{selectedSensor.lastUpdate}</dd>
                </div>
              </dl>
              <p className="mt-3 rounded-lg border bg-muted/25 p-2.5 text-xs leading-relaxed text-muted-foreground">
                {selectedSensor.note}
              </p>
              <div className="mt-3 grid gap-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <BatteryIcon className="h-3.5 w-3.5" />
                    Battery
                  </span>
                  <strong>{selectedSensor.battery}%</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <SignalIcon className="h-3.5 w-3.5" />
                    Signal
                  </span>
                  <strong>{selectedSensor.signal}%</strong>
                </div>
              </div>
            </div>
          ) : null}

          <div className="interactive-card rounded-lg border bg-card p-3 shadow-xs">
            <div className="flex items-center gap-2">
              <Layers3Icon className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold">Layer Operasional</h3>
            </div>
            <div className="mt-3 grid gap-2 text-xs">
              <div className="flex items-center justify-between rounded-lg border bg-muted/25 px-3 py-2">
                <span>Open pit bench</span>
                <Badge variant="outline">Aktif</Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg border bg-muted/25 px-3 py-2">
                <span>Jalur inspeksi</span>
                <Badge variant="outline">Aktif</Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg border bg-muted/25 px-3 py-2">
                <span>Jaringan sensor</span>
                <Badge variant="outline">Aktif</Badge>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </div>
  )
}
