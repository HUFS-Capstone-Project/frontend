import { useMemo, useState } from "react";

import { PlaceSearchMapSheet } from "@/components/place-flow/PlaceSearchMapSheet";
import { useSaveManualPlaceMutation } from "@/features/link-analysis";
import type { ExternalPlaceCandidate } from "@/features/place-candidates";
import { useExternalPlaceCandidates } from "@/features/place-candidates";
import { PLACE_FLOW_COPY } from "@/features/place-flow/place-flow-copy";
import type { LinkAnalysisResult } from "@/features/room/link-add";
import { isApiError } from "@/shared/api/axios";
import type { SavedPlace } from "@/shared/types/map-home";

type ManualPlaceFallbackScreenProps = {
  roomId: string;
  result: LinkAnalysisResult;
  onClose: () => void;
  onSaved: () => void;
};

const EMPTY_EXTERNAL_CANDIDATES: ExternalPlaceCandidate[] = [];

export function ManualPlaceFallbackScreen({
  roomId,
  result,
  onClose,
  onSaved,
}: ManualPlaceFallbackScreenProps) {
  const [keyword, setKeyword] = useState("");
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const analysisRequestId = result.analysisRequestId;
  const trimmedKeyword = keyword.trim();
  const externalPlaceCandidatesQuery = useExternalPlaceCandidates({
    roomId,
    params: {
      keyword,
      limit: 10,
    },
    enabled: analysisRequestId != null && roomId.length > 0 && trimmedKeyword.length > 0,
  });
  const saveManualPlaceMutation = useSaveManualPlaceMutation({
    roomId,
    analysisRequestId,
  });

  const externalCandidates = externalPlaceCandidatesQuery.data ?? EMPTY_EXTERNAL_CANDIDATES;
  const searchResults = useMemo(
    () => (trimmedKeyword ? externalCandidates.map(externalCandidateToSavedPlace) : []),
    [externalCandidates, trimmedKeyword],
  );
  const selectedExternalPlace =
    selectedPlaceId == null
      ? null
      : (externalCandidates.find((place) => place.kakaoPlaceId === selectedPlaceId) ?? null);
  const canConfirm =
    selectedExternalPlace != null &&
    selectedExternalPlace.selectable &&
    !saveManualPlaceMutation.isPending;

  const handleConfirm = () => {
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
      },
      {
        onSuccess: onSaved,
        onError: (error) => {
          setSaveError(
            isApiError(error) ? error.message : "장소 저장에 실패했어요. 다시 시도해 주세요.",
          );
        },
      },
    );
  };

  return (
    <PlaceSearchMapSheet
      title={PLACE_FLOW_COPY.notFoundTitle}
      subtitle={PLACE_FLOW_COPY.manualPlaceFallback.subtitle}
      linkUrl={result.originalUrl}
      captionRaw={result.captionRaw}
      keyword={keyword}
      selectedPlaceId={selectedPlaceId}
      searchResults={searchResults}
      isSearching={externalPlaceCandidatesQuery.isFetching}
      isSearchError={externalPlaceCandidatesQuery.isError}
      saveError={saveError}
      canConfirm={canConfirm}
      collapsedResetLabel="다시 검색"
      collapsedConfirmLabel="이 장소로 저장"
      isConfirmPending={saveManualPlaceMutation.isPending}
      onKeywordChange={(nextKeyword) => {
        setKeyword(nextKeyword);
        setSelectedPlaceId(null);
        setSaveError(null);
      }}
      onSubmitSearch={() => {
        if (trimmedKeyword.length === 0) {
          return;
        }
        void externalPlaceCandidatesQuery.refetch();
      }}
      onSelectPlace={(placeId) => {
        const externalPlace = externalCandidates.find((place) => place.kakaoPlaceId === placeId);
        if (externalPlace && !externalPlace.selectable) {
          return;
        }
        setSelectedPlaceId(placeId);
      }}
      onClearSelectedPlace={() => setSelectedPlaceId(null)}
      onCancel={onClose}
      onConfirm={handleConfirm}
    />
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
