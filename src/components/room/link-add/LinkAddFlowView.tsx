import { useCallback, useLayoutEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

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
  /** 후보 화면만 (전용 라우트) */
  candidatesOnly?: boolean;
  /** 링크 분석 완료 후 후보 라우트로 replace 이동 (from-link 라우트 전용) */
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

  const exitToPlaceSearch = useCallback(() => {
    const roomId = room?.id;
    if (!roomId) {
      return;
    }
    useLinkAddDraftStore.getState().clearForRoom(roomId);
    cancelOngoingSubmission();
    navigate(ROOM_APP_PATHS.placeSearch(roomId));
  }, [cancelOngoingSubmission, navigate, room]);

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
    exitToPlaceSearch();
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
    const lid = renderAnalysisResult.linkId;
    if (lid == null) {
      return;
    }
    if (didNavigateToCandidatesRef.current) {
      return;
    }
    didNavigateToCandidatesRef.current = true;
    const trimmedUrl = url.trim();
    setLinkAddPendingUrl(room.id, lid, trimmedUrl);
    navigate(ROOM_APP_PATHS.linkCandidates(room.id, lid), {
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
          <p className="text-muted-foreground text-sm">불러오는 중…</p>
        </div>
      );
    }

    if (shouldAutoExitToInperson(renderAnalysisResult)) {
      return (
        <div className="flex flex-1 items-center justify-center px-6 pt-24 pb-10">
          <p className="text-muted-foreground text-sm">이동 중…</p>
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
          onToggleCandidatePlace={toggleCandidatePlace}
          onSave={() => {
            void saveSelectedCandidatePlaces();
          }}
        />
      ) : null}
    </div>
  );
}
