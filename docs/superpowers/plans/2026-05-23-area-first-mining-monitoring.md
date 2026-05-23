# Area-First Mining Monitoring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework the Mining Monitoring System so operators start from mine areas, then inspect the sensors, alarms, and risk signals inside each area.

**Architecture:** Keep the existing Next.js App Router, `AppShell`, cards, badges, tables, and chart styling. Add a typed area-first catalog layer that combines ASABA mine-network data with mining dummy sensors missing from ASABA, then use that catalog for Area Tambang pages and Peta Tambang. Refactor `/gnss` and `/awlr` into direct-render routes instead of redirect aliases.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Prisma-backed existing dashboard data, local typed dummy catalog, lucide-react icons, existing UI primitives.

---

## Scope Notes

This plan implements the approved area-first direction. It does not add real MQTT, real sensor ingestion, or Prisma schema changes.

The working tree currently has an intentional local sidebar change that removes `projects` / `Akses Cepat`. Do not accidentally commit that removal unless the user explicitly allows it. When staging sidebar changes, stage only area-first navigation hunks.

## File Structure

Create:

- `lib/mining-area-catalog.ts`: unified area-first local catalog, ASABA adapter, dummy missing sensors, and helper functions.
- `components/mining/area-overview-grid.tsx`: compact area overview cards.
- `components/mining/area-sensor-table.tsx`: latest sensor readings table for one area.
- `components/mining/area-detail-view.tsx`: area detail composition.
- `app/area-tambang/page.tsx`: area overview route.
- `app/area-tambang/[areaId]/page.tsx`: area detail route.
- `components/dashboard/sensor-analysis-page.tsx`: shared GNSS/AWLR analysis renderer extracted from `app/analisa-data/page.tsx`.

Modify:

- `lib/asaba-mine-network.ts`: align ASABA geotechnical sensor data with `asaba-nextjs/src/lib/mine-network.ts`.
- `components/asaba/mine-network-map.tsx`: use the area-first catalog for all map markers.
- `app/peta-jaringan-tambang/page.tsx`: keep route but pass area-first data if needed.
- `app/gnss/page.tsx`: render direct analysis view.
- `app/awlr/page.tsx`: render direct analysis view.
- `app/analisa-data/page.tsx`: keep compatibility by rendering the same shared analysis view based on query.
- `components/app-sidebar.tsx`: add `Area Tambang` and keep `Peta Tambang` in primary navigation; do not reintroduce projects.
- `README.md` and `rancangan_mining_monitoring_system.md`: document area-first direction.

---

### Task 1: Sync ASABA Mine-Network Data

**Files:**
- Modify: `lib/asaba-mine-network.ts`

- [ ] **Step 1: Replace local custom 9-sensor data with ASABA source data**

Use `d:\BE Software\BE PROJECT\adr_baru\asaba-nextjs\src\lib\mine-network.ts` as source of truth for:

- sensor type union: `tiltmeter`, `crack-meter`, `piezometer`, `rain-gauge`, `vibration`, `gnss`
- 18 ASABA sensor rows: `TLT-01`, `TLT-02`, `TLT-03`, `CRK-01`, `CRK-02`, `CRK-03`, `PZO-01`, `PZO-02`, `PZO-03`, `RNG-01`, `RNG-02`, `RNG-03`, `VIB-01`, `VIB-02`, `VIB-03`, `GNS-01`, `GNS-02`, `GNS-03`
- helper behavior for status summary, type summary, value formatting, 3D projection, geo projection, and priority summary

Keep local compatibility export names:

```ts
export type MineNetworkSensorType = MineSensorType
export type MineNetworkSensorStatus = MineSensorStatus
export const mineNetworkTypeLabels = mineSensorTypeLabels
export const getMineNetworkStatusSummary = getMineSensorStatusSummary
export const getMineNetworkTypeSummary = getMineSensorTypeSummary
export const formatMineNetworkValue = formatMineSensorValue
```

