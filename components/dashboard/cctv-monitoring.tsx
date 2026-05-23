"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIcon,
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  BellRingIcon,
  CameraIcon,
  CircleDotIcon,
  ClockIcon,
  CloudDrizzleIcon,
  CloudIcon,
  CloudSunIcon,
  EyeIcon,
  EyeOffIcon,
  FilmIcon,
  FilterIcon,
  Grid2x2Icon,
  Grid3x3Icon,
  HardDriveIcon,
  MaximizeIcon,
  MinimizeIcon,
  MinusIcon,
  MoonIcon,
  PlusIcon,
  RadarIcon,
  RadioIcon,
  RotateCcwIcon,
  SearchIcon,
  ShieldAlertIcon,
  SignalIcon,
  SquareIcon,
  Volume2Icon,
  VolumeXIcon,
  WindIcon,
  ZapIcon,
} from "lucide-react";

import { StatusBadge, statusDotClasses } from "@/components/dashboard/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  type CameraEvent,
  type CameraFeed,
  type CameraVisibility,
} from "@/lib/cctv-feeds";
import type { RiskStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

type CctvMonitoringProps = {
  cameras: CameraFeed[];
};

const visibilityMeta: Record<
  CameraVisibility,
  { label: string; icon: typeof CloudIcon }
> = {
  Clear: { label: "Jelas", icon: CloudSunIcon },
  Rain: { label: "Hujan", icon: CloudDrizzleIcon },
  "Low light": { label: "Cahaya rendah", icon: MoonIcon },
  Cloudy: { label: "Berawan", icon: CloudIcon },
  Dust: { label: "Berdebu", icon: WindIcon },
};

const statusPriority: Record<RiskStatus, number> = {
  Awas: 3,
  Siaga: 2,
  Waspada: 1,
  Normal: 0,
};

const statusOptions: Array<{ label: string; value: "all" | RiskStatus }> = [
  { label: "Semua", value: "all" },
  { label: "Normal", value: "Normal" },
  { label: "Waspada", value: "Waspada" },
  { label: "Siaga", value: "Siaga" },
  { label: "Awas", value: "Awas" },
];

const zoneOptions: Array<{ label: string; value: "all" | CameraFeed["zone"] }> = [
  { label: "Semua zona", value: "all" },
  { label: "Pit", value: "Pit" },
  { label: "Plant", value: "Plant" },
  { label: "Infrastruktur", value: "Infrastruktur" },
  { label: "Logistik", value: "Logistik" },
  { label: "Keamanan", value: "Keamanan" },
];

const quickLayouts: Array<{ label: string; value: 1 | 4 | 9; icon: typeof SquareIcon }> = [
  { label: "Solo", value: 1, icon: SquareIcon },
  { label: "Quad", value: 4, icon: Grid2x2Icon },
  { label: "Nine", value: 9, icon: Grid3x3Icon },
];

function formatMinutesAgo(minutes: number) {
  if (minutes < 1) return "baru saja";
  if (minutes < 60) return `${Math.round(minutes)} mnt lalu`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h < 24) return m === 0 ? `${h} jam lalu` : `${h} jam ${m} mnt lalu`;
  return `${Math.floor(h / 24)} hari lalu`;
}

function formatUptime(hours: number) {
  if (hours < 24) return `${hours} jam`;
  const d = Math.floor(hours / 24);
  const h = hours % 24;
  return h === 0 ? `${d} hari` : `${d} hari ${h} jam`;
}

