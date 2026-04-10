import { Heart, User } from "lucide-react";
import { memo } from "react";

import { cn } from "@/lib/utils";
import type { FriendRoomRow } from "@/shared/types/room";

export type FriendRoomItemViewProps = {
  row: FriendRoomRow;
  liked: boolean;
  onOuterClick: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onTouchStart: () => void;
  onTouchMove: () => void;
  onTouchEnd: () => void;
  onTouchCancel: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onFavoriteClick: (e: React.MouseEvent) => void;
  onFavoriteTouchStart: (e: React.TouchEvent) => void;
};

/**
 * 방 목록 행 UI 전용 (상태·제스처 로직 없음).
 */
export const FriendRoomItemView = memo(function FriendRoomItemView({
  row,
  liked,
  onOuterClick,
  onContextMenu,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onTouchCancel,
  onKeyDown,
  onFavoriteClick,
  onFavoriteTouchStart,
}: FriendRoomItemViewProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        "transition-interaction-row grid origin-center grid-cols-[auto_minmax(0,1fr)_auto] grid-rows-[auto_auto] items-center gap-x-3.5 gap-y-px rounded-xl px-page py-3",
        "cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "hover:bg-muted/30 active:scale-[0.995] active:bg-muted/40",
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

      <p className="text-room-title col-start-2 row-start-1 min-w-0 truncate text-foreground">
        {row.displayName}
      </p>
      <p className="text-room-meta text-muted-foreground/75 col-start-2 row-start-2 min-w-0 truncate">
        멤버 {row.memberCount}명
      </p>

      <div className="col-start-3 row-span-2 row-start-1 flex shrink-0 flex-col items-center justify-center gap-1.5 self-center">
        <button
          type="button"
          onClick={onFavoriteClick}
          onTouchStart={onFavoriteTouchStart}
          className="inline-flex size-8 items-center justify-center rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label={liked ? "즐겨찾기 해제" : "즐겨찾기"}
          aria-pressed={liked}
        >
          <Heart
            className={cn(
              "size-[1.125rem] shrink-0 text-brand-coral",
              liked ? "fill-brand-coral" : "fill-none",
            )}
            aria-hidden
          />
        </button>
        <span className="text-room-meta cursor-pointer text-center text-brand-coral">
          {row.placeCount}개 장소
        </span>
      </div>
    </div>
  );
});
