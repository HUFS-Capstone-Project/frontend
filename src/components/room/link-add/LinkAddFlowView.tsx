import { useCallback, useLayoutEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { BrandMarkerLoader } from "@/components/ui/BrandMarkerLoader";
import { LINK_ADD_FLOW_ROOT_CLASS } from "@/features/place-flow/link-flow-layout";
import type { LinkAddCandidatesBootstrap } from "@/features/room/hooks";
import { useLinkAddFlow } from "@/features/room/hooks";
import { shouldAutoExitToInperson } from "@/features/room/link-add/should-auto-exit-to-inperson";
import { setLinkAddPendingUrl } from "@/features/room/link-add-pending-url-storage";
import { ROOM_APP_PATHS } from "@/shared/config/routes";
import type { FriendRoomRow } from "@/shared/types/room";
import { useLinkAddDraftStore } from "@/store/link-add-draft-store";

import { CandidatePlaceResultScreen } from "./CandidatePlaceResultScreen";
import { LinkInputScreen } from "./LinkInputScreen";
import { LinkProcessingScreen } from "./LinkProcessingScreen";

export type LinkAddFlowViewProps = {
  room: FriendRoomRow | null;
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
    url,
    setUrl,
    urlError,
    renderAnalysisResult,
    selectedKakaoPlaceIds,
    saveError,
    isSubmitEnabled,
    isSavePending,
    canSaveSelectedCandidates,
    cancelOngoingSubmission,
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

  const handleRequestClose = useCallback(() => {
    if (room?.id) {
      useLinkAddDraftStore.getState().clearForRoom(room.id);
    }
    cancelOngoingSubmission();
    onExit();
  }, [cancelOngoingSubmission, onExit, room]);

  const exitToPlaceSearch = useCallback(
    (resultUrl: string, analysisRequestId: number | null) => {
      const roomId = room?.id;
      if (!roomId) {
        return;
      }

      useLinkAddDraftStore.getState().clearForRoom(roomId);
      cancelOngoingSubmission();
      navigate(ROOM_APP_PATHS.placeSearch(roomId), {
        state: {
          linkAddAnalysisRequestId: analysisRequestId ?? undefined,
          linkAddOriginalUrl: resultUrl,
        },
      });
    },
    [cancelOngoingSubmission, navigate, room],
  );

  const autoExitInpersonRef = useRef(false);

  useLayoutEffect(() => {
    if (renderStep === "input") {
      autoExitInpersonRef.current = false;
      return;
    }

    if (renderStep !== "analysisResult" || renderAnalysisResult == null) {
      return;
    }

    if (!shouldAutoExitToInperson(renderAnalysisResult)) {
      return;
    }

    if (autoExitInpersonRef.current) {
      return;
    }

    autoExitInpersonRef.current = true;
    exitToPlaceSearch(renderAnalysisResult.originalUrl, renderAnalysisResult.analysisRequestId);
  }, [exitToPlaceSearch, renderAnalysisResult, renderStep]);

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
    const trimmedUrl = url.trim();
    setLinkAddPendingUrl(room.id, analysisRequestId, trimmedUrl);
    navigate(ROOM_APP_PATHS.linkCandidates(room.id, analysisRequestId), {
      replace: true,
      state: {
        linkAddPendingUrl: trimmedUrl,
        selectedKakaoPlaceIds,
      },
    });
  }, [
    autoNavigateToCandidates,
    navigate,
    renderAnalysisResult,
    renderStep,
    room?.id,
    selectedKakaoPlaceIds,
    url,
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
        onSearchManually={() => {
          exitToPlaceSearch(
            renderAnalysisResult.originalUrl,
            renderAnalysisResult.analysisRequestId,
          );
        }}
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

  return (
    <div className={LINK_ADD_FLOW_ROOT_CLASS}>
      {renderStep === "input" ? (
        <LinkInputScreen
          url={url}
          urlError={urlError}
          onChangeUrl={setUrl}
          onCancel={handleRequestClose}
          onSubmit={() => {
            void submitLink();
          }}
          isSubmitEnabled={isSubmitEnabled}
        />
      ) : null}

      {renderStep === "processing" ? <LinkProcessingScreen /> : null}

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
          onSearchManually={() => {
            exitToPlaceSearch(
              renderAnalysisResult.originalUrl,
              renderAnalysisResult.analysisRequestId,
            );
          }}
          onToggleCandidatePlace={toggleCandidatePlace}
          onSave={() => {
            void saveSelectedCandidatePlaces();
          }}
        />
      ) : null}
    </div>
  );
}
