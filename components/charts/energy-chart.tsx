"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const config = {
  kwh: { label: "kWh", color: "var(--chart-4)" },
} satisfies ChartConfig;

export function EnergyChart({ data }: { data: { day: string; kwh: number }[] }) {
  return (
    <ChartContainer config={config} className="h-64 w-full">
      <BarChart data={data} margin={{ top: 8 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis tickLine={false} axisLine={false} width={36} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="kwh" fill="var(--chart-4)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
