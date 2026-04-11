import { memo } from "react";

import { useFriendRoomRowInteractions } from "@/features/room/hooks";
import type { FriendRoomRow } from "@/shared/types/room";

import { FriendRoomItemView } from "./FriendRoomItemView";

export type FriendRoomItemProps = {
  row: FriendRoomRow;
  onNavigate: (roomId: string) => void;
  onOpenActionMenu: (roomId: string) => void;
};

/**
 * 방 목록 행: 제스처·키보드 로직을 훅에 두고, UI는 View에 위임.
 */
export const FriendRoomItem = memo(function FriendRoomItem({
  row,
  onNavigate,
  onOpenActionMenu,
}: FriendRoomItemProps) {
  const interactions = useFriendRoomRowInteractions({
    roomId: row.id,
    onNavigate,
    onOpenActionMenu,
  });

  return (
    <FriendRoomItemView
      row={row}
      onOuterClick={interactions.handleOuterClick}
      onContextMenu={interactions.handleContextMenu}
      onTouchStart={interactions.handleTouchStart}
      onTouchMove={interactions.handleTouchMove}
      onTouchEnd={interactions.handleTouchEnd}
      onTouchCancel={interactions.handleTouchCancel}
      onKeyDown={interactions.handleKeyDown}
    />
  );
});
