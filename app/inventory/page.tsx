import type { Metadata } from "next";
import { PackagePlus } from "lucide-react";

import { AiPanel } from "@/components/ai-panel";
import { KpiCard } from "@/components/kpi-card";
import { PageHeader } from "@/components/page-header";
import { ProductionChart } from "@/components/charts/production-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  INVENTORY,
  PRODUCTION_SERIES,
  SUPPLIERS,
  daysOfStock,
  stockStatus,
} from "@/lib/data/inventory";

export const metadata: Metadata = { title: "Inventory" };

const statusStyle: Record<string, string> = {
  Healthy: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  "Reorder Soon": "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  Critical: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
};

export default function InventoryPage() {
  const critical = INVENTORY.filter((i) => stockStatus(i) === "Critical");
  const soon = INVENTORY.filter((i) => stockStatus(i) === "Reorder Soon");
  const fiveGal = INVENTORY.find((i) => i.id === "inv-001")!;

  return (
    <>
      <PageHeader
        title="Smart Inventory Management"
        description="Water stock, containers, caps, labels, filters, and chemicals — with AI runway forecasts"
        actions={
          <Button size="sm">
            <PackagePlus className="size-4" /> Receive Stock
          </Button>
        }
      />
      <main className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard label="Tracked Items" value={String(INVENTORY.length)} />
          <KpiCard label="Critical" value={String(critical.length)} invertColor change={1} changeLabel="vs last week" />
          <KpiCard label="Reorder Soon" value={String(soon.length)} />
          <KpiCard label="Filled 5-Gal Runway" value={`${daysOfStock(fiveGal)} days`} />
        </div>

        <AiPanel title="AI Inventory Forecast">
          Filled 5-gallon containers: <strong>{fiveGal.stock} on hand</strong>, selling{" "}
          <strong>{fiveGal.dailyUsage}/day</strong> → inventory will last about{" "}
          <strong>{daysOfStock(fiveGal)} days</strong>. With July demand forecast up 12% and
          AquaSource&apos;s 2-day lead time, the recommendation is to{" "}
          <strong>order another {fiveGal.reorderQty} containers this week</strong>. UV lamps and
          sediment filters are also below their reorder points — bundled suggestions are in the
          table below.
        </AiPanel>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Production vs Sales — This Week</CardTitle>
              <CardDescription>Containers refilled per day against containers sold</CardDescription>
            </CardHeader>
            <CardContent>
              <ProductionChart data={PRODUCTION_SERIES} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Reorder Suggestions</CardTitle>
              <CardDescription>Based on runway, lead time, and the July forecast</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {INVENTORY.filter((i) => i.reorderQty).map((i) => {
                const supplier = SUPPLIERS.find((s) => s.id === i.supplierId)!;
                return (
                  <div key={i.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{i.name}</p>
                      <p className="text-xs text-muted-foreground">
                        ~{daysOfStock(i)} days left · order {i.reorderQty} {i.unit} from {supplier.name} (
                        {supplier.leadTimeDays}-day lead)
                      </p>
                    </div>
                    <Button size="sm" variant="outline" className="shrink-0">
                      Create PO
                    </Button>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Inventory</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Item</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Daily Usage</TableHead>
                  <TableHead className="text-right">Days Left</TableHead>
                  <TableHead className="text-right">Reorder Point</TableHead>
                  <TableHead className="pr-6">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {INVENTORY.map((i) => {
                  const status = stockStatus(i);
                  return (
                    <TableRow key={i.id}>
                      <TableCell className="pl-6 font-medium">{i.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{i.category}</Badge>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {i.stock.toLocaleString()} {i.unit}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {i.dailyUsage} {i.unit}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{daysOfStock(i)}</TableCell>
                      <TableCell className="text-right tabular-nums">{i.reorderPoint.toLocaleString()}</TableCell>
                      <TableCell className="pr-6">
                        <Badge variant="secondary" className={statusStyle[status]}>
                          {status}
                        </Badge>
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
