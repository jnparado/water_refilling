import Link from "next/link";
import type { Metadata } from "next";
import { Plus, Zap } from "lucide-react";

import { KpiCard } from "@/components/kpi-card";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime, peso } from "@/lib/data/core";
import { ORDERS, TODAY_ORDERS } from "@/lib/data/orders";

export const metadata: Metadata = { title: "Orders" };

const statusVariant: Record<string, string> = {
  Delivered: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  Completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  "Out for Delivery": "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
  Preparing: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  Pending: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  "Ready for Pickup": "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  Cancelled: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
};

export default function OrdersPage() {
  const revenue = TODAY_ORDERS.reduce((s, o) => (o.status !== "Cancelled" ? s + o.total : s), 0);
  const outForDelivery = TODAY_ORDERS.filter((o) => o.status === "Out for Delivery").length;
  const expressCount = TODAY_ORDERS.filter((o) => o.express).length;

  return (
    <>
      <PageHeader
        title="Water Ordering"
        description="Delivery and pickup orders across all water types and container sizes"
        actions={
          <Button asChild size="sm">
            <Link href="/orders/new">
              <Plus className="size-4" /> New Order
            </Link>
          </Button>
        }
      />
      <main className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard label="Orders Today" value={String(TODAY_ORDERS.length)} change={8} changeLabel="vs avg" />
          <KpiCard label="Revenue Today" value={peso.format(revenue)} />
          <KpiCard label="Out for Delivery" value={String(outForDelivery)} />
          <KpiCard label="Express Orders" value={String(expressCount)} />
        </div>

        <Card>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Placed</TableHead>
                  <TableHead className="pr-6 text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ORDERS.slice(0, 40).map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="pl-6 font-mono text-xs">{o.id}</TableCell>
                    <TableCell>
                      <Link href={`/customers/${o.customerId}`} className="text-sm font-medium hover:underline">
                        {o.customerName}
                      </Link>
                    </TableCell>
                    <TableCell className="max-w-52">
                      <span className="line-clamp-1 text-sm">
                        {o.items.map((it) => `${it.quantity}× ${it.name}`).join(", ")}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1">
                        <Badge variant="outline">{o.fulfillment}</Badge>
                        {o.express && (
                          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                            <Zap className="size-3" /> Express
                          </Badge>
                        )}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{o.paymentMethod}</div>
                      <div className={`text-xs ${o.paymentStatus === "Paid" ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}>
                        {o.paymentStatus}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={statusVariant[o.status]}>
                        {o.status}
                        {o.etaMinutes ? ` · ${o.etaMinutes} min` : ""}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDateTime(o.createdAt)}
                    </TableCell>
                    <TableCell className="pr-6 text-right tabular-nums">{peso.format(o.total)}</TableCell>
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
