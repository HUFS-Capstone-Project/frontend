import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import type { RecentPlace } from "@/shared/types/my-page";

type MyPlaceSummaryCardProps = {
  totalCount: number;
  recentPlaces: RecentPlace[];
  onOpenPlaces?: () => void;
  className?: string;
};

function formatCount(count: number) {
  return count > 999 ? "999+" : String(count);
}

export function MyPlaceSummaryCard({
  totalCount,
  recentPlaces,
  onOpenPlaces,
  className,
}: MyPlaceSummaryCardProps) {
  const hasPlaces = totalCount > 0;

  return (
    <section className={cn("border-border bg-card rounded-xl border px-4 py-4", className)}>
      <button
        type="button"
        onClick={onOpenPlaces}
        className="group touch-target-min flex w-full items-center justify-between gap-3 text-left"
      >
        <h2 className="text-foreground text-[0.95rem] font-semibold">나의 장소</h2>
        <span className="text-muted-foreground/50 group-hover:text-muted-foreground inline-flex shrink-0 items-center gap-0.5 rounded-md px-1 py-1 text-xs font-semibold transition-colors">
          더보기
          <ChevronRight className="size-3.5" aria-hidden />
        </span>
      </button>

      <p className="text-foreground mt-2 text-center text-2xl font-semibold">
        {formatCount(totalCount)}개
      </p>

      <div className="mt-5">
        <p className="text-foreground text-xs font-medium">최근 저장 장소</p>
        <div className="divide-border mt-2 divide-y">
          {hasPlaces ? (
            recentPlaces.slice(0, 2).map((place) => (
              <p key={place.id} className="text-foreground truncate py-2 text-xs font-medium">
                {place.name}
              </p>
            ))
          ) : (
            <p className="text-muted-foreground truncate py-2 text-xs font-medium">
              나의 장소를 저장해보세요!
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
