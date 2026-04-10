import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { BottomNavigationBar } from "@/components/common/BottomNavigationBar";
import { BottomNavToast } from "@/components/common/BottomNavToast";
import { FloatingActionButton } from "@/components/common/FloatingActionButton";
import { FriendRoomList } from "@/components/room/FriendRoomList";
import { RoomActionModal, type RoomActionType } from "@/components/room/RoomActionModal";
import { RoomMainHeader } from "@/components/room/RoomMainHeader";
import { RoomMainShell } from "@/components/room/RoomMainShell";
import { useRoomActionModalHistory } from "@/features/room/hooks";
import { useBottomNavController } from "@/hooks/use-bottom-nav-controller";
import { FRIEND_ROOM_MOCK_ROWS } from "@/pages/room/friend-room-mock";
import type { FriendRoomRow } from "@/shared/types/room";
import { useRoomSelectionStore } from "@/store/room-selection-store";

export function RoomMainPage() {
  const navigate = useNavigate();
  const selectRoom = useRoomSelectionStore((s) => s.selectRoom);
  const { toastMessage, handleSelectBottomNav } = useBottomNavController();
  const { actionRoom, openRoomActions, closeRoomActions } = useRoomActionModalHistory();

  const handleRoomNavigate = useCallback(
    (row: FriendRoomRow) => {
      selectRoom({ id: row.id, name: row.displayName });
      navigate("/map");
    },
    [navigate, selectRoom],
  );

  const handleRoomAction = useCallback((_action: RoomActionType) => {
    // 액션별 API·라우팅은 이후 연동
  }, []);

  return (
    <RoomMainShell
      header={<RoomMainHeader title="홍길동님의 데이트 지도" />}
      fab={<FloatingActionButton label="방 생성" />}
      bottomNav={
        <>
          <BottomNavToast message={toastMessage} />
          <BottomNavigationBar activeId="room" onSelect={handleSelectBottomNav} />
        </>
      }
    >
      <FriendRoomList
        rows={FRIEND_ROOM_MOCK_ROWS}
        onRoomNavigate={handleRoomNavigate}
        onOpenRoomActions={openRoomActions}
      />
      <RoomActionModal room={actionRoom} onClose={closeRoomActions} onAction={handleRoomAction} />
    </RoomMainShell>
  );
}
