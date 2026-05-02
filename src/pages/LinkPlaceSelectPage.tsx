import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { CopyableLinkBar } from "@/components/common/CopyableLinkBar";
import { TwoButtonFooter } from "@/components/common/TwoButtonFooter";
import { FullscreenFlowRouteMount } from "@/components/layout/FullscreenFlowRouteMount";
import { PlaceSelectCard } from "@/components/link-place/PlaceSelectCard";
import { PlaceFlowCancelPillButton } from "@/components/place-flow/PlaceFlowCancelPillButton";
import { PlaceFlowHeadlines } from "@/components/place-flow/PlaceFlowHeadlines";
import { PillButton } from "@/components/ui/PillButton";
import { useCopyFeedback } from "@/features/place-flow/hooks/use-copy-feedback";
import { PLACE_FLOW_COPY } from "@/features/place-flow/place-flow-copy";
import {
  PROMPT_FLOW_BELOW_HEADLINES_CLASS,
  PROMPT_FLOW_HEADER_CLASS,
  PROMPT_FLOW_LIST_TOP_BORDER_CLASS,
  PROMPT_FLOW_SCROLL_BODY_CLASS,
} from "@/features/place-flow/prompt-flow-layout";
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
  const { copyLabel, copyText } = useCopyFeedback();

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

  return (
    <FullscreenFlowRouteMount>
      <header className={PROMPT_FLOW_HEADER_CLASS}>
        <PlaceFlowHeadlines
          titleId="link-place-select-title"
          title={PLACE_FLOW_COPY.selectFromCandidates.title}
          subtitle={PLACE_FLOW_COPY.selectFromCandidates.subtitle}
        />

        <div className={PROMPT_FLOW_BELOW_HEADLINES_CLASS}>
          <CopyableLinkBar
            url={LINK_PREVIEW_MOCK}
            copyLabel={copyLabel}
            onCopy={() => {
              void copyText(LINK_PREVIEW_MOCK);
            }}
          />
        </div>
      </header>

      <div className={PROMPT_FLOW_SCROLL_BODY_CLASS}>
        <ul className={PROMPT_FLOW_LIST_TOP_BORDER_CLASS}>
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
          <PlaceFlowCancelPillButton onClick={clearSelection}>
            {PLACE_FLOW_COPY.cancel}
          </PlaceFlowCancelPillButton>
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
    </FullscreenFlowRouteMount>
  );
}
