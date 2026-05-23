import {
  mineNetworkLines,
  mineNetworkSensors,
  type MineNetworkSensor,
  type MineNetworkSensorStatus,
  type MineNetworkSensorType,
} from "@/lib/asaba-mine-network"

export type MiningAreaStatus = "Normal" | "Waspada" | "Siaga" | "Awas"
export type MiningSensorStatus = MineNetworkSensorStatus

export type MiningSensorType =
  | MineNetworkSensorType
  | "adr"
  | "awlr"
  | "awqr"
  | "aws"
  | "cctv"
  | "dust"
  | "noise"
  | "gas"

export type MiningSensorSource = "asaba" | "mining-dummy"

export type MiningSensor = Omit<MineNetworkSensor, "type"> & {
  type: MiningSensorType
  source: MiningSensorSource
  areaId: string
  functionLabel: string
}

type MiningAreaDefinition = {
  id: string
  name: string
  description: string
  status: MiningAreaStatus
  riskScore: number
  focus: string
  nextInspection: string
  mapCenter: { x: number; y: number }
}

export type MiningArea = MiningAreaDefinition & {
  sensorIds: string[]
}

export const miningSensorTypeLabels: Record<MiningSensorType, string> = {
  tiltmeter: "Tiltmeter",
  "crack-meter": "Crack Meter",
  piezometer: "Piezometer",
  "rain-gauge": "Rain Gauge / ARR",
  vibration: "Vibration",
  gnss: "GNSS",
  adr: "Deformation / ADR",
  awlr: "Water Level / AWLR",
  awqr: "Water Quality / AWQR",
  aws: "Weather Station / AWS",
  cctv: "CCTV Monitoring",
  dust: "Dust Sensor",
  noise: "Noise Sensor",
  gas: "Gas Sensor",
}

const miningAreaDefinitions: MiningAreaDefinition[] = [
  {
    id: "north-highwall",
    name: "North Highwall",
    description: "Area highwall prioritas untuk deformasi, hujan, dan inspeksi geoteknik.",
    status: "Siaga",
    riskScore: 82,
    focus: "Pergerakan lereng dan curah hujan",
    nextInspection: "Inspeksi geoteknik shift ini",
    mapCenter: { x: 38, y: 28 },
  },
  {
    id: "south-dump",
    name: "South Dump / Disposal",
    description: "Disposal aktif dengan pemantauan retakan, pore pressure, dan deformasi.",
    status: "Waspada",
    riskScore: 68,
    focus: "Stabilitas dump dan drainase toe",
    nextInspection: "Cek toe drain 2 jam lagi",
    mapCenter: { x: 25, y: 68 },
  },
  {
    id: "pit-a",
    name: "Pit A",
    description: "Pit aktif dengan pemantauan crest, seepage, cuaca, dan GNSS.",
    status: "Awas",
    riskScore: 91,
    focus: "Piezometer east slope dan tiltmeter highwall",
    nextInspection: "Batasi akses bawah highwall",
    mapCenter: { x: 70, y: 39 },
  },
  {
    id: "pit-b-haul-road",
    name: "Pit B / Haul Road",
    description: "Jalur angkut dan ramp dengan pemantauan retakan, hujan, debu, dan GNSS.",
    status: "Waspada",
    riskScore: 64,
    focus: "Debu haul road dan retakan ramp",
    nextInspection: "Patroli operasi shift berikutnya",
    mapCenter: { x: 59, y: 68 },
  },
  {
    id: "settling-pond",
    name: "Settling Pond",
    description: "Kolam tambang untuk level air, kualitas air, dan kamera inspeksi.",
    status: "Waspada",
    riskScore: 59,
    focus: "Freeboard, pH, TSS, dan status kamera",
    nextInspection: "Cek pompa dan outlet 1 jam lagi",
    mapCenter: { x: 79, y: 73 },
  },
  {
    id: "tailing-dam",
    name: "Tailing Dam",
    description: "Area tailing dan toe dam untuk pore pressure dan kestabilan lereng.",
    status: "Normal",
    riskScore: 42,
    focus: "Tekanan air pori dan inspeksi toe dam",
    nextInspection: "Inspeksi rutin harian",
    mapCenter: { x: 76, y: 86 },
  },
  {
    id: "crusher-conveyor",
    name: "Crusher / Conveyor",
    description: "Area crusher, transfer conveyor, noise, vibration, dan dust exposure.",
    status: "Normal",
    riskScore: 38,
    focus: "Getaran crusher dan kebisingan kerja",
    nextInspection: "Cek mekanikal sore ini",
    mapCenter: { x: 86, y: 45 },
  },
  {
    id: "ug-portal",
    name: "UG Portal",
    description: "Portal tambang bawah tanah untuk gas, ventilasi, dan akses kritis.",
    status: "Awas",
    riskScore: 94,
    focus: "Gas CO dan ventilasi portal",
    nextInspection: "Evakuasi sampai gas aman",
    mapCenter: { x: 89, y: 84 },
  },
]

