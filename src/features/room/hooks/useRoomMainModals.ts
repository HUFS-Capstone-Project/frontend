import { useCallback, useMemo, useState } from "react";

import type { RoomActionType } from "@/features/room/roomActionTypes";
import {
  applyPinOverrides,
  type PinOverride,
  sortFriendRoomRows,
} from "@/features/room/utils/friendRoomRows";
import { FRIEND_ROOM_MOCK_ROWS } from "@/pages/room/friend-room-mock";
import type { FriendRoomRow } from "@/shared/types/room";

/**
 * 방 메인: 고정 오버레이·초대코드/나가기 모달 상태 및 액션 메뉴 분기.
 * handleRoomAction은 setter만 사용하므로 deps를 비운다. 외부 값(navigate 등)이 필요해지면 배열에 추가할 것.
 */
export function useRoomMainModals() {
  const [pinOverrides, setPinOverrides] = useState<Record<string, PinOverride>>({});
  const [inviteCodeRoom, setInviteCodeRoom] = useState<FriendRoomRow | null>(null);
  const [leaveRoom, setLeaveRoom] = useState<FriendRoomRow | null>(null);

  const sortedRows = useMemo(() => {
    const merged = applyPinOverrides(FRIEND_ROOM_MOCK_ROWS, pinOverrides);
    return sortFriendRoomRows(merged);
  }, [pinOverrides]);

  const handleRoomAction = useCallback((action: RoomActionType, room: FriendRoomRow) => {
    if (action === "toggle-pin") {
      const nextPinned = !room.isPinned;
      setPinOverrides((prev) => ({
        ...prev,
        [room.id]: nextPinned
          ? { isPinned: true, pinnedAt: Date.now() }
          : { isPinned: false, pinnedAt: undefined },
      }));
      return;
    }

    if (action === "add-direct-link") {
      // TODO: 링크 입력 모달/폼 — openAddLinkFlow({ roomId: room.id, title: room.displayName })
      void room.id;
      return;
    }

    if (action === "edit-info") {
      // TODO: 방 이름 변경 플로우
      void room.id;
      return;
    }

    if (action === "invite-code") {
      setInviteCodeRoom(room);
      return;
    }

    if (action === "leave") {
      setLeaveRoom(room);
    }
  }, []);

  const handleConfirmLeaveRoom = useCallback((room: FriendRoomRow) => {
    setLeaveRoom(null);
    // TODO: 방 나가기 API(room.id)
    void room.id;
  }, []);

  const closeInviteCodeModal = useCallback(() => {
    setInviteCodeRoom(null);
  }, []);

  const closeLeaveRoomModal = useCallback(() => {
    setLeaveRoom(null);
  }, []);

  return {
    sortedRows,
    inviteCodeRoom,
    leaveRoom,
    handleRoomAction,
    handleConfirmLeaveRoom,
    closeInviteCodeModal,
    closeLeaveRoomModal,
  };
}
