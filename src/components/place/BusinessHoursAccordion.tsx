import { ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";

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

export function BusinessHoursAccordion({ businessHours }: BusinessHoursAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const todayHours = useMemo(() => {
    return (
      businessHours?.weeklyHours.find((row) => row.isToday) ?? businessHours?.weeklyHours[0] ?? null
    );
  }, [businessHours]);

  if (!businessHours) {
    return (
      <section>
        <p className="text-muted-foreground text-sm">영업시간 정보 없음</p>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <div className="space-y-1">
        <p className="text-foreground text-sm font-semibold">{buildStatusSummary(businessHours)}</p>
        {businessHours.holidayNotice ? (
          <p className="text-muted-foreground text-[0.75rem] leading-snug">
            {businessHours.holidayNotice}
          </p>
        ) : null}
      </div>

      {todayHours ? (
        <div className="border-border border-t pt-3">
          <p className="text-foreground text-sm font-semibold">
            {todayHours.label} {todayHours.hours}
          </p>

          <button
            type="button"
            className="text-foreground hover:text-foreground/80 mt-3 flex w-full items-center justify-between gap-3 text-xs font-semibold"
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
              {businessHours.weeklyHours.map((row) => (
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
      ) : null}
    </section>
  );
}
