import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { CopyableLinkBar } from "@/components/common/CopyableLinkBar";
import { MobileFixedPageShell } from "@/components/common/MobileFixedPageShell";
import { SearchField } from "@/components/common/SearchField";
import { TwoButtonFooter } from "@/components/common/TwoButtonFooter";
import { EditPlaceResultCard } from "@/components/link-place/EditPlaceResultCard";
import { PlaceFlowHeadlines } from "@/components/place-flow/PlaceFlowHeadlines";
import { PillButton } from "@/components/ui/PillButton";
import type { EditPlaceLocationState } from "@/features/place-flow/edit-place-navigation";
import {
  linkCandidatesResumeState,
  resolveEditPlaceReturnTo,
} from "@/features/place-flow/edit-place-navigation";
import { PLACE_FLOW_COPY } from "@/features/place-flow/place-flow-copy";
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
  const [copyLabel, setCopyLabel] = useState("복사");

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
    <MobileFixedPageShell alignWithOverlay>
      <header className="shrink-0 px-6 pt-16">
        <PlaceFlowHeadlines
          titleId="edit-place-title"
          title={PLACE_FLOW_COPY.searchToCorrect.title}
          subtitle={PLACE_FLOW_COPY.searchToCorrect.subtitle}
        />

        <div className="mt-6 space-y-3 pb-5">
          <CopyableLinkBar
            url={LINK_PREVIEW_MOCK}
            copyLabel={copyLabel}
            onCopy={() => {
              void handleCopy();
            }}
          />

          <label className="flex min-h-14 items-center gap-2" htmlFor="edit-place-search">
            <SearchField
              id="edit-place-search"
              className="min-w-0 flex-1"
              value={searchKeyword}
              onChange={(event) => {
                setKeyword(event.target.value);
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
          </label>
        </div>
      </header>

      <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-6 pb-3">
        {trimmedKeyword ? (
          <ul className="border-t border-black/5">
            {searchResults.length === 0 ? (
              <li className="px-1 py-8 text-center">
                <p className="text-foreground text-base font-semibold">
                  {PLACE_FLOW_COPY.emptySearchTitle}
                </p>
                <p className="text-muted-foreground mt-1 text-sm">
                  {PLACE_FLOW_COPY.emptySearchHint}
                </p>
              </li>
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
          <PillButton
            type="button"
            variant="outline"
            className="text-muted-foreground hover:text-muted-foreground"
            onClick={handleBack}
          >
            {PLACE_FLOW_COPY.cancel}
          </PillButton>
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
    </MobileFixedPageShell>
  );
}
