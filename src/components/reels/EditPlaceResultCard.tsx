import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import type { SavedPlace } from "@/shared/types/map-home";

type EditPlaceResultCardProps = {
  place: SavedPlace;
  selected: boolean;
  onSelect: () => void;
};

export function EditPlaceResultCard({ place, selected, onSelect }: EditPlaceResultCardProps) {
  return (
    <li>
      <button
        type="button"
        className="flex min-h-[84px] w-full items-center gap-3 border-b border-black/5 px-5 py-4 text-left transition-colors active:bg-gray-50"
        onClick={onSelect}
        aria-pressed={selected}
      >
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center">
          <img src="/assets/map-marker.svg" alt="" className="h-9 w-9 object-contain" />
        </span>

        <span className="min-w-0 flex-1">
          <span className="text-foreground block truncate text-base font-semibold">
            {place.name}
          </span>
          <span className="mt-1 block truncate text-[11px] text-black/70">{place.address}</span>
        </span>

        <span
          className={cn(
            "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors",
            selected
              ? "border-[#de8d88] bg-[#ffd7d4] text-[#2a1c1c]"
              : "border-black/80 bg-white text-transparent",
          )}
          aria-hidden
        >
          {selected ? <Check className="h-3.5 w-3.5" strokeWidth={2.2} /> : null}
        </span>
      </button>
    </li>
  );
}
