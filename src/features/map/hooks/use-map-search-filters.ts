import { useCallback, useMemo, useState } from "react";

import type { Category } from "@/features/map/api/place-taxonomy-types";
import { includesMapSearchText, normalizeMapSearchText } from "@/features/map/utils/map-search";
import {
  MAP_ALL_CATEGORY_FILTER_CHIP,
  type MapCategoryFilterChip,
  type MapPrimaryCategory,
  type SavedPlace,
} from "@/shared/types/map-home";

type SelectedTagKeysByCategory = Record<MapPrimaryCategory, string[]>;
type SelectedTagCountByCategory = Record<MapPrimaryCategory, number>;

type UseMapSearchFiltersOptions = {
  places: SavedPlace[];
  filterCategories: Category[];
  initialFocusedCategory?: MapPrimaryCategory | null;
  /**
   * true면 태그 UI 없이 카테고리 칩만 사용한다.
   * 선택한 주 카테고리로만 필터하며(place.category), 세부 태그는 무시한다.
   */
  categoriesOnly?: boolean;
};

type UseMapSearchFiltersResult = {
  keyword: string;
  setKeyword: (value: string) => void;
  /** 상세 태그가 1개 이상인 카테고리만(칩 “활성” 표시용) */
  activeCategories: MapPrimaryCategory[];
  focusedCategory: MapPrimaryCategory | null;
  toggleCategory: (category: MapCategoryFilterChip) => void;
  closeTagPanel: () => void;
  isTagPanelOpen: boolean;
  selectedTagKeysByCategory: SelectedTagKeysByCategory;
  selectedTagCountByCategory: SelectedTagCountByCategory;
  totalSelectedTagCount: number;
  toggleTagInCategory: (category: MapPrimaryCategory, tagKey: string) => void;
  resetFocusedCategoryTags: () => void;
  filteredPlaces: SavedPlace[];
};

function buildEmptySelectedTagKeysByCategory(
  categories: readonly MapPrimaryCategory[],
): SelectedTagKeysByCategory {
  return categories.reduce((accumulator, category) => {
    accumulator[category] = [];
    return accumulator;
  }, {} as SelectedTagKeysByCategory);
}

function normalizeSelectedTagKeysByCategory(
  previous: SelectedTagKeysByCategory,
  categories: readonly MapPrimaryCategory[],
): SelectedTagKeysByCategory {
  const next = buildEmptySelectedTagKeysByCategory(categories);
  const categorySet = new Set(categories);

  for (const [category, tagKeys] of Object.entries(previous)) {
    if (!categorySet.has(category)) {
      continue;
    }
    next[category] = tagKeys;
  }

  return next;
}

