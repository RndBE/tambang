import type { RiskStatus } from "@/lib/types";

export type CameraVisibility = "Clear" | "Rain" | "Low light" | "Cloudy" | "Dust";

export type DetectionBox = {
  id: string;
  label: string;
  confidence: number;
  severity: RiskStatus;
  bbox: { x: number; y: number; w: number; h: number };
};

export type CameraEvent = {
  id: string;
  minutesAgo: number;
  type: "Deteksi AI" | "Alarm" | "Snapshot" | "Maintenance" | "Recording";
  severity: RiskStatus;
  message: string;
};

export type CameraTimelineMark = {
  minutesAgo: number;
  severity: RiskStatus;
  label: string;
};

export type CameraFeed = {
  id: string;
  code: string;
  name: string;
  area: string;
  zone: "Pit" | "Plant" | "Infrastruktur" | "Logistik" | "Keamanan";
  status: RiskStatus;
  visibility: CameraVisibility;
  imageUrl: string;
  coordinate: string;
  resolution: string;
  fps: number;
  bitrateMbps: number;
  ptz: boolean;
  recording: boolean;
  audio: boolean;
  uptimeHours: number;
  storageDays: number;
  lastMaintenance: string;
  capturedAt: string;
  note: string;
  detections: DetectionBox[];
  timeline: CameraTimelineMark[];
  events: CameraEvent[];
};

const U = (id: string) =>
  `https://images.unsplash.com/${id}?w=1280&q=70&auto=format&fit=crop`;

