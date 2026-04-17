import { memo, useRef } from "react";

import { usePointerDownOutside } from "@/hooks/use-pointer-down-outside";

import { SearchField } from "../common/SearchField";
import { MAP_SEARCH_INPUT_GLASS_CLASS } from "./chip-style";
import { FilterBar } from "./FilterBar";
import type { MapFilterBarProps } from "./filters/map-filter-bar-props";

export type MapSearchOverlayProps = MapFilterBarProps & {
  placeholder: string;
  keyword: string;
  onKeywordChange: (keyword: string) => void;
};

export const MapSearchOverlay = memo(function MapSearchOverlay({
  placeholder,
  keyword,
  onKeywordChange,
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
          inputClassName={MAP_SEARCH_INPUT_GLASS_CLASS}
        />
      </div>

      <div className="pointer-events-auto">
        <FilterBar
          {...filterBarProps}
          onCloseTagPanel={onCloseTagPanel}
          isTagPanelOpen={isTagPanelOpen}
        />
      </div>
    </div>
  );
});
