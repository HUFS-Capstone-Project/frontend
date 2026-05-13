import { useCallback, useState } from "react";

import type { RoomListRow } from "@/shared/types/room";

/**
 * 방 액션 모달 선택 상태만 관리한다.
 * history/back/ESC 제어는 `useOverlayFlowController`에서 공통 처리한다.
 */
export function useRoomActionModalHistory() {
  const [actionRoom, setActionRoom] = useState<RoomListRow | null>(null);

  const openRoomActions = useCallback((row: RoomListRow) => {
    setActionRoom(row);
  }, []);

  const closeRoomActions = useCallback(() => {
    setActionRoom(null);
  }, []);

  return { actionRoom, openRoomActions, closeRoomActions };
}
