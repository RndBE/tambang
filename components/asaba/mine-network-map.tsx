"use client"

import { useMemo, useState, type CSSProperties } from "react"
import {
  ActivityIcon,
  BatteryIcon,
  BoxIcon,
  CameraIcon,
  CloudRainIcon,
  CloudSunIcon,
  DropletsIcon,
  EyeIcon,
  FlaskConicalIcon,
  GaugeIcon,
  LayersIcon,
  MapPinIcon,
  RadioTowerIcon,
  RulerIcon,
  SatelliteIcon,
  SearchIcon,
  SignalIcon,
  ThermometerIcon,
  TriangleAlertIcon,
  Volume2Icon,
  WavesIcon,
  WindIcon,
  XIcon,
  type LucideIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  formatMiningSensorValue,
  getMiningAreaName,
  getMiningAreas,
  getMiningSensors,
  getMiningSensorTypeSummary,
  getMiningStatusSummary,
  getPrioritySensors,
  miningNetworkLines,
  miningSensorTypeLabels,
  type MiningSensor,
  type MiningSensorStatus,
  type MiningSensorType,
} from "@/lib/mining-area-catalog"
import { cn } from "@/lib/utils"

const miningSensors = getMiningSensors()
const miningAreas = getMiningAreas()

const sensorTypes: MiningSensorType[] = [
  "tiltmeter",
  "crack-meter",
  "piezometer",
  "rain-gauge",
  "vibration",
  "gnss",
  "adr",
  "awlr",
  "awqr",
  "aws",
  "cctv",
  "dust",
  "noise",
  "gas",
]

const sensorTypeIcons = {
  tiltmeter: GaugeIcon,
  "crack-meter": RulerIcon,
  piezometer: WavesIcon,
  "rain-gauge": CloudRainIcon,
  vibration: ActivityIcon,
  gnss: SatelliteIcon,
  adr: RadioTowerIcon,
  awlr: DropletsIcon,
  awqr: FlaskConicalIcon,
  aws: CloudSunIcon,
  cctv: CameraIcon,
  dust: WindIcon,
  noise: Volume2Icon,
  gas: GaugeIcon,
} satisfies Record<MiningSensorType, LucideIcon>

const sensorTypeColors = {
  tiltmeter: "#93c5fd",
  "crack-meter": "#fb923c",
  piezometer: "#22d3ee",
  "rain-gauge": "#60a5fa",
  vibration: "#c084fc",
  gnss: "#5eead4",
  adr: "#86efac",
  awlr: "#38bdf8",
  awqr: "#2dd4bf",
  aws: "#fde047",
  cctv: "#cbd5e1",
  dust: "#facc15",
  noise: "#fb7185",
  gas: "#f87171",
} satisfies Record<MiningSensorType, string>

const statusStyles = {
  normal: {
    label: "Normal",
    dot: "bg-emerald-400",
    chip: "border-emerald-300/45 text-emerald-50",
    panel: "border-emerald-400/40 bg-emerald-500/10 text-emerald-50",
    heatInner: "rgba(16, 185, 129, 0.72)",
    heatMid: "rgba(34, 197, 94, 0.34)",
    heatOuter: "rgba(34, 197, 94, 0)",
    accent: "#34d399",
    glowSize: 92,
  },
  caution: {
    label: "Waspada",
    dot: "bg-amber-300",
    chip: "border-amber-300/55 text-amber-50",
    panel: "border-amber-300/45 bg-amber-500/12 text-amber-50",
    heatInner: "rgba(245, 158, 11, 0.82)",
    heatMid: "rgba(234, 179, 8, 0.44)",
    heatOuter: "rgba(234, 179, 8, 0)",
    accent: "#f59e0b",
    glowSize: 122,
  },
  danger: {
    label: "Awas",
    dot: "bg-red-400",
    chip: "border-red-300/65 text-red-50",
    panel: "border-red-300/50 bg-red-500/15 text-red-50",
    heatInner: "rgba(239, 68, 68, 0.9)",
    heatMid: "rgba(249, 115, 22, 0.55)",
    heatOuter: "rgba(239, 68, 68, 0)",
    accent: "#ef4444",
    glowSize: 154,
  },
} satisfies Record<
  MiningSensorStatus,
  {
    label: string
    dot: string
    chip: string
    panel: string
    heatInner: string
    heatMid: string
    heatOuter: string
    accent: string
    glowSize: number
  }
>

