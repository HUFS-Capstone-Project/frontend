import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

import type { RecentPlace } from "./mypage-mock-data";

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
    <section className={cn("rounded-xl border border-[#e5e5e5] bg-white px-4 py-4", className)}>
      <button
        type="button"
        onClick={onOpenPlaces}
        className="touch-target-min flex w-full items-center justify-between text-left"
      >
        <h2 className="text-[0.95rem] font-semibold text-[#111111]">나의 장소</h2>
        <ChevronRight className="size-4 text-[#222222]" aria-hidden />
      </button>

      <p className="mt-2 text-center text-2xl font-semibold text-[#111111]">
        {formatCount(totalCount)}개
      </p>

      <div className="mt-5">
        <p className="text-xs font-medium text-[#222222]">최근 저장 장소</p>
        <div className="mt-2 divide-y divide-[#eeeeee]">
          {hasPlaces ? (
            recentPlaces.slice(0, 2).map((place) => (
              <p key={place.id} className="truncate py-2 text-xs font-medium text-[#222222]">
                {place.name}
              </p>
            ))
          ) : (
            <p className="truncate py-2 text-xs font-medium text-[#9a9a9a]">
              나의 장소를 저장해보세요!
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
