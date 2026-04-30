import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PlaceTypeChipProps = {
  label: string;
  icon: ReactNode;
  selected?: boolean;
  onClick?: () => void;
};

export function PlaceTypeChip({ label, icon, selected = false, onClick }: PlaceTypeChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "focus-visible:ring-ring/50 inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-colors focus-visible:ring-3 focus-visible:outline-none",
        selected
          ? "border-[#f06f6b] bg-[#fff0ee] text-[#d95f5b]"
          : "border-[#e5e7eb] bg-white text-[#4b5563] hover:bg-[#fafafa]",
      )}
    >
      <span aria-hidden>{icon}</span>
      {label}
    </button>
  );
}