export function CctvMonitoring({ cameras }: CctvMonitoringProps) {
  const [selectedId, setSelectedId] = useState<string>(() => {
    const priority = [...cameras].sort(
      (a, b) => statusPriority[b.status] - statusPriority[a.status],
    );
    return priority[0]?.id ?? cameras[0]?.id ?? "";
  });
  const [search, setSearch] = useState("");
  const [zoneFilter, setZoneFilter] = useState<"all" | CameraFeed["zone"]>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | RiskStatus>("all");
  const [layout, setLayout] = useState<1 | 4 | 9>(4);
  const [showOsd, setShowOsd] = useState(true);
  const [muted, setMuted] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [recording, setRecording] = useState(true);
  const [ptz, setPtz] = useState<{ x: number; y: number; zoom: number }>({
    x: 0,
    y: 0,
    zoom: 1,
  });
  const [now, setNow] = useState(() => new Date());
  const [snapshotPulse, setSnapshotPulse] = useState(false);
  const snapshotTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Reset PTZ on camera change
  useEffect(() => {
    setPtz({ x: 0, y: 0, zoom: 1 });
  }, [selectedId]);

  const selected =
    cameras.find((cam) => cam.id === selectedId) ?? cameras[0] ?? null;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return cameras.filter((cam) => {
      if (zoneFilter !== "all" && cam.zone !== zoneFilter) return false;
      if (statusFilter !== "all" && cam.status !== statusFilter) return false;
      if (!q) return true;
      return (
        cam.name.toLowerCase().includes(q) ||
        cam.area.toLowerCase().includes(q) ||
        cam.code.toLowerCase().includes(q)
      );
    });
  }, [cameras, search, zoneFilter, statusFilter]);

  const stats = useMemo(() => {
    const recordingCount = cameras.filter((c) => c.recording).length;
    const critical = cameras.filter((c) => c.status !== "Normal").length;
    const aiTotal = cameras.reduce(
      (sum, c) =>
        sum +
        c.events.filter(
          (e) => e.type === "Deteksi AI" && e.minutesAgo <= 60 * 8,
        ).length,
      0,
    );
    const avgUptime =
      cameras.reduce((sum, c) => sum + c.uptimeHours, 0) / (cameras.length || 1);
    const storageAvg =
      cameras.reduce((sum, c) => sum + c.storageDays, 0) / (cameras.length || 1);
    return {
      online: cameras.length,
      recordingCount,
      critical,
      aiTotal,
      avgUptime,
      storageAvg,
    };
  }, [cameras]);

  const sortedTimeline = useMemo(() => {
    if (!selected) return [];
    return [...selected.timeline].sort((a, b) => a.minutesAgo - b.minutesAgo);
  }, [selected]);

  const recentEvents = useMemo(() => {
    return cameras
      .flatMap((cam) =>
        cam.events.map((e) => ({ ...e, cameraId: cam.id, cameraName: cam.name })),
      )
      .sort((a, b) => a.minutesAgo - b.minutesAgo)
      .slice(0, 16);
  }, [cameras]);

  const aiDetections = useMemo(() => {
    return cameras
      .flatMap((cam) =>
        cam.detections.map((d) => ({
          ...d,
          cameraId: cam.id,
          cameraName: cam.name,
          area: cam.area,
        })),
      )
      .sort((a, b) => statusPriority[b.severity] - statusPriority[a.severity])
      .slice(0, 14);
  }, [cameras]);

  // Pick cameras for multi-view grid: selected first, then by priority
  const multiViewFeeds = useMemo(() => {
    const ordered = [
      selected,
      ...filtered.filter((cam) => cam.id !== selected?.id),
    ].filter((c): c is CameraFeed => Boolean(c));
    return ordered.slice(0, layout);
  }, [filtered, layout, selected]);

  function nudgePtz(direction: "up" | "down" | "left" | "right") {
    setPtz((prev) => {
      const step = 4;
      const next = { ...prev };
      if (direction === "up") next.y = Math.max(prev.y - step, -20);
      if (direction === "down") next.y = Math.min(prev.y + step, 20);
      if (direction === "left") next.x = Math.max(prev.x - step, -20);
      if (direction === "right") next.x = Math.min(prev.x + step, 20);
      return next;
    });
  }

  function adjustZoom(delta: number) {
    setPtz((prev) => ({
      ...prev,
      zoom: Math.max(1, Math.min(3, +(prev.zoom + delta).toFixed(2))),
    }));
  }

  function resetPtz() {
    setPtz({ x: 0, y: 0, zoom: 1 });
  }

  function takeSnapshot() {
    setSnapshotPulse(true);
    if (snapshotTimerRef.current) clearTimeout(snapshotTimerRef.current);
    snapshotTimerRef.current = setTimeout(() => setSnapshotPulse(false), 400);
  }

  if (!selected) {
    return (
      <Card className="interactive-card">
        <CardContent className="p-6 text-sm text-muted-foreground">
          Belum ada kamera terkonfigurasi.
        </CardContent>
      </Card>
    );
  }

  return (
    <div
      className={cn(
        "grid gap-4",
        fullscreen && "fixed inset-0 z-50 overflow-auto bg-background p-4",
      )}
    >
      <StatsStrip stats={stats} />

      <FilterBar
        search={search}
        onSearch={setSearch}
        zone={zoneFilter}
        onZone={setZoneFilter}
        status={statusFilter}
        onStatus={setStatusFilter}
        showOsd={showOsd}
        onShowOsd={setShowOsd}
        cameraCount={filtered.length}
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <FeaturedViewer
          camera={selected}
          now={now}
          showOsd={showOsd}
          ptz={ptz}
          muted={muted}
          fullscreen={fullscreen}
          recording={recording}
          snapshotPulse={snapshotPulse}
          onPtz={nudgePtz}
          onZoom={adjustZoom}
          onResetPtz={resetPtz}
          onToggleMute={() => setMuted((m) => !m)}
          onToggleFullscreen={() => setFullscreen((f) => !f)}
          onToggleRecording={() => setRecording((r) => !r)}
          onSnapshot={takeSnapshot}
        />
        <CameraSidebar
          cameras={filtered}
          selectedId={selected.id}
          onSelect={setSelectedId}
        />
      </div>

      <MultiView
        cameras={multiViewFeeds}
        layout={layout}
        selectedId={selected.id}
        onSelect={setSelectedId}
        onLayoutChange={setLayout}
      />

      <DetailsTabs
        camera={selected}
        timeline={sortedTimeline}
        recentEvents={recentEvents}
        aiDetections={aiDetections}
        allCameras={cameras}
        onSelect={setSelectedId}
      />
    </div>
  );
}

