# ASABA Dummy Modules Phase 2 Design

Date: 2026-05-23

## Goal

Add ASABA-inspired ADR/RTS modules into the existing **Mining Monitoring System** while preserving the current GNSS-derived dashboard layout, styling, sidebar shell, and dummy mining data approach.

This phase is UI-first. It should make the product feel like it includes ASABA operational workflows, but it must not port live MQTT control, RTS command execution, or the full ASABA database schema yet.

## Scope

In scope:

- Add ASABA/ADR navigation into the current Mining Monitoring System sidebar.
- Add new pages using the existing app shell:
  - ADR Control
  - Hasil Pengukuran
  - Peta Tambang
  - Visualisasi 3D
  - Prism Config
  - Rekap Data
- Use dummy ADR/RTS/prism data that matches the mining site context.
- Keep visible styling aligned with the existing `gnss-mining-monitoring` components: cards, badges, tables, compact controls, and dashboard sections.
- Reuse ASABA concepts from `d:\BE Software\BE PROJECT\adr_baru\asaba-nextjs`, especially prism targets, RTS status, measurement results, mine network map, scheduling, and deformation visual language.
- Keep labels mining-facing and operational: ADR, RTS, prism target, highwall, disposal, deformation, inspection, and measurement.

Out of scope:

- Porting ASABA's live MQTT client behavior.
- Sending real RTS power/start/stop/go-to-target commands.
- Migrating ASABA Prisma models into the Mining Monitoring database.
- Adding NextAuth or ASABA auth flows.
- Adding Deck.gl/MapLibre/Plotly dependencies in this phase.
- Implementing real 3D geospatial rendering. Visualisasi 3D can be a dashboard-native dummy visualization.

## Source Reference

Reference project:

```text
d:\BE Software\BE PROJECT\adr_baru\asaba-nextjs
```

Relevant ASABA references:

- `src/app/(dashboard)/kontrol-adr/page.tsx`
- `src/app/(dashboard)/hasil-pengukuran/page.tsx`
- `src/app/(dashboard)/visualisasi-3d/page.tsx`
- `src/app/(dashboard)/prism-config/page.tsx`
- `src/app/(dashboard)/rekap-data/page.tsx`
- `src/app/(dashboard)/peta-jaringan-tambang/page.tsx`
- `src/lib/deformasi.ts`
- `src/lib/mine-network.ts`
- public RTS/prism icons and visual assets, only if they can be copied safely and used without adding heavy dependencies.

## Navigation

Add a new sidebar group or section inside the existing `components/app-sidebar.tsx`.

Recommended structure:

- **ADR / RTS**
  - ADR Control: `/adr-control`
  - Hasil Pengukuran: `/hasil-pengukuran`
  - Peta Tambang: `/peta-jaringan-tambang`
  - Visualisasi 3D: `/visualisasi-3d`
  - Prism Config: `/prism-config`
  - Rekap Data: `/rekap-data`

Keep the current mining navigation intact:

- Dashboard
- Peta Monitoring
- Sensor Geoteknik
- CCTV Monitoring
- Perangkat Sensor
- Deformasi Lereng
- Air & Cuaca
- Alarm & Event
- Analisis Risiko
- Laporan
- Pengaturan

## Data Model

Do not change Prisma schema in this phase.

Create a local dummy data module for ASABA UI data, for example:

```text
lib/asaba-dummy.ts
```

The dummy data should include:

- RTS status:
  - connection state
  - power state
  - battery
  - signal
  - current job
  - last update
- Prism targets:
  - code
  - name
  - area
  - status
  - baseline coordinates
  - latest coordinates
  - displacement
  - velocity
  - last measurement time
- ADR measurement rows:
  - timestamp
  - prism code
  - N/E/Z baseline
  - N/E/Z latest
  - delta N/E/Z
  - 2D displacement
  - 3D displacement
  - status
- Schedule rows:
  - day
  - run label
  - time
  - enabled
- Rekap rows:
  - period
  - total measurements
  - successful measurements
  - failed measurements
  - max displacement
  - critical target
- Mine network sensors for Peta Tambang:
  - id
  - name
  - type
  - status
  - zone
  - critical point
  - x/y layout coordinates
  - latest value
  - threshold
  - trend
  - battery
  - signal
  - note

Use mining dummy areas already present in the app:

- North Highwall
- South Dump
- Pit A
- Settling Pond
- Tailing Dam

## Page Designs

### ADR Control

Purpose: show dummy RTS/ADR operational controls without sending real commands.

Expected UI:

- Compact status cards:
  - RTS Connection
  - RTS Power
  - Active Job
  - Last Measurement
- Main control panel:
  - Power On / Power Off buttons
  - Start Running / Stop Running buttons
  - Auto Search button
  - Current target badge
- Prism progress grid:
  - target code
  - status: Success, Running, Failed, Waiting
  - N/E/Z latest values
  - displacement
- Schedule panel:
  - days and dummy run times
  - toggles should be local UI state only

