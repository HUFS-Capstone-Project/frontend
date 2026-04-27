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

export function BusinessHoursAccordion({
  businessHours,
}: BusinessHoursAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const todayHours = useMemo(() => {
    return (
      businessHours?.weeklyHours.find((row) => row.isToday) ?? businessHours?.weeklyHours[0] ?? null
    );
  }, [businessHours]);

  if (!businessHours) {
    return (
      <section className="space-y-1">
        <p className="text-sm font-semibold text-slate-900">영업시간</p>
        <p className="text-sm text-slate-500">정보 없음</p>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-slate-900">{buildStatusSummary(businessHours)}</p>
        {businessHours.holidayNotice ? (
          <p className="text-sm text-slate-500">{businessHours.holidayNotice}</p>
        ) : null}
      </div>

      {todayHours ? (
        <div className="border-t border-slate-100 pt-3">
          <button
            type="button"
            className="flex w-full items-center justify-between gap-3 text-left"
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-expanded={isExpanded}
          >
            <span className="text-sm font-semibold text-slate-900">
              {todayHours.label} {todayHours.hours}
            </span>
            <ChevronDown
              className={cn(
                "size-4 shrink-0 text-slate-500 transition-transform duration-200",
                isExpanded ? "rotate-180" : "",
              )}
            />
          </button>

          {isExpanded ? (
            <div className="mt-3 space-y-2">
              {businessHours.weeklyHours.map((row) => (
                <div
                  key={`${row.label}-${row.hours}`}
                  className={cn(
                    "flex items-center justify-between gap-4 text-sm",
                    row.isToday ? "font-semibold text-slate-900" : "text-slate-500",
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
