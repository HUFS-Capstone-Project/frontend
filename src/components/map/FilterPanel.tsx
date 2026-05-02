import { RotateCcw } from "lucide-react";

import type { Category } from "@/features/map/api/place-taxonomy-types";
import { isDefaultGroup, isEmptyGroup } from "@/features/map/utils/filter-panel-group";
import { cn } from "@/lib/utils";
import type { MapPrimaryCategory } from "@/shared/types/map-home";

import {
  MAP_FILTER_PANEL_BASE_CLASS,
  MAP_FILTER_PANEL_GROUP_TITLE_CLASS,
  MAP_FILTER_PANEL_HEADER_ACTION_CLASS,
  MAP_FILTER_PANEL_RESET_CLASS,
  MAP_FILTER_PANEL_SECTION_CLASS,
  MAP_FILTER_PANEL_SECTION_ICON_CLASS,
} from "./chip-style";
import { renderMapPrimaryCategoryIcon } from "./filters/map-category-icons";
import { MAP_FILTER_LABELS, mapTagFilterRegionAriaLabel } from "./filters/map-filter-labels";
import { TagChipGroup } from "./TagChipGroup";

type FilterPanelProps = {
  isOpen: boolean;
  focusedCategory: MapPrimaryCategory | null;
  filterCategories: Category[];
  selectedTagKeysByCategory: Record<MapPrimaryCategory, string[]>;
  onToggleTagInCategory: (category: MapPrimaryCategory, tagKey: string) => void;
  onResetFocusedCategoryTags: () => void;
  onClose: () => void;
};

function FilterSectionBody({
  section,
  selectedKeys,
  onToggleTagInCategory,
}: {
  section: Category;
  selectedKeys: readonly string[];
  onToggleTagInCategory: (category: MapPrimaryCategory, tagKey: string) => void;
}) {
  const toggle = (tagKey: string) => onToggleTagInCategory(section.code, tagKey);

  return (
    <div className="space-y-3">
      {section.tagGroups.map((group) => {
        if (isEmptyGroup(group)) {
          return null;
        }

        return (
          <div key={`${section.code}-${group.code}`}>
            {!isDefaultGroup(group) ? (
              <div className={MAP_FILTER_PANEL_GROUP_TITLE_CLASS}>{group.name}</div>
            ) : null}
            <TagChipGroup tags={group.tags} selectedKeys={selectedKeys} onToggleTagKey={toggle} />
          </div>
        );
      })}
    </div>
  );
}

export function FilterPanel({
  isOpen,
  focusedCategory,
  filterCategories,
  selectedTagKeysByCategory,
  onToggleTagInCategory,
  onResetFocusedCategoryTags,
  onClose,
}: FilterPanelProps) {
  const section = focusedCategory
    ? (filterCategories.find((category) => category.code === focusedCategory) ?? null)
    : null;
  const selectedKeysForSection = section ? (selectedTagKeysByCategory[section.code] ?? []) : [];

  return (
    <section
      className={cn(
        MAP_FILTER_PANEL_BASE_CLASS,
        isOpen ? "max-h-[55dvh] opacity-100" : "pointer-events-none max-h-0 opacity-0",
      )}
      role="region"
      aria-hidden={!isOpen}
      aria-label={section ? mapTagFilterRegionAriaLabel(section.name) : undefined}
    >
      <div className="scrollbar-hide max-h-[55dvh] overflow-y-auto px-3 pt-3 pb-3">
        {section ? (
          <div className={MAP_FILTER_PANEL_SECTION_CLASS}>
            <header className="mb-2.5 flex items-center justify-between gap-2">
              <div className="text-foreground/90 flex min-w-0 flex-1 items-center gap-1.5 text-sm font-semibold">
                {section
                  ? renderMapPrimaryCategoryIcon(section.name, MAP_FILTER_PANEL_SECTION_ICON_CLASS)
                  : null}
                <span className="truncate">{section.name}</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className={cn(MAP_FILTER_PANEL_HEADER_ACTION_CLASS, "shrink-0")}
                aria-label={MAP_FILTER_LABELS.collapsePanelDetail}
              >
                {MAP_FILTER_LABELS.collapsePanel}
              </button>
            </header>

            <FilterSectionBody
              section={section}
              selectedKeys={selectedKeysForSection}
              onToggleTagInCategory={onToggleTagInCategory}
            />
          </div>
        ) : null}

        <footer className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={onResetFocusedCategoryTags}
            className={MAP_FILTER_PANEL_RESET_CLASS}
            aria-label={MAP_FILTER_LABELS.resetFocusedTagsAria}
          >
            <span>{MAP_FILTER_LABELS.resetFocusedTags}</span>
            <RotateCcw className="size-3.5" aria-hidden />
          </button>
        </footer>
      </div>
    </section>
  );
}
