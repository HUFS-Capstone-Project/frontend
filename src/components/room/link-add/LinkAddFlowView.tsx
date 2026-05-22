import { useCallback, useLayoutEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { BrandMarkerLoader } from "@/components/ui/BrandMarkerLoader";
import { LINK_ADD_FLOW_ROOT_CLASS } from "@/features/place-flow/link-flow-layout";
import type { LinkAddCandidatesBootstrap } from "@/features/room/hooks";
import { useLinkAddFlow } from "@/features/room/hooks";
import { shouldAutoExitToInperson } from "@/features/room/link-add/should-auto-exit-to-inperson";
import { setLinkAddPendingOriginalUrl } from "@/features/room/link-add-pending-original-url-storage";
import { ROOM_APP_PATHS } from "@/shared/config/routes";
import type { RoomListRow } from "@/shared/types/room";
import { useLinkAddDraftStore } from "@/store/link-add-draft-store";

import { CandidatePlaceResultScreen } from "./CandidatePlaceResultScreen";
import { LinkInputScreen } from "./LinkInputScreen";
import { LinkProcessingScreen } from "./LinkProcessingScreen";
import { ManualPlaceFallbackScreen } from "./ManualPlaceFallbackScreen";

export type LinkAddFlowViewProps = {
  room: RoomListRow | null;
  draftSessionId?: string | null;
  candidatesBootstrap?: LinkAddCandidatesBootstrap | null;
  candidatesOnly?: boolean;
  autoNavigateToCandidates?: boolean;
  onExit: () => void;
  onPlacesSaved?: () => void;
};

export function LinkAddFlowView({
  room,
  draftSessionId = null,
  candidatesBootstrap = null,
  candidatesOnly = false,
  autoNavigateToCandidates = false,
  onExit,
  onPlacesSaved,
}: LinkAddFlowViewProps) {
  const navigate = useNavigate();

  const handleSaveSuccess = useCallback(() => {
    onPlacesSaved?.();
  }, [onPlacesSaved]);

  const {
    renderStep,
    originalUrl,
    setOriginalUrl,
    originalUrlError,
    renderAnalysisResult,
    selectedKakaoPlaceIds,
    saveError,
    isSubmitEnabled,
    isSavePending,
    canSaveSelectedCandidates,
    cancelOngoingSubmission,
    resetFlow,
    submitLink,
    retryLinkAnalysis,
    toggleCandidatePlace,
    saveSelectedCandidatePlaces,
    persistDraftForEdit,
  } = useLinkAddFlow({
    room,
    activeRoomId: room?.id ?? null,
    draftSessionId,
    candidatesBootstrap,
    onSaveSuccess: handleSaveSuccess,
  });

  const handleReenterLink = useCallback(() => {
    if (!room?.id) {
      return;
    }

    useLinkAddDraftStore.getState().clearForRoom(room.id);
    cancelOngoingSubmission();

    if (candidatesOnly) {
      navigate(ROOM_APP_PATHS.placeFromLink(room.id), { replace: true });
      return;
    }

    resetFlow();
  }, [cancelOngoingSubmission, candidatesOnly, navigate, resetFlow, room]);

  const handleRequestClose = useCallback(() => {
    if (room?.id) {
      useLinkAddDraftStore.getState().clearForRoom(room.id);
    }
    cancelOngoingSubmission();
    onExit();
  }, [cancelOngoingSubmission, onExit, room]);

  const handleManualPlaceSaved = useCallback(() => {
    if (room?.id) {
      useLinkAddDraftStore.getState().clearForRoom(room.id);
    }
    handleSaveSuccess();
  }, [handleSaveSuccess, room]);

  const didNavigateToCandidatesRef = useRef(false);

  useLayoutEffect(() => {
    if (!autoNavigateToCandidates) {
      return;
    }
    if (!room?.id) {
      return;
    }
    if (renderStep !== "analysisResult" || renderAnalysisResult == null) {
      return;
    }
    if (shouldAutoExitToInperson(renderAnalysisResult)) {
      return;
    }

    const analysisRequestId = renderAnalysisResult.analysisRequestId;
    if (analysisRequestId == null || didNavigateToCandidatesRef.current) {
      return;
    }

    didNavigateToCandidatesRef.current = true;
    const trimmedOriginalUrl = originalUrl.trim();
    setLinkAddPendingOriginalUrl(room.id, analysisRequestId, trimmedOriginalUrl);
    navigate(ROOM_APP_PATHS.linkCandidates(room.id, analysisRequestId), {
      replace: true,
      state: {
        linkAddPendingOriginalUrl: trimmedOriginalUrl,
        selectedKakaoPlaceIds,
      },
    });
  }, [
    autoNavigateToCandidates,
    navigate,
    originalUrl,
    renderAnalysisResult,
    renderStep,
    room?.id,
    selectedKakaoPlaceIds,
  ]);

  if (!room) {
    return null;
  }

  if (candidatesOnly) {
    if (renderStep !== "analysisResult" || renderAnalysisResult == null) {
      return (
        <div className="flex flex-1 items-center justify-center px-6 pt-24 pb-10">
          <BrandMarkerLoader />
        </div>
      );
    }

    if (shouldAutoExitToInperson(renderAnalysisResult)) {
      return (
        <ManualPlaceFallbackScreen
          roomId={room.id}
          result={renderAnalysisResult}
          onClose={handleRequestClose}
          onSaved={handleManualPlaceSaved}
        />
      );
    }

    return (
      <CandidatePlaceResultScreen
        linkAddRoomId={room.id}
        result={renderAnalysisResult}
        selectedKakaoPlaceIds={selectedKakaoPlaceIds}
        saveError={saveError}
        isSavePending={isSavePending}
        canSave={canSaveSelectedCandidates}
        persistDraftForEdit={persistDraftForEdit}
        onClose={handleRequestClose}
        onRetry={() => {
          void retryLinkAnalysis();
        }}
        onReenterLink={handleReenterLink}
        onToggleCandidatePlace={toggleCandidatePlace}
        onSave={() => {
          void saveSelectedCandidatePlaces();
        }}
      />
    );
  }

  const showCandidateResultScreen =
    renderStep === "analysisResult" &&
    renderAnalysisResult != null &&
    !shouldAutoExitToInperson(renderAnalysisResult) &&
    !autoNavigateToCandidates;
  const showManualPlaceFallbackScreen =
    renderStep === "analysisResult" &&
    renderAnalysisResult != null &&
    shouldAutoExitToInperson(renderAnalysisResult);

  return (
    <div className={LINK_ADD_FLOW_ROOT_CLASS}>
      {renderStep === "input" ? (
        <LinkInputScreen
          originalUrl={originalUrl}
          originalUrlError={originalUrlError}
          onChangeOriginalUrl={setOriginalUrl}
          onCancel={handleRequestClose}
          onSubmit={() => {
            void submitLink();
          }}
          isSubmitEnabled={isSubmitEnabled}
        />
      ) : null}

      {renderStep === "processing" ? <LinkProcessingScreen /> : null}

      {showManualPlaceFallbackScreen ? (
        <ManualPlaceFallbackScreen
          roomId={room.id}
          result={renderAnalysisResult}
          onClose={handleRequestClose}
          onSaved={handleManualPlaceSaved}
        />
      ) : null}

      {showCandidateResultScreen ? (
        <CandidatePlaceResultScreen
          linkAddRoomId={room.id}
          result={renderAnalysisResult}
          selectedKakaoPlaceIds={selectedKakaoPlaceIds}
          saveError={saveError}
          isSavePending={isSavePending}
          canSave={canSaveSelectedCandidates}
          persistDraftForEdit={persistDraftForEdit}
          onClose={handleRequestClose}
          onRetry={() => {
            void retryLinkAnalysis();
          }}
          onReenterLink={handleReenterLink}
          onToggleCandidatePlace={toggleCandidatePlace}
          onSave={() => {
            void saveSelectedCandidatePlaces();
          }}
        />
      ) : null}
    </div>
  );
}
