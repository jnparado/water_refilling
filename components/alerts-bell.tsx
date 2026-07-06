"use client";

import { Bell } from "lucide-react";

import { ALERTS } from "@/lib/data/operations";
import { formatDateTime } from "@/lib/data/core";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

const severityColor: Record<string, string> = {
  Critical: "bg-red-500",
  Warning: "bg-amber-500",
  Info: "bg-sky-500",
};

export function AlertsBell() {
  const unacked = ALERTS.filter((a) => !a.acknowledged);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-4" />
          {unacked.length > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
              {unacked.length}
            </span>
          )}
          <span className="sr-only">Alerts</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        <div className="border-b px-4 py-3">
          <p className="text-sm font-semibold">System Alerts</p>
          <p className="text-xs text-muted-foreground">
            AI monitoring across quality, leaks, fraud, and inventory
          </p>
        </div>
        <ScrollArea className="max-h-96">
          <div className="divide-y">
            {ALERTS.map((alert) => (
              <div key={alert.id} className="flex gap-3 px-4 py-3">
                <span
                  className={`mt-1.5 size-2 shrink-0 rounded-full ${severityColor[alert.severity]}`}
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium">{alert.title}</p>
                    <Badge variant="outline" className="shrink-0 text-[10px]">
                      {alert.kind}
                    </Badge>
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                    {alert.detail}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground/70">
                    {formatDateTime(alert.time)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
