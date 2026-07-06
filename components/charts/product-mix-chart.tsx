"use client";

import { Cell, Pie, PieChart } from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"];

const config = {
  Purified: { label: "Purified", color: "var(--chart-1)" },
  Alkaline: { label: "Alkaline", color: "var(--chart-2)" },
  Mineral: { label: "Mineral", color: "var(--chart-3)" },
  Distilled: { label: "Distilled", color: "var(--chart-4)" },
} satisfies ChartConfig;

export function ProductMixChart({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  return (
    <ChartContainer config={config} className="mx-auto h-64 w-full max-w-xs">
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
          strokeWidth={2}
        >
          {data.map((entry, i) => (
            <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <ChartLegend content={<ChartLegendContent nameKey="name" />} />
      </PieChart>
    </ChartContainer>
  );
}
