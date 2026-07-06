import type { Metadata } from "next";
import { TrendingUp } from "lucide-react";

import { AiPanel } from "@/components/ai-panel";
import { KpiCard } from "@/components/kpi-card";
import { PageHeader } from "@/components/page-header";
import { FinanceChart } from "@/components/charts/finance-chart";
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
import { peso } from "@/lib/data/core";
import { CASHFLOW_NOTES, FINANCE_SERIES, PRICE_SUGGESTIONS } from "@/lib/data/sales";

export const metadata: Metadata = { title: "Finance & Pricing" };

const demandStyle: Record<string, string> = {
  High: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  Normal: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  Low: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
};

export default function FinancePage() {
  const july = FINANCE_SERIES.find((m) => m.month === "Jul 2026")!;
  const june = FINANCE_SERIES.find((m) => m.month === "Jun 2026")!;
  const julyProfit = july.income - july.expenses;
  const juneProfit = june.income - june.expenses;
  const growth = Math.round(((julyProfit - juneProfit) / juneProfit) * 100);

  return (
    <>
      <PageHeader
        title="AI Financial Forecast & Dynamic Pricing"
        description="Projected income, expenses, cash flow, and price recommendations"
      />
      <main className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard label="July Income (forecast)" value={peso.format(july.income)} change={7} changeLabel="vs June" />
          <KpiCard label="July Expenses (forecast)" value={peso.format(july.expenses)} change={4} changeLabel="vs June" invertColor />
          <KpiCard label="July Profit (forecast)" value={peso.format(julyProfit)} change={growth} changeLabel="vs June" />
          <KpiCard label="Expected Growth" value="+9–12%" changeLabel="through August" icon={<TrendingUp className="size-4" />} />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Income vs Expenses</CardTitle>
              <CardDescription>Solid bars are actuals; faded bars are AI forecasts</CardDescription>
            </CardHeader>
            <CardContent>
              <FinanceChart data={FINANCE_SERIES} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cash Flow Notes</CardTitle>
              <CardDescription>AI commentary on the quarter ahead</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {CASHFLOW_NOTES.map((note, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                    <span className="text-muted-foreground">{note}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <AiPanel title="AI Dynamic Pricing">
          Prices are reviewed weekly against demand, season, competitor scans, and inventory
          levels. Applying the two suggestions below is projected to add{" "}
          <strong>₱2,400/month in profit</strong> while keeping the anchor product (Purified 5
          Gallon) the cheapest option within 1.5 km.
        </AiPanel>

        <Card>
          <CardHeader>
            <CardTitle>Price Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Product</TableHead>
                  <TableHead>Demand</TableHead>
                  <TableHead className="text-right">Current</TableHead>
                  <TableHead className="text-right">Suggested</TableHead>
                  <TableHead>Reasoning</TableHead>
                  <TableHead className="pr-6 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {PRICE_SUGGESTIONS.map((s) => {
                  const changed = s.suggestedPrice !== s.currentPrice;
                  return (
                    <TableRow key={s.productId}>
                      <TableCell className="pl-6 font-medium">{s.productName}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={demandStyle[s.demandLevel]}>
                          {s.demandLevel}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{peso.format(s.currentPrice)}</TableCell>
                      <TableCell
                        className={`text-right font-semibold tabular-nums ${
                          changed
                            ? s.suggestedPrice > s.currentPrice
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-amber-600 dark:text-amber-400"
                            : ""
                        }`}
                      >
                        {peso.format(s.suggestedPrice)}
                      </TableCell>
                      <TableCell className="max-w-96 text-sm text-muted-foreground">{s.reason}</TableCell>
                      <TableCell className="pr-6 text-right">
                        <Button size="sm" variant={changed ? "default" : "outline"} disabled={!changed}>
                          {changed ? "Apply" : "No change"}
                        </Button>
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
