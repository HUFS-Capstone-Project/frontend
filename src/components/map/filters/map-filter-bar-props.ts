import type { Category } from "@/features/map/api/place-taxonomy-types";
import type { MapCategoryFilterChip, MapPrimaryCategory } from "@/shared/types/map-home";

/** 지도 검색 오버레이 내부에서 사용하는 FilterBar/Panel의 렌더링 상태 Props */
export type MapFilterBarProps = {
  categories: MapCategoryFilterChip[];
  categoryNameByCode: Record<MapPrimaryCategory, string>;
  filterCategories: Category[];
  isCategoryLoading: boolean;
  isCategoryError: boolean;
  onRetryLoadCategories: () => void;
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
