"use client"

import { MineSatelliteMap } from "@/components/asaba/mine-satellite-map"
import type { MonitoringPoint } from "@/lib/types"

export function RiskMap({ points }: { points: MonitoringPoint[] }) {
  void points

  return <MineSatelliteMap variant="dashboard" />
}
