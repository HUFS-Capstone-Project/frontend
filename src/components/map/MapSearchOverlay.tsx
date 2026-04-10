import { memo, useEffect, useMemo, useState } from "react";

import { SearchField } from "@/components/common/SearchField";
import type { MapPlaceCategory, SavedPlace } from "@/shared/types/map-home";

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

  const filteredPlaces = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    const hasCategoryFilter = selectedCategories.length > 0;
    const selectedCategorySet = new Set(selectedCategories);

    return places.filter((place) => {
      if (hasCategoryFilter && !selectedCategorySet.has(place.category)) return false;
      if (!normalizedKeyword) return true;

      const searchable = `${place.name} ${place.address}`.toLowerCase();
      return searchable.includes(normalizedKeyword);
    });
  }, [keyword, places, selectedCategories]);

  useEffect(() => {
    onFilteredPlacesChange(filteredPlaces);
  }, [filteredPlaces, onFilteredPlacesChange]);

  const handleCategoryToggle = (category: MapPlaceCategory) => {
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
        selectedCategories={selectedCategories}
        onToggleCategory={handleCategoryToggle}
      />
    </div>
  );
});
