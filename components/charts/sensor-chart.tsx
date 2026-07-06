"use client";

import { useState } from "react";
import { CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis } from "recharts";

import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { SENSOR_LIMITS, SENSOR_SERIES } from "@/lib/data/operations";

type SensorKey = keyof typeof SENSOR_LIMITS;

const keys = Object.keys(SENSOR_LIMITS) as SensorKey[];

export function SensorChart() {
  const [metric, setMetric] = useState<SensorKey>("tds");
  const limits = SENSOR_LIMITS[metric];

  const config = {
    [metric]: { label: limits.label, color: "var(--chart-1)" },
  } satisfies ChartConfig;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {keys.map((k) => (
          <Button
            key={k}
            size="sm"
            variant={metric === k ? "default" : "outline"}
            onClick={() => setMetric(k)}
          >
            {SENSOR_LIMITS[k].label}
          </Button>
        ))}
      </div>
      <ChartContainer config={config} className="h-72 w-full">
        <LineChart data={SENSOR_SERIES} margin={{ top: 8, right: 8 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="time" tickLine={false} axisLine={false} minTickGap={32} tickMargin={8} />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={40}
            domain={["auto", "auto"]}
            tickFormatter={(v: number) => `${v}`}
          />
          <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
          <ReferenceLine
            y={limits.max}
            stroke="var(--destructive)"
            strokeDasharray="4 4"
            label={{ value: `max ${limits.max} ${limits.unit}`, position: "insideTopRight", fontSize: 11 }}
          />
          {limits.min > 0 && (
            <ReferenceLine y={limits.min} stroke="var(--destructive)" strokeDasharray="4 4" />
          )}
          <Line
            dataKey={metric}
            type="monotone"
            stroke="var(--chart-1)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ChartContainer>
      <p className="text-xs text-muted-foreground">
        Acceptable range: {limits.min}–{limits.max} {limits.unit} · readings every hour from the inline sensor array
      </p>
    </div>
  );
}
