import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { BottomNavigationBar } from "@/components/common/BottomNavigationBar";
import { BottomNavToast } from "@/components/common/BottomNavToast";
import { FloatingActionButton } from "@/components/common/FloatingActionButton";
import { FriendRoomList } from "@/components/room/FriendRoomList";
import { InviteCodeModal } from "@/components/room/InviteCodeModal";
import { LeaveRoomConfirmModal } from "@/components/room/LeaveRoomConfirmModal";
import { LinkAddModal } from "@/components/room/link-add";
import { RoomActionModal } from "@/components/room/RoomActionModal";
import { RoomAddModal } from "@/components/room/RoomAddModal";
import { RoomMainHeader } from "@/components/room/RoomMainHeader";
import { RoomMainShell } from "@/components/room/RoomMainShell";
import { useRoomActionModalHistory, useRoomMainModals } from "@/features/room";
import { useBottomNavController } from "@/hooks/use-bottom-nav-controller";
import type { FriendRoomRow } from "@/shared/types/room";
import { useAuthStore } from "@/store/auth-store";
import { useRoomSelectionStore } from "@/store/room-selection-store";

export function RoomMainPage() {
  const navigate = useNavigate();
  const selectRoom = useRoomSelectionStore((s) => s.selectRoom);
  const nickname = useAuthStore((s) => s.nickname);
  const roomMainHeaderTitle =
    nickname != null && nickname.trim().length > 0
      ? `${nickname.trim()}님의 데이트 지도`
      : "데이트 지도";
  const { toastMessage, handleSelectBottomNav, showToast } = useBottomNavController();
  const { actionRoom, openRoomActions, closeRoomActions } = useRoomActionModalHistory();
  const {
    sortedRows,
    inviteCodeRoom,
    leaveRoom,
    linkAddRoom,
    isAddRoomOpen,
    handleRoomAction,
    handleConfirmLeaveRoom,
    closeInviteCodeModal,
    closeLeaveRoomModal,
    closeLinkAddModal,
    openAddRoom,
    closeAddRoom,
  } = useRoomMainModals();

  const handleRoomNavigate = useCallback(
    (row: FriendRoomRow) => {
      selectRoom({ id: row.id, name: row.displayName, memberCount: row.memberCount });
      navigate("/map");
    },
    [navigate, selectRoom],
  );

  return (
    <RoomMainShell
      header={<RoomMainHeader title={roomMainHeaderTitle} />}
      fab={<FloatingActionButton label="방 추가" onClick={openAddRoom} />}
      bottomNav={
        <>
          <BottomNavToast message={toastMessage} />
          <BottomNavigationBar activeId="room" onSelect={handleSelectBottomNav} />
        </>
      }
    >
      <FriendRoomList
        rows={sortedRows}
        onRoomNavigate={handleRoomNavigate}
        onOpenRoomActions={openRoomActions}
      />
      <RoomActionModal room={actionRoom} onClose={closeRoomActions} onAction={handleRoomAction} />
      <InviteCodeModal room={inviteCodeRoom} onClose={closeInviteCodeModal} showToast={showToast} />
      <LeaveRoomConfirmModal
        room={leaveRoom}
        onClose={closeLeaveRoomModal}
        onConfirmLeave={handleConfirmLeaveRoom}
      />
      <LinkAddModal room={linkAddRoom} onClose={closeLinkAddModal} />
      <RoomAddModal isOpen={isAddRoomOpen} onClose={closeAddRoom} showToast={showToast} />
    </RoomMainShell>
  );
}
