import { BatteryChargingIcon, SignalIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  formatMiningSensorValue,
  miningSensorTypeLabels,
  type MiningSensor,
  type MiningSensorStatus,
} from "@/lib/mining-area-catalog"
import { cn } from "@/lib/utils"

const statusStyles: Record<MiningSensorStatus, string> = {
  normal: "border-emerald-200 bg-emerald-50 text-emerald-700",
  caution: "border-amber-200 bg-amber-50 text-amber-800",
  danger: "border-red-200 bg-red-50 text-red-700",
}

const statusLabels: Record<MiningSensorStatus, string> = {
  normal: "Normal",
  caution: "Waspada",
  danger: "Awas",
}

function StatusBadge({ status }: { status: MiningSensorStatus }) {
  return (
    <Badge className={cn("border", statusStyles[status])} variant="outline">
      {statusLabels[status]}
    </Badge>
  )
}

export function AreaSensorTable({ sensors }: { sensors: MiningSensor[] }) {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sensor</TableHead>
            <TableHead>Fungsi</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Nilai</TableHead>
            <TableHead>Ambang</TableHead>
            <TableHead>Trend</TableHead>
            <TableHead>Update</TableHead>
            <TableHead className="text-right">Telemetry</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sensors.map((sensor) => (
            <TableRow key={sensor.id}>
              <TableCell>
                <div className="min-w-0">
                  <p className="font-medium">{sensor.id}</p>
                  <p className="text-xs text-muted-foreground">{sensor.name}</p>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p className="text-sm">{sensor.functionLabel}</p>
                  <p className="text-xs text-muted-foreground">
                    {miningSensorTypeLabels[sensor.type]}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <StatusBadge status={sensor.status} />
              </TableCell>
              <TableCell className="font-medium tabular-nums">
                {formatMiningSensorValue(sensor)}
              </TableCell>
              <TableCell>{sensor.threshold}</TableCell>
              <TableCell className="capitalize">{sensor.trend}</TableCell>
              <TableCell>{sensor.lastUpdate}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <BatteryChargingIcon className="size-3" />
                    {sensor.battery}%
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <SignalIcon className="size-3" />
                    {sensor.signal}%
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
