import { MapPin } from "lucide-react";

import type { MapSearchSuggestion } from "@/features/map/utils/map-search";
import { cn } from "@/lib/utils";

import { MAP_FILTER_PANEL_BASE_CLASS } from "./chip-style";

type MapSearchSuggestionsProps = {
  suggestions: MapSearchSuggestion[];
  open: boolean;
  className?: string;
  onSelectPlace: (placeId: string) => void;
};

export function MapSearchSuggestions({
  suggestions,
  open,
  className,
  onSelectPlace,
}: MapSearchSuggestionsProps) {
  if (!open) {
    return null;
  }

  return (
    <div className={cn(MAP_FILTER_PANEL_BASE_CLASS, className)}>
      {suggestions.length > 0 ? (
        <ul
          role="list"
          aria-label="검색된 저장 장소"
          className="flex list-none flex-col gap-1 p-1.5"
        >
          {suggestions.map(({ place }) => (
            <li key={place.id} className="min-w-0">
              <button
                type="button"
                className={cn(
                  "hover:bg-muted/55 active:bg-muted/65 focus-visible:ring-ring flex w-full flex-col gap-1 rounded-2xl px-4 py-2.5 text-left transition-colors outline-none",
                  "focus-visible:ring-2 focus-visible:ring-offset-0",
                )}
                onClick={() => onSelectPlace(place.id)}
              >
                <span className="text-foreground line-clamp-1 text-sm font-bold">{place.name}</span>
                <span className="text-muted-foreground flex min-w-0 items-start gap-1.5 text-xs font-medium">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-neutral-400" aria-hidden />
                  <span className="line-clamp-1">{place.address}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="px-5 py-4 text-center" role="status" aria-live="polite">
          <p className="text-muted-foreground text-sm leading-snug font-semibold">
            저장한 장소에서 찾지 못했어요
          </p>
          <p className="text-muted-foreground/85 mt-1 text-xs leading-relaxed font-normal">
            장소 이름·주소·동네 이름을 바꿔 검색해 보세요
          </p>
        </div>
      )}
    </div>
  );
}
