import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { ROOM_ACTION_MODAL_TRANSITION_MS } from "@/features/room/constants";
import type { FriendRoomRow } from "@/shared/types/room";

/**
 * room prop과 실제 DOM 표시(displayRoom)를 분리해 퇴장 transition 후 언마운트.
 * setState는 effect 동기 본문이 아닌 microtask / 타이머 콜백에서 호출 (react-hooks/set-state-in-effect 준수).
 *
 * effect 의존성은 `room` 객체 참조가 아니라 `room?.id`만 사용한다.
 * 같은 id에 객체만 갱신된 경우(목록 리프레시 등)에는 effect를 다시 돌리지 않아 모달이 깜빡이지 않는다.
 */
export function useRoomActionModalPresence(room: FriendRoomRow | null) {
  const [displayRoom, setDisplayRoom] = useState<FriendRoomRow | null>(null);
  const [visible, setVisible] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const roomRef = useRef(room);

  useLayoutEffect(() => {
    roomRef.current = room;
  }, [room]);

  const roomId = room?.id ?? null;

  useEffect(() => {
    if (roomId != null) {
      const current = roomRef.current;
      if (!current || current.id !== roomId) return;

      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
      queueMicrotask(() => {
        setDisplayRoom(current);
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
  }, [roomId]);

  return { displayRoom, visible };
}
