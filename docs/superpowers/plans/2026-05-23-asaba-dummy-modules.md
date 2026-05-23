# ASABA Dummy Modules Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add ASABA-inspired ADR/RTS dummy modules to the existing Mining Monitoring System without changing the current GNSS-derived layout, database schema, or live control behavior.

**Architecture:** Keep all new ASABA data in a typed local dummy module and render it through focused React components under `components/asaba`. Add new App Router pages that use the existing `AppShell`, sidebar, cards, badges, and table UI. Do not port ASABA MQTT, Prisma models, NextAuth, MapLibre, Deck.gl, or Plotly in this phase.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, shadcn-style local UI components, lucide-react icons, existing Mining Monitoring shell.

---

## Scope Check

This plan implements **Approach A: ASABA UI-first dummy module**.

It intentionally does not:

- Add live MQTT subscriptions.
- Send RTS/ADR power, start, stop, auto-search, or go-to-target commands.
- Modify `prisma/schema.prisma`.
- Add new database tables.
- Add ASABA auth or NextAuth.
- Add heavy visualization dependencies.

The existing `/gnss` and `/awlr` route identity bug has already been fixed in commit `625ce85` before this plan.
The sidebar `projects` / `Akses Cepat` section has been intentionally removed by user request and should not be reintroduced by this plan.

## File Structure

Create:

- `lib/asaba-dummy.ts`: typed dummy ASABA/ADR/RTS/prism data and helper summaries.
- `lib/asaba-mine-network.ts`: typed dummy ASABA mine network data and helper summaries for Peta Tambang.
- `components/asaba/adr-status-cards.tsx`: RTS and ADR status KPI cards.
- `components/asaba/adr-control-panel.tsx`: local-only simulated control buttons and active job state.
- `components/asaba/prism-progress-grid.tsx`: prism running progress cards.
- `components/asaba/mine-network-map.tsx`: interactive dummy Peta Tambang adapted from ASABA mine network UI.
- `components/asaba/measurement-results-table.tsx`: ADR measurement table with filters handled by page state.
- `components/asaba/prism-config-table.tsx`: prism target configuration table.
- `components/asaba/asaba-visualization.tsx`: lightweight dummy 2.5D slope/prism visualization.
- `components/asaba/rekap-summary.tsx`: rekap KPI cards and summary table.
- `app/adr-control/page.tsx`: ADR Control page.
- `app/hasil-pengukuran/page.tsx`: measurement results page.
- `app/peta-jaringan-tambang/page.tsx`: ASABA-style Peta Tambang page.
- `app/visualisasi-3d/page.tsx`: dummy 3D visualization page.
- `app/prism-config/page.tsx`: prism config page.
- `app/rekap-data/page.tsx`: rekap page.

Modify:

- `components/app-sidebar.tsx`: add ASABA/ADR group in main navigation. Do not add `projects` or quick links.
- `README.md`: mention ASABA dummy module in Phase 1/2 status.
- `rancangan_mining_monitoring_system.md`: mention ASABA dummy pages.

Do not modify:

- `prisma/schema.prisma`
- `prisma/seed.js`
- ASABA source folder under `d:\BE Software\BE PROJECT\adr_baru\asaba-nextjs`

---

### Task 1: Add ASABA Dummy Data

**Files:**
- Create: `lib/asaba-dummy.ts`

- [ ] **Step 1: Create typed ASABA dummy data**

Create `lib/asaba-dummy.ts` with exported types and constants:

```ts
export type AsabaStatus = "Normal" | "Waspada" | "Siaga" | "Awas";
export type PrismRunStatus = "Success" | "Running" | "Failed" | "Waiting";

export type AsabaRtsStatus = {
  connection: "Connected" | "Disconnected";
  power: "On" | "Off";
  battery: number;
  signal: number;
  currentJob: string;
  activeTarget: string;
  lastUpdate: string;
};

export type PrismTarget = {
  code: string;
  name: string;
  area: string;
  status: AsabaStatus;
  controllerStatus: "Active" | "Standby" | "Maintenance";
  priority: "High" | "Medium" | "Low";
  targetHeightM: number;
  baseline: { n: number; e: number; z: number };
  latest: { n: number; e: number; z: number };
  displacement2dMm: number;
  displacement3dMm: number;
  velocityMmDay: number;
  lastMeasurement: string;
};

export type AdrMeasurement = {
  id: string;
  timestamp: string;
  prismCode: string;
  targetName: string;
  area: string;
  baseline: { n: number; e: number; z: number };
  latest: { n: number; e: number; z: number };
  delta: { n: number; e: number; z: number };
  displacement2dMm: number;
  displacement3dMm: number;
  status: PrismRunStatus;
};

export type AdrSchedule = {
  day: string;
  label: string;
  time: string;
  enabled: boolean;
};

export type RekapAdrRow = {
  period: string;
  area: string;
  measurementCount: number;
  successRate: number;
  maxDisplacementMm: number;
  dominantDirection: string;
  recommendation: string;
};

export const asabaRtsStatus: AsabaRtsStatus = {
  connection: "Connected",
  power: "On",
  battery: 86,
  signal: 78,
  currentJob: "Highwall Shift 1",
  activeTarget: "PR-HW-03",
  lastUpdate: "2 menit lalu",
};

export const prismTargets: PrismTarget[] = [
  {
    code: "PR-HW-01",
    name: "Prism North Highwall 01",
    area: "North Highwall",
    status: "Siaga",
    controllerStatus: "Active",
    priority: "High",
    targetHeightM: 1.75,
    baseline: { n: 9234.125, e: 7841.442, z: 126.42 },
    latest: { n: 9234.091, e: 7841.468, z: 126.381 },
    displacement2dMm: 42.8,
    displacement3dMm: 57.9,
    velocityMmDay: 3.2,
    lastMeasurement: "2026-05-23 09:42",
  },
  {
    code: "PR-HW-02",
    name: "Prism North Highwall 02",
    area: "North Highwall",
    status: "Waspada",
    controllerStatus: "Active",
    priority: "High",
    targetHeightM: 1.72,
    baseline: { n: 9238.331, e: 7845.118, z: 125.96 },
    latest: { n: 9238.314, e: 7845.129, z: 125.942 },
    displacement2dMm: 20.2,
    displacement3dMm: 27.1,
    velocityMmDay: 1.6,
    lastMeasurement: "2026-05-23 09:43",
  },
  {
    code: "PR-DP-01",
    name: "Prism South Dump 01",
    area: "South Dump",
    status: "Waspada",
    controllerStatus: "Standby",
    priority: "Medium",
    targetHeightM: 1.65,
    baseline: { n: 9178.552, e: 7798.221, z: 118.24 },
    latest: { n: 9178.541, e: 7798.236, z: 118.218 },
    displacement2dMm: 18.6,
    displacement3dMm: 28.8,
    velocityMmDay: 1.2,
    lastMeasurement: "2026-05-23 09:45",
  },
  {
    code: "PR-PA-01",
    name: "Prism Pit A 01",
    area: "Pit A",
    status: "Normal",
    controllerStatus: "Active",
    priority: "Low",
    targetHeightM: 1.68,
    baseline: { n: 9202.441, e: 7870.334, z: 104.72 },
    latest: { n: 9202.437, e: 7870.338, z: 104.713 },
    displacement2dMm: 5.7,
    displacement3dMm: 9.0,
    velocityMmDay: 0.4,
    lastMeasurement: "2026-05-23 09:47",
  },
  {
    code: "PR-TD-01",
    name: "Prism Tailing Dam 01",
    area: "Tailing Dam",
    status: "Normal",
    controllerStatus: "Maintenance",
    priority: "Medium",
    targetHeightM: 1.8,
    baseline: { n: 9144.842, e: 7824.772, z: 113.18 },
    latest: { n: 9144.837, e: 7824.779, z: 113.171 },
    displacement2dMm: 8.6,
    displacement3dMm: 12.4,
    velocityMmDay: 0.5,
    lastMeasurement: "2026-05-23 09:48",
  },
];

export const adrMeasurements: AdrMeasurement[] = prismTargets.map((target, index) => ({
  id: `measurement-${target.code}`,
  timestamp: target.lastMeasurement,
  prismCode: target.code,
  targetName: target.name,
  area: target.area,
  baseline: target.baseline,
  latest: target.latest,
  delta: {
    n: target.latest.n - target.baseline.n,
    e: target.latest.e - target.baseline.e,
    z: target.latest.z - target.baseline.z,
  },
  displacement2dMm: target.displacement2dMm,
  displacement3dMm: target.displacement3dMm,
  status: index === 2 ? "Running" : index === 4 ? "Waiting" : "Success",
}));

export const adrSchedules: AdrSchedule[] = [
  { day: "Senin", label: "Run 1", time: "07:30", enabled: true },
  { day: "Senin", label: "Run 2", time: "13:30", enabled: true },
  { day: "Selasa", label: "Run 1", time: "07:30", enabled: true },
  { day: "Rabu", label: "Run 1", time: "07:30", enabled: false },
  { day: "Jumat", label: "Run inspeksi", time: "15:00", enabled: true },
];

export const rekapAdrRows: RekapAdrRow[] = [
  {
    period: "Hari ini",
    area: "North Highwall",
    measurementCount: 42,
    successRate: 92,
    maxDisplacementMm: 57.9,
    dominantDirection: "Timur Laut",
    recommendation: "Inspeksi highwall pada Shift 1",
  },
  {
    period: "7 hari",
    area: "South Dump",
    measurementCount: 118,
    successRate: 89,
    maxDisplacementMm: 28.8,
    dominantDirection: "Timur",
    recommendation: "Pantau tekanan air pori dan drainase disposal",
  },
  {
    period: "30 hari",
    area: "Pit A",
    measurementCount: 388,
    successRate: 96,
    maxDisplacementMm: 14.2,
    dominantDirection: "Stabil",
    recommendation: "Lanjutkan monitoring rutin",
  },
];

export function getAdrSummary() {
  const maxTarget = prismTargets.reduce((current, target) =>
    target.displacement3dMm > current.displacement3dMm ? target : current,
  );
  const activeTargets = prismTargets.filter((target) => target.controllerStatus === "Active").length;
  const successCount = adrMeasurements.filter((row) => row.status === "Success").length;

  return {
    totalTargets: prismTargets.length,
    activeTargets,
    successRate: Math.round((successCount / adrMeasurements.length) * 100),
    maxTarget,
    criticalCount: prismTargets.filter((target) => target.status === "Siaga" || target.status === "Awas").length,
  };
}
```

