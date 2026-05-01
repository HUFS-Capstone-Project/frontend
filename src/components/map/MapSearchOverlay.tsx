import { memo, useRef } from "react";

import type { MapSearchSuggestion } from "@/features/map/utils/map-search";
import { usePointerDownOutside } from "@/hooks/use-pointer-down-outside";

import { SearchField } from "../common/SearchField";
import { MAP_SEARCH_INPUT_GLASS_CLASS } from "./chip-style";
import { FilterBar } from "./FilterBar";
import type { MapFilterBarProps } from "./filters/map-filter-bar-props";
import { MapSearchSuggestions } from "./MapSearchSuggestions";

export type MapSearchOverlayProps = MapFilterBarProps & {
  placeholder: string;
  keyword: string;
  searchSuggestions: MapSearchSuggestion[];
  isSearchSuggestionsOpen: boolean;
  onKeywordChange: (keyword: string) => void;
  onSubmitSearch: () => void;
  onSelectSearchPlace: (placeId: string) => void;
};

export const MapSearchOverlay = memo(function MapSearchOverlay({
  placeholder,
  keyword,
  searchSuggestions,
  isSearchSuggestionsOpen,
  onKeywordChange,
  onSubmitSearch,
  onSelectSearchPlace,
  onCloseTagPanel,
  isTagPanelOpen,
  ...filterBarProps
}: MapSearchOverlayProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  usePointerDownOutside(containerRef, isTagPanelOpen, onCloseTagPanel);

  return (
    <div ref={containerRef} className="pointer-events-none space-y-2.5">
      <div className="pointer-events-auto">
        <SearchField
          name="map-search"
          value={keyword}
          placeholder={placeholder}
          onChange={(event) => onKeywordChange(event.target.value)}
          onSubmitSearch={onSubmitSearch}
          inputClassName={MAP_SEARCH_INPUT_GLASS_CLASS}
        />
        <MapSearchSuggestions
          open={isSearchSuggestionsOpen}
          suggestions={searchSuggestions}
          onSelectPlace={onSelectSearchPlace}
        />
      </div>

      <div className={isSearchSuggestionsOpen ? "hidden" : "pointer-events-auto"}>
        <FilterBar
          {...filterBarProps}
          onCloseTagPanel={onCloseTagPanel}
          isTagPanelOpen={isTagPanelOpen}
        />
      </div>
    </div>
  );
});
