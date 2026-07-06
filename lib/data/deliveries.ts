import type { DeliveryRoute } from "@/lib/types";

export const ROUTES: DeliveryRoute[] = [
  {
    id: "route-001",
    driverId: "emp-001",
    vehicle: "Truck 1 — L300 (cap. 60 containers)",
    capacityUsedPct: 85,
    totalKm: 14.2,
    optimizedSavingsKm: 5.8,
    fuelSavedLiters: 0.9,
    status: "In Progress",
    stops: [
      { seq: 1, orderId: "ORD-4231", customerName: "Maria Santos", address: "24 Sampaguita St, San Isidro", etaMinutes: 0, distanceKm: 2.1, status: "Delivered", priority: "Normal" },
      { seq: 2, orderId: "ORD-4235", customerName: "Carlo Cruz", address: "88 Rizal Ave, Poblacion", etaMinutes: 0, distanceKm: 1.4, status: "Delivered", priority: "High" },
      { seq: 3, orderId: "ORD-4240", customerName: "Angel Garcia", address: "12 Katipunan Rd, Malanday", etaMinutes: 24, distanceKm: 3.2, status: "En Route", priority: "Express" },
      { seq: 4, orderId: "ORD-4243", customerName: "Miguel Mendoza", address: "156 Ilang-Ilang St, Sto. Niño", etaMinutes: 41, distanceKm: 2.8, status: "Pending", priority: "Normal" },
      { seq: 5, orderId: "ORD-4247", customerName: "Sofia Torres", address: "77 Mabini St, Bagong Silang", etaMinutes: 58, distanceKm: 4.7, status: "Pending", priority: "Normal" },
    ],
  },
  {
    id: "route-002",
    driverId: "emp-002",
    vehicle: "Truck 2 — Multicab (cap. 35 containers)",
    capacityUsedPct: 71,
    totalKm: 9.6,
    optimizedSavingsKm: 3.1,
    fuelSavedLiters: 0.5,
    status: "In Progress",
    stops: [
      { seq: 1, orderId: "ORD-4233", customerName: "Ramon Flores", address: "63 Bonifacio Dr, Concepcion", etaMinutes: 0, distanceKm: 1.8, status: "Delivered", priority: "Normal" },
      { seq: 2, orderId: "ORD-4238", customerName: "Liza Ramos", address: "31 Molave St, Marikina Heights", etaMinutes: 12, distanceKm: 2.6, status: "En Route", priority: "High" },
      { seq: 3, orderId: "ORD-4245", customerName: "Paolo Villanueva", address: "108 Acacia Lane, Parang", etaMinutes: 33, distanceKm: 3.4, status: "Pending", priority: "Normal" },
      { seq: 4, orderId: "ORD-4249", customerName: "Grace Aquino", address: "5 Sampaguita St, San Isidro", etaMinutes: 47, distanceKm: 1.8, status: "Pending", priority: "Normal" },
    ],
  },
  {
    id: "route-003",
    driverId: "emp-003",
    vehicle: "Motorcycle w/ sidecar (cap. 8 containers)",
    capacityUsedPct: 100,
    totalKm: 6.3,
    optimizedSavingsKm: 1.9,
    fuelSavedLiters: 0.3,
    status: "Scheduled",
    stops: [
      { seq: 1, orderId: "ORD-4250", customerName: "Dennis Navarro", address: "92 Rizal Ave, Poblacion", etaMinutes: 75, distanceKm: 2.2, status: "Pending", priority: "Express" },
      { seq: 2, orderId: "ORD-4251", customerName: "Karen Domingo", address: "40 Katipunan Rd, Malanday", etaMinutes: 92, distanceKm: 1.9, status: "Pending", priority: "Normal" },
      { seq: 3, orderId: "ORD-4252", customerName: "Marco Salazar", address: "18 Mabini St, Bagong Silang", etaMinutes: 110, distanceKm: 2.2, status: "Pending", priority: "Normal" },
    ],
  },
];

export interface SchedulingDecision {
  orderId: string;
  customerName: string;
  assignedTo: string;
  reason: string;
}

export const SCHEDULING_DECISIONS: SchedulingDecision[] = [
  { orderId: "ORD-4240", customerName: "Angel Garcia", assignedTo: "Rey Malabanan (Truck 1)", reason: "Express order; Truck 1 is 900 m away and has 9 free slots." },
  { orderId: "ORD-4249", customerName: "Grace Aquino", assignedTo: "Jun Dela Peña (Truck 2)", reason: "Along Truck 2's return path; adds only 0.4 km to the route." },
  { orderId: "ORD-4250", customerName: "Dennis Navarro", assignedTo: "Marvin Sison (Motorcycle)", reason: "Small 2-container order; motorcycle is fastest through Poblacion traffic." },
  { orderId: "ORD-4252", customerName: "Marco Salazar", assignedTo: "Marvin Sison (Motorcycle)", reason: "Customer available only 3–5 PM; matches Marvin's afternoon window." },
];
