import { memo, useCallback } from "react";

import { useFriendRoomRowInteractions } from "@/features/room/hooks";
import type { FriendRoomRow } from "@/shared/types/room";

import { FriendRoomItemView } from "./FriendRoomItemView";

export type FriendRoomItemProps = {
  row: FriendRoomRow;
  liked: boolean;
  onToggleFavorite: (roomId: string) => void;
  onNavigate: (roomId: string) => void;
  onOpenActionMenu: (roomId: string) => void;
};

/**
 * 방 목록 행: 제스처·키보드 로직을 훅에 두고, UI는 View에 위임.
 */
export const FriendRoomItem = memo(function FriendRoomItem({
  row,
  liked,
  onToggleFavorite,
  onNavigate,
  onOpenActionMenu,
}: FriendRoomItemProps) {
  const interactions = useFriendRoomRowInteractions({
    roomId: row.id,
    onNavigate,
    onOpenActionMenu,
  });

  const onFavoriteClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onToggleFavorite(row.id);
    },
    [row.id, onToggleFavorite],
  );

  const onFavoriteTouchStart = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <FriendRoomItemView
      row={row}
      liked={liked}
      onOuterClick={interactions.handleOuterClick}
      onContextMenu={interactions.handleContextMenu}
      onTouchStart={interactions.handleTouchStart}
      onTouchMove={interactions.handleTouchMove}
      onTouchEnd={interactions.handleTouchEnd}
      onTouchCancel={interactions.handleTouchCancel}
      onKeyDown={interactions.handleKeyDown}
      onFavoriteClick={onFavoriteClick}
      onFavoriteTouchStart={onFavoriteTouchStart}
    />
  );
});
