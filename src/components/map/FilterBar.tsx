import { CategoryChip } from "./CategoryChip";
import { FilterPanel } from "./FilterPanel";
import type { MapFilterBarProps } from "./filters/map-filter-bar-props";
import { getMapCategoryChipHighlighted } from "./filters/map-filter-selection";

const CATEGORY_CHIP_GRID_CLASS =
  "grid w-full min-w-0 grid-cols-4 gap-2 overflow-visible pb-0.5 pt-0.5";

export function FilterBar({
  categories,
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
              category={category}
              highlighted={getMapCategoryChipHighlighted(category, highlightCtx)}
              panelFocused={isTagPanelOpen && focusedCategory === category}
              selectedTagCount={category === "전체" ? 0 : selectedTagCountByCategory[category]}
              onClick={() => onToggleCategory(category)}
              className="w-full min-w-0 justify-center"
            />
          </li>
        ))}
      </ul>

      <FilterPanel
        isOpen={isTagPanelOpen}
        focusedCategory={focusedCategory}
        selectedTagKeysByCategory={selectedTagKeysByCategory}
        onToggleTagInCategory={onToggleTagInCategory}
        onResetFocusedCategoryTags={onResetFocusedCategoryTags}
        onClose={onCloseTagPanel}
      />
    </div>
  );
}
