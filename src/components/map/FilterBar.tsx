import "./filter-bar.css";

import { MAP_ALL_CATEGORY_FILTER_CHIP } from "@/shared/types/map-home";

import { CategoryChipGrid, CategoryChipSkeletonList } from "./CategoryChipGrid";
import { FilterPanel } from "./FilterPanel";
import type { MapFilterBarProps } from "./filters/map-filter-bar-props";
import { getMapCategoryChipHighlighted } from "./filters/map-filter-selection";

export function FilterBar({
  hideTagPanel = false,
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
  const panelOpenForUi = hideTagPanel ? false : isTagPanelOpen;

  return (
    <div>
      {isCategoryLoading ? (
        <CategoryChipSkeletonList
          keyPrefix="category-chip-skeleton"
          itemClassName="bg-background/85"
        />
      ) : (
        <CategoryChipGrid
          className="animate-map-chip-fade-in"
          categories={categories}
          isLoading={isCategoryLoading}
          getCategoryLabel={(category) => categoryNameByCode[category] ?? category}
          isHighlighted={(category) => getMapCategoryChipHighlighted(category, highlightCtx)}
          isPanelFocused={(category) => panelOpenForUi && focusedCategory === category}
          getSelectedTagCount={(category) =>
            hideTagPanel || category === MAP_ALL_CATEGORY_FILTER_CHIP
              ? 0
              : (selectedTagCountByCategory[category] ?? 0)
          }
          onToggleCategory={onToggleCategory}
        />
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

      {!hideTagPanel ? (
        <FilterPanel
          isOpen={!isCategoryLoading && isTagPanelOpen}
          focusedCategory={focusedCategory}
          filterCategories={filterCategories}
          selectedTagKeysByCategory={selectedTagKeysByCategory}
          onToggleTagInCategory={onToggleTagInCategory}
          onResetFocusedCategoryTags={onResetFocusedCategoryTags}
          onClose={onCloseTagPanel}
        />
      ) : null}
    </div>
  );
}
