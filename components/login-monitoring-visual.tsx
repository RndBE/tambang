import {
  ActivityIcon,
  AlertTriangleIcon,
  CameraIcon,
  CloudRainIcon,
  GaugeIcon,
  HardHatIcon,
  RadioTowerIcon,
  SatelliteIcon,
  WifiIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import type { UserRole } from "@/lib/types"

export function LoginMonitoringVisual({ roles }: { roles: UserRole[] }) {
  const visibleRoles = roles.slice(0, 4)
  const metrics = [
    { label: "ARR", value: "2 pos", icon: CloudRainIcon },
    { label: "ADR", value: "4 target", icon: RadioTowerIcon },
    { label: "Piezometer", value: "3 pos", icon: GaugeIcon },
    { label: "CCTV", value: "4 kamera", icon: CameraIcon },
  ]

  return (
    <section className="login-ops-bg relative hidden min-h-svh overflow-hidden bg-muted lg:block">
      <div className="relative flex min-h-full items-center justify-center p-10">
        <div className="relative h-[620px] w-full max-w-[800px]">
          <div className="login-command-card absolute inset-x-8 top-6 h-[430px] overflow-hidden rounded-xl border bg-background shadow-sm">
            <div className="absolute left-5 top-5 z-10 flex items-center gap-2">
              <Badge variant="secondary">Demo Mining Site</Badge>
              <Badge variant="outline">Mining Monitoring System</Badge>
            </div>
            <div className="absolute right-5 top-5 z-10 rounded-md border bg-background/80 px-3 py-2 text-xs text-muted-foreground backdrop-blur">
              19 titik data tambang aktif
            </div>

            <svg
              aria-hidden="true"
              className="absolute inset-0 size-full"
              viewBox="0 0 820 470"
            >
              <defs>
                <pattern
                  id="login-grid"
                  width="42"
                  height="42"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M42 0H0V42"
                    fill="none"
                    stroke="#0f172a"
                    strokeOpacity=".07"
                    strokeWidth="1"
                  />
                </pattern>
              </defs>
              <rect width="820" height="470" fill="#f8fafc" />
              <rect width="820" height="470" fill="url(#login-grid)" />
              <path
                d="M0 184 C92 162 176 171 263 145 C365 116 442 105 538 118 C636 132 724 104 820 82 L820 470 L0 470 Z"
                fill="#f0e7d8"
              />
              <path
                d="M0 318 C105 286 170 306 264 270 C355 236 415 250 501 214 C596 174 676 163 820 128 L820 470 L0 470 Z"
                fill="#e4d0b5"
              />
              <path
                d="M100 320 C167 286 242 292 309 253 C373 216 455 217 525 187 C598 156 680 148 820 120"
                fill="none"
                stroke="#7c5f44"
                strokeLinecap="round"
                strokeOpacity=".18"
                strokeWidth="24"
              />
              <path
                className="login-haul-road"
                d="M100 320 C167 286 242 292 309 253 C373 216 455 217 525 187 C598 156 680 148 820 120"
                fill="none"
                stroke="#111827"
                strokeDasharray="11 14"
                strokeLinecap="round"
                strokeOpacity=".45"
                strokeWidth="3"
              />
              <path
                d="M126 245 C173 202 239 182 311 188 C396 196 460 238 454 291 C448 346 367 382 276 371 C185 360 90 316 126 245 Z"
                fill="#dfb77c"
              />
              <path
                d="M168 250 C202 220 255 205 313 209 C377 213 422 245 418 286 C414 327 352 350 282 342 C212 334 139 299 168 250 Z"
                fill="#d29b60"
              />
              <path
                d="M210 256 C235 236 273 226 317 230 C361 234 392 255 390 283 C387 312 346 329 298 324 C250 318 185 291 210 256 Z"
                fill="#bd814c"
              />
              <path
                d="M252 265 C271 251 299 245 328 248 C357 251 376 265 374 283 C372 301 346 312 314 309 C282 305 230 291 252 265 Z"
                fill="#98643f"
              />
              <path
                className="login-bench-line"
                d="M126 245 C173 202 239 182 311 188 C396 196 460 238 454 291 C448 346 367 382 276 371 C185 360 90 316 126 245 Z"
                fill="none"
                stroke="#7c4d2e"
                strokeDasharray="7 10"
                strokeOpacity=".5"
                strokeWidth="2"
              />
              <path
                className="login-bench-line"
                d="M168 250 C202 220 255 205 313 209 C377 213 422 245 418 286 C414 327 352 350 282 342 C212 334 139 299 168 250 Z"
                fill="none"
                stroke="#7c4d2e"
                strokeDasharray="7 10"
                strokeOpacity=".45"
                strokeWidth="2"
              />
              <path
                className="login-bench-line"
                d="M210 256 C235 236 273 226 317 230 C361 234 392 255 390 283 C387 312 346 329 298 324 C250 318 185 291 210 256 Z"
                fill="none"
                stroke="#7c4d2e"
                strokeDasharray="7 10"
                strokeOpacity=".4"
                strokeWidth="2"
              />
              <path
                d="M566 282 C607 265 662 272 694 298 C720 319 704 350 653 357 C602 364 544 344 532 319 C524 301 540 293 566 282 Z"
                fill="#b9dde0"
                stroke="#0e7490"
                strokeOpacity=".45"
                strokeWidth="2"
              />
              <path
                d="M604 302 C626 292 666 296 680 313 C691 326 674 340 644 340 C612 339 583 326 584 314 C585 309 592 306 604 302 Z"
                fill="#94cfd5"
                opacity=".72"
              />
              <path
                d="M82 366 L128 302 L179 371 Z"
                fill="#c5aa86"
                opacity=".88"
              />
              <path
                d="M132 371 L180 318 L232 374 Z"
                fill="#b7956f"
                opacity=".88"
              />
              <path
                d="M666 226 L704 184 L742 226 Z"
                fill="#857263"
                opacity=".9"
              />
              <path
                d="M714 229 L752 192 L790 230 Z"
                fill="#6f6259"
                opacity=".88"
              />
              <path
                d="M522 149 L650 215"
                fill="none"
                stroke="#111827"
                strokeDasharray="4 7"
                strokeOpacity=".35"
                strokeWidth="3"
              />
              <path
                d="M574 178 L624 203"
                fill="none"
                stroke="#111827"
                strokeOpacity=".28"
                strokeWidth="8"
              />
              <path
                className="login-geotech-line"
                d="M34 382 C118 348 191 392 276 361 C362 329 432 384 522 353 C606 324 682 365 796 332"
                fill="none"
                stroke="#ef4444"
                strokeLinecap="round"
                strokeWidth="2"
              />
              <path
                className="login-geotech-line login-geotech-line-delay"
                d="M22 338 C114 304 189 339 276 309 C362 279 449 330 541 300 C630 271 698 305 796 274"
                fill="none"
                stroke="#f59e0b"
                strokeLinecap="round"
                strokeWidth="2"
              />
              <path
                className="login-data-route"
                d="M170 238 C251 209 314 219 390 198 C489 171 565 151 676 132"
                fill="none"
                stroke="#111827"
                strokeDasharray="7 10"
                strokeOpacity=".65"
                strokeWidth="2"
              />
              <path
                d="M456 182 C491 147 557 137 619 151 C584 181 522 199 456 182 Z"
                fill="#ef4444"
                opacity=".12"
              />
              <path
                d="M458 182 C493 149 556 139 619 151"
                fill="none"
                stroke="#ef4444"
                strokeDasharray="8 10"
                strokeOpacity=".65"
                strokeWidth="2"
              />
              <g transform="translate(530 160) rotate(-12)">
                <rect
                  fill="#f59e0b"
                  height="18"
                  rx="4"
                  width="48"
                  x="0"
                  y="10"
                />
                <path d="M8 10 L20 0 H36 L43 10 Z" fill="#d97706" />
                <circle cx="12" cy="32" fill="#111827" r="6" />
                <circle cx="39" cy="32" fill="#111827" r="6" />
                <rect fill="#111827" height="3" rx="1.5" width="56" x="-4" y="27" />
              </g>
              <g transform="translate(294 246)">
                <rect fill="#334155" height="8" rx="4" width="58" x="-8" y="41" />
                <rect fill="#f59e0b" height="22" rx="4" width="36" x="4" y="20" />
                <path d="M28 22 L49 8 L57 16 L39 30 Z" fill="#d97706" />
                <path
                  d="M55 15 C75 27 83 38 93 50"
                  fill="none"
                  stroke="#92400e"
                  strokeLinecap="round"
                  strokeWidth="5"
                />
                <path d="M91 50 L112 43 L105 59 Z" fill="#92400e" />
                <circle cx="8" cy="49" fill="#111827" r="5" />
                <circle cx="35" cy="49" fill="#111827" r="5" />
              </g>
              <g transform="translate(226 174)">
                <path d="M12 0 L25 54 H0 Z" fill="#475569" opacity=".85" />
                <path d="M12 0 V58" stroke="#f59e0b" strokeWidth="4" />
                <path d="M-8 58 H34" stroke="#111827" strokeLinecap="round" strokeWidth="5" />
                <circle cx="12" cy="68" fill="#ef4444" r="5" />
              </g>
              <g transform="translate(640 124)">
                <path d="M0 0 V52" stroke="#475569" strokeWidth="3" />
                <path d="M-13 16 L0 3 L13 16" fill="none" stroke="#475569" strokeWidth="3" />
                <rect fill="#111827" height="10" rx="2" width="18" x="10" y="8" />
                <circle cx="0" cy="54" fill="#475569" r="5" />
              </g>
              <text className="login-map-label" x="266" y="288">
                OPEN PIT
              </text>
              <text className="login-map-label" x="548" y="176">
                HIGHWALL
              </text>
              <text className="login-map-label" x="580" y="327">
                SETTLING POND
              </text>
              <text className="login-map-label" x="96" y="374">
                SOUTH DUMP
              </text>
              <text className="login-map-label" x="672" y="236">
                ORE STOCKPILE
              </text>
            </svg>

            <div className="absolute left-[39%] top-[43%] size-52 -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-300/70">
              <div className="absolute inset-7 rounded-full border border-sky-300/50" />
              <div className="absolute inset-16 rounded-full border border-sky-300/35" />
              <div className="login-radar-sweep absolute left-1/2 top-1/2 h-[2px] w-24 origin-left bg-sky-500/70" />
              <div className="absolute left-1/2 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-600" />
            </div>

            <MonitoringMarker
              className="left-[27%] top-[47%]"
              label="ADR-HW-01"
              tone="emerald"
            />
            <MonitoringMarker
              className="left-[66%] top-[62%]"
              label="PZ-SP-02"
              tone="sky"
            />
            <MonitoringMarker
              className="left-[74%] top-[31%]"
              label="CCTV Pit Crest"
              tone="red"
            />

            <div className="absolute bottom-5 left-5 right-5 grid grid-cols-3 gap-3">
              <MetricTile label="Highwall velocity" value="-8.2" unit="mm/jam" />
              <MetricTile label="Pond pore pressure" value="1.89" unit="bar" />
              <MetricTile label="Pit risk zones" value="3" unit="aktif" />
            </div>
          </div>

          <div className="login-side-panel absolute left-0 top-24 w-[280px] rounded-xl border bg-background/92 p-4 shadow-sm backdrop-blur">
            <div className="flex items-center gap-2 text-sm font-medium">
              <HardHatIcon className="size-4 text-muted-foreground" />
              Sensor stack tambang
            </div>
            <div className="mt-4 grid gap-2">
              {metrics.map(({ label, value, icon: Icon }) => (
                <div
                  className="login-float-row flex items-center justify-between rounded-md border bg-card px-3 py-2 text-sm"
                  key={label}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="size-4 text-muted-foreground" />
                    {label}
                  </span>
                  <span className="font-medium tabular-nums">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="login-float-card absolute bottom-10 left-9 w-[330px] rounded-xl border bg-background/94 p-4 shadow-sm backdrop-blur">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Risk engine</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Skor lereng diperbarui dari telemetry sensor tambang.
                </p>
              </div>
              <ActivityIcon className="size-5 text-muted-foreground" />
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
              <div className="login-scan-bar h-full rounded-full bg-foreground" />
            </div>
            <svg
              aria-hidden="true"
              className="mt-4 h-12 w-full"
              viewBox="0 0 280 48"
            >
              <path
                className="login-spark-line"
                d="M0 34 L32 28 L56 31 L84 18 L116 22 L148 12 L178 20 L210 10 L248 16 L280 8"
                fill="none"
                stroke="#111827"
                strokeLinecap="round"
                strokeWidth="2"
              />
            </svg>
            <div className="mt-3 flex items-center justify-between rounded-lg border bg-muted/45 px-3 py-2 text-xs">
              <span className="flex items-center gap-2 font-medium">
                <SatelliteIcon className="size-4 text-muted-foreground" />
                RTK fix 98.6%
              </span>
              <WifiIcon className="size-4 text-muted-foreground" />
            </div>
          </div>

          <div className="absolute bottom-6 right-2 flex w-[310px] flex-col gap-2">
            <div className="login-alert-strip flex items-center gap-3 rounded-xl border bg-background/94 px-4 py-3 text-sm shadow-sm backdrop-blur">
              <AlertTriangleIcon className="size-4 text-muted-foreground" />
              <div>
                <p className="font-medium">3 event perlu atensi</p>
                <p className="text-xs text-muted-foreground">
                  Gas Alert, Settling Pond, dan South Dump
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {visibleRoles.map((role, index) => (
                <div
                  className="login-role-chip rounded-xl border bg-background/90 px-3 py-2 text-sm shadow-sm backdrop-blur"
                  key={role.role}
                  style={{ animationDelay: `${index * 110}ms` }}
                >
                  <div className="grid gap-1">
                    <span className="truncate font-medium">{role.role}</span>
                    <span className="w-fit rounded-md border bg-background px-2 py-0.5 text-xs text-muted-foreground">
                      Aktif
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function MonitoringMarker({
  className,
  label,
  tone,
}: {
  className: string
  label: string
  tone: "emerald" | "red" | "sky"
}) {
  const toneClass = {
    emerald: "bg-emerald-500 ring-emerald-500/25",
    red: "bg-red-500 ring-red-500/25",
    sky: "bg-sky-500 ring-sky-500/25",
  }[tone]

  return (
    <div className={`absolute ${className}`}>
      <div className={`login-marker-ping size-4 rounded-full ring-8 ${toneClass}`} />
      <div className="mt-2 rounded-md border bg-background/90 px-2 py-1 text-xs font-medium shadow-sm">
        {label}
      </div>
    </div>
  )
}

function MetricTile({
  label,
  value,
  unit,
}: {
  label: string
  value: string
  unit: string
}) {
  return (
    <div className="rounded-md border bg-background/85 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums">
        {value} <span className="text-xs font-normal text-muted-foreground">{unit}</span>
      </p>
    </div>
  )
}
