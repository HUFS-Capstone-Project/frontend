import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { CopyableLinkBar } from "@/components/common/CopyableLinkBar";
import { TwoButtonFooter } from "@/components/common/TwoButtonFooter";
import { FullscreenFlowRouteMount } from "@/components/layout/FullscreenFlowRouteMount";
import { EditPlaceResultCard } from "@/components/link-place/EditPlaceResultCard";
import { PlaceFlowCancelPillButton } from "@/components/place-flow/PlaceFlowCancelPillButton";
import { PlaceFlowHeadlines } from "@/components/place-flow/PlaceFlowHeadlines";
import { PlaceFlowSearchEmptyRow } from "@/components/place-flow/PlaceFlowSearchEmptyRow";
import { PlaceFlowSearchFieldRow } from "@/components/place-flow/PlaceFlowSearchFieldRow";
import { BrandMarkerLoader } from "@/components/ui/BrandMarkerLoader";
import { PillButton } from "@/components/ui/PillButton";
import { useOverrideCandidatePlaceMutation } from "@/features/link-analysis";
import type { ExternalPlaceCandidate } from "@/features/place-candidates";
import { useExternalPlaceCandidates } from "@/features/place-candidates";
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
import { isApiError } from "@/shared/api/axios";
import { APP_ROUTES, ROOM_APP_PATHS } from "@/shared/config/routes";
import { SAVED_PLACE_MOCKS } from "@/shared/mocks/place-mocks";
import { useEditPlaceStore } from "@/store/edit-place-store";

