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
      <span className="text-sm font-semibold text-[#171717]">
        {label}
        {required ? <span className="ml-0.5 text-[#f06f6b]">*</span> : null}
      </span>

      <button
        type="button"
        onClick={onClick}
        className="focus-visible:ring-ring/50 flex h-11 w-full items-center justify-between rounded-lg border border-[#dedede] bg-white px-3 text-left transition-colors hover:bg-[#fafafa] focus-visible:ring-3 focus-visible:outline-none"
      >
        <span className={cn("text-sm", hasValue ? "font-medium text-[#171717]" : "text-[#9ca3af]")}>
          {hasValue ? value : placeholder}
        </span>
        <span className="text-[#6b7280]" aria-hidden>
          {icon ?? "›"}
        </span>
      </button>
    </div>
  );
}