- [ ] **Step 2: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected: PASS.

- [ ] **Step 3: Commit dummy data**

Run:

```bash
git add lib/asaba-dummy.ts
git commit -m "feat: add asaba dummy data"
```

---

### Task 2: Add ASABA Sidebar Navigation

**Files:**
- Modify: `components/app-sidebar.tsx`

- [ ] **Step 1: Add icons**

In the `lucide-react` import, add:

```ts
PowerIcon,
```

- [ ] **Step 2: Add ASABA paths to `getData()`**

Add a new `navMain` item after the existing `Sensor` group:

```tsx
{
  title: "ADR / RTS",
  url: "/adr-control",
  icon: <PowerIcon />,
  isActive: isActive(activePath, [
    "/adr-control",
    "/hasil-pengukuran",
    "/peta-jaringan-tambang",
    "/visualisasi-3d",
    "/prism-config",
    "/rekap-data",
  ]),
  items: [
    {
      title: "ADR Control",
      url: "/adr-control",
      isActive: activePath === "/adr-control",
    },
    {
      title: "Hasil Pengukuran",
      url: "/hasil-pengukuran",
      isActive: activePath === "/hasil-pengukuran",
    },
    {
      title: "Peta Tambang",
      url: "/peta-jaringan-tambang",
      isActive: activePath === "/peta-jaringan-tambang",
    },
    {
      title: "Visualisasi 3D",
      url: "/visualisasi-3d",
      isActive: activePath === "/visualisasi-3d",
    },
    {
      title: "Prism Config",
      url: "/prism-config",
      isActive: activePath === "/prism-config",
    },
    {
      title: "Rekap Data",
      url: "/rekap-data",
      isActive: activePath === "/rekap-data",
    },
  ],
},
```

- [ ] **Step 3: Keep projects removed**

Do not import `NavProjects`, do not return a `projects` array from `getData()`, and do not render the `Akses Cepat` section. The user explicitly requested that sidebar projects be removed.

- [ ] **Step 4: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected: PASS.

- [ ] **Step 5: Commit sidebar navigation**

Run:

```bash
git add components/app-sidebar.tsx
git commit -m "feat: add asaba navigation"
```

---

### Task 3: Build ASABA Shared Components

**Files:**
- Create: `components/asaba/adr-status-cards.tsx`
- Create: `components/asaba/adr-control-panel.tsx`
- Create: `components/asaba/prism-progress-grid.tsx`

- [ ] **Step 1: Create status cards**

Create `components/asaba/adr-status-cards.tsx`:

```tsx
import { BatteryChargingIcon, RadioTowerIcon, SignalIcon, TargetIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AsabaRtsStatus } from "@/lib/asaba-dummy";

type AdrStatusCardsProps = {
  status: AsabaRtsStatus;
};

export function AdrStatusCards({ status }: AdrStatusCardsProps) {
  const cards = [
    {
      label: "RTS Connection",
      value: status.connection,
      detail: `Update ${status.lastUpdate}`,
      icon: RadioTowerIcon,
    },
    {
      label: "RTS Power",
      value: status.power,
      detail: status.currentJob,
      icon: BatteryChargingIcon,
    },
    {
      label: "Sinyal Logger",
      value: `${status.signal}%`,
      detail: `Baterai ${status.battery}%`,
      icon: SignalIcon,
    },
    {
      label: "Target Aktif",
      value: status.activeTarget,
      detail: "Prism running saat ini",
      icon: TargetIcon,
    },
  ];

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card className="interactive-card" key={card.label}>
          <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-2">
            <div>
              <CardDescription>{card.label}</CardDescription>
              <CardTitle className="text-xl tabular-nums">{card.value}</CardTitle>
            </div>
            <div className="flex size-9 items-center justify-center rounded-lg border bg-muted/40">
              <card.icon className="interactive-icon size-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <Badge variant="outline">{card.detail}</Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create control panel**

Create `components/asaba/adr-control-panel.tsx` as a client component:

```tsx
"use client";

import type { ElementType } from "react";
import { useMemo, useState } from "react";
import { PlayIcon, PowerIcon, RotateCcwIcon, SearchIcon, SquareIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdrSchedule, PrismTarget } from "@/lib/asaba-dummy";

type AdrControlPanelProps = {
  targets: PrismTarget[];
  schedules: AdrSchedule[];
};

