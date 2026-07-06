import type { Metadata } from "next";
import { Award } from "lucide-react";

import { AiPanel } from "@/components/ai-panel";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatDate } from "@/lib/data/core";
import { SUPPLIERS, supplierAiScore } from "@/lib/data/inventory";

export const metadata: Metadata = { title: "Suppliers" };

export default function SuppliersPage() {
  const ranked = [...SUPPLIERS].sort((a, b) => supplierAiScore(b) - supplierAiScore(a));

  return (
    <>
      <PageHeader
        title="AI Supplier Recommendation"
        description="Suppliers scored on price, quality, and delivery speed"
      />
      <main className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
        <AiPanel title="AI Pick — This Month">
          For the upcoming container reorder, <strong>{ranked[0].name}</strong> is the best overall
          choice (score {supplierAiScore(ranked[0])}): near-best pricing with the fastest lead time
          ({ranked[0].leadTimeDays} days). For the filter replacement order, prioritize{" "}
          <strong>PureFlow Filtration PH</strong> despite the higher price — their membranes have a
          31% longer observed service life, which is cheaper per liter produced.
        </AiPanel>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {ranked.map((s, idx) => {
            const score = supplierAiScore(s);
            return (
              <Card key={s.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-base">
                        {s.name}
                        {idx === 0 && (
                          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                            <Award className="size-3" /> AI Pick
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>{s.category}</CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-semibold tabular-nums">{score}</p>
                      <p className="text-xs text-muted-foreground">AI score</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(
                    [
                      ["Price", s.priceScore],
                      ["Quality", s.qualityScore],
                      ["Delivery Speed", s.speedScore],
                    ] as const
                  ).map(([label, value]) => (
                    <div key={label}>
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="tabular-nums">{value}</span>
                      </div>
                      <Progress value={value} className="h-1.5" />
                    </div>
                  ))}
                  <p className="pt-1 text-xs text-muted-foreground">
                    Lead time {s.leadTimeDays} days · last order {formatDate(s.lastOrderAt)}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </>
  );
}
