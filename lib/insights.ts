import type {
  AwlrMonitoringData,
  DashboardSummary,
  GnssMonitoringData,
  PrismMonitoringData,
} from "@/lib/types";

export type InsightSeverity = "ok" | "info" | "warning" | "danger";

export type Insight = {
  category: string;
  text: string;
  severity: InsightSeverity;
};

function zScoreAnomalyCount(values: number[]): number {
  if (values.length < 4) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
  const stddev = Math.sqrt(variance);
  if (stddev === 0) return 0;
  return values.filter((v) => Math.abs((v - mean) / stddev) > 2.5).length;
}

export function generateGnssInsights(data: GnssMonitoringData): Insight[] {
  const { selectedStation, trend, analysis, comparison } = data;
  const insights: Insight[] = [];

  // 1. Deformasi lereng
  if (trend.length > 0) {
    const latest = trend[trend.length - 1];
    const velocityAbs = Math.abs(latest.velocity);
    const severity: InsightSeverity =
      velocityAbs > 10 ? "danger" : velocityAbs > 6 ? "warning" : "ok";
    const deltaText =
      analysis.deltaFromPrevious && analysis.deltaFromPrevious !== "-"
        ? `, perubahan ${analysis.deltaFromPrevious} dari periode sebelumnya`
        : "";
    insights.push({
      category: "Deformasi Lereng",
      text: `${selectedStation.name} mencatat laju pergerakan ${velocityAbs.toFixed(1)} cm/tahun${deltaText}.`,
      severity,
    });
  }

  // 2. Kualitas observasi ADR
  if (trend.length > 0) {
    const avgPdop = trend.reduce((s, t) => s + t.pdop, 0) / trend.length;
    const avgFix = trend.reduce((s, t) => s + t.fixRatio, 0) / trend.length;
    const severity: InsightSeverity =
      avgPdop > 3 ? "warning" : avgPdop > 2 ? "info" : "ok";
    const quality =
      avgPdop < 2 ? "optimal" : avgPdop < 3 ? "cukup baik" : "perlu diperhatikan";
    insights.push({
      category: "Kualitas Observasi ADR",
      text: `PDOP rata-rata ${avgPdop.toFixed(2)} dan fix ratio ${avgFix.toFixed(1)}% - kualitas observasi ${quality}.`,
      severity,
    });
  }

  // 3. Deteksi anomali berbasis z-score
  if (trend.length >= 5) {
    const zValues = trend.map((t) => t.z);
    const anomalyCount = zScoreAnomalyCount(zValues);
    const severity: InsightSeverity =
      anomalyCount > 5 ? "danger" : anomalyCount > 2 ? "warning" : "ok";
    insights.push({
      category: "Kualitas Observasi ADR",
      text:
        anomalyCount > 0
          ? `Terdeteksi ${anomalyCount} pembacaan anomali (z-score > 2.5) dalam rentang ini - perlu verifikasi lapangan.`
          : `Tidak ada pembacaan anomali signifikan - data konsisten dalam rentang ini.`,
      severity,
    });
  }

  // 4. Tren akselerasi/deselerasi pergerakan
  if (trend.length >= 6) {
    const half = Math.floor(trend.length / 2);
    const avgFirst =
      trend.slice(0, half).reduce((s, t) => s + t.velocity, 0) / half;
    const avgSecond =
      trend.slice(half).reduce((s, t) => s + t.velocity, 0) /
      (trend.length - half);
    const pct =
      Math.abs(avgFirst) > 0
        ? ((avgSecond - avgFirst) / Math.abs(avgFirst)) * 100
        : 0;

    if (Math.abs(pct) > 10) {
      const direction = pct < 0 ? "mengakselerasi" : "melambat";
      const severity: InsightSeverity = pct < 0 ? "warning" : "ok";
      insights.push({
        category: "Tren Pergerakan",
        text: `Laju pergerakan ${direction} sekitar ${Math.abs(pct).toFixed(0)}% pada paruh kedua rentang ini.`,
        severity,
      });
    } else {
      insights.push({
        category: "Tren Pergerakan",
        text: `Laju pergerakan relatif stabil sepanjang rentang ini (variasi < 10%).`,
        severity: "ok",
      });
    }
  }

  // 5. Perbandingan antar area
  if (comparison.length > 1) {
    const sorted = [...comparison].sort((a, b) => a.velocity - b.velocity);
    const fastest = sorted[0];
    const isCurrentFastest = fastest.id === selectedStation.id;
    const severity: InsightSeverity = isCurrentFastest ? "warning" : "info";
    insights.push({
      category: "Perbandingan Area",
      text: isCurrentFastest
        ? `Area ini mencatat pergerakan tercepat di antara ${comparison.length} stasiun aktif.`
        : `${fastest.name} memiliki pergerakan tercepat (${Math.abs(fastest.velocity).toFixed(1)} cm/tahun) di antara ${comparison.length} stasiun.`,
      severity,
    });
  }

  return insights;
}

