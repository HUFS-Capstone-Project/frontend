import { useCallback, useState } from "react";

import type { FriendRoomRow } from "@/shared/types/room";

/**
 * 방 액션 모달 선택 상태만 관리한다.
 * history/back/ESC 제어는 `useOverlayFlowController`에서 공통 처리한다.
 */
export function useRoomActionModalHistory() {
  const [actionRoom, setActionRoom] = useState<FriendRoomRow | null>(null);

  const openRoomActions = useCallback((row: FriendRoomRow) => {
    setActionRoom(row);
  }, []);

  const closeRoomActions = useCallback(() => {
    setActionRoom(null);
  }, []);

  return { actionRoom, openRoomActions, closeRoomActions };
}
