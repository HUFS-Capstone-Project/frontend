import { useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { EditPlaceResultCard } from "@/components/link-place/EditPlaceResultCard";
import { PlaceFlowSearchEmptyRow } from "@/components/place-flow/PlaceFlowSearchEmptyRow";
import { PlaceFlowSearchFieldRow } from "@/components/place-flow/PlaceFlowSearchFieldRow";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { PillButton } from "@/components/ui/PillButton";
import { PLACE_FLOW_COPY } from "@/features/place-flow/place-flow-copy";
import { PROMPT_FLOW_LIST_TOP_BORDER_CLASS } from "@/features/place-flow/prompt-flow-layout";
import { SAVED_PLACE_MOCKS } from "@/shared/mocks/place-mocks";
import type { SavedPlace } from "@/shared/types/map-home";

type CoursePlaceAddSheetProps = {
  open: boolean;
  excludedPlaceIds: string[];
  onClose: () => void;
  onConfirm: (place: SavedPlace) => void;
};

function findPlaceMatches(keyword: string): SavedPlace[] {
  const trimmedKeyword = keyword.trim();
  if (!trimmedKeyword) {
    return [];
  }

  return SAVED_PLACE_MOCKS.filter(
    (place) => place.name.includes(trimmedKeyword) || place.address.includes(trimmedKeyword),
  );
}

export function CoursePlaceAddSheet({
  open,
  excludedPlaceIds,
  onClose,
  onConfirm,
}: CoursePlaceAddSheetProps) {
  const [keyword, setKeyword] = useState("");
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const excludedPlaceIdSet = useMemo(() => new Set(excludedPlaceIds), [excludedPlaceIds]);

  const searchResults = useMemo(() => findPlaceMatches(keyword), [keyword]);
  const availableResults = useMemo(
    () => searchResults.filter((place) => !excludedPlaceIdSet.has(place.id)),
    [excludedPlaceIdSet, searchResults],
  );
  const selectedPlace = availableResults.find((place) => place.id === selectedPlaceId) ?? null;
  const trimmedKeyword = keyword.trim();
  const canSearch = trimmedKeyword.length > 0;
  const canConfirm = selectedPlace != null;

  const resetAndClose = () => {
    setKeyword("");
    setSelectedPlaceId(null);
    onClose();
  };

  const handleSubmitSearch = () => {
    if (!canSearch) {
      return;
    }

    if (availableResults.length === 1) {
      setSelectedPlaceId(availableResults[0].id);
    }
  };

  const handleConfirm = () => {
    if (!selectedPlace) {
      return;
    }

    onConfirm(selectedPlace);
    setKeyword("");
    setSelectedPlaceId(null);
  };

  const hasOnlyDuplicateMatches =
    trimmedKeyword.length > 0 && searchResults.length > 0 && availableResults.length === 0;

  return createPortal(
    <BottomSheet open={open} onClose={resetAndClose} intrinsicPanelHeight enableHistory={false}>
      <section className="bg-background px-6 pt-8 pb-0">
        <div className="space-y-1">
          <h2 className="text-foreground text-[1.25rem] leading-tight font-semibold tracking-[-0.01em]">
            장소 추가하기
          </h2>
          <p className="text-muted-foreground text-sm">코스에 추가할 장소를 검색해 주세요</p>
        </div>

        <div className="mt-5">
          <PlaceFlowSearchFieldRow
            id="course-place-add-search"
            value={keyword}
            onChange={(next) => {
              setKeyword(next);
              setSelectedPlaceId(null);
            }}
            placeholder={PLACE_FLOW_COPY.searchPlaceholder}
            searchButtonLabel={PLACE_FLOW_COPY.searchButton}
            onSubmitSearch={handleSubmitSearch}
            searchButtonDisabled={!canSearch}
          />
        </div>

        <div className="mt-4 max-h-[min(40dvh,20rem)] overflow-y-auto">
          {trimmedKeyword ? (
            <ul className={PROMPT_FLOW_LIST_TOP_BORDER_CLASS}>
              {availableResults.length === 0 ? (
                <PlaceFlowSearchEmptyRow
                  title={hasOnlyDuplicateMatches ? "이미 추가된 장소예요" : undefined}
                  hint={
                    hasOnlyDuplicateMatches ? "코스에 없는 다른 장소를 검색해 주세요" : undefined
                  }
                />
              ) : (
                availableResults.map((place) => (
                  <EditPlaceResultCard
                    key={place.id}
                    place={place}
                    selected={selectedPlaceId === place.id}
                    onSelect={() => setSelectedPlaceId(place.id)}
                  />
                ))
              )}
            </ul>
          ) : null}
        </div>

        <div className="mt-6 flex w-full gap-2">
          <div className="min-w-0 flex-1">
            <PillButton
              type="button"
              variant="outline"
              onClick={resetAndClose}
              className="border-border text-muted-foreground hover:bg-muted/50 h-11 min-h-11 rounded-lg text-sm"
            >
              취소
            </PillButton>
          </div>
          <div className="min-w-0 flex-1">
            <PillButton
              type="button"
              variant={canConfirm ? "onboarding" : "onboardingMuted"}
              disabled={!canConfirm}
              onClick={handleConfirm}
              className="h-11 min-h-11 rounded-lg text-sm"
            >
              확인
            </PillButton>
          </div>
        </div>
      </section>
    </BottomSheet>,
    document.body,
  );
}