- [ ] **Step 2: Add network lines matching ASABA component**

Export this exact connection list from `lib/asaba-mine-network.ts`:

```ts
export const mineNetworkLines: Array<[string, string]> = [
  ["TLT-01", "VIB-01"],
  ["VIB-01", "CRK-01"],
  ["CRK-01", "PZO-01"],
  ["PZO-01", "VIB-03"],
  ["VIB-03", "TLT-03"],
  ["TLT-03", "GNS-02"],
  ["PZO-01", "GNS-03"],
  ["GNS-03", "CRK-02"],
  ["CRK-02", "RNG-02"],
  ["GNS-03", "GNS-01"],
  ["GNS-01", "TLT-02"],
  ["TLT-02", "PZO-02"],
  ["PZO-02", "VIB-02"],
  ["VIB-02", "RNG-03"],
  ["TLT-02", "RNG-01"],
]
```

- [ ] **Step 3: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected: PASS.

- [ ] **Step 4: Commit**

Run:

```bash
git add lib/asaba-mine-network.ts
git commit -m "feat: sync asaba mine network data"
```

---

### Task 2: Add Area-First Mining Catalog

**Files:**
- Create: `lib/mining-area-catalog.ts`

- [ ] **Step 1: Create typed model**

Create `lib/mining-area-catalog.ts` with:

```ts
import {
  mineNetworkSensors,
  type MineNetworkSensor,
  type MineNetworkSensorStatus,
} from "@/lib/asaba-mine-network"

export type MiningAreaStatus = "Normal" | "Waspada" | "Siaga" | "Awas"

export type MiningSensorType =
  | "tiltmeter"
  | "crack-meter"
  | "piezometer"
  | "rain-gauge"
  | "vibration"
  | "gnss"
  | "adr"
  | "awlr"
  | "awqr"
  | "aws"
  | "cctv"
  | "dust"
  | "noise"
  | "gas"

export type MiningSensorSource = "asaba" | "mining-dummy"

export type MiningSensor = Omit<MineNetworkSensor, "type" | "status"> & {
  type: MiningSensorType
  status: MineNetworkSensorStatus
  source: MiningSensorSource
  areaId: string
  functionLabel: string
}

export type MiningArea = {
  id: string
  name: string
  description: string
  status: MiningAreaStatus
  riskScore: number
  focus: string
  nextInspection: string
  mapCenter: { x: number; y: number }
  sensorIds: string[]
}
```

- [ ] **Step 2: Add area mapping for ASABA sensors**

Map ASABA zones to area ids:

```ts
const asabaZoneToAreaId: Record<string, string> = {
  "Pit Utara": "north-highwall",
  "Pit Timur": "pit-a",
  "Waste Dump": "south-dump",
  "Pit Barat": "south-dump",
  "Ramp Selatan": "pit-b-haul-road",
  "Pit Tengah": "pit-a",
  Ridge: "north-highwall",
  Office: "crusher-conveyor",
  Crusher: "crusher-conveyor",
  "Ramp Utama": "pit-b-haul-road",
}
```

- [ ] **Step 3: Add dummy sensors for missing systems**

Add dummy sensors for AWLR, AWQR, AWS, ADR, CCTV, Dust, Noise, and Gas using the same field shape as ASABA sensors. Required ids:

- `ADR-HW-01`, North Highwall
- `ADR-DP-01`, South Dump
- `AWLR-SP-01`, Settling Pond
- `AWQR-SP-01`, Settling Pond
- `AWS-PA-01`, Pit A
- `CCTV-HW-01`, North Highwall
- `CCTV-SP-01`, Settling Pond
- `DST-HR-01`, Pit B / Haul Road
- `NOI-CR-01`, Crusher / Conveyor
- `GAS-UG-01`, UG Portal

Use these status/value anchors:

