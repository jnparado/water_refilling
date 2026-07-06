import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";
import { NewOrderForm } from "./new-order-form";

export const metadata: Metadata = { title: "New Order" };

export default function NewOrderPage() {
  return (
    <>
      <PageHeader
        title="New Order"
        description="Delivery or pickup — all water types and container sizes"
      />
      <main className="p-4 md:p-6">
        <NewOrderForm />
      </main>
    </>
  );
}
