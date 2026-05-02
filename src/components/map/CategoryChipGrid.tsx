import { cn } from "@/lib/utils";
import type { MapCategoryFilterChip } from "@/shared/types/map-home";
import { MAP_ALL_CATEGORY_FILTER_CHIP } from "@/shared/types/map-home";

import { CategoryChip } from "./CategoryChip";

export const CATEGORY_CHIP_GRID_CLASS =
  "grid w-full min-w-0 grid-cols-4 gap-2 overflow-visible pb-0.5 pt-0.5";

const CATEGORY_CHIP_SKELETON_COUNT = 4;

type CategoryChipSkeletonListProps = {
  keyPrefix: string;
  itemClassName?: string;
};

export function CategoryChipSkeletonList({
  keyPrefix,
  itemClassName,
}: CategoryChipSkeletonListProps) {
  return (
    <ul className={CATEGORY_CHIP_GRID_CLASS} role="presentation" aria-hidden>
      {Array.from({ length: CATEGORY_CHIP_SKELETON_COUNT }, (_, index) => (
        <li key={`${keyPrefix}-${index}`} className="min-w-0">
          <div
            className={cn(
              "border-border/65 h-7 w-full animate-pulse rounded-full border",
              itemClassName,
            )}
          />
        </li>
      ))}
    </ul>
  );
}

type CategoryChipGridProps = {
  categories: MapCategoryFilterChip[];
  isLoading: boolean;
  getCategoryLabel: (category: MapCategoryFilterChip) => string;
  isHighlighted: (category: MapCategoryFilterChip) => boolean;
  isPanelFocused: (category: MapCategoryFilterChip) => boolean;
  getSelectedTagCount: (category: MapCategoryFilterChip) => number;
  onToggleCategory: (category: MapCategoryFilterChip) => void;
  className?: string;
};

export function CategoryChipGrid({
  categories,
  isLoading,
  getCategoryLabel,
  isHighlighted,
  isPanelFocused,
  getSelectedTagCount,
  onToggleCategory,
  className,
}: CategoryChipGridProps) {
  return (
    <ul className={cn(CATEGORY_CHIP_GRID_CLASS, className)} role="list" aria-busy={isLoading}>
      {categories.map((category) => (
        <li key={category} className="min-w-0">
          <CategoryChip
            categoryCode={category}
            categoryLabel={
              category === MAP_ALL_CATEGORY_FILTER_CHIP
                ? MAP_ALL_CATEGORY_FILTER_CHIP
                : getCategoryLabel(category)
            }
            highlighted={isHighlighted(category)}
            panelFocused={isPanelFocused(category)}
            selectedTagCount={getSelectedTagCount(category)}
            onClick={() => onToggleCategory(category)}
            className="w-full min-w-0 justify-center"
          />
        </li>
      ))}
    </ul>
  );
}
