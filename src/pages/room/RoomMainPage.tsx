import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { BottomNavigationBar } from "@/components/common/BottomNavigationBar";
import { BottomNavToast } from "@/components/common/BottomNavToast";
import { FloatingActionButton } from "@/components/common/FloatingActionButton";
import { FriendRoomList } from "@/components/room/FriendRoomList";
import { RoomMainHeader } from "@/components/room/RoomMainHeader";
import { RoomMainShell } from "@/components/room/RoomMainShell";
import { useRoomActionModalHistory, useRoomMainModals } from "@/features/room";
import type { RoomActionType } from "@/features/room/roomActionTypes";
import { useBottomNavController } from "@/hooks/use-bottom-nav-controller";
import { APP_ROUTES } from "@/shared/config/routes";
import { REGISTER_SELECT_ROOM_TEXT } from "@/shared/config/text";
import type { FriendRoomRow } from "@/shared/types/room";
import { useAuthStore } from "@/store/auth-store";
import { useRegisterRoomStore } from "@/store/registerRoomStore";
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
const LinkAddModal = lazy(() =>
  import("@/components/room/link-add").then((module) => ({ default: module.LinkAddModal })),
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
    linkAddRoom,
    isAddRoomOpen,
    isRenamePending,
    isLeavePending,
    handleRoomAction,
    handleSubmitEditRoomName,
    handleConfirmLeaveRoom,
    closeEditRoomModal,
    closeInviteCodeModal,
    closeLeaveRoomModal,
    closeLinkAddModal,
    openAddRoom,
    closeAddRoom,
  } = useRoomMainModals({ showToast });
  const [isRoomActionModalLoaded, setIsRoomActionModalLoaded] = useState(actionRoom != null);
  const [isEditRoomModalLoaded, setIsEditRoomModalLoaded] = useState(editRoom != null);
  const [isInviteCodeModalLoaded, setIsInviteCodeModalLoaded] = useState(inviteCodeRoom != null);
  const [isLeaveRoomModalLoaded, setIsLeaveRoomModalLoaded] = useState(leaveRoom != null);
  const [isLinkAddModalLoaded, setIsLinkAddModalLoaded] = useState(linkAddRoom != null);
  const [isRoomAddModalLoaded, setIsRoomAddModalLoaded] = useState(isAddRoomOpen);

  useEffect(() => {
    const state = (location.state ?? null) as RoomMainLocationState | null;
    if (!state?.showPlacesRegisteredToast) {
      return;
    }

    showToast(REGISTER_SELECT_ROOM_TEXT.placesRegisteredToast, 2000);
    navigate(location.pathname, { replace: true, state: {} });
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
      if (action === "invite-code") {
        setIsInviteCodeModalLoaded(true);
      } else if (action === "leave") {
        setIsLeaveRoomModalLoaded(true);
      } else if (action === "add-direct-link") {
        setIsLinkAddModalLoaded(true);
      } else if (action === "edit-info") {
        setIsEditRoomModalLoaded(true);
      }

      handleRoomAction(action, row);
    },
    [handleRoomAction],
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
        {isLinkAddModalLoaded ? (
          <Suspense fallback={null}>
            <LinkAddModal room={linkAddRoom} onClose={closeLinkAddModal} />
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
