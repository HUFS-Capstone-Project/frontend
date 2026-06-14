import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const PLACE_OPTIONS_MENU_SHELL_CLASS =
  "bg-card absolute top-full right-0 z-10 mt-1.5 min-w-[6.75rem] overflow-hidden rounded-xl border border-border/35 p-1 shadow-[0_8px_24px_rgba(15,23,42,0.07)]";

type PlaceOptionsMenuProps = {
  children: ReactNode;
  className?: string;
};

export function PlaceOptionsMenu({ children, className }: PlaceOptionsMenuProps) {
  return (
    <div role="menu" className={cn(PLACE_OPTIONS_MENU_SHELL_CLASS, className)}>
      {children}
    </div>
  );
}

type PlaceOptionsMenuItemProps = {
  children: ReactNode;
  onClick: () => void;
  variant?: "default" | "danger";
};

export function PlaceOptionsMenuItem({
  children,
  onClick,
  variant = "default",
}: PlaceOptionsMenuItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={cn(
        "hover:bg-muted/35 active:bg-muted/45 flex w-full items-center rounded-lg px-3 py-2 text-left text-xs transition-colors duration-150",
        variant === "danger"
          ? "font-semibold text-(--brand-coral-solid)"
          : "text-muted-foreground font-medium",
      )}
    >
      {children}
    </button>
  );
}