- `ADR-HW-01`: `status: "danger"`, `value: 57.9`, `unit: "mm"`, `threshold: "> 50 mm"`
- `ADR-DP-01`: `status: "caution"`, `value: 28.8`, `unit: "mm"`, `threshold: "20-50 mm"`
- `AWLR-SP-01`: `status: "caution"`, `value: 3.18`, `unit: "m"`, `threshold: "3.0-3.5 m"`
- `AWQR-SP-01`: `status: "normal"`, `value: 7.2`, `unit: "pH"`, `threshold: "6.5-8.5 pH"`
- `AWS-PA-01`: `status: "normal"`, `value: 30.4`, `unit: "C"`, `threshold: "< 35 C"`
- `CCTV-HW-01`: `status: "normal"`, `value: 1`, `unit: "online"`, `threshold: "online"`
- `CCTV-SP-01`: `status: "caution"`, `value: 49`, `unit: "% battery"`, `threshold: "< 50% battery"`
- `DST-HR-01`: `status: "caution"`, `value: 148`, `unit: "ug/m3"`, `threshold: "120-180 ug/m3"`
- `NOI-CR-01`: `status: "normal"`, `value: 68`, `unit: "dBA"`, `threshold: "< 85 dBA"`
- `GAS-UG-01`: `status: "danger"`, `value: 72`, `unit: "ppm CO"`, `threshold: "> 70 ppm CO"`

- [ ] **Step 4: Add helper functions**

Export these functions:

```ts
export function getMiningSensors(): MiningSensor[]
export function getMiningAreas(): MiningArea[]
export function getMiningAreaById(areaId: string): MiningArea | undefined
export function getSensorsByArea(areaId: string): MiningSensor[]
export function getAreaStatusCounts(areaId: string): { total: number; normal: number; caution: number; danger: number }
export function getPrioritySensors(areaId?: string): MiningSensor[]
```

- [ ] **Step 5: Verify catalog**

Run:

```bash
npm run typecheck
```

Expected: PASS.

- [ ] **Step 6: Commit**

Run:

```bash
git add lib/mining-area-catalog.ts
git commit -m "feat: add area-first mining catalog"
```

---

### Task 3: Add Area Tambang Pages

**Files:**
- Create: `components/mining/area-overview-grid.tsx`
- Create: `components/mining/area-sensor-table.tsx`
- Create: `components/mining/area-detail-view.tsx`
- Create: `app/area-tambang/page.tsx`
- Create: `app/area-tambang/[areaId]/page.tsx`

- [ ] **Step 1: Build area overview cards**

Create `components/mining/area-overview-grid.tsx` as a server-safe component that accepts `areas` and renders compact cards using `Card`, `Badge`, and `Button` link actions. Each card must show area name, status, risk score, focus, sensor count, critical/warning count, and next inspection.

- [ ] **Step 2: Build area sensor table**

Create `components/mining/area-sensor-table.tsx` with columns:

- Sensor
- Fungsi
- Status
- Nilai
- Ambang
- Trend
- Update
- Telemetry

Use existing `Table` components and the same compact visual style as `app/analisa-data/page.tsx`.

- [ ] **Step 3: Build detail view**

Create `components/mining/area-detail-view.tsx` that composes:

- area header
- KPI cards
- priority sensor list
- sensor table
- simple trend placeholder for latest values

- [ ] **Step 4: Add `/area-tambang` route**

Create `app/area-tambang/page.tsx`:

```tsx
import { AreaOverviewGrid } from "@/components/mining/area-overview-grid"
import { AppShell } from "@/components/dashboard/app-shell"
import { getMiningAreas } from "@/lib/mining-area-catalog"

export const dynamic = "force-dynamic"

export default function AreaTambangPage() {
  return (
    <AppShell activePath="/area-tambang" title="Area Tambang">
      <AreaOverviewGrid areas={getMiningAreas()} />
    </AppShell>
  )
}
```

- [ ] **Step 5: Add `/area-tambang/[areaId]` route**

