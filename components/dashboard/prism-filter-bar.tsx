"use client";

import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Filter, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import type {
  AnalysisGranularity,
  GnssRange,
  PrismParameter,
} from "@/lib/types";

type ParameterOption = { label: string; value: PrismParameter };

const parameterItems: ParameterOption[] = [
  { label: "Total displacement", value: "total" },
  { label: "ΔX (East)", value: "dx" },
  { label: "ΔY (North)", value: "dy" },
  { label: "ΔZ (Up)", value: "dz" },
  { label: "Velocity (mm/hari)", value: "velocity" },
  { label: "Velocity tahunan", value: "velocityYear" },
];

const rangeItems: Array<{ label: string; value: GnssRange }> = [
  { label: "30 hari", value: "30d" },
  { label: "90 hari", value: "90d" },
  { label: "180 hari", value: "180d" },
  { label: "Semua", value: "all" },
  { label: "Pilih tanggal", value: "custom" },
];

const granularityItems: Array<{ label: string; value: AnalysisGranularity }> = [
  { label: "Per jam", value: "hourly" },
  { label: "Harian", value: "daily" },
];

type PrismFilterBarProps = {
  selectedParameter: PrismParameter;
  selectedRange: GnssRange;
  selectedGranularity: AnalysisGranularity;
  selectedDateFrom: string;
  selectedDateTo: string;
  action?: React.ReactNode;
};

export function PrismFilterBar({
  selectedParameter,
  selectedRange,
  selectedGranularity,
  selectedDateFrom,
  selectedDateTo,
  action,
}: PrismFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.replace(`${pathname}?${params.toString()}`);
  }

  function updateRange(value: GnssRange) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", value);
    if (value !== "custom") {
      params.delete("from");
      params.delete("to");
    }
    router.replace(`${pathname}?${params.toString()}`);
  }

  function reset() {
    const params = new URLSearchParams(searchParams.toString());
    const prism = params.get("prism");
    const next = new URLSearchParams();
    if (prism) next.set("prism", prism);
    router.replace(`${pathname}?${next.toString()}`);
  }

  return (
    <div className="interactive-card flex flex-col gap-3 rounded-lg border bg-card p-3 shadow-xs md:flex-row md:flex-wrap md:items-center md:justify-between">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Filter className="size-4 text-muted-foreground" />
        Filter Prism
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={selectedParameter}
          onValueChange={(value) => value && update("parameter", value)}
          items={parameterItems}
        >
          <SelectTrigger size="sm" className="w-[200px]">
            <SelectValue placeholder="Parameter" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {parameterItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select
          value={selectedRange}
          onValueChange={(value) => updateRange(value as GnssRange)}
          items={rangeItems}
        >
          <SelectTrigger size="sm" className="w-[140px]">
            <SelectValue placeholder="Rentang" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {rangeItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select
          value={selectedGranularity}
          onValueChange={(value) => value && update("granularity", value)}
          items={granularityItems}
        >
          <SelectTrigger size="sm" className="w-[120px]">
            <SelectValue placeholder="Granularitas" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {granularityItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        {selectedRange === "custom" ? (
          <>
            <Input
              type="date"
              value={selectedDateFrom}
              onChange={(e) => update("from", e.target.value)}
              className="w-[150px]"
              aria-label="Dari tanggal"
            />
            <Input
              type="date"
              value={selectedDateTo}
              onChange={(e) => update("to", e.target.value)}
              className="w-[150px]"
              aria-label="Sampai tanggal"
            />
          </>
        ) : null}

        <Button variant="outline" size="sm" onClick={reset}>
          <RotateCcw className="size-3.5" />
          Reset
        </Button>
        {action}
      </div>
    </div>
  );
}
