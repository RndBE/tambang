# Mining Monitoring System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the existing GNSS coastal dashboard into a Phase 1 full mining monitoring dashboard named **Mining Monitoring System** using dummy mining site data and the current GNSS layout/styling.

**Architecture:** Keep the existing Next.js App Router, Prisma, dashboard shell, cards, map, charts, alarm, report, device, and settings patterns. Rework the UI-facing domain through metadata, navigation, DTO labels, seed values, and page copy while leaving deep schema redesign and ASABA ADR/RTS migration for future phases.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Prisma/MySQL, Tailwind CSS v4, shadcn-style UI components, Recharts, Leaflet.

---

## Scope Check

This plan implements Phase 1 only. It intentionally does not migrate MQTT, prism control, or full ADR/RTS logic from `asaba-nextjs`. The result should be a working mining command center backed by dummy mining data, with the same UI composition and visual feel as the current `gnss` dashboard.

## File Structure

Primary files to modify:

- `package.json`: add a copy-scan verification script.
- `scripts/check-mining-copy.mjs`: fail if old coastal terms remain in UI-facing files.
- `app/layout.tsx`: app metadata and description.
- `app/login/page.tsx`: login brand text.
- `components/login-form.tsx`: seeded account hint.
- `components/login-monitoring-visual.tsx`: login-side monitoring visual text and metrics.
- `components/app-sidebar.tsx`: navigation labels, routes, user identity, quick links, localStorage key.
- `components/section-cards.tsx`: command-center KPI labels.
- `components/dashboard/trend-charts.tsx`: mining trend chart labels.
- `components/dashboard/risk-panel.tsx`: slope stability risk panel labels.
- `components/dashboard/data-logger-list.tsx`: sensor/logger labels and links.
- `components/dashboard/cctv-grid.tsx`: CCTV mining labels.
- `components/dashboard/leaflet-risk-map.tsx`: map legend and visible map labels.
- `components/dashboard/data-analysis-filter-bar.tsx`: mode labels.
- `components/dashboard/gnss-filter-bar.tsx`: deformation/ADR labels.
- `components/dashboard/insight-panel.tsx`: mode labels.
- `components/dashboard/risk-weight-manager.tsx`: risk weight text.
- `components/dashboard/alarm-threshold-manager.tsx`: threshold text.
- `app/page.tsx`: dashboard composition remains, but props may be renamed only if needed.
- `app/peta-risiko/page.tsx`: page title becomes Peta Monitoring.
- `app/analisa-data/page.tsx`: visible labels become deformation and water/weather analysis.
- `app/gnss/page.tsx`: redirect remains but query label is treated as deformation.
- `app/awlr/page.tsx`: redirect remains but page label is mine water level.
- `app/cctv/page.tsx`: mining CCTV copy.
- `app/analisis-risiko/page.tsx`: slope stability copy.
- `app/laporan/page.tsx`: mining report copy.
- `app/perangkat/page.tsx`: mining device copy.
- `app/pengaturan/page.tsx`: mining settings copy.
- `app/api/map/points/route.ts`: map layer labels.
- `app/api/reports/daily/route.ts`: CSV filename and headers.
- `app/api/reports/generate/route.ts`: default report area.
- `app/api/reports/[id]/download/route.ts`: generated report text.
- `lib/types.ts`: add mining-friendly aliases while keeping existing internal names where safer.
- `lib/backend/queries.ts`: convert returned labels and computed summaries to mining terms.
- `lib/insights.ts`: convert visible insight messages to deformation/slope terms.
- `prisma/seed.js`: replace all seed names, areas, devices, alarms, reports, thresholds, and risk weights with dummy mining data.
- `README.md`: update setup and project description to Mining Monitoring System.

Do not rename database enum values or Prisma model names in Phase 1 unless a small type-only alias is enough. This keeps the migration small and lowers database risk.

---

### Task 1: Add Copy Scan Guard

**Files:**
- Modify: `package.json`
- Create: `scripts/check-mining-copy.mjs`

- [ ] **Step 1: Add the verification script file**

Create `scripts/check-mining-copy.mjs` with this content:

