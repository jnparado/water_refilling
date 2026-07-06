import type { Customer, LoyaltyTier, SubscriptionPlan } from "@/lib/types";
import { PRODUCTS, daysAgo, daysFromNow, iso, seededRandom } from "./core";

const firstNames = [
  "Jason", "Maria", "Carlo", "Angel", "Miguel", "Sofia", "Ramon", "Liza",
  "Paolo", "Grace", "Dennis", "Karen", "Marco", "Ivy", "Nathan", "Cess",
  "Ericka", "Jomar", "Bianca", "Leo", "Trisha", "Aldrin", "Nica", "Gab",
];
const lastNames = [
  "Reyes", "Santos", "Cruz", "Garcia", "Mendoza", "Torres", "Flores", "Ramos",
  "Villanueva", "Aquino", "Navarro", "Domingo", "Salazar", "Castillo", "Ocampo",
  "Bautista", "Del Rosario", "Padilla", "Marquez", "Soriano", "Velasco", "Lim",
  "Tan", "Uy",
];
const barangays = ["San Isidro", "Poblacion", "Malanday", "Sto. Niño", "Bagong Silang", "Concepcion", "Marikina Heights", "Parang"];
const streets = ["Sampaguita St", "Rizal Ave", "Katipunan Rd", "Ilang-Ilang St", "Mabini St", "Bonifacio Dr", "Molave St", "Acacia Lane"];
const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const plans: SubscriptionPlan[] = ["Weekly", "Biweekly", "Monthly"];

function tierFor(points: number): LoyaltyTier {
  if (points >= 2000) return "Platinum";
  if (points >= 1000) return "Gold";
  if (points >= 400) return "Silver";
  return "Bronze";
}

function buildCustomers(): Customer[] {
  const rand = seededRandom(42);
  const customers: Customer[] = [];

  for (let i = 0; i < 24; i++) {
    const name = `${firstNames[i]} ${lastNames[i]}`;
    const joinedDaysAgo = 60 + Math.floor(rand() * 700);
    const totalOrders = 4 + Math.floor(rand() * 120);
    // A few intentionally-lapsed customers so the promotions engine has targets.
    const lastOrderDaysAgo = i % 7 === 5 ? 40 + Math.floor(rand() * 30) : Math.floor(rand() * 12);
    const avgTicket = 90 + rand() * 260;
    const points = Math.floor(totalOrders * avgTicket * 0.02) * 10;
    const favCount = 1 + Math.floor(rand() * 2);
    const favs = Array.from({ length: favCount }, (_, k) => PRODUCTS[(i * 3 + k * 5) % PRODUCTS.length].id);
    const hasSub = i % 3 === 0;
    const hasPattern = i % 2 === 0;
    const sentimentRoll = rand();

    customers.push({
      id: `cus-${String(i + 1).padStart(3, "0")}`,
      qrId: `AQF-${String(100200 + i * 37)}`,
      name,
      phone: `+63 917 ${String(2000000 + Math.floor(rand() * 7999999)).slice(0, 3)} ${String(1000 + Math.floor(rand() * 8999))}`,
      email: `${firstNames[i].toLowerCase()}.${lastNames[i].toLowerCase().replace(/ /g, "")}@gmail.com`,
      joinedAt: iso(daysAgo(joinedDaysAgo)),
      addresses: [
        {
          id: `addr-${i}-1`,
          label: "Home",
          line: `${10 + Math.floor(rand() * 180)} ${streets[i % streets.length]}`,
          barangay: barangays[i % barangays.length],
          city: "Marikina City",
          isDefault: true,
        },
        ...(i % 4 === 0
          ? [{
              id: `addr-${i}-2`,
              label: "Office",
              line: `Unit ${1 + Math.floor(rand() * 20)}, ${streets[(i + 3) % streets.length]}`,
              barangay: barangays[(i + 2) % barangays.length],
              city: "Quezon City",
              isDefault: false,
            }]
          : []),
      ],
      loyaltyPoints: points,
      tier: tierFor(points),
      favoriteProductIds: [...new Set(favs)],
      subscription: hasSub
        ? {
            plan: plans[i % plans.length],
            productId: favs[0],
            quantity: 2 + (i % 3),
            nextDelivery: iso(daysFromNow(1 + (i % 7))),
            status: i % 9 === 0 ? "Paused" : "Active",
          }
        : null,
      totalOrders,
      totalSpent: Math.floor(totalOrders * avgTicket),
      lastOrderAt: iso(daysAgo(lastOrderDaysAgo)),
      usualPattern: hasPattern
        ? { dayOfWeek: dayNames[i % dayNames.length], quantity: 2 + (i % 4), productId: favs[0] }
        : null,
      churnRisk: lastOrderDaysAgo > 30 ? "High" : lastOrderDaysAgo > 14 ? "Medium" : "Low",
      sentiment: sentimentRoll > 0.8 ? "Angry" : sentimentRoll > 0.55 ? "Neutral" : "Happy",
    });
  }
  return customers;
}

export const CUSTOMERS: Customer[] = buildCustomers();

export function getCustomer(id: string): Customer | undefined {
  return CUSTOMERS.find((c) => c.id === id);
}
