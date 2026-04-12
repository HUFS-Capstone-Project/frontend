import { Pin, User } from "lucide-react";
import { memo } from "react";

import { cn } from "@/lib/utils";
import type { FriendRoomRow } from "@/shared/types/room";

export type FriendRoomItemViewProps = {
  row: FriendRoomRow;
  onOuterClick: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onTouchStart: () => void;
  onTouchMove: () => void;
  onTouchEnd: () => void;
  onTouchCancel: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
};

/**
 * 방 목록 행 UI 전용 (상태·제스처 로직 없음).
 */
export const FriendRoomItemView = memo(function FriendRoomItemView({
  row,
  onOuterClick,
  onContextMenu,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onTouchCancel,
  onKeyDown,
}: FriendRoomItemViewProps) {
  const pinned = Boolean(row.isPinned);

  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        "transition-interaction-row px-page grid origin-center grid-cols-[auto_minmax(0,1fr)_auto] grid-rows-[auto_auto] items-center gap-x-3.5 gap-y-px rounded-xl py-3",
        "focus-visible:ring-ring focus-visible:ring-offset-background cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "hover:bg-muted/30 active:bg-muted/40 active:scale-[0.995]",
      )}
      onClick={onOuterClick}
      onContextMenu={onContextMenu}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchCancel}
      onKeyDown={onKeyDown}
    >
      <span
        className="bg-muted text-muted-foreground col-start-1 row-span-2 row-start-1 flex size-12 shrink-0 items-center justify-center self-center rounded-full"
        aria-hidden
      >
        <User className="size-5" strokeWidth={2} />
      </span>

      <div className="text-room-title text-foreground col-start-2 row-start-1 min-w-0">
        <span className="inline-flex max-w-full min-w-0 items-center gap-1">
          <span className="min-w-0 truncate">{row.displayName}</span>
          {pinned ? (
            <span
              className="text-muted-foreground inline-flex shrink-0"
              title="상단 고정됨"
              aria-label="상단 고정됨"
            >
              <Pin
                className="fill-muted-foreground stroke-muted-foreground size-3.5"
                strokeWidth={2}
                aria-hidden
              />
            </span>
          ) : null}
        </span>
      </div>
      <p className="text-room-meta text-muted-foreground/75 col-start-2 row-start-2 min-w-0 truncate">
        멤버 {row.memberCount}명
      </p>

      <div className="col-start-3 row-span-2 row-start-1 flex shrink-0 flex-col items-center justify-center self-center">
        <span className="text-room-meta text-brand-coral cursor-pointer text-center">
          {row.placeCount}개 장소
        </span>
      </div>
    </div>
  );
});
