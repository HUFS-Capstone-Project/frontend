import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { CopyableLinkBar } from "@/components/common/CopyableLinkBar";
import { TwoButtonFooter } from "@/components/common/TwoButtonFooter";
import { FullscreenFlowRouteMount } from "@/components/layout/FullscreenFlowRouteMount";
import { EditPlaceResultCard } from "@/components/link-place/EditPlaceResultCard";
import { PlaceFlowCancelPillButton } from "@/components/place-flow/PlaceFlowCancelPillButton";
import { PlaceFlowHeadlines } from "@/components/place-flow/PlaceFlowHeadlines";
import { PlaceFlowSearchEmptyRow } from "@/components/place-flow/PlaceFlowSearchEmptyRow";
import { PlaceFlowSearchFieldRow } from "@/components/place-flow/PlaceFlowSearchFieldRow";
import { PillButton } from "@/components/ui/PillButton";
import { useSaveManualPlaceMutation } from "@/features/link-analysis";
import type { ExternalPlaceCandidate } from "@/features/place-candidates";
import { useExternalPlaceCandidates } from "@/features/place-candidates";
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
import { APP_ROUTES } from "@/shared/config/routes";
import { SAVED_PLACE_MOCKS } from "@/shared/mocks/place-mocks";
import type { SavedPlace } from "@/shared/types/map-home";
import { useInpersonPlaceStore } from "@/store/inperson-place-store";
import { useRegisterRoomStore } from "@/store/register-room-store";

type RoomPlaceSearchLocationState = {
  linkAddAnalysisRequestId?: number;
  linkAddOriginalUrl?: string;
};

const EMPTY_EXTERNAL_CANDIDATES: ExternalPlaceCandidate[] = [];

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
  const setSelectedPlacesForRegister = useRegisterRoomStore((state) => state.setSelectedPlaces);
  const completeRegisterToRoom = useRegisterRoomStore((state) => state.completeRegisterToRoom);
  const { copyLabel, copyText } = useCopyFeedback();
  const [saveError, setSaveError] = useState<string | null>(null);

  const analysisRequestId =
    typeof routeState?.linkAddAnalysisRequestId === "number"
      ? routeState.linkAddAnalysisRequestId
      : null;
  const linkPreviewUrl =
    typeof routeState?.linkAddOriginalUrl === "string" && routeState.linkAddOriginalUrl.length > 0
      ? routeState.linkAddOriginalUrl
      : LINK_PREVIEW_MOCK;
  const trimmedKeyword = keyword.trim();
  const canSearch = trimmedKeyword.length > 0;

  const externalPlaceCandidatesQuery = useExternalPlaceCandidates({
    roomId: registerContextRoomId || null,
    params: {
      keyword,
      limit: 10,
    },
    enabled: analysisRequestId != null && registerContextRoomId.length > 0 && canSearch,
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

  const externalCandidates = externalPlaceCandidatesQuery.data ?? EMPTY_EXTERNAL_CANDIDATES;
  const searchResults = useMemo(() => {
    if (!trimmedKeyword) {
      return [];
    }

    if (analysisRequestId != null) {
      return externalCandidates.map(externalCandidateToSavedPlace);
    }

    return SAVED_PLACE_MOCKS.filter(
      (place) => place.name.includes(trimmedKeyword) || place.address.includes(trimmedKeyword),
    );
  }, [analysisRequestId, externalCandidates, trimmedKeyword]);
  const selectedExternalPlace =
    analysisRequestId == null
      ? null
      : (externalCandidates.find((place) => place.kakaoPlaceId === selectedPlaceId) ?? null);
  const canConfirm =
    selectedPlaceId !== null &&
    registerContextRoomId.length > 0 &&
    (analysisRequestId == null ||
      (selectedExternalPlace != null &&
        selectedExternalPlace.selectable &&
        !saveManualPlaceMutation.isPending));

  const handleCopyLinkPreview = () => {
    void copyText(linkPreviewUrl);
  };

  const handleCancel = () => {
    reset();
    navigate(-1);
  };

  const handleConfirm = () => {
    if (!selectedPlaceId || !registerContextRoomId) {
      return;
    }

    if (analysisRequestId != null) {
      if (!selectedExternalPlace || !selectedExternalPlace.selectable) {
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
          categoryGroupName: selectedExternalPlace.categoryGroupName,
          phone: selectedExternalPlace.phone,
          placeUrl: selectedExternalPlace.placeUrl,
          sourceKeyword: trimmedKeyword,
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
            setSaveError(isApiError(error) ? error.message : "?μ냼 ??μ뿉 ?ㅽ뙣?덉뒿?덈떎.");
          },
        },
      );
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
            url={linkPreviewUrl}
            copyLabel={copyLabel}
            onCopy={handleCopyLinkPreview}
          />

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

      <div className={PROMPT_FLOW_SCROLL_BODY_CLASS}>
        {trimmedKeyword ? (
          <ul className={PROMPT_FLOW_LIST_TOP_BORDER_CLASS}>
            {searchResults.length === 0 && !externalPlaceCandidatesQuery.isFetching ? (
              <PlaceFlowSearchEmptyRow />
            ) : (
              searchResults.map((place) => (
                <EditPlaceResultCard
                  key={place.id}
                  place={place}
                  selected={selectedPlaceId === place.id}
                  onSelect={() => {
                    const externalPlace =
                      analysisRequestId == null
                        ? null
                        : externalCandidates.find((item) => item.kakaoPlaceId === place.id);
                    if (externalPlace && !externalPlace.selectable) {
                      return;
                    }
                    setSelectedPlace(place.id);
                  }}
                />
              ))
            )}
          </ul>
        ) : null}
        {saveError ? (
          <p className="px-5 pt-3 text-sm font-medium text-[var(--brand-coral-solid)]" role="alert">
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

function externalCandidateToSavedPlace(place: ExternalPlaceCandidate): SavedPlace {
  return {
    id: place.kakaoPlaceId,
    name: place.name,
    category: place.categoryGroupName ?? place.categoryName ?? "장소",
    address: place.roadAddress ?? place.address ?? "",
    latitude: place.latitude,
    longitude: place.longitude,
  };
}
