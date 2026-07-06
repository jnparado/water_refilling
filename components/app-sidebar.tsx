"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BadgePercent,
  BarChart3,
  Bot,
  Brain,
  CalendarClock,
  CircleDollarSign,
  Droplets,
  FlaskConical,
  LayoutDashboard,
  Package,
  Receipt,
  Repeat,
  ShieldAlert,
  ShoppingCart,
  Sparkles,
  Truck,
  Users,
  Warehouse,
  Wrench,
  Zap,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

const nav = [
  {
    label: "Overview",
    items: [{ title: "Executive Dashboard", href: "/", icon: LayoutDashboard }],
  },
  {
    label: "Sales",
    items: [
      { title: "Orders", href: "/orders", icon: ShoppingCart },
      { title: "Subscriptions", href: "/subscriptions", icon: Repeat },
      { title: "Sales & Insights", href: "/sales", icon: BarChart3 },
      { title: "Promotions & Sentiment", href: "/promotions", icon: BadgePercent },
    ],
  },
  {
    label: "Customers",
    items: [
      { title: "Customers", href: "/customers", icon: Users },
      { title: "AI Reorder Predictions", href: "/predictions", icon: Brain },
    ],
  },
  {
    label: "AI Forecasting",
    items: [
      { title: "Demand Forecast", href: "/forecasting", icon: Sparkles },
      { title: "Finance & Pricing", href: "/finance", icon: CircleDollarSign },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Inventory", href: "/inventory", icon: Warehouse },
      { title: "Suppliers", href: "/suppliers", icon: Package },
      { title: "Deliveries & Routes", href: "/deliveries", icon: Truck },
      { title: "Machine Maintenance", href: "/maintenance", icon: Wrench },
      { title: "Water Quality", href: "/quality", icon: FlaskConical },
      { title: "Energy Monitor", href: "/energy", icon: Zap },
    ],
  },
  {
    label: "Team & Protection",
    items: [
      { title: "Employees", href: "/employees", icon: CalendarClock },
      { title: "Fraud Detection", href: "/fraud", icon: ShieldAlert },
    ],
  },
  {
    label: "Tools",
    items: [
      { title: "AI Assistant", href: "/assistant", icon: Bot },
      { title: "Invoice OCR", href: "/invoices", icon: Receipt },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Droplets className="size-4" />
                </div>
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-semibold">AquaFlow</span>
                  <span className="truncate text-xs text-muted-foreground">
                    Water Station AI
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {nav.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const active =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href);
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                        <Link href={item.href}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <div className="px-2 py-1 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
          Demo data · Supabase-ready
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
