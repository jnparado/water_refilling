import type { EnergyDevice, FraudCase, Machine, SensorReading, SystemAlert } from "@/lib/types";
import { daysAgo, iso, seededRandom } from "./core";

export const MACHINES: Machine[] = [
  {
    id: "mac-001", name: "RO Unit A", type: "Reverse Osmosis", healthScore: 91, status: "Healthy",
    runtimeHours: 6120, lastServiceAt: iso(daysAgo(24)),
    prediction: "Membrane performing within spec. Next service in ~38 days.", predictedFailureInDays: null,
  },
  {
    id: "mac-002", name: "UV Sterilizer 1", type: "UV Sterilizer", healthScore: 64, status: "Attention",
    runtimeHours: 8340, lastServiceAt: iso(daysAgo(96)),
    prediction: "Lamp intensity down 22% over 3 weeks. Replace lamp within 12 days to keep disinfection dose above target.", predictedFailureInDays: 12,
  },
  {
    id: "mac-003", name: "Booster Pump 1", type: "Pump", healthScore: 78, status: "Attention",
    runtimeHours: 5210, lastServiceAt: iso(daysAgo(60)),
    prediction: "Vibration signature rising slightly; bearing wear likely. Schedule inspection within 30 days.", predictedFailureInDays: 30,
  },
  {
    id: "mac-004", name: "Booster Pump 2", type: "Pump", healthScore: 95, status: "Healthy",
    runtimeHours: 1830, lastServiceAt: iso(daysAgo(15)),
    prediction: "Operating normally.", predictedFailureInDays: null,
  },
  {
    id: "mac-005", name: "Pre-Filter Bank", type: "Filter Bank", healthScore: 43, status: "Critical",
    runtimeHours: 2980, lastServiceAt: iso(daysAgo(41)),
    prediction: "Pressure drop across sediment filter is 2.3× baseline. Replace 5-micron cartridges within 5 days to avoid flow loss.", predictedFailureInDays: 5,
  },
];

function buildSensorSeries(): SensorReading[] {
  const rand = seededRandom(99);
  const readings: SensorReading[] = [];
  for (let i = 0; i < 24; i++) {
    const hour = String(i).padStart(2, "0");
    // TDS spike late in the day to demo anomaly detection
    const spike = i >= 20 ? 24 + rand() * 6 : 0;
    readings.push({
      time: `${hour}:00`,
      tds: Math.round((7 + rand() * 2.5 + spike) * 10) / 10,
      ph: Math.round((7.1 + (rand() - 0.5) * 0.5) * 100) / 100,
      temperature: Math.round((24 + rand() * 3.5) * 10) / 10,
      turbidity: Math.round((0.2 + rand() * 0.25 + (i >= 20 ? 0.3 : 0)) * 100) / 100,
      pressure: Math.round((58 + (rand() - 0.5) * 8) * 10) / 10,
      flowRate: Math.round((11.5 + (rand() - 0.5) * 2.2 - (i >= 21 ? 1.8 : 0)) * 10) / 10,
    });
  }
  return readings;
}

export const SENSOR_SERIES: SensorReading[] = buildSensorSeries();

export const SENSOR_LIMITS = {
  tds: { min: 0, max: 15, unit: "ppm", label: "TDS" },
  ph: { min: 6.5, max: 7.8, unit: "", label: "pH" },
  temperature: { min: 20, max: 30, unit: "°C", label: "Temperature" },
  turbidity: { min: 0, max: 1, unit: "NTU", label: "Turbidity" },
  pressure: { min: 45, max: 70, unit: "psi", label: "Pressure" },
  flowRate: { min: 9, max: 14, unit: "L/min", label: "Flow Rate" },
} as const;