Behavior:

- Buttons simulate state locally in the client component.
- No API call to MQTT or ASABA control endpoints.
- UI should clearly feel operational, but not claim real hardware control.

### Hasil Pengukuran

Purpose: show ADR measurement results in a mining-friendly table.

Expected UI:

- Filter bar:
  - prism target select
  - area select
  - status select
  - date range fields or simple period buttons
- Summary cards:
  - Total measurement
  - Success rate
  - Max displacement
  - Critical target
- Table:
  - time
  - target
  - area
  - N/E/Z latest
  - delta N/E/Z
  - 2D displacement
  - 3D displacement
  - status

### Peta Tambang

Purpose: bring the ASABA mine network map experience into the Mining Monitoring System without adding MapLibre, Deck.gl, or database dependencies.

Expected UI:

- Full-width map surface inside the existing app shell.
- Stylized open pit background adapted from `asaba-nextjs/src/components/mine-network-map.tsx`.
- Sensor markers for tiltmeter, crack meter, piezometer, rain gauge, vibration, and GNSS/ADR.
- Network lines between related sensors.
- Filter panel:
  - search by sensor id, zone, or name
  - filter by sensor type
  - priority list for warning/danger sensors
- Legend panel:
  - status legend
  - sensor type legend
- Detail panel for selected sensor:
  - value
  - type
  - zone
  - critical point
  - threshold
  - update time
  - battery and signal

Implementation constraints:

- Adapt the ASABA map into `components/asaba/mine-network-map.tsx`.
- Put map data and helpers into a local module such as `lib/asaba-mine-network.ts`.
- Keep this as dummy UI data only.
- Do not add real GIS base maps or heavy map libraries in this phase.
- Do not add the ASABA 3D map route yet.

### Visualisasi 3D

Purpose: provide a dashboard-native dummy visualization of prism network and slope deformation.

Expected UI:

- Wide visualization area with a stylized mine slope scene.
- Prism nodes positioned in a simple 2.5D layout.
- Lines from RTS station to prism targets.
- Status colors for target nodes.
- Side panel with selected prism details.

Implementation constraints:

- Do not add Three.js, Deck.gl, Plotly, or MapLibre in this phase.
- Use HTML/CSS/SVG or lightweight React markup inside current design system.
- Keep it responsive and nonblank on desktop and mobile.

### Prism Config

Purpose: show dummy prism target configuration and baseline coordinates.

Expected UI:

- Config summary cards:
  - Total prism
  - Active prism
  - High priority target
  - Latest config update
- Table:
  - code
  - name
  - area
  - target height
  - baseline N/E/Z
  - controller status
  - monitoring priority
- Config form drawer/modal is optional. If included, it should be local-only and not persist.

### Rekap Data

Purpose: summarize ADR measurements across periods.

Expected UI:

- Period controls:
  - daily
  - weekly
  - monthly
- KPI cards:
  - total measurement
  - success rate
  - max displacement
  - targets needing inspection
- Table:
  - period
  - area
  - measurement count
  - success rate
  - max displacement
  - dominant movement direction
  - recommendation

## Components

Prefer small components under:

```text
components/asaba/
```

Suggested components:

- `adr-status-cards.tsx`
- `adr-control-panel.tsx`
- `prism-progress-grid.tsx`
- `mine-network-map.tsx`
- `measurement-results-table.tsx`
- `prism-config-table.tsx`
- `asaba-visualization.tsx`
- `rekap-summary.tsx`

Keep each component focused and reusable by passing dummy data as props.

## Data Flow

Recommended data flow:

1. `lib/asaba-dummy.ts` exports typed ADR/RTS/prism arrays and helper summaries.
2. `lib/asaba-mine-network.ts` exports typed mine network sensors and helper summaries.
3. Page server components import dummy data and pass it to client components when interactivity is needed.
4. Client components manage only local UI state such as selected target, simulated running state, filter selection, selected map sensor, and selected visualization node.
5. No ASABA API routes are required for Approach A.

## Error Handling

Because this phase is dummy data only:

- Empty filtered tables should render a clear empty state.
- Simulated buttons should never throw network errors.
- Pages should not depend on environment variables or database calls.
- Existing database-backed mining dashboard pages should remain unchanged.

## Testing And Verification

Minimum verification:

- `npm run check:mining-copy`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- Manual smoke navigation:
  - `/adr-control`
  - `/hasil-pengukuran`
  - `/peta-jaringan-tambang`
  - `/visualisasi-3d`
  - `/prism-config`
  - `/rekap-data`

Acceptance criteria:

- Existing Mining Monitoring layout remains intact.
- New ASABA pages use the same shell and styling language as the current dashboard.
- No live MQTT/control command is sent.
- No Prisma schema migration is required.
- Sidebar contains the new ASABA/ADR module routes.
- Peta Tambang renders a nonblank interactive dummy mine network map.
- Dummy data clearly represents mining ADR/RTS/prism workflows.
