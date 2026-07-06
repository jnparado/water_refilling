import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

/** Highlighted panel for AI-generated recommendations and explanations. */
export function AiPanel({
  title = "AI Recommendation",
  children,
  className,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-primary/25 bg-primary/5 p-4",
        className
      )}
    >
      <div className="flex items-center gap-2 text-sm font-semibold text-primary">
        <Sparkles className="size-4" />
        {title}
      </div>
      <div className="mt-2 text-sm leading-relaxed text-foreground/85">{children}</div>
    </div>
  );
}