export const ALERTS: SystemAlert[] = [
  {
    id: "alr-001", kind: "Quality", severity: "Critical",
    title: "TDS outside acceptable range",
    detail: "Product water TDS jumped from 8 ppm to 35 ppm at 8:12 PM. Possible RO membrane breach or bypass valve leak. Dispensing paused on Line 2.",
    time: iso(new Date(daysAgo(0).getTime() - 2 * 3600_000)), acknowledged: false,
  },
  {
    id: "alr-002", kind: "Leak", severity: "Warning",
    title: "Unusual overnight water flow",
    detail: "Flow sensor recorded 240 L between 1–4 AM with no production scheduled. Pattern matches a slow leak near the storage tank manifold.",
    time: iso(new Date(daysAgo(0).getTime() - 14 * 3600_000)), acknowledged: false,
  },
  {
    id: "alr-003", kind: "Maintenance", severity: "Warning",
    title: "Pre-Filter Bank pressure drop",
    detail: "Differential pressure across sediment filters is 2.3× baseline. AI recommends cartridge replacement within 5 days.",
    time: iso(new Date(daysAgo(1).getTime() - 4 * 3600_000)), acknowledged: true,
  },
  {
    id: "alr-004", kind: "Inventory", severity: "Warning",
    title: "Heat-shrink seals below reorder point",
    detail: "480 pcs remaining (~8 days of stock). Recommended reorder: 2,000 pcs from EastPack Labels Inc.",
    time: iso(daysAgo(1)), acknowledged: true,
  },
  {
    id: "alr-005", kind: "Fraud", severity: "Critical",
    title: "Possible duplicate delivery entries",
    detail: "Two deliveries logged for ORD-4198 within 6 minutes by the same driver account. Flagged for review.",
    time: iso(daysAgo(2)), acknowledged: false,
  },
];

export const FRAUD_CASES: FraudCase[] = [
  {
    id: "frd-001", type: "Duplicate Delivery",
    description: "ORD-4198 marked delivered twice within 6 minutes; second entry created 12 containers of unaccounted stock movement.",
    amountAtRisk: 360, confidence: 92, involved: "Driver account: jun.delapena", detectedAt: iso(daysAgo(2)), status: "Investigating",
  },
  {
    id: "frd-002", type: "Fake Refund",
    description: "Refund issued for ORD-4102 but the original payment was Cash on Delivery with no collection record.",
    amountAtRisk: 150, confidence: 87, involved: "Cashier terminal 2", detectedAt: iso(daysAgo(5)), status: "Open",
  },
  {
    id: "frd-003", type: "Inventory Mismatch",
    description: "Production logged 130 refills on Jun 28 but filled-container count increased by only 114. 16 containers unaccounted.",
    amountAtRisk: 480, confidence: 78, involved: "Production shift B", detectedAt: iso(daysAgo(8)), status: "Investigating",
  },
  {
    id: "frd-004", type: "Suspicious Discount",
    description: "23 manual discounts applied by one cashier in a week — 4× the store average. 19 lacked a promo code.",
    amountAtRisk: 690, confidence: 71, involved: "Cashier: nina.fajardo", detectedAt: iso(daysAgo(11)), status: "Resolved",
  },
];

export const ENERGY_DEVICES: EnergyDevice[] = [
  { id: "en-001", name: "RO High-Pressure Pump", todayKwh: 18.4, runtimeHours: 9.2, costToday: 232, trend: "up", aiNote: "Consumption up 14% vs 30-day average at the same output — consistent with the pre-filter clog. Replacing cartridges should save ~₱480/month." },
  { id: "en-002", name: "UV Sterilizer 1", todayKwh: 1.3, runtimeHours: 16, costToday: 16, trend: "flat", aiNote: null },
  { id: "en-003", name: "Booster Pumps", todayKwh: 6.7, runtimeHours: 11.5, costToday: 84, trend: "flat", aiNote: null },
  { id: "en-004", name: "Air Conditioning (Store)", todayKwh: 12.1, runtimeHours: 10, costToday: 152, trend: "up", aiNote: "Runs 1.5 h after closing on weekdays. A timer switch would save ~₱620/month." },
  { id: "en-005", name: "Lighting & Signage", todayKwh: 4.2, runtimeHours: 13, costToday: 53, trend: "down", aiNote: null },
];

export const ENERGY_SERIES = [
  { day: "Mon", kwh: 39.2 }, { day: "Tue", kwh: 41.0 }, { day: "Wed", kwh: 40.1 },
  { day: "Thu", kwh: 42.6 }, { day: "Fri", kwh: 44.8 }, { day: "Sat", kwh: 47.9 }, { day: "Sun", kwh: 33.4 },
];
