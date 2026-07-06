import type { InventoryItem, Supplier } from "@/lib/types";
import { daysAgo, iso } from "./core";

export const SUPPLIERS: Supplier[] = [
  { id: "sup-001", name: "AquaSource Trading", category: "Containers & Caps", priceScore: 88, qualityScore: 82, speedScore: 90, leadTimeDays: 2, lastOrderAt: iso(daysAgo(6)) },
  { id: "sup-002", name: "PureFlow Filtration PH", category: "Filters & Membranes", priceScore: 72, qualityScore: 95, speedScore: 78, leadTimeDays: 5, lastOrderAt: iso(daysAgo(21)) },
  { id: "sup-003", name: "Manila Chem Supply", category: "Chemicals", priceScore: 90, qualityScore: 76, speedScore: 70, leadTimeDays: 7, lastOrderAt: iso(daysAgo(34)) },
  { id: "sup-004", name: "HydroTech Equipment", category: "UV Lamps & Parts", priceScore: 65, qualityScore: 93, speedScore: 85, leadTimeDays: 4, lastOrderAt: iso(daysAgo(50)) },
  { id: "sup-005", name: "EastPack Labels Inc", category: "Labels & Packaging", priceScore: 93, qualityScore: 80, speedScore: 88, leadTimeDays: 3, lastOrderAt: iso(daysAgo(12)) },
];

export function supplierAiScore(s: Supplier): number {
  return Math.round(s.priceScore * 0.35 + s.qualityScore * 0.4 + s.speedScore * 0.25);
}

export const INVENTORY: InventoryItem[] = [
  { id: "inv-001", name: "Filled 5-Gallon Containers", category: "Water Stock", stock: 200, unit: "pcs", dailyUsage: 15, reorderPoint: 80, supplierId: "sup-001", reorderQty: 300 },
  { id: "inv-002", name: "Empty 5-Gallon Containers", category: "Containers", stock: 340, unit: "pcs", dailyUsage: 18, reorderPoint: 120, supplierId: "sup-001", reorderQty: null },
  { id: "inv-003", name: "10L Bottles (Filled)", category: "Water Stock", stock: 96, unit: "pcs", dailyUsage: 9, reorderPoint: 40, supplierId: "sup-001", reorderQty: null },
  { id: "inv-004", name: "1L Bottles (Filled)", category: "Water Stock", stock: 410, unit: "pcs", dailyUsage: 35, reorderPoint: 150, supplierId: "sup-001", reorderQty: null },
  { id: "inv-005", name: "Bottle Caps (55mm)", category: "Packaging", stock: 1150, unit: "pcs", dailyUsage: 60, reorderPoint: 600, supplierId: "sup-001", reorderQty: null },
  { id: "inv-006", name: "Heat-Shrink Seals", category: "Packaging", stock: 480, unit: "pcs", dailyUsage: 58, reorderPoint: 500, supplierId: "sup-005", reorderQty: 2000 },
  { id: "inv-007", name: "Brand Labels", category: "Packaging", stock: 820, unit: "pcs", dailyUsage: 40, reorderPoint: 400, supplierId: "sup-005", reorderQty: null },
  { id: "inv-008", name: "Sediment Filters (5 micron)", category: "Filtration", stock: 6, unit: "pcs", dailyUsage: 0.25, reorderPoint: 8, supplierId: "sup-002", reorderQty: 24 },
  { id: "inv-009", name: "Carbon Block Filters", category: "Filtration", stock: 11, unit: "pcs", dailyUsage: 0.2, reorderPoint: 6, supplierId: "sup-002", reorderQty: null },
  { id: "inv-010", name: "RO Membranes (4040)", category: "Filtration", stock: 3, unit: "pcs", dailyUsage: 0.05, reorderPoint: 2, supplierId: "sup-002", reorderQty: null },
  { id: "inv-011", name: "UV Lamps (55W)", category: "Filtration", stock: 2, unit: "pcs", dailyUsage: 0.06, reorderPoint: 3, supplierId: "sup-004", reorderQty: 6 },
  { id: "inv-012", name: "Citric Acid Cleaner", category: "Chemicals", stock: 25, unit: "kg", dailyUsage: 0.8, reorderPoint: 10, supplierId: "sup-003", reorderQty: null },
  { id: "inv-013", name: "Food-Grade Sanitizer", category: "Chemicals", stock: 14, unit: "L", dailyUsage: 1.1, reorderPoint: 12, supplierId: "sup-003", reorderQty: 40 },
];

export function daysOfStock(item: InventoryItem): number {
  return Math.floor(item.stock / item.dailyUsage);
}

export function stockStatus(item: InventoryItem): "Healthy" | "Reorder Soon" | "Critical" {
  const days = daysOfStock(item);
  if (item.stock <= item.reorderPoint || days <= 7) return "Critical";
  if (days <= 14) return "Reorder Soon";
  return "Healthy";
}

/** Weekly production vs consumption for the inventory chart (containers refilled/day). */
export const PRODUCTION_SERIES = [
  { day: "Mon", produced: 130, sold: 118 },
  { day: "Tue", produced: 125, sold: 122 },
  { day: "Wed", produced: 140, sold: 131 },
  { day: "Thu", produced: 135, sold: 128 },
  { day: "Fri", produced: 150, sold: 149 },
  { day: "Sat", produced: 165, sold: 172 },
  { day: "Sun", produced: 110, sold: 96 },
];
