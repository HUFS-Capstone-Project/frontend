import { CategoryChip } from "@/components/map/CategoryChip";
import { MAP_FILTER_PANEL_GROUP_TITLE_CLASS } from "@/components/map/chip-style";
import type { MapFilterBarProps } from "@/components/map/filters/map-filter-bar-props";
import { getMapCategoryChipHighlighted } from "@/components/map/filters/map-filter-selection";
import { TagChip } from "@/components/map/TagChip";
import type { Tag } from "@/features/map/api/place-taxonomy-types";
import { isDefaultGroup, isEmptyGroup } from "@/features/map/utils/filter-panel-group";
import { MAP_ALL_CATEGORY_FILTER_CHIP, type MapPrimaryCategory } from "@/shared/types/map-home";

const CATEGORY_CHIP_GRID_CLASS =
  "grid w-full min-w-0 grid-cols-4 gap-2 overflow-visible pb-0.5 pt-0.5";
const CATEGORY_CHIP_SKELETON_COUNT = 4;

function CategoryChipSkeletonList() {
  return (
    <ul className={CATEGORY_CHIP_GRID_CLASS} role="presentation" aria-hidden>
      {Array.from({ length: CATEGORY_CHIP_SKELETON_COUNT }, (_, index) => (
        <li key={`course-category-chip-skeleton-${index}`} className="min-w-0">
          <div className="border-border/65 bg-muted/40 h-7 w-full animate-pulse rounded-full border" />
        </li>
      ))}
    </ul>
  );
}

export function CoursePlaceTagSelector({
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
}: MapFilterBarProps) {
  const highlightCtx = { activeCategories, focusedCategory };
  const focusedSection =
    isTagPanelOpen && focusedCategory
      ? (filterCategories.find((category) => category.code === focusedCategory) ?? null)
      : null;
  const selectedKeys = focusedSection ? (selectedTagKeysByCategory[focusedSection.code] ?? []) : [];

  function renderTagChipRow(tags: Tag[], categoryCode: MapPrimaryCategory) {
    const visibleTags = tags.filter((tag) => tag.name.trim());
    if (visibleTags.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2" role="group">
        {visibleTags.map((tag) => (
          <TagChip
            key={`${categoryCode}-${tag.code}`}
            label={tag.name}
            selected={selectedKeys.includes(tag.code)}
            onClick={() => onToggleTagInCategory(categoryCode, tag.code)}
          />
        ))}
      </div>
    );
  }

  const hasRenderableTagGroups =
    focusedSection?.tagGroups.some((group) => {
      if (isEmptyGroup(group)) return false;
      return group.tags.some((tag) => tag.name.trim());
    }) ?? false;

  return (
    <div className="grid gap-2">
      {isCategoryLoading ? (
        <CategoryChipSkeletonList />
      ) : (
        <ul className={CATEGORY_CHIP_GRID_CLASS} role="list" aria-busy={isCategoryLoading}>
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
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onRetryLoadCategories}
            className="text-muted-foreground hover:text-foreground focus-visible:ring-ring rounded-md px-1.5 py-0.5 text-xs font-medium underline-offset-2 outline-none hover:underline focus-visible:ring-2"
          >
            다시 시도
          </button>
        </div>
      ) : null}

      {focusedSection && hasRenderableTagGroups ? (
        <div
          className="grid gap-3 pt-1"
          role="region"
          aria-label={`${focusedSection.name} 상세 태그`}
        >
          {focusedSection.tagGroups.map((group) => {
            if (isEmptyGroup(group)) return null;
            const row = renderTagChipRow(group.tags, focusedSection.code);
            if (!row) return null;

            return (
              <div key={`${focusedSection.code}-${group.code}`}>
                {!isDefaultGroup(group) ? (
                  <div className={MAP_FILTER_PANEL_GROUP_TITLE_CLASS}>{group.name}</div>
                ) : null}
                {row}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
