import { useCallback, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { MobileFixedPageShell } from "@/components/common/MobileFixedPageShell";
import { LinkAddFlowView } from "@/components/room/link-add";
import type { RoomPlaceFromLinkLocationState } from "@/features/place-flow/edit-place-navigation";
import { useFriendRoomRowById } from "@/features/room/hooks";
import { APP_ROUTES } from "@/shared/config/routes";

export default function RoomPlaceFromLinkPage() {
  const { roomId: roomIdParam = "" } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const trimmedRoomId = roomIdParam.trim();
  const draftSession =
    (location.state as RoomPlaceFromLinkLocationState | null)?.linkAddDraftSession ?? null;

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
    if (trimmedRoomId.length === 0) {
      navigate(APP_ROUTES.room, { replace: true });
    }
  }, [navigate, trimmedRoomId]);

  if (trimmedRoomId.length === 0) {
    return null;
  }

  return (
    <MobileFixedPageShell alignWithOverlay>
      <LinkAddFlowView
        room={room}
        draftSessionId={draftSession}
        autoNavigateToCandidates
        onExit={handleExit}
        onPlacesSaved={handlePlacesSaved}
      />
    </MobileFixedPageShell>
  );
}
