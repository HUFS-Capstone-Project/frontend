import { PillButton } from "@/components/ui/PillButton";
import type { MockPlaceCandidate } from "@/features/room/link-add";
import { cn } from "@/lib/utils";

export type PlaceSelectionScreenProps = {
  roomName: string;
  originalUrl: string;
  places: MockPlaceCandidate[];
  selectedPlaceId: string | null;
  onSelectPlace: (placeId: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
};

export function PlaceSelectionScreen({
  roomName,
  originalUrl,
  places,
  selectedPlaceId,
  onSelectPlace,
  onCancel,
  onConfirm,
}: PlaceSelectionScreenProps) {
  const canConfirm = selectedPlaceId != null;

  return (
    <div className="scrollbar-hide flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pt-16 pb-8">
      <div className="space-y-1">
        <h2 className="text-foreground text-xl leading-tight font-bold">{roomName}</h2>
        <p className="text-foreground text-xl leading-tight font-bold">(Mock) 장소 후보 선택</p>
      </div>

      <div className="mt-6 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm text-zinc-700">
        <p className="truncate">{originalUrl}</p>
      </div>

      <p className="text-foreground mt-7 text-sm leading-6">
        장소 후보 mock 화면입니다. 어떤 장소를 선택할지 확인해 주세요.
      </p>

      <ul className="mt-4 space-y-2">
        {places.map((place) => {
          const checked = selectedPlaceId === place.id;
          return (
            <li key={place.id}>
              <button
                type="button"
                className={cn(
                  "flex w-full items-center justify-between rounded-full bg-zinc-100 px-4 py-3 text-left text-sm",
                  checked && "bg-brand-coral-soft",
                )}
                onClick={() => onSelectPlace(place.id)}
              >
                <span className="text-foreground">{place.name}</span>
                <span
                  className={cn(
                    "inline-flex h-5 w-5 rounded-full border border-zinc-400",
                    checked && "border-brand-coral bg-brand-coral",
                  )}
                />
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-auto grid grid-cols-2 gap-2.5 pt-6">
        <PillButton type="button" variant="outline" onClick={onCancel}>
          취소
        </PillButton>
        <PillButton
          type="button"
          variant={canConfirm ? "onboarding" : "onboardingMuted"}
          disabled={!canConfirm}
          onClick={onConfirm}
        >
          확인
        </PillButton>
      </div>
    </div>
  );
}
