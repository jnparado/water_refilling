import type {
  DailySales,
  DemandForecastRow,
  Insight,
  InvoiceRecord,
  MonthFinance,
  PriceSuggestion,
  Promotion,
  SentimentItem,
} from "@/lib/types";
import { daysAgo, iso, seededRandom } from "./core";
import { CUSTOMERS } from "./customers";

function buildDailySales(): DailySales[] {
  const rand = seededRandom(13);
  const out: DailySales[] = [];
  for (let i = 89; i >= 0; i--) {
    const d = daysAgo(i);
    const dow = d.getDay();
    const weekend = dow === 6 ? 1.25 : dow === 0 ? 0.8 : 1;
    // gentle summer ramp toward "now"
    const seasonal = 1 + (89 - i) * 0.0028;
    const base = 5200 * weekend * seasonal * (0.9 + rand() * 0.2);
    const revenue = Math.round(base);
    out.push({
      date: d.toISOString().slice(0, 10),
      revenue,
      orders: Math.round(revenue / (105 + rand() * 30)),
      gallonsSold: Math.round(revenue / 33),
    });
  }
  return out;
}

export const DAILY_SALES: DailySales[] = buildDailySales();

export const salesToday = DAILY_SALES[DAILY_SALES.length - 1];
export const salesWeek = DAILY_SALES.slice(-7).reduce(
  (acc, d) => ({ revenue: acc.revenue + d.revenue, orders: acc.orders + d.orders }),
  { revenue: 0, orders: 0 }
);
export const salesMonth = DAILY_SALES.slice(-30).reduce(
  (acc, d) => ({ revenue: acc.revenue + d.revenue, orders: acc.orders + d.orders }),
  { revenue: 0, orders: 0 }
);
export const salesPrevMonth = DAILY_SALES.slice(-60, -30).reduce(
  (acc, d) => ({ revenue: acc.revenue + d.revenue, orders: acc.orders + d.orders }),
  { revenue: 0, orders: 0 }
);

export const PRODUCT_MIX = [
  { name: "Purified", value: 62, revenue: Math.round(salesMonth.revenue * 0.62) },
  { name: "Alkaline", value: 21, revenue: Math.round(salesMonth.revenue * 0.21) },
  { name: "Mineral", value: 11, revenue: Math.round(salesMonth.revenue * 0.11) },
  { name: "Distilled", value: 6, revenue: Math.round(salesMonth.revenue * 0.06) },
];

export const TOP_CUSTOMERS = [...CUSTOMERS]
  .sort((a, b) => b.totalSpent - a.totalSpent)
  .slice(0, 5);

export const DEMAND_FORECAST: DemandForecastRow[] = [
  { waterType: "Purified", expectedOrders: 520, lastMonthOrders: 462, drivers: ["Hot weather (+31–33°C forecast)", "School break ends — offices restocking"] },
  { waterType: "Alkaline", expectedOrders: 180, lastMonthOrders: 141, drivers: ["Warm weather", "Fitness trend in nearby gyms"] },
  { waterType: "Mineral", expectedOrders: 95, lastMonthOrders: 88, drivers: ["Stable household demand"] },
  { waterType: "Distilled", expectedOrders: 44, lastMonthOrders: 47, drivers: ["Slight dip — clinic client on holiday closure Jul 15–20"] },
];

export const FORECAST_FACTORS = [
  { factor: "Weather", detail: "PAGASA forecasts 31–33°C with heat index up to 39°C for the first two weeks of July.", impact: "+12% overall demand" },
  { factor: "Holidays", detail: "No major holidays in July; Eid'l Adha long weekend already passed.", impact: "Neutral" },
  { factor: "Season", detail: "Peak summer carry-over; rainy season onset expected late July may soften week 4.", impact: "+8% weeks 1–3, −5% week 4" },
  { factor: "Past sales", detail: "Same period last year grew 9% month-over-month; current trajectory matches.", impact: "+9% baseline" },
  { factor: "Events", detail: "Barangay fiesta in San Isidro on Jul 18–19 — bulk orders from 4 catering clients expected.", impact: "+60 containers (Jul 17–19)" },
];