Create `app/area-tambang/[areaId]/page.tsx` with `notFound()` when the area id is unknown. Render `AreaDetailView`.

- [ ] **Step 6: Verify routes**

Run:

```bash
npm run typecheck
npm run lint
```

Expected: typecheck PASS. Lint exits 0 with only existing warnings.

If dev server is running:

```powershell
Invoke-WebRequest -Uri http://localhost:3000/area-tambang -UseBasicParsing
Invoke-WebRequest -Uri http://localhost:3000/area-tambang/north-highwall -UseBasicParsing
```

Expected: both return HTTP 200.

- [ ] **Step 7: Commit**

Run:

```bash
git add components/mining/area-overview-grid.tsx components/mining/area-sensor-table.tsx components/mining/area-detail-view.tsx app/area-tambang/page.tsx app/area-tambang/[areaId]/page.tsx
git commit -m "feat: add area tambang views"
```

---

### Task 4: Update Peta Tambang to Use Area Catalog

**Files:**
- Modify: `components/asaba/mine-network-map.tsx`

- [ ] **Step 1: Replace data imports**

Import `getMiningSensors`, `getMiningAreas`, `getPrioritySensors`, and `MiningSensorType` from `lib/mining-area-catalog.ts`.

- [ ] **Step 2: Add area filter**

Add local state:

```ts
const [selectedAreaId, setSelectedAreaId] = useState<string | "all">("all")
```

Filter markers by both type and area id.

- [ ] **Step 3: Extend icon/color mappings**

Support these sensor types:

- `tiltmeter`
- `crack-meter`
- `piezometer`
- `rain-gauge`
- `vibration`
- `gnss`
- `adr`
- `awlr`
- `awqr`
- `aws`
- `cctv`
- `dust`
- `noise`
- `gas`

- [ ] **Step 4: Show area in marker detail**

The selected marker panel must show:

- sensor id
- sensor name
- function label
- area name
- critical point
- value
- threshold
- battery
- signal

- [ ] **Step 5: Verify**

Run:

```bash
npm run typecheck
npm run lint
```

Expected: typecheck PASS. Lint exits 0 with only existing warnings.

If dev server is running:

```powershell
Invoke-WebRequest -Uri http://localhost:3000/peta-jaringan-tambang -UseBasicParsing
```

Expected: HTTP 200 and content contains `Peta Tambang`.

- [ ] **Step 6: Commit**

Run:

```bash
git add components/asaba/mine-network-map.tsx
git commit -m "feat: use area catalog in mine map"
```

---

### Task 5: Refactor GNSS and AWLR Route Behavior

**Files:**
- Create: `components/dashboard/sensor-analysis-page.tsx`
- Modify: `app/analisa-data/page.tsx`
- Modify: `app/gnss/page.tsx`
- Modify: `app/awlr/page.tsx`

- [ ] **Step 1: Extract shared renderer**

Move the render logic currently inside `app/analisa-data/page.tsx` into `components/dashboard/sensor-analysis-page.tsx`.

Export:

```ts
export type SensorAnalysisSearchParams = {
  [key: string]: string | string[] | undefined
}

export async function SensorAnalysisPage({
  mode,
  searchParams,
}: {
  mode: "gnss" | "awlr"
  searchParams: SensorAnalysisSearchParams
}) {
  // existing GNSS/AWLR rendering logic
}
```

- [ ] **Step 2: Keep `/analisa-data` as compatibility**

Make `app/analisa-data/page.tsx` resolve `mode` from query and render:

```tsx
return <SensorAnalysisPage mode={mode} searchParams={params} />
```

- [ ] **Step 3: Make `/gnss` direct-render**

Replace redirect in `app/gnss/page.tsx` with:

```tsx
import { SensorAnalysisPage } from "@/components/dashboard/sensor-analysis-page"

export const dynamic = "force-dynamic"

type GnssPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function GnssPage({ searchParams }: GnssPageProps) {
  return <SensorAnalysisPage mode="gnss" searchParams={await searchParams} />
}
```

