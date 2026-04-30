import { cn } from "@/lib/utils";

import type { PlaceCategoryId, PlaceCategoryTab } from "./place-list-mock-data";

type PlaceListCategoryTabsProps = {
  tabs: PlaceCategoryTab[];
  activeId: PlaceCategoryId;
  regionLabel: string;
  onRegionClick: () => void;
  onSelect: (id: PlaceCategoryId) => void;
};

export function PlaceListCategoryTabs({
  tabs,
  activeId,
  regionLabel,
  onRegionClick,
  onSelect,
}: PlaceListCategoryTabsProps) {
  return (
    <nav
      className="border-border bg-background flex h-11 shrink-0 items-center overflow-x-auto border-b px-4"
      aria-label="장소 목록 필터"
    >
      <button
        type="button"
        onClick={onRegionClick}
        className="touch-target-min flex shrink-0 items-center gap-1 border-r border-[#dedede] pr-3 text-sm font-semibold text-[#111111]"
      >
        <span>{regionLabel}</span>
        <span className="text-xs">⌄</span>
      </button>

      {tabs.map((tab) => {
        const selected = activeId === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelect(tab.id)}
            className={cn(
              "touch-target-min relative shrink-0 px-4 text-sm font-semibold text-[#111111] transition-colors",
              selected && "text-[#5d7df5]",
            )}
          >
            {tab.label}
            {selected ? (
              <span className="absolute inset-x-3 bottom-0 h-[2px] rounded-full bg-[#5d7df5]" />
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}