export const INSIGHTS: Insight[] = [
  {
    id: "ins-001",
    headline: "Alkaline water sales increased 28%",
    explanation: "Your alkaline water sales increased by 28% because of warmer weather and repeat orders from two new gym accounts in Marikina Heights. Consider a gym-partner bundle to lock in volume.",
    direction: "up", changePct: 28, category: "Product",
  },
  {
    id: "ins-002",
    headline: "Saturday is now your biggest day",
    explanation: "Saturday revenue is 25% above the weekday average for 6 straight weeks. Adding a second delivery round on Saturdays could capture an estimated ₱9,000/month in currently-declined express orders.",
    direction: "up", changePct: 25, category: "Operations",
  },
  {
    id: "ins-003",
    headline: "Pickup orders dropped 11%",
    explanation: "Walk-in refills fell 11% this month, matching the road repair on Rizal Ave. Expect recovery when work finishes (city schedule: Jul 22). No action needed.",
    direction: "down", changePct: 11, category: "Channel",
  },
  {
    id: "ins-004",
    headline: "Container deposit revenue up 40%",
    explanation: "New-customer signups drove 40% more container purchases. Stock of empty 5-gallon containers covers ~19 days at this pace — the reorder suggestion has been added to Inventory.",
    direction: "up", changePct: 40, category: "Inventory",
  },
];

export const FINANCE_SERIES: MonthFinance[] = [
  { month: "Feb 2026", income: 138400, expenses: 96200, isForecast: false },
  { month: "Mar 2026", income: 145100, expenses: 98900, isForecast: false },
  { month: "Apr 2026", income: 156800, expenses: 101300, isForecast: false },
  { month: "May 2026", income: 163200, expenses: 104800, isForecast: false },
  { month: "Jun 2026", income: 171900, expenses: 107200, isForecast: false },
  { month: "Jul 2026", income: 184000, expenses: 111500, isForecast: true },
  { month: "Aug 2026", income: 179500, expenses: 110800, isForecast: true },
  { month: "Sep 2026", income: 174200, expenses: 109900, isForecast: true },
];

export const CASHFLOW_NOTES = [
  "Projected July net profit: ₱72,500 (+12% vs June), driven by summer demand and the fiesta bulk orders.",
  "Expenses rise ₱4,300 in July: filter replacements (₱6,800 one-time) partly offset by lower energy costs after pre-filter service.",
  "Cash position stays positive all quarter; lowest point is ₱41,000 in week 2 of August after the container reorder payment.",
  "Expected growth: +9–12% month-over-month through August, tapering with the rainy season in September.",
];

export const PRICE_SUGGESTIONS: PriceSuggestion[] = [
  { productId: "alk-5gal", productName: "Alkaline 5 Gallon", currentPrice: 50, suggestedPrice: 55, reason: "Demand up 28%, competitor (AquaBest branch) charges ₱60. Elasticity model predicts <2% volume loss.", demandLevel: "High" },
  { productId: "pur-5gal", productName: "Purified 5 Gallon", currentPrice: 30, suggestedPrice: 30, reason: "Price-sensitive anchor product. Hold at ₱30 to stay the cheapest within 1.5 km.", demandLevel: "High" },
  { productId: "dis-5gal", productName: "Distilled 5 Gallon", currentPrice: 45, suggestedPrice: 42, reason: "Demand dipping while clinic client is closed. A ₱3 promo price should keep the machines utilized.", demandLevel: "Low" },
  { productId: "min-5gal", productName: "Mineral 5 Gallon", currentPrice: 40, suggestedPrice: 40, reason: "Stable demand and margin. No change.", demandLevel: "Normal" },
];