const asabaSensorAreaIds: Record<string, string> = {
  "TLT-01": "north-highwall",
  "TLT-02": "pit-a",
  "TLT-03": "south-dump",
  "CRK-01": "south-dump",
  "CRK-02": "pit-b-haul-road",
  "CRK-03": "pit-a",
  "PZO-01": "north-highwall",
  "PZO-02": "pit-a",
  "PZO-03": "south-dump",
  "RNG-01": "north-highwall",
  "RNG-02": "pit-b-haul-road",
  "RNG-03": "crusher-conveyor",
  "VIB-01": "north-highwall",
  "VIB-02": "crusher-conveyor",
  "VIB-03": "pit-b-haul-road",
  "GNS-01": "pit-a",
  "GNS-02": "south-dump",
  "GNS-03": "pit-b-haul-road",
}

function toAsabaMiningSensor(sensor: MineNetworkSensor): MiningSensor {
  return {
    ...sensor,
    source: "asaba",
    areaId: asabaSensorAreaIds[sensor.id] ?? "pit-a",
    functionLabel: miningSensorTypeLabels[sensor.type],
  }
}

const supplementalSensors: MiningSensor[] = [
  {
    id: "ADR-HW-01",
    name: "ADR North Highwall 01",
    type: "adr",
    status: "danger",
    zone: "North Highwall",
    areaId: "north-highwall",
    source: "mining-dummy",
    functionLabel: "Deformation Monitoring / ADR",
    criticalPoint: "Highwall Crest",
    x: 36,
    y: 31,
    value: 57.9,
    unit: "mm",
    threshold: "> 50 mm",
    trend: "naik",
    lastUpdate: "10:45 WIB",
    battery: 76,
    signal: 82,
    note: "Target ADR masuk prioritas inspeksi geoteknik.",
  },
  {
    id: "ADR-DP-01",
    name: "ADR South Dump 01",
    type: "adr",
    status: "caution",
    zone: "South Dump",
    areaId: "south-dump",
    source: "mining-dummy",
    functionLabel: "Deformation Monitoring / ADR",
    criticalPoint: "Dump Crest",
    x: 34,
    y: 70,
    value: 28.8,
    unit: "mm",
    threshold: "20-50 mm",
    trend: "naik",
    lastUpdate: "10:43 WIB",
    battery: 84,
    signal: 79,
    note: "Displacement disposal meningkat perlahan.",
  },
  {
    id: "AWLR-SP-01",
    name: "AWLR Settling Pond 01",
    type: "awlr",
    status: "caution",
    zone: "Settling Pond",
    areaId: "settling-pond",
    source: "mining-dummy",
    functionLabel: "Water Level / AWLR",
    criticalPoint: "Pond Freeboard",
    x: 78,
    y: 72,
    value: 3.18,
    unit: "m",
    threshold: "3.0-3.5 m",
    trend: "naik",
    lastUpdate: "10:46 WIB",
    battery: 74,
    signal: 69,
    note: "Level kolam mendekati batas operasi aman.",
  },
  {
    id: "AWQR-SP-01",
    name: "AWQR Settling Pond Outlet",
    type: "awqr",
    status: "normal",
    zone: "Settling Pond",
    areaId: "settling-pond",
    source: "mining-dummy",
    functionLabel: "Water Quality / AWQR",
    criticalPoint: "Outlet Channel",
    x: 84,
    y: 76,
    value: 7.2,
    unit: "pH",
    threshold: "6.5-8.5 pH",
    trend: "stabil",
    lastUpdate: "10:38 WIB",
    battery: 77,
    signal: 71,
    note: "Kualitas air outlet dalam batas normal.",
  },
  {
    id: "AWS-PA-01",
    name: "AWS Pit A",
    type: "aws",
    status: "normal",
    zone: "Pit A",
    areaId: "pit-a",
    source: "mining-dummy",
    functionLabel: "Weather Station / AWS",
    criticalPoint: "Pit A Weather Mast",
    x: 64,
    y: 24,
    value: 30.4,
    unit: "C",
    threshold: "< 35 C",
    trend: "stabil",
    lastUpdate: "10:41 WIB",
    battery: 86,
    signal: 78,
    note: "Cuaca kerja normal, angin dan kelembapan terkendali.",
  },
  {
    id: "CCTV-HW-01",
    name: "CCTV North Highwall",
    type: "cctv",
    status: "normal",
    zone: "North Highwall",
    areaId: "north-highwall",
    source: "mining-dummy",
    functionLabel: "CCTV Monitoring",
    criticalPoint: "Highwall Access",
    x: 22,
    y: 28,
    value: 1,
    unit: "online",
    threshold: "online",
    trend: "stabil",
    lastUpdate: "10:44 WIB",
    battery: 71,
    signal: 67,
    note: "Kamera highwall online untuk verifikasi visual.",
  },
  {
    id: "CCTV-SP-01",
    name: "CCTV Settling Pond",
    type: "cctv",
    status: "caution",
    zone: "Settling Pond",
    areaId: "settling-pond",
    source: "mining-dummy",
    functionLabel: "CCTV Monitoring",
    criticalPoint: "Pond Pump Panel",
    x: 73,
    y: 78,
    value: 49,
    unit: "% battery",
    threshold: "< 50% battery",
    trend: "turun",
    lastUpdate: "10:31 WIB",
    battery: 49,
    signal: 55,
    note: "Panel kamera perlu pengecekan karena baterai turun.",
  },
  {
    id: "DST-HR-01",
    name: "Dust Sensor Haul Road 01",
    type: "dust",
    status: "caution",
    zone: "Pit B / Haul Road",
    areaId: "pit-b-haul-road",
    source: "mining-dummy",
    functionLabel: "Dust Sensor",
    criticalPoint: "Haul Road Bend",
    x: 43,
    y: 80,
    value: 148,
    unit: "ug/m3",
    threshold: "120-180 ug/m3",
    trend: "naik",
    lastUpdate: "10:35 WIB",
    battery: 72,
    signal: 66,
    note: "Debu haul road melewati ambang waspada saat lalu lintas unit meningkat.",
  },
  {
    id: "NOI-CR-01",
    name: "Noise Sensor Crusher",
    type: "noise",
    status: "normal",
    zone: "Crusher / Conveyor",
    areaId: "crusher-conveyor",
    source: "mining-dummy",
    functionLabel: "Noise Sensor",
    criticalPoint: "Crusher Platform",
    x: 89,
    y: 46,
    value: 68,
    unit: "dBA",
    threshold: "< 85 dBA",
    trend: "stabil",
    lastUpdate: "10:33 WIB",
    battery: 80,
    signal: 73,
    note: "Kebisingan area crusher masih dalam batas kerja.",
  },
  {
    id: "GAS-UG-01",
    name: "Gas Sensor UG Portal 01",
    type: "gas",
    status: "danger",
    zone: "UG Portal",
    areaId: "ug-portal",
    source: "mining-dummy",
    functionLabel: "Gas Sensor",
    criticalPoint: "Portal Access",
    x: 91,
    y: 86,
    value: 72,
    unit: "ppm CO",
    threshold: "> 70 ppm CO",
    trend: "naik",
    lastUpdate: "10:47 WIB",
    battery: 92,
    signal: 81,
    note: "CO di atas ambang awas, area portal dikosongkan sementara.",
  },
]

