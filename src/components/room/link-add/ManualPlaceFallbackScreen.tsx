import { useMemo, useState } from "react";

import { PlaceSearchMapSheet } from "@/components/place-flow/PlaceSearchMapSheet";
import { useSaveManualPlaceMutation } from "@/features/link-analysis";
import type { PlaceCandidate } from "@/features/place-candidates";
import {
  canSubmitPlaceCandidate,
  placeCandidateToSavedPlace,
  usePlaceCandidates,
} from "@/features/place-candidates";
import { PLACE_FLOW_COPY } from "@/features/place-flow/place-flow-copy";
import type { LinkAnalysisResult } from "@/features/room/link-add";
import { resolveGeneralApiErrorMessage } from "@/shared/api/error";

type ManualPlaceFallbackScreenProps = {
  roomId: string;
  result: LinkAnalysisResult;
  onClose: () => void;
  onSaved: () => void;
};

const EMPTY_PLACE_CANDIDATES: PlaceCandidate[] = [];

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
  const placeCandidatesQuery = usePlaceCandidates({
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

  const placeCandidates = placeCandidatesQuery.data ?? EMPTY_PLACE_CANDIDATES;
  const searchResults = useMemo(
    () => (trimmedKeyword ? placeCandidates.map(placeCandidateToSavedPlace) : []),
    [placeCandidates, trimmedKeyword],
  );
  const selectedExternalPlace =
    selectedPlaceId == null
      ? null
      : (placeCandidates.find(
          (place, index) => placeCandidateToSavedPlace(place, index).id === selectedPlaceId,
        ) ?? null);
  const canConfirm =
    canSubmitPlaceCandidate(selectedExternalPlace) && !saveManualPlaceMutation.isPending;

  const handleConfirm = () => {
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
        onSuccess: onSaved,
        onError: (error) => {
          setSaveError(
            resolveGeneralApiErrorMessage(error, {
              fallback: "장소 저장에 실패했어요. 다시 시도해 주세요.",
            }),
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
      linkSourceType={result.linkSourceType}
      contentText={result.contentText}
      keyword={keyword}
      selectedPlaceId={selectedPlaceId}
      searchResults={searchResults}
      isSearching={placeCandidatesQuery.isFetching}
      isSearchError={placeCandidatesQuery.isError}
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
        void placeCandidatesQuery.refetch();
      }}
      onSelectPlace={(placeId) => {
        const externalPlace = placeCandidates.find(
          (place, index) => placeCandidateToSavedPlace(place, index).id === placeId,
        );
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
