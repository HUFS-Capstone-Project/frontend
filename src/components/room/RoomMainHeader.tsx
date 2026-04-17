import { SearchField } from "@/components/common/SearchField";
import { useLogout } from "@/features/auth/hooks/use-logout";
import { cn } from "@/lib/utils";

const ROOM_SEARCH_DEFAULT_PLACEHOLDER = "친구 이름 또는 장소 검색";

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
        "bg-room-header-gradient text-room-header-foreground px-page flex flex-col gap-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3",
        className,
      )}
    >
      <div className="flex items-center gap-1.5">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <span className="inline-flex h-7 shrink-0 items-center justify-center" aria-hidden>
            <img
              src="/assets/marker-logo.svg"
              alt=""
              width={21}
              height={28}
              className="h-7 w-auto object-contain"
              draggable={false}
            />
          </span>
          <h1 className="min-w-0 text-base leading-tight font-semibold tracking-tight">{title}</h1>
        </div>
        <button
          type="button"
          onClick={() => void handleLogout()}
          className="focus-visible:ring-ring text-room-header-foreground-muted hover:text-room-header-foreground -me-0.5 shrink-0 rounded-md px-1 py-1 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--room-header-gradient-to)]"
        >
          로그아웃
        </button>
      </div>

      <SearchField placeholder={searchPlaceholder} name="room-search" />
    </header>
  );
}
