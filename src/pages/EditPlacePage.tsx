import { useCallback, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { CopyableLinkBar } from "@/components/common/CopyableLinkBar";
import { TwoButtonFooter } from "@/components/common/TwoButtonFooter";
import { FullscreenFlowRouteMount } from "@/components/layout/FullscreenFlowRouteMount";
import { EditPlaceResultCard } from "@/components/link-place/EditPlaceResultCard";
import { PlaceFlowCancelPillButton } from "@/components/place-flow/PlaceFlowCancelPillButton";
import { PlaceFlowHeadlines } from "@/components/place-flow/PlaceFlowHeadlines";
import { PlaceFlowSearchEmptyRow } from "@/components/place-flow/PlaceFlowSearchEmptyRow";
import { PlaceFlowSearchFieldRow } from "@/components/place-flow/PlaceFlowSearchFieldRow";
import { PillButton } from "@/components/ui/PillButton";
import type { EditPlaceLocationState } from "@/features/place-flow/edit-place-navigation";
import {
  linkCandidatesResumeState,
  resolveEditPlaceReturnTo,
} from "@/features/place-flow/edit-place-navigation";
import { useCopyFeedback } from "@/features/place-flow/hooks/use-copy-feedback";
import { PLACE_FLOW_COPY } from "@/features/place-flow/place-flow-copy";
import {
  PROMPT_FLOW_BELOW_HEADLINES_CLASS,
  PROMPT_FLOW_HEADER_CLASS,
  PROMPT_FLOW_LIST_TOP_BORDER_CLASS,
  PROMPT_FLOW_SCROLL_BODY_CLASS,
} from "@/features/place-flow/prompt-flow-layout";
import { LINK_PREVIEW_MOCK } from "@/features/place-link/constants";
import { APP_ROUTES, ROOM_APP_PATHS } from "@/shared/config/routes";
import { SAVED_PLACE_MOCKS } from "@/shared/mocks/place-mocks";
import { useEditPlaceStore } from "@/store/edit-place-store";

export default function EditPlacePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = (location.state ?? {}) as EditPlaceLocationState;
  const returnTo = resolveEditPlaceReturnTo(routeState);
  const editingPlaceId = useEditPlaceStore((state) => state.editingPlaceId);
  const searchKeyword = useEditPlaceStore((state) => state.searchKeyword);
  const selectedResultId = useEditPlaceStore((state) => state.selectedResultId);
  const setEditingPlace = useEditPlaceStore((state) => state.setEditingPlace);
  const setKeyword = useEditPlaceStore((state) => state.setKeyword);
  const setSelectedResult = useEditPlaceStore((state) => state.setSelectedResult);
  const reset = useEditPlaceStore((state) => state.reset);
  const { copyLabel, copyText } = useCopyFeedback();

  useEffect(() => {
    const nextPlaceId = routeState.placeId ?? editingPlaceId;
    const nextKeyword = routeState.placeName ?? searchKeyword;

    setEditingPlace(nextPlaceId ?? null);
    setKeyword(nextKeyword);
    setSelectedResult(null);
    // This page is entered with router state, so initialization should only run on entry.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const trimmedKeyword = searchKeyword.trim();
  const canSearch = trimmedKeyword.length > 0;
  const canConfirm = selectedResultId != null;

  const searchResults = useMemo(() => {
    if (!trimmedKeyword) {
      return [];
    }

    return SAVED_PLACE_MOCKS.filter(
      (place) => place.name.includes(trimmedKeyword) || place.address.includes(trimmedKeyword),
    );
  }, [trimmedKeyword]);

  const handleCopyLinkPreview = useCallback(() => {
    void copyText(LINK_PREVIEW_MOCK);
  }, [copyText]);

  const resumeLinkAdd = useCallback(() => {
    const roomId = routeState.linkAddRoomId;
    const linkId = routeState.linkAddLinkId;
    const session = routeState.linkAddDraftSession;
    if (
      typeof roomId === "string" &&
      roomId.length > 0 &&
      linkId != null &&
      String(linkId).length > 0
    ) {
      navigate(ROOM_APP_PATHS.linkCandidates(roomId, linkId), {
        state: linkCandidatesResumeState(session),
      });
      return true;
    }
    return false;
  }, [
    navigate,
    routeState.linkAddDraftSession,
    routeState.linkAddLinkId,
    routeState.linkAddRoomId,
  ]);

  const handleBack = () => {
    reset();
    if (returnTo === "link-add") {
      if (resumeLinkAdd()) {
        return;
      }
    }
    navigate(-1);
  };

  const handleConfirm = () => {
    if (!selectedResultId) {
      return;
    }

    if (returnTo === "back") {
      navigate(-1);
      return;
    }

    if (returnTo === "link-add") {
      if (resumeLinkAdd()) {
        return;
      }
      navigate(-1);
      return;
    }

    navigate(APP_ROUTES.placeRegisterFromLink);
  };

  return (
    <FullscreenFlowRouteMount>
      <header className={PROMPT_FLOW_HEADER_CLASS}>
        <PlaceFlowHeadlines
          titleId="edit-place-title"
          title={PLACE_FLOW_COPY.searchToCorrect.title}
          subtitle={PLACE_FLOW_COPY.searchToCorrect.subtitle}
        />

        <div className={PROMPT_FLOW_BELOW_HEADLINES_CLASS}>
          <CopyableLinkBar
            url={LINK_PREVIEW_MOCK}
            copyLabel={copyLabel}
            onCopy={handleCopyLinkPreview}
          />

          <PlaceFlowSearchFieldRow
            id="edit-place-search"
            value={searchKeyword}
            onChange={(next) => {
              setKeyword(next);
              setSelectedResult(null);
            }}
            placeholder={PLACE_FLOW_COPY.searchPlaceholder}
            searchButtonLabel={PLACE_FLOW_COPY.searchButton}
            onSubmitSearch={() => {
              if (!canSearch) return;
              if (searchResults.length === 1) {
                setSelectedResult(searchResults[0].id);
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
                  selected={selectedResultId === place.id}
                  onSelect={() => setSelectedResult(place.id)}
                />
              ))
            )}
          </ul>
        ) : null}
      </div>

      <TwoButtonFooter
        left={
          <PlaceFlowCancelPillButton onClick={handleBack}>
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
            {PLACE_FLOW_COPY.applyChange}
          </PillButton>
        }
      />
    </FullscreenFlowRouteMount>
  );
}
