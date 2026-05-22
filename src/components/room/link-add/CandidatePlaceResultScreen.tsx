import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { TwoButtonFooter } from "@/components/common/TwoButtonFooter";
import { PlaceSelectCard } from "@/components/link-place/PlaceSelectCard";
import { PlaceFlowCancelPillButton } from "@/components/place-flow/PlaceFlowCancelPillButton";
import { PlaceFlowHeadlines } from "@/components/place-flow/PlaceFlowHeadlines";
import { PlaceFlowOriginalLinkChipRow } from "@/components/place-flow/PlaceFlowOriginalLinkChipRow";
import { PillButton } from "@/components/ui/PillButton";
import type { CandidatePlace } from "@/features/link-analysis";
import {
  canEditCandidatePlace,
  canRetryLinkAnalysis,
  canSelectCandidatePlace,
  isInstagramRateLimitedError,
  isUnsupportedPlatformUrlError,
} from "@/features/link-analysis";
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

import { SupportedPlatformList } from "./SupportedPlatformList";

export type CandidatePlaceResultScreenProps = {
  linkAddRoomId: string;
  result: LinkAnalysisResult;
  selectedKakaoPlaceIds: string[];
  saveError?: string | null;
  isSavePending?: boolean;
  canSave?: boolean;
  onClose: () => void;
  onRetry: () => void;
  onReenterLink?: () => void;
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
  onReenterLink,
  onSearchManually,
  onToggleCandidatePlace,
  onSave,
  persistDraftForEdit,
}: CandidatePlaceResultScreenProps) {
  const navigate = useNavigate();

  const isSucceeded = result.status === "SUCCEEDED";
  const isInstagramRateLimited = isInstagramRateLimitedError(result.errorCode);
  const isUnsupportedPlatform = isUnsupportedPlatformUrlError(result.errorCode);
  const canRetry = !isUnsupportedPlatform && canRetryLinkAnalysis(result.status, result.retryable);
  const notFoundTitle = getNotFoundTitle({ isInstagramRateLimited });
  const notFoundHint = getNotFoundHint({
    isInstagramRateLimited,
    errorMessage: result.errorMessage,
  });
  const selectedCount = selectedKakaoPlaceIds.length;
  const selectableCount = result.candidatePlaces.filter(canSelectCandidatePlace).length;
  const canShowSaveButton = isSucceeded;
  const saveButtonLabel = getSaveButtonLabel({
    isSavePending,
    selectedCount,
    selectableCount,
  });

  const trimmedOriginalUrl = result.originalUrl.trim();

  const rowEntries = useMemo(() => {
    return result.candidatePlaces.map((place, index) => {
      const slotId = place.kakaoPlaceId ?? `candidate-${place.candidateId ?? index}`;
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
              {trimmedOriginalUrl ? (
                <PlaceFlowOriginalLinkChipRow
                  linkUrl={trimmedOriginalUrl}
                  linkSourceType={result.linkSourceType}
                />
              ) : null}
            </div>
          </section>
        ) : null}

        {showNotFoundHelp && isUnsupportedPlatform ? (
          <div>
            <PlaceFlowHeadlines
              titleId="link-unsupported-platform-title"
              title={PLACE_FLOW_COPY.unsupportedPlatformUrl.title}
              subtitle={PLACE_FLOW_COPY.unsupportedPlatformUrl.subtitle}
            />
            <div className="mt-16">
              <SupportedPlatformList />
            </div>
          </div>
        ) : showNotFoundHelp ? (
          <div className="space-y-4">
            <PlaceFlowHeadlines
              titleId="link-candidate-not-found-title"
              title={notFoundTitle}
              subtitle={notFoundHint}
            />
            {result.errorMessage && !isSucceeded && !isInstagramRateLimited ? (
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
                              linkAddOriginalUrl: result.originalUrl,
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
      ) : showNotFoundHelp ? (
        <TwoButtonFooter
          left={
            <PlaceFlowCancelPillButton onClick={onClose}>
              {PLACE_FLOW_COPY.cancel}
            </PlaceFlowCancelPillButton>
          }
          right={
            isUnsupportedPlatform && onReenterLink ? (
              <PillButton type="button" variant="onboarding" onClick={onReenterLink}>
                {PLACE_FLOW_COPY.reenterLink}
              </PillButton>
            ) : canRetry ? (
              <PillButton type="button" variant="onboarding" onClick={onRetry}>
                {PLACE_FLOW_COPY.retry}
              </PillButton>
            ) : isSucceeded && onSearchManually ? (
              <PillButton type="button" variant="onboarding" onClick={onSearchManually}>
                직접 검색
              </PillButton>
            ) : (
              <span className="block w-full" aria-hidden />
            )
          }
        />
      ) : null}
    </div>
  );
}

function candidatePlaceToSavedPlace(place: CandidatePlace, index: number): SavedPlace {
  const id = place.kakaoPlaceId ?? `candidate-${place.candidateId ?? index}`;
  const address = place.roadAddressName ?? place.addressName ?? "";
  const category = place.serviceCategoryCode;
  const categoryName = place.serviceCategoryName;

  return {
    id,
    candidateId: place.candidateId,
    kakaoPlaceId: place.kakaoPlaceId,
    roomPlaceId: place.roomPlaceId,
    name: place.placeName ?? "",
    category,
    categoryName,
    address,
    latitude: place.latitude ?? 0,
    longitude: place.longitude ?? 0,
  };
}

function getCandidatePlaceKey(place: CandidatePlace, index: number): string {
  return place.kakaoPlaceId ?? String(place.candidateId ?? index);
}

function getNotFoundTitle({ isInstagramRateLimited }: { isInstagramRateLimited: boolean }): string {
  if (isInstagramRateLimited) {
    return PLACE_FLOW_COPY.instagramRateLimited.title;
  }

  return PLACE_FLOW_COPY.notFoundTitle;
}

function getNotFoundHint({
  isInstagramRateLimited,
  errorMessage,
}: {
  isInstagramRateLimited: boolean;
  errorMessage?: string;
}): string {
  if (isInstagramRateLimited) {
    return errorMessage ?? "";
  }

  return PLACE_FLOW_COPY.notFoundHint;
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
