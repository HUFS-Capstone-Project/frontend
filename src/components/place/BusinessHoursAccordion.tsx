import { ChevronDown, Clock } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import type { BusinessHoursDisplay, WeeklyBusinessHour } from "@/shared/types/business-hours";

type BusinessHoursAccordionProps = {
  businessHours: BusinessHoursDisplay | null | undefined;
};

function buildWeeklyHourLabel(row: WeeklyBusinessHour): string {
  return row.date ? `${row.day}(${row.date})` : row.day;
}

/** 현재 영업 상태 한 줄(예: 영업 중 · 오늘 09:00 오픈) */
export function BusinessHoursStatusSummary({
  businessHours,
}: {
  businessHours: BusinessHoursDisplay | null | undefined;
}) {
  if (!businessHours?.statusDisplayText && !businessHours?.todayDisplayText) {
    return null;
  }

  return (
    <div className="flex items-start gap-3">
      <Clock className="text-muted-foreground mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="min-w-0 space-y-1">
        {businessHours.statusDisplayText ? (
          <p className="text-foreground text-sm leading-snug font-semibold">
            {businessHours.statusDisplayText}
          </p>
        ) : null}
        {businessHours.todayDisplayText ? (
          <p className="text-muted-foreground text-xs leading-snug font-medium">
            {businessHours.todayDisplayText}
          </p>
        ) : null}
      </div>
    </div>
  );
}

/** 요일별 영업시간 접기/펼치기 */
export function BusinessHoursAccordion({ businessHours }: BusinessHoursAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const weeklyHours = businessHours?.weeklyHours ?? [];
  const hasWeeklyRows = weeklyHours.length > 0;

  if (!businessHours || !hasWeeklyRows) {
    return null;
  }

  return (
    <section>
      {hasWeeklyRows ? (
        <div className="border-border border-t pt-4">
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
            <div className="mt-4 space-y-2">
              {weeklyHours.map((row) => (
                <div
                  key={`${row.day}-${row.date ?? ""}-${row.displayText}`}
                  className={cn(
                    "flex items-start justify-between gap-4 text-xs leading-snug",
                    row.isToday ? "text-foreground font-semibold" : "text-muted-foreground",
                  )}
                >
                  <span>{buildWeeklyHourLabel(row)}</span>
                  <span className="min-w-0 text-right">
                    <span className="block">{row.displayText}</span>
                    {row.subTexts.map((subText) => (
                      <span key={subText} className="text-muted-foreground mt-1 block font-normal">
                        {subText}
                      </span>
                    ))}
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
