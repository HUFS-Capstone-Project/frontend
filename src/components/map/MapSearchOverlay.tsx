import { memo, useEffect, useMemo, useState } from "react";

import { SearchField } from "@/components/common/SearchField";
import { MapHomePage_SelectOption } from "@/components/filter/MapHomePage_SelectOption";
import type { MapPlaceCategory, SavedPlace } from "@/shared/types/map-home";
import { useFilterStore } from "@/store/filterStore";
import { useUiStore } from "@/store/uiStore";

import { CategoryChips } from "./CategoryChips";

export type MapSearchOverlayProps = {
  places: SavedPlace[];
  categories: MapPlaceCategory[];
  placeholder: string;
  initialCategories?: MapPlaceCategory[];
  onFilteredPlacesChange: (places: SavedPlace[]) => void;
};

export const MapSearchOverlay = memo(function MapSearchOverlay({
  places,
  categories,
  placeholder,
  initialCategories = [],
  onFilteredPlacesChange,
}: MapSearchOverlayProps) {
  const [keyword, setKeyword] = useState("");
  const [selectedCategories, setSelectedCategories] =
    useState<MapPlaceCategory[]>(initialCategories);
  const isFilterOpen = useUiStore((state) => state.isFilterOpen);
  const selectedTags = useFilterStore((state) => state.selectedTags);
  const setFilterOpen = useUiStore((state) => state.setFilterOpen);

  const selectedCategoriesWithEtc = useMemo<MapPlaceCategory[]>(() => {
    if (selectedTags.length === 0) {
      return selectedCategories;
    }

    return selectedCategories.includes("기타")
      ? selectedCategories
      : [...selectedCategories, "기타"];
  }, [selectedCategories, selectedTags.length]);

  const filteredPlaces = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    const hasCategoryFilter = selectedCategoriesWithEtc.length > 0;
    const selectedCategorySet = new Set(selectedCategoriesWithEtc);

    return places.filter((place) => {
      if (hasCategoryFilter && !selectedCategorySet.has(place.category)) return false;
      if (!normalizedKeyword) return true;

      const searchable = `${place.name} ${place.address}`.toLowerCase();
      return searchable.includes(normalizedKeyword);
    });
  }, [keyword, places, selectedCategoriesWithEtc]);

  useEffect(() => {
    onFilteredPlacesChange(filteredPlaces);
  }, [filteredPlaces, onFilteredPlacesChange]);

  const handleCategoryToggle = (category: MapPlaceCategory) => {
    if (category === "기타") {
      setFilterOpen(true);
      return;
    }

    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((item) => item !== category) : [...prev, category],
    );
  };

  return (
    <div className="pointer-events-auto space-y-2.5">
      <SearchField
        name="map-search"
        value={keyword}
        placeholder={placeholder}
        onChange={(event) => setKeyword(event.target.value)}
      />
      <CategoryChips
        categories={categories}
        selectedCategories={selectedCategoriesWithEtc}
        onToggleCategory={handleCategoryToggle}
      />
      <MapHomePage_SelectOption open={isFilterOpen} onOpenChange={setFilterOpen} />
    </div>
  );
});
