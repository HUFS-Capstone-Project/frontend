import { useCallback, useRef } from "react";

import { FRIEND_ROOM_LONG_PRESS_MS } from "@/features/room/constants";

export type UseFriendRoomRowInteractionsOptions = {
  roomId: string;
  onNavigate: (roomId: string) => void;
  onOpenActionMenu: (roomId: string) => void;
};

/**
 * 방 목록 행: 우클릭·롱프레스 메뉴, 짧은 탭 네비게이션, 롱프레스 후 click 억제.
 */
export function useFriendRoomRowInteractions({
  roomId,
  onNavigate,
  onOpenActionMenu,
}: UseFriendRoomRowInteractionsOptions) {
  const longPressTimerRef = useRef<number | null>(null);
  const suppressClickRef = useRef(false);

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimerRef.current != null) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      onOpenActionMenu(roomId);
    },
    [roomId, onOpenActionMenu],
  );

  const handleTouchStart = useCallback(() => {
    suppressClickRef.current = false;
    clearLongPressTimer();
    longPressTimerRef.current = window.setTimeout(() => {
      longPressTimerRef.current = null;
      suppressClickRef.current = true;
      onOpenActionMenu(roomId);
    }, FRIEND_ROOM_LONG_PRESS_MS) as unknown as number;
  }, [clearLongPressTimer, onOpenActionMenu, roomId]);

  const handleTouchMove = useCallback(() => {
    clearLongPressTimer();
  }, [clearLongPressTimer]);

  const handleTouchEnd = useCallback(() => {
    clearLongPressTimer();
  }, [clearLongPressTimer]);

  const handleTouchCancel = useCallback(() => {
    clearLongPressTimer();
  }, [clearLongPressTimer]);

  const handleRowClick = useCallback(
    (e: React.MouseEvent) => {
      if (suppressClickRef.current) {
        e.preventDefault();
        e.stopPropagation();
        suppressClickRef.current = false;
        return;
      }
      onNavigate(roomId);
    },
    [roomId, onNavigate],
  );

  const handleOuterClick = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest("button")) return;
      handleRowClick(e);
    },
    [handleRowClick],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onNavigate(roomId);
      }
    },
    [roomId, onNavigate],
  );

  return {
    handleOuterClick,
    handleContextMenu,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleTouchCancel,
    handleKeyDown,
  };
}
