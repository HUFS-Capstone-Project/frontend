import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AmPmTimeWheelGroup } from "@/components/course-planner/AmPmTimeWheelGroup";
import { isEndAfterStart, isHmString } from "@/components/course-planner/course-date-time";
import { cn } from "@/lib/utils";

const weekdayLabels = ["일", "월", "화", "수", "목", "금", "토"];

function parseDateAnchor(value: string | null) {
  if (!value) return new Date();

  const match = /^(\d{4})\.(\d{2})\.(\d{2})$/.exec(value);
  if (!match) return new Date();

  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function formatDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}

function getMonthMatrixBase(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  return {
    year,
    month,
    startBlankCount: firstDay.getDay(),
    dayCount: lastDay.getDate(),
  };
}

type DateCalendarPanelProps = {
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
};

/** 날짜만 선택하는 캘린더 카드 */
export function DateCalendarPanel({ selectedDate, onSelectDate }: DateCalendarPanelProps) {
  const parsedAnchorDate = useMemo(() => parseDateAnchor(selectedDate), [selectedDate]);
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(parsedAnchorDate));

  useEffect(() => {
    if (selectedDate !== null) return;
    const id = requestAnimationFrame(() => {
      const now = new Date();
      setVisibleMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    });
    return () => cancelAnimationFrame(id);
  }, [selectedDate]);

  const { year, month, startBlankCount, dayCount } = useMemo(
    () => getMonthMatrixBase(visibleMonth),
    [visibleMonth],
  );
  const monthLabel = `${visibleMonth.getFullYear()}년 ${visibleMonth.getMonth() + 1}월`;

  const moveMonth = (offset: number) => {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  };

  return (
    <div className="border-border bg-card overflow-hidden rounded-xl border">
      <header className="flex items-center justify-between px-3.5 py-4">
        <button
          type="button"
          onClick={() => moveMonth(-1)}
          className="text-primary hover:bg-primary/10 focus-visible:ring-ring/50 inline-flex size-8 items-center justify-center rounded-full transition-colors focus-visible:ring-3 focus-visible:outline-none"
          aria-label="이전 달"
        >
          <ChevronLeft className="size-4" aria-hidden />
        </button>

        <div className="text-foreground flex items-center gap-1 text-sm font-bold">
          <span>{monthLabel}</span>
        </div>

        <button
          type="button"
          onClick={() => moveMonth(1)}
          className="text-primary hover:bg-primary/10 focus-visible:ring-ring/50 inline-flex size-8 items-center justify-center rounded-full transition-colors focus-visible:ring-3 focus-visible:outline-none"
          aria-label="다음 달"
        >
          <ChevronRight className="size-4" aria-hidden />
        </button>
      </header>

      <div className="px-3.5 pt-1 pb-4">
        <div className="text-muted-foreground grid grid-cols-7 py-0.5 text-center text-[0.65rem] font-semibold">
          {weekdayLabels.map((weekday) => (
            <span key={weekday} className="py-1.5">
              {weekday}
            </span>
          ))}
        </div>

        <div className="mt-1.5 grid grid-cols-7 gap-y-1.5 text-center">
          {Array.from({ length: startBlankCount }).map((_, index) => (
            <span key={`blank-${year}-${month}-${index}`} aria-hidden />
          ))}
          {Array.from({ length: dayCount }).map((_, index) => {
            const day = index + 1;
            const date = new Date(year, month, day);
            const dateValue = formatDateValue(date);
            const selected = selectedDate !== null && dateValue === selectedDate;

            return (
              <button
                key={dateValue}
                type="button"
                onClick={() => onSelectDate(dateValue)}
                className={cn(
                  "focus-visible:ring-ring/50 mx-auto flex size-8 items-center justify-center rounded-full text-[0.8rem] font-medium transition-colors focus-visible:ring-3 focus-visible:outline-none",
                  selected
                    ? "bg-primary text-primary-foreground font-bold"
                    : "text-foreground hover:bg-muted/60",
                )}
                aria-label={date.toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  weekday: "long",
                })}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

type DateTimeWheelsPanelProps = {
  selectedDate: string | null;
  selectedStartTime: string | null;
  selectedEndTime: string | null;
  onSelectStartTime: (time: string | null) => void;
  onSelectEndTime: (time: string | null) => void;
};

/** 시작·종료 시간 휠 (날짜가 정해진 뒤 단계 화면에서만 사용) */
export function DateTimeWheelsPanel({
  selectedDate,
  selectedStartTime,
  selectedEndTime,
  onSelectStartTime,
  onSelectEndTime,
}: DateTimeWheelsPanelProps) {
  const showStartWheels = selectedDate !== null;
  const showEndWheels = showStartWheels && isHmString(selectedStartTime);

  if (!showStartWheels) return null;

  return (
    <div className="grid grid-cols-2 gap-3">
      <AmPmTimeWheelGroup
        label="우리 언제 만날까?"
        value={selectedStartTime}
        onChange={(time) => {
          onSelectStartTime(time);
          if (time === null) {
            onSelectEndTime(null);
            return;
          }
          if (
            isHmString(selectedEndTime) &&
            isHmString(time) &&
            !isEndAfterStart(time, selectedEndTime)
          ) {
            onSelectEndTime(null);
          }
        }}
      />
      {showEndWheels ? (
        <AmPmTimeWheelGroup
          label="언제까지 함께할까?"
          value={selectedEndTime}
          onChange={(time) => {
            if (
              time !== null &&
              isHmString(selectedStartTime) &&
              !isEndAfterStart(selectedStartTime, time)
            ) {
              onSelectEndTime(null);
              return;
            }
            onSelectEndTime(time);
          }}
        />
      ) : (
        <div className="min-w-0" aria-hidden />
      )}
    </div>
  );
}
