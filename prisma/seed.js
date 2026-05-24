/* eslint-disable @typescript-eslint/no-require-imports */
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const now = new Date("2026-05-19T01:30:00.000Z");

function hoursAgo(hours) {
  return new Date(now.getTime() - hours * 60 * 60 * 1000);
}

function minutesAgo(minutes) {
  return new Date(now.getTime() - minutes * 60 * 1000);
}

function daysAgo(days) {
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

function round(value, digits = 2) {
  return Number(value.toFixed(digits));
}

function buildGnssReadings({
  pointId,
  totalDays = 180,
  startElevationM,
  endElevationM,
  startSubsidenceCm,
  endSubsidenceCm,
  startVelocityCmYear,
  endVelocityCmYear,
}) {
  const rows = [];

  function readingAt(dayAgo) {
    const progress = (totalDays - dayAgo) / totalDays;
    const seasonal = Math.sin(progress * Math.PI * 6) * 0.08;
    const shortNoise = Math.cos(progress * Math.PI * 13) * 0.03;
    const elevation =
      startElevationM + (endElevationM - startElevationM) * progress;
    const subsidence =
      startSubsidenceCm +
      (endSubsidenceCm - startSubsidenceCm) * progress +
      seasonal;
    const velocity =
      startVelocityCmYear +
      (endVelocityCmYear - startVelocityCmYear) * progress +
      shortNoise;

    return {
      pointId,
      recordedAt: daysAgo(dayAgo),
      elevationM: round(elevation, 3),
      subsidenceCm: round(subsidence, 2),
      velocityCmYear: round(velocity, 2),
    };
  }

  for (let day = totalDays; day >= 4; day -= 1) {
    rows.push(readingAt(day));
  }

  for (let hour = 72; hour >= 0; hour -= 1) {
    rows.push(readingAt(hour / 24));
  }

  return rows;
}

function buildWaterLevelReadings({
  pointId,
  days = 180,
  baseLevelM,
  amplitudeM,
  endLevelM,
  phase = 0,
  waspadaM,
  siagaM,
  awasM,
  eventBiasM = 0,
}) {
  const totalHours = days * 24;
  const rows = [];

  function bell(elapsedHours, centerHours, widthHours, heightM) {
    const distance = (elapsedHours - centerHours) / widthHours;

    return heightM * Math.exp(-(distance * distance) / 2);
  }

  function jitter(elapsedHours) {
    return (
      Math.sin(elapsedHours * 0.73 + phase * 11) * 0.009 +
      Math.cos(elapsedHours * 0.19 + phase * 7) * 0.006
    );
  }

  function rawValueAt(elapsedHours) {
    const progress = elapsedHours / totalHours;
    const meanLevel = baseLevelM + eventBiasM * Math.pow(progress, 1.4);
    const pumpCycle =
      amplitudeM *
      0.28 *
      Math.sin((elapsedHours / 8 + phase) * Math.PI * 2);
    const rainfallInflow =
      bell(elapsedHours, totalHours * 0.18, 26, amplitudeM * 0.28) +
      bell(elapsedHours, totalHours * 0.46, 42, amplitudeM * 0.36) +
      bell(elapsedHours, totalHours * 0.73, 54, amplitudeM * 0.42) +
      bell(elapsedHours, totalHours - 10, 18, amplitudeM * 0.58);
    const processVariation =
      amplitudeM *
      0.18 *
      Math.sin((elapsedHours / (5.6 * 24) + phase * 1.7) * Math.PI * 2);

    return meanLevel + pumpCycle + rainfallInflow + processVariation + jitter(elapsedHours);
  }

  const finalCorrection = endLevelM - rawValueAt(totalHours);

  function valueAt(hoursBack) {
    const elapsed = totalHours - hoursBack;
    const progress = elapsed / totalHours;

    return rawValueAt(elapsed) + finalCorrection * Math.pow(progress, 2.6);
  }

  function row(recordedAt, hoursBack) {
    return {
      pointId,
      recordedAt,
      waterLevelM: round(valueAt(hoursBack), 2),
      waspadaM,
      siagaM,
      awasM,
    };
  }

  for (let day = days; day >= 4; day -= 1) {
    const hoursBack = day * 24;
    rows.push(row(hoursAgo(hoursBack), hoursBack));
  }

  for (let hour = 72; hour > 24; hour -= 1) {
    rows.push(row(hoursAgo(hour), hour));
  }

  for (let minute = 24 * 60; minute >= 0; minute -= 30) {
    rows.push(row(minutesAgo(minute), minute / 60));
  }

  return rows;
}

function buildWeatherReadings({
  pointId,
  rainfallPeakMm,
  temperatureBaseC,
  humidityBasePct,
  windBaseMs,
}) {
  const rows = [];

  for (let hour = 120; hour >= 0; hour -= 3) {
    const cycle = (120 - hour) / 120;
    const rainPulse = Math.max(
      0,
      Math.sin((cycle * 5 + rainfallPeakMm / 10) * Math.PI),
    );

    rows.push({
      pointId,
      recordedAt: hoursAgo(hour),
      rainfallMm: round(rainPulse * rainfallPeakMm, 1),
      temperatureC: round(
        temperatureBaseC + Math.sin(cycle * Math.PI * 8) * 1.8,
        1,
      ),
      humidityPct: round(
        Math.min(96, humidityBasePct + rainPulse * 12 + Math.cos(cycle * 9) * 4),
        1,
      ),
      pressureHpa: round(1009 + Math.cos(cycle * Math.PI * 4) * 3.2, 1),
      windSpeedMs: round(windBaseMs + Math.sin(cycle * Math.PI * 7) * 1.4, 1),
    });
  }

  return rows;
}

function progressShape(progress, profile) {
  if (profile === "stable") return progress * 0.15;
  if (profile === "creep") return progress;
  if (profile === "accelerating") return Math.pow(progress, 2.1);
  if (profile === "outlier") return Math.pow(progress, 2.6) * 1.2;
  return progress;
}

function buildPrismReadings({
  prismId,
  totalDays = 180,
  finalDxMm,
  finalDyMm,
  finalDzMm,
  profile = "creep",
  phase = 0,
  visibleFromHoursAgo = null,
}) {
  const rows = [];

  function readingAt(hoursBack) {
    const elapsedHours = totalDays * 24 - hoursBack;
    const progress = elapsedHours / (totalDays * 24);

    const shape = progressShape(progress, profile);
    const prevShape = progressShape(
      Math.max(0, elapsedHours - 24) / (totalDays * 24),
      profile,
    );

    const jitterCommon = Math.sin(elapsedHours * 0.13 + phase * 7) * 0.4;
    const jitterSlow = Math.cos(elapsedHours * 0.05 + phase * 3) * 0.3;
    const jitterDx = jitterCommon * 0.25 + jitterSlow * 0.15;
    const jitterDy = jitterCommon * 0.2 + jitterSlow * 0.18;
    const jitterDz = jitterCommon * 0.5 + jitterSlow * 0.32;

    const dx = finalDxMm * shape + jitterDx;
    const dy = finalDyMm * shape + jitterDy;
    const dz = finalDzMm * shape + jitterDz;
    const total = Math.sqrt(dx * dx + dy * dy + dz * dz);

    const prevDx = finalDxMm * prevShape;
    const prevDy = finalDyMm * prevShape;
    const prevDz = finalDzMm * prevShape;
    const prevTotal = Math.sqrt(
      prevDx * prevDx + prevDy * prevDy + prevDz * prevDz,
    );
    const velocityMmDay = total - prevTotal;
    const velocityCmYear = (velocityMmDay * 365) / 10;

    const prismVisible =
      visibleFromHoursAgo == null ? true : hoursBack >= visibleFromHoursAgo;

    return {
      prismId,
      recordedAt: new Date(now.getTime() - hoursBack * 60 * 60 * 1000),
      dxMm: round(dx, 2),
      dyMm: round(dy, 2),
      dzMm: round(dz, 2),
      totalDisplacementMm: round(total, 2),
      velocityMmDay: round(velocityMmDay, 3),
      velocityCmYear: round(velocityCmYear, 2),
      slopeDistanceM: round(
        320 + Math.sin(elapsedHours * 0.01 + phase) * 0.4,
        3,
      ),
      hzAngleDeg: round(
        180 + Math.sin(phase * 1.7) * 30 + Math.cos(elapsedHours * 0.001) * 0.08,
        4,
      ),
      vtAngleDeg: round(
        88 + Math.sin(phase * 0.9) * 6 + Math.cos(elapsedHours * 0.002) * 0.04,
        4,
      ),
      prismVisible,
    };
  }

  for (let day = totalDays; day >= 2; day -= 1) {
    rows.push(readingAt(day * 24));
  }
  for (let hour = 36; hour >= 0; hour -= 1) {
    rows.push(readingAt(hour));
  }
  return rows;
}

function generatePrismsForStation(stationKey, prismCount, baseLat, baseLng, baseElev, statusProfile) {
  const prisms = [];
  for (let i = 1; i <= prismCount; i++) {
    const r1 = Math.sin(i * 2.7 + stationKey.length * 0.31);
    const r2 = Math.cos(i * 1.9 + stationKey.length * 0.71);
    const r3 = Math.sin(i * 0.83 + stationKey.length * 0.13);

    let profile = "stable";
    let finalDx = r1 * 1.5;
    let finalDy = r2 * 1.5;
    let finalDz = -3 + r3 * 2;
    let status = "NORMAL";
    let visible = true;
    let visibleFromHoursAgo = null;
    let notes = null;

    if (statusProfile === "critical") {
      if (i === 1) {
        profile = "outlier";
        finalDx = -6 + r1 * 4;
        finalDy = 3 + r2 * 4;
        finalDz = -48 + r3 * 6;
        status = "SIAGA";
        notes = "Prism outlier, percepatan dz teramati dalam 14 hari terakhir.";
      } else if (i === 2 || i === 3) {
        profile = "accelerating";
        finalDx = r1 * 5;
        finalDy = r2 * 5;
        finalDz = -26 + r3 * 4;
        status = "WASPADA";
      }
    } else if (statusProfile === "alert") {
      if (i === 1 || i === 2) {
        profile = "accelerating";
        finalDx = r1 * 4;
        finalDy = r2 * 4;
        finalDz = -22 + r3 * 4;
        status = "WASPADA";
      } else if (i === 3) {
        profile = "creep";
        finalDz = -15 + r3 * 3;
        status = "WASPADA";
      }
    } else if (statusProfile === "watch") {
      if (i === 1) {
        profile = "creep";
        finalDx = r1 * 3;
        finalDy = r2 * 3;
        finalDz = -14 + r3 * 3;
        status = "WASPADA";
      }
    }

    // Lost prism scenario: last prism of stations with status != calm becomes invisible
    if (statusProfile !== "calm" && i === prismCount) {
      visible = false;
      profile = "stable";
      finalDx = r1 * 0.4;
      finalDy = r2 * 0.4;
      finalDz = -1 + r3 * 0.5;
      status = "WASPADA";
      visibleFromHoursAgo = 36;
      notes = "Prism kehilangan target sejak 36 jam lalu — perlu pemasangan ulang.";
    }

    prisms.push({
      code: `prsm-${stationKey}-${String(i).padStart(2, "0")}`,
      label: `Prism ${String(i).padStart(2, "0")}`,
      latitude: round(baseLat + r1 * 0.00085, 6),
      longitude: round(baseLng + r2 * 0.00085, 6),
      baselineElevationM: round(baseElev + r3 * 8, 2),
      status,
      visible,
      profile,
      finalDxMm: round(finalDx, 2),
      finalDyMm: round(finalDy, 2),
      finalDzMm: round(finalDz, 2),
      phase: i * 0.73 + stationKey.length * 0.21,
      visibleFromHoursAgo,
      notes,
    });
  }
  return prisms;
}

async function main() {
  await prisma.report.deleteMany();
  await prisma.reportTemplate.deleteMany();
  await prisma.maintenanceLog.deleteMany();
  await prisma.alarm.deleteMany();
  await prisma.event.deleteMany();
  await prisma.cameraSnapshot.deleteMany();
  await prisma.weatherReading.deleteMany();
  await prisma.waterLevelReading.deleteMany();
  await prisma.gnssReading.deleteMany();
  await prisma.prismReading.deleteMany();
  await prisma.prism.deleteMany();
  await prisma.pointThreshold.deleteMany();
  await prisma.device.deleteMany();
  await prisma.monitoringPoint.deleteMany();
  await prisma.monitoringArea.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
  await prisma.threshold.deleteMany();
  await prisma.riskWeight.deleteMany();

  const roles = await Promise.all(
    [
      ["Super Admin", "Semua fitur dan pengaturan sistem"],
      ["Admin Instansi", "Monitoring, laporan, pengaturan area"],
      ["Operator", "Monitoring, alarm, catatan event"],
      ["Teknisi", "Status perangkat dan maintenance"],
      ["Viewer", "Dashboard dan laporan terbatas"],
      ["Stakeholder", "Executive summary dan peta risiko"],
    ].map(([name, access]) =>
      prisma.role.create({
        data: { name, access },
      }),
    ),
  );

  const roleId = (name) => roles.find((role) => role.name === name).id;

  await prisma.user.createMany({
    data: [
      { name: "Operator Tambang", email: "operator@mining.local", passwordHash: bcrypt.hashSync("operator123", 10), roleId: roleId("Operator") },
      { name: "Admin Geoteknik", email: "admin@mining.local", passwordHash: bcrypt.hashSync("admin123", 10), roleId: roleId("Admin Instansi") },
      { name: "Teknisi Instrumentasi", email: "teknisi@mining.local", passwordHash: bcrypt.hashSync("teknisi123", 10), roleId: roleId("Teknisi") },
      { name: "Viewer Manajemen", email: "viewer@mining.local", passwordHash: bcrypt.hashSync("viewer123", 10), roleId: roleId("Viewer") },
      { name: "Super Admin", email: "superadmin@mining.local", passwordHash: bcrypt.hashSync("superadmin123", 10), roleId: roleId("Super Admin") },
    ],
  });

  const areaDefinitions = [
    ["area-pit-a", "Pit A", "Area pit aktif dengan pemantauan lereng, cuaca kerja, dan deformasi bench."],
    ["area-pit-b", "Pit B", "Koridor haul road dan area workshop dengan pemantauan paparan debu serta kebisingan."],
    ["area-north-highwall", "North Highwall", "Lereng tinggi sisi utara dengan prioritas pemantauan pergerakan dan curah hujan."],
    ["area-south-dump", "South Dump", "Timbunan disposal selatan dengan pemantauan deformasi dan tekanan air pori."],
    ["area-settling-pond", "Settling Pond", "Kolam pengendapan dan outlet air tambang dengan pemantauan level serta kualitas lingkungan."],
    ["area-tailing-dam", "Tailing Dam", "Fasilitas penampungan tailing dan portal risiko dengan pemantauan gas serta inspeksi visual."],
  ];

  const areaByKey = {};
  for (const [key, name, description] of areaDefinitions) {
    areaByKey[key] = await prisma.monitoringArea.create({
      data: { name, city: "Demo Mine", province: "Kalimantan", description },
    });
  }

  const pointDefinitions = [
    ["adrHw01", "adr-hw-01", "ADR North Highwall 01", "GNSS", "area-north-highwall", "SIAGA", "Displacement 42 mm", -1.214, 116.812, 186.4, 186.358, -4.2, -8.4, hoursAgo(0.03)],
    ["adrDump01", "adr-dump-01", "ADR South Dump 01", "GNSS", "area-south-dump", "WASPADA", "Displacement 27 mm", -1.231, 116.798, 142.8, 142.773, -2.7, -5.2, hoursAgo(0.08)],
    ["adrPitA01", "adr-pit-a-01", "ADR Pit A 01", "GNSS", "area-pit-a", "NORMAL", "Displacement 8 mm", -1.223, 116.824, 98.2, 98.192, -0.8, -1.4, hoursAgo(0.12)],
    ["awlrSp01", "awlr-sp-01", "AWLR Settling Pond 01", "AWLR", "area-settling-pond", "WASPADA", "Level 3.18 m", -1.242, 116.835, null, null, null, null, now],
    ["awqrSp01", "awqr-sp-01", "AWQR Settling Pond Outlet", "WEATHER", "area-settling-pond", "NORMAL", "pH 7.2, TSS normal", -1.246, 116.839, null, null, null, null, hoursAgo(0.2)],
    ["arrHw01", "arr-hw-01", "ARR North Highwall", "WEATHER", "area-north-highwall", "SIAGA", "Rainfall 82 mm/24h", -1.216, 116.815, null, null, null, null, hoursAgo(0.05)],
    ["awsPitA01", "aws-pit-a-01", "AWS Pit A", "WEATHER", "area-pit-a", "NORMAL", "Weather normal", -1.225, 116.828, null, null, null, null, hoursAgo(0.16)],
    ["pzDump01", "pz-dump-01", "Piezometer South Dump 01", "WEATHER", "area-south-dump", "WASPADA", "Pore pressure 118 kPa", -1.234, 116.794, null, null, null, null, hoursAgo(0.18)],
    ["dustHaul01", "dust-haul-01", "Dust Sensor Haul Road 01", "WEATHER", "area-pit-b", "WASPADA", "PM10 148 ug/m3", -1.219, 116.804, null, null, null, null, hoursAgo(0.22)],
    ["noiseWs01", "noise-ws-01", "Noise Sensor Workshop", "WEATHER", "area-pit-b", "NORMAL", "Noise 68 dBA", -1.217, 116.799, null, null, null, null, hoursAgo(0.28)],
    ["gasUg01", "gas-ug-01", "Gas Sensor UG Portal 01", "WEATHER", "area-tailing-dam", "AWAS", "CO 72 ppm", -1.251, 116.807, null, null, null, null, hoursAgo(0.04)],
    ["cctvHw01", "cctv-hw-01", "CCTV North Highwall", "CCTV", "area-north-highwall", "SIAGA", "Online", -1.215, 116.817, null, null, null, null, hoursAgo(0.1)],
    ["cctvSp01", "cctv-sp-01", "CCTV Settling Pond", "CCTV", "area-settling-pond", "WASPADA", "Online", -1.244, 116.837, null, null, null, null, hoursAgo(0.15)],
  ];

  const points = {};
  for (const [key, code, name, type, areaKey, status, latestValue, latitude, longitude, baselineElevationM, currentElevationM, totalSubsidenceCm, velocityCmYear, lastUpdate] of pointDefinitions) {
    points[key] = await prisma.monitoringPoint.create({
      data: { code, name, type, latitude, longitude, areaId: areaByKey[areaKey].id, status, latestValue, baselineElevationM, currentElevationM, totalSubsidenceCm, velocityCmYear, lastUpdate },
    });
  }

  await prisma.gnssReading.createMany({
    data: [
      ...buildGnssReadings({ pointId: points.adrHw01.id, startElevationM: 186.39, endElevationM: 186.358, startSubsidenceCm: -1.2, endSubsidenceCm: -4.2, startVelocityCmYear: -3.1, endVelocityCmYear: -8.4 }),
      ...buildGnssReadings({ pointId: points.adrDump01.id, startElevationM: 142.79, endElevationM: 142.773, startSubsidenceCm: -0.9, endSubsidenceCm: -2.7, startVelocityCmYear: -2.4, endVelocityCmYear: -5.2 }),
      ...buildGnssReadings({ pointId: points.adrPitA01.id, startElevationM: 98.198, endElevationM: 98.192, startSubsidenceCm: -0.2, endSubsidenceCm: -0.8, startVelocityCmYear: -0.8, endVelocityCmYear: -1.4 }),
    ],
  });

  await prisma.waterLevelReading.createMany({
    data: buildWaterLevelReadings({ pointId: points.awlrSp01.id, baseLevelM: 2.64, amplitudeM: 0.22, endLevelM: 3.18, phase: 0.32, eventBiasM: 0.18, waspadaM: 3, siagaM: 3.35, awasM: 3.65 }),
  });

  await prisma.weatherReading.createMany({
    data: [
      ...buildWeatherReadings({ pointId: points.awqrSp01.id, rainfallPeakMm: 18, temperatureBaseC: 29.6, humidityBasePct: 81, windBaseMs: 2.3 }),
      ...buildWeatherReadings({ pointId: points.arrHw01.id, rainfallPeakMm: 82, temperatureBaseC: 27.8, humidityBasePct: 88, windBaseMs: 4.1 }),
      ...buildWeatherReadings({ pointId: points.awsPitA01.id, rainfallPeakMm: 12, temperatureBaseC: 30.4, humidityBasePct: 72, windBaseMs: 3.5 }),
      ...buildWeatherReadings({ pointId: points.pzDump01.id, rainfallPeakMm: 36, temperatureBaseC: 28.7, humidityBasePct: 84, windBaseMs: 2.7 }),
      ...buildWeatherReadings({ pointId: points.dustHaul01.id, rainfallPeakMm: 8, temperatureBaseC: 31.2, humidityBasePct: 68, windBaseMs: 5.2 }),
      ...buildWeatherReadings({ pointId: points.noiseWs01.id, rainfallPeakMm: 6, temperatureBaseC: 30.8, humidityBasePct: 70, windBaseMs: 2.9 }),
      ...buildWeatherReadings({ pointId: points.gasUg01.id, rainfallPeakMm: 22, temperatureBaseC: 28.9, humidityBasePct: 86, windBaseMs: 1.8 }),
    ],
  });

  await prisma.device.createMany({
    data: [
      { code: "dev-adr-hw-01", name: "Logger ADR North Highwall 01", type: "GNSS", status: "ONLINE", battery: 82, signal: 76, firmwareVersion: "2.2.0", sensorStatus: "ADR aktif, displacement terukur", lastDataReceived: hoursAgo(0.03), pointId: points.adrHw01.id },
      { code: "dev-adr-dump-01", name: "Logger ADR South Dump 01", type: "GNSS", status: "WEAK", battery: 61, signal: 48, firmwareVersion: "2.2.0", sensorStatus: "ADR aktif, sinyal telemetry melemah", lastDataReceived: hoursAgo(0.08), pointId: points.adrDump01.id },
      { code: "dev-adr-pit-a-01", name: "Logger ADR Pit A 01", type: "GNSS", status: "ONLINE", battery: 89, signal: 83, firmwareVersion: "2.2.0", sensorStatus: "ADR stabil", lastDataReceived: hoursAgo(0.12), pointId: points.adrPitA01.id },
      { code: "dev-awlr-sp-01", name: "Telemetry AWLR Settling Pond 01", type: "AWLR", status: "ONLINE", battery: 74, signal: 69, firmwareVersion: "1.9.5", sensorStatus: "Level kolam aktif", lastDataReceived: now, pointId: points.awlrSp01.id },
      { code: "dev-awqr-sp-01", name: "Telemetry AWQR Settling Pond Outlet", type: "WEATHER", status: "ONLINE", battery: 77, signal: 71, firmwareVersion: "1.6.2", sensorStatus: "Kualitas air outlet normal", lastDataReceived: hoursAgo(0.2), pointId: points.awqrSp01.id },
      { code: "dev-arr-hw-01", name: "Rain Gauge North Highwall", type: "WEATHER", status: "ONLINE", battery: 68, signal: 64, firmwareVersion: "1.7.1", sensorStatus: "Curah hujan tinggi, data aktif", lastDataReceived: hoursAgo(0.05), pointId: points.arrHw01.id },
      { code: "dev-aws-pit-a-01", name: "Weather Station Pit A", type: "WEATHER", status: "ONLINE", battery: 86, signal: 78, firmwareVersion: "1.7.1", sensorStatus: "Cuaca kerja normal", lastDataReceived: hoursAgo(0.16), pointId: points.awsPitA01.id },
      { code: "dev-pz-dump-01", name: "Piezometer South Dump 01", type: "WEATHER", status: "WEAK", battery: 57, signal: 52, firmwareVersion: "1.4.8", sensorStatus: "Tekanan air pori meningkat", lastDataReceived: hoursAgo(0.18), pointId: points.pzDump01.id },
      { code: "dev-dust-haul-01", name: "Dust Sensor Haul Road 01", type: "WEATHER", status: "ONLINE", battery: 72, signal: 66, firmwareVersion: "1.3.4", sensorStatus: "Debu haul road di atas ambang waspada", lastDataReceived: hoursAgo(0.22), pointId: points.dustHaul01.id },
      { code: "dev-noise-ws-01", name: "Noise Sensor Workshop", type: "WEATHER", status: "ONLINE", battery: 80, signal: 73, firmwareVersion: "1.3.4", sensorStatus: "Kebisingan workshop normal", lastDataReceived: hoursAgo(0.28), pointId: points.noiseWs01.id },
      { code: "dev-gas-ug-01", name: "Gas Sensor UG Portal 01", type: "WEATHER", status: "ONLINE", battery: 92, signal: 81, firmwareVersion: "1.5.0", sensorStatus: "CO di atas ambang awas", lastDataReceived: hoursAgo(0.04), pointId: points.gasUg01.id },
      { code: "dev-cctv-hw-01", name: "Camera North Highwall", type: "CCTV", status: "ONLINE", battery: 71, signal: 67, firmwareVersion: "1.8.4", sensorStatus: "Camera highwall online", lastDataReceived: hoursAgo(0.1), pointId: points.cctvHw01.id },
      { code: "dev-cctv-sp-01", name: "Camera Settling Pond", type: "CCTV", status: "WEAK", battery: 49, signal: 55, firmwareVersion: "1.8.4", sensorStatus: "Camera pond online, panel perlu pengecekan", lastDataReceived: hoursAgo(0.15), pointId: points.cctvSp01.id },
    ],
  });

  const devices = await prisma.device.findMany();
  const deviceByCode = new Map(devices.map((device) => [device.code, device]));
  const getDeviceId = (code) => {
    const device = deviceByCode.get(code);
    if (!device) {
      throw new Error(`Device ${code} tidak ditemukan setelah seed.`);
    }
    return device.id;
  };

  await prisma.cameraSnapshot.createMany({
    data: [
      { pointId: points.cctvHw01.id, capturedAt: hoursAgo(0.1), imageUrl: null, visibility: "Clear", status: "SIAGA", note: "Permukaan bench North Highwall terlihat basah setelah hujan intensitas tinggi." },
      { pointId: points.cctvHw01.id, capturedAt: hoursAgo(3), imageUrl: null, visibility: "Rain", status: "SIAGA", note: "Drainase bench mengalir deras dan area kerja dibatasi sementara." },
      { pointId: points.cctvHw01.id, capturedAt: hoursAgo(9), imageUrl: null, visibility: "Low light", status: "WASPADA", note: "Lampu inspeksi aktif, tidak terlihat material jatuh baru." },
      { pointId: points.cctvSp01.id, capturedAt: hoursAgo(0.15), imageUrl: null, visibility: "Clear", status: "WASPADA", note: "Freeboard Settling Pond menipis dan pompa standby disiapkan." },
      { pointId: points.cctvSp01.id, capturedAt: hoursAgo(4), imageUrl: null, visibility: "Cloudy", status: "WASPADA", note: "Aliran masuk dari drainase Pit A meningkat bertahap." },
      { pointId: points.cctvSp01.id, capturedAt: hoursAgo(8), imageUrl: null, visibility: "Clear", status: "NORMAL", note: "Outlet pond stabil dan tidak ada luapan di spillway." },
    ],
  });

  const prismStationConfigs = [
    {
      key: "adr-hw-w",
      code: "adr-hw-west-01",
      name: "ADR North Highwall West",
      type: "ADR",
      areaKey: "area-north-highwall",
      status: "SIAGA",
      statusProfile: "critical",
      latestValue: "Prism kritis Δ48 mm/180hari",
      latitude: -1.2129,
      longitude: 116.8108,
      baseElev: 188.4,
      lastUpdate: hoursAgo(0.05),
      instrumentModel: "Leica TM50",
      instrumentSerial: "TM50-22-114",
      prismCount: 12,
      device: { code: "dev-adr-hw-w-01", name: "Logger ADR North Highwall West", battery: 78, signal: 71, firmware: "3.1.0", sensorStatus: "ADR aktif, beberapa prism outlier", status: "ONLINE" },
    },
    {
      key: "adr-pit-b",
      code: "adr-pit-b-01",
      name: "ADR Pit B Bench",
      type: "ADR",
      areaKey: "area-pit-b",
      status: "WASPADA",
      statusProfile: "alert",
      latestValue: "Prism Δ22 mm, velocity meningkat",
      latitude: -1.2245,
      longitude: 116.8075,
      baseElev: 124.6,
      lastUpdate: hoursAgo(0.07),
      instrumentModel: "Leica TS60",
      instrumentSerial: "TS60-23-208",
      prismCount: 14,
      device: { code: "dev-adr-pit-b-01", name: "Logger ADR Pit B Bench", battery: 84, signal: 79, firmware: "3.1.0", sensorStatus: "ADR aktif, monitoring 14 prism", status: "ONLINE" },
    },
    {
      key: "rts-dump",
      code: "rts-dump-east-01",
      name: "RTS Disposal Dome East",
      type: "RTS",
      areaKey: "area-south-dump",
      status: "SIAGA",
      statusProfile: "critical",
      latestValue: "Prism toe dome Δ52 mm",
      latitude: -1.2336,
      longitude: 116.7984,
      baseElev: 138.2,
      lastUpdate: hoursAgo(0.06),
      instrumentModel: "Trimble S9 HP",
      instrumentSerial: "S9-21-077",
      prismCount: 11,
      device: { code: "dev-rts-dump-01", name: "Logger RTS Disposal Dome East", battery: 66, signal: 58, firmware: "2.9.4", sensorStatus: "RTS aktif, target dome dipantau", status: "WEAK" },
    },
    {
      key: "rts-tail",
      code: "rts-tailing-01",
      name: "RTS Tailing Dam Crest",
      type: "RTS",
      areaKey: "area-tailing-dam",
      status: "NORMAL",
      statusProfile: "calm",
      latestValue: "Semua prism stabil",
      latitude: -1.2502,
      longitude: 116.8064,
      baseElev: 156.8,
      lastUpdate: hoursAgo(0.04),
      instrumentModel: "Trimble S7",
      instrumentSerial: "S7-22-031",
      prismCount: 13,
      device: { code: "dev-rts-tail-01", name: "Logger RTS Tailing Dam Crest", battery: 91, signal: 86, firmware: "2.9.4", sensorStatus: "RTS aktif, semua prism nominal", status: "ONLINE" },
    },
  ];

  const prismStations = {};
  for (const config of prismStationConfigs) {
    prismStations[config.key] = await prisma.monitoringPoint.create({
      data: {
        code: config.code,
        name: config.name,
        type: config.type,
        latitude: config.latitude,
        longitude: config.longitude,
        areaId: areaByKey[config.areaKey].id,
        status: config.status,
        latestValue: config.latestValue,
        lastUpdate: config.lastUpdate,
        instrumentModel: config.instrumentModel,
        instrumentSerial: config.instrumentSerial,
        prismCount: config.prismCount,
      },
    });
  }

  await prisma.device.createMany({
    data: prismStationConfigs.map((config) => ({
      code: config.device.code,
      name: config.device.name,
      type: config.type,
      status: config.device.status,
      battery: config.device.battery,
      signal: config.device.signal,
      firmwareVersion: config.device.firmware,
      sensorStatus: config.device.sensorStatus,
      lastDataReceived: config.lastUpdate,
      pointId: prismStations[config.key].id,
    })),
  });

  for (const config of prismStationConfigs) {
    const stationId = prismStations[config.key].id;
    const prismDefs = generatePrismsForStation(
      config.key,
      config.prismCount,
      config.latitude,
      config.longitude,
      config.baseElev,
      config.statusProfile,
    );

    for (const def of prismDefs) {
      const prism = await prisma.prism.create({
        data: {
          code: def.code,
          label: def.label,
          stationId,
          latitude: def.latitude,
          longitude: def.longitude,
          baselineElevationM: def.baselineElevationM,
          status: def.status,
          visible: def.visible,
          lastUpdate: config.lastUpdate,
          installedAt: daysAgo(180),
          notes: def.notes,
        },
      });

      await prisma.prismReading.createMany({
        data: buildPrismReadings({
          prismId: prism.id,
          finalDxMm: def.finalDxMm,
          finalDyMm: def.finalDyMm,
          finalDzMm: def.finalDzMm,
          profile: def.profile,
          phase: def.phase,
          visibleFromHoursAgo: def.visibleFromHoursAgo,
        }),
      });
    }
  }

  await prisma.pointThreshold.createMany({
    data: prismStationConfigs.map((config) => ({
      pointId: prismStations[config.key].id,
      parameter: "displacement",
      unit: "mm",
      normal: 10,
      waspada: 20,
      siaga: 35,
      awas: 55,
    })),
  });

  await prisma.alarm.createMany({
    data: [
      { code: "alm-mine-1042", type: "Slope Movement Alert", areaId: areaByKey["area-north-highwall"].id, pointId: points.adrHw01.id, status: "SIAGA", state: "OPEN", occurredAt: hoursAgo(0.17), message: "Pergerakan North Highwall melewati ambang siaga setelah hujan intensitas tinggi." },
      { code: "alm-mine-1041", type: "Water Storage Alert", areaId: areaByKey["area-settling-pond"].id, pointId: points.awlrSp01.id, status: "WASPADA", state: "IN_PROGRESS", occurredAt: hoursAgo(0.3), message: "Level Settling Pond mendekati batas operasi aman." },
      { code: "alm-mine-1040", type: "Gas Exposure Alert", areaId: areaByKey["area-tailing-dam"].id, pointId: points.gasUg01.id, status: "AWAS", state: "OPEN", occurredAt: hoursAgo(0.42), message: "Gas Sensor UG Portal 01 mendeteksi CO di atas ambang awas." },
      { code: "alm-mine-1039", type: "Pore Pressure Alert", areaId: areaByKey["area-south-dump"].id, pointId: points.pzDump01.id, status: "WASPADA", state: "OPEN", occurredAt: hoursAgo(1.1), message: "Tekanan air pori South Dump meningkat dan perlu inspeksi geoteknik." },
      { code: "alm-mine-1038", type: "Dust Exposure Alert", areaId: areaByKey["area-pit-b"].id, pointId: points.dustHaul01.id, status: "WASPADA", state: "IN_PROGRESS", occurredAt: hoursAgo(2.2), message: "Konsentrasi debu haul road melewati ambang waspada saat lalu lintas unit meningkat." },
      { code: "alm-mine-1037", type: "Camera Health", areaId: areaByKey["area-settling-pond"].id, pointId: points.cctvSp01.id, status: "WASPADA", state: "OPEN", occurredAt: hoursAgo(4.5), message: "Panel kamera Settling Pond perlu pengecekan karena baterai turun." },
      { code: "alm-mine-1036", type: "Rainfall Alert", areaId: areaByKey["area-north-highwall"].id, pointId: points.arrHw01.id, status: "SIAGA", state: "RESOLVED", occurredAt: hoursAgo(7.5), resolvedAt: hoursAgo(3.8), resolutionNote: "Intensitas hujan turun dan inspeksi visual selesai tanpa temuan retakan baru.", message: "ARR North Highwall mencatat curah hujan tinggi selama shift malam." },
    ],
  });

  await prisma.event.createMany({
    data: [
      { title: "Inspeksi North Highwall", areaId: areaByKey["area-north-highwall"].id, status: "SIAGA", state: "OPEN", occurredAt: hoursAgo(0.45), note: "Operator membatasi akses bench utara dan meminta inspeksi geoteknik sebelum hauling dilanjutkan." },
      { title: "Kontrol level Settling Pond", areaId: areaByKey["area-settling-pond"].id, status: "WASPADA", state: "IN_PROGRESS", occurredAt: hoursAgo(1.7), note: "Pompa tambahan disiapkan untuk menjaga freeboard dalam batas operasi." },
      { title: "Ventilasi area UG Portal", areaId: areaByKey["area-tailing-dam"].id, status: "AWAS", state: "OPEN", occurredAt: hoursAgo(2.1), note: "Area portal dikosongkan sementara sampai pembacaan gas kembali aman." },
      { title: "Pemeriksaan South Dump", areaId: areaByKey["area-south-dump"].id, status: "WASPADA", state: "IN_PROGRESS", occurredAt: hoursAgo(4.2), note: "Tim geoteknik memeriksa drainase toe dump dan data piezometer." },
      { title: "Penyiraman haul road", areaId: areaByKey["area-pit-b"].id, status: "WASPADA", state: "RESOLVED", occurredAt: hoursAgo(8), note: "Water truck ditambah di jalur angkut sampai paparan debu turun." },
    ],
  });

  await prisma.maintenanceLog.createMany({
    data: [
      { deviceId: getDeviceId("dev-cctv-sp-01"), technician: "Teknisi Instrumentasi", scheduledAt: new Date("2026-05-20T02:00:00.000Z"), note: "Cek panel surya, baterai cadangan, dan sudut pantau Settling Pond.", state: "OPEN" },
      { deviceId: getDeviceId("dev-pz-dump-01"), technician: "Teknisi Geoteknik", scheduledAt: new Date("2026-05-19T03:00:00.000Z"), note: "Kalibrasi transducer piezometer dan validasi elevasi casing.", state: "IN_PROGRESS" },
      { deviceId: getDeviceId("dev-adr-dump-01"), technician: "Teknisi Instrumentasi", scheduledAt: new Date("2026-05-20T04:00:00.000Z"), note: "Pengecekan modem telemetry dan arah antena ADR South Dump.", state: "OPEN" },
      { deviceId: getDeviceId("dev-gas-ug-01"), technician: "Tim K3 Tambang", scheduledAt: new Date("2026-05-19T05:30:00.000Z"), note: "Bump test sensor CO dan verifikasi alarm lokal.", state: "OPEN" },
      { deviceId: getDeviceId("dev-arr-hw-01"), technician: "Teknisi Instrumentasi", scheduledAt: new Date("2026-05-18T08:00:00.000Z"), note: "Pembersihan corong ARR setelah hujan lebat.", state: "RESOLVED" },
      { deviceId: getDeviceId("dev-dust-haul-01"), technician: "Tim Lingkungan", scheduledAt: new Date("2026-05-22T02:00:00.000Z"), note: "Audit inlet sensor debu dan kalibrasi pembacaan PM10.", state: "OPEN" },
    ],
  });

  await prisma.threshold.createMany({
    data: [
      { id: "deformation", metric: "Pergerakan lereng", normal: "< 10 mm/hari", waspada: "10-25 mm/hari", siaga: "25-50 mm/hari", awas: "> 50 mm/hari" },
      { id: "rainfall", metric: "Curah hujan 24 jam", normal: "< 50 mm", waspada: "50-75 mm", siaga: "75-100 mm", awas: "> 100 mm" },
      { id: "pore-pressure", metric: "Tekanan air pori", normal: "< 80 kPa", waspada: "80-120 kPa", siaga: "120-160 kPa", awas: "> 160 kPa" },
      { id: "water-level", metric: "Level air kolam/sump", normal: "< 3.00 m", waspada: "3.00 m", siaga: "3.35 m", awas: "3.65 m" },
      { id: "gas", metric: "Gas area risiko", normal: "< 25 ppm CO", waspada: "25-50 ppm CO", siaga: "50-70 ppm CO", awas: "> 70 ppm CO" },
    ],
  });

  await prisma.pointThreshold.createMany({
    data: [
      { pointId: points.adrHw01.id, parameter: "displacement", unit: "mm", normal: 10, waspada: 25, siaga: 40, awas: 55 },
      { pointId: points.adrDump01.id, parameter: "displacement", unit: "mm", normal: 10, waspada: 25, siaga: 45, awas: 60 },
      { pointId: points.adrPitA01.id, parameter: "displacement", unit: "mm", normal: 10, waspada: 25, siaga: 45, awas: 60 },
      { pointId: points.awlrSp01.id, parameter: "waterLevel", unit: "m", normal: 2.8, waspada: 3, siaga: 3.35, awas: 3.65 },
      { pointId: points.awqrSp01.id, parameter: "tss", unit: "mg/L", normal: 100, waspada: 150, siaga: 200, awas: 250 },
      { pointId: points.arrHw01.id, parameter: "rainfall24h", unit: "mm", normal: 50, waspada: 75, siaga: 100, awas: 125 },
      { pointId: points.awsPitA01.id, parameter: "windSpeed", unit: "m/s", normal: 8, waspada: 12, siaga: 16, awas: 20 },
      { pointId: points.pzDump01.id, parameter: "porePressure", unit: "kPa", normal: 80, waspada: 120, siaga: 160, awas: 200 },
      { pointId: points.dustHaul01.id, parameter: "pm10", unit: "ug/m3", normal: 75, waspada: 125, siaga: 175, awas: 250 },
      { pointId: points.noiseWs01.id, parameter: "noise", unit: "dBA", normal: 70, waspada: 85, siaga: 95, awas: 105 },
      { pointId: points.gasUg01.id, parameter: "co", unit: "ppm", normal: 25, waspada: 50, siaga: 70, awas: 100 },
      { pointId: points.cctvHw01.id, parameter: "visibility", unit: "score", normal: 90, waspada: 70, siaga: 50, awas: 30 },
      { pointId: points.cctvSp01.id, parameter: "visibility", unit: "score", normal: 90, waspada: 70, siaga: 50, awas: 30 },
    ],
  });

  await prisma.riskWeight.createMany({
    data: [
      { id: "slope-movement", metric: "Pergerakan lereng", weight: 35, source: "ADR/Deformation" },
      { id: "rainfall-intensity", metric: "Curah hujan", weight: 20, source: "ARR/AWS" },
      { id: "pore-pressure", metric: "Tekanan air pori", weight: 20, source: "Piezometer" },
      { id: "water-storage", metric: "Level air sump/pond", weight: 15, source: "AWLR" },
      { id: "environmental-exposure", metric: "Gas, debu, dan kebisingan", weight: 10, source: "Gas/Dust/Noise" },
    ],
  });

  await prisma.reportTemplate.createMany({
    data: [
      { id: "daily", name: "Laporan Harian Operasi Tambang", period: "Harian", audience: "Operator, geoteknik, dan K3 tambang", formats: ["PDF", "CSV", "Excel"] },
      { id: "monthly", name: "Laporan Bulanan Monitoring Tambang", period: "Bulanan", audience: "Manajemen site dan instansi pengawas", formats: ["PDF", "Excel"] },
      { id: "event", name: "Laporan Event Geoteknik/K3", period: "Per kejadian", audience: "Tim respons, geoteknik, dan dokumentasi operasi", formats: ["PDF", "PNG", "JSON"] },
      { id: "executive", name: "Executive Summary Demo Mining Site", period: "Mingguan/Bulanan", audience: "Pimpinan dan viewer manajemen", formats: ["PDF"] },
    ],
  });

  await prisma.report.createMany({
    data: [
      { templateId: "daily", areaName: "Demo Mining Site", status: "READY", downloadUrl: "/api/reports/daily", generatedAt: now },
      { templateId: "event", areaName: "North Highwall", status: "READY", downloadUrl: "/api/reports/event?area=north-highwall", generatedAt: hoursAgo(1.5) },
      { templateId: "daily", areaName: "Settling Pond", status: "READY", downloadUrl: "/api/reports/daily?area=settling-pond", generatedAt: hoursAgo(3) },
      { templateId: "monthly", areaName: "South Dump", status: "QUEUED", downloadUrl: null, generatedAt: hoursAgo(6) },
      { templateId: "executive", areaName: "Demo Mining Site", status: "READY", downloadUrl: "/api/reports/executive", generatedAt: daysAgo(2) },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
