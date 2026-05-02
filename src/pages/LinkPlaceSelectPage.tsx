import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { CopyableLinkBar } from "@/components/common/CopyableLinkBar";
import { MobileFixedPageShell } from "@/components/common/MobileFixedPageShell";
import { TwoButtonFooter } from "@/components/common/TwoButtonFooter";
import { PlaceSelectCard } from "@/components/link-place/PlaceSelectCard";
import { PlaceFlowHeadlines } from "@/components/place-flow/PlaceFlowHeadlines";
import { PillButton } from "@/components/ui/PillButton";
import { PLACE_FLOW_COPY } from "@/features/place-flow/place-flow-copy";
import {
  LINK_PREVIEW_MOCK,
  PLACE_RENDER_ORDER,
  SAVED_PLACE_ID,
} from "@/features/place-link/constants";
import { APP_ROUTES } from "@/shared/config/routes";
import { SAVED_PLACE_MOCKS } from "@/shared/mocks/place-mocks";
import { useEditPlaceStore } from "@/store/edit-place-store";
import { useLinkPlaceSelectStore } from "@/store/link-place-select-store";
import { useRegisterRoomStore } from "@/store/register-room-store";
import { useRoomSelectionStore } from "@/store/room-selection-store";

export default function LinkPlaceSelectPage() {
  const navigate = useNavigate();
  const selectedPlaceIds = useLinkPlaceSelectStore((state) => state.selectedPlaceIds);
  const togglePlace = useLinkPlaceSelectStore((state) => state.togglePlace);
  const clearSelection = useLinkPlaceSelectStore((state) => state.clearSelection);
  const editingPlaceId = useEditPlaceStore((state) => state.editingPlaceId);
  const selectedResultId = useEditPlaceStore((state) => state.selectedResultId);
  const setSelectedPlacesForRegister = useRegisterRoomStore((state) => state.setSelectedPlaces);
  const completeRegisterToRoom = useRegisterRoomStore((state) => state.completeRegisterToRoom);
  const selectedRoom = useRoomSelectionStore((state) => state.selectedRoom);
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
  const canConfirm = selectedPlaceIds.length > 0 && selectedRoom != null;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(LINK_PREVIEW_MOCK);
      setCopyLabel("복사됨");
      window.setTimeout(() => setCopyLabel("복사"), 1500);
    } catch {
      setCopyLabel("실패");
      window.setTimeout(() => setCopyLabel("복사"), 1500);
    }
  }, []);

  return (
    <MobileFixedPageShell alignWithOverlay>
      <header className="shrink-0 px-6 pt-16">
        <PlaceFlowHeadlines
          titleId="link-place-select-title"
          title={PLACE_FLOW_COPY.selectFromCandidates.title}
          subtitle={PLACE_FLOW_COPY.selectFromCandidates.subtitle}
        />

        <div className="mt-6 space-y-3 pb-5">
          <CopyableLinkBar
            url={LINK_PREVIEW_MOCK}
            copyLabel={copyLabel}
            onCopy={() => {
              void handleCopy();
            }}
          />
        </div>
      </header>

      <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-6 pb-3">
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
                  navigate(APP_ROUTES.editPlace, {
                    state: {
                      placeId: slotId,
                      placeName: place.name,
                      returnTo: "register-place",
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
              if (!selectedRoom) {
                return;
              }
              setSelectedPlacesForRegister(selectedPlaceIds);
              if (completeRegisterToRoom(selectedRoom.id)) {
                clearSelection();
                navigate(APP_ROUTES.room, {
                  replace: true,
                  state: { showPlacesRegisteredToast: true },
                });
              }
            }}
          >
            확인
          </PillButton>
        }
      />
    </MobileFixedPageShell>
  );
}
