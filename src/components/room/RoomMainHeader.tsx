import { useLogout } from "@/features/auth/hooks/use-logout";
import { cn } from "@/lib/utils";

import { ROOM_SEARCH_DEFAULT_PLACEHOLDER, RoomSearchField } from "./RoomSearchField";

export type RoomMainHeaderProps = {
  title: string;
  /** 검색창 placeholder (기본: 친구 이름 또는 장소 검색) */
  searchPlaceholder?: string;
  className?: string;
};

export function RoomMainHeader({
  title,
  searchPlaceholder = ROOM_SEARCH_DEFAULT_PLACEHOLDER,
  className,
}: RoomMainHeaderProps) {
  const { handleLogout } = useLogout();

  return (
    <header
      className={cn(
        "bg-room-header-gradient flex flex-col gap-4 px-page pt-[max(1rem,env(safe-area-inset-top))] pb-3 text-white",
        className,
      )}
    >
      <div className="flex items-center gap-1.5">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <span className="inline-flex h-7 shrink-0 items-center justify-center" aria-hidden>
            <img
              src="/assets/marker.svg"
              alt=""
              width={21}
              height={28}
              className="h-7 w-auto object-contain"
              draggable={false}
            />
          </span>
          <h1 className="min-w-0 text-base font-semibold leading-tight tracking-tight">{title}</h1>
        </div>
        <button
          type="button"
          onClick={() => void handleLogout()}
          className="text-white/90 hover:text-white focus-visible:ring-ring -me-0.5 shrink-0 rounded-md px-1 py-1 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--room-header-gradient-to)]"
        >
          로그아웃
        </button>
      </div>

      <RoomSearchField placeholder={searchPlaceholder} name="room-search" />
    </header>
  );
}
