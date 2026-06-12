import { MapPin } from "lucide-react";
import { useRef } from "react";

import { renderMapPrimaryCategoryIcon } from "@/components/map/filters/map-category-icons";
import type { MapSearchSuggestion } from "@/features/map/utils/map-search";
import { useInfiniteScrollTrigger } from "@/hooks/use-infinite-scroll-trigger";
import { cn } from "@/lib/utils";
import type { SavedPlace } from "@/shared/types/map-home";

import { MAP_FILTER_PANEL_BASE_CLASS } from "./chip-style";

type MapSearchSuggestionsProps = {
  suggestions: MapSearchSuggestion[];
  open: boolean;
  className?: string;
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  onLoadMore?: () => void;
  onSelectPlace: (placeId: string) => void;
};

export function MapSearchSuggestions({
  suggestions,
  open,
  className,
  isFetchingNextPage = false,
  hasNextPage = false,
  onLoadMore,
  onSelectPlace,
}: MapSearchSuggestionsProps) {
  const scrollRef = useRef<HTMLUListElement>(null);
  const loadMoreRef = useInfiniteScrollTrigger<HTMLLIElement>({
    enabled: open && hasNextPage && !isFetchingNextPage,
    rootRef: scrollRef,
    onLoadMore: () => {
      onLoadMore?.();
    },
  });

  if (!open) {
    return null;
  }

  return (
    <div className={cn(MAP_FILTER_PANEL_BASE_CLASS, className)}>
      {suggestions.length > 0 ? (
        <ul
          ref={scrollRef}
          role="list"
          aria-label="검색된 저장 장소"
          className="scrollbar-hide flex max-h-[21rem] list-none flex-col gap-1 overflow-y-auto p-1.5"
        >
          {suggestions.map(({ place }) => {
            const categoryLabel = place.categoryName?.trim() || place.category.trim();
            const tagLabel = getPrimaryTagLabel(place);

            return (
              <li key={place.id} className="min-w-0">
                <button
                  type="button"
                  className={cn(
                    "hover:bg-muted/55 active:bg-muted/65 focus-visible:ring-ring flex w-full flex-col gap-1 rounded-2xl px-4 py-2.5 text-left transition-colors outline-none",
                    "focus-visible:ring-2 focus-visible:ring-offset-0",
                  )}
                  onClick={() => onSelectPlace(place.id)}
                >
                  <span className="flex min-w-0 items-center gap-1.5">
                    <span className="text-foreground min-w-0 truncate text-sm font-bold">
                      {place.name}
                    </span>
                    {categoryLabel ? (
                      <span className="inline-flex min-w-0 shrink-0 items-center gap-1.5">
                        <span
                          className="text-muted-foreground border-border/55 bg-muted/45 inline-flex size-5 shrink-0 items-center justify-center rounded-full"
                          title={categoryLabel}
                          aria-label={`카테고리 ${categoryLabel}`}
                        >
                          {renderMapPrimaryCategoryIcon(
                            place.category || categoryLabel,
                            "size-3 shrink-0 opacity-100",
                          )}
                        </span>
                        {tagLabel ? (
                          <span className="text-muted-foreground max-w-24 truncate text-xs font-medium">
                            {tagLabel}
                          </span>
                        ) : null}
                      </span>
                    ) : null}
                  </span>
                  <span className="text-muted-foreground flex min-w-0 items-start gap-1.5 text-xs font-medium">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-neutral-400" aria-hidden />
                    <span className="line-clamp-1">{place.address}</span>
                  </span>
                </button>
              </li>
            );
          })}
          <li ref={loadMoreRef} className="h-1" aria-hidden />
          {isFetchingNextPage ? (
            <li className="text-muted-foreground px-4 py-3 text-center text-xs font-semibold">
              Loading...
            </li>
          ) : null}
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

function getPrimaryTagLabel(place: Pick<SavedPlace, "tagKeys" | "tagNames">): string {
  const tagName = place.tagNames?.find((name) => name.trim().length > 0)?.trim();
  if (tagName) {
    return tagName;
  }

  const tagKey = place.tagKeys?.find((key) => key.trim().length > 0)?.trim();
  if (!tagKey) {
    return "";
  }

  const segments = tagKey.split(/[-_/]/).map((segment) => segment.trim());
  return segments.at(-1) || tagKey;
}
