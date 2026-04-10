import { useEffect, useRef, useState } from "react";

import { ROOM_ACTION_MODAL_TRANSITION_MS } from "@/features/room/constants";
import type { FriendRoomRow } from "@/shared/types/room";

/**
 * room prop과 실제 DOM 표시(displayRoom)를 분리해 퇴장 transition 후 언마운트.
 * setState는 effect 동기 본문이 아닌 microtask / 타이머 콜백에서 호출 (react-hooks/set-state-in-effect 준수).
 */
export function useRoomActionModalPresence(room: FriendRoomRow | null) {
  const [displayRoom, setDisplayRoom] = useState<FriendRoomRow | null>(null);
  const [visible, setVisible] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (room) {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
      queueMicrotask(() => {
        setDisplayRoom(room);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setVisible(true));
        });
      });
      return;
    }

    queueMicrotask(() => setVisible(false));
    closeTimerRef.current = setTimeout(() => {
      setDisplayRoom(null);
      closeTimerRef.current = null;
    }, ROOM_ACTION_MODAL_TRANSITION_MS);

    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    };
  }, [room]);

  return { displayRoom, visible };
}
