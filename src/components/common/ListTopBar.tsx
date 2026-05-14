import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type ListTopBarVariant = "sticky" | "overlay";

type ListTopBarProps = {
  title: ReactNode;
  trailing: ReactNode;
  variant: ListTopBarVariant;
  showBack?: boolean;
  backLabel?: string;
  onBack?: () => void;
  trailingClassName?: string;
  children?: ReactNode;
};

const LIST_TOP_BAR_OVERLAY_CLASS =
  "border-border/55 bg-background/93 supports-[backdrop-filter]:bg-background/82 border-b border-transparent shadow-[0_8px_24px_oklch(0_0_0/0.05)] backdrop-blur-md backdrop-saturate-150";

export const LIST_TOP_BAR_ROOT_BASE_CLASS =
  "relative z-20 shrink-0 pt-[max(1rem,env(safe-area-inset-top))]";
export const LIST_TOP_BAR_STICKY_CLASS = "bg-background sticky top-0";
export const LIST_TOP_BAR_OVERLAY_BACKDROP_CLASS = LIST_TOP_BAR_OVERLAY_CLASS;
export const LIST_TOP_BAR_ROW_CLASS =
  "grid h-12 grid-cols-[3.5rem_minmax(0,1fr)_3.5rem] items-center px-5";
export const LIST_TOP_BAR_BACK_BUTTON_CLASS =
  "touch-target-min -ml-3 flex items-center justify-center justify-self-start rounded-full";
export const LIST_TOP_BAR_TITLE_CLASS =
  "text-foreground min-w-0 truncate text-center text-base leading-tight font-semibold tracking-tight";
export const LIST_TOP_BAR_TRAILING_CLASS =
  "text-muted-foreground w-14 justify-self-end truncate text-right text-xs font-semibold";
export const LIST_TOP_BAR_AFTER_TITLE_CLASS = "px-5 pt-2 pb-2";

export function ListTopBar({
  title,
  trailing,
  variant,
  showBack = true,
  backLabel = "Back",
  onBack,
  trailingClassName,
  children,
}: ListTopBarProps) {
  return (
    <header
      className={cn(
        LIST_TOP_BAR_ROOT_BASE_CLASS,
        variant === "overlay" ? LIST_TOP_BAR_OVERLAY_BACKDROP_CLASS : LIST_TOP_BAR_STICKY_CLASS,
      )}
    >
      <div className={LIST_TOP_BAR_ROW_CLASS}>
        {showBack ? (
          <button type="button" onClick={onBack} className={LIST_TOP_BAR_BACK_BUTTON_CLASS}>
            <ArrowLeft className="text-foreground size-5" aria-hidden />
            <span className="sr-only">{backLabel}</span>
          </button>
        ) : (
          <span className="w-14 shrink-0" aria-hidden />
        )}
        <h1 className={LIST_TOP_BAR_TITLE_CLASS}>{title}</h1>
        <span className={cn(LIST_TOP_BAR_TRAILING_CLASS, trailingClassName)}>{trailing}</span>
      </div>
      {children}
    </header>
  );
}
