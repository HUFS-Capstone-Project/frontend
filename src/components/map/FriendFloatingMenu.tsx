import { MoreHorizontal, User } from "lucide-react";

import { cn } from "@/lib/utils";
import type { RoomFriend } from "@/shared/types/map-home";

export type FriendFloatingMenuProps = {
  friends: RoomFriend[];
  selectedFriendId?: number | null;
  open: boolean;
  onToggle: () => void;
  onSelectFriend?: (friendId: number | null) => void;
  className?: string;
};

export function FriendFloatingMenu({
  friends,
  selectedFriendId = null,
  open,
  onToggle,
  onSelectFriend,
  className,
}: FriendFloatingMenuProps) {
  return (
    <div className={cn("pointer-events-auto", className)}>
      <div
        className={cn(
          "pointer-events-none absolute right-0 bottom-14 flex flex-col items-end gap-2",
        )}
      >
        <ul className="flex flex-col items-end gap-2" role="list" aria-label="방 참여 친구">
          {friends.length > 0 ? (
            <li>
              <button
                type="button"
                className={cn(
                  "border-background shadow-floating pointer-events-auto inline-flex size-12 items-center justify-center rounded-full border-2 text-[0.68rem] font-semibold transition-all duration-200",
                  selectedFriendId == null
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground",
                  open
                    ? "translate-y-0 scale-100 opacity-100"
                    : "pointer-events-none translate-y-1.5 scale-90 opacity-0",
                )}
                style={open ? { transitionDelay: `${friends.length * 45}ms` } : undefined}
                aria-label="전체 장소 보기"
                aria-pressed={selectedFriendId == null}
                onClick={() => onSelectFriend?.(null)}
              >
                ALL
              </button>
            </li>
          ) : null}
          {friends.map((friend, index) => (
            <li key={friend.id}>
              <button
                type="button"
                className={cn(
                  "bg-muted text-muted-foreground border-background shadow-floating pointer-events-auto inline-flex size-12 items-center justify-center overflow-hidden rounded-full border-2 transition-all duration-200",
                  selectedFriendId === friend.userId && "border-primary ring-primary/25 ring-3",
                  open
                    ? "translate-y-0 scale-100 opacity-100"
                    : "pointer-events-none translate-y-1.5 scale-90 opacity-0",
                )}
                style={
                  open ? { transitionDelay: `${(friends.length - 1 - index) * 45}ms` } : undefined
                }
                aria-label={friend.name}
                aria-pressed={selectedFriendId === friend.userId}
                title={friend.me ? `${friend.name} (나)` : friend.name}
                onClick={() =>
                  onSelectFriend?.(selectedFriendId === friend.userId ? null : friend.userId)
                }
              >
                {friend.profileImageUrl ? (
                  <img
                    src={friend.profileImageUrl}
                    alt=""
                    className="size-full object-cover"
                    draggable={false}
                  />
                ) : (
                  <User className="size-5" strokeWidth={2} aria-hidden />
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-label="친구 목록 열기"
        className="bg-primary text-primary-foreground focus-visible:ring-ring focus-visible:ring-offset-background active:bg-primary/90 inline-flex size-12 items-center justify-center rounded-full shadow-md outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      >
        <MoreHorizontal className="size-6" strokeWidth={2.4} aria-hidden />
      </button>
    </div>
  );
}
