import { cn } from "@/lib/utils";

import type { SavedPlaceCategory } from "./mypage-mock-data";

export type SavedPlaceFilter = "all" | SavedPlaceCategory;

const filters: { id: SavedPlaceFilter; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "food", label: "맛집" },
  { id: "cafe", label: "카페" },
  { id: "activity", label: "놀거리" },
  { id: "etc", label: "기타" },
];

type SavedPlaceCategoryTabsProps = {
  selected: SavedPlaceFilter;
  onSelect: (filter: SavedPlaceFilter) => void;
};

export function SavedPlaceCategoryTabs({ selected, onSelect }: SavedPlaceCategoryTabsProps) {
  return (
    <div
      className="scrollbar-hide flex gap-2 overflow-x-auto px-5 py-3"
      role="tablist"
      aria-label="장소 종류 필터"
    >
      {filters.map((filter) => {
        const active = selected === filter.id;
        return (
          <button
            key={filter.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onSelect(filter.id)}
            className={cn(
              "h-8 shrink-0 rounded-full border px-4 text-xs font-semibold transition-colors",
              active
                ? "border-[#e6e6e6] bg-[#e6e6e6] text-[#111111]"
                : "border-[#e6e6e6] bg-white text-[#222222] active:bg-[#f7f7f7]",
            )}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
