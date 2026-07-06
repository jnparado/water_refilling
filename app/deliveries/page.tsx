import type { Metadata } from "next";
import {
  Clock,
  Fuel,
  MapPin,
  Navigation,
  Route as RouteIcon,
  Truck,
} from "lucide-react";

import { AiPanel } from "@/components/ai-panel";
import { KpiCard } from "@/components/kpi-card";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ROUTES, SCHEDULING_DECISIONS } from "@/lib/data/deliveries";
import { getEmployee } from "@/lib/data/employees";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Deliveries & Routes" };

const stopStatusStyle: Record<string, string> = {
  Delivered: "bg-emerald-500",
  Arrived: "bg-sky-500",
  "En Route": "bg-amber-500 animate-pulse",
  Pending: "bg-muted-foreground/30",
};

export default function DeliveriesPage() {
  const allStops = ROUTES.flatMap((r) => r.stops);
  const remaining = allStops.filter((s) => s.status !== "Delivered");
  const totalSavings = ROUTES.reduce((s, r) => s + r.optimizedSavingsKm, 0);
  const fuelSaved = ROUTES.reduce((s, r) => s + r.fuelSavedLiters, 0);
  const nextEta = remaining
    .filter((s) => s.status === "En Route")
    .sort((a, b) => a.etaMinutes - b.etaMinutes)[0];

  return (
    <>
      <PageHeader
        title="Deliveries & Route Optimization"
        description="AI-planned routes, automatic driver assignment, live ETAs, and GPS tracking"
      />
      <main className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard label="Stops Today" value={String(allStops.length)} icon={<MapPin className="size-4" />} />
          <KpiCard label="Remaining" value={String(remaining.length)} icon={<Truck className="size-4" />} />
          <KpiCard label="Distance Saved" value={`${totalSavings.toFixed(1)} km`} icon={<RouteIcon className="size-4" />} change={12} changeLabel="vs unoptimized" />
          <KpiCard label="Fuel Saved" value={`${fuelSaved.toFixed(1)} L`} icon={<Fuel className="size-4" />} />
        </div>

        {nextEta && (
          <AiPanel title="Live ETA Update">
            <strong>{nextEta.customerName}</strong> was just notified: &ldquo;Your order will arrive
            in <strong>{nextEta.etaMinutes} minutes</strong>.&rdquo; ETAs recalculate automatically
            when traffic conditions change — the Katipunan Rd segment is moving slower than usual,
            so downstream stops were pushed back by 6 minutes and customers were re-notified.
          </AiPanel>
        )}

        <Tabs defaultValue="routes">
          <TabsList>
            <TabsTrigger value="routes">Optimized Routes</TabsTrigger>
            <TabsTrigger value="scheduling">AI Scheduling</TabsTrigger>
            <TabsTrigger value="tracking">Live Tracking</TabsTrigger>
          </TabsList>

          <TabsContent value="routes" className="mt-4 grid gap-4 xl:grid-cols-3">
            {ROUTES.map((route) => {
              const driver = getEmployee(route.driverId);
              return (
                <Card key={route.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-base">{driver?.name}</CardTitle>
                        <CardDescription>{route.vehicle}</CardDescription>
                      </div>
                      <Badge variant={route.status === "In Progress" ? "default" : "secondary"}>
                        {route.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{route.totalKm.toFixed(1)} km total</span>
                      <span>saves {route.optimizedSavingsKm.toFixed(1)} km vs naive order</span>
                    </div>
                    <div>
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="text-muted-foreground">Truck capacity</span>
                        <span>{route.capacityUsedPct}%</span>
                      </div>
                      <Progress value={route.capacityUsedPct} className="h-1.5" />
                    </div>
                    <ol className="space-y-0">
                      {route.stops.map((stop, i) => (
                        <li key={stop.orderId} className="relative flex gap-3 pb-4 last:pb-0">
                          {i < route.stops.length - 1 && (
                            <span className="absolute left-[7px] top-5 h-full w-px bg-border" />
                          )}
                          <span
                            className={cn(
                              "relative mt-1 size-3.5 shrink-0 rounded-full border-2 border-background ring-1 ring-border",
                              stopStatusStyle[stop.status]
                            )}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="truncate text-sm font-medium">
                                {stop.seq}. {stop.customerName}
                              </p>
                              {stop.priority !== "Normal" && (
                                <Badge variant="outline" className="shrink-0 text-[10px]">
                                  {stop.priority}
                                </Badge>
                              )}
                            </div>
                            <p className="truncate text-xs text-muted-foreground">{stop.address}</p>
                            <p className="text-xs text-muted-foreground">
                              {stop.status === "Delivered" ? (
                                <span className="text-emerald-600 dark:text-emerald-400">Delivered</span>
                              ) : (
                                <span className="flex items-center gap-1">
                                  <Clock className="size-3" /> ETA {stop.etaMinutes} min · {stop.distanceKm} km leg
                                </span>
                              )}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="scheduling" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Automatic Assignment Log</CardTitle>
                <CardDescription>
                  Orders are assigned using driver location, truck capacity, priority, and customer availability
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {SCHEDULING_DECISIONS.map((d) => (
                  <div key={d.orderId} className="flex gap-3 rounded-lg border p-3">
                    <Navigation className="mt-0.5 size-4 shrink-0 text-primary" />
                    <div>
                      <p className="text-sm font-medium">
                        {d.orderId} · {d.customerName} → {d.assignedTo}
                      </p>
                      <p className="text-xs text-muted-foreground">{d.reason}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tracking" className="mt-4 grid gap-4 lg:grid-cols-3">
            {ROUTES.filter((r) => r.status !== "Scheduled").map((route) => {
              const driver = getEmployee(route.driverId);
              const current = route.stops.find((s) => s.status === "En Route");
              const done = route.stops.filter((s) => s.status === "Delivered").length;
              return (
                <Card key={route.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <span className="relative flex size-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
                      </span>
                      {driver?.name}
                    </CardTitle>
                    <CardDescription>GPS live · updated 15 s ago</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="rounded-lg bg-muted p-3 text-sm">
                      {current ? (
                        <>
                          <p className="font-medium">En route to {current.customerName}</p>
                          <p className="text-xs text-muted-foreground">
                            {current.address} · arriving in ~{current.etaMinutes} min
                          </p>
                        </>
                      ) : (
                        <p className="font-medium">Between stops</p>
                      )}
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>
                        {done}/{route.stops.length} stops completed
                      </span>
                      <span>{route.totalKm.toFixed(1)} km route</span>
                    </div>
                    <Progress value={(done / route.stops.length) * 100} className="h-1.5" />
                    <p className="text-xs text-muted-foreground">
                      Full map view uses the Google Maps API once the key is configured — see README.
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