```js
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const roots = ["app", "components", "lib", "prisma", "README.md"];
const forbidden = [
  "pesisir",
  "pantura",
  "rob",
  "coastal monitor",
  "dashboard pemantauan penurunan",
  "muka air laut",
  "penurunan tanah",
  "tide gauge",
  "pasang",
];

const extensions = new Set([".ts", ".tsx", ".js", ".md"]);
const allowFiles = new Set([
  "prisma/schema.prisma",
  "docs/superpowers/specs/2026-05-23-mining-monitoring-system-design.md",
  "docs/superpowers/plans/2026-05-23-mining-monitoring-system.md",
]);

function extname(path) {
  const index = path.lastIndexOf(".");
  return index === -1 ? "" : path.slice(index);
}

function walk(path) {
  const stat = statSync(path);
  if (stat.isFile()) return [path];
  return readdirSync(path).flatMap((entry) => walk(join(path, entry)));
}

const files = roots.flatMap((root) => walk(root));
const hits = [];

for (const file of files) {
  const normalized = relative(process.cwd(), file).replaceAll("\\\\", "/");
  if (allowFiles.has(normalized)) continue;
  if (!extensions.has(extname(normalized))) continue;

  const lines = readFileSync(file, "utf8").split(/\r?\n/);
  lines.forEach((line, index) => {
    const lower = line.toLowerCase();
    for (const term of forbidden) {
      if (lower.includes(term)) {
        hits.push(`${normalized}:${index + 1}: ${term}: ${line.trim()}`);
      }
    }
  });
}

if (hits.length > 0) {
  console.error("Found old coastal dashboard terms:");
  console.error(hits.join("\n"));
  process.exit(1);
}

console.log("Mining copy scan passed.");
```

- [ ] **Step 2: Add the package script**

In `package.json`, update the scripts block to include:

```json
"check:mining-copy": "node scripts/check-mining-copy.mjs"
```

Place it after `"typecheck": "tsc --noEmit"` so the verification scripts stay grouped.

- [ ] **Step 3: Run the copy scan and confirm it fails before conversion**

Run:

```bash
npm run check:mining-copy
```

Expected: FAIL with old terms such as `pesisir`, `pantura`, `rob`, or `muka air laut`.

- [ ] **Step 4: Commit the guard**

Run:

```bash
git add package.json scripts/check-mining-copy.mjs
git commit -m "test: add mining copy scan"
```

---

### Task 2: Rebrand App Shell, Login, and Navigation

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/login/page.tsx`
- Modify: `components/login-form.tsx`
- Modify: `components/login-monitoring-visual.tsx`
- Modify: `components/app-sidebar.tsx`

- [ ] **Step 1: Update app metadata**

In `app/layout.tsx`, replace the metadata object with:

```ts
export const metadata: Metadata = {
  title: "Mining Monitoring System",
  description:
    "Sistem monitoring tambang untuk sensor geoteknik, kestabilan lereng, deformasi, air, cuaca, CCTV, debu, kebisingan, dan gas.",
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }],
    shortcut: ["/favicon.png"],
    apple: [{ url: "/favicon.png", type: "image/png" }],
  },
};
```

- [ ] **Step 2: Update login brand**

In `app/login/page.tsx`, replace:

```tsx
<span>Coastal Monitor</span>
```

with:

```tsx
<span>Mining Monitoring System</span>
```

- [ ] **Step 3: Update login seeded account hint**

In `components/login-form.tsx`, replace the storage key and seed hint:

```ts
window.localStorage.setItem("mining:user", JSON.stringify(payload.user))
```

and:

```tsx
<FieldDescription>
  Akun seed: operator@mining.local / operator123
