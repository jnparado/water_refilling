import Link from "next/link";
import type { Metadata } from "next";
import { CalendarClock, Plus } from "lucide-react";

import { AiPanel } from "@/components/ai-panel";
import { KpiCard } from "@/components/kpi-card";
import { PageHeader } from "@/components/page-header";
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
import { formatDate, getProduct, peso, productName } from "@/lib/data/core";
import { CUSTOMERS } from "@/lib/data/customers";

export const metadata: Metadata = { title: "Subscriptions" };

export default function SubscriptionsPage() {
  const subs = CUSTOMERS.filter((c) => c.subscription).map((c) => ({
    customer: c,
    sub: c.subscription!,
  }));
  const active = subs.filter((s) => s.sub.status === "Active");
  const monthlyValue = active.reduce((sum, { sub }) => {
    const perDelivery = getProduct(sub.productId).refillPrice * sub.quantity;
    const perMonth = sub.plan === "Weekly" ? 4 : sub.plan === "Biweekly" ? 2 : 1;
    return sum + perDelivery * perMonth;
  }, 0);

  const upcoming = [...active].sort((a, b) => a.sub.nextDelivery.localeCompare(b.sub.nextDelivery));

  return (
    <>
      <PageHeader
        title="AI Subscription Management"
        description="Weekly, biweekly, and monthly plans with automatic delivery scheduling"
        actions={
          <Button size="sm">
            <Plus className="size-4" /> New Subscription
          </Button>
        }
      />
      <main className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard label="Active Plans" value={String(active.length)} change={12} changeLabel="this quarter" />
          <KpiCard label="Paused" value={String(subs.length - active.length)} />
          <KpiCard label="Recurring Monthly Value" value={peso.format(monthlyValue)} />
          <KpiCard label="Retention (Subscribers)" value="96%" change={2} changeLabel="vs non-subscribers 71%" />
        </div>

        <AiPanel title="AI Scheduling">
          Deliveries for the next 7 days are auto-assigned to routes. Two subscribers
          ({upcoming[0]?.customer.name} and {upcoming[1]?.customer.name}) live along Truck 2&apos;s
          Tuesday route — the AI grouped them into one trip, saving an estimated 3.4 km. Subscribers
          who skip 2 consecutive deliveries are flagged for a win-back promotion automatically.
        </AiPanel>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="size-4" /> All Subscriptions
            </CardTitle>
            <CardDescription>Next deliveries are scheduled automatically by plan cadence</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Customer</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Per Delivery</TableHead>
                  <TableHead>Next Delivery</TableHead>
                  <TableHead className="pr-6">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcoming.concat(subs.filter((s) => s.sub.status === "Paused")).map(({ customer, sub }) => (
                  <TableRow key={customer.id}>
                    <TableCell className="pl-6">
                      <Link href={`/customers/${customer.id}`} className="font-medium hover:underline">
                        {customer.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{sub.plan}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{productName(getProduct(sub.productId))}</TableCell>
                    <TableCell className="text-right tabular-nums">{sub.quantity}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {peso.format(getProduct(sub.productId).refillPrice * sub.quantity)}
                    </TableCell>
                    <TableCell className="text-sm">{formatDate(sub.nextDelivery)}</TableCell>
                    <TableCell className="pr-6">
                      <Badge variant={sub.status === "Active" ? "default" : "secondary"}>{sub.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
