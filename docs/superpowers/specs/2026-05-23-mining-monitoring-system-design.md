# Mining Monitoring System Phase 1 Design

Date: 2026-05-23

## Goal

Convert the existing GNSS coastal monitoring dashboard into a full mining monitoring dashboard named **Mining Monitoring System**.

Phase 1 is a UI-first conversion. It keeps the current GNSS dashboard layout and visual language, but changes the domain, navigation, page labels, KPI content, map markers, sensor modules, risk language, dummy database seed, and operational copy so the application no longer presents itself as a coastal/subsidence/rob system.

## Scope

Phase 1 covers a complete mining-facing dashboard experience with dummy mining data. It does not yet implement the deeper schema redesign or full ADR/RTS migration from `asaba-nextjs`.

In scope:

- Rebrand the app to **Mining Monitoring System**.
- Replace coastal/pesisir/rob wording with mining, geotechnical, slope stability, pit, highwall, disposal, settling pond, and tailing dam terminology.
- Keep the existing GNSS UI style: sidebar, header, KPI cards, maps, charts, status badges, tables, alarms, reports, settings, and dense operational dashboard layout.
- Provide dummy mining site data for all priority sensor types.
- Present all ten mining sensor/system categories from the user reference:
  - Rain Gauge / ARR
  - Water Level / AWLR
  - Water Quality / AWQR
  - Weather Station / AWS
  - Deformation Monitoring / ADR
  - Piezometer
  - CCTV Monitoring
  - Dust Sensor
  - Noise Sensor
  - Gas Sensor
- Preserve current operational flows where possible: alarm validation, device status, reporting, thresholds, and risk weighting.

Out of scope for Phase 1:

- Real MQTT/control integration from `asaba-nextjs`.
- Full prism target management and RTS/ADR control.
- New normalized mining sensor database schema.
- Real-time ingestion pipelines.
- Real export PDF/report generation beyond the current placeholder behavior.
- Production authentication/role guard improvements unless required by the UI conversion.

## Recommended Approach

Use the existing `gnss` project as the base because it is already structured as a coherent dashboard with Prisma, route handlers, reusable UI components, and documented setup.

Use `asaba-nextjs` as a reference source for later phases, especially for ADR/RTS concepts:

- Prism target
- RTS control
- Deformation calculation
- Measurement history
- 3D visualization
- MQTT command flows

Phase 1 should not directly copy the large `asaba-nextjs` modules yet. The first pass should make the product identity and monitoring workflow correct before moving heavy ADR/RTS behavior across.

## Navigation

The first version should use this mining-focused navigation:

1. **Dashboard**
   - Mining command center.
   - Shows risk, active alarms, online sensors, rainfall, deformation, gas/dust/noise summary, and latest site conditions.

2. **Peta Monitoring**
   - Replaces coastal risk map.
   - Shows mine areas and sensor markers.
   - Example areas: Pit A, Pit B, North Highwall, South Dump, Settling Pond, Tailing Dam, Workshop, Haul Road.

3. **Sensor Geoteknik**
   - Overview for all ten sensor/system categories.
   - Includes status, latest reading, trend indicator, and last update.

4. **Deformasi Lereng**
   - Replaces the GNSS page.
   - Shows displacement, velocity, prism/ADR placeholder data, highwall movement, and disposal movement.

5. **Air & Cuaca**
   - Groups ARR, AWLR, AWQR, and AWS.
   - Shows rainfall, water level, water quality, and local weather.

6. **CCTV Monitoring**
   - Shows critical mining area cameras.
   - Example views: highwall, pit floor, settling pond, hauling road.

7. **Analisis Risiko**
   - Correlates rainfall, water level, pore pressure, deformation, and site risk.
   - Keeps the existing risk panel pattern, but changes the domain from flood/rob to slope stability.

8. **Alarm & Event**
   - Shows sensor threshold alarms and operator validation workflow.
   - Uses statuses Normal, Waspada, Siaga, Awas.

