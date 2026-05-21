import { useCallback, useEffect, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { FullscreenFlowRouteMount } from "@/components/layout/FullscreenFlowRouteMount";
import { LinkAddFlowView } from "@/components/room/link-add";
import { useRoomListRowById } from "@/features/room/hooks";
import { peekLinkAddPendingOriginalUrl } from "@/features/room/link-add-pending-original-url-storage";
import { APP_ROUTES } from "@/shared/config/routes";

export type RoomLinkCandidatesLocationState = {
  linkAddDraftSession?: string;
  linkAddPendingOriginalUrl?: string;
  selectedKakaoPlaceIds?: string[];
};

export default function RoomLinkCandidatesPage() {
  const { roomId: roomIdParam = "", analysisRequestId: analysisRequestIdParam = "" } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? null) as RoomLinkCandidatesLocationState | null;

  const trimmedRoomId = roomIdParam.trim();
  const draftSessionId =
    typeof state?.linkAddDraftSession === "string" && state.linkAddDraftSession.length > 0
      ? state.linkAddDraftSession
      : null;

  const analysisRequestIdNum = Number(analysisRequestIdParam);

  const candidatesBootstrap = useMemo(() => {
    if (draftSessionId) {
      return null;
    }
    if (trimmedRoomId.length === 0 || !Number.isFinite(analysisRequestIdNum)) {
      return null;
    }
    const fromState =
      typeof state?.linkAddPendingOriginalUrl === "string" &&
      state.linkAddPendingOriginalUrl.length > 0
        ? state.linkAddPendingOriginalUrl
        : "";
    const pendingOriginalUrl =
      fromState || peekLinkAddPendingOriginalUrl(trimmedRoomId, analysisRequestIdNum);
    const selectedKakaoPlaceIds = Array.isArray(state?.selectedKakaoPlaceIds)
      ? state.selectedKakaoPlaceIds
      : [];
    return {
      analysisRequestId: analysisRequestIdNum,
      originalUrl: pendingOriginalUrl,
      selectedKakaoPlaceIds,
    };
  }, [analysisRequestIdNum, draftSessionId, state, trimmedRoomId]);

  const room = useRoomListRowById(trimmedRoomId.length > 0 ? trimmedRoomId : undefined);

  const handleExit = useCallback(() => {
    navigate(APP_ROUTES.room);
  }, [navigate]);

  const handlePlacesSaved = useCallback(() => {
    navigate(APP_ROUTES.room, {
      replace: true,
      state: { showPlacesRegisteredToast: true },
    });
  }, [navigate]);

  useEffect(() => {
    if (
      trimmedRoomId.length === 0 ||
      analysisRequestIdParam.length === 0 ||
      !Number.isFinite(analysisRequestIdNum)
    ) {
      navigate(APP_ROUTES.room, { replace: true });
    }
  }, [analysisRequestIdNum, analysisRequestIdParam, navigate, trimmedRoomId]);

  if (
    trimmedRoomId.length === 0 ||
    analysisRequestIdParam.length === 0 ||
    !Number.isFinite(analysisRequestIdNum)
  ) {
    return null;
  }

  return (
    <FullscreenFlowRouteMount>
      <LinkAddFlowView
        room={room}
        draftSessionId={draftSessionId}
        candidatesBootstrap={candidatesBootstrap}
        candidatesOnly
        onExit={handleExit}
        onPlacesSaved={handlePlacesSaved}
      />
    </FullscreenFlowRouteMount>
  );
}