const miningSensors: MiningSensor[] = [
  ...mineNetworkSensors.map(toAsabaMiningSensor),
  ...supplementalSensors,
]

export const miningNetworkLines: Array<[string, string]> = [
  ...mineNetworkLines,
  ["RNG-01", "ADR-HW-01"],
  ["ADR-HW-01", "CCTV-HW-01"],
  ["GNS-02", "ADR-DP-01"],
  ["RNG-02", "DST-HR-01"],
  ["AWLR-SP-01", "AWQR-SP-01"],
  ["AWLR-SP-01", "CCTV-SP-01"],
  ["VIB-02", "NOI-CR-01"],
]

export function getMiningSensors(): MiningSensor[] {
  return miningSensors
}

export function getMiningAreas(): MiningArea[] {
  return miningAreaDefinitions.map((area) => ({
    ...area,
    sensorIds: miningSensors
      .filter((sensor) => sensor.areaId === area.id)
      .map((sensor) => sensor.id),
  }))
}

export function getMiningAreaById(areaId: string): MiningArea | undefined {
  return getMiningAreas().find((area) => area.id === areaId)
}

export function getSensorsByArea(areaId: string): MiningSensor[] {
  return miningSensors.filter((sensor) => sensor.areaId === areaId)
}

export function getAreaStatusCounts(areaId: string) {
  return getStatusSummary(getSensorsByArea(areaId))
}

