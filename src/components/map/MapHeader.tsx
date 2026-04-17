import { cn } from "@/lib/utils";

export type MapHeaderProps = {
  title: string;
  className?: string;
};

export function MapHeader({ title, className }: MapHeaderProps) {
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
      </div>
    </header>
  );
}
