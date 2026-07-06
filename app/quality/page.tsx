import type { Metadata } from "next";
import { AlertTriangle, Droplet, Waves } from "lucide-react";

import { AiPanel } from "@/components/ai-panel";
import { PageHeader } from "@/components/page-header";
import { SensorChart } from "@/components/charts/sensor-chart";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/data/core";
import { ALERTS, SENSOR_LIMITS, SENSOR_SERIES } from "@/lib/data/operations";

export const metadata: Metadata = { title: "Water Quality" };

export default function QualityPage() {
  const latest = SENSOR_SERIES[SENSOR_SERIES.length - 1];
  const qualityAlerts = ALERTS.filter((a) => a.kind === "Quality" || a.kind === "Leak");

  const readings = [
    { label: "TDS", value: `${latest.tds} ppm`, ok: latest.tds <= SENSOR_LIMITS.tds.max },
    { label: "pH", value: String(latest.ph), ok: latest.ph >= 6.5 && latest.ph <= 7.8 },
    { label: "Temperature", value: `${latest.temperature} °C`, ok: latest.temperature <= 30 },
    { label: "Turbidity", value: `${latest.turbidity} NTU`, ok: latest.turbidity <= 1 },
    { label: "Pressure", value: `${latest.pressure} psi`, ok: latest.pressure >= 45 && latest.pressure <= 70 },
    { label: "Flow Rate", value: `${latest.flowRate} L/min`, ok: latest.flowRate >= 9 },
  ];

  return (
    <>
      <PageHeader
        title="Water Quality Monitoring"
        description="Live sensor readings with AI anomaly and leak detection"
      />
      <main className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
        {/* Live readings */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
          {readings.map((r) => (
            <Card key={r.label} className={!r.ok ? "border-red-300 dark:border-red-900" : undefined}>
              <CardContent>
                <p className="text-sm text-muted-foreground">{r.label}</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">{r.value}</p>
                <Badge
                  variant="secondary"
                  className={
                    r.ok
                      ? "mt-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                      : "mt-1 bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                  }
                >
                  {r.ok ? "Normal" : "Out of range"}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        <AiPanel title="AI Anomaly Detection">
          Product water TDS was steady at ~8 ppm all day, then jumped to{" "}
          <strong>{latest.tds} ppm at 8 PM</strong> — outside the acceptable range of 0–15 ppm.
          Turbidity rose and flow dropped at the same time, a signature that matches an{" "}
          <strong>RO membrane breach or bypass-valve leak</strong> (91% confidence), not a sensor
          fault. Dispensing on Line 2 was paused automatically and the technician was notified.
        </AiPanel>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Waves className="size-4 text-primary" /> Sensor Trends — Last 24 Hours
              </CardTitle>
              <CardDescription>Select a metric; red lines mark acceptable limits</CardDescription>
            </CardHeader>
            <CardContent>
              <SensorChart />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplet className="size-4 text-primary" /> Leak Detection
              </CardTitle>
              <CardDescription>Flow-sensor pattern analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {qualityAlerts.map((a) => (
                <Alert key={a.id} variant={a.severity === "Critical" ? "destructive" : "default"}>
                  <AlertTriangle className="size-4" />
                  <AlertTitle className="text-sm">{a.title}</AlertTitle>
                  <AlertDescription className="text-xs">
                    {a.detail}
                    <span className="mt-1 block text-muted-foreground">{formatDateTime(a.time)}</span>
                  </AlertDescription>
                </Alert>
              ))}
              <p className="text-xs text-muted-foreground">
                The AI compares overnight flow against production schedules to catch pipe leaks,
                tank leaks, and unusual usage. Estimated water lost this week: 240 L (₱12 at cost).
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