</FieldDescription>
```

- [ ] **Step 4: Update sidebar user, storage key, navigation, and quick links**

In `components/app-sidebar.tsx`, replace the visible data returned by `getData()` with mining labels:

```tsx
user: {
  name: "Operator Tambang",
  email: "operator@mining.local",
  avatar: "",
},
navMain: [
  {
    title: "Monitoring",
    url: "/",
    icon: <GaugeIcon />,
    isActive: isActive(activePath, [
      "/",
      "/peta-risiko",
      "/analisa-data",
      "/gnss",
      "/awlr",
      "/cctv",
    ]),
    items: [
      { title: "Dashboard", url: "/", isActive: activePath === "/" },
      {
        title: "Peta Monitoring",
        url: "/peta-risiko",
        isActive: activePath === "/peta-risiko",
      },
      {
        title: "Sensor Geoteknik",
        url: "/analisa-data",
        isActive:
          activePath === "/analisa-data" ||
          activePath === "/gnss" ||
          activePath === "/awlr",
      },
      { title: "CCTV Monitoring", url: "/cctv", isActive: activePath === "/cctv" },
    ],
  },
  {
    title: "Sensor",
    url: "/perangkat",
    icon: <RadioTowerIcon />,
    isActive: isActive(activePath, ["/perangkat", "/gnss", "/awlr"]),
    items: [
      {
        title: "Perangkat Sensor",
        url: "/perangkat",
        isActive: activePath === "/perangkat",
      },
      {
        title: "Deformasi Lereng",
        url: "/gnss",
        isActive: activePath === "/gnss",
      },
      {
        title: "Air & Cuaca",
        url: "/awlr",
        isActive: activePath === "/awlr",
      },
    ],
  },
  {
    title: "Operasional",
    url: "/alarm",
    icon: <BellIcon />,
    isActive: isActive(activePath, ["/alarm", "/analisis-risiko"]),
    items: [
      { title: "Alarm & Event", url: "/alarm", isActive: activePath === "/alarm" },
      {
        title: "Analisis Risiko",
        url: "/analisis-risiko",
        isActive: activePath === "/analisis-risiko",
      },
    ],
  },
  {
    title: "Administrasi",
    url: "/laporan",
    icon: <Settings2Icon />,
    isActive: isActive(activePath, ["/laporan", "/pengaturan"]),
    items: [
      { title: "Laporan", url: "/laporan", isActive: activePath === "/laporan" },
      {
        title: "Pengaturan",
        url: "/pengaturan",
        isActive: activePath === "/pengaturan",
      },
    ],
  },
],
projects: [
  {
    name: "Data Logger",
    url: "/perangkat",
    icon: <DatabaseIcon />,
    isActive: activePath === "/perangkat",
  },
  {
    name: "Air & Cuaca",
    url: "/analisa-data?sensor=awlr",
    icon: <WavesIcon />,
    isActive: activePath === "/awlr",
  },
  {
    name: "Peta Monitoring",
    url: "/peta-risiko",
    icon: <MapIcon />,
    isActive: activePath === "/peta-risiko",
  },
  {
    name: "CCTV Monitoring",
    url: "/cctv",
    icon: <CameraIcon />,
    isActive: activePath === "/cctv",
  },
  {
    name: "Export Laporan",
    url: "/laporan",
    icon: <FileChartColumnIcon />,
    isActive: activePath === "/laporan",
  },
  {
    name: "Analisis Risiko",
    url: "/analisis-risiko",
    icon: <ActivityIcon />,
    isActive: activePath === "/analisis-risiko",
  },
],
```

Also replace:

```ts
const storedUser = window.localStorage.getItem("gnss:user")
```

with:

```ts
const storedUser = window.localStorage.getItem("mining:user")
```

and replace:

```ts
window.localStorage.removeItem("gnss:user")
```

with:

```ts
window.localStorage.removeItem("mining:user")
```

- [ ] **Step 5: Update login monitoring visual**

In `components/login-monitoring-visual.tsx`, replace the metric list with:

```ts
const metrics = [
  { label: "ARR", value: "2 pos", icon: CloudRainIcon },
  { label: "ADR", value: "4 target", icon: RadioTowerIcon },
  { label: "Piezometer", value: "3 pos", icon: GaugeIcon },
  { label: "CCTV", value: "4 kamera", icon: CameraIcon },
];
```

If a listed icon is not currently imported, import it from `lucide-react`.

Replace visible badge and card labels so they use:

```tsx
<Badge variant="outline">Demo Mining Site</Badge>
```

Use sample labels:

```tsx
label="ADR-HW-01"
label="PZ-SD-01"
```

and replace the summary sentence with:

```tsx
Skor lereng diperbarui dari telemetry sensor tambang.
```

- [ ] **Step 6: Verify shell branding**

Run:

```bash
npm run typecheck
```

Expected: PASS.

- [ ] **Step 7: Commit app shell rebrand**

Run:

```bash
git add app/layout.tsx app/login/page.tsx components/login-form.tsx components/login-monitoring-visual.tsx components/app-sidebar.tsx
git commit -m "feat: rebrand shell for mining monitoring"
```

---

### Task 3: Convert Seed Data to Dummy Mining Site

**Files:**
- Modify: `prisma/seed.js`

- [ ] **Step 1: Update seeded users**

In `prisma/seed.js`, replace user names/emails with:

```js
{
  name: "Operator Tambang",
  email: "operator@mining.local",
  passwordHash: bcrypt.hashSync("operator123", 10),
  roleId: roles.find((role) => role.name === "Operator").id,
},
{
  name: "Admin Geoteknik",
  email: "admin@mining.local",
  passwordHash: bcrypt.hashSync("admin123", 10),
  roleId: roles.find((role) => role.name === "Admin Instansi").id,
},
{
  name: "Teknisi Instrumentasi",
  email: "teknisi@mining.local",
  passwordHash: bcrypt.hashSync("teknisi123", 10),
  roleId: roles.find((role) => role.name === "Teknisi").id,
},
{
  name: "Viewer Manajemen",
  email: "viewer@mining.local",
  passwordHash: bcrypt.hashSync("viewer123", 10),
  roleId: roles.find((role) => role.name === "Viewer").id,
},
{
  name: "Super Admin",
  email: "superadmin@mining.local",
  passwordHash: bcrypt.hashSync("superadmin123", 10),
  roleId: roles.find((role) => role.name === "Super Admin").id,
},
```

- [ ] **Step 2: Replace monitoring areas**

Replace the existing `monitoringArea.createMany` data with these mining areas:

```js
[
  {
    id: "area-pit-a",
    name: "Pit A",
    city: "Demo Mine",
    province: "Kalimantan",
    description: "Area pit utama dengan pemantauan lereng dan air tambang.",
  },
  {
    id: "area-pit-b",
    name: "Pit B",
    city: "Demo Mine",
    province: "Kalimantan",
    description: "Area pit sekunder untuk monitoring operasional dan kualitas udara.",
  },
  {
    id: "area-north-highwall",
    name: "North Highwall",
    city: "Demo Mine",
    province: "Kalimantan",
    description: "Lereng highwall prioritas untuk deformasi, hujan, dan CCTV.",
  },
  {
    id: "area-south-dump",
    name: "South Dump",
    city: "Demo Mine",
    province: "Kalimantan",
    description: "Area disposal dengan pemantauan tekanan air pori dan pergerakan.",
  },
  {
    id: "area-settling-pond",
    name: "Settling Pond",
    city: "Demo Mine",
    province: "Kalimantan",
    description: "Kolam pengendapan untuk level air dan kualitas air tambang.",
  },
  {
    id: "area-tailing-dam",
    name: "Tailing Dam",
    city: "Demo Mine",
    province: "Kalimantan",
    description: "Area bendungan tailing untuk pemantauan kestabilan dan air.",
  },
]
```

- [ ] **Step 3: Replace monitoring points**

Keep Prisma enum values as `GNSS`, `AWLR`, `CCTV`, and `WEATHER`, but use mining names and codes:

```js
[
  {
    code: "adr-hw-01",
    name: "ADR North Highwall 01",
    type: "GNSS",
    latitude: -3.2012,
    longitude: 115.3184,
    areaId: "area-north-highwall",
    status: "SIAGA",
    latestValue: "Displacement 42 mm",
    baselineElevationM: 126.4,
    currentElevationM: 126.358,
    totalSubsidenceCm: 4.2,
    velocityCmYear: -6.8,
    lastUpdate: minutesAgo(6),
  },
  {
    code: "adr-dump-01",
    name: "ADR South Dump 01",
    type: "GNSS",
    latitude: -3.2156,
    longitude: 115.3091,
    areaId: "area-south-dump",
    status: "WASPADA",
    latestValue: "Displacement 24 mm",
    baselineElevationM: 118.2,
    currentElevationM: 118.176,
    totalSubsidenceCm: 2.4,
    velocityCmYear: -3.9,
    lastUpdate: minutesAgo(12),
  },
  {
    code: "adr-pit-a-01",
    name: "ADR Pit A 01",
    type: "GNSS",
    latitude: -3.2088,
    longitude: 115.3252,
    areaId: "area-pit-a",
    status: "NORMAL",
    latestValue: "Displacement 9 mm",
    baselineElevationM: 104.7,
    currentElevationM: 104.691,
    totalSubsidenceCm: 0.9,
    velocityCmYear: -1.8,
    lastUpdate: minutesAgo(8),
  },
  {
    code: "awlr-sp-01",
    name: "AWLR Settling Pond 01",
    type: "AWLR",
    latitude: -3.2215,
    longitude: 115.3348,
    areaId: "area-settling-pond",
    status: "WASPADA",
    latestValue: "Level 3.45 m",
    lastUpdate: minutesAgo(4),
  },
  {
    code: "awqr-sp-01",
    name: "AWQR Settling Pond Outlet",
    type: "WEATHER",
    latitude: -3.2242,
    longitude: 115.3371,
    areaId: "area-settling-pond",
    status: "NORMAL",
    latestValue: "pH 7.2; TSS 68 mg/L",
    lastUpdate: minutesAgo(15),
  },
  {
    code: "arr-hw-01",
    name: "ARR North Highwall",
    type: "WEATHER",
    latitude: -3.1994,
    longitude: 115.3167,
    areaId: "area-north-highwall",
    status: "SIAGA",
    latestValue: "Rain 42 mm/24h",
    lastUpdate: minutesAgo(5),
  },
  {
    code: "aws-pit-a-01",
    name: "AWS Pit A",
    type: "WEATHER",
    latitude: -3.2074,
    longitude: 115.3225,
    areaId: "area-pit-a",
    status: "NORMAL",
    latestValue: "Wind 4.8 m/s",
    lastUpdate: minutesAgo(11),
  },
  {
    code: "pz-dump-01",
    name: "Piezometer South Dump 01",
    type: "WEATHER",
    latitude: -3.2168,
    longitude: 115.3077,
    areaId: "area-south-dump",
    status: "WASPADA",
    latestValue: "Pore pressure 86 kPa",
    lastUpdate: minutesAgo(9),
  },
  {
    code: "dust-haul-01",
    name: "Dust Sensor Haul Road 01",
    type: "WEATHER",
    latitude: -3.2118,
    longitude: 115.3304,
    areaId: "area-pit-b",
    status: "WASPADA",
    latestValue: "PM10 148 ug/m3",
    lastUpdate: minutesAgo(7),
  },
  {
    code: "noise-ws-01",
    name: "Noise Sensor Workshop",
    type: "WEATHER",
    latitude: -3.2051,
    longitude: 115.3382,
    areaId: "area-pit-b",
    status: "NORMAL",
    latestValue: "72 dB",
    lastUpdate: minutesAgo(13),
  },
  {
    code: "gas-ug-01",
    name: "Gas Sensor UG Portal 01",
    type: "WEATHER",
    latitude: -3.2189,
    longitude: 115.3198,
    areaId: "area-tailing-dam",
    status: "AWAS",
    latestValue: "CO 42 ppm",
    lastUpdate: minutesAgo(3),
  },
  {
    code: "cctv-hw-01",
    name: "CCTV North Highwall",
    type: "CCTV",
    latitude: -3.2006,
    longitude: 115.3175,
    areaId: "area-north-highwall",
    status: "SIAGA",
    latestValue: "Visibility clear",
    lastUpdate: minutesAgo(2),
  },
  {
    code: "cctv-sp-01",
    name: "CCTV Settling Pond",
    type: "CCTV",
    latitude: -3.2227,
    longitude: 115.3359,
    areaId: "area-settling-pond",
    status: "WASPADA",
    latestValue: "Water surface monitored",
    lastUpdate: minutesAgo(5),
  },
]
```

- [ ] **Step 4: Update readings, devices, camera snapshots, alarms, events, thresholds, weights, and reports**

Use the existing seed structure, but replace visible values with mining content:

```js
{ id: "deformation", metric: "Pergerakan lereng", normal: "< 10 mm", waspada: "10-30 mm", siaga: "30-60 mm", awas: "> 60 mm" },
{ id: "rainfall", metric: "Curah hujan 24 jam", normal: "< 25 mm", waspada: "25-50 mm", siaga: "50-80 mm", awas: "> 80 mm" },
{ id: "pore-pressure", metric: "Tekanan air pori", normal: "< 60 kPa", waspada: "60-90 kPa", siaga: "90-120 kPa", awas: "> 120 kPa" },
{ id: "water-level", metric: "Level air kolam/sump", normal: "< 3.0 m", waspada: "3.0-3.5 m", siaga: "3.5-4.0 m", awas: "> 4.0 m" },
{ id: "gas", metric: "Gas area risiko", normal: "Aman", waspada: "Perlu pemantauan", siaga: "Ventilasi/peringatan", awas: "Evakuasi area" },
```

Use report area:

```js
areaName: "Demo Mining Site"
```

Use risk weights:

```js
{ id: "slope-movement", metric: "Pergerakan lereng", weight: 35, source: "ADR/Deformation" },
{ id: "rainfall-intensity", metric: "Curah hujan", weight: 20, source: "ARR/AWS" },
{ id: "pore-pressure", metric: "Tekanan air pori", weight: 20, source: "Piezometer" },
{ id: "water-storage", metric: "Level air sump/pond", weight: 15, source: "AWLR" },
{ id: "environmental-exposure", metric: "Gas, debu, dan kebisingan", weight: 10, source: "Gas/Dust/Noise" },
```

Use alarm messages such as:

```js
"Pergerakan North Highwall melewati ambang siaga setelah hujan intensitas tinggi."
"Level Settling Pond mendekati batas operasi aman."
"Gas Sensor UG Portal 01 mendeteksi CO di atas ambang awas."
"Tekanan air pori South Dump meningkat dan perlu inspeksi geoteknik."
```

- [ ] **Step 5: Run seed syntax check**

Run:

```bash
node --check prisma/seed.js
```

Expected: PASS with no syntax errors.

- [ ] **Step 6: Commit seed conversion**

Run:

```bash
git add prisma/seed.js
git commit -m "feat: seed mining monitoring demo data"
```

---

### Task 4: Convert Backend DTO Labels and Summary Calculations

**Files:**
- Modify: `lib/types.ts`
- Modify: `lib/backend/queries.ts`
- Modify: `lib/insights.ts`
- Modify: `lib/backend/mappers.ts` only if visible labels are returned there.

- [ ] **Step 1: Add mining-friendly type aliases without breaking existing components**

In `lib/types.ts`, keep current exported names, but update comments or field intent through naming in consuming code. Do not rename `GnssMonitoringData`, `AwlrMonitoringData`, or `TideDatum` in Phase 1 because many components already depend on them.

Update `PointType` to include `WEATHER` for map and sensor overview usage:

```ts
export type PointType = "GNSS" | "AWLR" | "CCTV" | "WEATHER";
```

Update device-related unions where `PointType` is already used so `WEATHER` is accepted without duplicate union entries.

- [ ] **Step 2: Replace dashboard summary labels**

In `lib/backend/queries.ts`, update `getDashboardSummary()` return values:

```ts
return {
  updatedAt: formatDateTime(new Date()),
  activeArea: "Demo Mining Site",
  kpis: {
    maxSubsidence: formatSignedCm(maxSubsidence),
    averageSubsidence: formatSignedCm(averageSubsidence),
    waterLevel: formatMeters(latestWater?.reading.waterLevelM),
    floodRisk: topRisk?.status ?? "Normal",
    activePoints: `${points.length} sensor`,
    activeAlarms: openAlarmCount,
    maxSubsidenceStation: maxSubsidenceReading?.point.name ?? "Belum ada ADR",
    waterLevelStation: latestWater?.station.name ?? "Belum ada AWLR",
    activeLoggerDetail: `${activeLoggerCount} dari ${dataLoggers.length} logger sensor aktif`,
  },
  monitoringPoints: points,
  trend: buildTrendData(gnssReadings),
  tide: buildTideData(waterReadings),
  riskAreas,
  alarms,
  devices,
  dataLoggers,
  cctvSnapshots: snapshots,
};
```

- [ ] **Step 3: Replace risk area semantics**

In `getRiskAreas()`, map old fields to mining labels:

```ts
return {
  area: area.name,
  status,
  score: riskScoreByStatus[status],
  subsidenceRate: formatSignedCm(gnss?.velocityCmYear),
  waterLevel: formatMeters(water?.waterLevelM),
  nextWindow: nextWindowByArea[area.name] ?? "Inspeksi shift berikutnya",
};
```

Rename `nextWindowByArea` values to mining inspection windows:

```ts
const nextWindowByArea: Record<string, string> = {
  "Pit A": "Shift 1",
  "Pit B": "Shift 2",
  "North Highwall": "Segera",
  "South Dump": "Shift 1",
  "Settling Pond": "Shift 2",
  "Tailing Dam": "Shift 1",
};
```

- [ ] **Step 4: Update insight messages**

In `lib/insights.ts`, replace visible insight categories:

```ts
category: "Deformasi Lereng"
text: `${selectedStation.name} mencatat laju pergerakan ${velocityAbs.toFixed(1)} cm/tahun${deltaText}.`
```

Use:

```ts
category: "Kualitas Observasi ADR"
category: "Tren Pergerakan"
category: "Perbandingan Area"
```

For AWLR insights, use:

```ts
category: "Level Air Tambang"
text: `${selectedStation.name} mencatat level air ${latest.waterLevel.toFixed(2)} m pada area tambang.`
```

- [ ] **Step 5: Typecheck backend changes**

Run:

```bash
npm run typecheck
```

Expected: PASS.

- [ ] **Step 6: Commit backend conversion**

Run:

```bash
git add lib/types.ts lib/backend/queries.ts lib/insights.ts lib/backend/mappers.ts
git commit -m "feat: map backend data to mining domain"
```

---

### Task 5: Convert Dashboard Cards, Charts, Risk Panel, Map, and Logger List

**Files:**
- Modify: `components/section-cards.tsx`
- Modify: `components/dashboard/trend-charts.tsx`
- Modify: `components/dashboard/risk-panel.tsx`
- Modify: `components/dashboard/data-logger-list.tsx`
- Modify: `components/dashboard/cctv-grid.tsx`
- Modify: `components/dashboard/leaflet-risk-map.tsx`

- [ ] **Step 1: Replace KPI card labels**

In `components/section-cards.tsx`, use these card descriptions and footer texts:

```tsx
<CardDescription>Pergerakan Maks</CardDescription>
```

```tsx
Rata-rata {summary.kpis.averageSubsidence}
```

```tsx
Latest ADR: {summary.kpis.maxSubsidenceStation}
```

```tsx
<CardDescription>Level Air Tambang</CardDescription>
```

```tsx
Nilai terbaru dari logger AWLR sump/pond
```

```tsx
<CardDescription>Sensor Aktif</CardDescription>
```

```tsx
Status dihitung dari logger sensor tambang
```

Keep the fourth card as `Alarm Aktif`.

- [ ] **Step 2: Replace trend chart labels**

In `components/dashboard/trend-charts.tsx`, replace chart titles:

```tsx
<CardTitle className="text-sm">Tren Deformasi Lereng</CardTitle>
<CardDescription className="text-xs">
  Laju pergerakan ADR/deformasi (cm/tahun)
