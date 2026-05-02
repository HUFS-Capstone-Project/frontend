import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { CopyableLinkBar } from "@/components/common/CopyableLinkBar";
import { TwoButtonFooter } from "@/components/common/TwoButtonFooter";
import { FullscreenFlowRouteMount } from "@/components/layout/FullscreenFlowRouteMount";
import { EditPlaceResultCard } from "@/components/link-place/EditPlaceResultCard";
import { PlaceFlowCancelPillButton } from "@/components/place-flow/PlaceFlowCancelPillButton";
import { PlaceFlowHeadlines } from "@/components/place-flow/PlaceFlowHeadlines";
import { PlaceFlowSearchEmptyRow } from "@/components/place-flow/PlaceFlowSearchEmptyRow";
import { PlaceFlowSearchFieldRow } from "@/components/place-flow/PlaceFlowSearchFieldRow";
import { PillButton } from "@/components/ui/PillButton";
import { useCopyFeedback } from "@/features/place-flow/hooks/use-copy-feedback";
import { PLACE_FLOW_COPY } from "@/features/place-flow/place-flow-copy";
import {
  PROMPT_FLOW_BELOW_HEADLINES_CLASS,
  PROMPT_FLOW_HEADER_CLASS,
  PROMPT_FLOW_LIST_TOP_BORDER_CLASS,
  PROMPT_FLOW_SCROLL_BODY_CLASS,
} from "@/features/place-flow/prompt-flow-layout";
import { LINK_PREVIEW_MOCK } from "@/features/place-link/constants";
import { APP_ROUTES } from "@/shared/config/routes";
import { SAVED_PLACE_MOCKS } from "@/shared/mocks/place-mocks";
import { useInpersonPlaceStore } from "@/store/inperson-place-store";
import { useRegisterRoomStore } from "@/store/register-room-store";

export default function RoomPlaceSearchPage() {
  const navigate = useNavigate();
  const { roomId: roomIdParam = "" } = useParams();
  const registerContextRoomId = roomIdParam.trim();
  const keyword = useInpersonPlaceStore((state) => state.keyword);
  const selectedPlaceId = useInpersonPlaceStore((state) => state.selectedPlaceId);
  const setKeyword = useInpersonPlaceStore((state) => state.setKeyword);
  const setSelectedPlace = useInpersonPlaceStore((state) => state.setSelectedPlace);
  const reset = useInpersonPlaceStore((state) => state.reset);
  const setSelectedPlacesForRegister = useRegisterRoomStore((state) => state.setSelectedPlaces);
  const completeRegisterToRoom = useRegisterRoomStore((state) => state.completeRegisterToRoom);
  const { copyLabel, copyText } = useCopyFeedback();

  useEffect(() => {
    reset();
  }, [reset]);

  useEffect(() => {
    if (registerContextRoomId.length === 0) {
      navigate(APP_ROUTES.room, { replace: true });
    }
  }, [navigate, registerContextRoomId]);

  const trimmedKeyword = keyword.trim();
  const canSearch = trimmedKeyword.length > 0;
  const canConfirm = selectedPlaceId !== null && registerContextRoomId.length > 0;

  const searchResults = useMemo(() => {
    if (!trimmedKeyword) {
      return [];
    }

    return SAVED_PLACE_MOCKS.filter(
      (place) => place.name.includes(trimmedKeyword) || place.address.includes(trimmedKeyword),
    );
  }, [trimmedKeyword]);

  const handleCopyLinkPreview = () => {
    void copyText(LINK_PREVIEW_MOCK);
  };

  const handleCancel = () => {
    reset();
    navigate(-1);
  };

  const handleConfirm = () => {
    if (!selectedPlaceId || !registerContextRoomId) {
      return;
    }

    setSelectedPlacesForRegister([selectedPlaceId]);
    if (completeRegisterToRoom(registerContextRoomId)) {
      reset();
      navigate(APP_ROUTES.room, {
        replace: true,
        state: { showPlacesRegisteredToast: true },
      });
    }
  };

  if (registerContextRoomId.length === 0) {
    return null;
  }

  return (
    <FullscreenFlowRouteMount>
      <header className={PROMPT_FLOW_HEADER_CLASS}>
        <PlaceFlowHeadlines
          titleId="inperson-place-title"
          title={PLACE_FLOW_COPY.notFoundTitle}
          subtitle={PLACE_FLOW_COPY.notFoundHint}
        />

        <div className={PROMPT_FLOW_BELOW_HEADLINES_CLASS}>
          <CopyableLinkBar
            url={LINK_PREVIEW_MOCK}
            copyLabel={copyLabel}
            onCopy={handleCopyLinkPreview}
          />

          <PlaceFlowSearchFieldRow
            id="inperson-place-search"
            value={keyword}
            onChange={(next) => {
              setKeyword(next);
              setSelectedPlace(null);
            }}
            placeholder={PLACE_FLOW_COPY.searchPlaceholder}
            searchButtonLabel={PLACE_FLOW_COPY.searchButton}
            onSubmitSearch={() => {
              if (!canSearch) return;
              if (searchResults.length === 1) {
                setSelectedPlace(searchResults[0].id);
              }
            }}
            searchButtonDisabled={!canSearch}
          />
        </div>
      </header>

      <div className={PROMPT_FLOW_SCROLL_BODY_CLASS}>
        {trimmedKeyword ? (
          <ul className={PROMPT_FLOW_LIST_TOP_BORDER_CLASS}>
            {searchResults.length === 0 ? (
              <PlaceFlowSearchEmptyRow />
            ) : (
              searchResults.map((place) => (
                <EditPlaceResultCard
                  key={place.id}
                  place={place}
                  selected={selectedPlaceId === place.id}
                  onSelect={() => setSelectedPlace(place.id)}
                />
              ))
            )}
          </ul>
        ) : null}
      </div>

      <TwoButtonFooter
        left={
          <PlaceFlowCancelPillButton onClick={handleCancel}>
            {PLACE_FLOW_COPY.cancel}
          </PlaceFlowCancelPillButton>
        }
        right={
          <PillButton
            type="button"
            variant={canConfirm ? "onboarding" : "onboardingMuted"}
            disabled={!canConfirm}
            onClick={handleConfirm}
          >
            확인
          </PillButton>
        }
      />
    </FullscreenFlowRouteMount>
  );
}
