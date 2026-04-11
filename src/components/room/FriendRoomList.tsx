import { memo, useCallback, useMemo } from "react";

import type { FriendRoomRow } from "@/shared/types/room";

import { FriendRoomItem } from "./FriendRoomItem";

export type FriendRoomListProps = {
  rows: FriendRoomRow[];
  onRoomNavigate: (row: FriendRoomRow) => void;
  onOpenRoomActions: (row: FriendRoomRow) => void;
};

/**
 * 방 목록 컨테이너. 정렬·고정 상태는 상위에서 합쳐진 `rows`를 그대로 표시합니다.
 */
export const FriendRoomList = memo(function FriendRoomList({
  rows,
  onRoomNavigate,
  onOpenRoomActions,
}: FriendRoomListProps) {
  const rowById = useMemo(() => {
    const m = new Map<string, FriendRoomRow>();
    for (const r of rows) m.set(r.id, r);
    return m;
  }, [rows]);

  const navigateById = useCallback(
    (id: string) => {
      const row = rowById.get(id);
      if (row) onRoomNavigate(row);
    },
    [rowById, onRoomNavigate],
  );

  const openMenuById = useCallback(
    (id: string) => {
      const row = rowById.get(id);
      if (row) onOpenRoomActions(row);
    },
    [rowById, onOpenRoomActions],
  );

  return (
    <ul className="divide-y divide-border/35" role="list">
      {rows.map((row) => (
        <li key={row.id}>
          <FriendRoomItem row={row} onNavigate={navigateById} onOpenActionMenu={openMenuById} />
        </li>
      ))}
    </ul>
  );
});
