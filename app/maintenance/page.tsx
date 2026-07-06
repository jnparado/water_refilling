import type { Metadata } from "next";
import { Wrench } from "lucide-react";

import { AiPanel } from "@/components/ai-panel";
import { KpiCard } from "@/components/kpi-card";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatDate } from "@/lib/data/core";
import { MACHINES } from "@/lib/data/operations";

export const metadata: Metadata = { title: "Machine Maintenance" };

const statusStyle: Record<string, string> = {
  Healthy: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  Attention: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  Critical: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
};

export default function MaintenancePage() {
  const critical = MACHINES.filter((m) => m.status === "Critical");
  const attention = MACHINES.filter((m) => m.status === "Attention");
  const avg = Math.round(MACHINES.reduce((s, m) => s + m.healthScore, 0) / MACHINES.length);

  return (
    <>
      <PageHeader
        title="AI Maintenance Prediction"
        description="RO units, UV sterilizers, pumps, and filters — failures predicted before they happen"
      />
      <main className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard label="Machines Monitored" value={String(MACHINES.length)} />
          <KpiCard label="Fleet Health" value={`${avg}%`} change={-4} changeLabel="this week" invertColor={false} />
          <KpiCard label="Needs Attention" value={String(attention.length)} />
          <KpiCard label="Critical" value={String(critical.length)} />
        </div>

        <AiPanel title="Priority Action">
          The <strong>Pre-Filter Bank</strong> is the highest-risk asset: pressure drop across the
          sediment cartridges is 2.3× baseline and will begin throttling RO output within{" "}
          <strong>~5 days</strong>. Replacing the ₱720 cartridge set now prevents an estimated
          ₱6,500 in lost production and protects the ₱18,000 RO membrane. Technician Ariel Bustos
          has an open slot tomorrow morning.
        </AiPanel>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {MACHINES.map((m) => (
            <Card key={m.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{m.name}</CardTitle>
                    <CardDescription>{m.type}</CardDescription>
                  </div>
                  <Badge variant="secondary" className={statusStyle[m.status]}>
                    {m.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-muted-foreground">Health score</span>
                    <span className="tabular-nums">{m.healthScore}/100</span>
                  </div>
                  <Progress value={m.healthScore} className="h-2" />
                </div>
                <p className="text-sm text-muted-foreground">{m.prediction}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{m.runtimeHours.toLocaleString()} h runtime</span>
                  <span>Last service {formatDate(m.lastServiceAt)}</span>
                </div>
                {m.predictedFailureInDays !== null && (
                  <Button size="sm" variant="outline" className="w-full">
                    <Wrench className="size-4" /> Schedule service (within {m.predictedFailureInDays} days)
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}
