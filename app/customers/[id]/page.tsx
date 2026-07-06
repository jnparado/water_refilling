import Link from "next/link";
import { notFound } from "next/navigation";
import { Heart, MapPin, Repeat, ShoppingCart, Star } from "lucide-react";

import { AiPanel } from "@/components/ai-panel";
import { CustomerQr } from "@/components/customer-qr";
import { PageHeader } from "@/components/page-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatDateTime, getProduct, peso, productName } from "@/lib/data/core";
import { getCustomer } from "@/lib/data/customers";
import { ordersForCustomer } from "@/lib/data/orders";

export default async function CustomerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = getCustomer(id);
  if (!customer) notFound();

  const orders = ordersForCustomer(customer.id);
  const nextTierPoints =
    customer.tier === "Bronze" ? 400 : customer.tier === "Silver" ? 1000 : customer.tier === "Gold" ? 2000 : null;

  return (
    <>
      <PageHeader
        title={customer.name}
        description={`Customer since ${formatDate(customer.joinedAt)} · ${customer.qrId}`}
        actions={
          <Button asChild size="sm">
            <Link href="/orders/new">
              <ShoppingCart className="size-4" /> New Order
            </Link>
          </Button>
        }
      />
      <main className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Profile card */}
          <Card>
            <CardContent className="flex flex-col items-center gap-4 text-center">
              <Avatar className="size-16">
                <AvatarFallback className="text-lg">
                  {customer.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-lg font-semibold">{customer.name}</p>
                <p className="text-sm text-muted-foreground">{customer.phone}</p>
                <p className="text-sm text-muted-foreground">{customer.email}</p>
              </div>
              <CustomerQr value={`aquaflow:customer:${customer.qrId}`} />
              <p className="font-mono text-xs text-muted-foreground">
                {customer.qrId} — scan at the counter for instant checkout
              </p>
            </CardContent>
          </Card>

          {/* Loyalty + subscription */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="size-4 text-amber-500" /> Loyalty
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-end justify-between">
                <span className="text-3xl font-semibold tabular-nums">
                  {customer.loyaltyPoints.toLocaleString()}
                </span>
                <Badge variant="secondary">{customer.tier}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {nextTierPoints
                  ? `${(nextTierPoints - customer.loyaltyPoints).toLocaleString()} points to the next tier. Points convert to free refills (100 pts = ₱10 off).`
                  : "Top tier reached — enjoys priority delivery and 5% off every refill."}
              </p>
              <Separator />
              <div className="flex items-center gap-2 text-sm font-medium">
                <Repeat className="size-4 text-primary" /> Subscription
              </div>
              {customer.subscription ? (
                <div className="rounded-lg border p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {customer.subscription.plan} · {customer.subscription.quantity}×{" "}
                      {productName(getProduct(customer.subscription.productId))}
                    </span>
                    <Badge variant={customer.subscription.status === "Active" ? "default" : "outline"}>
                      {customer.subscription.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-muted-foreground">
                    Next delivery: {formatDate(customer.subscription.nextDelivery)}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No subscription. Based on order history, a{" "}
                  {customer.usualPattern ? "Weekly" : "Biweekly"} plan would save ~8% per refill.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Addresses + favorites */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="size-4 text-primary" /> Delivery Addresses
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {customer.addresses.map((a) => (
                <div key={a.id} className="rounded-lg border p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{a.label}</span>
                    {a.isDefault && <Badge variant="outline">Default</Badge>}
                  </div>
                  <p className="mt-0.5 text-muted-foreground">
                    {a.line}, Brgy. {a.barangay}, {a.city}
                  </p>
                </div>
              ))}
              <Separator />
              <div className="flex items-center gap-2 text-sm font-medium">
                <Heart className="size-4 text-red-500" /> Favorite Products
              </div>
              <div className="flex flex-wrap gap-2">
                {customer.favoriteProductIds.map((pid) => (
                  <Badge key={pid} variant="secondary">
                    {productName(getProduct(pid))}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {customer.usualPattern && (
          <AiPanel title="AI Behavior Profile">
            {customer.name.split(" ")[0]} usually orders{" "}
            <strong>
              {customer.usualPattern.quantity}× {productName(getProduct(customer.usualPattern.productId))}
            </strong>{" "}
            every <strong>{customer.usualPattern.dayOfWeek}</strong>. The reorder assistant
            automatically sends a reminder the evening before. Churn risk:{" "}
            <strong>{customer.churnRisk}</strong> · Recent sentiment: <strong>{customer.sentiment}</strong>.
          </AiPanel>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Order History</CardTitle>
            <CardDescription>
              {orders.length} orders on record · lifetime value {peso.format(customer.totalSpent)}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Order</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Placed</TableHead>
                  <TableHead className="pr-6 text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                      No orders yet in the recent window.
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="pl-6 font-mono text-xs">{o.id}</TableCell>
                      <TableCell className="max-w-56">
                        <span className="line-clamp-1 text-sm">
                          {o.items.map((it) => `${it.quantity}× ${it.name}`).join(", ")}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {o.fulfillment}
                          {o.express ? " · Express" : ""}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{o.paymentMethod}</TableCell>
                      <TableCell>
                        <Badge variant={o.status === "Cancelled" ? "destructive" : "secondary"}>
                          {o.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDateTime(o.createdAt)}
                      </TableCell>
                      <TableCell className="pr-6 text-right tabular-nums">
                        {peso.format(o.total)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
