import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { CopyableLinkBar } from "@/components/common/CopyableLinkBar";
import { TwoButtonFooter } from "@/components/common/TwoButtonFooter";
import { PlaceSelectCard } from "@/components/link-place/PlaceSelectCard";
import { PlaceFlowCancelPillButton } from "@/components/place-flow/PlaceFlowCancelPillButton";
import { PlaceFlowHeadlines } from "@/components/place-flow/PlaceFlowHeadlines";
import { PillButton } from "@/components/ui/PillButton";
import type { CandidatePlace } from "@/features/link-analysis";
import {
  canEditCandidatePlace,
  canRetryLinkAnalysis,
  canSelectCandidatePlace,
} from "@/features/link-analysis";
import { useCopyFeedback } from "@/features/place-flow/hooks/use-copy-feedback";
import { LINK_FLOW_AFTER_HEADLINES_CLASS } from "@/features/place-flow/link-flow-layout";
import { PLACE_FLOW_COPY } from "@/features/place-flow/place-flow-copy";
import {
  PROMPT_FLOW_ALERT_IN_SCROLL_CLASS,
  PROMPT_FLOW_ALERT_INLINE_CLASS,
  PROMPT_FLOW_COLUMN_CLASS,
  PROMPT_FLOW_LIST_TOP_BORDER_CLASS,
  PROMPT_FLOW_SCROLL_INSET_HEADER_CLASS,
} from "@/features/place-flow/prompt-flow-layout";
import type { LinkAnalysisResult } from "@/features/room/link-add";
import { APP_ROUTES } from "@/shared/config/routes";
import type { SavedPlace } from "@/shared/types/map-home";

export type CandidatePlaceResultScreenProps = {
  linkAddRoomId: string;
  result: LinkAnalysisResult;
  selectedKakaoPlaceIds: string[];
  saveError?: string | null;
  isSavePending?: boolean;
  canSave?: boolean;
  onClose: () => void;
  onRetry: () => void;
  onSearchManually?: () => void;
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
  onSearchManually,
  onToggleCandidatePlace,
  onSave,
  persistDraftForEdit,
}: CandidatePlaceResultScreenProps) {
  const navigate = useNavigate();
  const { copyLabel, copyText } = useCopyFeedback();

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

  const rowEntries = useMemo(() => {
    return result.candidatePlaces.map((place, index) => {
      const slotId = place.kakaoPlaceId ?? `candidate-${index}`;
      const base = candidatePlaceToSavedPlace(place, index);
      return { place, index, slotId, displayPlace: base };
    });
  }, [result.candidatePlaces]);

  const showNotFoundHelp = !isSucceeded || rowEntries.length === 0;
  const showSuccessHeader = isSucceeded && rowEntries.length > 0;

  return (
    <div className={PROMPT_FLOW_COLUMN_CLASS}>
      <div className={PROMPT_FLOW_SCROLL_INSET_HEADER_CLASS}>
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
                  void copyText(result.originalUrl);
                }}
              />
            </div>
          </section>
        ) : null}

        {showNotFoundHelp ? (
          <div className="space-y-4">
            <PlaceFlowHeadlines
              titleId="link-candidate-not-found-title"
              title={PLACE_FLOW_COPY.notFoundTitle}
              subtitle={PLACE_FLOW_COPY.notFoundHint}
            />
            {result.errorMessage && !isSucceeded ? (
              <p className={PROMPT_FLOW_ALERT_INLINE_CLASS} role="alert">
                {result.errorMessage}
              </p>
            ) : null}
          </div>
        ) : null}

        {isSucceeded && rowEntries.length > 0 ? (
          <ul className={PROMPT_FLOW_LIST_TOP_BORDER_CLASS}>
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
                  corrected={place.corrected}
                  saved={place.alreadyInRoom}
                  disabledReason={place.disabledReason}
                  onSelect={() => onToggleCandidatePlace(place)}
                  onEdit={
                    canEditCandidatePlace(place)
                      ? () => {
                          const sessionId = persistDraftForEdit();
                          navigate(APP_ROUTES.editPlace, {
                            state: {
                              placeId: slotId,
                              placeName: displayPlace.name,
                              returnTo: "link-add",
                              linkAddRoomId,
                              linkAddAnalysisRequestId: result.analysisRequestId ?? undefined,
                              linkAddLinkId: result.analysisRequestId ?? undefined,
                              linkAddCandidateId: place.candidateId,
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
          <p className={PROMPT_FLOW_ALERT_IN_SCROLL_CLASS} role="alert">
            {saveError}
          </p>
        ) : null}
      </div>

      {canShowSaveButton && rowEntries.length > 0 ? (
        <TwoButtonFooter
          left={
            <PlaceFlowCancelPillButton onClick={onClose}>
              {PLACE_FLOW_COPY.cancel}
            </PlaceFlowCancelPillButton>
          }
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
          left={
            <PlaceFlowCancelPillButton onClick={onClose}>
              {PLACE_FLOW_COPY.cancel}
            </PlaceFlowCancelPillButton>
          }
          right={
            <PillButton type="button" variant="onboarding" onClick={onRetry}>
              {PLACE_FLOW_COPY.retry}
            </PillButton>
          }
        />
      ) : showNotFoundHelp && isSucceeded && onSearchManually ? (
        <TwoButtonFooter
          left={
            <PlaceFlowCancelPillButton onClick={onClose}>
              {PLACE_FLOW_COPY.cancel}
            </PlaceFlowCancelPillButton>
          }
          right={
            <PillButton type="button" variant="onboarding" onClick={onSearchManually}>
              직접 검색
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
