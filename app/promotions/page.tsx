import Link from "next/link";
import type { Metadata } from "next";
import { Angry, BadgePercent, Meh, Smile } from "lucide-react";

import { AiPanel } from "@/components/ai-panel";
import { KpiCard } from "@/components/kpi-card";
import { PageHeader } from "@/components/page-header";
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
import { formatDateTime } from "@/lib/data/core";
import { PROMOTIONS, SENTIMENT_ITEMS, SENTIMENT_SUMMARY } from "@/lib/data/sales";

export const metadata: Metadata = { title: "Promotions & Sentiment" };

const promoStatusStyle: Record<string, string> = {
  Redeemed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  Sent: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
  Scheduled: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
};

const sentimentIcon = {
  Happy: <Smile className="size-4 text-emerald-500" />,
  Neutral: <Meh className="size-4 text-amber-500" />,
  Angry: <Angry className="size-4 text-red-500" />,
};

export default function PromotionsPage() {
  const redeemed = PROMOTIONS.filter((p) => p.status === "Redeemed").length;

  return (
    <>
      <PageHeader
        title="AI Promotions & Sentiment"
        description="Win-back campaigns targeted automatically, plus sentiment across reviews and chats"
      />
      <main className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard label="Active Campaigns" value={String(PROMOTIONS.length)} icon={<BadgePercent className="size-4" />} />
          <KpiCard label="Redeemed" value={String(redeemed)} />
          <KpiCard label="Win-back Rate" value="38%" change={9} changeLabel="vs blast SMS" />
          <KpiCard label="Happy Customers" value={`${SENTIMENT_SUMMARY.happy}%`} change={3} changeLabel="this month" />
        </div>

        <Tabs defaultValue="promotions">
          <TabsList>
            <TabsTrigger value="promotions">Automatic Promotions</TabsTrigger>
            <TabsTrigger value="sentiment">Sentiment Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="promotions" className="mt-4 flex flex-col gap-4">
            <AiPanel title="How targeting works">
              The AI scans for customers with no orders in 30+ days, factors in their lifetime value
              and favorite products, then schedules a personalized offer through n8n (SMS, WhatsApp,
              email, or push). Offers escalate: free delivery first, then 20% off after 40 days.
            </AiPanel>
            <Card>
              <CardContent className="px-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-6">Customer</TableHead>
                      <TableHead>Trigger</TableHead>
                      <TableHead>Offer</TableHead>
                      <TableHead>Channel</TableHead>
                      <TableHead>Sent</TableHead>
                      <TableHead className="pr-6">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {PROMOTIONS.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="pl-6">
                          <Link href={`/customers/${p.customerId}`} className="font-medium hover:underline">
                            {p.customerName}
                          </Link>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{p.trigger}</TableCell>
                        <TableCell className="text-sm">{p.offer}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{p.channel}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {p.sentAt ? formatDateTime(p.sentAt) : "—"}
                        </TableCell>
                        <TableCell className="pr-6">
                          <Badge variant="secondary" className={promoStatusStyle[p.status]}>
                            {p.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sentiment" className="mt-4 grid gap-4 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Overall Mood</CardTitle>
                <CardDescription>Reviews, chats, Facebook comments, and SMS feedback</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {(
                  [
                    ["Happy", SENTIMENT_SUMMARY.happy, "bg-emerald-500"],
                    ["Neutral", SENTIMENT_SUMMARY.neutral, "bg-amber-500"],
                    ["Angry", SENTIMENT_SUMMARY.angry, "bg-red-500"],
                  ] as const
                ).map(([label, value]) => (
                  <div key={label}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="flex items-center gap-2">
                        {sentimentIcon[label]}
                        {label}
                      </span>
                      <span className="tabular-nums">{value}%</span>
                    </div>
                    <Progress value={value} className="h-2" />
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">
                  Angry feedback triggers an immediate task for the owner — the &ldquo;marked
                  delivered but nothing arrived&rdquo; complaint below is linked to fraud case
                  FRD-001.
                </p>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Recent Feedback</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {SENTIMENT_ITEMS.map((item) => (
                  <div key={item.id} className="flex gap-3 rounded-lg border p-3">
                    <div className="mt-0.5">{sentimentIcon[item.sentiment]}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium">{item.customerName}</span>
                        <Badge variant="outline" className="text-[10px]">{item.source}</Badge>
                        <span className="text-xs text-muted-foreground">{formatDateTime(item.time)}</span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{item.text}</p>
                    </div>
                    <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                      {item.score > 0 ? "+" : ""}
                      {item.score.toFixed(2)}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
