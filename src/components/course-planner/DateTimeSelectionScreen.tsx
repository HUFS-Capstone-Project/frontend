import { ChevronLeft, X } from "lucide-react";
import { useEffect, useState } from "react";

import { isEndAfterStart, isHmString } from "@/components/course-planner/course-date-time";
import {
  DateCalendarPanel,
  DateTimeWheelsPanel,
} from "@/components/course-planner/DateTimeSelectionPanel";
import { cn } from "@/lib/utils";

type DateTimeStep = "date" | "time";

type DateTimeSelectionScreenProps = {
  selectedDate: string | null;
  selectedStartTime: string | null;
  selectedEndTime: string | null;
  onSelectDate: (date: string) => void;
  onSelectStartTime: (time: string | null) => void;
  onSelectEndTime: (time: string | null) => void;
  onClose: () => void;
  onConfirm: () => void;
};

function formatSelectedDateLine(dateStr: string) {
  const d = new Date(dateStr.replaceAll(".", "/"));
  const weekday = d.toLocaleDateString("ko-KR", { weekday: "long" });
  return `${dateStr} ${weekday}`;
}

export function DateTimeSelectionScreen({
  selectedDate,
  selectedStartTime,
  selectedEndTime,
  onSelectDate,
  onSelectStartTime,
  onSelectEndTime,
  onClose,
  onConfirm,
}: DateTimeSelectionScreenProps) {
  const [step, setStep] = useState<DateTimeStep>(() =>
    selectedDate !== null ? "time" : "date",
  );

  useEffect(() => {
    if (selectedDate !== null) return;
    const id = requestAnimationFrame(() => {
      setStep("date");
    });
    return () => cancelAnimationFrame(id);
  }, [selectedDate]);

  const handlePickDate = (date: string) => {
    onSelectDate(date);
    setStep("time");
  };

  const canConfirm =
    selectedDate !== null &&
    isHmString(selectedStartTime) &&
    isHmString(selectedEndTime) &&
    isEndAfterStart(selectedStartTime, selectedEndTime);

  const headerTitle = step === "date" ? "날짜 선택" : "시간 설정";

  return (
    <section className="bg-background px-6 pt-8 pb-0">
      <div className="flex items-center gap-2">
        {step === "time" ? (
          <button
            type="button"
            onClick={() => setStep("date")}
            className="text-muted-foreground hover:bg-muted/45 focus-visible:ring-ring/50 inline-flex size-8 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:ring-3 focus-visible:outline-none"
            aria-label="날짜 선택으로 돌아가기"
          >
            <ChevronLeft className="size-4" aria-hidden />
          </button>
        ) : (
          <span className="size-8 shrink-0" aria-hidden />
        )}

        <h1 className="text-foreground grow text-center text-base font-bold">{headerTitle}</h1>

        <button
          type="button"
          onClick={onClose}
          className="text-muted-foreground hover:bg-muted/45 focus-visible:ring-ring/50 inline-flex size-8 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:ring-3 focus-visible:outline-none"
          aria-label="날짜 및 시간 설정 닫기"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>

      {step === "time" && selectedDate !== null ? (
        <p className="text-muted-foreground mt-2 text-center text-sm font-medium">
          {formatSelectedDateLine(selectedDate)}
        </p>
      ) : null}

      <div className="mt-4">
        {step === "date" ? (
          <DateCalendarPanel selectedDate={selectedDate} onSelectDate={handlePickDate} />
        ) : (
          <DateTimeWheelsPanel
            selectedDate={selectedDate}
            selectedStartTime={selectedStartTime}
            selectedEndTime={selectedEndTime}
            onSelectStartTime={onSelectStartTime}
            onSelectEndTime={onSelectEndTime}
          />
        )}
      </div>

      {step === "time" ? (
        <button
          type="button"
          onClick={onConfirm}
          disabled={!canConfirm}
          className={cn(
            "focus-visible:ring-ring/50 mt-4 inline-flex h-11 w-full items-center justify-center rounded-lg text-sm font-semibold transition-colors focus-visible:ring-3 focus-visible:outline-none disabled:pointer-events-none",
            canConfirm
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-muted-foreground/45 text-primary-foreground",
          )}
        >
          설정하기
        </button>
      ) : null}
    </section>
  );
}
