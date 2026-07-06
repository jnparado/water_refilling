import type { Employee } from "@/lib/types";
import { daysAgo, iso } from "./core";

export const EMPLOYEES: Employee[] = [
  {
    id: "emp-001", name: "Rey Malabanan", role: "Driver", phone: "+63 917 555 0101",
    status: "On Delivery", attendanceRate: 97, monthlySalary: 18000, hiredAt: iso(daysAgo(820)),
    performance: { deliveriesCompleted: 312, customerRating: 4.8, avgDeliveryMinutes: 22, lateArrivals: 2, fuelEfficiencyKmL: 11.2 },
  },
  {
    id: "emp-002", name: "Jun Dela Peña", role: "Driver", phone: "+63 917 555 0102",
    status: "On Delivery", attendanceRate: 93, monthlySalary: 18000, hiredAt: iso(daysAgo(460)),
    performance: { deliveriesCompleted: 268, customerRating: 4.5, avgDeliveryMinutes: 27, lateArrivals: 6, fuelEfficiencyKmL: 9.8 },
  },
  {
    id: "emp-003", name: "Marvin Sison", role: "Driver", phone: "+63 917 555 0103",
    status: "On Duty", attendanceRate: 89, monthlySalary: 17500, hiredAt: iso(daysAgo(210)),
    performance: { deliveriesCompleted: 141, customerRating: 4.2, avgDeliveryMinutes: 31, lateArrivals: 11, fuelEfficiencyKmL: 10.4 },
  },
  {
    id: "emp-004", name: "Lorna Espino", role: "Cashier", phone: "+63 917 555 0104",
    status: "On Duty", attendanceRate: 99, monthlySalary: 16500, hiredAt: iso(daysAgo(1100)),
    performance: { deliveriesCompleted: 0, customerRating: 4.9, avgDeliveryMinutes: 0, lateArrivals: 1, fuelEfficiencyKmL: 0 },
  },
  {
    id: "emp-005", name: "Boyet Ramirez", role: "Production Staff", phone: "+63 917 555 0105",
    status: "On Duty", attendanceRate: 95, monthlySalary: 16000, hiredAt: iso(daysAgo(640)),
    performance: { deliveriesCompleted: 0, customerRating: 4.6, avgDeliveryMinutes: 0, lateArrivals: 4, fuelEfficiencyKmL: 0 },
  },
  {
    id: "emp-006", name: "Divina Cortez", role: "Production Staff", phone: "+63 917 555 0106",
    status: "Off Duty", attendanceRate: 91, monthlySalary: 16000, hiredAt: iso(daysAgo(380)),
    performance: { deliveriesCompleted: 0, customerRating: 4.4, avgDeliveryMinutes: 0, lateArrivals: 7, fuelEfficiencyKmL: 0 },
  },
  {
    id: "emp-007", name: "Ariel Bustos", role: "Technician", phone: "+63 917 555 0107",
    status: "On Duty", attendanceRate: 96, monthlySalary: 21000, hiredAt: iso(daysAgo(910)),
    performance: { deliveriesCompleted: 0, customerRating: 4.7, avgDeliveryMinutes: 0, lateArrivals: 3, fuelEfficiencyKmL: 0 },
  },
  {
    id: "emp-008", name: "Nina Fajardo", role: "Cashier", phone: "+63 917 555 0108",
    status: "On Leave", attendanceRate: 87, monthlySalary: 16500, hiredAt: iso(daysAgo(150)),
    performance: { deliveriesCompleted: 0, customerRating: 4.3, avgDeliveryMinutes: 0, lateArrivals: 9, fuelEfficiencyKmL: 0 },
  },
];

export function getEmployee(id: string): Employee | undefined {
  return EMPLOYEES.find((e) => e.id === id);
}

/** Composite AI performance score (0-100) for drivers and staff. */
export function performanceScore(e: Employee): number {
  const rating = (e.performance.customerRating / 5) * 40;
  const attendance = (e.attendanceRate / 100) * 30;
  const punctuality = Math.max(0, 1 - e.performance.lateArrivals / 20) * 20;
  const speed =
    e.role === "Driver"
      ? Math.max(0, 1 - Math.max(0, e.performance.avgDeliveryMinutes - 20) / 30) * 10
      : 8;
  return Math.round(rating + attendance + punctuality + speed);
}
