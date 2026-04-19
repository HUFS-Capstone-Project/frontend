import { useMemo } from "react";

import {
  MAP_ALL_CATEGORY_FILTER_CHIP,
  type MapCategoryFilterChip,
  type MapPrimaryCategory,
} from "@/shared/types/map-home";

import type { Category } from "../api/place-taxonomy-types";
import { usePlaceFilterOptionsQuery } from "./use-place-filter-options-query";

const EMPTY_FILTER_CATEGORIES: Category[] = [];

type UsePlaceFilterDataResult = {
  categories: MapCategoryFilterChip[];
  categoryNameByCode: Record<MapPrimaryCategory, string>;
  filterCategories: Category[];
};

export function usePlaceFilterData(): UsePlaceFilterDataResult {
  const { data: placeFilterData } = usePlaceFilterOptionsQuery();

  const filterCategories = useMemo(
    () => placeFilterData?.categories ?? EMPTY_FILTER_CATEGORIES,
    [placeFilterData],
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

  return {
    categories,
    categoryNameByCode,
    filterCategories,
  };
}