function buildPromotions(): Promotion[] {
  const lapsed = CUSTOMERS.filter((c) => c.churnRisk !== "Low");
  const channels: Promotion["channel"][] = ["SMS", "WhatsApp", "Email", "Push"];
  const statuses: Promotion["status"][] = ["Sent", "Scheduled", "Redeemed", "Sent"];
  return lapsed.slice(0, 8).map((c, i) => {
    const days = Math.round((daysAgo(0).getTime() - new Date(c.lastOrderAt).getTime()) / 86_400_000);
    return {
      id: `promo-${String(i + 1).padStart(3, "0")}`,
      customerId: c.id,
      customerName: c.name,
      trigger: `No orders in ${days} days`,
      offer: days > 40 ? "Get 20% off your next refill" : "Free delivery on your next order",
      channel: channels[i % channels.length],
      status: statuses[i % statuses.length],
      sentAt: statuses[i % statuses.length] === "Scheduled" ? null : iso(daysAgo(i % 3)),
    };
  });
}

export const PROMOTIONS: Promotion[] = buildPromotions();

export const INVOICES: InvoiceRecord[] = [
  { id: "invc-001", invoiceNumber: "PF-20449", vendor: "PureFlow Filtration PH", date: iso(daysAgo(2)), amount: 6840, items: ["Sediment filters ×24", "Carbon block ×6"], ocrConfidence: 98, status: "Recorded" },
  { id: "invc-002", invoiceNumber: "AS-77812", vendor: "AquaSource Trading", date: iso(daysAgo(6)), amount: 13800, items: ["5-gal containers ×60"], ocrConfidence: 96, status: "Recorded" },
  { id: "invc-003", invoiceNumber: "MC-3321", vendor: "Manila Chem Supply", date: iso(daysAgo(9)), amount: 2450, items: ["Citric acid 25 kg", "Sanitizer 20 L"], ocrConfidence: 84, status: "Needs Review" },
  { id: "invc-004", invoiceNumber: "EP-9903", vendor: "EastPack Labels Inc", date: iso(daysAgo(12)), amount: 3120, items: ["Labels ×2000", "Shrink seals ×2000"], ocrConfidence: 99, status: "Recorded" },
];

export const SENTIMENT_ITEMS: SentimentItem[] = [
  { id: "sen-001", source: "Facebook", customerName: "Grace Aquino", text: "Super bilis ng delivery kanina! 20 minutes lang. Thank you AquaFlow! 💙", sentiment: "Happy", score: 0.94, time: iso(new Date(daysAgo(0).getTime() - 3 * 3600_000)) },
  { id: "sen-002", source: "Review", customerName: "Miguel Mendoza", text: "Water quality is consistently good. The app reminder before I run out is genuinely useful.", sentiment: "Happy", score: 0.88, time: iso(daysAgo(1)) },
  { id: "sen-003", source: "SMS", customerName: "Dennis Navarro", text: "Ok naman yung water pero medyo late yung delivery kahapon.", sentiment: "Neutral", score: 0.05, time: iso(daysAgo(1)) },
  { id: "sen-004", source: "Chat", customerName: "Karen Domingo", text: "This is the 2nd time my order was marked delivered but nothing arrived. Fix this or I'm switching suppliers.", sentiment: "Angry", score: -0.91, time: iso(daysAgo(2)) },
  { id: "sen-005", source: "Facebook", customerName: "Leo Soriano", text: "Presyo tumaas na naman? Alkaline used to be 45.", sentiment: "Angry", score: -0.62, time: iso(daysAgo(3)) },
  { id: "sen-006", source: "Review", customerName: "Ivy Ocampo", text: "Nice staff, clean station. Parking is a bit tight.", sentiment: "Neutral", score: 0.31, time: iso(daysAgo(4)) },
];

export const SENTIMENT_SUMMARY = { happy: 58, neutral: 27, angry: 15 };