function StatsStrip({
  stats,
}: {
  stats: {
    online: number;
    recordingCount: number;
    critical: number;
    aiTotal: number;
    avgUptime: number;
    storageAvg: number;
  };
}) {
  const items = [
    {
      label: "Kamera online",
      value: stats.online,
      icon: SignalIcon,
      tone: "text-emerald-600",
      detail: `${stats.recordingCount} recording`,
    },
    {
      label: "Perlu pantau",
      value: stats.critical,
      icon: ShieldAlertIcon,
      tone: "text-amber-600",
      detail: stats.critical === 0 ? "Semua normal" : "Status di atas Normal",
    },
    {
      label: "Deteksi AI 8 jam",
      value: stats.aiTotal,
      icon: RadarIcon,
      tone: "text-sky-600",
      detail: "Termasuk false positive",
    },
    {
      label: "Rata uptime",
      value: formatUptime(Math.round(stats.avgUptime)),
      icon: ActivityIcon,
      tone: "text-violet-600",
      detail: `Retensi ${Math.round(stats.storageAvg)} hari`,
    },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Card className="interactive-card" key={item.label}>
          <CardContent className="flex items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="mt-1 truncate text-2xl font-semibold tabular-nums">
                {item.value}
              </p>
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {item.detail}
              </p>
            </div>
            <div
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-md border bg-muted/40",
                item.tone,
              )}
            >
              <item.icon className="size-5" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function FilterBar({
  search,
  onSearch,
  zone,
  onZone,
  status,
  onStatus,
  showOsd,
  onShowOsd,
  cameraCount,
}: {
  search: string;
  onSearch: (v: string) => void;
  zone: "all" | CameraFeed["zone"];
  onZone: (v: "all" | CameraFeed["zone"]) => void;
  status: "all" | RiskStatus;
  onStatus: (v: "all" | RiskStatus) => void;
  showOsd: boolean;
  onShowOsd: (v: boolean) => void;
  cameraCount: number;
}) {
  return (
    <Card className="interactive-card">
      <CardContent className="flex flex-col gap-3 p-3 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <FilterIcon className="size-4" />
          <span>Filter Kamera</span>
          <Badge variant="outline" className="font-mono">
            {cameraCount}
          </Badge>
        </div>
        <div className="relative w-full sm:w-72">
          <SearchIcon className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Cari nama, kode, atau area"
            className="pl-8"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ToggleGroup
            multiple={false}
            value={[zone]}
            onValueChange={(v) => {
              const next = (v[0] as typeof zone | undefined) ?? "all";
              onZone(next);
            }}
            variant="outline"
            size="sm"
          >
            {zoneOptions.map((opt) => (
              <ToggleGroupItem key={opt.value} value={opt.value}>
                {opt.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ToggleGroup
            multiple={false}
            value={[status]}
            onValueChange={(v) => {
              const next = (v[0] as typeof status | undefined) ?? "all";
              onStatus(next);
            }}
            variant="outline"
            size="sm"
          >
            {statusOptions.map((opt) => (
              <ToggleGroupItem key={opt.value} value={opt.value}>
                <span
                  className={cn(
                    "size-2 rounded-full",
                    opt.value === "all"
                      ? "bg-muted-foreground/50"
                      : statusDotClasses[opt.value as RiskStatus],
                  )}
                />
                {opt.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant={showOsd ? "default" : "outline"}
            size="sm"
            onClick={() => onShowOsd(!showOsd)}
          >
            {showOsd ? <EyeIcon className="size-4" /> : <EyeOffIcon className="size-4" />}
            OSD
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function FeaturedViewer({
  camera,
  now,
  showOsd,
  ptz,
  muted,
  fullscreen,
  recording,
  snapshotPulse,
  onPtz,
  onZoom,
  onResetPtz,
  onToggleMute,
  onToggleFullscreen,
  onToggleRecording,
  onSnapshot,
}: {
  camera: CameraFeed;
  now: Date;
  showOsd: boolean;
  ptz: { x: number; y: number; zoom: number };
  muted: boolean;
  fullscreen: boolean;
  recording: boolean;
  snapshotPulse: boolean;
  onPtz: (d: "up" | "down" | "left" | "right") => void;
  onZoom: (delta: number) => void;
  onResetPtz: () => void;
  onToggleMute: () => void;
  onToggleFullscreen: () => void;
  onToggleRecording: () => void;
  onSnapshot: () => void;
}) {
  const Vis = visibilityMeta[camera.visibility].icon;
  const liveClock = now.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const liveDate = now.toLocaleDateString("id-ID", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <Card className="interactive-card overflow-hidden">
      <CardHeader className="border-b">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="rounded-md border bg-muted px-2 py-0.5 font-mono text-xs">
                {camera.code}
              </span>
              <StatusBadge status={camera.status} />
            </div>
            <CardTitle className="mt-1 truncate text-lg">{camera.name}</CardTitle>
            <CardDescription className="truncate">
              {camera.area} - zona {camera.zone} - {camera.coordinate}
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <Badge variant="outline" className="gap-1">
              <Vis className="size-3.5" />
              {visibilityMeta[camera.visibility].label}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <FilmIcon className="size-3.5" />
              {camera.resolution} @ {camera.fps}fps
            </Badge>
            <Badge variant="outline" className="gap-1">
              <ZapIcon className="size-3.5" />
              {camera.bitrateMbps} Mbps
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 p-3">
        <div
          className="relative aspect-video w-full overflow-hidden rounded-lg border bg-black shadow-inner"
          style={{
            backgroundImage: `url("${camera.imageUrl}")`,
            backgroundPosition: `${50 + ptz.x}% ${50 + ptz.y}%`,
            backgroundSize: `${ptz.zoom * 100}% auto`,
            backgroundRepeat: "no-repeat",
            transition: "background-position 240ms ease-out, background-size 240ms ease-out",
          }}
        >
          {/* Snapshot flash */}
          <div
            className={cn(
              "pointer-events-none absolute inset-0 z-30 bg-white transition-opacity duration-200",
              snapshotPulse ? "opacity-80" : "opacity-0",
            )}
          />

          {/* OSD top bar */}
          {showOsd ? (
            <div className="absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-3 bg-gradient-to-b from-black/65 to-transparent p-3 text-white">
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge className="border-white/20 bg-red-600 text-white hover:bg-red-600 gap-1" variant="outline">
                  <CircleDotIcon className="size-3 animate-pulse" />
                  LIVE
                </Badge>
                {recording ? (
                  <Badge className="border-white/20 bg-black/45 text-white hover:bg-black/45 gap-1" variant="outline">
                    <span className="size-2 animate-pulse rounded-full bg-red-500" />
                    REC
                  </Badge>
                ) : null}
                <Badge className="border-white/20 bg-black/45 text-white hover:bg-black/45 gap-1" variant="outline">
                  <RadioIcon className="size-3.5" />
                  {camera.code}
                </Badge>
              </div>
              <div className="text-right font-mono text-xs">
                <div className="tabular-nums">{liveClock}</div>
                <div className="text-white/70">{liveDate}</div>
              </div>
            </div>
          ) : null}

          {/* PTZ controls */}
          {camera.ptz ? (
            <div className="absolute bottom-3 left-3 z-20 flex flex-col items-center gap-1 rounded-lg border border-white/15 bg-black/45 p-2 text-white backdrop-blur-sm">
              <button
                type="button"
                onClick={() => onPtz("up")}
                className="rounded-md p-1 hover:bg-white/15 active:bg-white/25"
                aria-label="PTZ atas"
              >
                <ArrowUpIcon className="size-4" />
              </button>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onPtz("left")}
                  className="rounded-md p-1 hover:bg-white/15 active:bg-white/25"
                  aria-label="PTZ kiri"
                >
                  <ArrowLeftIcon className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={onResetPtz}
                  className="rounded-md p-1 hover:bg-white/15 active:bg-white/25"
                  aria-label="Reset PTZ"
                  title="Reset PTZ"
                >
                  <RotateCcwIcon className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onPtz("right")}
                  className="rounded-md p-1 hover:bg-white/15 active:bg-white/25"
                  aria-label="PTZ kanan"
                >
                  <ArrowRightIcon className="size-4" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => onPtz("down")}
                className="rounded-md p-1 hover:bg-white/15 active:bg-white/25"
                aria-label="PTZ bawah"
              >
                <ArrowDownIcon className="size-4" />
              </button>
              <div className="mt-1 flex items-center gap-1 border-t border-white/15 pt-1">
                <button
                  type="button"
                  onClick={() => onZoom(-0.25)}
                  className="rounded-md p-1 hover:bg-white/15"
                  aria-label="Zoom out"
                >
                  <MinusIcon className="size-3.5" />
                </button>
                <span className="min-w-9 text-center font-mono text-[10px]">
                  {ptz.zoom.toFixed(2)}x
                </span>
                <button
                  type="button"
                  onClick={() => onZoom(0.25)}
                  className="rounded-md p-1 hover:bg-white/15"
                  aria-label="Zoom in"
                >
                  <PlusIcon className="size-3.5" />
                </button>
              </div>
            </div>
          ) : null}

          {/* Bottom info OSD */}
          {showOsd ? (
            <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/70 to-transparent p-3 text-white">
              <p className="text-sm font-medium">{camera.note}</p>
              <p className="mt-1 text-[11px] text-white/70">
                Captured {camera.capturedAt} - Last maintenance {camera.lastMaintenance}
              </p>
            </div>
          ) : null}
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-muted/30 p-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <Button size="sm" variant="outline" onClick={onSnapshot}>
              <CameraIcon className="size-4" />
              Snapshot
            </Button>
            <Button
              size="sm"
              variant={recording ? "default" : "outline"}
              onClick={onToggleRecording}
            >
              <CircleDotIcon className={cn("size-4", recording && "text-red-200")} />
              {recording ? "Rekam aktif" : "Rekam"}
            </Button>
            <Button size="sm" variant="outline" onClick={onToggleMute}>
              {muted ? (
                <VolumeXIcon className="size-4" />
              ) : (
                <Volume2Icon className="size-4" />
              )}
              {muted ? "Mute" : "Audio on"}
            </Button>
            <Button size="sm" variant="outline" onClick={onToggleFullscreen}>
              {fullscreen ? (
                <MinimizeIcon className="size-4" />
              ) : (
                <MaximizeIcon className="size-4" />
              )}
              {fullscreen ? "Keluar" : "Layar penuh"}
            </Button>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <HardDriveIcon className="size-3.5" />
              Retensi {camera.storageDays} hari
            </span>
            <span className="hidden sm:flex items-center gap-1">
              <ClockIcon className="size-3.5" />
              Uptime {formatUptime(camera.uptimeHours)}
            </span>
          </div>
        </div>

        {/* Timeline scrubber */}
        <TimelineScrubber camera={camera} />
      </CardContent>
    </Card>
  );
}

function TimelineScrubber({ camera }: { camera: CameraFeed }) {
  const totalMinutes = 60 * 6; // last 6 hours window
  const marks = camera.timeline.filter((m) => m.minutesAgo <= totalMinutes);
  return (
    <div className="grid gap-2 rounded-lg border bg-card p-3">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <ClockIcon className="size-3.5" />
          Timeline 6 jam terakhir
        </span>
        <span className="font-mono">{marks.length} event</span>
      </div>
      <div className="relative h-9 rounded-md border bg-muted/40">
        <div className="absolute inset-y-0 left-0 right-0 grid grid-cols-6 px-2">
          {Array.from({ length: 7 }).map((_, idx) => (
            <div
              key={idx}
              className="border-l border-dashed border-border/60 first:border-transparent"
            />
          ))}
        </div>
        {marks.map((mark, idx) => {
          const pct = 100 - (mark.minutesAgo / totalMinutes) * 100;
          return (
            <div
              key={idx}
              className="group/mark absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${pct}%` }}
            >
              <div
                className={cn(
                  "size-3 rounded-full ring-2 ring-background",
                  statusDotClasses[mark.severity],
                )}
              />
              <div className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 rounded-md border bg-popover px-2 py-1 text-[10px] whitespace-nowrap text-popover-foreground opacity-0 shadow-md transition-opacity group-hover/mark:opacity-100">
                {mark.label} - {formatMinutesAgo(mark.minutesAgo)}
              </div>
            </div>
          );
        })}
        <div className="absolute inset-y-0 right-0 w-0.5 bg-red-500" />
      </div>
      <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
        <span>-6 jam</span>
        <span>-3 jam</span>
        <span>sekarang</span>
      </div>
    </div>
  );
}

function CameraSidebar({
  cameras,
  selectedId,
  onSelect,
}: {
  cameras: CameraFeed[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <Card className="interactive-card">
      <CardHeader className="border-b">
        <CardTitle className="text-base">Daftar Kamera</CardTitle>
        <CardDescription>{cameras.length} kamera sesuai filter</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2 p-3">
        <div className="grid max-h-[640px] gap-2 overflow-y-auto pr-1">
          {cameras.map((cam) => {
            const Vis = visibilityMeta[cam.visibility].icon;
            const active = cam.id === selectedId;
            return (
              <button
                key={cam.id}
                type="button"
                onClick={() => onSelect(cam.id)}
                className={cn(
                  "group/cam relative overflow-hidden rounded-lg border p-0 text-left transition-all hover:border-foreground/30 hover:shadow-sm",
                  active && "border-primary ring-2 ring-primary/40",
                )}
              >
                <div
                  className="relative aspect-video w-full bg-muted"
                  style={{
                    backgroundImage: `url("${cam.imageUrl}")`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-black/40" />
                  <div className="absolute inset-x-0 top-0 flex items-start justify-between p-2 text-white">
                    <Badge className="border-white/20 bg-black/45 text-[10px] text-white hover:bg-black/45" variant="outline">
                      {cam.code}
                    </Badge>
                    <span
                      className={cn(
                        "flex items-center gap-1 rounded-full bg-black/45 px-1.5 py-0.5 text-[10px]",
                      )}
                    >
                      <span
                        className={cn(
                          "size-1.5 rounded-full",
                          statusDotClasses[cam.status],
                        )}
                      />
                      {cam.status}
                    </span>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-2 text-white">
                    <span className="truncate text-xs font-medium">
                      {cam.name}
                    </span>
                    <Vis className="size-3.5 shrink-0 text-white/85" />
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 text-[11px] text-muted-foreground">
                  <span className="truncate">{cam.area}</span>
                  <span className="flex items-center gap-1 font-mono">
                    {cam.recording ? (
                      <span className="size-1.5 animate-pulse rounded-full bg-red-500" />
                    ) : null}
                    {cam.fps}fps
                  </span>
                </div>
              </button>
            );
          })}
          {cameras.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-xs text-muted-foreground">
              Tidak ada kamera cocok dengan filter.
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function MultiView({
  cameras,
  layout,
  selectedId,
  onSelect,
  onLayoutChange,
}: {
  cameras: CameraFeed[];
  layout: 1 | 4 | 9;
  selectedId: string;
  onSelect: (id: string) => void;
  onLayoutChange: (layout: 1 | 4 | 9) => void;
}) {
  const gridCols =
    layout === 1
      ? "grid-cols-1"
      : layout === 4
        ? "grid-cols-1 sm:grid-cols-2"
        : "grid-cols-2 md:grid-cols-3";
  return (
    <Card className="interactive-card">
      <CardHeader className="border-b">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base">Multi-View</CardTitle>
            <CardDescription>
              Klik tile untuk menjadikan kamera tersebut sebagai live view utama
            </CardDescription>
          </div>
          <ToggleGroup
            multiple={false}
            value={[String(layout)]}
            onValueChange={(v) => {
              const next = v[0];
              if (next) onLayoutChange(Number(next) as 1 | 4 | 9);
            }}
            variant="outline"
            size="sm"
          >
            {quickLayouts.map((opt) => (
              <ToggleGroupItem key={opt.value} value={String(opt.value)}>
                <opt.icon className="size-4" />
                {opt.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </CardHeader>
      <CardContent className={cn("grid gap-2 p-3", gridCols)}>
        {cameras.map((cam) => {
          const active = cam.id === selectedId;
          const Vis = visibilityMeta[cam.visibility].icon;
          return (
            <button
              key={cam.id}
              type="button"
              onClick={() => onSelect(cam.id)}
              className={cn(
                "group/tile relative aspect-video w-full overflow-hidden rounded-lg border bg-black text-left transition-all hover:ring-2 hover:ring-foreground/30",
                active && "ring-2 ring-primary",
              )}
              style={{
                backgroundImage: `url("${cam.imageUrl}")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="absolute inset-x-0 top-0 flex items-start justify-between bg-gradient-to-b from-black/65 to-transparent p-2 text-white">
                <span className="rounded-md border border-white/20 bg-black/45 px-1.5 py-0.5 font-mono text-[10px]">
                  {cam.code}
                </span>
                <span
                  className={cn(
                    "flex items-center gap-1 rounded-full bg-black/45 px-1.5 py-0.5 text-[10px]",
                  )}
                >
                  <span
                    className={cn("size-1.5 rounded-full", statusDotClasses[cam.status])}
                  />
                  {cam.status}
                </span>
              </div>
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent p-2 text-white">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold">{cam.name}</p>
                  <p className="truncate text-[10px] text-white/80">{cam.area}</p>
                </div>
                <Vis className="size-3.5 text-white/85" />
              </div>
              {cam.recording ? (
                <span className="absolute top-2 right-1/2 flex translate-x-1/2 items-center gap-1 rounded-full bg-red-600/90 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  <span className="size-1.5 animate-pulse rounded-full bg-white" />
                  REC
                </span>
              ) : null}
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}

function DetailsTabs({
  camera,
  timeline,
  recentEvents,
  aiDetections,
  allCameras,
  onSelect,
}: {
  camera: CameraFeed;
  timeline: CameraFeed["timeline"];
  recentEvents: Array<CameraEvent & { cameraId: string; cameraName: string }>;
  aiDetections: Array<
    CameraFeed["detections"][number] & {
      cameraId: string;
      cameraName: string;
      area: string;
    }
  >;
  allCameras: CameraFeed[];
  onSelect: (id: string) => void;
}) {
  void timeline;
  return (
    <Tabs defaultValue="detections">
      <TabsList>
        <TabsTrigger value="detections">
          <RadarIcon className="size-4" />
          Deteksi AI
        </TabsTrigger>
        <TabsTrigger value="events">
          <BellRingIcon className="size-4" />
          Event Log
        </TabsTrigger>
        <TabsTrigger value="storage">
          <HardDriveIcon className="size-4" />
          Penyimpanan
        </TabsTrigger>
        <TabsTrigger value="info">
          <RadioIcon className="size-4" />
          Detail Kamera
        </TabsTrigger>
      </TabsList>

      <TabsContent value="detections">
        <Card className="interactive-card">
          <CardHeader className="border-b">
            <CardTitle className="text-base">Deteksi AI prioritas</CardTitle>
            <CardDescription>
              Diurutkan dari severity tertinggi. Klik untuk pindah view.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 p-3 md:grid-cols-2">
            {aiDetections.map((det) => (
              <button
                key={`${det.cameraId}-${det.id}`}
                type="button"
                onClick={() => onSelect(det.cameraId)}
                className="flex items-start justify-between gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/40"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={det.severity} />
                    <span className="truncate text-sm font-medium">{det.label}</span>
                  </div>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {det.cameraName} - {det.area}
                  </p>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <p className="font-mono text-sm font-semibold tabular-nums text-foreground">
                    {Math.round(det.confidence * 100)}%
                  </p>
                  <p>confidence</p>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="events">
        <Card className="interactive-card">
          <CardHeader className="border-b">
            <CardTitle className="text-base">Event log</CardTitle>
            <CardDescription>
              Aktivitas terbaru dari seluruh kamera (klik untuk fokus)
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 p-3">
            {recentEvents.map((event) => (
              <button
                key={`${event.cameraId}-${event.id}`}
                type="button"
                onClick={() => onSelect(event.cameraId)}
                className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/40"
              >
                <span
                  className={cn(
                    "size-2.5 shrink-0 rounded-full",
                    statusDotClasses[event.severity],
                  )}
                />
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-sm">
                    <span className="font-medium">{event.type}</span>
                    <span className="text-muted-foreground">- {event.cameraName}</span>
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {event.message}
                  </p>
                </div>
                <span className="font-mono text-xs whitespace-nowrap text-muted-foreground">
                  {formatMinutesAgo(event.minutesAgo)}
                </span>
              </button>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="storage">
        <Card className="interactive-card">
          <CardHeader className="border-b">
            <CardTitle className="text-base">Storage & retensi</CardTitle>
            <CardDescription>
              Penggunaan estimasi NVR per kamera berdasarkan bitrate dan retensi
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 p-3 md:grid-cols-2">
            {allCameras.map((cam) => {
              const sizeGb =
                (cam.bitrateMbps * 60 * 60 * 24 * cam.storageDays) / 8 / 1024;
              const used = Math.min(100, Math.round((sizeGb / 2048) * 100));
              return (
                <div key={cam.id} className="rounded-lg border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{cam.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {cam.code} - {cam.area}
                      </p>
                    </div>
                    <Badge variant="outline" className="font-mono">
                      {cam.storageDays} hari
                    </Badge>
                  </div>
                  <div className="mt-3 grid gap-1.5">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Estimasi NVR</span>
                      <span className="font-mono tabular-nums">
                        {sizeGb.toFixed(0)} GB
                      </span>
                    </div>
                    <Progress value={used} />
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>{cam.bitrateMbps} Mbps</span>
                      <span>{used}% kapasitas 2 TB</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="info">
        <Card className="interactive-card">
          <CardHeader className="border-b">
            <CardTitle className="text-base">Detail kamera</CardTitle>
            <CardDescription>
              {camera.code} - {camera.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 p-3 md:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Zona", value: camera.zone },
              { label: "Area", value: camera.area },
              { label: "Koordinat", value: camera.coordinate },
              { label: "Status", value: camera.status },
              { label: "Visibilitas", value: visibilityMeta[camera.visibility].label },
              { label: "Resolusi", value: camera.resolution },
              { label: "Frame rate", value: `${camera.fps} fps` },
              { label: "Bitrate", value: `${camera.bitrateMbps} Mbps` },
              { label: "PTZ", value: camera.ptz ? "Aktif" : "Fixed" },
              { label: "Audio", value: camera.audio ? "Mendukung" : "Tidak" },
              { label: "Uptime", value: formatUptime(camera.uptimeHours) },
              { label: "Retensi", value: `${camera.storageDays} hari` },
              { label: "Last maintenance", value: camera.lastMaintenance },
              { label: "Snapshot terakhir", value: camera.capturedAt },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="mt-1 truncate text-sm font-medium">{item.value}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
