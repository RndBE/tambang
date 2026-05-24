"use client"

import dynamic from "next/dynamic"
import type { MonitoringPoint } from "@/lib/types"

const MineNetwork3DView = dynamic(
  () => import("@/components/asaba/mine-network-3d-view").then((m) => ({ default: m.MineNetwork3DView })),
  { ssr: false }
)

export function RiskMap({ points }: { points: MonitoringPoint[] }) {
  void points

  return (
    <div className="relative overflow-hidden rounded-xl ring-1 ring-foreground/10 shadow-sm">
      <MineNetwork3DView />
    </div>
  )
}
