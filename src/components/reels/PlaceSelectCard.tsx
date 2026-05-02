import { Check, Pencil } from "lucide-react";

import { cn } from "@/lib/utils";
import type { SavedPlace } from "@/shared/types/map-home";

type PlaceSelectCardProps = {
  place: SavedPlace;
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
  onEdit: () => void;
};

export function PlaceSelectCard({
  place,
  selected,
  disabled,
  onSelect,
  onEdit,
}: PlaceSelectCardProps) {
  const handleSelect = () => {
    if (!disabled) {
      onSelect();
    }
  };

  return (
    <li>
      <article
        className={cn(
          "flex min-h-[70px] w-full items-center gap-3 rounded-2xl bg-[#f0f0f0] px-5 py-4 text-left transition-colors",
          !disabled && "cursor-pointer active:bg-[#e9e9e9]",
          disabled && "cursor-default",
        )}
        onClick={handleSelect}
        aria-disabled={disabled}
      >
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <span className="text-foreground truncate text-base font-semibold">{place.name}</span>
            <button
              type="button"
              className="text-foreground inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-black/5 focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:outline-none"
              aria-label={`${place.name} 수정`}
              onClick={(event) => {
                event.stopPropagation();
                onEdit();
              }}
            >
              <Pencil className="h-4 w-4" strokeWidth={2.4} />
            </button>
          </div>
          <p className="mt-2 truncate text-[11px] leading-tight text-black/70">{place.address}</p>
        </div>

        {disabled ? (
          <span className="shrink-0 text-xs font-medium whitespace-nowrap text-black/45">
            이미 저장된 장소입니다
          </span>
        ) : (
          <button
            type="button"
            className={cn(
              "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors",
              selected
                ? "border-[#de8d88] bg-[#ffd7d4] text-[#2a1c1c]"
                : "border-black/80 bg-white text-transparent",
            )}
            aria-label={`${place.name} 선택`}
            aria-pressed={selected}
            onClick={(event) => {
              event.stopPropagation();
              handleSelect();
            }}
          >
            {selected ? <Check className="h-3.5 w-3.5" strokeWidth={2.2} /> : null}
          </button>
        )}
      </article>
    </li>
  );
}
