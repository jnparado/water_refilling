import Link from "next/link";
import type { Metadata } from "next";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { KpiCard } from "@/components/kpi-card";
import { PageHeader } from "@/components/page-header";
import { ProductMixChart } from "@/components/charts/product-mix-chart";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { peso } from "@/lib/data/core";
import {
  DAILY_SALES,
  INSIGHTS,
  PRODUCT_MIX,
  TOP_CUSTOMERS,
  salesMonth,
  salesPrevMonth,
  salesToday,
  salesWeek,
} from "@/lib/data/sales";

export const metadata: Metadata = { title: "Sales & Insights" };

export default function SalesPage() {
  const monthGrowth = Math.round(
    ((salesMonth.revenue - salesPrevMonth.revenue) / salesPrevMonth.revenue) * 100
  );
  // Rough margin estimate for the demo: water refills run high-margin
  const profit = Math.round(salesMonth.revenue * 0.42);

  return (
    <>
      <PageHeader
        title="AI Sales Dashboard"
        description="Revenue, top products and customers — with insights explained in plain language"
      />
      <main className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <KpiCard label="Today" value={peso.format(salesToday.revenue)} change={8} changeLabel="vs avg" />
          <KpiCard label="This Week" value={peso.format(salesWeek.revenue)} change={6} changeLabel="vs last week" />
          <KpiCard label="This Month" value={peso.format(salesMonth.revenue)} change={monthGrowth} changeLabel="vs last month" />
          <KpiCard label="Est. Monthly Profit" value={peso.format(profit)} change={11} changeLabel="vs last month" />
          <KpiCard label="Gallons Sold Today" value={String(salesToday.gallonsSold)} />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Revenue — Last 90 Days</CardTitle>
              <CardDescription>The summer ramp is visible from mid-May</CardDescription>
            </CardHeader>
            <CardContent>
              <RevenueChart data={DAILY_SALES} days={90} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Products</CardTitle>
              <CardDescription>Monthly revenue share</CardDescription>
            </CardHeader>
            <CardContent>
              <ProductMixChart data={PRODUCT_MIX.map((p) => ({ name: p.name, value: p.value }))} />
              <div className="mt-2 space-y-1">
                {PRODUCT_MIX.map((p) => (
                  <div key={p.name} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{p.name}</span>
                    <span className="tabular-nums">{peso.format(p.revenue)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Top Customers</CardTitle>
              <CardDescription>By lifetime spend</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {TOP_CUSTOMERS.map((c, i) => (
                <Link
                  key={c.id}
                  href={`/customers/${c.id}`}
                  className="flex items-center gap-3 rounded-lg p-1.5 hover:bg-muted"
                >
                  <span className="w-4 text-sm text-muted-foreground">{i + 1}</span>
                  <Avatar className="size-8">
                    <AvatarFallback className="text-xs">
                      {c.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.totalOrders} orders</p>
                  </div>
                  <span className="text-sm font-semibold tabular-nums">{peso.format(c.totalSpent)}</span>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>AI Business Insights</CardTitle>
              <CardDescription>Not just graphs — the AI explains what changed and why</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {INSIGHTS.map((ins) => (
                <div key={ins.id} className="rounded-xl border p-4">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline">{ins.category}</Badge>
                    <span
                      className={`flex items-center gap-0.5 text-sm font-semibold ${
                        ins.direction === "up"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {ins.direction === "up" ? (
                        <ArrowUpRight className="size-4" />
                      ) : (
                        <ArrowDownRight className="size-4" />
                      )}
                      {ins.changePct}%
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-medium">{ins.headline}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {ins.explanation}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
