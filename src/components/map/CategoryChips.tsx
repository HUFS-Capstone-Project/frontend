import { CircleEllipsis, Coffee, Flag, UtensilsCrossed } from "lucide-react";

import { cn } from "@/lib/utils";
import type { MapPlaceCategory } from "@/shared/types/map-home";

export type CategoryChipsProps = {
  categories: MapPlaceCategory[];
  selectedCategories: MapPlaceCategory[];
  onToggleCategory: (category: MapPlaceCategory) => void;
  className?: string;
};

const CATEGORY_ICON_MAP = {
  맛집: UtensilsCrossed,
  카페: Coffee,
  놀거리: Flag,
  기타: CircleEllipsis,
} as const;

export function CategoryChips({
  categories,
  selectedCategories,
  onToggleCategory,
  className,
}: CategoryChipsProps) {
  return (
    <ul className={cn("scrollbar-hide flex gap-2 overflow-x-auto pb-0.5", className)} role="list">
      {categories.map((category) => {
        const Icon = CATEGORY_ICON_MAP[category];
        const selected = selectedCategories.includes(category);

        return (
          <li key={category}>
            <button
              type="button"
              onClick={() => onToggleCategory(category)}
              className={cn(
                "flex h-7 min-w-fit items-center justify-center gap-1 rounded-full border px-2.5 text-xs font-medium transition-colors",
                selected
                  ? "border-brand-coral bg-brand-coral text-primary-foreground"
                  : "bg-background/96 text-muted-foreground hover:bg-background border-black/10",
              )}
              aria-pressed={selected}
            >
              <Icon className="size-3 shrink-0" strokeWidth={2.2} aria-hidden />
              <span>{category}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
