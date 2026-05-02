import { useCallback, useEffect, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { MobileFixedPageShell } from "@/components/common/MobileFixedPageShell";
import { LinkAddFlowView } from "@/components/room/link-add";
import { useFriendRoomRowById } from "@/features/room/hooks";
import { peekLinkAddPendingUrl } from "@/features/room/link-add-pending-url-storage";
import { APP_ROUTES } from "@/shared/config/routes";

export type RoomLinkCandidatesLocationState = {
  linkAddDraftSession?: string;
  linkAddPendingUrl?: string;
  selectedKakaoPlaceIds?: string[];
};

export default function RoomLinkCandidatesPage() {
  const { roomId: roomIdParam = "", linkId: linkIdParam = "" } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? null) as RoomLinkCandidatesLocationState | null;

  const trimmedRoomId = roomIdParam.trim();
  const draftSessionId =
    typeof state?.linkAddDraftSession === "string" && state.linkAddDraftSession.length > 0
      ? state.linkAddDraftSession
      : null;

  const linkIdNum = Number(linkIdParam);

  const candidatesBootstrap = useMemo(() => {
    if (draftSessionId) {
      return null;
    }
    if (trimmedRoomId.length === 0 || !Number.isFinite(linkIdNum)) {
      return null;
    }
    const fromState =
      typeof state?.linkAddPendingUrl === "string" && state.linkAddPendingUrl.length > 0
        ? state.linkAddPendingUrl
        : "";
    const pendingUrl = fromState || peekLinkAddPendingUrl(trimmedRoomId, linkIdNum);
    const selectedKakaoPlaceIds = Array.isArray(state?.selectedKakaoPlaceIds)
      ? state.selectedKakaoPlaceIds
      : [];
    return { linkId: linkIdNum, url: pendingUrl, selectedKakaoPlaceIds };
  }, [draftSessionId, linkIdNum, state, trimmedRoomId]);

  const room = useFriendRoomRowById(trimmedRoomId.length > 0 ? trimmedRoomId : undefined);

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
    if (trimmedRoomId.length === 0 || linkIdParam.length === 0 || !Number.isFinite(linkIdNum)) {
      navigate(APP_ROUTES.room, { replace: true });
    }
  }, [linkIdNum, linkIdParam, navigate, trimmedRoomId]);

  if (trimmedRoomId.length === 0 || linkIdParam.length === 0 || !Number.isFinite(linkIdNum)) {
    return null;
  }

  return (
    <MobileFixedPageShell alignWithOverlay>
      <LinkAddFlowView
        room={room}
        draftSessionId={draftSessionId}
        candidatesBootstrap={candidatesBootstrap}
        candidatesOnly
        onExit={handleExit}
        onPlacesSaved={handlePlacesSaved}
      />
    </MobileFixedPageShell>
  );
}
