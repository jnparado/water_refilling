import type { Product } from "@/lib/types";

/**
 * Fixed "now" anchor so server and client render identical mock data.
 * Replace with real clock once wired to Supabase.
 */
export const NOW = new Date("2026-07-06T18:00:00+08:00");

/** Deterministic PRNG (mulberry32) so mock data is stable across renders. */
export function seededRandom(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function daysAgo(n: number): Date {
  return new Date(NOW.getTime() - n * 86_400_000);
}

export function daysFromNow(n: number): Date {
  return new Date(NOW.getTime() + n * 86_400_000);
}

export function iso(d: Date): string {
  return d.toISOString();
}

export const peso = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 0,
});

export const pesoExact = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatDate(isoStr: string): string {
  return new Date(isoStr).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Manila",
  });
}

export function formatDateTime(isoStr: string): string {
  return new Date(isoStr).toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Manila",
  });
}

export const PRODUCTS: Product[] = [
  { id: "pur-5gal", waterType: "Purified", size: "5 Gallon", refillPrice: 30, newContainerPrice: 230 },
  { id: "pur-10l", waterType: "Purified", size: "10L", refillPrice: 20, newContainerPrice: 150 },
  { id: "pur-6l", waterType: "Purified", size: "6L", refillPrice: 15, newContainerPrice: 110 },
  { id: "pur-1l", waterType: "Purified", size: "1L", refillPrice: 10, newContainerPrice: 40 },
  { id: "alk-5gal", waterType: "Alkaline", size: "5 Gallon", refillPrice: 50, newContainerPrice: 250 },
  { id: "alk-10l", waterType: "Alkaline", size: "10L", refillPrice: 35, newContainerPrice: 170 },
  { id: "alk-1l", waterType: "Alkaline", size: "1L", refillPrice: 18, newContainerPrice: 45 },
  { id: "min-5gal", waterType: "Mineral", size: "5 Gallon", refillPrice: 40, newContainerPrice: 240 },
  { id: "min-6l", waterType: "Mineral", size: "6L", refillPrice: 22, newContainerPrice: 115 },
  { id: "dis-5gal", waterType: "Distilled", size: "5 Gallon", refillPrice: 45, newContainerPrice: 245 },
  { id: "dis-1l", waterType: "Distilled", size: "1L", refillPrice: 20, newContainerPrice: 45 },
];

export function productName(p: Product): string {
  return `${p.waterType} ${p.size}`;
}

export function getProduct(id: string): Product {
  const found = PRODUCTS.find((p) => p.id === id);
  if (!found) throw new Error(`Unknown product ${id}`);
  return found;
}
