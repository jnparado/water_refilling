"use client";

import { useMemo, useState } from "react";
import { History, Minus, Plus, ShoppingCart, Store, Truck, Zap } from "lucide-react";
import { toast } from "sonner";

import { AiPanel } from "@/components/ai-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { PRODUCTS, getProduct, peso, productName } from "@/lib/data/core";
import { CUSTOMERS } from "@/lib/data/customers";
import { ordersForCustomer } from "@/lib/data/orders";
import type { PaymentMethod, WaterType } from "@/lib/types";
import { cn } from "@/lib/utils";

const waterTypes: WaterType[] = ["Purified", "Alkaline", "Mineral", "Distilled"];
const payments: PaymentMethod[] = ["GCash", "Maya", "Card (Stripe)", "PayPal", "Cash on Delivery"];

export function NewOrderForm() {
  const [customerId, setCustomerId] = useState(CUSTOMERS[0].id);
  const [waterType, setWaterType] = useState<WaterType>("Purified");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [fulfillment, setFulfillment] = useState<"Delivery" | "Pickup">("Delivery");
  const [express, setExpress] = useState(false);
  const [payment, setPayment] = useState<PaymentMethod>("GCash");
  const [schedule, setSchedule] = useState("");

  const customer = CUSTOMERS.find((c) => c.id === customerId)!;
  const lastOrder = useMemo(() => ordersForCustomer(customerId)[0], [customerId]);

  const products = PRODUCTS.filter((p) => p.waterType === waterType);
  const cartItems = Object.entries(cart).filter(([, qty]) => qty > 0);
  const subtotal = cartItems.reduce((s, [pid, qty]) => s + getProduct(pid).refillPrice * qty, 0);
  const deliveryFee = fulfillment === "Pickup" ? 0 : express ? 50 : subtotal >= 150 ? 0 : 20;
  const total = subtotal + deliveryFee;

  function setQty(pid: string, qty: number) {
    setCart((c) => ({ ...c, [pid]: Math.max(0, qty) }));
  }

  function repeatLastOrder() {
    if (!lastOrder) {
      toast.info("No previous order found for this customer.");
      return;
    }
    const next: Record<string, number> = {};
    for (const item of lastOrder.items) next[item.productId] = item.quantity;
    setCart(next);
    toast.success(`Loaded ${lastOrder.id}: ${lastOrder.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}`);
  }

  function placeOrder() {
    if (cartItems.length === 0) {
      toast.error("Add at least one item to the order.");
      return;
    }
    toast.success(
      `Order placed for ${customer.name} — ${peso.format(total)} via ${payment}. ${
        fulfillment === "Delivery"
          ? express
            ? "Express delivery dispatched (ETA ~45 min)."
            : "Scheduled for delivery."
          : "Ready for pickup shortly."
      }`
    );
    setCart({});
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3 md:gap-6">
      <div className="flex flex-col gap-4 lg:col-span-2 md:gap-6">
        {/* Customer */}
        <Card>
          <CardHeader>
            <CardTitle>Customer</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-end gap-3">
            <div className="min-w-56 flex-1 space-y-2">
              <Label>Registered customer</Label>
              <Select value={customerId} onValueChange={setCustomerId}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CUSTOMERS.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} · {c.qrId}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={repeatLastOrder}>
              <History className="size-4" /> Repeat previous order
            </Button>
          </CardContent>
        </Card>

        {customer.usualPattern && (
          <AiPanel title="AI Suggestion">
            {customer.name.split(" ")[0]} usually orders{" "}
            <strong>
              {customer.usualPattern.quantity}× {productName(getProduct(customer.usualPattern.productId))}
            </strong>{" "}
            every {customer.usualPattern.dayOfWeek}.{" "}
            <button
              className="font-medium text-primary underline underline-offset-2"
              onClick={() => setQty(customer.usualPattern!.productId, customer.usualPattern!.quantity)}
            >
              Add the usual
            </button>
          </AiPanel>
        )}

        {/* Products */}
        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
            <CardDescription>Choose water type, then container sizes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {waterTypes.map((wt) => (
                <Button
                  key={wt}
                  variant={waterType === wt ? "default" : "outline"}
                  size="sm"
                  onClick={() => setWaterType(wt)}
                >
                  {wt}
                </Button>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {products.map((p) => {
                const qty = cart[p.id] ?? 0;
                return (
                  <div
                    key={p.id}
                    className={cn(
                      "flex items-center justify-between rounded-xl border p-3",
                      qty > 0 && "border-primary bg-primary/5"
                    )}
                  >
                    <div>
                      <p className="text-sm font-medium">{p.size}</p>
                      <p className="text-xs text-muted-foreground">
                        Refill {peso.format(p.refillPrice)} · New {peso.format(p.newContainerPrice)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" className="size-7" onClick={() => setQty(p.id, qty - 1)}>
                        <Minus className="size-3.5" />
                      </Button>
                      <span className="w-6 text-center text-sm tabular-nums">{qty}</span>
                      <Button variant="outline" size="icon" className="size-7" onClick={() => setQty(p.id, qty + 1)}>
                        <Plus className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Need a custom container size? Add a note at checkout and the station will quote by the liter.
            </p>
          </CardContent>
        </Card>

        {/* Fulfillment */}
        <Card>
          <CardHeader>
            <CardTitle>Fulfillment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-4 text-left",
                  fulfillment === "Delivery" && "border-primary bg-primary/5"
                )}
                onClick={() => setFulfillment("Delivery")}
              >
                <Truck className="size-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Delivery</p>
                  <p className="text-xs text-muted-foreground">
                    To {customer.addresses[0].label}: {customer.addresses[0].line}
                  </p>
                </div>
              </button>
              <button
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-4 text-left",
                  fulfillment === "Pickup" && "border-primary bg-primary/5"
                )}
                onClick={() => setFulfillment("Pickup")}
              >
                <Store className="size-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Pick-up</p>
                  <p className="text-xs text-muted-foreground">Collect at the station, no fee</p>
                </div>
              </button>
            </div>

            {fulfillment === "Delivery" && (
              <>
                <div className="flex items-center justify-between rounded-xl border p-4">
                  <div className="flex items-center gap-3">
                    <Zap className="size-5 text-amber-500" />
                    <div>
                      <p className="text-sm font-medium">Express delivery</p>
                      <p className="text-xs text-muted-foreground">
                        Jump the queue — ETA ~45 minutes (+₱50)
                      </p>
                    </div>
                  </div>
                  <Switch checked={express} onCheckedChange={setExpress} />
                </div>
                {!express && (
                  <div className="space-y-2">
                    <Label htmlFor="schedule">Schedule delivery</Label>
                    <Input
                      id="schedule"
                      type="datetime-local"
                      value={schedule}
                      onChange={(e) => setSchedule(e.target.value)}
                      className="max-w-64"
                    />
                    <p className="text-xs text-muted-foreground">
                      Leave blank for the next available delivery round.
                    </p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      <div className="flex flex-col gap-4 md:gap-6">
        <Card className="lg:sticky lg:top-20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="size-4" /> Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cartItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">Cart is empty.</p>
            ) : (
              <div className="space-y-2">
                {cartItems.map(([pid, qty]) => {
                  const p = getProduct(pid);
                  return (
                    <div key={pid} className="flex items-center justify-between text-sm">
                      <span>
                        {qty}× {productName(p)}
                      </span>
                      <span className="tabular-nums">{peso.format(p.refillPrice * qty)}</span>
                    </div>
                  );
                })}
              </div>
            )}
            <Separator />
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="tabular-nums">{peso.format(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Delivery fee {fulfillment === "Delivery" && !express && subtotal >= 150 ? "(waived ≥ ₱150)" : ""}
                </span>
                <span className="tabular-nums">{peso.format(deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold">
                <span>Total</span>
                <span className="tabular-nums">{peso.format(total)}</span>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Payment method</Label>
              <Select value={payment} onValueChange={(v) => setPayment(v as PaymentMethod)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {payments.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {payment !== "Cash on Delivery" && (
                <Badge variant="secondary">Online payment — link sent after checkout</Badge>
              )}
            </div>
            <Button className="w-full" size="lg" onClick={placeOrder}>
              Place Order · {peso.format(total)}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Earns {Math.floor(total / 10)} loyalty points for {customer.name.split(" ")[0]}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