- [ ] **Step 4: Make `/awlr` direct-render**

Replace redirect in `app/awlr/page.tsx` with the same pattern and `mode="awlr"`.

- [ ] **Step 5: Verify URL behavior**

Run:

```bash
npm run typecheck
npm run lint
```

Expected: typecheck PASS. Lint exits 0 with only existing warnings.

If dev server is running:

```powershell
$gnss = Invoke-WebRequest -Uri http://localhost:3000/gnss -UseBasicParsing -MaximumRedirection 0
$awlr = Invoke-WebRequest -Uri http://localhost:3000/awlr -UseBasicParsing -MaximumRedirection 0
"GNSS=$($gnss.StatusCode)"
"AWLR=$($awlr.StatusCode)"
```

Expected: both return `200`; neither route returns a redirect status.

- [ ] **Step 6: Commit**

Run:

```bash
git add components/dashboard/sensor-analysis-page.tsx app/analisa-data/page.tsx app/gnss/page.tsx app/awlr/page.tsx
git commit -m "fix: render gnss and awlr routes directly"
```

---

### Task 6: Update Sidebar and Docs

**Files:**
- Modify: `components/app-sidebar.tsx`
- Modify: `README.md`
- Modify: `rancangan_mining_monitoring_system.md`

- [ ] **Step 1: Add area-first navigation**

In the `Monitoring` nav group, include:

```tsx
{
  title: "Peta Tambang",
  url: "/peta-jaringan-tambang",
  isActive: activePath === "/peta-jaringan-tambang",
},
{
  title: "Area Tambang",
  url: "/area-tambang",
  isActive: activePath.startsWith("/area-tambang"),
},
```

Keep `Sensor Geoteknik`, `Deformasi Lereng`, and `Air & Cuaca` available, but they should be secondary compared with area navigation.

- [ ] **Step 2: Preserve projects removal state**

Do not re-add `NavProjects`, `projects`, or `Akses Cepat`.

When committing, either:

- stage only the new area navigation hunk if the user still does not want projects removal committed, or
- ask the user for permission to commit the full sidebar cleanup.

- [ ] **Step 3: Update docs**

Document:

- area-first monitoring direction
- ASABA geotechnical data source
- dummy additions for AWLR, AWQR, AWS, ADR, CCTV, Dust, Noise, Gas
- `/gnss` and `/awlr` direct-render behavior

- [ ] **Step 4: Run full verification**

Run:

```bash
npm run check:mining-copy
npm run typecheck
npm run lint
npm run build
```

Expected:

- mining copy check PASS
- typecheck PASS
- lint exits 0 with only existing warnings
- build PASS

- [ ] **Step 5: Commit allowed files**

If sidebar projects removal is still not approved for commit, stage docs and only the area nav hunk. Do not stage `tsconfig.tsbuildinfo` or generated `next-env.d.ts` noise.

Commit:

```bash
git commit -m "docs: document area-first monitoring system"
```

---

## Final Acceptance Criteria

- Area Tambang exists as a first-class route.
- `/area-tambang` shows an area-first overview.
- `/area-tambang/north-highwall` and at least five other area detail routes render.
- Peta Tambang markers come from the unified area-first catalog.
- ASABA source sensors keep original ids such as `TLT-01`, `CRK-01`, `PZO-01`, `RNG-01`, `VIB-01`, and `GNS-01`.
- Missing mining systems are represented with dummy sensors: AWLR, AWQR, AWS, ADR, CCTV, Dust, Noise, and Gas.
- `/gnss` and `/awlr` return HTTP 200 directly without redirecting to `/analisa-data`.
- Sidebar exposes Peta Tambang and Area Tambang.
- Existing dashboard, alarm, perangkat, laporan, and peta monitoring routes still render.
- Verification commands pass:
  - `npm run check:mining-copy`
  - `npm run typecheck`
  - `npm run lint`
  - `npm run build`