export const cameraFeeds: CameraFeed[] = [
  {
    id: "cam-01",
    code: "CCTV-NHW-01",
    name: "North Highwall Bench 4",
    area: "North Highwall",
    zone: "Pit",
    status: "Siaga",
    visibility: "Rain",
    imageUrl: U("photo-1628487749130-2d41acb1802a"),
    coordinate: "-2.1457, 115.8024",
    resolution: "3840x2160",
    fps: 25,
    bitrateMbps: 8.4,
    ptz: true,
    recording: true,
    audio: false,
    uptimeHours: 482,
    storageDays: 14,
    lastMaintenance: "2026-04-18",
    capturedAt: "08:42:17",
    note: "Permukaan bench basah pasca hujan intensitas tinggi. Drainase aktif.",
    detections: [
      { id: "d1", label: "Genangan", confidence: 0.92, severity: "Siaga", bbox: { x: 18, y: 62, w: 26, h: 18 } },
      { id: "d2", label: "Excavator", confidence: 0.88, severity: "Normal", bbox: { x: 54, y: 48, w: 22, h: 28 } },
      { id: "d3", label: "Retak permukaan", confidence: 0.71, severity: "Waspada", bbox: { x: 8, y: 32, w: 18, h: 10 } },
    ],
    timeline: [
      { minutesAgo: 5, severity: "Siaga", label: "Genangan terdeteksi" },
      { minutesAgo: 32, severity: "Waspada", label: "Retak baru" },
      { minutesAgo: 70, severity: "Normal", label: "Inspeksi rutin" },
      { minutesAgo: 145, severity: "Normal", label: "Shift change" },
    ],
    events: [
      { id: "e1", minutesAgo: 5, type: "Deteksi AI", severity: "Siaga", message: "Genangan terdeteksi di bench 4 dengan luas >2 m²." },
      { id: "e2", minutesAgo: 32, type: "Deteksi AI", severity: "Waspada", message: "Retak permukaan baru di kuadran kiri." },
      { id: "e3", minutesAgo: 71, type: "Snapshot", severity: "Normal", message: "Snapshot manual diambil oleh operator shift A." },
    ],
  },
  {
    id: "cam-02",
    code: "CCTV-PITA-02",
    name: "Pit A Loading Point",
    area: "Pit A",
    zone: "Pit",
    status: "Normal",
    visibility: "Clear",
    imageUrl: U("photo-1753639762410-4e4e39346188"),
    coordinate: "-2.1488, 115.8061",
    resolution: "1920x1080",
    fps: 30,
    bitrateMbps: 6.1,
    ptz: true,
    recording: true,
    audio: true,
    uptimeHours: 712,
    storageDays: 21,
    lastMaintenance: "2026-05-02",
    capturedAt: "08:42:14",
    note: "Aktivitas loading normal, 3 unit haul truck antri.",
    detections: [
      { id: "d1", label: "Haul truck CAT 793", confidence: 0.96, severity: "Normal", bbox: { x: 22, y: 38, w: 38, h: 42 } },
      { id: "d2", label: "Operator (APD lengkap)", confidence: 0.83, severity: "Normal", bbox: { x: 68, y: 56, w: 8, h: 18 } },
    ],
    timeline: [
      { minutesAgo: 8, severity: "Normal", label: "Loading cycle #142" },
      { minutesAgo: 22, severity: "Normal", label: "Loading cycle #141" },
      { minutesAgo: 96, severity: "Waspada", label: "Antrian >5 unit" },
    ],
    events: [
      { id: "e1", minutesAgo: 8, type: "Recording", severity: "Normal", message: "Recording continuous selama 4 jam terakhir." },
      { id: "e2", minutesAgo: 96, type: "Deteksi AI", severity: "Waspada", message: "Antrian unit melebihi ambang batas 5 unit." },
    ],
  },
  {
    id: "cam-03",
    code: "CCTV-SP-03",
    name: "Settling Pond Outlet",
    area: "Settling Pond",
    zone: "Infrastruktur",
    status: "Waspada",
    visibility: "Cloudy",
    imageUrl: U("photo-1709489662983-3674d790b224"),
    coordinate: "-2.1521, 115.7998",
    resolution: "1920x1080",
    fps: 25,
    bitrateMbps: 5.2,
    ptz: false,
    recording: true,
    audio: false,
    uptimeHours: 1240,
    storageDays: 30,
    lastMaintenance: "2026-03-14",
    capturedAt: "08:42:11",
    note: "Freeboard menipis ke 0.48 m. Pompa standby disiapkan.",
    detections: [
      { id: "d1", label: "Permukaan air tinggi", confidence: 0.87, severity: "Waspada", bbox: { x: 14, y: 52, w: 72, h: 14 } },
    ],
    timeline: [
      { minutesAgo: 12, severity: "Waspada", label: "Freeboard < 0.5 m" },
      { minutesAgo: 84, severity: "Normal", label: "Pengukuran rutin" },
    ],
    events: [
      { id: "e1", minutesAgo: 12, type: "Alarm", severity: "Waspada", message: "Freeboard menipis di bawah 0.5 m." },
      { id: "e2", minutesAgo: 84, type: "Maintenance", severity: "Normal", message: "Lensa dibersihkan oleh teknisi." },
    ],
  },
  {
    id: "cam-04",
    code: "CCTV-HR-04",
    name: "Haul Road KM 2.4",
    area: "Haul Road",
    zone: "Logistik",
    status: "Normal",
    visibility: "Dust",
    imageUrl: U("photo-1711012604128-8339024a3e12"),
    coordinate: "-2.1410, 115.8112",
    resolution: "1920x1080",
    fps: 30,
    bitrateMbps: 5.8,
    ptz: true,
    recording: true,
    audio: false,
    uptimeHours: 530,
    storageDays: 14,
    lastMaintenance: "2026-05-10",
    capturedAt: "08:42:16",
    note: "Debu tinggi setelah lewat 4 haul truck. Water truck diminta menyiram.",
    detections: [
      { id: "d1", label: "Haul truck", confidence: 0.94, severity: "Normal", bbox: { x: 40, y: 42, w: 28, h: 36 } },
      { id: "d2", label: "Debu tinggi", confidence: 0.78, severity: "Waspada", bbox: { x: 0, y: 25, w: 100, h: 35 } },
    ],
    timeline: [
      { minutesAgo: 3, severity: "Normal", label: "Truck melintas" },
      { minutesAgo: 15, severity: "Waspada", label: "Debu meningkat" },
      { minutesAgo: 90, severity: "Normal", label: "Water truck lewat" },
    ],
    events: [
      { id: "e1", minutesAgo: 15, type: "Deteksi AI", severity: "Waspada", message: "Visibilitas turun ke <40% akibat debu." },
    ],
  },
  {
    id: "cam-05",
    code: "CCTV-CR-05",
    name: "Crusher Plant Feed",
    area: "Crusher Plant",
    zone: "Plant",
    status: "Normal",
    visibility: "Clear",
    imageUrl: U("photo-1672187493247-52c3084c9785"),
    coordinate: "-2.1532, 115.8048",
    resolution: "2560x1440",
    fps: 30,
    bitrateMbps: 7.2,
    ptz: false,
    recording: true,
    audio: true,
    uptimeHours: 2148,
    storageDays: 30,
    lastMaintenance: "2026-04-30",
    capturedAt: "08:42:13",
    note: "Throughput stabil 1.2k tph. Tidak ada material oversize.",
    detections: [
      { id: "d1", label: "Material flow", confidence: 0.93, severity: "Normal", bbox: { x: 32, y: 30, w: 38, h: 48 } },
    ],
    timeline: [
      { minutesAgo: 20, severity: "Normal", label: "Throughput check" },
      { minutesAgo: 110, severity: "Normal", label: "Belt inspection" },
    ],
    events: [
      { id: "e1", minutesAgo: 20, type: "Recording", severity: "Normal", message: "Recording 24/7 aktif." },
    ],
  },
  {
    id: "cam-06",
    code: "CCTV-STK-06",
    name: "Stockpile Coal A",
    area: "Stockpile",
    zone: "Plant",
    status: "Normal",
    visibility: "Clear",
    imageUrl: U("photo-1693774557231-e2be6c3594e8"),
    coordinate: "-2.1555, 115.8003",
    resolution: "1920x1080",
    fps: 25,
    bitrateMbps: 5.0,
    ptz: true,
    recording: true,
    audio: false,
    uptimeHours: 980,
    storageDays: 21,
    lastMaintenance: "2026-04-05",
    capturedAt: "08:42:15",
    note: "Tonase stockpile estimasi 24.3kt. Dozer aktif di sisi barat.",
    detections: [
      { id: "d1", label: "Bulldozer", confidence: 0.91, severity: "Normal", bbox: { x: 60, y: 52, w: 18, h: 22 } },
    ],
    timeline: [
      { minutesAgo: 18, severity: "Normal", label: "Push dozer cycle" },
      { minutesAgo: 145, severity: "Normal", label: "Survey volume" },
    ],
    events: [
      { id: "e1", minutesAgo: 145, type: "Snapshot", severity: "Normal", message: "Snapshot tonase otomatis." },
    ],
  },
  {
    id: "cam-07",
    code: "CCTV-WS-07",
    name: "Workshop Bay 2",
    area: "Workshop",
    zone: "Infrastruktur",
    status: "Awas",
    visibility: "Low light",
    imageUrl: U("photo-1647485938389-91df46750f1b"),
    coordinate: "-2.1402, 115.7965",
    resolution: "1920x1080",
    fps: 25,
    bitrateMbps: 4.8,
    ptz: false,
    recording: true,
    audio: true,
    uptimeHours: 1880,
    storageDays: 30,
    lastMaintenance: "2026-02-22",
    capturedAt: "08:42:09",
    note: "Asap terdeteksi dari area welding. Tim respon dikirim.",
    detections: [
      { id: "d1", label: "Asap", confidence: 0.84, severity: "Awas", bbox: { x: 30, y: 18, w: 38, h: 28 } },
      { id: "d2", label: "Mekanik (APD lengkap)", confidence: 0.79, severity: "Normal", bbox: { x: 12, y: 60, w: 12, h: 30 } },
    ],
    timeline: [
      { minutesAgo: 2, severity: "Awas", label: "Asap terdeteksi" },
      { minutesAgo: 30, severity: "Normal", label: "Welding mulai" },
      { minutesAgo: 120, severity: "Normal", label: "Shift maintenance" },
    ],
    events: [
      { id: "e1", minutesAgo: 2, type: "Alarm", severity: "Awas", message: "Smoke detection algoritma memicu alarm kelas A." },
      { id: "e2", minutesAgo: 30, type: "Deteksi AI", severity: "Normal", message: "Aktivitas welding terdeteksi (terjadwal)." },
    ],
  },
  {
    id: "cam-08",
    code: "CCTV-FB-08",
    name: "Fuel Bay Tank Farm",
    area: "Fuel Bay",
    zone: "Infrastruktur",
    status: "Normal",
    visibility: "Clear",
    imageUrl: U("photo-1523848309072-c199db53f137"),
    coordinate: "-2.1389, 115.7948",
    resolution: "1920x1080",
    fps: 30,
    bitrateMbps: 5.4,
    ptz: false,
    recording: true,
    audio: false,
    uptimeHours: 2310,
    storageDays: 60,
    lastMaintenance: "2026-04-12",
    capturedAt: "08:42:18",
    note: "Refueling normal. Sensor LEL gas 0%.",
    detections: [
      { id: "d1", label: "Fuel truck", confidence: 0.95, severity: "Normal", bbox: { x: 45, y: 42, w: 30, h: 36 } },
    ],
    timeline: [
      { minutesAgo: 25, severity: "Normal", label: "Refueling truck #14" },
      { minutesAgo: 95, severity: "Normal", label: "Inspeksi shift" },
    ],
    events: [
      { id: "e1", minutesAgo: 25, type: "Recording", severity: "Normal", message: "Refueling tercatat." },
    ],
  },
  {
    id: "cam-09",
    code: "CCTV-GT-09",
    name: "Main Gate Security",
    area: "Gate Utama",
    zone: "Keamanan",
    status: "Normal",
    visibility: "Clear",
    imageUrl: U("photo-1616694906857-2c938fe630bf"),
    coordinate: "-2.1372, 115.7912",
    resolution: "2560x1440",
    fps: 30,
    bitrateMbps: 7.8,
    ptz: true,
    recording: true,
    audio: true,
    uptimeHours: 4320,
    storageDays: 90,
    lastMaintenance: "2026-05-15",
    capturedAt: "08:42:20",
    note: "ANPR aktif. Tercatat 142 kendaraan masuk shift pagi.",
    detections: [
      { id: "d1", label: "Plat: B-1742-CXX", confidence: 0.98, severity: "Normal", bbox: { x: 40, y: 58, w: 22, h: 12 } },
    ],
    timeline: [
      { minutesAgo: 1, severity: "Normal", label: "Kendaraan masuk" },
      { minutesAgo: 4, severity: "Normal", label: "ID badge scan" },
      { minutesAgo: 60, severity: "Normal", label: "Patroli security" },
    ],
    events: [
      { id: "e1", minutesAgo: 1, type: "Deteksi AI", severity: "Normal", message: "ANPR match: B-1742-CXX (terdaftar)." },
    ],
  },
  {
    id: "cam-10",
    code: "CCTV-RP-10",
    name: "ROM Pad Diversion",
    area: "ROM Pad",
    zone: "Plant",
    status: "Waspada",
    visibility: "Dust",
    imageUrl: "/dummy_cctv/pelabuhan-smg.jpg",
    coordinate: "-2.1564, 115.8030",
    resolution: "1920x1080",
    fps: 25,
    bitrateMbps: 5.6,
    ptz: false,
    recording: true,
    audio: false,
    uptimeHours: 690,
    storageDays: 21,
    lastMaintenance: "2026-04-22",
    capturedAt: "08:42:08",
    note: "Material oversize terdeteksi 2 kali dalam 30 menit terakhir.",
    detections: [
      { id: "d1", label: "Boulder oversize", confidence: 0.81, severity: "Waspada", bbox: { x: 52, y: 50, w: 16, h: 18 } },
    ],
    timeline: [
      { minutesAgo: 6, severity: "Waspada", label: "Boulder #2" },
      { minutesAgo: 28, severity: "Waspada", label: "Boulder #1" },
      { minutesAgo: 130, severity: "Normal", label: "Clean cycle" },
    ],
    events: [
      { id: "e1", minutesAgo: 6, type: "Deteksi AI", severity: "Waspada", message: "Material oversize >1.2 m terdeteksi." },
    ],
  },
  {
    id: "cam-11",
    code: "CCTV-CJ-11",
    name: "Conveyor Junction CV-03",
    area: "Conveyor",
    zone: "Plant",
    status: "Normal",
    visibility: "Clear",
    imageUrl: "/dummy_cctv/tanggul-pkl.jpg",
    coordinate: "-2.1547, 115.8077",
    resolution: "1920x1080",
    fps: 30,
    bitrateMbps: 6.0,
    ptz: false,
    recording: true,
    audio: true,
    uptimeHours: 2700,
    storageDays: 30,
    lastMaintenance: "2026-04-08",
    capturedAt: "08:42:12",
    note: "Belt tracking dalam toleransi. Tidak ada spillage.",
    detections: [
      { id: "d1", label: "Belt aktif", confidence: 0.97, severity: "Normal", bbox: { x: 20, y: 40, w: 60, h: 30 } },
    ],
    timeline: [
      { minutesAgo: 40, severity: "Normal", label: "Belt scan AI" },
      { minutesAgo: 180, severity: "Normal", label: "Maintenance check" },
    ],
    events: [
      { id: "e1", minutesAgo: 40, type: "Deteksi AI", severity: "Normal", message: "Belt tracking nominal." },
    ],
  },
  {
    id: "cam-12",
    code: "CCTV-PRM-12",
    name: "Perimeter East Fence",
    area: "Perimeter",
    zone: "Keamanan",
    status: "Waspada",
    visibility: "Low light",
    imageUrl: "/dummy_cctv/pesisir-pantura.webp",
    coordinate: "-2.1421, 115.8158",
    resolution: "1920x1080",
    fps: 15,
    bitrateMbps: 3.6,
    ptz: true,
    recording: true,
    audio: false,
    uptimeHours: 3120,
    storageDays: 60,
    lastMaintenance: "2026-03-28",
    capturedAt: "08:42:05",
    note: "Pergerakan terdeteksi di luar pagar pukul 03:14. Belum tervalidasi.",
    detections: [
      { id: "d1", label: "Pergerakan tidak dikenal", confidence: 0.66, severity: "Waspada", bbox: { x: 64, y: 48, w: 12, h: 24 } },
    ],
    timeline: [
      { minutesAgo: 9, severity: "Waspada", label: "Motion detect" },
      { minutesAgo: 320, severity: "Normal", label: "Patroli rutin" },
    ],
    events: [
      { id: "e1", minutesAgo: 9, type: "Alarm", severity: "Waspada", message: "Motion detection di luar fence — perlu validasi." },
    ],
  },
];
