export type MineNetworkSensorType =
  | "tiltmeter"
  | "crack-meter"
  | "piezometer"
  | "rain-gauge"
  | "vibration"
  | "gnss"
  | "adr"

export type MineNetworkSensorStatus = "normal" | "caution" | "danger"

export type MineNetworkSensor = {
  id: string
  name: string
  type: MineNetworkSensorType
  status: MineNetworkSensorStatus
  zone: string
  criticalPoint: string
  x: number
  y: number
  value: number
  unit: string
  threshold: string
  trend: "naik" | "stabil" | "turun"
  lastUpdate: string
  battery: number
  signal: number
  note: string
}

export const mineNetworkTypeLabels: Record<MineNetworkSensorType, string> = {
  tiltmeter: "Tiltmeter",
  "crack-meter": "Crack Meter",
  piezometer: "Piezometer",
  "rain-gauge": "Rain Gauge",
  vibration: "Vibration",
  gnss: "GNSS",
  adr: "ADR",
}

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
    id: "GNSS-HW-02",
    name: "GNSS Highwall Crest 02",
    type: "gnss",
    status: "danger",
    zone: "North Highwall",
    criticalPoint: "Crest Line",
    x: 62,
    y: 50,
    value: 64.3,
    unit: "mm",
    threshold: "> 55 mm",
    trend: "naik",
    lastUpdate: "10:46",
    battery: 91,
    signal: 90,
    note: "Pergerakan horizontal GNSS melebihi ambang siaga.",
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
]

export const mineNetworkLines: Array<[string, string]> = [
  ["ARR-HW-01", "TLT-HW-01"],
  ["TLT-HW-01", "ADR-HW-01"],
  ["ADR-HW-01", "GNSS-HW-02"],
  ["GNSS-HW-02", "CRK-PA-01"],
  ["CRK-PA-01", "ADR-DP-01"],
  ["ADR-DP-01", "PZ-DP-01"],
  ["ADR-DP-01", "PZ-TD-01"],
  ["ADR-HW-01", "VIB-CR-01"],
]

export function getMineNetworkStatusSummary(sensors: MineNetworkSensor[]) {
  return sensors.reduce(
    (summary, sensor) => {
      summary.total += 1
      summary[sensor.status] += 1
      return summary
    },
    { total: 0, normal: 0, caution: 0, danger: 0 },
  )
}

export function getMineNetworkTypeSummary(sensors: MineNetworkSensor[]) {
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
    } satisfies Record<MineNetworkSensorType, number>,
  )
}

export function formatMineNetworkValue(sensor: MineNetworkSensor) {
  return `${sensor.value.toLocaleString("id-ID", {
    maximumFractionDigits: 1,
    minimumFractionDigits: Number.isInteger(sensor.value) ? 0 : 1,
  })} ${sensor.unit}`
}
