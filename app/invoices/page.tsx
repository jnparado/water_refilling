import type { Metadata } from "next";
import { ScanText, Upload } from "lucide-react";

import { AiPanel } from "@/components/ai-panel";
import { KpiCard } from "@/components/kpi-card";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, peso } from "@/lib/data/core";
import { INVOICES } from "@/lib/data/sales";

export const metadata: Metadata = { title: "Invoice OCR" };

export default function InvoicesPage() {
  const total = INVOICES.reduce((s, i) => s + i.amount, 0);
  const needsReview = INVOICES.filter((i) => i.status === "Needs Review").length;

  return (
    <>
      <PageHeader
        title="AI Invoice OCR"
        description="Upload receipts and invoices — the AI extracts the details and records the transaction"
        actions={
          <Button size="sm">
            <Upload className="size-4" /> Upload Receipt
          </Button>
        }
      />
      <main className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard label="Processed This Month" value={String(INVOICES.length)} />
          <KpiCard label="Total Recorded" value={peso.format(total)} />
          <KpiCard label="Avg OCR Confidence" value={`${Math.round(INVOICES.reduce((s, i) => s + i.ocrConfidence, 0) / INVOICES.length)}%`} />
          <KpiCard label="Needs Review" value={String(needsReview)} />
        </div>

        <AiPanel title="How it works">
          Snap a photo or upload a PDF. OCR extracts the <strong>invoice number, date, amount, and
          line items</strong>, matches the vendor against your supplier list, and posts the expense
          to the ledger automatically. Anything under 90% confidence is queued for a quick human
          check — like invoice MC-3321 below, where the handwritten total was hard to read.
        </AiPanel>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ScanText className="size-4 text-primary" /> Recent Extractions
            </CardTitle>
            <CardDescription>Automatically recorded to expenses</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Invoice #</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Confidence</TableHead>
                  <TableHead className="pr-6">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {INVOICES.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="pl-6 font-mono text-xs">{inv.invoiceNumber}</TableCell>
                    <TableCell className="font-medium">{inv.vendor}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(inv.date)}</TableCell>
                    <TableCell className="max-w-60 text-sm text-muted-foreground">
                      {inv.items.join(", ")}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{peso.format(inv.amount)}</TableCell>
                    <TableCell className="text-right tabular-nums">{inv.ocrConfidence}%</TableCell>
                    <TableCell className="pr-6">
                      <Badge
                        variant="secondary"
                        className={
                          inv.status === "Recorded"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                        }
                      >
                        {inv.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
