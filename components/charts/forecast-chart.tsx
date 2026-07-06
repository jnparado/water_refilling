"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const config = {
  lastMonthOrders: { label: "June (actual)", color: "var(--chart-2)" },
  expectedOrders: { label: "July (forecast)", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function ForecastChart({
  data,
}: {
  data: { waterType: string; expectedOrders: number; lastMonthOrders: number }[];
}) {
  return (
    <ChartContainer config={config} className="h-72 w-full">
      <BarChart data={data} margin={{ top: 8 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="waterType" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis tickLine={false} axisLine={false} width={36} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="lastMonthOrders" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expectedOrders" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
