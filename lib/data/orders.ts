import type { Order, OrderStatus, PaymentMethod } from "@/lib/types";
import { PRODUCTS, daysAgo, getProduct, iso, productName, seededRandom } from "./core";
import { CUSTOMERS } from "./customers";

const paymentMethods: PaymentMethod[] = ["GCash", "Maya", "Cash on Delivery", "Card (Stripe)", "GCash", "Cash on Delivery", "PayPal"];

function buildOrders(): Order[] {
  const rand = seededRandom(7);
  const orders: Order[] = [];
  let seq = 4180;

  // 60 historical + today's orders spread across customers
  for (let i = 0; i < 72; i++) {
    const customer = CUSTOMERS[Math.floor(rand() * CUSTOMERS.length)];
    const daysBack = i < 14 ? 0 : Math.floor(rand() * 28) + 1;
    const itemCount = 1 + Math.floor(rand() * 2);
    const items = Array.from({ length: itemCount }, () => {
      const p = PRODUCTS[Math.floor(rand() * PRODUCTS.length)];
      const quantity = 1 + Math.floor(rand() * 4);
      return { productId: p.id, name: productName(p), quantity, unitPrice: p.refillPrice };
    });
    const total = items.reduce((s, it) => s + it.quantity * it.unitPrice, 0);
    const fulfillment = rand() > 0.25 ? "Delivery" : "Pickup";
    const express = fulfillment === "Delivery" && rand() > 0.85;

    let status: OrderStatus;
    if (daysBack > 0) {
      status = rand() > 0.04 ? (fulfillment === "Delivery" ? "Delivered" : "Completed") : "Cancelled";
    } else {
      const roll = rand();
      if (fulfillment === "Pickup") {
        status = roll > 0.6 ? "Completed" : roll > 0.3 ? "Ready for Pickup" : "Preparing";
      } else {
        status = roll > 0.72 ? "Delivered" : roll > 0.45 ? "Out for Delivery" : roll > 0.2 ? "Preparing" : "Pending";
      }
    }

    const createdAt = new Date(daysAgo(daysBack).getTime() - Math.floor(rand() * 9 * 3600_000));
    const method = paymentMethods[Math.floor(rand() * paymentMethods.length)];

    orders.push({
      id: `ORD-${seq++}`,
      customerId: customer.id,
      customerName: customer.name,
      items,
      total,
      status,
      fulfillment,
      express,
      paymentMethod: method,
      paymentStatus: status === "Cancelled" ? "Refunded" : method === "Cash on Delivery" && status !== "Delivered" && status !== "Completed" ? "Unpaid" : "Paid",
      createdAt: iso(createdAt),
      scheduledFor: iso(new Date(createdAt.getTime() + (express ? 1 : 3 + Math.floor(rand() * 20)) * 3600_000)),
      addressLabel: fulfillment === "Delivery" ? customer.addresses[0].label : undefined,
      driverId: status === "Out for Delivery" || status === "Delivered" ? `emp-00${1 + Math.floor(rand() * 3)}` : undefined,
      etaMinutes: status === "Out for Delivery" ? 8 + Math.floor(rand() * 40) : undefined,
    });
  }

  return orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export const ORDERS: Order[] = buildOrders();

export const TODAY_ORDERS = ORDERS.filter(
  (o) => new Date(o.createdAt).toDateString() === daysAgo(0).toDateString()
);

export function ordersForCustomer(customerId: string): Order[] {
  return ORDERS.filter((o) => o.customerId === customerId);
}

/** AI reorder predictions: customers with a learned pattern whose usual day is near. */
export interface ReorderPrediction {
  customerId: string;
  customerName: string;
  productId: string;
  productName: string;
  quantity: number;
  usualDay: string;
  confidence: number;
  message: string;
  status: "Suggested" | "Message Sent" | "Confirmed" | "Declined";
}

function buildPredictions(): ReorderPrediction[] {
  const rand = seededRandom(21);
  const statuses: ReorderPrediction["status"][] = ["Suggested", "Message Sent", "Confirmed", "Message Sent", "Suggested", "Declined"];
  return CUSTOMERS.filter((c) => c.usualPattern)
    .slice(0, 10)
    .map((c, i) => {
      const p = getProduct(c.usualPattern!.productId);
      const firstName = c.name.split(" ")[0];
      return {
        customerId: c.id,
        customerName: c.name,
        productId: p.id,
        productName: productName(p),
        quantity: c.usualPattern!.quantity,
        usualDay: c.usualPattern!.dayOfWeek,
        confidence: 72 + Math.floor(rand() * 26),
        message: `Hi ${firstName}, you're likely running low on water. Would you like to reorder your usual ${c.usualPattern!.quantity} containers of ${productName(p)}?`,
        status: statuses[i % statuses.length],
      };
    });
}

export const REORDER_PREDICTIONS: ReorderPrediction[] = buildPredictions();
