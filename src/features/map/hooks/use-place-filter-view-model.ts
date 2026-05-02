import { useMemo } from "react";

import { MAP_ALL_CATEGORY_FILTER_CHIP, type MapPrimaryCategory } from "@/shared/types/map-home";

import type { Category, PlaceFilterData } from "../api/place-taxonomy-types";
import { FALLBACK_PLACE_FILTER_DATA } from "../lib/fallback-place-filter-data";
import { usePlaceFilterData } from "./use-place-filter-data";

type UsePlaceFilterViewModelOptions = {
  filterDataOverride?: PlaceFilterData | null;
};

export function usePlaceFilterViewModel(options?: UsePlaceFilterViewModelOptions) {
  const {
    filterCategories: apiFilterCategories,
    isInitialLoading,
    isInitialError,
    retryLoad,
  } = usePlaceFilterData(options?.filterDataOverride);

  const filterCategories = useMemo<Category[]>(() => {
    if (apiFilterCategories.length > 0) return apiFilterCategories;
    if (isInitialLoading && !isInitialError) return [];
    return FALLBACK_PLACE_FILTER_DATA.categories;
  }, [apiFilterCategories, isInitialError, isInitialLoading]);

  const categories = useMemo(
    () => [MAP_ALL_CATEGORY_FILTER_CHIP, ...filterCategories.map((category) => category.code)],
    [filterCategories],
  );

  const categoryNameByCode = useMemo(
    () =>
      filterCategories.reduce(
        (accumulator, category) => {
          accumulator[category.code as MapPrimaryCategory] = category.name;
          return accumulator;
        },
        {} as Record<MapPrimaryCategory, string>,
      ),
    [filterCategories],
  );

  const isCategoryLoading = filterCategories.length === 0 && isInitialLoading && !isInitialError;
  const isCategoryError = Boolean(isInitialError && apiFilterCategories.length === 0);

  return {
    apiFilterCategories,
    filterCategories,
    categories,
    categoryNameByCode,
    isCategoryLoading,
    isCategoryError,
    isInitialLoading,
    isInitialError,
    retryLoad,
  };
}