export function AdrControlPanel({ targets, schedules }: AdrControlPanelProps) {
  const [powerOn, setPowerOn] = useState(true);
  const [running, setRunning] = useState(false);
  const [activeTarget, setActiveTarget] = useState(targets[0]?.code ?? "-");
  const activeScheduleCount = useMemo(
    () => schedules.filter((schedule) => schedule.enabled).length,
    [schedules],
  );

  function nextTarget() {
    const currentIndex = targets.findIndex((target) => target.code === activeTarget);
    const next = targets[(currentIndex + 1) % targets.length];
    if (next) setActiveTarget(next.code);
  }

  return (
    <Card className="interactive-card">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle>ADR Control</CardTitle>
            <CardDescription>Simulasi kontrol RTS dan running prism target</CardDescription>
          </div>
          <Badge variant="outline">Local dummy mode</Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Button variant={powerOn ? "default" : "outline"} onClick={() => setPowerOn(true)}>
            <PowerIcon />
            Power On
          </Button>
          <Button variant={!powerOn ? "destructive" : "outline"} onClick={() => setPowerOn(false)}>
            <PowerIcon />
            Power Off
          </Button>
          <Button disabled={!powerOn} onClick={() => setRunning(true)}>
            <PlayIcon />
            Start Running
          </Button>
          <Button disabled={!powerOn} variant="outline" onClick={() => setRunning(false)}>
            <SquareIcon />
            Stop
          </Button>
          <Button className="sm:col-span-2 xl:col-span-2" disabled={!powerOn} variant="outline" onClick={nextTarget}>
            <SearchIcon />
            Auto Search Target
          </Button>
          <Button className="sm:col-span-2 xl:col-span-2" variant="outline" onClick={() => setActiveTarget(targets[0]?.code ?? "-")}>
            <RotateCcwIcon />
            Reset Simulasi
          </Button>
        </div>
        <div className="rounded-lg border bg-muted/30 p-3">
          <p className="text-xs text-muted-foreground">Status simulasi</p>
          <div className="mt-2 grid gap-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Power</span>
              <Badge variant={powerOn ? "default" : "secondary"}>{powerOn ? "On" : "Off"}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Running</span>
              <Badge variant={running ? "default" : "outline"}>{running ? "Active" : "Idle"}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Target</span>
              <span className="font-medium">{activeTarget}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Jadwal aktif</span>
              <span className="font-medium">{activeScheduleCount} run</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 3: Create prism progress grid**

Create `components/asaba/prism-progress-grid.tsx`:

```tsx
import { Loader2Icon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdrMeasurement } from "@/lib/asaba-dummy";
import { cn } from "@/lib/utils";

type PrismProgressGridProps = {
  rows: AdrMeasurement[];
};

const statusClasses: Record<AdrMeasurement["status"], string> = {
  Success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Running: "border-blue-200 bg-blue-50 text-blue-700",
  Failed: "border-red-200 bg-red-50 text-red-700",
  Waiting: "border-muted bg-muted/40 text-muted-foreground",
};

export function PrismProgressGrid({ rows }: PrismProgressGridProps) {
  return (
    <Card className="interactive-card">
      <CardHeader className="pb-3">
        <CardTitle>Progress Prism Target</CardTitle>
        <CardDescription>Status dummy pembacaan target ADR</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((row) => (
          <div className="interactive-card rounded-lg border p-3" key={row.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">{row.prismCode}</p>
                <p className="text-xs text-muted-foreground">{row.area}</p>
              </div>
              <Badge className={cn("border", statusClasses[row.status])} variant="outline">
                {row.status === "Running" ? <Loader2Icon className="size-3 animate-spin" /> : null}
                {row.status}
              </Badge>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
              <div className="rounded-md bg-muted/40 p-2">
                <p className="text-muted-foreground">N</p>
                <p className="font-medium tabular-nums">{row.latest.n.toFixed(3)}</p>
              </div>
              <div className="rounded-md bg-muted/40 p-2">
                <p className="text-muted-foreground">E</p>
                <p className="font-medium tabular-nums">{row.latest.e.toFixed(3)}</p>
              </div>
              <div className="rounded-md bg-muted/40 p-2">
                <p className="text-muted-foreground">Z</p>
                <p className="font-medium tabular-nums">{row.latest.z.toFixed(3)}</p>
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Deformasi 3D <span className="font-semibold text-foreground">{row.displacement3dMm.toFixed(1)} mm</span>
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 4: Run checks**

Run:

```bash
npm run typecheck
npm run lint
```

Expected: typecheck PASS. Lint PASS or only existing warnings in `components/data-table.tsx` and `lib/insights.ts`.

- [ ] **Step 5: Commit shared components**

Run:

```bash
git add components/asaba/adr-status-cards.tsx components/asaba/adr-control-panel.tsx components/asaba/prism-progress-grid.tsx
git commit -m "feat: add asaba control components"
```

---

### Task 4: Add ADR Control Page

**Files:**
- Create: `app/adr-control/page.tsx`

- [ ] **Step 1: Create page**

Create `app/adr-control/page.tsx`:

```tsx
import { AdrControlPanel } from "@/components/asaba/adr-control-panel";
import { AdrStatusCards } from "@/components/asaba/adr-status-cards";
import { PrismProgressGrid } from "@/components/asaba/prism-progress-grid";
import { AppShell } from "@/components/dashboard/app-shell";
import { adrMeasurements, adrSchedules, asabaRtsStatus, prismTargets } from "@/lib/asaba-dummy";

export const dynamic = "force-dynamic";

export default function AdrControlPage() {
  return (
    <AppShell activePath="/adr-control" title="ADR Control">
      <div className="grid gap-3">
        <AdrStatusCards status={asabaRtsStatus} />
        <AdrControlPanel schedules={adrSchedules} targets={prismTargets} />
        <PrismProgressGrid rows={adrMeasurements} />
      </div>
    </AppShell>
  );
}
```

- [ ] **Step 2: Verify route**

Run:

```bash
npm run typecheck
```

Expected: PASS.

If dev server is running, request:

```powershell
Invoke-WebRequest -Uri http://localhost:3000/adr-control -UseBasicParsing
```

Expected: HTTP 200 and page contains `ADR Control`.

- [ ] **Step 3: Commit page**

Run:

```bash
git add app/adr-control/page.tsx
git commit -m "feat: add adr control page"
```

---

### Task 5: Add Peta Tambang Data And Page

**Files:**
- Create: `lib/asaba-mine-network.ts`
- Create: `components/asaba/mine-network-map.tsx`
- Create: `app/peta-jaringan-tambang/page.tsx`

- [ ] **Step 1: Create mine network data**

Create `lib/asaba-mine-network.ts`:

```ts
export type MineNetworkSensorType =
  | "tiltmeter"
  | "crack-meter"
  | "piezometer"
  | "rain-gauge"
  | "vibration"
  | "adr";

export type MineNetworkSensorStatus = "normal" | "caution" | "danger";

export type MineNetworkSensor = {
  id: string;
  name: string;
  type: MineNetworkSensorType;
  status: MineNetworkSensorStatus;
  zone: string;
  criticalPoint: string;
  x: number;
  y: number;
  value: number;
  unit: string;
  threshold: string;
  trend: "naik" | "stabil" | "turun";
  lastUpdate: string;
  battery: number;
  signal: number;
  note: string;
};

export const mineNetworkTypeLabels: Record<MineNetworkSensorType, string> = {
  tiltmeter: "Tiltmeter",
  "crack-meter": "Crack Meter",
  piezometer: "Piezometer",
  "rain-gauge": "Rain Gauge",
  vibration: "Vibration",
  adr: "ADR",
};

export const mineNetworkSensors: MineNetworkSensor[] = [
  {
    id: "TLT-HW-01",
    name: "Tiltmeter North Highwall",
    type: "tiltmeter",
    status: "caution",
    zone: "North Highwall",
    criticalPoint: "Bench 740",
    x: 26,
    y: 24,
    value: 3.8,
    unit: "deg",
    threshold: "3.0-5.0 deg",
    trend: "naik",
    lastUpdate: "10:42",
    battery: 88,
    signal: 92,
    note: "Kemiringan meningkat setelah hujan shift pagi.",
  },
  {
    id: "ADR-HW-01",
    name: "ADR North Highwall 01",
    type: "adr",
    status: "danger",
    zone: "North Highwall",
    criticalPoint: "Highwall Crest",
    x: 70,
    y: 30,
    value: 57.9,
    unit: "mm",
    threshold: "> 50 mm",
    trend: "naik",
    lastUpdate: "10:45",
    battery: 76,
    signal: 82,
    note: "Target ADR masuk prioritas inspeksi geoteknik.",
  },
  {
    id: "PZ-DP-01",
    name: "Piezometer South Dump",
    type: "piezometer",
    status: "caution",
    zone: "South Dump",
    criticalPoint: "Dump Toe",
    x: 22,
    y: 72,
    value: 31.4,
    unit: "kPa",
    threshold: "25-38 kPa",
    trend: "naik",
    lastUpdate: "10:40",
    battery: 72,
    signal: 75,
    note: "Tekanan air pori naik, korelasikan dengan drainase disposal.",
  },
  {
    id: "CRK-PA-01",
    name: "Crack Meter Pit A",
    type: "crack-meter",
    status: "normal",
    zone: "Pit A",
    criticalPoint: "Crest A",
    x: 48,
    y: 42,
    value: 6.1,
    unit: "mm",
    threshold: "< 10 mm",
    trend: "stabil",
    lastUpdate: "10:44",
    battery: 93,
    signal: 94,
    note: "Retakan minor dan stabil.",
  },
  {
    id: "ARR-HW-01",
    name: "Rain Gauge Ridge",
    type: "rain-gauge",
    status: "normal",
    zone: "North Highwall",
    criticalPoint: "Weather Ridge",
    x: 60,
    y: 15,
    value: 3.2,
    unit: "mm/h",
    threshold: "< 10 mm/h",
    trend: "turun",
    lastUpdate: "10:45",
    battery: 95,
    signal: 91,
    note: "Hujan ringan, belum memicu alarm hidrologi.",
  },
  {
    id: "VIB-CR-01",
    name: "Vibration Crusher Line",
    type: "vibration",
    status: "normal",
    zone: "Crusher",
    criticalPoint: "Conveyor Transfer",
    x: 84,
    y: 40,
    value: 2.2,
    unit: "mm/s",
    threshold: "< 3.0 mm/s",
    trend: "stabil",
    lastUpdate: "10:34",
    battery: 81,
    signal: 87,
    note: "Getaran alat masih di bawah ambang.",
  },
  {
    id: "ADR-DP-01",
    name: "ADR South Dump 01",
    type: "adr",
    status: "caution",
    zone: "South Dump",
    criticalPoint: "Dump Crest",
    x: 38,
    y: 66,
    value: 28.8,
    unit: "mm",
    threshold: "20-50 mm",
    trend: "naik",
    lastUpdate: "10:43",
    battery: 84,
    signal: 79,
    note: "Displacement disposal meningkat perlahan.",
  },
  {
    id: "PZ-TD-01",
    name: "Piezometer Tailing Dam",
    type: "piezometer",
    status: "normal",
    zone: "Tailing Dam",
    criticalPoint: "Dam Toe",
    x: 76,
    y: 68,
    value: 18.2,
    unit: "kPa",
    threshold: "< 25 kPa",
    trend: "stabil",
    lastUpdate: "10:36",
    battery: 86,
    signal: 78,
    note: "Tekanan air pori masih dalam rentang normal.",
  },
];

export const mineNetworkLines: Array<[string, string]> = [
  ["ARR-HW-01", "TLT-HW-01"],
  ["TLT-HW-01", "ADR-HW-01"],
  ["ADR-HW-01", "CRK-PA-01"],
  ["CRK-PA-01", "ADR-DP-01"],
  ["ADR-DP-01", "PZ-DP-01"],
  ["ADR-DP-01", "PZ-TD-01"],
  ["ADR-HW-01", "VIB-CR-01"],
];

export function getMineNetworkStatusSummary(sensors: MineNetworkSensor[]) {
  return sensors.reduce(
    (summary, sensor) => {
      summary.total += 1;
      summary[sensor.status] += 1;
      return summary;
    },
    { total: 0, normal: 0, caution: 0, danger: 0 },
  );
}

export function getMineNetworkTypeSummary(sensors: MineNetworkSensor[]) {
  return sensors.reduce(
    (summary, sensor) => {
      summary[sensor.type] += 1;
      return summary;
    },
    {
      tiltmeter: 0,
      "crack-meter": 0,
      piezometer: 0,
      "rain-gauge": 0,
      vibration: 0,
      adr: 0,
    } satisfies Record<MineNetworkSensorType, number>,
  );
}

export function formatMineNetworkValue(sensor: MineNetworkSensor) {
  return `${sensor.value.toLocaleString("id-ID", {
    maximumFractionDigits: 1,
    minimumFractionDigits: Number.isInteger(sensor.value) ? 0 : 1,
  })} ${sensor.unit}`;
}
```

- [ ] **Step 2: Create mine network map component**

Create `components/asaba/mine-network-map.tsx`:

```tsx
"use client";

import { useMemo, useState } from "react";
import {
  ActivityIcon,
  BatteryIcon,
  CloudRainIcon,
  CrosshairIcon,
  GaugeIcon,
  Layers3Icon,
  MapPinIcon,
  RulerIcon,
  SearchIcon,
  SignalIcon,
  SlidersHorizontalIcon,
  TriangleAlertIcon,
  WavesIcon,
  XIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
} from "@/lib/asaba-mine-network";
import { cn } from "@/lib/utils";

const sensorTypes: MineNetworkSensorType[] = [
  "tiltmeter",
  "crack-meter",
  "piezometer",
  "rain-gauge",
  "vibration",
  "adr",
];

const sensorTypeIcons = {
  tiltmeter: GaugeIcon,
  "crack-meter": RulerIcon,
  piezometer: WavesIcon,
  "rain-gauge": CloudRainIcon,
  vibration: ActivityIcon,
  adr: CrosshairIcon,
} satisfies Record<MineNetworkSensorType, ElementType>;

const sensorTypeColors = {
  tiltmeter: "#2f6fed",
  "crack-meter": "#c05621",
  piezometer: "#0891b2",
  "rain-gauge": "#2563eb",
  vibration: "#7c3aed",
  adr: "#15803d",
} satisfies Record<MineNetworkSensorType, string>;

const statusStyles = {
  normal: { label: "Normal", dot: "bg-emerald-500", text: "text-emerald-700", border: "border-emerald-200", bg: "bg-emerald-50", ring: "ring-emerald-400" },
  caution: { label: "Waspada", dot: "bg-amber-500", text: "text-amber-700", border: "border-amber-200", bg: "bg-amber-50", ring: "ring-amber-400" },
  danger: { label: "Awas", dot: "bg-red-500", text: "text-red-700", border: "border-red-200", bg: "bg-red-50", ring: "ring-red-500" },
} satisfies Record<MineNetworkSensorStatus, { label: string; dot: string; text: string; border: string; bg: string; ring: string }>;

function getSensorById(id: string) {
  return mineNetworkSensors.find((sensor) => sensor.id === id);
}

function StatusPill({ status }: { status: MineNetworkSensorStatus }) {
  const style = statusStyles[status];

  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-semibold", style.bg, style.border, style.text)}>
      <span className={cn("h-2 w-2 rounded-full", style.dot)} />
      {style.label}
    </span>
  );
}

function SensorMarker({
  sensor,
  selected,
  onSelect,
}: {
  sensor: MineNetworkSensor;
  selected: boolean;
  onSelect: (sensor: MineNetworkSensor) => void;
}) {
  const Icon = sensorTypeIcons[sensor.type];
  const color = sensorTypeColors[sensor.type];
  const status = statusStyles[sensor.status];

  return (
    <button
      className={cn(
        "absolute z-20 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 bg-white shadow-md transition hover:scale-110 focus-visible:outline-none focus-visible:ring-4",
        selected && "scale-110 ring-4",
        status.ring,
      )}
      onClick={() => onSelect(sensor)}
      style={{ left: `${sensor.x}%`, top: `${sensor.y}%`, borderColor: color }}
      title={`${sensor.id} - ${sensor.name}`}
      type="button"
    >
      <span className={cn("absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white", status.dot)} />
      <Icon className="h-4 w-4" style={{ color }} />
    </button>
  );
}

export function MineNetworkMap() {
  const [selectedType, setSelectedType] = useState<MineNetworkSensorType | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(mineNetworkSensors[0]?.id ?? null);
  const [query, setQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(true);
  const [legendOpen, setLegendOpen] = useState(false);
  const statusSummary = getMineNetworkStatusSummary(mineNetworkSensors);
  const typeSummary = getMineNetworkTypeSummary(mineNetworkSensors);

  const filteredSensors = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return mineNetworkSensors.filter((sensor) => {
      const matchesType = selectedType === "all" || sensor.type === selectedType;
      const matchesQuery =
        !normalizedQuery ||
        sensor.name.toLowerCase().includes(normalizedQuery) ||
        sensor.id.toLowerCase().includes(normalizedQuery) ||
        sensor.zone.toLowerCase().includes(normalizedQuery);
      return matchesType && matchesQuery;
    });
  }, [query, selectedType]);

  const selectedSensor = selectedId
    ? mineNetworkSensors.find((sensor) => sensor.id === selectedId) ?? null
    : null;

  const prioritySensors = mineNetworkSensors
    .filter((sensor) => sensor.status !== "normal")
    .sort((a, b) => (a.status === "danger" ? -1 : 1) - (b.status === "danger" ? -1 : 1));

  return (
    <section className="relative min-h-[calc(100vh-7rem)] overflow-hidden rounded-lg border bg-[#e8eef0]">
      <div className="absolute inset-0">
        <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <pattern id="asaba-mine-grid" width="8" height="8" patternUnits="userSpaceOnUse">
              <path d="M 8 0 L 0 0 0 8" fill="none" stroke="#cbd5e1" strokeWidth="0.18" opacity="0.5" />
            </pattern>
            <linearGradient id="asaba-pit-outer" x1="20" y1="20" x2="86" y2="72" gradientUnits="userSpaceOnUse">
              <stop stopColor="#f6fafc" />
              <stop offset="0.5" stopColor="#d2dde6" />
              <stop offset="1" stopColor="#93a6b8" />
            </linearGradient>
            <linearGradient id="asaba-pit-floor" x1="40" y1="43" x2="65" y2="57" gradientUnits="userSpaceOnUse">
              <stop stopColor="#8fa3b6" />
              <stop offset="1" stopColor="#41576c" />
            </linearGradient>
          </defs>
          <rect width="100" height="100" fill="#e8eef0" />
          <rect width="100" height="100" fill="url(#asaba-mine-grid)" />
          <path d="M0 66 L11 55 L24 51 L36 63 L34 78 L18 91 L0 100 Z" fill="#c6d7cb" />
          <path d="M73 0 L100 0 L100 44 L92 47 L84 41 L78 24 Z" fill="#d9e8dc" />
          <path d="M16 27 L30 18 L55 13 L76 18 L88 29 L93 43 L88 57 L75 68 L54 75 L32 70 L17 58 L10 43 Z" fill="#d7e0e6" stroke="#b5c3cd" strokeWidth="0.65" />
          <path d="M19 30 L33 22 L55 17 L74 21 L86 31 L90 43 L84 56 L72 65 L53 70 L34 66 L21 56 L14 43 Z" fill="url(#asaba-pit-outer)" stroke="#9fb1c0" strokeWidth="0.95" />
          <path d="M24 38 L39 30 L58 27 L73 32 L81 42 L78 53 L66 61 L49 64 L34 58 L25 49 Z" fill="#bdcbd7" stroke="#91a5b7" strokeWidth="0.78" />
          <path d="M33 44 L45 38 L60 36 L70 41 L73 49 L65 56 L50 59 L39 55 L32 49 Z" fill="#a9bac8" stroke="#7f94a8" strokeWidth="0.72" />
          <path d="M41 47 L51 43 L61 44 L66 49 L61 54 L50 56 L42 53 Z" fill="url(#asaba-pit-floor)" stroke="#5d7389" strokeWidth="0.68" />
          <path d="M4 88 C18 79 30 73 43 64 C56 56 68 46 83 34 C89 29 94 23 98 18" fill="none" stroke="#9aa9b9" strokeWidth="2.05" strokeLinecap="round" />
          <path d="M5 86 C19 78 32 71 44 62 C57 54 69 44 84 33 C90 28 94 22 99 17" fill="none" stroke="#ffffff" strokeWidth="0.7" strokeLinecap="round" strokeDasharray="2.3 2.3" />
        </svg>
      </div>

      <div className="pointer-events-none absolute left-4 right-4 top-4 z-30 flex flex-wrap items-start justify-between gap-3">
        <div className="pointer-events-auto rounded-lg border bg-white/95 px-3 py-2 shadow-sm backdrop-blur">
          <div className="flex items-center gap-2 text-xs font-bold text-[#303481]">
            <MapPinIcon className="h-4 w-4" />
            Peta Tambang ASABA
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">{statusSummary.total} titik sensor dummy</p>
        </div>
        <div className="pointer-events-auto flex gap-2">
          <Button variant={filterOpen ? "default" : "outline"} size="sm" onClick={() => setFilterOpen((open) => !open)}>
            <SlidersHorizontalIcon className="h-4 w-4" />
            Filter
          </Button>
          <Button variant={legendOpen ? "default" : "outline"} size="sm" onClick={() => setLegendOpen((open) => !open)}>
            <Layers3Icon className="h-4 w-4" />
            Legenda
          </Button>
        </div>
      </div>

      {legendOpen ? (
        <div className="absolute left-4 top-20 z-40 w-[280px] rounded-lg border bg-white/95 p-4 shadow-sm backdrop-blur">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold">Legenda</h3>
            <button className="rounded-md p-1 text-muted-foreground hover:bg-muted" onClick={() => setLegendOpen(false)} type="button">
              <XIcon className="h-4 w-4" />
            </button>
          </div>
          <div className="mb-3 flex flex-wrap gap-2">
            {(["normal", "caution", "danger"] as MineNetworkSensorStatus[]).map((status) => (
              <StatusPill key={status} status={status} />
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {sensorTypes.map((type) => {
              const Icon = sensorTypeIcons[type];
              return (
                <Badge key={type} variant="outline" className="gap-1.5">
                  <Icon className="h-3.5 w-3.5" style={{ color: sensorTypeColors[type] }} />
                  {mineNetworkTypeLabels[type]}
                </Badge>
              );
            })}
          </div>
        </div>
      ) : null}

      <svg className="pointer-events-none absolute inset-0 z-10 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {mineNetworkLines.map(([fromId, toId]) => {
          const from = getSensorById(fromId);
          const to = getSensorById(toId);
          if (!from || !to) return null;
          return (
            <line
              key={`${fromId}-${toId}`}
              x1={from.x}
              x2={to.x}
              y1={from.y}
              y2={to.y}
              stroke="#475569"
              strokeDasharray="1.5 1.2"
              strokeOpacity="0.34"
              strokeWidth="0.45"
            />
          );
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

      {filterOpen ? (
        <div className="absolute left-4 top-24 z-30 max-h-[calc(100%-7rem)] w-[286px] space-y-3 overflow-auto pr-1">
          <section className="rounded-lg border bg-white/95 p-4 shadow-sm backdrop-blur">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-bold">Filter Sensor</h3>
              <button className="rounded-md p-1 text-muted-foreground hover:bg-muted" onClick={() => setFilterOpen(false)} type="button">
                <XIcon className="h-4 w-4" />
              </button>
            </div>
            <label className="mt-3 flex h-9 items-center gap-2 rounded-md border bg-background/80 px-3 text-sm">
              <SearchIcon className="h-4 w-4 text-muted-foreground" />
              <input
                className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cari ID, zona, sensor"
                value={query}
              />
            </label>
            <div className="mt-3 grid gap-2">
              <Button className="justify-start" onClick={() => setSelectedType("all")} variant={selectedType === "all" ? "default" : "outline"}>
                Semua Sensor
                <span className="ml-auto text-xs">{statusSummary.total}</span>
              </Button>
              {sensorTypes.map((type) => {
                const Icon = sensorTypeIcons[type];
                return (
                  <Button className="justify-start" key={type} onClick={() => setSelectedType(type)} variant={selectedType === type ? "default" : "outline"}>
                    <Icon className="h-4 w-4" />
                    {mineNetworkTypeLabels[type]}
                    <span className="ml-auto text-xs">{typeSummary[type]}</span>
                  </Button>
                );
              })}
            </div>
          </section>
          <section className="rounded-lg border bg-white/95 p-3 shadow-sm backdrop-blur">
            <h3 className="text-sm font-bold">Prioritas Inspeksi</h3>
            <div className="mt-2 space-y-2">
              {prioritySensors.map((sensor) => (
                <button className="w-full rounded-md border bg-white/80 p-2 text-left transition hover:bg-muted/70" key={sensor.id} onClick={() => setSelectedId(sensor.id)} type="button">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold">{sensor.id}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{sensor.criticalPoint}</p>
                    </div>
                    <StatusPill status={sensor.status} />
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>
      ) : null}

      {selectedSensor ? (
        <aside className="absolute right-4 top-24 z-30 max-h-[calc(100%-7rem)] w-[310px] overflow-auto rounded-lg border bg-white/94 p-3.5 shadow-sm backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{selectedSensor.id}</p>
              <h3 className="mt-0.5 text-base font-bold leading-tight">{selectedSensor.name}</h3>
            </div>
            <StatusPill status={selectedSensor.status} />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-md border bg-muted/25 p-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Nilai</p>
              <p className="mt-1 text-base font-bold">{formatMineNetworkValue(selectedSensor)}</p>
            </div>
            <div className="rounded-md border bg-muted/25 p-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Trend</p>
              <p className="mt-1 text-base font-bold capitalize">{selectedSensor.trend}</p>
            </div>
          </div>
          <dl className="mt-3 grid gap-2 text-xs">
            <div className="flex justify-between gap-3 border-b pb-2"><dt className="text-muted-foreground">Tipe</dt><dd className="font-semibold">{mineNetworkTypeLabels[selectedSensor.type]}</dd></div>
            <div className="flex justify-between gap-3 border-b pb-2"><dt className="text-muted-foreground">Zona</dt><dd className="font-semibold">{selectedSensor.zone}</dd></div>
            <div className="flex justify-between gap-3 border-b pb-2"><dt className="text-muted-foreground">Titik kritis</dt><dd className="text-right font-semibold">{selectedSensor.criticalPoint}</dd></div>
            <div className="flex justify-between gap-3 border-b pb-2"><dt className="text-muted-foreground">Ambang</dt><dd className="font-semibold">{selectedSensor.threshold}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Update</dt><dd className="font-semibold">{selectedSensor.lastUpdate}</dd></div>
          </dl>
          <p className="mt-3 rounded-md border bg-muted/25 p-2.5 text-xs leading-relaxed text-muted-foreground">{selectedSensor.note}</p>
          <div className="mt-3 grid gap-2 text-xs">
            <div className="flex items-center justify-between"><span className="flex items-center gap-1.5 text-muted-foreground"><BatteryIcon className="h-3.5 w-3.5" /> Battery</span><strong>{selectedSensor.battery}%</strong></div>
            <div className="flex items-center justify-between"><span className="flex items-center gap-1.5 text-muted-foreground"><SignalIcon className="h-3.5 w-3.5" /> Signal</span><strong>{selectedSensor.signal}%</strong></div>
          </div>
        </aside>
      ) : null}
    </section>
  );
}
```

- [ ] **Step 3: Create Peta Tambang page**

Create `app/peta-jaringan-tambang/page.tsx`:

```tsx
import { MineNetworkMap } from "@/components/asaba/mine-network-map";
import { AppShell } from "@/components/dashboard/app-shell";

export const dynamic = "force-dynamic";

export default function PetaJaringanTambangPage() {
  return (
    <AppShell activePath="/peta-jaringan-tambang" contentPadding={false} title="Peta Tambang">
      <MineNetworkMap />
    </AppShell>
  );
}
```

- [ ] **Step 4: Verify Peta Tambang**

Run:

```bash
npm run typecheck
npm run lint
```

Expected: typecheck PASS. Lint PASS or only existing warnings.

If dev server is running:

```powershell
Invoke-WebRequest -Uri http://localhost:3000/peta-jaringan-tambang -UseBasicParsing
```

Expected: HTTP 200 and page contains `Peta Tambang`.

- [ ] **Step 5: Commit Peta Tambang**

Run:

```bash
git add lib/asaba-mine-network.ts components/asaba/mine-network-map.tsx app/peta-jaringan-tambang/page.tsx
git commit -m "feat: add asaba mine network map"
```

---

### Task 6: Add Measurement, Prism Config, and Rekap Components

**Files:**
- Create: `components/asaba/measurement-results-table.tsx`
- Create: `components/asaba/prism-config-table.tsx`
- Create: `components/asaba/rekap-summary.tsx`

- [ ] **Step 1: Create measurement table**

Create `components/asaba/measurement-results-table.tsx`:

```tsx
"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AdrMeasurement } from "@/lib/asaba-dummy";

type MeasurementResultsTableProps = {
  rows: AdrMeasurement[];
};

function mm(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)} mm`;
}

export function MeasurementResultsTable({ rows }: MeasurementResultsTableProps) {
  const [area, setArea] = useState("all");
  const areas = useMemo(() => ["all", ...Array.from(new Set(rows.map((row) => row.area)))], [rows]);
  const filteredRows = area === "all" ? rows : rows.filter((row) => row.area === area);

  return (
    <Card className="interactive-card">
      <CardHeader className="gap-3 pb-3 md:flex-row md:items-start md:justify-between">
        <div>
          <CardTitle>Hasil Pengukuran ADR</CardTitle>
          <CardDescription>Data dummy pembacaan prism target tambang</CardDescription>
        </div>
        <Select value={area} onValueChange={setArea} items={areas.map((value) => ({ value, label: value === "all" ? "Semua area" : value }))}>
          <SelectTrigger className="w-full md:w-[220px]" size="sm" aria-label="Filter area pengukuran">
            <SelectValue placeholder="Area" />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectGroup>
              {areas.map((value) => (
                <SelectItem key={value} value={value}>
                  {value === "all" ? "Semua area" : value}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Waktu</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Area</TableHead>
              <TableHead>N/E/Z</TableHead>
              <TableHead>Delta N/E/Z</TableHead>
              <TableHead>2D</TableHead>
              <TableHead>3D</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.timestamp}</TableCell>
                <TableCell>{row.prismCode}</TableCell>
                <TableCell>{row.area}</TableCell>
                <TableCell>{row.latest.n.toFixed(3)} / {row.latest.e.toFixed(3)} / {row.latest.z.toFixed(3)}</TableCell>
                <TableCell>{mm(row.delta.n * 1000)} / {mm(row.delta.e * 1000)} / {mm(row.delta.z * 1000)}</TableCell>
                <TableCell>{row.displacement2dMm.toFixed(1)} mm</TableCell>
                <TableCell>{row.displacement3dMm.toFixed(1)} mm</TableCell>
                <TableCell><Badge variant="outline">{row.status}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Create prism config table**

Create `components/asaba/prism-config-table.tsx`:

```tsx
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { PrismTarget } from "@/lib/asaba-dummy";

type PrismConfigTableProps = {
  targets: PrismTarget[];
};

export function PrismConfigTable({ targets }: PrismConfigTableProps) {
  return (
    <Card className="interactive-card">
      <CardHeader className="pb-3">
        <CardTitle>Prism Config</CardTitle>
        <CardDescription>Konfigurasi dummy baseline dan target prism ADR</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kode</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Area</TableHead>
              <TableHead>Target Height</TableHead>
              <TableHead>Baseline N/E/Z</TableHead>
              <TableHead>Controller</TableHead>
              <TableHead>Prioritas</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {targets.map((target) => (
              <TableRow key={target.code}>
                <TableCell className="font-medium">{target.code}</TableCell>
                <TableCell>{target.name}</TableCell>
                <TableCell>{target.area}</TableCell>
                <TableCell>{target.targetHeightM.toFixed(2)} m</TableCell>
                <TableCell>{target.baseline.n.toFixed(3)} / {target.baseline.e.toFixed(3)} / {target.baseline.z.toFixed(3)}</TableCell>
                <TableCell><Badge variant="outline">{target.controllerStatus}</Badge></TableCell>
                <TableCell><Badge variant="outline">{target.priority}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 3: Create rekap summary**

Create `components/asaba/rekap-summary.tsx`:

```tsx
import { ActivityIcon, AlertTriangleIcon, GaugeIcon, TargetIcon } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { RekapAdrRow } from "@/lib/asaba-dummy";
import { getAdrSummary } from "@/lib/asaba-dummy";

type RekapSummaryProps = {
  rows: RekapAdrRow[];
};

export function RekapSummary({ rows }: RekapSummaryProps) {
  const summary = getAdrSummary();
  const cards = [
    { label: "Total Prism", value: summary.totalTargets, detail: `${summary.activeTargets} active`, icon: TargetIcon },
    { label: "Success Rate", value: `${summary.successRate}%`, detail: "Dummy pengukuran", icon: GaugeIcon },
    { label: "Max Deformasi", value: `${summary.maxTarget.displacement3dMm.toFixed(1)} mm`, detail: summary.maxTarget.code, icon: ActivityIcon },
    { label: "Perlu Inspeksi", value: summary.criticalCount, detail: "Status siaga/awas", icon: AlertTriangleIcon },
  ];

  return (
    <div className="grid gap-3">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Card className="interactive-card" key={card.label}>
            <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-2">
              <div>
                <CardDescription>{card.label}</CardDescription>
                <CardTitle className="text-xl tabular-nums">{card.value}</CardTitle>
              </div>
              <card.icon className="interactive-icon size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">{card.detail}</CardContent>
          </Card>
        ))}
      </div>
      <Card className="interactive-card">
        <CardHeader className="pb-3">
          <CardTitle>Rekap Data ADR</CardTitle>
          <CardDescription>Ringkasan dummy pengukuran per periode dan area</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Periode</TableHead>
                <TableHead>Area</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Success Rate</TableHead>
                <TableHead>Max Deformasi</TableHead>
                <TableHead>Arah Dominan</TableHead>
                <TableHead>Rekomendasi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={`${row.period}-${row.area}`}>
                  <TableCell className="font-medium">{row.period}</TableCell>
                  <TableCell>{row.area}</TableCell>
                  <TableCell>{row.measurementCount}</TableCell>
                  <TableCell>{row.successRate}%</TableCell>
                  <TableCell>{row.maxDisplacementMm.toFixed(1)} mm</TableCell>
                  <TableCell>{row.dominantDirection}</TableCell>
                  <TableCell>{row.recommendation}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 4: Run checks**

Run:

```bash
npm run typecheck
npm run lint
```

Expected: typecheck PASS. Lint PASS or only existing warnings.

- [ ] **Step 5: Commit table components**

Run:

```bash
git add components/asaba/measurement-results-table.tsx components/asaba/prism-config-table.tsx components/asaba/rekap-summary.tsx
git commit -m "feat: add asaba data tables"
```

---

### Task 7: Add ASABA Data Pages

**Files:**
- Create: `app/hasil-pengukuran/page.tsx`
- Create: `app/prism-config/page.tsx`
- Create: `app/rekap-data/page.tsx`

- [ ] **Step 1: Create Hasil Pengukuran page**

Create `app/hasil-pengukuran/page.tsx`:

```tsx
import { MeasurementResultsTable } from "@/components/asaba/measurement-results-table";
import { AppShell } from "@/components/dashboard/app-shell";
import { adrMeasurements } from "@/lib/asaba-dummy";

export const dynamic = "force-dynamic";

export default function HasilPengukuranPage() {
  return (
    <AppShell activePath="/hasil-pengukuran" title="Hasil Pengukuran">
      <MeasurementResultsTable rows={adrMeasurements} />
    </AppShell>
  );
}
```

- [ ] **Step 2: Create Prism Config page**

Create `app/prism-config/page.tsx`:

```tsx
import { PrismConfigTable } from "@/components/asaba/prism-config-table";
import { AppShell } from "@/components/dashboard/app-shell";
import { prismTargets } from "@/lib/asaba-dummy";

export const dynamic = "force-dynamic";

export default function PrismConfigPage() {
  return (
    <AppShell activePath="/prism-config" title="Prism Config">
      <PrismConfigTable targets={prismTargets} />
    </AppShell>
  );
}
```

- [ ] **Step 3: Create Rekap Data page**

Create `app/rekap-data/page.tsx`:

```tsx
import { RekapSummary } from "@/components/asaba/rekap-summary";
import { AppShell } from "@/components/dashboard/app-shell";
import { rekapAdrRows } from "@/lib/asaba-dummy";

export const dynamic = "force-dynamic";

export default function RekapDataPage() {
  return (
    <AppShell activePath="/rekap-data" title="Rekap Data">
      <RekapSummary rows={rekapAdrRows} />
    </AppShell>
  );
}
```

- [ ] **Step 4: Verify routes**

Run:

```bash
npm run typecheck
```

Expected: PASS.

If dev server is running, request:

```powershell
Invoke-WebRequest -Uri http://localhost:3000/hasil-pengukuran -UseBasicParsing
Invoke-WebRequest -Uri http://localhost:3000/prism-config -UseBasicParsing
Invoke-WebRequest -Uri http://localhost:3000/rekap-data -UseBasicParsing
```

Expected: each returns HTTP 200.

- [ ] **Step 5: Commit pages**

Run:

```bash
git add app/hasil-pengukuran/page.tsx app/prism-config/page.tsx app/rekap-data/page.tsx
git commit -m "feat: add asaba data pages"
```

---

### Task 8: Add Lightweight 3D Visualization

**Files:**
- Create: `components/asaba/asaba-visualization.tsx`
- Create: `app/visualisasi-3d/page.tsx`

- [ ] **Step 1: Create visualization component**

Create `components/asaba/asaba-visualization.tsx` as a client component:

```tsx
"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { PrismTarget } from "@/lib/asaba-dummy";

type AsabaVisualizationProps = {
  targets: PrismTarget[];
};

const positions = [
  { x: 16, y: 62 },
  { x: 34, y: 44 },
  { x: 54, y: 58 },
  { x: 70, y: 34 },
  { x: 84, y: 52 },
];

export function AsabaVisualization({ targets }: AsabaVisualizationProps) {
  const [selectedCode, setSelectedCode] = useState(targets[0]?.code ?? "");
  const selectedTarget = useMemo(
    () => targets.find((target) => target.code === selectedCode) ?? targets[0],
    [selectedCode, targets],
  );

  return (
    <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_320px]">
      <Card className="interactive-card overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle>Visualisasi 3D Deformasi</CardTitle>
          <CardDescription>Dummy prism network pada lereng tambang</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative min-h-[420px] overflow-hidden rounded-lg border bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_48%,#d8b98a_49%,#9f6f3b_100%)]">
            <div className="absolute left-[8%] top-[18%] h-16 w-16 rounded-full border bg-background shadow-sm" />
            <div className="absolute left-[10%] top-[22%] text-[11px] font-medium">RTS-01</div>
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0 62 C20 46 34 48 48 58 C64 70 78 54 100 42 L100 100 L0 100 Z" fill="rgba(120, 82, 40, 0.32)" />
              <path d="M0 72 C24 58 42 64 58 70 C76 78 88 64 100 58" fill="none" stroke="rgba(61, 42, 24, 0.28)" strokeWidth="1.4" />
              {targets.map((target, index) => {
                const position = positions[index % positions.length];
                return (
                  <line
                    key={`line-${target.code}`}
                    x1="16"
                    y1="26"
                    x2={position.x}
                    y2={position.y}
                    stroke={target.code === selectedCode ? "rgba(37, 99, 235, 0.85)" : "rgba(71, 85, 105, 0.35)"}
                    strokeDasharray="2 2"
                    strokeWidth="0.55"
                  />
                );
              })}
            </svg>
            {targets.map((target, index) => {
              const position = positions[index % positions.length];
              const color = target.status === "Siaga" ? "bg-red-500" : target.status === "Waspada" ? "bg-amber-500" : "bg-emerald-500";
              return (
                <button
                  className="absolute -translate-x-1/2 -translate-y-1/2 text-left"
                  key={target.code}
                  onClick={() => setSelectedCode(target.code)}
                  style={{ left: `${position.x}%`, top: `${position.y}%` }}
                  type="button"
                >
                  <span className={`block size-4 rounded-full border-2 border-white shadow ${color}`} />
                  <span className="mt-1 block rounded bg-background/90 px-1.5 py-0.5 text-[11px] font-medium shadow-sm">{target.code}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
      <Card className="interactive-card">
        <CardHeader className="pb-3">
          <CardTitle>Detail Target</CardTitle>
          <CardDescription>{selectedTarget?.name}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {selectedTarget ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="outline">{selectedTarget.status}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Area</span>
                <span className="font-medium">{selectedTarget.area}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Deformasi 2D</span>
                <span className="font-medium">{selectedTarget.displacement2dMm.toFixed(1)} mm</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Deformasi 3D</span>
                <span className="font-medium">{selectedTarget.displacement3dMm.toFixed(1)} mm</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Velocity</span>
                <span className="font-medium">{selectedTarget.velocityMmDay.toFixed(1)} mm/hari</span>
              </div>
              <div className="rounded-lg border bg-muted/35 p-3 text-xs text-muted-foreground">
                Visual ini dummy dan tidak mengirim command ke RTS.
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Create page**

Create `app/visualisasi-3d/page.tsx`:

```tsx
import { AsabaVisualization } from "@/components/asaba/asaba-visualization";
import { AppShell } from "@/components/dashboard/app-shell";
import { prismTargets } from "@/lib/asaba-dummy";

export const dynamic = "force-dynamic";

export default function Visualisasi3dPage() {
  return (
    <AppShell activePath="/visualisasi-3d" title="Visualisasi 3D">
      <AsabaVisualization targets={prismTargets} />
    </AppShell>
  );
}
```

- [ ] **Step 3: Verify route**

Run:

```bash
npm run typecheck
npm run lint
```

Expected: typecheck PASS. Lint PASS or only existing warnings.

If dev server is running:

```powershell
Invoke-WebRequest -Uri http://localhost:3000/visualisasi-3d -UseBasicParsing
```

Expected: HTTP 200 and page contains `Visualisasi 3D`.

- [ ] **Step 4: Commit visualization**

Run:

```bash
git add components/asaba/asaba-visualization.tsx app/visualisasi-3d/page.tsx
git commit -m "feat: add asaba visualization page"
```

---

### Task 9: Documentation and Full Verification

**Files:**
- Modify: `README.md`
- Modify: `rancangan_mining_monitoring_system.md`

- [ ] **Step 1: Update README**

In `README.md`, add these bullets under the implemented status list:

```md
- Modul dummy ASABA/ADR: ADR Control, Hasil Pengukuran, Peta Tambang, Visualisasi 3D, Prism Config, dan Rekap Data.
- Simulasi dummy RTS/prism target tanpa command MQTT asli.
```

Add this bullet under the not-yet list:

```md
- Port penuh MQTT/control RTS dari `asaba-nextjs`.
```

- [ ] **Step 2: Update mining design document**

In `rancangan_mining_monitoring_system.md`, add a section:

```md
## Modul ASABA Dummy

Phase 2 Approach A menambahkan halaman dummy ADR/RTS:

- ADR Control
- Hasil Pengukuran
- Peta Tambang
- Visualisasi 3D
- Prism Config
- Rekap Data

Modul ini memakai data dummy dan belum mengirim command MQTT/control ke perangkat RTS.
```

- [ ] **Step 3: Run full verification**

Run:

```bash
npm run check:mining-copy
npm run typecheck
npm run lint
npm run build
```

Expected:

- `check:mining-copy`: PASS.
- `typecheck`: PASS.
- `lint`: exit 0 with only known warnings in `components/data-table.tsx` and `lib/insights.ts`.
- `build`: PASS.

- [ ] **Step 4: Smoke test routes**

If dev server is running, run:

```powershell
$routes = @(
  "http://localhost:3000/adr-control",
  "http://localhost:3000/hasil-pengukuran",
  "http://localhost:3000/peta-jaringan-tambang",
  "http://localhost:3000/visualisasi-3d",
  "http://localhost:3000/prism-config",
  "http://localhost:3000/rekap-data",
  "http://localhost:3000/gnss",
  "http://localhost:3000/awlr"
)
foreach ($route in $routes) {
  $response = Invoke-WebRequest -Uri $route -UseBasicParsing -MaximumRedirection 5
  "$route -> $($response.StatusCode)"
}
```

Expected: every route returns `200`.

- [ ] **Step 5: Commit docs**

Run:

```bash
git add README.md rancangan_mining_monitoring_system.md
git commit -m "docs: document asaba dummy modules"
```

---

## Final Acceptance Criteria

- Existing Mining Monitoring pages still render.
- `/gnss` appears as Deformasi Lereng.
- `/awlr` appears as Air & Cuaca.
- Sidebar includes ADR / RTS module entries, including Peta Tambang.
- `/adr-control` renders dummy control/status/progress panels.
- `/hasil-pengukuran` renders ADR measurement results.
- `/peta-jaringan-tambang` renders a nonblank interactive dummy mine network map.
- `/visualisasi-3d` renders a nonblank lightweight dummy slope/prism visualization.
- `/prism-config` renders prism target config.
- `/rekap-data` renders ADR summary and rekap table.
- No live MQTT/control command is sent.
- No Prisma schema changes are made.
- Verification commands pass:
  - `npm run check:mining-copy`
  - `npm run typecheck`
  - `npm run lint`
  - `npm run build`
