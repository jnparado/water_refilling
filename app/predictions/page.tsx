import Link from "next/link";
import type { Metadata } from "next";
import { Brain, MessageSquareText } from "lucide-react";

import { AiPanel } from "@/components/ai-panel";
import { KpiCard } from "@/components/kpi-card";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { REORDER_PREDICTIONS } from "@/lib/data/orders";

export const metadata: Metadata = { title: "AI Reorder Predictions" };

const statusColor: Record<string, string> = {
  Confirmed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  "Message Sent": "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
  Suggested: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  Declined: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
};

export default function PredictionsPage() {
  const confirmed = REORDER_PREDICTIONS.filter((p) => p.status === "Confirmed").length;
  const sent = REORDER_PREDICTIONS.filter((p) => p.status === "Message Sent").length;

  return (
    <>
      <PageHeader
        title="AI Order Prediction"
        description="The model learns each customer's rhythm and reaches out before they run dry"
      />
      <main className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard label="Predictions This Week" value={String(REORDER_PREDICTIONS.length)} />
          <KpiCard label="Reminders Sent" value={String(sent)} />
          <KpiCard label="Confirmed Reorders" value={String(confirmed)} />
          <KpiCard label="Conversion Rate" value="64%" change={7} changeLabel="vs manual reminders" />
        </div>

        <AiPanel title="How it works">
          The model tracks each customer&apos;s order interval, day-of-week preference, and typical
          quantity. When their predicted &quot;running low&quot; date approaches, a reminder is sent
          automatically via SMS or WhatsApp (through the n8n workflow). One tap confirms the reorder.
        </AiPanel>

        <div className="grid gap-4 lg:grid-cols-2">
          {REORDER_PREDICTIONS.map((p) => (
            <Card key={p.customerId}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Brain className="size-4 text-primary" />
                      <Link href={`/customers/${p.customerId}`} className="hover:underline">
                        {p.customerName}
                      </Link>
                    </CardTitle>
                    <CardDescription>
                      Usually orders every {p.usualDay} · {p.quantity}× {p.productName}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className={statusColor[p.status]}>
                    {p.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2 rounded-lg bg-muted p-3 text-sm">
                  <MessageSquareText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <p className="italic">&ldquo;{p.message}&rdquo;</p>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={p.confidence} className="h-2 flex-1" />
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {p.confidence}% confidence
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
