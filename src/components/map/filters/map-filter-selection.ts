import {
  MAP_ALL_CATEGORY_FILTER_CHIP,
  type MapCategoryFilterChip,
  type MapPrimaryCategory,
} from "@/shared/types/map-home";

type ChipHighlightContext = {
  /** 상세 태그가 1개 이상 선택된 카테고리(훅의 activeCategories) */
  activeCategories: readonly MapPrimaryCategory[];
  focusedCategory: MapPrimaryCategory | null;
};

/**
 * 카테고리 칩의 시각적 "선택" 상태.
 * - 「전체」: 아무 카테고리에도 태그가 없고, 태그 패널 포커스도 없을 때
 * - 주 카테고리: 해당 카테고리에 태그가 하나 이상 있을 때
 */
export function getMapCategoryChipHighlighted(
  chip: MapCategoryFilterChip,
  { activeCategories, focusedCategory }: ChipHighlightContext,
): boolean {
  if (chip === MAP_ALL_CATEGORY_FILTER_CHIP) {
    return activeCategories.length === 0 && focusedCategory === null;
  }
  return activeCategories.includes(chip);
}
