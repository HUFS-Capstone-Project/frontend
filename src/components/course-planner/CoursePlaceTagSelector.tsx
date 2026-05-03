import { CategoryChipGrid, CategoryChipSkeletonList } from "@/components/map/CategoryChipGrid";
import { MAP_FILTER_PANEL_GROUP_TITLE_CLASS } from "@/components/map/chip-style";
import type { MapFilterBarProps } from "@/components/map/filters/map-filter-bar-props";
import { getMapCategoryChipHighlighted } from "@/components/map/filters/map-filter-selection";
import { TagChipGroup } from "@/components/map/TagChipGroup";
import { isDefaultGroup, isEmptyGroup } from "@/features/map/utils/filter-panel-group";
import { MAP_ALL_CATEGORY_FILTER_CHIP } from "@/shared/types/map-home";

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

  const hasRenderableTagGroups =
    focusedSection?.tagGroups.some((group) => {
      if (isEmptyGroup(group)) return false;
      return group.tags.some((tag) => tag.name.trim());
    }) ?? false;

  return (
    <div className="grid gap-2">
      {isCategoryLoading ? (
        <CategoryChipSkeletonList
          keyPrefix="course-category-chip-skeleton"
          itemClassName="bg-muted/40"
        />
      ) : (
        <CategoryChipGrid
          categories={categories}
          isLoading={isCategoryLoading}
          getCategoryLabel={(category) => categoryNameByCode[category] ?? category}
          isHighlighted={(category) => getMapCategoryChipHighlighted(category, highlightCtx)}
          isPanelFocused={(category) => isTagPanelOpen && focusedCategory === category}
          getSelectedTagCount={(category) =>
            category === MAP_ALL_CATEGORY_FILTER_CHIP
              ? 0
              : (selectedTagCountByCategory[category] ?? 0)
          }
          onToggleCategory={onToggleCategory}
        />
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
          className="border-border/70 bg-background grid gap-3 rounded-lg border px-3 py-3"
          role="region"
          aria-label={`${focusedSection.name} 상세 태그`}
        >
          {focusedSection.tagGroups.map((group) => {
            if (isEmptyGroup(group)) return null;
            if (!group.tags.some((tag) => tag.name.trim())) return null;

            return (
              <div key={`${focusedSection.code}-${group.code}`}>
                {!isDefaultGroup(group) ? (
                  <div className={MAP_FILTER_PANEL_GROUP_TITLE_CLASS}>{group.name}</div>
                ) : null}
                <TagChipGroup
                  tags={group.tags}
                  selectedKeys={selectedKeys}
                  onToggleTagKey={(tagKey) => onToggleTagInCategory(focusedSection.code, tagKey)}
                  keyPrefix={focusedSection.code}
                  hideBlankLabels
                />
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
