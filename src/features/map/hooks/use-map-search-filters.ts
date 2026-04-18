import { useCallback, useMemo, useState } from "react";

import { MAP_ALL_TAG_KEY_BY_CATEGORY } from "@/features/map/constants/filter-sections";
import type {
  MapCategoryFilterChip,
  MapPrimaryCategory,
  SavedPlace,
} from "@/shared/types/map-home";

type SelectedTagKeysByCategory = Record<MapPrimaryCategory, string[]>;
type SelectedTagCountByCategory = Record<MapPrimaryCategory, number>;

type UseMapSearchFiltersOptions = {
  places: SavedPlace[];
  initialFocusedCategory?: MapPrimaryCategory | null;
};

type UseMapSearchFiltersResult = {
  keyword: string;
  setKeyword: (value: string) => void;
  /** 상세 태그가 1개 이상인 카테고리만 (칩 활성 표시용) */
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

const PRIMARY_CATEGORIES: MapPrimaryCategory[] = ["맛집", "카페", "놀거리"];

const EMPTY_SELECTED_TAG_KEYS_BY_CATEGORY: SelectedTagKeysByCategory = {
  맛집: [],
  카페: [],
  놀거리: [],
};

export function useMapSearchFilters({
  places,
  initialFocusedCategory = null,
}: UseMapSearchFiltersOptions): UseMapSearchFiltersResult {
  const [keyword, setKeyword] = useState("");
  const [focusedCategory, setFocusedCategory] = useState<MapPrimaryCategory | null>(
    initialFocusedCategory,
  );
  const [selectedCategories, setSelectedCategories] = useState<MapPrimaryCategory[]>(
    initialFocusedCategory ? [initialFocusedCategory] : [],
  );
  const [selectedTagKeysByCategory, setSelectedTagKeysByCategory] =
    useState<SelectedTagKeysByCategory>(EMPTY_SELECTED_TAG_KEYS_BY_CATEGORY);

  const toggleCategory = useCallback(
    (category: MapCategoryFilterChip) => {
      if (category === "전체") {
        setSelectedTagKeysByCategory({ ...EMPTY_SELECTED_TAG_KEYS_BY_CATEGORY });
        setSelectedCategories([]);
        setFocusedCategory(null);
        return;
      }

      setSelectedCategories((previous) => {
        const isSelected = previous.includes(category);

        if (!isSelected) {
          setFocusedCategory(category);
          return [...previous, category];
        }

        if (focusedCategory !== category) {
          setFocusedCategory(category);
          return previous;
        }

        setFocusedCategory(null);

        return previous;
      });
    },
    [focusedCategory],
  );

  const closeTagPanel = useCallback(() => {
    setFocusedCategory(null);
  }, []);

  const toggleTagInCategory = useCallback((category: MapPrimaryCategory, tagKey: string) => {
    const allTagKey = MAP_ALL_TAG_KEY_BY_CATEGORY[category];

    setSelectedTagKeysByCategory((previous) => {
      const currentTagKeys = previous[category];
      const hasCurrentTag = currentTagKeys.includes(tagKey);

      let nextTagKeys: string[];

      if (tagKey === allTagKey) {
        nextTagKeys = hasCurrentTag ? [] : [allTagKey];
      } else {
        const withoutAll = currentTagKeys.filter((current) => current !== allTagKey);
        nextTagKeys = hasCurrentTag
          ? withoutAll.filter((current) => current !== tagKey)
          : [...withoutAll, tagKey];
      }

      return {
        ...previous,
        [category]: nextTagKeys,
      };
    });
  }, []);

  const resetFocusedCategoryTags = useCallback(() => {
    if (!focusedCategory) {
      return;
    }

    setSelectedTagKeysByCategory((previous) => ({
      ...previous,
      [focusedCategory]: [],
    }));
  }, [focusedCategory]);

  const selectedTagCountByCategory = useMemo(
    () => ({
      맛집: selectedTagKeysByCategory.맛집.length,
      카페: selectedTagKeysByCategory.카페.length,
      놀거리: selectedTagKeysByCategory.놀거리.length,
    }),
    [selectedTagKeysByCategory],
  );

  const totalSelectedTagCount = useMemo(
    () =>
      selectedTagCountByCategory.맛집 +
      selectedTagCountByCategory.카페 +
      selectedTagCountByCategory.놀거리,
    [selectedTagCountByCategory],
  );

  // 카테고리 chip active 조건: "상세 태그가 1개 이상 선택된 카테고리"
  const activeCategories = useMemo(
    () => selectedCategories.filter((category) => selectedTagKeysByCategory[category].length > 0),
    [selectedCategories, selectedTagKeysByCategory],
  );

  const selectedCategorySet = useMemo(() => new Set(activeCategories), [activeCategories]);

  const filteredPlaces = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return places.filter((place) => {
      const placeCategory = place.category as MapPrimaryCategory;
      const hasSelectedCategoryFilter = activeCategories.length > 0;

      if (hasSelectedCategoryFilter && !selectedCategorySet.has(placeCategory)) {
        return false;
      }

      if (hasSelectedCategoryFilter && PRIMARY_CATEGORIES.includes(placeCategory)) {
        const categoryTagKeys = selectedTagKeysByCategory[placeCategory];

        if (categoryTagKeys.length > 0) {
          const allTagKey = MAP_ALL_TAG_KEY_BY_CATEGORY[placeCategory];

          if (!categoryTagKeys.includes(allTagKey)) {
            if (!place.tagKeys || place.tagKeys.length === 0) {
              return false;
            }

            const hasMatchedTag = categoryTagKeys.some((tagKey) => place.tagKeys?.includes(tagKey));
            if (!hasMatchedTag) {
              return false;
            }
          }
        }
      }

      if (!normalizedKeyword) {
        return true;
      }

      const searchableText = `${place.name} ${place.address}`.toLowerCase();
      return searchableText.includes(normalizedKeyword);
    });
  }, [activeCategories, keyword, places, selectedCategorySet, selectedTagKeysByCategory]);

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
