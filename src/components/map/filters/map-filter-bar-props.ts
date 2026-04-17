import type { MapCategoryFilterChip, MapPrimaryCategory } from "@/shared/types/map-home";

/** 태그 패널·칩 줄에만 필요한 “선택 상태” props (검색어와 분리) */
export type MapFilterBarProps = {
  categories: MapCategoryFilterChip[];
  /** 태그가 하나 이상 걸린 카테고리만 (칩 하이라이트용) */
  activeCategories: MapPrimaryCategory[];
  focusedCategory: MapPrimaryCategory | null;
  onToggleCategory: (category: MapCategoryFilterChip) => void;
  isTagPanelOpen: boolean;
  selectedTagKeysByCategory: Record<MapPrimaryCategory, string[]>;
  selectedTagCountByCategory: Record<MapPrimaryCategory, number>;
  onToggleTagInCategory: (category: MapPrimaryCategory, tagKey: string) => void;
  onResetFocusedCategoryTags: () => void;
  onCloseTagPanel: () => void;
};