export function getMiningStatusSummary(sensors: MiningSensor[] = miningSensors) {
  return getStatusSummary(sensors)
}

function getStatusSummary(sensors: MiningSensor[]) {
  return sensors.reduce(
    (summary, sensor) => {
      summary.total += 1
      summary[sensor.status] += 1
      return summary
    },
    { total: 0, normal: 0, caution: 0, danger: 0 },
  )
}

export function getMiningSensorTypeSummary(sensors: MiningSensor[] = miningSensors) {
  return sensors.reduce(
    (summary, sensor) => {
      summary[sensor.type] += 1
      return summary
    },
    {
      tiltmeter: 0,
      "crack-meter": 0,
      piezometer: 0,
      "rain-gauge": 0,
      vibration: 0,
      gnss: 0,
      adr: 0,
      awlr: 0,
      awqr: 0,
      aws: 0,
      cctv: 0,
      dust: 0,
      noise: 0,
      gas: 0,
    } satisfies Record<MiningSensorType, number>,
  )
}

export function getPrioritySensors(areaId?: string): MiningSensor[] {
  return miningSensors
    .filter((sensor) => sensor.status !== "normal")
    .filter((sensor) => !areaId || sensor.areaId === areaId)
    .sort((sensorA, sensorB) => {
      const severity = { danger: 0, caution: 1, normal: 2 }
      return severity[sensorA.status] - severity[sensorB.status]
    })
}

export function formatMiningSensorValue(sensor: MiningSensor) {
  return `${sensor.value.toLocaleString("id-ID", {
    maximumFractionDigits: 1,
    minimumFractionDigits: Number.isInteger(sensor.value) ? 0 : 1,
  })} ${sensor.unit}`
}

export function getMiningAreaName(areaId: string) {
  return getMiningAreaById(areaId)?.name ?? areaId
}