const satelliteTiles = [
  { x: 13526, y: 8024 },
  { x: 13527, y: 8024 },
  { x: 13526, y: 8025 },
  { x: 13527, y: 8025 },
]

function satelliteTileUrl(tile: { x: number; y: number }) {
  return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/14/${tile.y}/${tile.x}`
}

function getSensorById(id: string) {
  return miningSensors.find((sensor) => sensor.id === id)
}

function StatusBadge({ status }: { status: MiningSensorStatus }) {
  const style = statusStyles[status]

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-bold shadow-sm backdrop-blur",
        style.panel,
      )}
    >
      <span className={cn("h-2 w-2 rounded-full", style.dot)} />
      {style.label}
    </span>
  )
}

function SensorHeat({ sensor }: { sensor: MiningSensor }) {
  const style = statusStyles[sensor.status]
  const size = style.glowSize

  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full blur-lg mix-blend-screen"
      style={{
        background: `radial-gradient(circle, ${style.heatInner} 0%, ${style.heatMid} 38%, ${style.heatOuter} 72%)`,
        height: size,
        left: `${sensor.x}%`,
        opacity: sensor.status === "normal" ? 0.62 : 0.84,
        top: `${sensor.y}%`,
        width: size,
      }}
    />
  )
}

function SensorLabel({
  sensor,
  selected,
  onSelect,
}: {
  sensor: MiningSensor
  selected: boolean
  onSelect: (sensor: MiningSensor) => void
}) {
  const Icon = sensorTypeIcons[sensor.type]
  const style = statusStyles[sensor.status]
  const value = formatMiningSensorValue(sensor)

  return (
    <button
      className={cn(
        "absolute z-30 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-sm border bg-slate-950/82 px-1.5 py-1 text-[10px] font-extrabold leading-none text-white shadow-[0_10px_22px_rgba(2,6,23,0.38)] outline-none backdrop-blur transition hover:z-40 hover:scale-105 focus-visible:z-40 focus-visible:ring-2 focus-visible:ring-white/70",
        style.chip,
        selected && "z-40 scale-110 border-white bg-slate-900 ring-2 ring-white/70",
      )}
      onClick={() => onSelect(sensor)}
      style={
        {
          "--sensor-color": sensorTypeColors[sensor.type],
          left: `${sensor.x}%`,
          top: `${sensor.y}%`,
        } as CSSProperties
      }
      title={`${sensor.id} - ${sensor.name}`}
      type="button"
    >
      <span
        className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px]"
        style={{ backgroundColor: "color-mix(in srgb, var(--sensor-color) 30%, transparent)" }}
      >
        <Icon className="h-2.5 w-2.5" style={{ color: sensorTypeColors[sensor.type] }} />
      </span>
      <span className="whitespace-nowrap">{sensor.id}</span>
      <span className="whitespace-nowrap font-bold text-slate-200">{value}</span>
    </button>
  )
}

function MetricTile({
  icon: Icon,
  label,
  value,
  tone = "default",
}: {
  icon: LucideIcon
  label: string
  value: string
  tone?: "default" | "danger" | "caution"
}) {
  return (
    <div
      className={cn(
        "flex min-w-28 items-center gap-2 rounded-lg border bg-slate-950/78 px-3 py-2 text-white shadow-lg backdrop-blur",
        tone === "danger" && "border-red-300/50",
        tone === "caution" && "border-amber-300/45",
        tone === "default" && "border-white/12",
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4 shrink-0",
          tone === "danger" && "text-red-300",
          tone === "caution" && "text-amber-200",
          tone === "default" && "text-cyan-200",
        )}
      />
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase text-slate-300">{label}</p>
        <p className="text-sm font-black leading-tight">{value}</p>
      </div>
    </div>
  )
}

function FilterButton({
  active,
  children,
  onClick,
}: {
  active: boolean
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      className={cn(
        "flex h-8 w-full items-center gap-2 rounded-md border px-2 text-left text-xs font-bold transition",
        active
          ? "border-cyan-300/60 bg-cyan-400/15 text-cyan-50"
          : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10",
      )}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  )
}

export function MineNetworkMap() {
  const [selectedType, setSelectedType] = useState<MiningSensorType | "all">("all")
  const [selectedAreaId, setSelectedAreaId] = useState<string | "all">("all")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [showHeatmap, setShowHeatmap] = useState(true)
  const [showTerrain3D, setShowTerrain3D] = useState(true)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const statusSummary = getMiningStatusSummary(miningSensors)
  const typeSummary = getMiningSensorTypeSummary(miningSensors)

  const filteredSensors = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return miningSensors.filter((sensor) => {
      const matchesType = selectedType === "all" || sensor.type === selectedType
      const matchesArea = selectedAreaId === "all" || sensor.areaId === selectedAreaId
      const matchesQuery =
        !normalizedQuery ||
        sensor.name.toLowerCase().includes(normalizedQuery) ||
        sensor.id.toLowerCase().includes(normalizedQuery) ||
        sensor.zone.toLowerCase().includes(normalizedQuery) ||
        sensor.functionLabel.toLowerCase().includes(normalizedQuery) ||
        getMiningAreaName(sensor.areaId).toLowerCase().includes(normalizedQuery)

      return matchesType && matchesArea && matchesQuery
    })
  }, [query, selectedAreaId, selectedType])

  const selectedSensor = selectedId
    ? miningSensors.find((sensor) => sensor.id === selectedId) ?? null
    : null

  const prioritySensors = getPrioritySensors(
    selectedAreaId === "all" ? undefined : selectedAreaId,
  )

  return (
    <div className="px-3 py-3 lg:px-5">
      <section className="relative min-h-[calc(100vh-6.25rem)] overflow-hidden rounded-lg border border-slate-800 bg-slate-950 shadow-xs">
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute grid grid-cols-2 grid-rows-2"
            style={{
              filter: "brightness(0.76) saturate(1.12) contrast(1.1)",
              inset: "-10%",
              transform: showTerrain3D
                ? "perspective(1400px) rotateX(5deg) scale(1.08)"
                : "scale(1.04)",
              transformOrigin: "center",
            }}
          >
            {satelliteTiles.map((tile) => (
              <div
                className="bg-cover bg-center"
                key={`${tile.x}-${tile.y}`}
                style={{
                  backgroundImage: `url("${satelliteTileUrl(tile)}")`,
                  backgroundSize: "100% 100%",
                }}
              />
            ))}
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_52%_45%,rgba(15,23,42,0.03),rgba(15,23,42,0.45)_58%,rgba(2,6,23,0.58))]" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/8 via-transparent to-slate-950/35" />
        </div>

        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20 h-full w-full"
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
        >
          {miningNetworkLines.map(([fromId, toId]) => {
            const from = getSensorById(fromId)
            const to = getSensorById(toId)
            if (!from || !to) return null

            return (
              <line
                key={`${fromId}-${toId}`}
                stroke="rgba(226,232,240,0.48)"
                strokeDasharray="1.5 1.3"
                strokeLinecap="round"
                strokeWidth="0.25"
                x1={from.x}
                x2={to.x}
                y1={from.y}
                y2={to.y}
              />
            )
          })}
        </svg>

        {showHeatmap
          ? filteredSensors.map((sensor) => <SensorHeat key={`heat-${sensor.id}`} sensor={sensor} />)
          : null}

        {filteredSensors.map((sensor) => (
          <SensorLabel
            key={sensor.id}
            onSelect={(nextSensor) => setSelectedId(nextSensor.id)}
            selected={sensor.id === selectedSensor?.id}
            sensor={sensor}
          />
        ))}

        <div className="absolute left-3 top-3 z-40 flex max-w-[calc(100%-1.5rem)] flex-wrap items-center gap-2">
          <div className="rounded-lg border border-white/12 bg-slate-950/78 px-3 py-2 text-white shadow-lg backdrop-blur">
            <div className="flex items-center gap-2 text-xs font-black">
              <MapPinIcon className="h-4 w-4 text-cyan-200" />
              Peta Jaringan Tambang
            </div>
            <p className="mt-0.5 text-[11px] font-semibold text-slate-300">
              {filteredSensors.length} dari {statusSummary.total} titik sensor
            </p>
          </div>
          <MetricTile icon={SatelliteIcon} label="Sensor" value={String(statusSummary.total)} />
          <MetricTile
            icon={TriangleAlertIcon}
            label="Awas"
            tone="danger"
            value={String(statusSummary.danger)}
          />
          <MetricTile
            icon={ActivityIcon}
            label="Waspada"
            tone="caution"
            value={String(statusSummary.caution)}
          />
        </div>

        <div className="absolute right-3 top-3 z-40 flex flex-col gap-2 sm:items-end">
          <button
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-black text-white shadow-lg backdrop-blur transition hover:bg-cyan-400/20",
              showTerrain3D
                ? "border-cyan-300/55 bg-cyan-500/25"
                : "border-white/12 bg-slate-950/78",
            )}
            onClick={() => setShowTerrain3D((current) => !current)}
            type="button"
          >
            <BoxIcon className="h-4 w-4 text-cyan-200" />
            Tampilan 3D
          </button>
          <button
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-black text-white shadow-lg backdrop-blur transition hover:bg-amber-400/20",
              showHeatmap
                ? "border-amber-300/55 bg-amber-500/25"
                : "border-white/12 bg-slate-950/78",
            )}
            onClick={() => setShowHeatmap((current) => !current)}
            type="button"
          >
            <ThermometerIcon className="h-4 w-4 text-amber-200" />
            Heatmap
          </button>
          <button
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/12 bg-slate-950/78 px-3 text-xs font-black text-white shadow-lg backdrop-blur transition hover:bg-white/10"
            onClick={() => setFiltersOpen((current) => !current)}
            type="button"
          >
            <LayersIcon className="h-4 w-4 text-slate-200" />
            Layer & Filter
          </button>
        </div>

        {filtersOpen ? (
          <aside className="absolute right-3 top-36 z-40 w-[min(21rem,calc(100%-1.5rem))] rounded-lg border border-white/12 bg-slate-950/86 p-3 text-white shadow-2xl backdrop-blur">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Layer</p>
                <h3 className="text-sm font-black">Filter Sensor</h3>
              </div>
              <button
                className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                onClick={() => setFiltersOpen(false)}
                type="button"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>
            <label className="mt-3 flex h-9 items-center gap-2 rounded-md border border-white/10 bg-white/7 px-2 text-xs">
              <SearchIcon className="h-4 w-4 shrink-0 text-slate-300" />
              <input
                className="min-w-0 flex-1 bg-transparent font-semibold outline-none placeholder:text-slate-400"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cari ID, zona, sensor"
                value={query}
              />
            </label>
            <div className="mt-3 grid max-h-52 gap-1.5 overflow-y-auto pr-1">
              <FilterButton active={selectedType === "all"} onClick={() => setSelectedType("all")}>
                <LayersIcon className="h-3.5 w-3.5" />
                Semua Sensor
                <span className="ml-auto">{statusSummary.total}</span>
              </FilterButton>
              {sensorTypes.map((type) => {
                const Icon = sensorTypeIcons[type]

                return (
                  <FilterButton
                    active={selectedType === type}
                    key={type}
                    onClick={() => setSelectedType(type)}
                  >
                    <Icon className="h-3.5 w-3.5" style={{ color: sensorTypeColors[type] }} />
                    <span className="truncate">{miningSensorTypeLabels[type]}</span>
                    <span className="ml-auto">{typeSummary[type]}</span>
                  </FilterButton>
                )
              })}
            </div>
            <div className="mt-3 border-t border-white/10 pt-3">
              <p className="text-[10px] font-bold uppercase text-slate-400">Area Tambang</p>
              <div className="mt-2 grid max-h-40 gap-1.5 overflow-y-auto pr-1">
                <FilterButton
                  active={selectedAreaId === "all"}
                  onClick={() => setSelectedAreaId("all")}
                >
                  <MapPinIcon className="h-3.5 w-3.5" />
                  Semua Area
                  <span className="ml-auto">{miningSensors.length}</span>
                </FilterButton>
                {miningAreas.map((area) => (
                  <FilterButton
                    active={selectedAreaId === area.id}
                    key={area.id}
                    onClick={() => setSelectedAreaId(area.id)}
                  >
                    <span className="truncate">{area.name}</span>
                    <span className="ml-auto">{area.sensorIds.length}</span>
                  </FilterButton>
                ))}
              </div>
            </div>
          </aside>
        ) : null}

        <div className="absolute bottom-3 left-3 z-40 flex max-w-[calc(100%-1.5rem)] flex-wrap items-center gap-1.5 rounded-lg border border-white/12 bg-slate-950/78 p-2 text-white shadow-lg backdrop-blur">
          <Badge className="gap-1.5 border-white/15 bg-white/7 text-slate-100" variant="outline">
            <RadioTowerIcon className="h-3.5 w-3.5 text-emerald-200" />
            ADR
          </Badge>
          <Badge className="gap-1.5 border-white/15 bg-white/7 text-slate-100" variant="outline">
            <WavesIcon className="h-3.5 w-3.5 text-sky-200" />
            AWLR
          </Badge>
          <Badge className="gap-1.5 border-white/15 bg-white/7 text-slate-100" variant="outline">
            <CameraIcon className="h-3.5 w-3.5 text-slate-200" />
            CCTV
          </Badge>
          <Badge className="gap-1.5 border-white/15 bg-white/7 text-slate-100" variant="outline">
            <CloudSunIcon className="h-3.5 w-3.5 text-amber-200" />
            Sensor
          </Badge>
          <span className="ml-1 hidden items-center gap-1.5 text-[11px] font-semibold text-slate-300 sm:inline-flex">
            <EyeIcon className="h-3.5 w-3.5" />
            Klik marker untuk detail titik
          </span>
        </div>

        {selectedSensor ? (
          <aside className="absolute bottom-3 right-3 z-40 w-[min(23rem,calc(100%-1.5rem))] rounded-lg border border-white/12 bg-slate-950/86 p-3 text-white shadow-2xl backdrop-blur">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase text-slate-400">
                  {selectedSensor.id} | {miningSensorTypeLabels[selectedSensor.type]}
                </p>
                <h3 className="mt-0.5 truncate text-base font-black">{selectedSensor.name}</h3>
                <p className="mt-1 truncate text-xs font-semibold text-slate-300">
                  {getMiningAreaName(selectedSensor.areaId)} | {selectedSensor.criticalPoint}
                </p>
              </div>
              <StatusBadge status={selectedSensor.status} />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-md border border-white/10 bg-white/7 p-2">
                <p className="text-[10px] font-bold uppercase text-slate-400">Nilai</p>
                <p className="mt-1 text-sm font-black">{formatMiningSensorValue(selectedSensor)}</p>
              </div>
              <div className="rounded-md border border-white/10 bg-white/7 p-2">
                <p className="text-[10px] font-bold uppercase text-slate-400">Trend</p>
                <p className="mt-1 text-sm font-black capitalize">{selectedSensor.trend}</p>
              </div>
            </div>
            <p className="mt-3 line-clamp-2 text-xs font-medium leading-relaxed text-slate-300">
              {selectedSensor.note}
            </p>
            <div className="mt-3 flex flex-wrap gap-3 text-xs font-bold text-slate-200">
              <span className="inline-flex items-center gap-1.5">
                <BatteryIcon className="h-3.5 w-3.5 text-emerald-200" />
                {selectedSensor.battery}%
              </span>
              <span className="inline-flex items-center gap-1.5">
                <SignalIcon className="h-3.5 w-3.5 text-cyan-200" />
                {selectedSensor.signal}%
              </span>
              <span className="inline-flex items-center gap-1.5 text-slate-300">
                Ambang: {selectedSensor.threshold}
              </span>
            </div>
          </aside>
        ) : null}

        <div className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[54%] w-[46%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5 bg-slate-950/12 shadow-[inset_0_0_80px_rgba(15,23,42,0.45)]" />
      </section>

      <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_23rem]">
        <section className="rounded-lg border bg-card p-3 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Prioritas Area
              </p>
              <h2 className="text-lg font-bold">Inspeksi Sensor Tambang</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status="danger" />
              <StatusBadge status="caution" />
            </div>
          </div>
          <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {prioritySensors.slice(0, 6).map((sensor) => (
              <button
                className={cn(
                  "rounded-lg border bg-muted/20 p-3 text-left transition hover:bg-muted/45",
                  selectedSensor?.id === sensor.id && "border-primary/60 bg-primary/5",
                )}
                key={sensor.id}
                onClick={() => setSelectedId(sensor.id)}
                type="button"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{sensor.id}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {sensor.criticalPoint}
                    </p>
                  </div>
                  <span className={cn("mt-1 h-2.5 w-2.5 rounded-full", statusStyles[sensor.status].dot)} />
                </div>
                <p className="mt-2 text-xs font-semibold text-muted-foreground">
                  {formatMiningSensorValue(sensor)} | {sensor.trend}
                </p>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-lg border bg-card p-3 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Coverage
          </p>
          <h2 className="text-lg font-bold">Area Tambang</h2>
          <div className="mt-3 grid gap-2">
            {miningAreas.slice(0, 5).map((area) => (
              <button
                className={cn(
                  "flex items-center justify-between gap-3 rounded-lg border bg-muted/20 px-3 py-2 text-left transition hover:bg-muted/45",
                  selectedAreaId === area.id && "border-primary/60 bg-primary/5",
                )}
                key={area.id}
                onClick={() => {
                  setSelectedAreaId(area.id)
                  setFiltersOpen(false)
                }}
                type="button"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold">{area.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {area.focus}
                  </span>
                </span>
                <Badge variant="outline">{area.sensorIds.length}</Badge>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
