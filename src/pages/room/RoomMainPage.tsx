import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { BottomNavigationBar } from "@/components/common/BottomNavigationBar";
import { BottomNavToast } from "@/components/common/BottomNavToast";
import { FloatingActionButton } from "@/components/common/FloatingActionButton";
import { FriendRoomList } from "@/components/room/FriendRoomList";
import { RoomMainHeader } from "@/components/room/RoomMainHeader";
import { RoomMainShell } from "@/components/room/RoomMainShell";
import { roomPlaceFromLinkResumeState } from "@/features/place-flow/edit-place-navigation";
import { useRoomActionModalHistory, useRoomMainModals } from "@/features/room";
import type { RoomActionType } from "@/features/room/roomActionTypes";
import { useBottomNavController } from "@/hooks/use-bottom-nav-controller";
import { APP_ROUTES, ROOM_APP_PATHS } from "@/shared/config/routes";
import { REGISTER_SELECT_ROOM_TEXT } from "@/shared/config/text";
import type { FriendRoomRow } from "@/shared/types/room";
import { useAuthStore } from "@/store/auth-store";
import { useRegisterRoomStore } from "@/store/register-room-store";
import { useRoomSelectionStore } from "@/store/room-selection-store";

const RoomActionModal = lazy(() =>
  import("@/components/room/RoomActionModal").then((module) => ({
    default: module.RoomActionModal,
  })),
);
const InviteCodeModal = lazy(() =>
  import("@/components/room/InviteCodeModal").then((module) => ({
    default: module.InviteCodeModal,
  })),
);
const LeaveRoomConfirmModal = lazy(() =>
  import("@/components/room/LeaveRoomConfirmModal").then((module) => ({
    default: module.LeaveRoomConfirmModal,
  })),
);
const RoomAddModal = lazy(() =>
  import("@/components/room/RoomAddModal").then((module) => ({ default: module.RoomAddModal })),
);
const EditRoomNameModal = lazy(() =>
  import("@/components/room/EditRoomNameModal").then((module) => ({
    default: module.EditRoomNameModal,
  })),
);

type RoomMainLocationState = {
  showPlacesRegisteredToast?: boolean;
  openLinkAddForRoomId?: string;
  linkAddDraftSession?: string;
};

