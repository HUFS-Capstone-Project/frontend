import { House, Map, MapPinned, Menu, User } from "lucide-react";

import { cn } from "@/lib/utils";
import type { BottomNavId } from "@/shared/config/navigation";

export type { BottomNavId };

export type BottomNavigationBarProps = {
  activeId: BottomNavId;
  onSelect: (id: BottomNavId) => void;
  className?: string;
};

const items: {
  id: BottomNavId;
  label: string;
  Icon: typeof MapPinned;
}[] = [
  { id: "list", label: "목록", Icon: Menu },
  { id: "room", label: "방", Icon: House },
  { id: "map", label: "지도", Icon: MapPinned },
  { id: "course", label: "코스 짜기", Icon: Map },
  { id: "mypage", label: "마이페이지", Icon: User },
];

export function BottomNavigationBar({ activeId, onSelect, className }: BottomNavigationBarProps) {
  return (
    <nav
      className={cn(
        "border-border/60 bg-background overflow-hidden rounded-t-3xl pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]",
        "shadow-nav border-t",
        className,
      )}
      aria-label="하단 메뉴"
    >
      <ul className="px-page flex items-stretch justify-between gap-1">
        {items.map(({ id, label, Icon }) => {
          const active = id === activeId;
          return (
            <li key={id} className="min-w-0 flex-1">
              <button
                type="button"
                onClick={() => onSelect(id)}
                className={cn(
                  "transition-interaction-nav-transform touch-target-min flex w-full flex-col items-center justify-center gap-1 py-1 text-center text-[0.6rem] leading-tight font-medium outline-none",
                  "focus-visible:ring-ring focus-visible:ring-2",
                  active ? "scale-[1.03]" : "scale-100",
                )}
              >
                <Icon
                  className={cn(
                    "transition-interaction-nav-color size-5 shrink-0",
                    active ? "text-primary" : "text-muted-foreground/45",
                  )}
                  strokeWidth={active ? 2.25 : 2}
                  aria-hidden
                />
                <span
                  className={cn(
                    "transition-interaction-nav-color max-w-full truncate px-0.5",
                    active ? "text-primary" : "text-muted-foreground/85",
                  )}
                >
                  {label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
