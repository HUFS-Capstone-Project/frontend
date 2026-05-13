import { memo, useCallback, useMemo } from "react";

import type { RoomListRow } from "@/shared/types/room";

import { RoomListItem } from "./RoomListItem";

export type RoomListProps = {
  rows: RoomListRow[];
  onRoomNavigate: (row: RoomListRow) => void;
  onOpenRoomActions: (row: RoomListRow) => void;
};

/**
 * 방 목록 컨테이너. 정렬·고정 상태는 상위에서 합쳐진 `rows`를 그대로 표시합니다.
 */
export const RoomList = memo(function RoomList({
  rows,
  onRoomNavigate,
  onOpenRoomActions,
}: RoomListProps) {
  const rowById = useMemo(() => {
    const m = new Map<string, RoomListRow>();
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
    <ul className="divide-border/35 divide-y" role="list">
      {rows.map((row) => (
        <li key={row.id}>
          <RoomListItem row={row} onNavigate={navigateById} onOpenActionMenu={openMenuById} />
        </li>
      ))}
    </ul>
  );
});
