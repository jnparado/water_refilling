import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  change,
  changeLabel,
  icon,
  invertColor = false,
}: {
  label: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  /** For metrics where a decrease is good (e.g. expenses) */
  invertColor?: boolean;
}) {
  const positive = change !== undefined && (invertColor ? change < 0 : change > 0);
  const negative = change !== undefined && (invertColor ? change > 0 : change < 0);

  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 truncate text-2xl font-semibold tabular-nums">{value}</p>
          {change !== undefined && (
            <p
              className={cn(
                "mt-1 flex items-center gap-1 text-xs font-medium",
                positive && "text-emerald-600 dark:text-emerald-400",
                negative && "text-red-600 dark:text-red-400",
                !positive && !negative && "text-muted-foreground"
              )}
            >
              {change > 0 ? (
                <ArrowUpRight className="size-3.5" />
              ) : change < 0 ? (
                <ArrowDownRight className="size-3.5" />
              ) : (
                <Minus className="size-3.5" />
              )}
              {Math.abs(change)}%{changeLabel ? ` ${changeLabel}` : ""}
            </p>
          )}
        </div>
        {icon ? (
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
