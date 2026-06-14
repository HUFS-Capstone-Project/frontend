import { ChevronRight } from "lucide-react";

import { PlaceCategoryIconChip } from "@/components/link-place/PlaceCategoryIconChip";
import { cn } from "@/lib/utils";
import type { RecentPlace } from "@/shared/types/my-page";

type MyPlaceSummaryCardProps = {
  totalCount: number;
  recentPlaces: RecentPlace[];
  isLoading?: boolean;
  onOpenPlaces?: () => void;
  className?: string;
};

function formatCount(count: number) {
  return count > 999 ? "999+" : String(count);
}

export function MyPlaceSummaryCard({
  totalCount,
  recentPlaces,
  isLoading = false,
  onOpenPlaces,
  className,
}: MyPlaceSummaryCardProps) {
  const hasPlaces = !isLoading && totalCount > 0;

  return (
    <section
      className={cn(
        "bg-card border-border/40 rounded-[1.4rem] border px-4 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]",
        className,
      )}
    >
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

      <div className="mt-2 flex h-8 items-center justify-center" aria-busy={isLoading}>
        {isLoading ? (
          <span className="bg-muted/70 h-7 w-16 animate-pulse rounded-md" aria-hidden />
        ) : (
          <p className="text-foreground text-2xl font-semibold">{formatCount(totalCount)}개</p>
        )}
      </div>

      <div className="mt-5">
        <p className="text-foreground text-xs font-medium">최근 저장 장소</p>
        <div className="divide-border mt-2 divide-y">
          {isLoading ? (
            <MyPlaceSummarySkeletonRows />
          ) : hasPlaces ? (
            recentPlaces.slice(0, 2).map((place) => (
              <div key={place.id} className="flex min-w-0 items-center gap-1.5 py-2">
                <PlaceCategoryIconChip
                  place={{ category: place.category, categoryName: place.categoryName }}
                  className="size-4"
                  iconClassName="size-2.5 shrink-0 opacity-100"
                />
                <p className="text-foreground min-w-0 flex-1 truncate text-xs font-medium">
                  {place.name}
                </p>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground py-2 text-xs leading-relaxed font-medium">
              마음에 드는 장소를 저장해보세요!
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function MyPlaceSummarySkeletonRows() {
  return (
    <>
      <div className="flex items-center gap-1.5 py-2">
        <div className="bg-muted/60 size-4 shrink-0 animate-pulse rounded-full" aria-hidden />
        <div className="bg-muted/60 h-3.5 w-32 animate-pulse rounded-md" />
      </div>
      <div className="flex items-center gap-1.5 py-2">
        <div className="bg-muted/50 size-4 shrink-0 animate-pulse rounded-full" aria-hidden />
        <div className="bg-muted/50 h-3.5 w-24 animate-pulse rounded-md" />
      </div>
    </>
  );
}
