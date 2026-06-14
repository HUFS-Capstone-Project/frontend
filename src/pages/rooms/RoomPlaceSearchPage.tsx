import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

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
import { useSaveManualPlaceMutation } from "@/features/link-analysis";
import {
  canSubmitPlaceCandidate,
  placeCandidateToSavedPlace,
  usePlaceCandidates,
} from "@/features/place-candidates";
import { PLACE_FLOW_COPY } from "@/features/place-flow/place-flow-copy";
import {
  PROMPT_FLOW_BELOW_HEADLINES_CLASS,
  PROMPT_FLOW_HEADER_CLASS,
  PROMPT_FLOW_LIST_TOP_BORDER_CLASS,
  PROMPT_FLOW_SCROLL_BODY_CLASS,
} from "@/features/place-flow/prompt-flow-layout";
import { useInfiniteScrollTrigger } from "@/hooks/use-infinite-scroll-trigger";
import { resolveGeneralApiErrorMessage } from "@/shared/api/error";
import { APP_ROUTES } from "@/shared/config/routes";
import { useInpersonPlaceStore } from "@/store/inperson-place-store";

type RoomPlaceSearchLocationState = {
  linkAddAnalysisRequestId?: number;
  linkAddOriginalUrl?: string;
};

export default function RoomPlaceSearchPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { roomId: roomIdParam = "" } = useParams();
  const routeState = (location.state ?? null) as RoomPlaceSearchLocationState | null;
  const registerContextRoomId = roomIdParam.trim();
  const keyword = useInpersonPlaceStore((state) => state.keyword);
  const selectedPlaceId = useInpersonPlaceStore((state) => state.selectedPlaceId);
  const setKeyword = useInpersonPlaceStore((state) => state.setKeyword);
  const setSelectedPlace = useInpersonPlaceStore((state) => state.setSelectedPlace);
  const reset = useInpersonPlaceStore((state) => state.reset);
  const [saveError, setSaveError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const analysisRequestId =
    typeof routeState?.linkAddAnalysisRequestId === "number"
      ? routeState.linkAddAnalysisRequestId
      : null;
  const linkPreviewUrl =
    typeof routeState?.linkAddOriginalUrl === "string" && routeState.linkAddOriginalUrl.length > 0
      ? routeState.linkAddOriginalUrl
      : null;
  const trimmedKeyword = keyword.trim();
  const canSearch = trimmedKeyword.length > 0;

  const placeCandidatesQuery = usePlaceCandidates({
    roomId: registerContextRoomId || null,
    params: {
      keyword,
      limit: 15,
    },
    enabled: registerContextRoomId.length > 0 && canSearch,
  });
  const saveManualPlaceMutation = useSaveManualPlaceMutation({
    roomId: registerContextRoomId || null,
    analysisRequestId,
  });

  useEffect(() => {
    reset();
  }, [reset]);

  useEffect(() => {
    if (registerContextRoomId.length === 0) {
      navigate(APP_ROUTES.room, { replace: true });
    }
  }, [navigate, registerContextRoomId]);

  const placeCandidates = useMemo(
    () => (placeCandidatesQuery.data?.pages ?? []).flatMap((page) => page.items),
    [placeCandidatesQuery.data?.pages],
  );
  const loadMoreCandidatesRef = useInfiniteScrollTrigger({
    enabled:
      trimmedKeyword.length > 0 &&
      placeCandidatesQuery.hasNextPage &&
      !placeCandidatesQuery.isFetching &&
      !placeCandidatesQuery.isFetchingNextPage,
    rootRef: scrollRef,
    onLoadMore: () => {
      void placeCandidatesQuery.fetchNextPage();
    },
  });
  const searchResults = useMemo(() => {
    if (!trimmedKeyword) {
      return [];
    }

    return placeCandidates.map(placeCandidateToSavedPlace);
  }, [placeCandidates, trimmedKeyword]);
  const selectedExternalPlace =
    selectedPlaceId == null
      ? null
      : (placeCandidates.find(
          (place, index) => placeCandidateToSavedPlace(place, index).id === selectedPlaceId,
        ) ?? null);
  const canConfirm =
    selectedPlaceId !== null &&
    registerContextRoomId.length > 0 &&
    analysisRequestId != null &&
    canSubmitPlaceCandidate(selectedExternalPlace) &&
    !saveManualPlaceMutation.isPending;

  const handleCancel = () => {
    reset();
    navigate(-1);
  };

  const handleConfirm = () => {
    if (!selectedPlaceId || !registerContextRoomId || analysisRequestId == null) {
      return;
    }

    if (!canSubmitPlaceCandidate(selectedExternalPlace)) {
      return;
    }

    setSaveError(null);
    saveManualPlaceMutation.mutate(
      {
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
      {
        onSuccess: () => {
          reset();
          navigate(APP_ROUTES.room, {
            replace: true,
            state: { showPlacesRegisteredToast: true },
          });
        },
        onError: (error) => {
          setSaveError(
            resolveGeneralApiErrorMessage(error, {
              fallback: "장소 저장에 실패했어요. 다시 시도해 주세요",
            }),
          );
        },
      },
    );
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
          {linkPreviewUrl ? <CopyableLinkBar url={linkPreviewUrl} /> : null}

          <PlaceFlowSearchFieldRow
            id="inperson-place-search"
            value={keyword}
            onChange={(next) => {
              setKeyword(next);
              setSelectedPlace(null);
              setSaveError(null);
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

      <div ref={scrollRef} className={PROMPT_FLOW_SCROLL_BODY_CLASS}>
        {trimmedKeyword ? (
          <ul className={PROMPT_FLOW_LIST_TOP_BORDER_CLASS}>
            {searchResults.length === 0 && !placeCandidatesQuery.isFetching ? (
              <PlaceFlowSearchEmptyRow />
            ) : (
              searchResults.map((place) => (
                <EditPlaceResultCard
                  key={place.id}
                  place={place}
                  selected={selectedPlaceId === place.id}
                  onSelect={() => {
                    const externalPlace = placeCandidates.find(
                      (item, index) => placeCandidateToSavedPlace(item, index).id === place.id,
                    );
                    if (externalPlace && !externalPlace.selectable) {
                      return;
                    }
                    setSelectedPlace(place.id);
                  }}
                />
              ))
            )}
            <div ref={loadMoreCandidatesRef} className="h-1" aria-hidden />
          </ul>
        ) : null}
        {placeCandidatesQuery.isFetchingNextPage ? (
          <div className="flex justify-center px-5 py-8">
            <BrandMarkerLoader />
          </div>
        ) : null}
        {saveError ? (
          <p className="px-5 pt-3 text-sm font-medium text-(--brand-coral-solid)" role="alert">
            {saveError}
          </p>
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
            {saveManualPlaceMutation.isPending ? PLACE_FLOW_COPY.saving : "확인"}
          </PillButton>
        }
      />
    </FullscreenFlowRouteMount>
  );
}