export function generateDashboardInsights(summary: DashboardSummary): Insight[] {
  const { kpis, riskAreas, alarms, devices, monitoringPoints } = summary;
  const insights: Insight[] = [];

  // 1. Status risiko keseluruhan
  const criticalAreas = riskAreas.filter((a) => a.status !== "Normal");
  const worstStatus = riskAreas.reduce<string>(
    (worst, area) => {
      const order = { Awas: 3, Siaga: 2, Waspada: 1, Normal: 0 };
      return (order[area.status as keyof typeof order] ?? 0) > (order[worst as keyof typeof order] ?? 0)
        ? area.status
        : worst;
    },
    "Normal",
  );
  const riskSeverity: InsightSeverity =
    worstStatus === "Awas" ? "danger" : worstStatus === "Siaga" ? "danger" : worstStatus === "Waspada" ? "warning" : "ok";
  insights.push({
    category: "Risiko Keseluruhan",
    text:
      criticalAreas.length === 0
        ? `Semua ${riskAreas.length} area tambang dalam kondisi Normal.`
        : `${criticalAreas.length} dari ${riskAreas.length} area berstatus di atas Normal: ${criticalAreas.map((a) => a.area).join(", ")}.`,
    severity: riskSeverity,
  });

  // 2. Deformasi lereng
  const subsidenceValue = parseFloat(kpis.maxSubsidence.replace(/[^0-9.-]/g, ""));
  const subsidenceSeverity: InsightSeverity =
    Math.abs(subsidenceValue) > 10 ? "danger" : Math.abs(subsidenceValue) > 6 ? "warning" : "ok";
  insights.push({
    category: "Deformasi Lereng",
    text: `Laju pergerakan maks ${kpis.maxSubsidence} (rata-rata ${kpis.averageSubsidence}) tercatat di ${kpis.maxSubsidenceStation}.`,
    severity: subsidenceSeverity,
  });

  // 3. Level air tambang
  const waterSeverity: InsightSeverity =
    kpis.floodRisk === "Awas" ? "danger" : kpis.floodRisk === "Siaga" ? "danger" : kpis.floodRisk === "Waspada" ? "warning" : "ok";
  insights.push({
    category: "Level Air Tambang",
    text: `Level air ${kpis.waterLevel} di ${kpis.waterLevelStation} — status ${kpis.floodRisk}.`,
    severity: waterSeverity,
  });

  // 4. Alarm aktif
  const openAlarms = alarms.filter((a) => a.state === "Open" || a.state === "In Progress");
  const criticalAlarms = openAlarms.filter((a) => a.status === "Awas" || a.status === "Siaga");
  const alarmSeverity: InsightSeverity =
    criticalAlarms.length > 0 ? "danger" : openAlarms.length > 0 ? "warning" : "ok";
  insights.push({
    category: "Alarm Aktif",
    text:
      openAlarms.length === 0
        ? "Tidak ada alarm aktif saat ini."
        : `${openAlarms.length} alarm aktif (${criticalAlarms.length} kritis). Tipe: ${[...new Set(openAlarms.map((a) => a.type))].slice(0, 3).join(", ")}.`,
    severity: alarmSeverity,
  });

  // 5. Kondisi sensor & perangkat
  const offlineDevices = devices.filter((d) => d.status === "Offline" || d.status === "Maintenance");
  const weakDevices = devices.filter((d) => d.status === "Weak");
  const lowBattery = devices.filter((d) => d.battery < 20);
  const deviceSeverity: InsightSeverity =
    offlineDevices.length > 2 ? "danger" : offlineDevices.length > 0 || weakDevices.length > 1 ? "warning" : "ok";
  insights.push({
    category: "Kondisi Perangkat",
    text:
      offlineDevices.length === 0 && weakDevices.length === 0
        ? `Semua ${devices.length} perangkat online.${lowBattery.length > 0 ? ` ${lowBattery.length} perangkat dengan baterai < 20%.` : ""}`
        : `${offlineDevices.length} offline/maintenance, ${weakDevices.length} sinyal lemah dari ${devices.length} perangkat total.`,
    severity: deviceSeverity,
  });

  // 6. Distribusi status titik pantau
  const nonNormalPoints = monitoringPoints.filter((p) => p.status !== "Normal");
  const pointSeverity: InsightSeverity =
    nonNormalPoints.some((p) => p.status === "Awas") ? "danger"
    : nonNormalPoints.some((p) => p.status === "Siaga") ? "danger"
    : nonNormalPoints.length > 0 ? "warning"
    : "ok";
  insights.push({
    category: "Titik Pantau",
    text:
      nonNormalPoints.length === 0
        ? `Semua ${monitoringPoints.length} titik pantau dalam status Normal.`
        : `${nonNormalPoints.length} dari ${monitoringPoints.length} titik pantau berstatus di atas Normal.`,
    severity: pointSeverity,
  });

  return insights;
}