</CardDescription>
```

and:

```tsx
<CardTitle className="text-sm">Level Air Tambang</CardTitle>
<CardDescription className="text-xs">
  AWLR sump/settling pond vs ambang operasi
</CardDescription>
```

Update legend names:

```tsx
name="ADR-HW-01"
name="ADR-DUMP-01"
name="ADR-PIT-A-01"
```

- [ ] **Step 3: Replace risk panel copy**

In `components/dashboard/risk-panel.tsx`, replace:

```tsx
<CardTitle>Panel Risiko Rob</CardTitle>
```

with:

```tsx
<CardTitle>Panel Risiko Lereng</CardTitle>
```

Replace:

```tsx
Skor rule-based untuk prioritas respons
```

with:

```tsx
Skor rule-based untuk prioritas inspeksi geoteknik
```

Replace labels:

```tsx
Jadwal inspeksi {area.nextWindow}
Pergerakan
Level air
```

- [ ] **Step 4: Replace data logger list copy**

In `components/dashboard/data-logger-list.tsx`, update:

```tsx
<CardTitle>Data Logger Sensor</CardTitle>
<CardDescription>
  ADR, AWLR, ARR, piezometer, kualitas air, gas, debu, dan CCTV
</CardDescription>
```

Keep internal `GNSS` routing for now, but visible label badges for `GNSS` rows should render `ADR`:

```tsx
const visiblePointType = logger.pointType === "GNSS" ? "ADR" : logger.pointType;
```

Use `{visiblePointType}` in the badge.

- [ ] **Step 5: Replace CCTV copy**

In `components/dashboard/cctv-grid.tsx`, replace:

```tsx
<CardDescription>
  Snapshot visual titik kritis tambang
