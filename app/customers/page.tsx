import Link from "next/link";
import type { Metadata } from "next";
import { QrCode, UserPlus } from "lucide-react";

import { KpiCard } from "@/components/kpi-card";
import { PageHeader } from "@/components/page-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { formatDate, peso } from "@/lib/data/core";
import { CUSTOMERS } from "@/lib/data/customers";

export const metadata: Metadata = { title: "Customers" };

const tierColor: Record<string, string> = {
  Platinum: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  Gold: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  Silver: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  Bronze: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
};

const riskColor: Record<string, string> = {
  Low: "text-emerald-600 dark:text-emerald-400",
  Medium: "text-amber-600 dark:text-amber-400",
  High: "text-red-600 dark:text-red-400",
};

export default function CustomersPage() {
  const withSubs = CUSTOMERS.filter((c) => c.subscription?.status === "Active").length;
  const atRisk = CUSTOMERS.filter((c) => c.churnRisk === "High").length;

  return (
    <>
      <PageHeader
        title="Customer Management"
        description="Profiles, loyalty points, subscriptions, and QR customer IDs"
        actions={
          <Button size="sm">
            <UserPlus className="size-4" /> Register Customer
          </Button>
        }
      />
      <main className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard label="Total Customers" value={String(CUSTOMERS.length)} change={9} changeLabel="this month" />
          <KpiCard label="Active Subscriptions" value={String(withSubs)} />
          <KpiCard
            label="Avg Loyalty Points"
            value={String(Math.round(CUSTOMERS.reduce((s, c) => s + c.loyaltyPoints, 0) / CUSTOMERS.length))}
          />
          <KpiCard label="At Churn Risk" value={String(atRisk)} invertColor change={2} changeLabel="vs last month" />
        </div>

        <Card>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Customer</TableHead>
                  <TableHead>QR ID</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead className="text-right">Points</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                  <TableHead className="text-right">Total Spent</TableHead>
                  <TableHead>Last Order</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead className="pr-6">Churn Risk</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {CUSTOMERS.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="pl-6">
                      <Link href={`/customers/${c.id}`} className="flex items-center gap-3 hover:underline">
                        <Avatar className="size-8">
                          <AvatarFallback className="text-xs">
                            {c.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium leading-tight">{c.name}</p>
                          <p className="text-xs text-muted-foreground">{c.phone}</p>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1.5 font-mono text-xs">
                        <QrCode className="size-3.5 text-muted-foreground" />
                        {c.qrId}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={tierColor[c.tier]}>{c.tier}</Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{c.loyaltyPoints.toLocaleString()}</TableCell>
                    <TableCell className="text-right tabular-nums">{c.totalOrders}</TableCell>
                    <TableCell className="text-right tabular-nums">{peso.format(c.totalSpent)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(c.lastOrderAt)}</TableCell>
                    <TableCell>
                      {c.subscription ? (
                        <Badge variant={c.subscription.status === "Active" ? "default" : "outline"}>
                          {c.subscription.plan}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className={`pr-6 text-sm font-medium ${riskColor[c.churnRisk]}`}>
                      {c.churnRisk}
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
