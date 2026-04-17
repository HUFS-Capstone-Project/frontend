import { RotateCcw } from "lucide-react";

import type { FilterSection, FilterTag } from "@/features/map/constants/filter-sections";
import { MAP_FILTER_SECTION_BY_CATEGORY } from "@/features/map/constants/filter-sections";
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
import { MAP_PRIMARY_CATEGORY_ICON } from "./filters/map-category-icons";
import { MAP_FILTER_LABELS, mapTagFilterRegionAriaLabel } from "./filters/map-filter-labels";
import { TagChip } from "./TagChip";

type FilterPanelProps = {
  isOpen: boolean;
  focusedCategory: MapPrimaryCategory | null;
  selectedTagKeysByCategory: Record<MapPrimaryCategory, string[]>;
  onToggleTagInCategory: (category: MapPrimaryCategory, tagKey: string) => void;
  onResetFocusedCategoryTags: () => void;
  onClose: () => void;
};

function TagChipRow({
  tags,
  selectedKeys,
  onToggleTagKey,
}: {
  tags: FilterTag[];
  selectedKeys: readonly string[];
  onToggleTagKey: (tagKey: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="group">
      {tags.map((tag) => (
        <TagChip
          key={tag.key}
          label={tag.label}
          selected={selectedKeys.includes(tag.key)}
          onClick={() => onToggleTagKey(tag.key)}
        />
      ))}
    </div>
  );
}

function FilterSectionBody({
  section,
  selectedKeys,
  onToggleTagInCategory,
}: {
  section: FilterSection;
  selectedKeys: readonly string[];
  onToggleTagInCategory: (category: MapPrimaryCategory, tagKey: string) => void;
}) {
  const { category } = section;
  const toggle = (tagKey: string) => onToggleTagInCategory(category, tagKey);

  if (section.tagGroups) {
    return (
      <div className="space-y-3">
        {section.leadingTags?.length ? (
          <TagChipRow
            tags={section.leadingTags}
            selectedKeys={selectedKeys}
            onToggleTagKey={toggle}
          />
        ) : null}
        {section.tagGroups.map((group) => (
          <div key={group.title}>
            <div className={MAP_FILTER_PANEL_GROUP_TITLE_CLASS}>{group.title}</div>
            <TagChipRow tags={group.tags} selectedKeys={selectedKeys} onToggleTagKey={toggle} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <TagChipRow tags={section.tags ?? []} selectedKeys={selectedKeys} onToggleTagKey={toggle} />
  );
}

export function FilterPanel({
  isOpen,
  focusedCategory,
  selectedTagKeysByCategory,
  onToggleTagInCategory,
  onResetFocusedCategoryTags,
  onClose,
}: FilterPanelProps) {
  const section = focusedCategory ? MAP_FILTER_SECTION_BY_CATEGORY[focusedCategory] : null;
  const CategoryIcon = section ? MAP_PRIMARY_CATEGORY_ICON[section.category] : null;
  const selectedKeysForSection = section ? selectedTagKeysByCategory[section.category] : [];

  return (
    <section
      className={cn(
        MAP_FILTER_PANEL_BASE_CLASS,
        isOpen ? "max-h-[55dvh] opacity-100" : "pointer-events-none max-h-0 opacity-0",
      )}
      role="region"
      aria-hidden={!isOpen}
      aria-label={section ? mapTagFilterRegionAriaLabel(section.category) : undefined}
    >
      <div className="scrollbar-hide max-h-[55dvh] overflow-y-auto px-3 pt-3 pb-3">
        {section ? (
          <div className={MAP_FILTER_PANEL_SECTION_CLASS}>
            <header className="mb-2.5 flex items-center justify-between gap-2">
              <div className="text-foreground/90 flex min-w-0 flex-1 items-center gap-1.5 text-sm font-semibold">
                {CategoryIcon ? (
                  <CategoryIcon className={MAP_FILTER_PANEL_SECTION_ICON_CLASS} aria-hidden />
                ) : null}
                <span className="truncate">{section.category}</span>
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