export function generatePrismInsights(data: PrismMonitoringData): Insight[] {
  const { selectedPrism, station, trend, trendAnalysis, anomalies } = data;
  const insights: Insight[] = [];

  // 1. Status displacement terkini
  const totalMm = selectedPrism.latestTotalMm;
  const severity: InsightSeverity =
    selectedPrism.status === "Awas"
      ? "danger"
      : selectedPrism.status === "Siaga"
        ? "danger"
        : selectedPrism.status === "Waspada"
          ? "warning"
          : "ok";
  insights.push({
    category: "Displacement Terkini",
    text: `${selectedPrism.label} mencatat total displacement ${Math.abs(totalMm).toFixed(2)} mm dengan laju ${selectedPrism.latestVelocityMmDay.toFixed(3)} mm/hari (${selectedPrism.latestVelocityCmYear.toFixed(1)} cm/tahun).`,
    severity,
  });

  // 2. Arah dominan pergerakan
  if (trend.length > 0) {
    const avgDx = trend.reduce((s, t) => s + Math.abs(t.dx), 0) / trend.length;
    const avgDy = trend.reduce((s, t) => s + Math.abs(t.dy), 0) / trend.length;
    const avgDz = trend.reduce((s, t) => s + Math.abs(t.dz), 0) / trend.length;
    const maxAxis = Math.max(avgDx, avgDy, avgDz);
    const dominant =
      maxAxis === avgDz ? "vertikal (ΔZ)" : maxAxis === avgDx ? "horizontal timur (ΔX)" : "horizontal utara (ΔY)";
    const isVertical = maxAxis === avgDz;
    insights.push({
      category: "Arah Pergerakan Dominan",
      text: `Pergerakan didominasi arah ${dominant} dengan rata-rata ${maxAxis.toFixed(2)} mm. ${isVertical && selectedPrism.latestDzMm < 0 ? "Penurunan vertikal mengindikasikan potensi penurunan muka tanah." : ""}`,
      severity: isVertical && selectedPrism.latestDzMm < -10 ? "warning" : "info",
    });
  }

  // 3. Tren akselerasi/deselerasi
  if (trend.length >= 6) {
    const half = Math.floor(trend.length / 2);
    const avgFirst = trend.slice(0, half).reduce((s, t) => s + t.velocity, 0) / half;
    const avgSecond = trend.slice(half).reduce((s, t) => s + t.velocity, 0) / (trend.length - half);
    const pct = Math.abs(avgFirst) > 0.001
      ? ((avgSecond - avgFirst) / Math.abs(avgFirst)) * 100
      : 0;

    if (Math.abs(pct) > 15) {
      const direction = pct > 0 ? "mengakselerasi" : "melambat";
      const trendSeverity: InsightSeverity = pct > 0 ? "warning" : "ok";
      insights.push({
        category: "Tren Akselerasi",
        text: `Laju pergerakan ${direction} sekitar ${Math.abs(pct).toFixed(0)}% pada paruh kedua rentang ini (${avgFirst.toFixed(3)} → ${avgSecond.toFixed(3)} mm/hari).`,
        severity: trendSeverity,
      });
    } else {
      insights.push({
        category: "Tren Akselerasi",
        text: `Laju pergerakan relatif stabil sepanjang rentang (variasi < 15%) dengan confidence regresi: ${trendAnalysis.confidence}.`,
        severity: "ok",
      });
    }
  }

  // 4. Status visibilitas prism
  if (!selectedPrism.visible) {
    insights.push({
      category: "Visibilitas Prism",
      text: `Prism tidak terlihat — bacaan terakhir mungkin tidak valid. ${selectedPrism.notes ?? "Perlu pengecekan dan pemasangan ulang reflektor."}`,
      severity: "danger",
    });
  } else {
    insights.push({
      category: "Visibilitas Prism",
      text: `Reflektor terlihat dan bacaan aktif. Update terakhir: ${selectedPrism.lastUpdate}.`,
      severity: "ok",
    });
  }

  // 5. Posisi dalam station — apakah prism ini yang terparah?
  const isWorstInStation =
    station.worstPrismLabel === selectedPrism.label ||
    Math.abs(totalMm) >= station.worstPrismDisplacement * 0.9;
  const stationSeverity: InsightSeverity = isWorstInStation ? "warning" : "info";
  insights.push({
    category: "Posisi dalam Station",
    text: isWorstInStation
      ? `Prism ini merupakan titik kritis dalam ${station.name} — displacement tertinggi di antara ${station.visiblePrismCount} prism aktif.`
      : `Prism ini bukan yang terparah. Prism kritis station: ${station.worstPrismLabel} (${station.worstPrismDisplacement.toFixed(1)} mm).`,
    severity: stationSeverity,
  });

  // 6. Anomali terdeteksi
  const criticalAnomalies = anomalies.filter((a) => a.severity === "Critical").length;
  const warningAnomalies = anomalies.filter((a) => a.severity === "Warning").length;
  const anomalySeverity: InsightSeverity =
    criticalAnomalies > 0 ? "danger" : warningAnomalies > 0 ? "warning" : "ok";
  insights.push({
    category: "Deteksi Anomali",
    text:
      anomalies.length > 0
        ? `Terdeteksi ${anomalies.length} anomali (${criticalAnomalies} kritis, ${warningAnomalies} peringatan) dalam rentang ini — perlu verifikasi lapangan.`
        : `Tidak ada anomali signifikan dalam rentang ini — data bacaan prism konsisten.`,
    severity: anomalySeverity,
  });

  return insights;
}

