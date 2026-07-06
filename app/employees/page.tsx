import type { Metadata } from "next";
import { Star } from "lucide-react";

import { AiPanel } from "@/components/ai-panel";
import { KpiCard } from "@/components/kpi-card";
import { PageHeader } from "@/components/page-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { peso } from "@/lib/data/core";
import { EMPLOYEES, performanceScore } from "@/lib/data/employees";

export const metadata: Metadata = { title: "Employees" };

const statusStyle: Record<string, string> = {
  "On Duty": "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  "On Delivery": "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
  "Off Duty": "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  "On Leave": "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
};

export default function EmployeesPage() {
  const payroll = EMPLOYEES.reduce((s, e) => s + e.monthlySalary, 0);
  const avgAttendance = Math.round(
    EMPLOYEES.reduce((s, e) => s + e.attendanceRate, 0) / EMPLOYEES.length
  );
  const drivers = EMPLOYEES.filter((e) => e.role === "Driver");
  const ranked = [...EMPLOYEES].sort((a, b) => performanceScore(b) - performanceScore(a));

  return (
    <>
      <PageHeader
        title="Employee Management"
        description="Drivers, cashiers, production staff, and technicians — attendance, payroll, and AI performance"
      />
      <main className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard label="Team Size" value={String(EMPLOYEES.length)} />
          <KpiCard label="On Duty Now" value={String(EMPLOYEES.filter((e) => e.status !== "Off Duty" && e.status !== "On Leave").length)} />
          <KpiCard label="Avg Attendance" value={`${avgAttendance}%`} change={1} changeLabel="vs last month" />
          <KpiCard label="Monthly Payroll" value={peso.format(payroll)} />
        </div>

        <Tabs defaultValue="roster">
          <TabsList>
            <TabsTrigger value="roster">Roster & Payroll</TabsTrigger>
            <TabsTrigger value="performance">AI Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="roster" className="mt-4">
            <Card>
              <CardContent className="px-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-6">Employee</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Attendance</TableHead>
                      <TableHead className="text-right">Monthly Salary</TableHead>
                      <TableHead className="pr-6 text-right">Rating</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {EMPLOYEES.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell className="pl-6">
                          <div className="flex items-center gap-3">
                            <Avatar className="size-8">
                              <AvatarFallback className="text-xs">
                                {e.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium leading-tight">{e.name}</p>
                              <p className="text-xs text-muted-foreground">{e.phone}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{e.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={statusStyle[e.status]}>
                            {e.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{e.attendanceRate}%</TableCell>
                        <TableCell className="text-right tabular-nums">{peso.format(e.monthlySalary)}</TableCell>
                        <TableCell className="pr-6 text-right">
                          <span className="inline-flex items-center gap-1 tabular-nums">
                            <Star className="size-3.5 fill-amber-400 text-amber-400" />
                            {e.performance.customerRating.toFixed(1)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="mt-4 flex flex-col gap-4">
            <AiPanel title="AI Performance Review — This Month">
              <strong>{ranked[0].name}</strong> leads the team (score {performanceScore(ranked[0])}):
              fastest average delivery at {ranked[0].performance.avgDeliveryMinutes} minutes with a{" "}
              {ranked[0].performance.customerRating} rating.{" "}
              <strong>Marvin Sison</strong> needs coaching — 11 late arrivals and the slowest
              delivery average (31 min). His route data shows the delays cluster around lunchtime
              Poblacion traffic; shifting his window 45 minutes earlier is projected to cut late
              arrivals by half.
            </AiPanel>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {ranked.map((e) => {
                const score = performanceScore(e);
                const isDriver = e.role === "Driver";
                return (
                  <Card key={e.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{e.name}</CardTitle>
                          <CardDescription>{e.role}</CardDescription>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-semibold tabular-nums">{score}</p>
                          <p className="text-xs text-muted-foreground">AI score</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Progress value={score} className="h-1.5" />
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-1 text-xs text-muted-foreground">
                        <span>Rating: {e.performance.customerRating.toFixed(1)}/5</span>
                        <span>Attendance: {e.attendanceRate}%</span>
                        <span>Late arrivals: {e.performance.lateArrivals}</span>
                        {isDriver ? (
                          <>
                            <span>Deliveries: {e.performance.deliveriesCompleted}</span>
                            <span>Avg time: {e.performance.avgDeliveryMinutes} min</span>
                            <span>Fuel: {e.performance.fuelEfficiencyKmL} km/L</span>
                          </>
                        ) : (
                          <span>Role KPI on track</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Driver Comparison</CardTitle>
                <CardDescription>Deliveries, speed, punctuality, and fuel — this month</CardDescription>
              </CardHeader>
              <CardContent className="px-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-6">Driver</TableHead>
                      <TableHead className="text-right">Deliveries</TableHead>
                      <TableHead className="text-right">Rating</TableHead>
                      <TableHead className="text-right">Avg Time</TableHead>
                      <TableHead className="text-right">Late Arrivals</TableHead>
                      <TableHead className="pr-6 text-right">Fuel (km/L)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {drivers.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell className="pl-6 font-medium">{d.name}</TableCell>
                        <TableCell className="text-right tabular-nums">{d.performance.deliveriesCompleted}</TableCell>
                        <TableCell className="text-right tabular-nums">{d.performance.customerRating.toFixed(1)}</TableCell>
                        <TableCell className="text-right tabular-nums">{d.performance.avgDeliveryMinutes} min</TableCell>
                        <TableCell className="text-right tabular-nums">{d.performance.lateArrivals}</TableCell>
                        <TableCell className="pr-6 text-right tabular-nums">{d.performance.fuelEfficiencyKmL}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
