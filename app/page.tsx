import Link from "next/link";
import {
  ArrowRight,
  Droplets,
  HeartPulse,
  ShoppingCart,
  Truck,
  Wallet,
  Wrench,
} from "lucide-react";

import { AiPanel } from "@/components/ai-panel";
import { KpiCard } from "@/components/kpi-card";
import { PageHeader } from "@/components/page-header";
import { ProductMixChart } from "@/components/charts/product-mix-chart";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { peso } from "@/lib/data/core";
import { ROUTES } from "@/lib/data/deliveries";
import { INVENTORY, daysOfStock, stockStatus } from "@/lib/data/inventory";
import { ALERTS, MACHINES } from "@/lib/data/operations";
import {
  DAILY_SALES,
  DEMAND_FORECAST,
  INSIGHTS,
  SENTIMENT_SUMMARY,
  salesMonth,
  salesPrevMonth,
  salesToday,
  salesWeek,
} from "@/lib/data/sales";

export default function ExecutiveDashboard() {
  const monthGrowth = Math.round(
    ((salesMonth.revenue - salesPrevMonth.revenue) / salesPrevMonth.revenue) * 100
  );
  const activeStops = ROUTES.flatMap((r) => r.stops).filter(
    (s) => s.status !== "Delivered"
  ).length;
  const avgMachineHealth = Math.round(
    MACHINES.reduce((s, m) => s + m.healthScore, 0) / MACHINES.length
  );
  const criticalItems = INVENTORY.filter((i) => stockStatus(i) === "Critical");
  const unackedAlerts = ALERTS.filter((a) => !a.acknowledged);

  return (
    <>
      <PageHeader
        title="Executive Dashboard"
        description="Business at a glance — sales, operations, machines, and AI recommendations"
        actions={
          <Button asChild size="sm">
            <Link href="/orders/new">
              New Order <ArrowRight className="size-4" />
            </Link>
          </Button>
        }
      />

      <main className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
        {/* KPI row */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
          <KpiCard
            label="Today's Sales"
            value={peso.format(salesToday.revenue)}
            change={8}
            changeLabel="vs avg"
            icon={<Wallet className="size-4" />}
          />
          <KpiCard
            label="This Month"
            value={peso.format(salesMonth.revenue)}
            change={monthGrowth}
            changeLabel="vs last month"
            icon={<ShoppingCart className="size-4" />}
          />
          <KpiCard
            label="Orders This Week"
            value={String(salesWeek.orders)}
            change={6}
            changeLabel="vs last week"
            icon={<Droplets className="size-4" />}
          />
          <KpiCard
            label="Active Deliveries"
            value={String(activeStops)}
            icon={<Truck className="size-4" />}
          />
          <KpiCard
            label="Machine Health"
            value={`${avgMachineHealth}%`}
            change={-4}
            changeLabel="this week"
            icon={<Wrench className="size-4" />}
          />
          <KpiCard
            label="Customer Satisfaction"
            value={`${SENTIMENT_SUMMARY.happy}%`}
            change={3}
            changeLabel="happy"
            icon={<HeartPulse className="size-4" />}
          />
        </div>

        {/* AI recommendations */}
        <AiPanel title="AI Recommendations — Today">
          <ul className="list-disc space-y-1.5 pl-4">
            <li>
              <strong>Water quality:</strong> TDS spiked to 35 ppm on Line 2 at 8:12 PM.
              Dispensing paused — have the technician check the RO membrane before the
              morning shift. <Link href="/quality" className="text-primary underline underline-offset-2">Review readings</Link>
            </li>
            <li>
              <strong>Inventory:</strong> Filled 5-gallon stock lasts ~13 days at current
              sales. Order 300 containers now so they arrive before the Jul 18 fiesta
              demand. <Link href="/inventory" className="text-primary underline underline-offset-2">Open inventory</Link>
            </li>
            <li>
              <strong>Maintenance:</strong> Pre-filter cartridges are 2.3× over baseline
              pressure drop — replace within 5 days to protect the RO membrane and save
              ~₱480/month in pump energy. <Link href="/maintenance" className="text-primary underline underline-offset-2">See prediction</Link>
            </li>
            <li>
              <strong>Growth:</strong> Alkaline demand is up 28%. Raising the 5-gallon
              refill to ₱55 is projected to add ₱2,700/month with minimal volume loss.{" "}
              <Link href="/finance" className="text-primary underline underline-offset-2">Pricing analysis</Link>
            </li>
          </ul>
        </AiPanel>

        {/* Charts row */}
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Revenue — Last 30 Days</CardTitle>
              <CardDescription>Daily sales across delivery and pickup</CardDescription>
            </CardHeader>
            <CardContent>
              <RevenueChart data={DAILY_SALES} days={30} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Sales by Water Type</CardTitle>
              <CardDescription>Share of monthly revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <ProductMixChart
                data={[
                  { name: "Purified", value: 62 },
                  { name: "Alkaline", value: 21 },
                  { name: "Mineral", value: 11 },
                  { name: "Distilled", value: 6 },
                ]}
              />
            </CardContent>
          </Card>
        </div>

        {/* Bottom row */}
        <div className="grid gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>July Demand Forecast</CardTitle>
              <CardDescription>AI projection from weather, season, and events</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {DEMAND_FORECAST.map((row) => {
                const growth = Math.round(
                  ((row.expectedOrders - row.lastMonthOrders) / row.lastMonthOrders) * 100
                );
                return (
                  <div key={row.waterType} className="flex items-center justify-between gap-2">
                    <span className="text-sm">{row.waterType}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold tabular-nums">
                        {row.expectedOrders}
                      </span>
                      <Badge
                        variant="outline"
                        className={
                          growth >= 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-red-600 dark:text-red-400"
                        }
                      >
                        {growth >= 0 ? "+" : ""}
                        {growth}%
                      </Badge>
                    </div>
                  </div>
                );
              })}
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/forecasting">Full forecast</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Inventory Watchlist</CardTitle>
              <CardDescription>
                {criticalItems.length} items need reordering
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {criticalItems.slice(0, 4).map((item) => (
                <div key={item.id}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="truncate">{item.name}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      ~{daysOfStock(item)} days left
                    </span>
                  </div>
                  <Progress
                    value={Math.min(100, (daysOfStock(item) / 30) * 100)}
                    className="h-2"
                  />
                </div>
              ))}
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/inventory">Manage inventory</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Latest AI Insight</CardTitle>
              <CardDescription>Explained in plain language</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm font-medium">{INSIGHTS[0].headline}</p>
              <p className="text-sm text-muted-foreground">{INSIGHTS[0].explanation}</p>
              <div className="flex items-center gap-2 pt-1">
                <Badge variant="secondary">{unackedAlerts.length} open alerts</Badge>
                <Badge variant="secondary">{MACHINES.filter((m) => m.status !== "Healthy").length} machines need attention</Badge>
              </div>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/sales">All insights</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