export function generateAwlrInsights(data: AwlrMonitoringData): Insight[] {
  const { selectedStation, trend, analysis, comparison } = data;
  const insights: Insight[] = [];

  // 1. Status level air tambang terkini
  if (trend.length > 0) {
    const latest = trend[trend.length - 1];
    const statusMap: Record<string, { severity: InsightSeverity; label: string }> = {
      Normal: { severity: "ok", label: "dalam batas normal" },
      Waspada: { severity: "warning", label: "melampaui ambang Waspada" },
      Siaga: { severity: "danger", label: "melampaui ambang Siaga" },
      Awas: { severity: "danger", label: "melampaui ambang Awas" },
    };
    const { severity, label } = statusMap[latest.status] ?? statusMap["Normal"];
    insights.push({
      category: "Level Air Tambang",
      text: `Level air tambang ${selectedStation.name} saat ini ${latest.waterLevel.toFixed(2)} m - ${label}. Margin menuju Siaga: ${latest.marginSiaga.toFixed(2)} m di area tambang.`,
      severity,
    });
  }

  // 2. Distribusi pembacaan di atas normal
  if (trend.length > 0) {
    const unsafeCount = trend.filter((t) => t.status !== "Normal").length;
    const pct = (unsafeCount / trend.length) * 100;
    const severity: InsightSeverity =
      pct > 50 ? "danger" : pct > 20 ? "warning" : "ok";
    insights.push({
      category: "Level Air Tambang",
      text:
        unsafeCount > 0
          ? `${unsafeCount} dari ${trend.length} pembacaan (${pct.toFixed(0)}%) berada di atas ambang normal dalam rentang ini di area tambang.`
          : `Seluruh ${trend.length} pembacaan dalam rentang ini berada dalam batas normal di area tambang.`,
      severity,
    });
  }

  // 3. Tren naik/turun level air tambang
  if (trend.length >= 4) {
    const third = Math.floor(trend.length / 3);
    const avgRecent =
      trend.slice(-third).reduce((s, t) => s + t.waterLevel, 0) / third;
    const avgOlder =
      trend.slice(0, third).reduce((s, t) => s + t.waterLevel, 0) / third;
    const diff = avgRecent - avgOlder;

    if (Math.abs(diff) > 0.05) {
      const direction = diff > 0 ? "naik" : "turun";
      const severity: InsightSeverity = diff > 0 ? "warning" : "ok";
      insights.push({
        category: "Level Air Tambang",
        text: `Level air tambang cenderung ${direction} rata-rata ${Math.abs(diff).toFixed(2)} m dibanding awal rentang di area tambang.`,
        severity,
      });
    } else {
      insights.push({
        category: "Level Air Tambang",
        text: `Level air tambang relatif stabil sepanjang rentang ini (variasi < 5 cm) di area tambang.`,
        severity: "ok",
      });
    }
  }

  // 4. Perbandingan antar area AWLR
  if (comparison.length > 1) {
    const sorted = [...comparison].sort((a, b) => b.waterLevel - a.waterLevel);
    const highest = sorted[0];
    const isCurrentHighest = highest.id === selectedStation.id;
    const severity: InsightSeverity = isCurrentHighest ? "warning" : "info";
    insights.push({
      category: "Perbandingan Area",
      text: isCurrentHighest
        ? `Area ini memiliki level air tambang tertinggi (${highest.waterLevel.toFixed(2)} m) di antara ${comparison.length} stasiun AWLR.`
        : `${highest.name} memiliki level air tambang tertinggi saat ini (${highest.waterLevel.toFixed(2)} m) di antara ${comparison.length} stasiun.`,
      severity,
    });
  }

  return insights;
}
