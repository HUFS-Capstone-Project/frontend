import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { CopyableLinkBar } from "@/components/common/CopyableLinkBar";
import { MobileFixedPageShell } from "@/components/common/MobileFixedPageShell";
import { TwoButtonFooter } from "@/components/common/TwoButtonFooter";
import { PlaceSelectCard } from "@/components/reels/PlaceSelectCard";
import { PillButton } from "@/components/ui/PillButton";
import {
  PLACE_RENDER_ORDER,
  REELS_LINK_MOCK,
  SAVED_PLACE_ID,
} from "@/features/reels-registration/constants";
import { SAVED_PLACE_MOCKS } from "@/shared/mocks/place-mocks";
import { useEditPlaceStore } from "@/store/edit-place-store";
import { useReelsPlaceSelectStore } from "@/store/reels-place-select-store";
import { useRegisterRoomStore } from "@/store/register-room-store";

export default function ReelsPlaceSelectPage() {
  const navigate = useNavigate();
  const selectedPlaceIds = useReelsPlaceSelectStore((state) => state.selectedPlaceIds);
  const togglePlace = useReelsPlaceSelectStore((state) => state.togglePlace);
  const clearSelection = useReelsPlaceSelectStore((state) => state.clearSelection);
  const editingPlaceId = useEditPlaceStore((state) => state.editingPlaceId);
  const selectedResultId = useEditPlaceStore((state) => state.selectedResultId);
  const setSelectedPlacesForRegister = useRegisterRoomStore((state) => state.setSelectedPlaces);
  const [copyLabel, setCopyLabel] = useState("복사");

  const placeRows = useMemo(
    () =>
      PLACE_RENDER_ORDER.map((placeId) => {
        const originalPlace = SAVED_PLACE_MOCKS.find((place) => place.id === placeId);
        const editedPlace =
          editingPlaceId === placeId && selectedResultId
            ? SAVED_PLACE_MOCKS.find((place) => place.id === selectedResultId)
            : null;

        const place = editedPlace ?? originalPlace;

        return place ? { slotId: placeId, place } : null;
      }).filter((row) => row != null),
    [editingPlaceId, selectedResultId],
  );
  const canConfirm = selectedPlaceIds.length > 0;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(REELS_LINK_MOCK);
      setCopyLabel("복사됨");
      window.setTimeout(() => setCopyLabel("복사"), 1500);
    } catch {
      setCopyLabel("실패");
      window.setTimeout(() => setCopyLabel("복사"), 1500);
    }
  }, []);

  return (
    <MobileFixedPageShell>
      <header className="shrink-0 px-5 pt-40">
        <section className="space-y-3 pb-5" aria-labelledby="reels-place-select-title">
          <div className="space-y-1">
            <h1
              id="reels-place-select-title"
              className="text-foreground text-xl leading-tight font-bold"
            >
              장소가 인식되었습니다.
            </h1>
            <p className="text-foreground text-xl leading-tight font-bold">
              어느 장소를 등록하시겠습니까?
            </p>
          </div>

          <CopyableLinkBar
            url={REELS_LINK_MOCK}
            copyLabel={copyLabel}
            onCopy={() => {
              void handleCopy();
            }}
          />
        </section>
      </header>

      <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-5 pb-3">
        <ul className="border-t border-black/5">
          {placeRows.map(({ slotId, place }) => {
            const disabled = slotId === SAVED_PLACE_ID;
            return (
              <PlaceSelectCard
                key={slotId}
                place={place}
                selected={selectedPlaceIds.includes(slotId)}
                disabled={disabled}
                onSelect={() => togglePlace(slotId)}
                onEdit={() =>
                  navigate("/edit_place", {
                    state: {
                      placeId: slotId,
                      placeName: place.name,
                    },
                  })
                }
              />
            );
          })}
        </ul>
      </div>

      <TwoButtonFooter
        left={
          <PillButton
            type="button"
            variant="outline"
            className="text-muted-foreground hover:text-muted-foreground"
            onClick={clearSelection}
          >
            취소
          </PillButton>
        }
        right={
          <PillButton
            type="button"
            variant={canConfirm ? "onboarding" : "onboardingMuted"}
            disabled={!canConfirm}
            onClick={() => {
              setSelectedPlacesForRegister(selectedPlaceIds);
              navigate("/register-select-room", {
                state: {
                  selectedPlaceIds,
                  selectedPlaceCount: selectedPlaceIds.length,
                },
              });
            }}
          >
            확인
          </PillButton>
        }
      />
    </MobileFixedPageShell>
  );
}