const EMPTY_EXTERNAL_CANDIDATES: ExternalPlaceCandidate[] = [];

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
  const [overrideError, setOverrideError] = useState<string | null>(null);
  const [externalSearchKeyword, setExternalSearchKeyword] = useState("");

  const linkAddAnalysisRequestId = Number(
    routeState.linkAddAnalysisRequestId ?? routeState.linkAddLinkId,
  );
  const linkAddCandidateId =
    typeof routeState.linkAddCandidateId === "number" ? routeState.linkAddCandidateId : null;
  const isLinkAddCorrection =
    returnTo === "link-add" &&
    typeof routeState.linkAddRoomId === "string" &&
    routeState.linkAddRoomId.length > 0 &&
    Number.isFinite(linkAddAnalysisRequestId);

  useEffect(() => {
    const nextPlaceId = routeState.placeId ?? editingPlaceId;
    const nextKeyword = routeState.placeName ?? searchKeyword;

    setEditingPlace(nextPlaceId ?? null);
    setKeyword(nextKeyword);
    setExternalSearchKeyword(nextKeyword.trim());
    setSelectedResult(null);
    setOverrideError(null);
    // Reinitialize when a new edit navigation enters the same /places/edit route.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);

  const trimmedKeyword = searchKeyword.trim();
  const submittedExternalKeyword = externalSearchKeyword.trim();
  const canSearch = trimmedKeyword.length > 0;
  const isExternalInputSubmitted =
    !isLinkAddCorrection || submittedExternalKeyword === trimmedKeyword;

  const externalPlaceCandidatesQuery = useExternalPlaceCandidates({
    roomId: isLinkAddCorrection ? (routeState.linkAddRoomId ?? null) : null,
    params: {
      keyword: submittedExternalKeyword,
      limit: 10,
    },
    enabled: isLinkAddCorrection && submittedExternalKeyword.length > 0,
  });
  const overrideCandidatePlaceMutation = useOverrideCandidatePlaceMutation({
    roomId: isLinkAddCorrection ? (routeState.linkAddRoomId ?? null) : null,
    analysisRequestId: isLinkAddCorrection ? linkAddAnalysisRequestId : null,
  });

  const externalCandidates = externalPlaceCandidatesQuery.data ?? EMPTY_EXTERNAL_CANDIDATES;
  const searchResults = useMemo(() => {
    if (!trimmedKeyword) {
      return [];
    }

    if (isLinkAddCorrection) {
      if (!isExternalInputSubmitted || externalPlaceCandidatesQuery.isFetching) {
        return [];
      }

      return externalCandidates.map(externalCandidateToSavedPlace);
    }

    return SAVED_PLACE_MOCKS.filter(
      (place) => place.name.includes(trimmedKeyword) || place.address.includes(trimmedKeyword),
    );
  }, [
    externalCandidates,
    externalPlaceCandidatesQuery.isFetching,
    isExternalInputSubmitted,
    isLinkAddCorrection,
    trimmedKeyword,
  ]);
  const selectedExternalPlace =
    isLinkAddCorrection && selectedResultId != null
      ? (externalCandidates.find((place) => place.kakaoPlaceId === selectedResultId) ?? null)
      : null;
  const canConfirm =
    selectedResultId != null &&
    (!isLinkAddCorrection ||
      (linkAddCandidateId != null &&
        selectedExternalPlace != null &&
        !overrideCandidatePlaceMutation.isPending));

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
      if (isLinkAddCorrection) {
        if (!selectedExternalPlace || linkAddCandidateId == null) {
          return;
        }

        setOverrideError(null);
        overrideCandidatePlaceMutation.mutate(
          {
            candidateId: linkAddCandidateId,
            payload: {
              kakaoPlaceId: selectedExternalPlace.kakaoPlaceId,
              name: selectedExternalPlace.name,
              address: selectedExternalPlace.address,
              roadAddress: selectedExternalPlace.roadAddress,
              latitude: selectedExternalPlace.latitude,
              longitude: selectedExternalPlace.longitude,
              categoryName: selectedExternalPlace.categoryName,
              categoryGroupCode: selectedExternalPlace.categoryGroupCode,
              categoryGroupName: selectedExternalPlace.categoryGroupName,
              phone: selectedExternalPlace.phone,
              placeUrl: selectedExternalPlace.placeUrl,
              sourceKeyword: trimmedKeyword,
            },
          },
          {
            onSuccess: () => {
              reset();
              if (!resumeLinkAdd()) {
                navigate(-1);
              }
            },
            onError: (error) => {
              setOverrideError(
                isApiError(error)
                  ? error.message
                  : "장소 후보를 수정하지 못했어요. 다시 시도해 주세요.",
              );
            },
          },
        );
        return;
      }

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
              setOverrideError(null);
            }}
            placeholder={PLACE_FLOW_COPY.searchPlaceholder}
            searchButtonLabel={PLACE_FLOW_COPY.searchButton}
            onSubmitSearch={() => {
              if (!canSearch) return;
              if (isLinkAddCorrection) {
                if (submittedExternalKeyword === trimmedKeyword) {
                  void externalPlaceCandidatesQuery.refetch();
                  return;
                }
                setExternalSearchKeyword(trimmedKeyword);
                return;
              }
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
            {searchResults.length === 0 &&
            !externalPlaceCandidatesQuery.isFetching &&
            isExternalInputSubmitted ? (
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
        {externalPlaceCandidatesQuery.isFetching ? (
          <div className="flex justify-center px-5 py-8">
            <BrandMarkerLoader />
          </div>
        ) : null}
        {overrideError ? (
          <p className="px-5 pt-3 text-sm font-medium text-[var(--brand-coral-solid)]" role="alert">
            {overrideError}
          </p>
        ) : null}
        {externalPlaceCandidatesQuery.isError ? (
          <p className="px-5 pt-3 text-sm font-medium text-[var(--brand-coral-solid)]" role="alert">
            검색 결과를 불러오지 못했어요. 다시 시도해 주세요.
          </p>
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
            {overrideCandidatePlaceMutation.isPending ? "변경 중..." : PLACE_FLOW_COPY.applyChange}
          </PillButton>
        }
      />
    </FullscreenFlowRouteMount>
  );
}

function externalCandidateToSavedPlace(place: ExternalPlaceCandidate) {
  return {
    id: place.kakaoPlaceId,
    name: place.name,
    category: place.categoryGroupName ?? place.categoryName ?? "장소",
    address: place.roadAddress ?? place.address ?? "",
    latitude: place.latitude,
    longitude: place.longitude,
  };
}
