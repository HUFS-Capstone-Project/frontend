import { MoreVertical } from "lucide-react";

import type { PlaceListItemData } from "./place-list-mock-data";

type PlaceListItemProps = {
  place: PlaceListItemData;
  onSelect: (place: PlaceListItemData) => void;
};

export function PlaceListItem({ place, onSelect }: PlaceListItemProps) {
  return (
    <article className="border-border bg-background border-b px-4 py-3">
      <div className="flex items-start gap-3">
        <button type="button" onClick={() => onSelect(place)} className="min-w-0 flex-1 text-left">
          <h3 className="truncate text-sm font-semibold text-[#111111]">{place.name}</h3>
          <p className="mt-1 truncate text-xs text-[#777777]">{place.address}</p>
          {place.memo ? (
            <p className="mt-2 rounded-[5px] bg-[#fde8e8] px-3 py-1.5 text-xs font-medium text-[#4d4d4d]">{place.memo}</p>
          ) : null}
        </button>
        <button type="button" className="touch-target-min -mt-2 flex shrink-0 items-center justify-center text-[#777777]" aria-label={`${place.name} 더보기`}>
          <MoreVertical className="size-4" aria-hidden />
        </button>
      </div>
    </article>
  );
}