export function useMapSearchFilters({
  places,
  filterCategories,
  initialFocusedCategory = null,
  categoriesOnly = false,
}: UseMapSearchFiltersOptions): UseMapSearchFiltersResult {
  const [keyword, setKeyword] = useState("");
  const [focusedCategoryState, setFocusedCategoryState] = useState<MapPrimaryCategory | null>(null);
  const [selectedCategoriesState, setSelectedCategoriesState] = useState<MapPrimaryCategory[]>([]);
  const [selectedTagKeysByCategoryState, setSelectedTagKeysByCategoryState] =
    useState<SelectedTagKeysByCategory>({});
  const [isInitialFocusDismissed, setIsInitialFocusDismissed] = useState(false);

  const primaryCategories = useMemo(
    () => filterCategories.map((category) => category.code),
    [filterCategories],
  );
  const categoryCodeSet = useMemo(() => new Set(primaryCategories), [primaryCategories]);

  const allTagKeyByCategory = useMemo(
    () =>
      filterCategories.reduce(
        (accumulator, category) => {
          const allTag = category.tagGroups
            .flatMap((group) => group.tags)
            .find((tag) => tag.code === "ALL");

          accumulator[category.code] = allTag?.code;
          return accumulator;
        },
        {} as Record<MapPrimaryCategory, string | undefined>,
      ),
    [filterCategories],
  );

  const focusedCategory = useMemo(() => {
    if (categoriesOnly) {
      return null;
    }

    if (focusedCategoryState && categoryCodeSet.has(focusedCategoryState)) {
      return focusedCategoryState;
    }

    if (
      !isInitialFocusDismissed &&
      initialFocusedCategory &&
      categoryCodeSet.has(initialFocusedCategory)
    ) {
      return initialFocusedCategory;
    }

    return null;
  }, [
    categoriesOnly,
    categoryCodeSet,
    focusedCategoryState,
    initialFocusedCategory,
    isInitialFocusDismissed,
  ]);

  const selectedCategories = useMemo(() => {
    const normalized = selectedCategoriesState.filter((category) => categoryCodeSet.has(category));

    if (normalized.length > 0) {
      return normalized;
    }

    if (
      !categoriesOnly &&
      !isInitialFocusDismissed &&
      initialFocusedCategory &&
      categoryCodeSet.has(initialFocusedCategory)
    ) {
      return [initialFocusedCategory];
    }

    return normalized;
  }, [
    categoriesOnly,
    categoryCodeSet,
    initialFocusedCategory,
    isInitialFocusDismissed,
    selectedCategoriesState,
  ]);

  const selectedTagKeysByCategory = useMemo(
    () => normalizeSelectedTagKeysByCategory(selectedTagKeysByCategoryState, primaryCategories),
    [primaryCategories, selectedTagKeysByCategoryState],
  );

  const toggleCategory = useCallback(
    (category: MapCategoryFilterChip) => {
      setIsInitialFocusDismissed(true);

      if (category === MAP_ALL_CATEGORY_FILTER_CHIP) {
        setSelectedTagKeysByCategoryState(buildEmptySelectedTagKeysByCategory(primaryCategories));
        setSelectedCategoriesState([]);
        setFocusedCategoryState(null);
        return;
      }

      if (!categoryCodeSet.has(category)) {
        return;
      }

      if (categoriesOnly) {
        setFocusedCategoryState(null);
        setSelectedCategoriesState((previous) => {
          const normalized = previous.filter((current) => categoryCodeSet.has(current));
          const isSelected = normalized.includes(category);
          if (!isSelected) {
            return [...normalized, category];
          }
          return normalized.filter((current) => current !== category);
        });
        return;
      }

      setSelectedCategoriesState((previous) => {
        const normalized = previous.filter((current) => categoryCodeSet.has(current));
        const isSelected = normalized.includes(category);

        if (!isSelected) {
          setFocusedCategoryState(category);
          return [...normalized, category];
        }

        if (focusedCategory !== category) {
          setFocusedCategoryState(category);
          return normalized;
        }

        setFocusedCategoryState(null);
        return normalized;
      });
    },
    [categoriesOnly, categoryCodeSet, focusedCategory, primaryCategories],
  );

  const closeTagPanel = useCallback(() => {
    setIsInitialFocusDismissed(true);
    setFocusedCategoryState(null);
  }, []);

  const toggleTagInCategory = useCallback(
    (category: MapPrimaryCategory, tagKey: string) => {
      setSelectedTagKeysByCategoryState((previous) => {
        const currentTagKeys = previous[category] ?? [];
        const hasCurrentTag = currentTagKeys.includes(tagKey);
        const allTagKey = allTagKeyByCategory[category];
        let nextTagKeys: string[];

        if (allTagKey && tagKey === allTagKey) {
          nextTagKeys = hasCurrentTag ? [] : [allTagKey];
        } else {
          const withoutAll = allTagKey
            ? currentTagKeys.filter((current) => current !== allTagKey)
            : currentTagKeys;
          nextTagKeys = hasCurrentTag
            ? withoutAll.filter((current) => current !== tagKey)
            : [...withoutAll, tagKey];
        }

        const next = {
          ...previous,
          [category]: nextTagKeys,
        };

        const isEveryCategoryAllSelected =
          primaryCategories.length > 0 &&
          primaryCategories.every((primaryCategory) => {
            const primaryAllTagKey = allTagKeyByCategory[primaryCategory];
            return Boolean(primaryAllTagKey && next[primaryCategory]?.includes(primaryAllTagKey));
          });

        if (isEveryCategoryAllSelected) {
          setIsInitialFocusDismissed(true);
          setSelectedCategoriesState([]);
          setFocusedCategoryState(null);
          return buildEmptySelectedTagKeysByCategory(primaryCategories);
        }

        return next;
      });
    },
    [allTagKeyByCategory, primaryCategories],
  );

  const resetFocusedCategoryTags = useCallback(() => {
    if (!focusedCategory) {
      return;
    }

    setSelectedTagKeysByCategoryState((previous) => ({
      ...previous,
      [focusedCategory]: [],
    }));
  }, [focusedCategory]);

  const selectedTagCountByCategory = useMemo(
    () =>
      primaryCategories.reduce((accumulator, category) => {
        accumulator[category] = selectedTagKeysByCategory[category]?.length ?? 0;
        return accumulator;
      }, {} as SelectedTagCountByCategory),
    [primaryCategories, selectedTagKeysByCategory],
  );

  const totalSelectedTagCount = useMemo(
    () =>
      Object.values(selectedTagCountByCategory).reduce(
        (accumulator, selectedCount) => accumulator + selectedCount,
        0,
      ),
    [selectedTagCountByCategory],
  );

  // 카테고리 chip active: 기본은 “해당 카테고리에 태그 1개 이상”; categoriesOnly는 선택한 주 카테고리만
  const activeCategories = useMemo(
    () =>
      categoriesOnly
        ? selectedCategories
        : selectedCategories.filter(
            (category) => (selectedTagKeysByCategory[category] ?? []).length > 0,
          ),
    [categoriesOnly, selectedCategories, selectedTagKeysByCategory],
  );

  const selectedCategorySet = useMemo(() => new Set(activeCategories), [activeCategories]);

  const filteredPlaces = useMemo(() => {
    const normalizedKeyword = normalizeMapSearchText(keyword);
    const hasSelectedCategoryFilter = activeCategories.length > 0;

    return places.filter((place) => {
      const placeCategoryCode = place.category as MapPrimaryCategory;

      if (hasSelectedCategoryFilter) {
        if (
          !categoryCodeSet.has(placeCategoryCode) ||
          !selectedCategorySet.has(placeCategoryCode)
        ) {
          return false;
        }

        if (!categoriesOnly) {
          const categoryTagKeys = selectedTagKeysByCategory[placeCategoryCode] ?? [];
          if (categoryTagKeys.length > 0) {
            const allTagKey = allTagKeyByCategory[placeCategoryCode];
            const hasAllTagSelected = Boolean(allTagKey && categoryTagKeys.includes(allTagKey));

            if (!hasAllTagSelected) {
              if (!place.tagKeys || place.tagKeys.length === 0) {
                return false;
              }

              const hasMatchedTag = categoryTagKeys.some((tagKey) =>
                place.tagKeys?.includes(tagKey),
              );
              if (!hasMatchedTag) {
                return false;
              }
            }
          }
        }
      }

      if (!normalizedKeyword) {
        return true;
      }

      return includesMapSearchText(`${place.name} ${place.address}`, keyword);
    });
  }, [
    activeCategories.length,
    allTagKeyByCategory,
    categoriesOnly,
    categoryCodeSet,
    keyword,
    places,
    selectedCategorySet,
    selectedTagKeysByCategory,
  ]);

  return {
    keyword,
    setKeyword,
    activeCategories,
    focusedCategory,
    toggleCategory,
    closeTagPanel,
    isTagPanelOpen: focusedCategory !== null,
    selectedTagKeysByCategory,
    selectedTagCountByCategory,
    totalSelectedTagCount,
    toggleTagInCategory,
    resetFocusedCategoryTags,
    filteredPlaces,
  };
}
