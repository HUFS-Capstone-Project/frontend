import { useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { PlaceSearchMapSheet } from "@/components/place-flow/PlaceSearchMapSheet";
import type { PlaceCandidate } from "@/features/place-candidates";
import {
  canSubmitPlaceCandidate,
  placeCandidateToSavedPlace,
  usePlaceCandidates,
} from "@/features/place-candidates";
import { cn } from "@/lib/utils";
import type { SavedPlace } from "@/shared/types/map-home";
import {
  FULLSCREEN_FLOW_PANEL_CLASSES,
  FULLSCREEN_FLOW_ROUTE_OUTER_CLASSES,
} from "@/shared/ui/fullscreen-flow-layout";

type CoursePlaceAddSheetProps = {
  open: boolean;
  roomId?: string | null;
  excludedPlaceIds: string[];
  onClose: () => void;
  onConfirm: (place: SavedPlace) => void;
};

const EMPTY_PLACE_CANDIDATES: PlaceCandidate[] = [];

export function CoursePlaceAddSheet({
  open,
  roomId = null,
  excludedPlaceIds,
  onClose,
  onConfirm,
}: CoursePlaceAddSheetProps) {
  const [keyword, setKeyword] = useState("");
  const [submittedKeyword, setSubmittedKeyword] = useState("");
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const excludedPlaceIdSet = useMemo(() => new Set(excludedPlaceIds), [excludedPlaceIds]);
  const trimmedKeyword = keyword.trim();
  const submittedTrimmedKeyword = submittedKeyword.trim();
  const isSubmittedKeywordCurrent = submittedTrimmedKeyword === trimmedKeyword;

  const placeCandidatesQuery = usePlaceCandidates({
    roomId: roomId ?? null,
    params: {
      keyword: submittedTrimmedKeyword,
      limit: 10,
    },
    enabled: open && Boolean(roomId) && submittedTrimmedKeyword.length > 0,
  });
  const placeCandidates = placeCandidatesQuery.data ?? EMPTY_PLACE_CANDIDATES;

  const availableResults = useMemo(() => {
    if (!isSubmittedKeywordCurrent || submittedTrimmedKeyword.length === 0) {
      return [];
    }

    return placeCandidates
      .map((place, index) => ({
        candidate: place,
        savedPlace: placeCandidateToSavedPlace(place, index),
      }))
      .filter(({ candidate, savedPlace }) => {
        if (!canSubmitPlaceCandidate(candidate)) {
          return false;
        }

        return (
          !excludedPlaceIdSet.has(savedPlace.id) &&
          !(savedPlace.kakaoPlaceId && excludedPlaceIdSet.has(savedPlace.kakaoPlaceId))
        );
      });
  }, [excludedPlaceIdSet, isSubmittedKeywordCurrent, placeCandidates, submittedTrimmedKeyword]);

  const selectedPlace =
    availableResults.find(({ savedPlace }) => savedPlace.id === selectedPlaceId)?.savedPlace ??
    null;
  const searchResults = availableResults.map(({ savedPlace }) => savedPlace);

  const resetAndClose = () => {
    setKeyword("");
    setSubmittedKeyword("");
    setSelectedPlaceId(null);
    onClose();
  };

  const handleSubmitSearch = () => {
    if (trimmedKeyword.length === 0) {
      return;
    }

    setSubmittedKeyword(trimmedKeyword);
    setSelectedPlaceId(null);
  };

  const handleConfirm = () => {
    if (!selectedPlace) {
      return;
    }

    onConfirm(selectedPlace);
    setKeyword("");
    setSubmittedKeyword("");
    setSelectedPlaceId(null);
  };

  if (!open) {
    return null;
  }

  return createPortal(
    <div className={cn(FULLSCREEN_FLOW_ROUTE_OUTER_CLASSES, "z-[80]")}>
      <section className={FULLSCREEN_FLOW_PANEL_CLASSES}>
        <PlaceSearchMapSheet
          title="장소 추가하기"
          subtitle="코스에 추가할 장소를 검색해 주세요."
          initialMode="search"
          keyword={keyword}
          selectedPlaceId={selectedPlaceId}
          searchResults={searchResults}
          isSearching={placeCandidatesQuery.isFetching}
          isSearchError={placeCandidatesQuery.isError && isSubmittedKeywordCurrent}
          showEmptyResult={submittedTrimmedKeyword.length > 0 && isSubmittedKeywordCurrent}
          canConfirm={selectedPlace != null}
          onKeywordChange={(next) => {
            setKeyword(next);
            setSelectedPlaceId(null);
          }}
          onSubmitSearch={handleSubmitSearch}
          onSelectPlace={setSelectedPlaceId}
          onClearSelectedPlace={() => setSelectedPlaceId(null)}
          onCancel={resetAndClose}
          onConfirm={handleConfirm}
        />
      </section>
    </div>,
    document.body,
  );
}
