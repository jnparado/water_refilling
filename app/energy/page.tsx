import type { Metadata } from "next";
import { ArrowDownRight, ArrowUpRight, Minus, Zap } from "lucide-react";

import { AiPanel } from "@/components/ai-panel";
import { KpiCard } from "@/components/kpi-card";
import { PageHeader } from "@/components/page-header";
import { EnergyChart } from "@/components/charts/energy-chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { peso } from "@/lib/data/core";
import { ENERGY_DEVICES, ENERGY_SERIES } from "@/lib/data/operations";

export const metadata: Metadata = { title: "Energy Monitor" };

export default function EnergyPage() {
  const totalKwh = ENERGY_DEVICES.reduce((s, d) => s + d.todayKwh, 0);
  const totalCost = ENERGY_DEVICES.reduce((s, d) => s + d.costToday, 0);

  return (
    <>
      <PageHeader
        title="AI Energy Monitoring"
        description="Pump electricity, machine runtime, and power consumption with savings suggestions"
      />
      <main className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard label="Today's Consumption" value={`${totalKwh.toFixed(1)} kWh`} icon={<Zap className="size-4" />} />
          <KpiCard label="Today's Cost" value={peso.format(totalCost)} change={9} changeLabel="vs 30-day avg" invertColor />
          <KpiCard label="Cost per Container" value="₱3.60" change={6} changeLabel="up — see note" invertColor />
          <KpiCard label="Identified Savings" value="₱1,100/mo" />
        </div>

        <AiPanel title="Energy-Saving Opportunities">
          <ul className="list-disc space-y-1 pl-4">
            <li>
              The <strong>RO high-pressure pump</strong> is drawing 14% more power for the same
              output — consistent with the clogged pre-filters. Replacing cartridges saves ~₱480/month.
            </li>
            <li>
              <strong>Store air conditioning</strong> runs ~1.5 h after closing on weekdays. A simple
              timer switch saves ~₱620/month.
            </li>
          </ul>
        </AiPanel>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Consumption — This Week</CardTitle>
              <CardDescription>Total station load per day (kWh)</CardDescription>
            </CardHeader>
            <CardContent>
              <EnergyChart data={ENERGY_SERIES} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>By Equipment — Today</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Device</TableHead>
                    <TableHead className="text-right">kWh</TableHead>
                    <TableHead className="text-right">Runtime</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                    <TableHead className="pr-6">Trend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ENERGY_DEVICES.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="pl-6">
                        <p className="text-sm font-medium">{d.name}</p>
                        {d.aiNote && (
                          <p className="mt-0.5 max-w-72 text-xs text-muted-foreground">{d.aiNote}</p>
                        )}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{d.todayKwh.toFixed(1)}</TableCell>
                      <TableCell className="text-right tabular-nums">{d.runtimeHours} h</TableCell>
                      <TableCell className="text-right tabular-nums">{peso.format(d.costToday)}</TableCell>
                      <TableCell className="pr-6">
                        {d.trend === "up" ? (
                          <ArrowUpRight className="size-4 text-red-500" />
                        ) : d.trend === "down" ? (
                          <ArrowDownRight className="size-4 text-emerald-500" />
                        ) : (
                          <Minus className="size-4 text-muted-foreground" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
