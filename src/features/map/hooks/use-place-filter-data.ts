import { useCallback, useMemo } from "react";

import {
  MAP_ALL_CATEGORY_FILTER_CHIP,
  type MapCategoryFilterChip,
  type MapPrimaryCategory,
} from "@/shared/types/map-home";

import type { Category, PlaceFilterData } from "../api/place-taxonomy-types";
import { usePlaceFilterOptionsQuery } from "./use-place-filter-options-query";

const EMPTY_FILTER_CATEGORIES: Category[] = [];

type UsePlaceFilterDataResult = {
  categories: MapCategoryFilterChip[];
  categoryNameByCode: Record<MapPrimaryCategory, string>;
  filterCategories: Category[];
  isInitialLoading: boolean;
  isInitialError: boolean;
  retryLoad: () => Promise<unknown>;
};

export function usePlaceFilterData(
  filterDataOverride?: PlaceFilterData | null,
): UsePlaceFilterDataResult {
  const { data: placeFilterData, isPending, isError, refetch } = usePlaceFilterOptionsQuery();
  const resolvedFilterData = filterDataOverride ?? placeFilterData;

  const hasInitialData = Boolean(resolvedFilterData);

  const filterCategories = useMemo(
    () => resolvedFilterData?.categories ?? EMPTY_FILTER_CATEGORIES,
    [resolvedFilterData],
  );

  const categories = useMemo(
    () => [MAP_ALL_CATEGORY_FILTER_CHIP, ...filterCategories.map((category) => category.code)],
    [filterCategories],
  );

  const categoryNameByCode = useMemo(
    () =>
      filterCategories.reduce(
        (accumulator, category) => {
          accumulator[category.code] = category.name;
          return accumulator;
        },
        {} as Record<MapPrimaryCategory, string>,
      ),
    [filterCategories],
  );

  const retryLoad = useCallback(() => refetch(), [refetch]);

  return {
    categories,
    categoryNameByCode,
    filterCategories,
    isInitialLoading: !filterDataOverride && !hasInitialData && isPending,
    isInitialError: !filterDataOverride && !hasInitialData && isError,
    retryLoad,
  };
}