</CardDescription>
```

- [ ] **Step 6: Replace map labels**

In `components/dashboard/leaflet-risk-map.tsx`, visible labels should use:

```ts
const pointTypeLabels: Record<PointType, string> = {
  GNSS: "ADR",
  AWLR: "AWLR",
  CCTV: "CCTV",
  WEATHER: "Sensor",
};
```

Use badge text:

```tsx
<Badge variant="outline">Demo Mining Site</Badge>
```

Use legend labels:

```tsx
ADR
AWLR
CCTV
Sensor
```

- [ ] **Step 7: Verify dashboard components**

Run:

```bash
npm run typecheck
npm run lint
```

Expected: typecheck PASS. Lint PASS or only the existing TanStack Table warning in `components/data-table.tsx`.

- [ ] **Step 8: Commit dashboard component conversion**

Run:

```bash
git add components/section-cards.tsx components/dashboard/trend-charts.tsx components/dashboard/risk-panel.tsx components/dashboard/data-logger-list.tsx components/dashboard/cctv-grid.tsx components/dashboard/leaflet-risk-map.tsx
git commit -m "feat: convert dashboard widgets to mining monitoring"
```

---

### Task 6: Convert Pages and API Report Copy

**Files:**
- Modify: `app/peta-risiko/page.tsx`
- Modify: `app/analisa-data/page.tsx`
- Modify: `app/cctv/page.tsx`
- Modify: `app/analisis-risiko/page.tsx`
- Modify: `app/laporan/page.tsx`
- Modify: `app/perangkat/page.tsx`
- Modify: `app/pengaturan/page.tsx`
- Modify: `components/dashboard/data-analysis-filter-bar.tsx`
- Modify: `components/dashboard/gnss-filter-bar.tsx`
- Modify: `components/dashboard/insight-panel.tsx`
- Modify: `components/dashboard/risk-weight-manager.tsx`
- Modify: `components/dashboard/alarm-threshold-manager.tsx`
- Modify: `app/api/map/points/route.ts`
- Modify: `app/api/reports/daily/route.ts`
- Modify: `app/api/reports/generate/route.ts`
- Modify: `app/api/reports/[id]/download/route.ts`
- Modify: `app/api/alarm-thresholds/route.ts`

- [ ] **Step 1: Update page titles**

Use these titles in `AppShell` calls:

```tsx
title="Peta Monitoring Tambang"
title="Sensor Geoteknik"
title="CCTV Monitoring"
title="Analisis Risiko Lereng"
title="Laporan Monitoring Tambang"
title="Perangkat Sensor"
title="Pengaturan Mining Monitoring"
```

- [ ] **Step 2: Update data analysis labels**

In `components/dashboard/data-analysis-filter-bar.tsx`, replace mode options:

```ts
{ label: "ADR / Deformasi", value: "gnss" },
{ label: "AWLR / Air Tambang", value: "awlr" },
```

In `components/dashboard/gnss-filter-bar.tsx`, replace visible title text with:

```tsx
Monitoring Deformasi ADR
```

and aria labels:

```tsx
aria-label="Pilih titik ADR"
aria-label="Pilih parameter deformasi"
```

In `components/dashboard/insight-panel.tsx`, use:

```ts
const modeLabel = mode === "gnss" ? "ADR" : "AWLR";
```

- [ ] **Step 3: Update report API defaults and filenames**

In `app/api/reports/generate/route.ts`, set:

```ts
areaName: z.string().min(1).default("Demo Mining Site"),
```

In `app/api/reports/daily/route.ts`, set:

```ts
"Content-Disposition": 'attachment; filename="laporan-harian-mining-monitoring.csv"',
```

In `app/api/reports/[id]/download/route.ts`, replace generated text with mining language:

```ts
`Pergerakan ${area.subsidenceRate}; level air ${area.waterLevel}; inspeksi ${area.nextWindow}`
```

and:

```ts
`- ${area.area}: ${area.status}, skor ${area.score}, pergerakan ${area.subsidenceRate}, level air ${area.waterLevel}, inspeksi ${area.nextWindow}`
```

- [ ] **Step 4: Update map API layer labels**

In `app/api/map/points/route.ts`, use:

```ts
"Titik ADR/Deformasi"
"Titik AWLR"
"Titik CCTV"
"Sensor Lingkungan"
"Zona Risiko Lereng"
```

- [ ] **Step 5: Update threshold and risk weight UI copy**

In `components/dashboard/risk-weight-manager.tsx`, replace the description with:

```tsx
CRUD bobot rule-based untuk analisis risiko lereng tambang
```

and the input hint with:

```tsx
placeholder="Contoh: Pergerakan lereng"
```

In `components/dashboard/alarm-threshold-manager.tsx`, render `ADR` for point type `GNSS`:

```tsx
{setting.pointType === "GNSS" ? "ADR" : setting.pointType}
```

- [ ] **Step 6: Typecheck and scan copy**

Run:

```bash
npm run typecheck
npm run check:mining-copy
```

Expected: both PASS.

- [ ] **Step 7: Commit page and API copy conversion**

Run:

```bash
git add app components/dashboard app/api
git commit -m "feat: convert pages and reports to mining monitoring"
```

---

### Task 7: Update README and Final Verification

**Files:**
- Modify: `README.md`
- Verify: full project

- [ ] **Step 1: Replace README content**

Replace `README.md` with a Mining Monitoring System README containing:

```md
# Mining Monitoring System

