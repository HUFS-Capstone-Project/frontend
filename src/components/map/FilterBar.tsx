import { MAP_ALL_CATEGORY_FILTER_CHIP } from "@/shared/types/map-home";

import { CategoryChip } from "./CategoryChip";
import { FilterPanel } from "./FilterPanel";
import type { MapFilterBarProps } from "./filters/map-filter-bar-props";
import { getMapCategoryChipHighlighted } from "./filters/map-filter-selection";

const CATEGORY_CHIP_GRID_CLASS =
  "grid w-full min-w-0 grid-cols-4 gap-2 overflow-visible pb-0.5 pt-0.5";

export function FilterBar({
  categories,
  categoryNameByCode,
  filterCategories,
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
      <ul className={CATEGORY_CHIP_GRID_CLASS} role="list">
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

      <FilterPanel
        isOpen={isTagPanelOpen}
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
