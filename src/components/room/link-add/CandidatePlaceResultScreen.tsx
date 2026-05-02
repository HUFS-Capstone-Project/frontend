import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { CopyableLinkBar } from "@/components/common/CopyableLinkBar";
import { TwoButtonFooter } from "@/components/common/TwoButtonFooter";
import { PlaceSelectCard } from "@/components/link-place/PlaceSelectCard";
import { PlaceFlowHeadlines } from "@/components/place-flow/PlaceFlowHeadlines";
import { PillButton } from "@/components/ui/PillButton";
import type { CandidatePlace } from "@/features/link-analysis";
import { canRetryLinkAnalysis, canSelectCandidatePlace } from "@/features/link-analysis";
import { LINK_FLOW_AFTER_HEADLINES_CLASS } from "@/features/place-flow/link-flow-layout";
import { PLACE_FLOW_COPY } from "@/features/place-flow/place-flow-copy";
import type { LinkAnalysisResult } from "@/features/room/link-add";
import { APP_ROUTES } from "@/shared/config/routes";
import { SAVED_PLACE_MOCKS } from "@/shared/mocks/place-mocks";
import type { SavedPlace } from "@/shared/types/map-home";
import { useEditPlaceStore } from "@/store/edit-place-store";

export type CandidatePlaceResultScreenProps = {
  linkAddRoomId: string;
  result: LinkAnalysisResult;
  selectedKakaoPlaceIds: string[];
  saveError?: string | null;
  isSavePending?: boolean;
  canSave?: boolean;
  onClose: () => void;
  onRetry: () => void;
  onToggleCandidatePlace: (place: CandidatePlace) => void;
  onSave: () => void;
  persistDraftForEdit: () => string;
};

