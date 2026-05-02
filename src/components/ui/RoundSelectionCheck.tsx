import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export type RoundSelectionCheckProps = {
  selected: boolean;
  className?: string;
};

export function RoundSelectionCheck({ selected, className }: RoundSelectionCheckProps) {
  return (
    <span
      className={cn(
        "flex h-[1.375rem] w-[1.375rem] shrink-0 items-center justify-center rounded-full border-2 transition-colors",
        selected ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card",
        className,
      )}
      aria-hidden
    >
      {selected ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : null}
    </span>
  );
}
