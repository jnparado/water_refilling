"use client";

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { MonthFinance } from "@/lib/types";

const config = {
  income: { label: "Income", color: "var(--chart-1)" },
  expenses: { label: "Expenses", color: "var(--chart-4)" },
} satisfies ChartConfig;

export function FinanceChart({ data }: { data: MonthFinance[] }) {
  return (
    <ChartContainer config={config} className="h-72 w-full">
      <BarChart data={data} margin={{ top: 8 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={48}
          tickFormatter={(v: number) => `₱${(v / 1000).toFixed(0)}k`}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="income" radius={[4, 4, 0, 0]}>
          {data.map((d) => (
            <Cell key={d.month} fill="var(--chart-1)" opacity={d.isForecast ? 0.45 : 1} />
          ))}
        </Bar>
        <Bar dataKey="expenses" radius={[4, 4, 0, 0]}>
          {data.map((d) => (
            <Cell key={d.month} fill="var(--chart-4)" opacity={d.isForecast ? 0.45 : 1} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
