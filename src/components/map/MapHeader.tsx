import { Menu } from "lucide-react";

import { cn } from "@/lib/utils";

export type MapHeaderProps = {
  title: string;
  onOpenList?: () => void;
  className?: string;
};

export function MapHeader({ title, onOpenList, className }: MapHeaderProps) {
  return (
    <header
      className={cn(
        "bg-room-header-gradient text-room-header-foreground px-page relative z-20 pt-[max(1rem,env(safe-area-inset-top))] pb-3",
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

        {onOpenList ? (
          <button
            type="button"
            className="text-room-header-foreground hover:bg-room-header-foreground/15 active:bg-room-header-foreground/20 flex size-10 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:outline-none"
            aria-label="목록 열기"
            title="목록 열기"
            onClick={onOpenList}
          >
            <Menu className="size-5" aria-hidden />
          </button>
        ) : null}
      </div>
    </header>
  );
}