Dashboard monitoring tambang berbasis sensor geoteknik, deformasi ADR, AWLR, kualitas air, cuaca, CCTV, debu, kebisingan, gas, alarm, perangkat, dan laporan operasional.

## Status Implementasi

Phase 1 sudah mengubah dashboard menjadi command center tambang dengan data dummy:

- Next.js App Router + TypeScript.
- Backend MySQL lewat Prisma ORM.
- Layout dashboard operasional dengan sidebar dan header.
- Navigasi Mining Monitoring System.
- KPI ringkasan risiko lereng, alarm aktif, sensor aktif, level air, dan pergerakan.
- Peta monitoring tambang dengan marker sensor.
- Grafik deformasi ADR dan level air tambang.
- Panel risiko lereng rule-based.
- Sensor geoteknik: ARR, AWLR, AWQR, AWS, ADR, Piezometer, CCTV, Dust, Noise, Gas.
- Halaman alarm, laporan, perangkat, pengaturan, dan login.

Belum dilakukan pada Phase 1:

- Schema sensor tambang baru yang sepenuhnya generik.
- MQTT/control ADR dari asaba-nextjs.
- Prism target management.
- Visualisasi 3D deformasi nyata.
- Realtime ingestion pipeline.
- Export PDF nyata.
- Session cookie dan role guard middleware untuk auth.