export function CandidatePlaceResultScreen({
  linkAddRoomId,
  result,
  selectedKakaoPlaceIds,
  saveError,
  isSavePending = false,
  canSave = false,
  onClose,
  onRetry,
  onToggleCandidatePlace,
  onSave,
  persistDraftForEdit,
}: CandidatePlaceResultScreenProps) {
  const navigate = useNavigate();
  const editingPlaceId = useEditPlaceStore((s) => s.editingPlaceId);
  const selectedResultId = useEditPlaceStore((s) => s.selectedResultId);
  const [copyLabel, setCopyLabel] = useState("복사");

  const isSucceeded = result.status === "SUCCEEDED";
  const canRetry = canRetryLinkAnalysis(result.status);
  const selectedCount = selectedKakaoPlaceIds.length;
  const selectableCount = result.candidatePlaces.filter(canSelectCandidatePlace).length;
  const canShowSaveButton = isSucceeded;
  const saveButtonLabel = getSaveButtonLabel({
    isSavePending,
    selectedCount,
    selectableCount,
  });

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(result.originalUrl);
      setCopyLabel("복사됨");
      window.setTimeout(() => setCopyLabel("복사"), 1500);
    } catch {
      setCopyLabel("실패");
      window.setTimeout(() => setCopyLabel("복사"), 1500);
    }
  }, [result.originalUrl]);

  const resolveRowDisplay = useCallback(
    (slotId: string, base: SavedPlace): SavedPlace => {
      if (editingPlaceId === slotId && selectedResultId) {
        const fromMock = SAVED_PLACE_MOCKS.find((p) => p.id === selectedResultId);
        return fromMock ?? base;
      }
      return base;
    },
    [editingPlaceId, selectedResultId],
  );

  const rowEntries = useMemo(() => {
    return result.candidatePlaces.map((place, index) => {
      const slotId = place.kakaoPlaceId ?? `candidate-${index}`;
      const base = candidatePlaceToSavedPlace(place, index);
      const displayPlace = resolveRowDisplay(slotId, base);
      return { place, index, slotId, displayPlace };
    });
  }, [resolveRowDisplay, result.candidatePlaces]);

  const showNotFoundHelp = !isSucceeded || rowEntries.length === 0;
  const showSuccessHeader = isSucceeded && rowEntries.length > 0;

  const outlineCancelButton = (
    <PillButton
      type="button"
      variant="outline"
      className="text-muted-foreground hover:text-muted-foreground"
      onClick={onClose}
    >
      {PLACE_FLOW_COPY.cancel}
    </PillButton>
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-6 pt-16 pb-3">
        {showSuccessHeader ? (
          <section className="pb-5" aria-labelledby="candidate-place-select-title">
            <PlaceFlowHeadlines
              titleId="candidate-place-select-title"
              title={PLACE_FLOW_COPY.selectFromCandidates.title}
              subtitle={PLACE_FLOW_COPY.selectFromCandidates.subtitle}
            />

            <div className={LINK_FLOW_AFTER_HEADLINES_CLASS}>
              <CopyableLinkBar
                url={result.originalUrl}
                copyLabel={copyLabel}
                onCopy={() => {
                  void handleCopy();
                }}
              />
            </div>
          </section>
        ) : null}

        {showNotFoundHelp && canRetry ? (
          <div className="space-y-4">
            <PlaceFlowHeadlines
              titleId="link-candidate-not-found-title"
              title={PLACE_FLOW_COPY.notFoundTitle}
              subtitle={PLACE_FLOW_COPY.notFoundHint}
            />
            {result.errorMessage && !isSucceeded ? (
              <p className="text-destructive text-sm" role="alert">
                {result.errorMessage}
              </p>
            ) : null}
          </div>
        ) : null}

        {isSucceeded && rowEntries.length > 0 ? (
          <ul className="border-t border-black/5">
            {rowEntries.map(({ place, index, slotId, displayPlace }) => {
              const selectable = canSelectCandidatePlace(place);
              const selected =
                place.kakaoPlaceId != null && selectedKakaoPlaceIds.includes(place.kakaoPlaceId);

              return (
                <PlaceSelectCard
                  key={getCandidatePlaceKey(place, index)}
                  place={displayPlace}
                  selected={selected}
                  disabled={!selectable}
                  onSelect={() => onToggleCandidatePlace(place)}
                  onEdit={
                    selectable
                      ? () => {
                          const sessionId = persistDraftForEdit();
                          navigate(APP_ROUTES.editPlace, {
                            state: {
                              placeId: slotId,
                              placeName: displayPlace.name,
                              returnTo: "link-add",
                              linkAddRoomId,
                              linkAddLinkId: result.linkId ?? undefined,
                              linkAddDraftSession: sessionId,
                            },
                          });
                        }
                      : undefined
                  }
                />
              );
            })}
          </ul>
        ) : null}

        {saveError ? (
          <p className="text-destructive mt-4 px-1 text-sm" role="alert">
            {saveError}
          </p>
        ) : null}
      </div>

      {canShowSaveButton && rowEntries.length > 0 ? (
        <TwoButtonFooter
          left={outlineCancelButton}
          right={
            <PillButton
              type="button"
              variant={canSave ? "onboarding" : "onboardingMuted"}
              disabled={!canSave}
              onClick={onSave}
            >
              {saveButtonLabel}
            </PillButton>
          }
        />
      ) : showNotFoundHelp && canRetry ? (
        <TwoButtonFooter
          left={outlineCancelButton}
          right={
            <PillButton type="button" variant="onboarding" onClick={onRetry}>
              {PLACE_FLOW_COPY.retry}
            </PillButton>
          }
        />
      ) : null}
    </div>
  );
}

function candidatePlaceToSavedPlace(place: CandidatePlace, index: number): SavedPlace {
  const id = place.kakaoPlaceId ?? `candidate-${index}`;
  const address = place.roadAddressName ?? place.addressName ?? "";
  const category = place.categoryGroupName ?? place.categoryName ?? "장소";

  return {
    id,
    name: place.placeName,
    category,
    address,
    latitude: place.latitude ?? 0,
    longitude: place.longitude ?? 0,
  };
}

function getCandidatePlaceKey(place: CandidatePlace, index: number): string {
  return place.kakaoPlaceId ?? `${place.placeName}-${index}`;
}

function getSaveButtonLabel(params: {
  isSavePending: boolean;
  selectedCount: number;
  selectableCount: number;
}): string {
  if (params.isSavePending) {
    return PLACE_FLOW_COPY.saving;
  }

  if (params.selectedCount > 0) {
    return PLACE_FLOW_COPY.save;
  }

  if (params.selectableCount === 0) {
    return PLACE_FLOW_COPY.noneToSave;
  }

  return PLACE_FLOW_COPY.pickPlaces;
}
