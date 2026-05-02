import { MapPin, Pencil } from "lucide-react";

import { RoundSelectionCheck } from "@/components/ui/RoundSelectionCheck";
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
          "flex min-h-[70px] w-full items-center gap-3 border-b border-black/5 bg-white px-5 py-4 text-left transition-colors",
          !disabled && "cursor-pointer active:bg-gray-50",
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
          <p className="mt-2 flex min-w-0 items-center gap-1.5 text-[11px] leading-tight">
            <MapPin className="size-4 shrink-0 text-neutral-400" aria-hidden />
            <span className="min-w-0 truncate text-black/70">{place.address}</span>
          </p>
        </div>

        {disabled ? (
          <span className="shrink-0 text-xs font-medium whitespace-nowrap text-black/45">
            이미 저장된 장소입니다
          </span>
        ) : (
          <button
            type="button"
            className="inline-flex shrink-0"
            aria-label={`${place.name} 선택`}
            aria-pressed={selected}
            onClick={(event) => {
              event.stopPropagation();
              handleSelect();
            }}
          >
            <RoundSelectionCheck selected={selected} />
          </button>
        )}
      </article>
    </li>
  );
}