## Setup

Isi `.env` dengan koneksi MySQL:

```env
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/mining_monitoring"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Lalu jalankan:

```bash
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

Login demo:

```text
operator@mining.local / operator123
```
```

- [ ] **Step 2: Run full verification**

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
- `lint`: PASS or only the pre-existing TanStack Table compiler warning and unused variable warning if still present.
- `build`: PASS.

- [ ] **Step 3: Manual UI smoke test**

Start the app:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Check these pages:

```text
/
/peta-risiko
/analisa-data
/gnss
/awlr
/cctv
/analisis-risiko
/alarm
/laporan
/perangkat
/pengaturan
/login
```

Expected:

- The app title and login brand show Mining Monitoring System.
- Sidebar shows Peta Monitoring, Sensor Geoteknik, Deformasi Lereng, Air & Cuaca, CCTV Monitoring.
- Dashboard reads as a mining command center.
- Peta shows Demo Mining Site and mining area markers.
- No visible page copy mentions coastal, pesisir, pantura, rob, tide, muka air laut, or penurunan tanah.

- [ ] **Step 4: Commit docs and verification updates**

Run:

```bash
git add README.md package.json package-lock.json
git commit -m "docs: update mining monitoring setup"
```

If `package-lock.json` did not change, omit it from `git add`.

---

## Final Acceptance Criteria

- The application presents itself as **Mining Monitoring System**.
- The dashboard is a mining command center using the existing GNSS styling and layout patterns.
- Dummy data uses mining areas and sensor names.
- All ten requested sensor/system categories are visible in the product experience.
- Phase 1 does not introduce ASABA MQTT/control migration.
- Verification commands pass:
  - `npm run check:mining-copy`
  - `npm run typecheck`
  - `npm run lint`
  - `npm run build`
