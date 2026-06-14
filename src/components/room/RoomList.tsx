import { memo, useCallback, useMemo } from "react";

import type { RoomListRow } from "@/shared/types/room";

import { RoomListItem } from "./RoomListItem";

export type RoomListProps = {
  rows: RoomListRow[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onRoomNavigate: (row: RoomListRow) => void;
  onOpenRoomActions: (row: RoomListRow) => void;
};

/**
 * 방 목록 컨테이너. 정렬·고정 상태는 상위에서 합쳐진 `rows`를 그대로 표시합니다.
 */
export const RoomList = memo(function RoomList({
  rows,
  isLoading = false,
  emptyTitle = "아직 방이 없어요",
  emptyDescription = "함께 장소를 모을 방을 만들어보세요",
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

  if (isLoading) {
    return <RoomListSkeleton />;
  }

  if (rows.length === 0) {
    return <RoomListEmptyState title={emptyTitle} description={emptyDescription} />;
  }

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

function RoomListSkeleton() {
  return (
    <div className="divide-border/35 divide-y" aria-label="방 목록을 불러오는 중">
      {Array.from({ length: 5 }, (_, index) => (
        <div
          key={`room-list-skeleton-${index}`}
          className="px-page grid grid-cols-[auto_minmax(0,1fr)_auto] grid-rows-[auto_auto] items-center gap-x-3.5 gap-y-px py-4"
        >
          <div className="bg-muted/70 col-start-1 row-span-2 row-start-1 size-12 animate-pulse rounded-full" />
          <div className="bg-muted/65 col-start-2 row-start-1 h-4 w-[52%] animate-pulse rounded-md" />
          <div className="bg-muted/45 col-start-2 row-start-2 h-3 w-[32%] animate-pulse rounded-md" />
          <div className="bg-muted/50 col-start-3 row-span-2 row-start-1 h-3.5 w-12 animate-pulse rounded-md" />
        </div>
      ))}
    </div>
  );
}

function RoomListEmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="px-page flex min-h-[18rem] flex-col items-center justify-center text-center">
      <p className="text-foreground text-sm font-semibold">{title}</p>
      <p className="text-muted-foreground mt-1.5 max-w-64 text-xs leading-relaxed font-medium">
        {description}
      </p>
    </div>
  );
}