export default function RoomMainPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectRoom = useRoomSelectionStore((s) => s.selectRoom);
  const roomPlaceCountDeltas = useRegisterRoomStore((state) => state.roomPlaceCountDeltas);
  const nickname = useAuthStore((s) => s.nickname);
  const roomMainHeaderTitle =
    nickname != null && nickname.trim().length > 0
      ? `${nickname.trim()}님의 데이트 지도`
      : "데이트 지도";
  const { toastMessage, toastPlacement, handleSelectBottomNav, showToast } =
    useBottomNavController();
  const { actionRoom, openRoomActions, closeRoomActions } = useRoomActionModalHistory();
  const {
    sortedRows,
    editRoom,
    inviteCodeRoom,
    leaveRoom,
    isAddRoomOpen,
    isRenamePending,
    isLeavePending,
    handleRoomAction,
    handleSubmitEditRoomName,
    handleConfirmLeaveRoom,
    closeEditRoomModal,
    closeInviteCodeModal,
    closeLeaveRoomModal,
    openAddRoom,
    closeAddRoom,
  } = useRoomMainModals({ showToast });
  const [isRoomActionModalLoaded, setIsRoomActionModalLoaded] = useState(actionRoom != null);
  const [isEditRoomModalLoaded, setIsEditRoomModalLoaded] = useState(editRoom != null);
  const [isInviteCodeModalLoaded, setIsInviteCodeModalLoaded] = useState(inviteCodeRoom != null);
  const [isLeaveRoomModalLoaded, setIsLeaveRoomModalLoaded] = useState(leaveRoom != null);
  const [isRoomAddModalLoaded, setIsRoomAddModalLoaded] = useState(isAddRoomOpen);

  useEffect(() => {
    const raw = (location.state ?? null) as RoomMainLocationState | null;
    if (!raw) {
      return;
    }

    const nextState: Record<string, unknown> = { ...raw };
    let shouldReplace = false;

    if (raw.showPlacesRegisteredToast) {
      showToast(REGISTER_SELECT_ROOM_TEXT.placesRegisteredToast, 2000);
      delete nextState.showPlacesRegisteredToast;
      shouldReplace = true;
    }

    if (typeof raw.openLinkAddForRoomId === "string" && raw.openLinkAddForRoomId.length > 0) {
      navigate(ROOM_APP_PATHS.placeFromLink(raw.openLinkAddForRoomId), {
        replace: true,
        state: roomPlaceFromLinkResumeState(raw.linkAddDraftSession),
      });
      return;
    }

    if (shouldReplace) {
      const keys = Object.keys(nextState);
      navigate(location.pathname, {
        replace: true,
        state: keys.length > 0 ? nextState : {},
      });
    }
  }, [location.pathname, location.state, navigate, showToast]);

  const displayRows = sortedRows.map((row) => ({
    ...row,
    placeCount: row.placeCount + (roomPlaceCountDeltas[row.id] ?? 0),
  }));

  const handleRoomNavigate = useCallback(
    (row: FriendRoomRow) => {
      selectRoom({ id: row.id, name: row.displayName, memberCount: row.memberCount });
      navigate(APP_ROUTES.map);
    },
    [navigate, selectRoom],
  );

  const handleOpenRoomActions = useCallback(
    (row: FriendRoomRow) => {
      setIsRoomActionModalLoaded(true);
      openRoomActions(row);
    },
    [openRoomActions],
  );

  const handleRoomActionWithLoad = useCallback(
    (action: RoomActionType, row: FriendRoomRow) => {
      if (action === "add-direct-link") {
        navigate(ROOM_APP_PATHS.placeFromLink(row.id));
        return;
      }
      if (action === "invite-code") {
        setIsInviteCodeModalLoaded(true);
      } else if (action === "leave") {
        setIsLeaveRoomModalLoaded(true);
      } else if (action === "edit-info") {
        setIsEditRoomModalLoaded(true);
      }

      handleRoomAction(action, row);
    },
    [handleRoomAction, navigate],
  );

  const handleOpenAddRoom = useCallback(() => {
    setIsRoomAddModalLoaded(true);
    openAddRoom();
  }, [openAddRoom]);

  return (
    <>
      <RoomMainShell
        header={<RoomMainHeader title={roomMainHeaderTitle} />}
        fab={<FloatingActionButton label="방 추가" onClick={handleOpenAddRoom} />}
        bottomNav={<BottomNavigationBar activeId="room" onSelect={handleSelectBottomNav} />}
      >
        <FriendRoomList
          rows={displayRows}
          onRoomNavigate={handleRoomNavigate}
          onOpenRoomActions={handleOpenRoomActions}
        />
        {isRoomActionModalLoaded ? (
          <Suspense fallback={null}>
            <RoomActionModal
              room={actionRoom}
              onClose={closeRoomActions}
              onAction={handleRoomActionWithLoad}
            />
          </Suspense>
        ) : null}
        {isEditRoomModalLoaded ? (
          <Suspense fallback={null}>
            <EditRoomNameModal
              room={editRoom}
              onClose={closeEditRoomModal}
              onSubmitRoomName={handleSubmitEditRoomName}
              isSubmitting={isRenamePending}
            />
          </Suspense>
        ) : null}
        {isInviteCodeModalLoaded ? (
          <Suspense fallback={null}>
            <InviteCodeModal
              room={inviteCodeRoom}
              onClose={closeInviteCodeModal}
              showToast={showToast}
            />
          </Suspense>
        ) : null}
        {isLeaveRoomModalLoaded ? (
          <Suspense fallback={null}>
            <LeaveRoomConfirmModal
              room={leaveRoom}
              onClose={closeLeaveRoomModal}
              onConfirmLeave={handleConfirmLeaveRoom}
              isSubmitting={isLeavePending}
            />
          </Suspense>
        ) : null}
        {isRoomAddModalLoaded ? (
          <Suspense fallback={null}>
            <RoomAddModal isOpen={isAddRoomOpen} onClose={closeAddRoom} showToast={showToast} />
          </Suspense>
        ) : null}
      </RoomMainShell>
      <BottomNavToast message={toastMessage} placement={toastPlacement} />
    </>
  );
}
