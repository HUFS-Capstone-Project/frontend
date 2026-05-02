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
        "relative z-20 shrink-0 pt-[max(1rem,env(safe-area-inset-top))]",
        variant === "overlay" ? LIST_TOP_BAR_OVERLAY_CLASS : "bg-background sticky top-0",
      )}
    >
      <div className="flex h-12 items-center px-5">
        {showBack ? (
          <button
            type="button"
            onClick={onBack}
            className="touch-target-min -ml-3 flex items-center justify-center rounded-full"
          >
            <ArrowLeft className="size-5 text-[#222222]" aria-hidden />
            <span className="sr-only">{backLabel}</span>
          </button>
        ) : (
          <span className="w-9 shrink-0" aria-hidden />
        )}
        <h1 className="flex-1 text-center text-base leading-tight font-semibold tracking-tight text-[#111111]">
          {title}
        </h1>
        <span
          className={cn(
            "max-w-[48%] shrink-0 truncate text-right text-xs font-semibold text-[#555555]",
            trailingClassName,
          )}
        >
          {trailing}
        </span>
      </div>
      {children}
    </header>
  );
}
