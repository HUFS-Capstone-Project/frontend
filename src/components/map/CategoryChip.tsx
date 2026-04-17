import { cn } from "@/lib/utils";
import type { MapCategoryFilterChip } from "@/shared/types/map-home";

import {
  MAP_CHIP_BADGE_SELECTED_CLASS,
  MAP_CHIP_BADGE_SELECTED_MOBILE_CLASS,
  MAP_CHIP_BADGE_UNSELECTED_CLASS,
  MAP_CHIP_BADGE_UNSELECTED_MOBILE_CLASS,
  MAP_CHIP_BASE_CLASS,
  MAP_CHIP_SELECTED_CLASS,
  MAP_CHIP_UNSELECTED_CLASS,
} from "./chip-style";
import { MAP_CATEGORY_FILTER_CHIP_ICON } from "./filters/map-category-icons";

type CategoryChipProps = {
  category: MapCategoryFilterChip;
  /** 태그 필터·「전체」 규칙에 맞춘 칩 강조 여부 */
  highlighted: boolean;
  selectedTagCount?: number;
  onClick: () => void;
  className?: string;
};

export function CategoryChip({
  category,
  highlighted,
  selectedTagCount = 0,
  onClick,
  className,
}: CategoryChipProps) {
  const Icon = MAP_CATEGORY_FILTER_CHIP_ICON[category];

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        MAP_CHIP_BASE_CLASS,
        "relative min-w-0 flex-nowrap",
        highlighted ? MAP_CHIP_SELECTED_CLASS : MAP_CHIP_UNSELECTED_CLASS,
        className,
      )}
      aria-pressed={highlighted}
    >
      <Icon className="size-3 shrink-0" strokeWidth={2.2} aria-hidden />
      <span className="min-w-0 truncate whitespace-nowrap">{category}</span>
      {selectedTagCount > 0 ? (
        <span
          className={cn(
            "rounded-full text-[10px] leading-none md:inline-flex md:shrink-0 md:items-center md:px-1.5 md:py-0.5",
            highlighted ? MAP_CHIP_BADGE_SELECTED_CLASS : MAP_CHIP_BADGE_UNSELECTED_CLASS,
            highlighted
              ? MAP_CHIP_BADGE_SELECTED_MOBILE_CLASS
              : MAP_CHIP_BADGE_UNSELECTED_MOBILE_CLASS,
          )}
        >
          {selectedTagCount}
        </span>
      ) : null}
    </button>
  );
}
