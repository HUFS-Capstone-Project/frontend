import { useCallback } from "react";

import { BottomNavigationBar } from "@/components/common/BottomNavigationBar";
import { FloatingActionButton } from "@/components/common/FloatingActionButton";
import { FriendRoomList } from "@/components/room/FriendRoomList";
import {
  RoomActionModal,
  type RoomActionType,
} from "@/components/room/RoomActionModal";
import { RoomMainHeader } from "@/components/room/RoomMainHeader";
import { RoomMainShell } from "@/components/room/RoomMainShell";
import { useRoomActionModalHistory } from "@/features/room/hooks";
import { FRIEND_ROOM_MOCK_ROWS } from "@/pages/room/friend-room-mock";
import type { FriendRoomRow } from "@/shared/types/room";

export function RoomMainPage() {
  const { actionRoom, openRoomActions, closeRoomActions } = useRoomActionModalHistory();

  const handleRoomNavigate = useCallback((_row: FriendRoomRow) => {
    // 방 상세 연동 예정
  }, []);

  const handleRoomAction = useCallback((_action: RoomActionType) => {
    // 액션별 API·라우팅은 이후 연동
  }, []);

  return (
    <RoomMainShell
      header={<RoomMainHeader title="홍길동님의 데이트 지도" />}
      fab={<FloatingActionButton label="방 생성" />}
      bottomNav={<BottomNavigationBar activeId="room" />}
    >
      <FriendRoomList
        rows={FRIEND_ROOM_MOCK_ROWS}
        onRoomNavigate={handleRoomNavigate}
        onOpenRoomActions={openRoomActions}
      />
      <RoomActionModal
        room={actionRoom}
        onClose={closeRoomActions}
        onAction={handleRoomAction}
      />
    </RoomMainShell>
  );
}
