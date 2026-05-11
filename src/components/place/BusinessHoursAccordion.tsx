import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import type { ResolvedPlaceBusinessHours } from "@/shared/types/map-home";

type BusinessHoursAccordionProps = {
  businessHours: ResolvedPlaceBusinessHours | null | undefined;
};

function buildStatusSummary(businessHours: ResolvedPlaceBusinessHours): string {
  if (businessHours.openTime) {
    return `${businessHours.status} ${businessHours.openTime} 오픈`;
  }

  return businessHours.status;
}

/** 현재 영업 상태 한 줄(예: 영업 중 · 오늘 09:00 오픈) */
export function BusinessHoursStatusSummary({
  businessHours,
}: {
  businessHours: ResolvedPlaceBusinessHours | null | undefined;
}) {
  if (!businessHours) {
    return null;
  }

  return (
    <p className="text-foreground text-sm font-semibold">{buildStatusSummary(businessHours)}</p>
  );
}

/** 요일별 영업시간 접기/펼치기 */
export function BusinessHoursAccordion({ businessHours }: BusinessHoursAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const weeklyHours = businessHours?.weeklyHours ?? [];
  const hasWeeklyRows = weeklyHours.length > 0;
  const todayHours = weeklyHours.find((row) => row.isToday) ?? weeklyHours[0] ?? null;

  if (!businessHours || !hasWeeklyRows) {
    return null;
  }

  return (
    <section className="space-y-3">
      {todayHours ? (
        <p className="text-foreground text-sm font-semibold">
          {todayHours.label} {todayHours.hours}
        </p>
      ) : null}

      <div className="border-border border-t pt-3">
        <button
          type="button"
          className="text-foreground hover:text-foreground/80 flex w-full items-center justify-between gap-3 text-xs font-semibold"
          aria-expanded={isExpanded}
          onClick={() => setIsExpanded((current) => !current)}
        >
          <span>전체 영업시간</span>
          <ChevronDown
            className={cn("size-4 transition-transform", isExpanded ? "rotate-180" : "")}
            aria-hidden
          />
        </button>

        {isExpanded ? (
          <div className="mt-3 space-y-2">
            {weeklyHours.map((row) => (
              <div
                key={`${row.label}-${row.hours}`}
                className={cn(
                  "flex items-center justify-between gap-4 text-xs leading-snug",
                  row.isToday ? "text-foreground font-semibold" : "text-muted-foreground",
                )}
              >
                <span>{row.label}</span>
                <span>{row.hours}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
