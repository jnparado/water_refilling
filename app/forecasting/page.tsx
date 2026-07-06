import type { Metadata } from "next";
import { CalendarDays, CloudSun, PartyPopper, Sun, TrendingUp } from "lucide-react";

import { AiPanel } from "@/components/ai-panel";
import { ForecastChart } from "@/components/charts/forecast-chart";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DEMAND_FORECAST, FORECAST_FACTORS } from "@/lib/data/sales";

export const metadata: Metadata = { title: "Demand Forecasting" };

const factorIcons: Record<string, React.ReactNode> = {
  Weather: <CloudSun className="size-4" />,
  Holidays: <CalendarDays className="size-4" />,
  Season: <Sun className="size-4" />,
  "Past sales": <TrendingUp className="size-4" />,
  Events: <PartyPopper className="size-4" />,
};

export default function ForecastingPage() {
  const totalExpected = DEMAND_FORECAST.reduce((s, r) => s + r.expectedOrders, 0);
  const totalLast = DEMAND_FORECAST.reduce((s, r) => s + r.lastMonthOrders, 0);
  const growth = Math.round(((totalExpected - totalLast) / totalLast) * 100);

  return (
    <>
      <PageHeader
        title="AI Demand Forecasting"
        description="July projection built from weather, holidays, season, past sales, and local events"
      />
      <main className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
        <AiPanel title="July Forecast Summary">
          Expected total: <strong>{totalExpected} orders</strong> ({growth >= 0 ? "+" : ""}
          {growth}% vs June). Prepare inventory for the peak weeks of Jul 6–19 — production should
          run at ~135 containers/day, and the fiesta on Jul 18–19 adds roughly 60 containers of
          one-off demand. Rain arriving late July is expected to soften week 4 by about 5%.
        </AiPanel>

        <div className="grid gap-4 lg:grid-cols-5">
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Expected Orders by Water Type</CardTitle>
              <CardDescription>June actuals vs July forecast</CardDescription>
            </CardHeader>
            <CardContent>
              <ForecastChart data={DEMAND_FORECAST} />
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Forecast Drivers</CardTitle>
              <CardDescription>What the model weighed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {FORECAST_FACTORS.map((f) => (
                <div key={f.factor} className="flex gap-3 rounded-lg border p-3">
                  <div className="mt-0.5 text-primary">{factorIcons[f.factor]}</div>
                  <div className="min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium">{f.factor}</p>
                      <Badge variant="outline" className="shrink-0 text-[11px]">{f.impact}</Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{f.detail}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>July Forecast Detail</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Product</TableHead>
                  <TableHead className="text-right">June Actual</TableHead>
                  <TableHead className="text-right">July Expected</TableHead>
                  <TableHead className="text-right">Change</TableHead>
                  <TableHead className="pr-6">Why</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {DEMAND_FORECAST.map((row) => {
                  const change = Math.round(
                    ((row.expectedOrders - row.lastMonthOrders) / row.lastMonthOrders) * 100
                  );
                  return (
                    <TableRow key={row.waterType}>
                      <TableCell className="pl-6 font-medium">{row.waterType}</TableCell>
                      <TableCell className="text-right tabular-nums">{row.lastMonthOrders}</TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">{row.expectedOrders}</TableCell>
                      <TableCell
                        className={`text-right tabular-nums ${
                          change >= 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {change >= 0 ? "+" : ""}
                        {change}%
                      </TableCell>
                      <TableCell className="pr-6 text-sm text-muted-foreground">
                        {row.drivers.join(" · ")}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
