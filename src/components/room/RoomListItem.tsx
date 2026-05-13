import { memo } from "react";

import { useRoomListRowInteractions } from "@/features/room/hooks";
import type { RoomListRow } from "@/shared/types/room";

import { RoomListItemView } from "./RoomListItemView";

export type RoomListItemProps = {
  row: RoomListRow;
  onNavigate: (roomId: string) => void;
  onOpenActionMenu: (roomId: string) => void;
};

/**
 * 방 목록 행: 제스처·키보드 로직을 훅에 두고, UI는 View에 위임.
 */
export const RoomListItem = memo(function RoomListItem({
  row,
  onNavigate,
  onOpenActionMenu,
}: RoomListItemProps) {
  const interactions = useRoomListRowInteractions({
    roomId: row.id,
    onNavigate,
    onOpenActionMenu,
  });

  return (
    <RoomListItemView
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
