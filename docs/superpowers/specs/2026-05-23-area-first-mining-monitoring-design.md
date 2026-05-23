# Area-First Mining Monitoring System Design

## Goal

Turn the current GNSS-derived mining dashboard into an area-first Mining Monitoring System. Operators should start from a mine area, then see every relevant sensor and operational signal for that area.

## Product Direction

The app is no longer organized primarily by sensor type. It is organized by mine area:

- North Highwall
- South Dump / Disposal
- Pit A
- Pit B / Haul Road
- Settling Pond
- Tailing Dam
- Crusher / Conveyor
- UG Portal

Each area shows its own sensor mix, risk status, latest readings, priority events, and inspection focus.

## Data Sources

Use `d:\BE Software\BE PROJECT\adr_baru\asaba-nextjs\src\lib\mine-network.ts` as the first source for geotechnical and deformation sensors:

- Tiltmeter
- Crack Meter
- Piezometer
- Rain Gauge
- Vibration
- GNSS

Add mining dummy data only for sensor systems that are not present in ASABA:

- Water Level / AWLR
- Water Quality / AWQR
- Weather Station / AWS
- Deformation Monitoring / ADR explicit logger/prism targets
- CCTV Monitoring
- Dust Sensor
- Noise Sensor
- Gas Sensor

The dummy additions must use the same operational style as ASABA data: id, name, type, status, area/zone, critical point, x/y map location, value, unit, threshold, trend, last update, battery, signal, and note.

## Area Model

The area-first catalog should expose these concepts:

- `MiningArea`: id, name, description, status, risk score, focus, next inspection window, map center, and sensor ids.
- `MiningSensor`: id, source, name, type, status, area id, critical point, coordinates, latest value, threshold, trend, telemetry, and note.
- `SensorType`: ARR, AWLR, AWQR, AWS, ADR, GNSS, Tiltmeter, Crack Meter, Piezometer, CCTV, Dust, Noise, Gas, Vibration.

Prisma schema changes are not required in this phase. This area-first layer can be a typed local catalog that maps existing database/seed concepts and ASABA dummy data into one UI-facing model.

## Navigation

Primary navigation should favor areas:

- Dashboard: overview of mine-wide status.
- Peta Tambang: visual area/sensor map.
- Area Tambang: list and detail pages for mine areas.
- Alarm & Event.
- Perangkat.
- Laporan.
- Pengaturan.

Sensor-specific pages can still exist, but they should not be the primary entry point.

## Route Behavior

The current `/gnss` and `/awlr` routes redirect to `/analisa-data`. That behavior is confusing for operators. Refactor them so:

- `/gnss` renders the deformation/ADR analysis view directly.
- `/awlr` renders the water-level view directly.
- `/analisa-data` can remain as a compatibility route, but sidebar navigation should not rely on redirect-only pages.

## UI Direction

Use the existing `/gnss` visual language:

- compact cards
- small status badges
- dense filter bars
- table/chart combinations
- restrained dashboard layout
- existing `AppShell`, `Card`, `Badge`, `Button`, and chart components

Do not create a marketing layout or a sensor-directory landing page. The first screen for Area Tambang should be operational: area status, sensor count, active alarms, and latest readings.

## Area Pages

### `/area-tambang`

Show all areas in a dense operational grid:

- area name
- status badge
- risk score
- active critical/warning sensors
- sensor type chips
- top latest reading
- next inspection window

### `/area-tambang/[areaId]`

Show a selected area:

- area header and risk summary
- sensor cards grouped by function
- latest sensor table
- priority inspection panel
- compact trend placeholder using dummy data
- related alarms/events when available

## Peta Tambang

Update Peta Tambang to consume the area-first catalog:

- markers should be grouped by area id
- filters should support area and sensor type
- ASABA geotechnical sensors should retain their original ASABA ids
- added dummy sensors should fill the missing mining systems
- selecting a marker should show area, sensor function, threshold, and telemetry

## Acceptance Criteria

- Area Tambang becomes a first-class navigation entry.
- `/area-tambang` renders an area-first overview.
- `/area-tambang/[areaId]` renders a detail view for at least North Highwall, South Dump, Pit A, Settling Pond, Crusher, and UG Portal.
- Peta Tambang uses the same unified area/sensor catalog.
- ASABA mine-network data is represented by its original ids and values.
- Missing systems from the screenshot are represented by dummy data.
- `/gnss` and `/awlr` no longer navigate the user away to `/analisa-data`.
- Styling remains consistent with the current GNSS-derived dashboard.
- Existing dashboard, alarm, perangkat, laporan, and map routes still render.
