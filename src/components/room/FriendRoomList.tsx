import { memo, useCallback, useState } from "react";

import type { FriendRoomRow } from "@/shared/types/room";

import { FriendRoomItem } from "./FriendRoomItem";

export type FriendRoomListProps = {
  rows: FriendRoomRow[];
  onRoomNavigate: (row: FriendRoomRow) => void;
  onOpenRoomActions: (row: FriendRoomRow) => void;
};

/**
 * 목록 컨테이너: 즐겨찾기 로컬 상태 + 행별 콜백은 roomId 기준으로 안정화해 자식 memo와 맞춤.
 */
export const FriendRoomList = memo(function FriendRoomList({
  rows,
  onRoomNavigate,
  onOpenRoomActions,
}: FriendRoomListProps) {
  const [likes, setLikes] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(rows.map((r) => [r.id, r.liked])),
  );

  const navigateById = useCallback(
    (id: string) => {
      const row = rows.find((r) => r.id === id);
      if (row) onRoomNavigate(row);
    },
    [rows, onRoomNavigate],
  );

  const openMenuById = useCallback(
    (id: string) => {
      const row = rows.find((r) => r.id === id);
      if (row) onOpenRoomActions(row);
    },
    [rows, onOpenRoomActions],
  );

  const toggleFavoriteById = useCallback((id: string) => {
    setLikes((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  return (
    <ul className="divide-y divide-border/35" role="list">
      {rows.map((row) => (
        <li key={row.id}>
          <FriendRoomItem
            row={row}
            liked={likes[row.id] ?? false}
            onToggleFavorite={toggleFavoriteById}
            onNavigate={navigateById}
            onOpenActionMenu={openMenuById}
          />
        </li>
      ))}
    </ul>
  );
});