9. **Laporan**
   - Daily/weekly/monthly mining monitoring report placeholders.

10. **Perangkat**
    - Device/logger health: online status, battery, signal, firmware, and last data.

11. **Pengaturan**
    - Thresholds, risk weights, user/password settings, and configuration.

## Mapping From Current GNSS Dashboard

Use the current pages and components as much as possible, with domain changes:

- `GNSS` becomes `Deformasi Lereng / ADR`.
- `AWLR` remains AWLR, but its context changes to sump, pit lake, settling pond, river, and mine pond water level.
- `CCTV` remains CCTV, but camera locations become mining critical areas.
- `Peta Risiko` becomes `Peta Monitoring`.
- `Analisis Risiko` remains, but calculations and labels become slope stability risk.
- `Alarm`, `Perangkat`, `Laporan`, and `Pengaturan` remain operationally similar.
- Coastal-specific words such as pesisir, pantura, rob, tide, muka air laut, and penurunan pesisir must be removed from visible UI.

## Dummy Data

Use a generic demo site first.

Site:

- Demo Mining Site

Areas:

- Pit A
- Pit B
- North Highwall
- South Dump
- Settling Pond
- Tailing Dam
- Workshop
- Haul Road

Initial sensor examples:

- `ARR-01`: rain gauge at North Highwall
- `AWLR-SP-01`: water level at Settling Pond
- `AWQR-01`: water quality at Settling Pond outlet
- `AWS-01`: weather station at Pit A
- `ADR-HW-01`: deformation monitoring at North Highwall
- `PZ-01`: piezometer at South Dump
- `CCTV-HW-01`: CCTV at North Highwall
- `DUST-01`: dust sensor at Haul Road
- `NOISE-01`: noise sensor near Workshop
- `GAS-UG-01`: gas sensor at underground/low ventilation risk area placeholder

Risk statuses:

- Normal
- Waspada
- Siaga
- Awas

## Dashboard KPIs

Recommended first-screen KPI cards:

- Slope Risk Status
- Active Alarms
- Sensors Online
- 24h Rainfall
- Max Displacement
- Critical Gas/Dust/Noise

The dashboard should feel like the current GNSS command center, but every label and metric should be mining-specific.

## Data Flow

Phase 1 can continue using the current Prisma-backed route handlers and seed data pattern. The implementation should adapt existing model names only where necessary for speed, but UI-facing types, labels, and seed values must represent mining concepts.

Expected flow:

1. Prisma seed creates dummy mining areas, monitoring points, devices, sensor readings, alarms, thresholds, reports, and users.
2. Backend query functions map database rows into UI-friendly mining dashboard DTOs.
3. Server components load dashboard summaries and page data.
4. Client components continue to handle charts, filters, map interactions, form submissions, and alarm/device actions.

## Error Handling

Keep the current API error response style for Phase 1.

User-facing behavior:

- Empty mining sensor datasets should show empty states, not coastal fallback text.
- Invalid form submissions should keep current validation feedback patterns.
- Database connection or missing seed data errors can remain developer-facing during Phase 1, but visible page copy should not reference coastal data.

## Testing And Verification

Minimum verification for Phase 1:

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- Manual scan of visible UI copy for coastal/pesisir/rob terminology.
- Manual navigation through all main pages.
- Verify seed data creates mining dummy content.
- Verify map markers, KPI cards, charts, alarms, reports, devices, thresholds, and risk weights render with mining terms.

## Later Phases

Phase 2: introduce deeper sensor-specific behavior for ARR, AWLR, AWQR, AWS, ADR, Piezometer, CCTV, Dust, Noise, and Gas. This can include better thresholds, trend charts, sensor detail pages, and risk correlations.

Phase 3: migrate and refactor selected ADR/RTS capabilities from `asaba-nextjs`, including prism target workflows, deformation calculations, MQTT/control flows, measurement history, and 3D visualization.
