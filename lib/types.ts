export type WaterType = "Purified" | "Alkaline" | "Mineral" | "Distilled";

export type ContainerSize = "5 Gallon" | "10L" | "6L" | "1L" | "Custom";

export interface Product {
  id: string;
  waterType: WaterType;
  size: ContainerSize;
  refillPrice: number;
  newContainerPrice: number;
}

export type LoyaltyTier = "Bronze" | "Silver" | "Gold" | "Platinum";

export type SubscriptionPlan = "Weekly" | "Biweekly" | "Monthly";

export interface Address {
  id: string;
  label: string;
  line: string;
  barangay: string;
  city: string;
  isDefault: boolean;
}

export interface Subscription {
  plan: SubscriptionPlan;
  productId: string;
  quantity: number;
  nextDelivery: string; // ISO date
  status: "Active" | "Paused";
}

export interface Customer {
  id: string;
  qrId: string;
  name: string;
  phone: string;
  email: string;
  joinedAt: string;
  addresses: Address[];
  loyaltyPoints: number;
  tier: LoyaltyTier;
  favoriteProductIds: string[];
  subscription: Subscription | null;
  totalOrders: number;
  totalSpent: number;
  lastOrderAt: string;
  /** Usual ordering pattern learned by the AI */
  usualPattern: { dayOfWeek: string; quantity: number; productId: string } | null;
  churnRisk: "Low" | "Medium" | "High";
  sentiment: "Happy" | "Neutral" | "Angry";
}

export type OrderStatus =
  | "Pending"
  | "Preparing"
  | "Out for Delivery"
  | "Delivered"
  | "Ready for Pickup"
  | "Completed"
  | "Cancelled";

export type PaymentMethod = "GCash" | "Maya" | "Card (Stripe)" | "PayPal" | "Cash on Delivery";

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  fulfillment: "Delivery" | "Pickup";
  express: boolean;
  paymentMethod: PaymentMethod;
  paymentStatus: "Paid" | "Unpaid" | "Refunded";
  createdAt: string;
  scheduledFor: string;
  addressLabel?: string;
  driverId?: string;
  etaMinutes?: number;
}

export type InventoryCategory =
  | "Water Stock"
  | "Containers"
  | "Packaging"
  | "Filtration"
  | "Chemicals";

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  stock: number;
  unit: string;
  dailyUsage: number;
  reorderPoint: number;
  supplierId: string;
  /** AI recommendation for reorder quantity, null when stock is healthy */
  reorderQty: number | null;
}

export interface Supplier {
  id: string;
  name: string;
  category: string;
  priceScore: number; // 0-100, higher = cheaper
  qualityScore: number;
  speedScore: number;
  leadTimeDays: number;
  lastOrderAt: string;
}

export type EmployeeRole = "Driver" | "Cashier" | "Production Staff" | "Technician";

export interface Employee {
  id: string;
  name: string;
  role: EmployeeRole;
  phone: string;
  status: "On Duty" | "Off Duty" | "On Delivery" | "On Leave";
  attendanceRate: number; // percent
  monthlySalary: number;
  hiredAt: string;
  performance: {
    deliveriesCompleted: number;
    customerRating: number; // 1-5
    avgDeliveryMinutes: number;
    lateArrivals: number;
    fuelEfficiencyKmL: number;
  };
}

export interface DeliveryStop {
  seq: number;
  orderId: string;
  customerName: string;
  address: string;
  etaMinutes: number;
  distanceKm: number;
  status: "Pending" | "En Route" | "Arrived" | "Delivered";
  priority: "Normal" | "High" | "Express";
}

export interface DeliveryRoute {
  id: string;
  driverId: string;
  vehicle: string;
  capacityUsedPct: number;
  stops: DeliveryStop[];
  totalKm: number;
  optimizedSavingsKm: number;
  fuelSavedLiters: number;
  status: "Scheduled" | "In Progress" | "Completed";
}

export interface Machine {
  id: string;
  name: string;
  type: "Reverse Osmosis" | "UV Sterilizer" | "Pump" | "Filter Bank";
  healthScore: number; // 0-100
  status: "Healthy" | "Attention" | "Critical";
  runtimeHours: number;
  lastServiceAt: string;
  prediction: string;
  predictedFailureInDays: number | null;
}

export interface SensorReading {
  time: string; // HH:mm
  tds: number;
  ph: number;
  temperature: number;
  turbidity: number;
  pressure: number;
  flowRate: number;
}

export type AlertKind = "Quality" | "Leak" | "Fraud" | "Maintenance" | "Inventory";

export interface SystemAlert {
  id: string;
  kind: AlertKind;
  severity: "Info" | "Warning" | "Critical";
  title: string;
  detail: string;
  time: string;
  acknowledged: boolean;
}

export interface DailySales {
  date: string; // ISO date
  revenue: number;
  orders: number;
  gallonsSold: number;
}

export interface Insight {
  id: string;
  headline: string;
  explanation: string;
  direction: "up" | "down" | "flat";
  changePct: number;
  category: string;
}

export interface Promotion {
  id: string;
  customerId: string;
  customerName: string;
  trigger: string;
  offer: string;
  channel: "SMS" | "Email" | "WhatsApp" | "Push";
  status: "Scheduled" | "Sent" | "Redeemed";
  sentAt: string | null;
}

export interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  vendor: string;
  date: string;
  amount: number;
  items: string[];
  ocrConfidence: number;
  status: "Recorded" | "Needs Review";
}

export interface MonthFinance {
  month: string; // e.g. "Jul 2026"
  income: number;
  expenses: number;
  isForecast: boolean;
}

export interface DemandForecastRow {
  waterType: WaterType;
  expectedOrders: number;
  lastMonthOrders: number;
  drivers: string[];
}

export interface PriceSuggestion {
  productId: string;
  productName: string;
  currentPrice: number;
  suggestedPrice: number;
  reason: string;
  demandLevel: "Low" | "Normal" | "High";
}

export interface EnergyDevice {
  id: string;
  name: string;
  todayKwh: number;
  runtimeHours: number;
  costToday: number;
  trend: "up" | "down" | "flat";
  aiNote: string | null;
}

export interface SentimentItem {
  id: string;
  source: "Review" | "Chat" | "Facebook" | "SMS";
  customerName: string;
  text: string;
  sentiment: "Happy" | "Neutral" | "Angry";
  score: number; // -1..1
  time: string;
}

export interface FraudCase {
  id: string;
  type: "Fake Refund" | "Duplicate Delivery" | "Inventory Mismatch" | "Suspicious Discount";
  description: string;
  amountAtRisk: number;
  confidence: number; // 0-100
  involved: string;
  detectedAt: string;
  status: "Open" | "Investigating" | "Resolved" | "Dismissed";
}
