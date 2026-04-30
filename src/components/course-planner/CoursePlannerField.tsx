import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type CoursePlannerFieldProps = {
  label: string;
  value: string;
  placeholder?: string;
  required?: boolean;
  icon?: ReactNode;
  className?: string;
  onClick?: () => void;
};

export function CoursePlannerField({
  label,
  value,
  placeholder,
  required = false,
  icon,
  className,
  onClick,
}: CoursePlannerFieldProps) {
  const hasValue = value.trim().length > 0;

  return (
    <div className={cn("grid gap-2", className)}>
      <span className="text-foreground text-sm font-semibold">
        {label}
        {required ? <span className="text-primary ml-0.5">*</span> : null}
      </span>

      <button
        type="button"
        onClick={onClick}
        className="border-border bg-background hover:bg-muted/35 focus-visible:ring-ring/50 flex h-11 w-full items-center justify-between rounded-lg border px-3 text-left transition-colors focus-visible:ring-3 focus-visible:outline-none"
      >
        <span
          className={cn(
            "text-sm",
            hasValue ? "text-foreground font-medium" : "text-muted-foreground",
          )}
        >
          {hasValue ? value : placeholder}
        </span>
        <span className="text-muted-foreground" aria-hidden>
          {icon ?? "›"}
        </span>
      </button>
    </div>
  );
}
