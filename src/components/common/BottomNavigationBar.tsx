import { Flag, Home, Map, Menu, User } from "lucide-react";

import { cn } from "@/lib/utils";

export type BottomNavId = "list" | "room" | "home" | "course" | "mypage";

export type BottomNavigationBarProps = {
  activeId: BottomNavId;
  className?: string;
};

const items: { id: BottomNavId; label: string; Icon: typeof Home }[] = [
  { id: "list", label: "목록", Icon: Menu },
  { id: "room", label: "방", Icon: Flag },
  { id: "home", label: "홈", Icon: Home },
  { id: "course", label: "코스 짜기", Icon: Map },
  { id: "mypage", label: "마이페이지", Icon: User },
];

export function BottomNavigationBar({ activeId, className }: BottomNavigationBarProps) {
  return (
    <nav
      className={cn(
        "border-border/60 bg-background overflow-hidden rounded-t-lg pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2",
        "border-t shadow-[0_-1px_10px_rgb(0_0_0_/_0.05)]",
        className,
      )}
      aria-label="하단 메뉴"
    >
      <ul className="px-page flex items-stretch justify-between gap-1">
        {items.map(({ id, label, Icon }) => {
          const active = id === activeId;
          return (
            <li key={id} className="min-w-0 flex-1">
              <div
                className={cn(
                  "transition-interaction-nav-transform flex flex-col items-center justify-center gap-1 py-1 text-center text-[0.6rem] font-medium leading-tight",
                  active ? "scale-[1.03]" : "scale-100",
                )}
              >
                <Icon
                  className={cn(
                    "transition-interaction-nav-color size-5 shrink-0",
                    active ? "text-brand-coral" : "text-muted-foreground/45",
                  )}
                  strokeWidth={active ? 2.25 : 2}
                  aria-hidden
                />
                <span
                  className={cn(
                    "transition-interaction-nav-color max-w-full truncate px-0.5",
                    active ? "text-brand-coral" : "text-muted-foreground/85",
                  )}
                >
                  {label}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
