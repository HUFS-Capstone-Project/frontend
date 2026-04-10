import { useCallback, useEffect, useRef, useState } from "react";

import type { FriendRoomRow } from "@/shared/types/room";

/**
 * 방 액션 모달과 브라우저 history 스택 동기화 (뒤로가기로 모달 닫기).
 */
export function useRoomActionModalHistory() {
  const [actionRoom, setActionRoom] = useState<FriendRoomRow | null>(null);
  const historyPushedForModalRef = useRef(false);

  const openRoomActions = useCallback((row: FriendRoomRow) => {
    setActionRoom(row);
    window.history.pushState({ roomActionModal: true }, "");
    historyPushedForModalRef.current = true;
  }, []);

  const closeRoomActions = useCallback(() => {
    setActionRoom(null);
    if (historyPushedForModalRef.current) {
      historyPushedForModalRef.current = false;
      window.history.back();
    }
  }, []);

  useEffect(() => {
    const onPopState = () => {
      historyPushedForModalRef.current = false;
      setActionRoom(null);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  return { actionRoom, openRoomActions, closeRoomActions };
}
