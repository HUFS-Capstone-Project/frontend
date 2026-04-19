import "./filter-bar.css";

import { cn } from "@/lib/utils";
import { MAP_ALL_CATEGORY_FILTER_CHIP } from "@/shared/types/map-home";

import { CategoryChip } from "./CategoryChip";
import { FilterPanel } from "./FilterPanel";
import type { MapFilterBarProps } from "./filters/map-filter-bar-props";
import { getMapCategoryChipHighlighted } from "./filters/map-filter-selection";

const CATEGORY_CHIP_GRID_CLASS =
  "grid w-full min-w-0 grid-cols-4 gap-2 overflow-visible pb-0.5 pt-0.5";
const CATEGORY_CHIP_SKELETON_COUNT = 4;

function CategoryChipSkeletonList() {
  return (
    <ul className={CATEGORY_CHIP_GRID_CLASS} role="presentation" aria-hidden>
      {Array.from({ length: CATEGORY_CHIP_SKELETON_COUNT }, (_, index) => (
        <li key={`category-chip-skeleton-${index}`} className="min-w-0">
          <div className="border-border/65 bg-background/78 h-7 w-full animate-pulse rounded-full border" />
        </li>
      ))}
    </ul>
  );
}

export function FilterBar({
  categories,
  categoryNameByCode,
  filterCategories,
  isCategoryLoading,
  isCategoryError,
  onRetryLoadCategories,
  activeCategories,
  focusedCategory,
  onToggleCategory,
  isTagPanelOpen,
  selectedTagKeysByCategory,
  selectedTagCountByCategory,
  onToggleTagInCategory,
  onResetFocusedCategoryTags,
  onCloseTagPanel,
}: MapFilterBarProps) {
  const highlightCtx = { activeCategories, focusedCategory };

  return (
    <div>
      {isCategoryLoading ? (
        <CategoryChipSkeletonList />
      ) : (
        <ul
          className={cn(CATEGORY_CHIP_GRID_CLASS, "animate-map-chip-fade-in")}
          role="list"
          aria-busy={isCategoryLoading}
        >
          {categories.map((category) => (
            <li key={category} className="min-w-0">
              <CategoryChip
                categoryCode={category}
                categoryLabel={
                  category === MAP_ALL_CATEGORY_FILTER_CHIP
                    ? MAP_ALL_CATEGORY_FILTER_CHIP
                    : (categoryNameByCode[category] ?? category)
                }
                highlighted={getMapCategoryChipHighlighted(category, highlightCtx)}
                panelFocused={isTagPanelOpen && focusedCategory === category}
                selectedTagCount={
                  category === MAP_ALL_CATEGORY_FILTER_CHIP
                    ? 0
                    : (selectedTagCountByCategory[category] ?? 0)
                }
                onClick={() => onToggleCategory(category)}
                className="w-full min-w-0 justify-center"
              />
            </li>
          ))}
        </ul>
      )}

      {isCategoryError ? (
        <div className="mt-1.5 flex justify-end">
          <button
            type="button"
            onClick={onRetryLoadCategories}
            className="text-muted-foreground hover:text-foreground focus-visible:ring-ring rounded-md px-1.5 py-0.5 text-xs font-medium underline-offset-2 outline-none hover:underline focus-visible:ring-2"
          >
            다시 시도
          </button>
        </div>
      ) : null}

      <FilterPanel
        isOpen={!isCategoryLoading && isTagPanelOpen}
        focusedCategory={focusedCategory}
        filterCategories={filterCategories}
        selectedTagKeysByCategory={selectedTagKeysByCategory}
        onToggleTagInCategory={onToggleTagInCategory}
        onResetFocusedCategoryTags={onResetFocusedCategoryTags}
        onClose={onCloseTagPanel}
      />
    </div>
  );
}
