"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type {
  AnalysisGranularity,
  PrismParameter,
  PrismTrendPoint,
} from "@/lib/types";

type PrismTrendChartProps = {
  data: PrismTrendPoint[];
  parameter: PrismParameter;
  prismLabel: string;
  latestValue: string;
  granularity: AnalysisGranularity;
};

const chartConfig = {
  dx: { label: "ΔX (East)", color: "var(--chart-1)" },
  dy: { label: "ΔY (North)", color: "var(--chart-2)" },
  dz: { label: "ΔZ (Up)", color: "var(--chart-3)" },
  total: { label: "Total displacement", color: "var(--chart-4)" },
  velocity: { label: "Velocity", color: "var(--chart-5)" },
  velocityYear: { label: "Velocity tahunan", color: "var(--chart-1)" },
} satisfies ChartConfig;

const axisLabels: Record<PrismParameter, string> = {
  dx: "mm",
  dy: "mm",
  dz: "mm",
  total: "mm",
  velocity: "mm/hari",
  velocityYear: "cm/tahun",
};

const parameterTitles: Record<PrismParameter, string> = {
  dx: "ΔX (East)",
  dy: "ΔY (North)",
  dz: "ΔZ (Up)",
  total: "Total displacement",
  velocity: "Velocity (mm/hari)",
  velocityYear: "Velocity tahunan (cm/tahun)",
};

function getDomain(data: PrismTrendPoint[], parameter: PrismParameter) {
  const values = data.map((item) => item[parameter]);
  if (values.length === 0) return [-5, 5];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const padding = Math.max((max - min) * 0.2, 0.5);
  return [Number((min - padding).toFixed(2)), Number((max + padding).toFixed(2))];
}

export function PrismTrendChart({
  data,
  parameter,
  prismLabel,
  latestValue,
  granularity,
}: PrismTrendChartProps) {
  const color = chartConfig[parameter]?.color ?? "var(--chart-1)";
  const domain = getDomain(data, parameter);

  return (
    <Card className="interactive-card">
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-sm">{parameterTitles[parameter]}</CardTitle>
            <CardDescription>
              {prismLabel} - granularitas {granularity === "daily" ? "harian" : "per jam"}
            </CardDescription>
          </div>
          <CardAction className="text-sm font-medium tabular-nums">
            {latestValue}
          </CardAction>
        </div>
      </CardHeader>
      <CardContent className="px-2 pb-3">
        <ChartContainer config={chartConfig} className="aspect-auto h-[280px] w-full">
          <AreaChart data={data} margin={{ left: 4, right: 12, top: 8, bottom: 0 }}>
            <defs>
              <linearGradient id={`fill-prism-${parameter}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                <stop offset="95%" stopColor={color} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="period"
              tickLine={false}
              axisLine={false}
              minTickGap={32}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={6}
              domain={domain}
              width={56}
              unit={` ${axisLabels[parameter]}`}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(label, payload) => {
                    const recordedAt = payload?.[0]?.payload?.recordedAt;
                    if (!recordedAt) return label;
                    return new Date(recordedAt).toLocaleString("id-ID", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <ReferenceLine y={0} stroke="var(--border)" strokeDasharray="3 3" />
            <Area
              dataKey={parameter}
              type="monotone"
              stroke={color}
              strokeWidth={2}
              fill={`url(#fill-prism-${parameter})`}
              fillOpacity={0.6}
              isAnimationActive={false}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
