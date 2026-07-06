import type { Metadata } from "next";
import { ShieldAlert } from "lucide-react";

import { AiPanel } from "@/components/ai-panel";
import { KpiCard } from "@/components/kpi-card";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatDate, peso } from "@/lib/data/core";
import { FRAUD_CASES } from "@/lib/data/operations";

export const metadata: Metadata = { title: "Fraud Detection" };

const statusStyle: Record<string, string> = {
  Open: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  Investigating: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  Resolved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  Dismissed: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
};

export default function FraudPage() {
  const open = FRAUD_CASES.filter((c) => c.status === "Open" || c.status === "Investigating");
  const atRisk = open.reduce((s, c) => s + c.amountAtRisk, 0);

  return (
    <>
      <PageHeader
        title="AI Fraud Detection"
        description="Refunds, deliveries, inventory movements, and discounts screened for anomalies"
      />
      <main className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard label="Open Cases" value={String(open.length)} />
          <KpiCard label="Amount at Risk" value={peso.format(atRisk)} />
          <KpiCard label="Transactions Screened (30d)" value="1,842" />
          <KpiCard label="False Positive Rate" value="6%" change={-2} changeLabel="after feedback" invertColor />
        </div>

        <AiPanel title="How screening works">
          Every refund, delivery confirmation, stock movement, and manual discount is compared
          against learned baselines per employee, per customer, and per shift. Cases below are
          ranked by confidence; resolving or dismissing them retrains the thresholds.
        </AiPanel>

        <div className="grid gap-4 lg:grid-cols-2">
          {FRAUD_CASES.map((c) => (
            <Card key={c.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ShieldAlert className="size-4 text-red-500" />
                    {c.type}
                  </CardTitle>
                  <Badge variant="secondary" className={statusStyle[c.status]}>
                    {c.status}
                  </Badge>
                </div>
                <CardDescription>
                  {c.involved} · detected {formatDate(c.detectedAt)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">{c.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Amount at risk</span>
                  <span className="font-semibold tabular-nums">{peso.format(c.amountAtRisk)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={c.confidence} className="h-2 flex-1" />
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {c.confidence}% confidence
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}
