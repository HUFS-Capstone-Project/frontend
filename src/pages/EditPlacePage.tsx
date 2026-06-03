import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { FullscreenFlowRouteMount } from "@/components/layout/FullscreenFlowRouteMount";
import { PlaceSearchMapSheet } from "@/components/place-flow/PlaceSearchMapSheet";
import { useOverrideCandidatePlaceMutation } from "@/features/link-analysis";
import type { PlaceCandidate } from "@/features/place-candidates";
import {
  canSubmitPlaceCandidate,
  placeCandidateToSavedPlace,
  usePlaceCandidates,
} from "@/features/place-candidates";
import type { EditPlaceLocationState } from "@/features/place-flow/edit-place-navigation";
import {
  linkCandidatesResumeState,
  resolveEditPlaceReturnTo,
} from "@/features/place-flow/edit-place-navigation";
import { PLACE_FLOW_COPY } from "@/features/place-flow/place-flow-copy";
import { LINK_PREVIEW_MOCK } from "@/features/place-link/constants";
import { resolveGeneralApiErrorMessage } from "@/shared/api/error";
import { APP_ROUTES, ROOM_APP_PATHS } from "@/shared/config/routes";
import { useEditPlaceStore } from "@/store/edit-place-store";

const EMPTY_PLACE_CANDIDATES: PlaceCandidate[] = [];

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

  const placeCandidatesQuery = usePlaceCandidates({
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

  const placeCandidates = placeCandidatesQuery.data ?? EMPTY_PLACE_CANDIDATES;
  const linkPreviewUrl =
    typeof routeState.linkAddOriginalUrl === "string" && routeState.linkAddOriginalUrl.length > 0
      ? routeState.linkAddOriginalUrl
      : LINK_PREVIEW_MOCK;
  const searchResults = useMemo(() => {
    if (!trimmedKeyword) {
      return [];
    }

    if (!isLinkAddCorrection || !isExternalInputSubmitted || placeCandidatesQuery.isFetching) {
      return [];
    }

    return placeCandidates.map(placeCandidateToSavedPlace);
  }, [
    placeCandidates,
    placeCandidatesQuery.isFetching,
    isExternalInputSubmitted,
    isLinkAddCorrection,
    trimmedKeyword,
  ]);
  const selectedExternalPlace =
    isLinkAddCorrection && selectedResultId != null
      ? (placeCandidates.find(
          (place, index) => placeCandidateToSavedPlace(place, index).id === selectedResultId,
        ) ?? null)
      : null;
  const canConfirm =
    selectedResultId != null &&
    (!isLinkAddCorrection ||
      (linkAddCandidateId != null &&
        canSubmitPlaceCandidate(selectedExternalPlace) &&
        !overrideCandidatePlaceMutation.isPending));

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
        if (!canSubmitPlaceCandidate(selectedExternalPlace) || linkAddCandidateId == null) {
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
              phone: selectedExternalPlace.phone,
              placeUrl: selectedExternalPlace.placeUrl,
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
                resolveGeneralApiErrorMessage(error, {
                  fallback: "장소 후보를 수정하지 못했어요. 다시 시도해 주세요.",
                }),
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
      <PlaceSearchMapSheet
        title={PLACE_FLOW_COPY.searchToCorrect.title}
        subtitle={PLACE_FLOW_COPY.searchToCorrect.subtitle}
        linkUrl={linkPreviewUrl}
        initialMode="search"
        keyword={searchKeyword}
        selectedPlaceId={selectedResultId}
        searchResults={searchResults}
        isSearching={placeCandidatesQuery.isFetching}
        isSearchError={placeCandidatesQuery.isError && isExternalInputSubmitted}
        showEmptyResult={!isLinkAddCorrection || isExternalInputSubmitted}
        saveError={overrideError}
        canConfirm={canConfirm}
        confirmLabel={PLACE_FLOW_COPY.applyChange}
        confirmPendingLabel="변경 중..."
        collapsedResetLabel="다시 고르기"
        collapsedConfirmLabel="이 장소로 변경"
        isConfirmPending={overrideCandidatePlaceMutation.isPending}
        onKeywordChange={(next) => {
          setKeyword(next);
          setSelectedResult(null);
          setOverrideError(null);
        }}
        onSubmitSearch={() => {
          if (!canSearch) return;
          if (isLinkAddCorrection) {
            if (submittedExternalKeyword === trimmedKeyword) {
              void placeCandidatesQuery.refetch();
              return;
            }
            setExternalSearchKeyword(trimmedKeyword);
            return;
          }
          if (searchResults.length === 1) {
            setSelectedResult(searchResults[0].id);
          }
        }}
        onSelectPlace={(placeId) => setSelectedResult(placeId)}
        onClearSelectedPlace={() => setSelectedResult(null)}
        onCancel={handleBack}
        onConfirm={handleConfirm}
      />
    </FullscreenFlowRouteMount>
  );
}
