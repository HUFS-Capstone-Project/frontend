import { Heart, User } from "lucide-react";

import { cn } from "@/lib/utils";
import type { FriendRoomRow } from "@/shared/types/room";

export type FriendRoomItemProps = {
  row: FriendRoomRow;
  liked: boolean;
  onToggleFavorite: () => void;
};

export function FriendRoomItem({ row, liked, onToggleFavorite }: FriendRoomItemProps) {
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] grid-rows-[auto_auto] items-center gap-x-3.5 gap-y-px px-page py-3">
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
          onClick={onToggleFavorite}
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
        <span className="text-room-meta text-center text-brand-coral">
          {row.placeCount}개 장소
        </span>
      </div>
    </div>
  );
}
