import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

export type DateTimeSelection = {
  date: string;
  weekday: string;
  startTime: string | null;
  endTime: string | null;
};

type DateTimeSelectionPanelProps = {
  selectedDate: string;
  selectedStartTime: string | null;
  selectedEndTime: string | null;
  onSelectDate: (date: string) => void;
  onSelectStartTime: (time: string | null) => void;
  onSelectEndTime: (time: string | null) => void;
  onClose: () => void;
  onConfirm: () => void;
};

const weekdayLabels = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const weekdaysKo = ["\uc77c", "\uc6d4", "\ud654", "\uc218", "\ubaa9", "\uae08", "\ud1a0"];
const monthLabel = "April 2026";
const monthStartBlankCount = 3;
const dateOptions = Array.from({ length: 30 }, (_, index) => {
  const day = index + 1;
  const date = `2026.04.${String(day).padStart(2, "0")}`;
  const weekday = weekdaysKo[new Date(2026, 3, day).getDay()];
  return { date, day, weekday };
});
const startTimeOptions = ["11:00", "12:00", "13:00", "14:00", "15:00"];
const endTimeOptions = ["18:00", "19:00", "20:00", "21:00"];

export function getDateTimeDisplayValue(selection: DateTimeSelection | null) {
  if (!selection) return "";
  if (!selection.startTime || !selection.endTime) {
    return `${selection.date} ${selection.weekday}\uc694\uc77c`;
  }
  return `${selection.date} ${selection.weekday}\uc694\uc77c ${selection.startTime} ~ ${selection.endTime}`;
}

export function DateTimeSelectionPanel({
  selectedDate,
  selectedStartTime,
  selectedEndTime,
  onSelectDate,
  onSelectStartTime,
  onSelectEndTime,
  onClose,
  onConfirm,
}: DateTimeSelectionPanelProps) {
  const selectedDateOption = dateOptions.find((option) => option.date === selectedDate) ?? dateOptions[19];
  const hasTimeRange = selectedStartTime != null && selectedEndTime != null;
  const confirmLabel = hasTimeRange
    ? `${selectedDateOption.date} ${selectedStartTime} ~ ${selectedEndTime} \uc124\uc815\ud558\uae30`
    : `${selectedDateOption.date} \uc124\uc815\ud558\uae30`;

  return (
    <section className="relative z-30 -mt-44 flex justify-center px-4 pb-7">
      <div className="w-[280px] overflow-hidden rounded-xl bg-white shadow-[0_18px_50px_rgba(15,23,42,0.22)] ring-1 ring-black/5">
        <header className="flex items-center justify-between px-3.5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-7 items-center justify-center rounded-full text-[#454545] transition-colors hover:bg-[#f4f4f5] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            aria-label="\ub0a0\uc9dc \ubc0f \uc2dc\uac04 \uc124\uc815 \ub2eb\uae30"
          >
            <ChevronLeft className="size-4" aria-hidden />
          </button>

          <div className="flex items-center gap-1 text-sm font-bold text-[#252525]">
            <span>{monthLabel}</span>
            <ChevronRight className="size-3.5 text-[#2687d9]" aria-hidden />
          </div>

          <div className="flex items-center gap-1 text-[#2687d9]">
            <button
              type="button"
              className="inline-flex size-7 items-center justify-center rounded-full transition-colors hover:bg-[#eef7ff] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              aria-label="\uc774\uc804 \ub2ec"
            >
              <ChevronLeft className="size-4" aria-hidden />
            </button>
            <button
              type="button"
              className="inline-flex size-7 items-center justify-center rounded-full transition-colors hover:bg-[#eef7ff] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              aria-label="\ub2e4\uc74c \ub2ec"
            >
              <ChevronRight className="size-4" aria-hidden />
            </button>
          </div>
        </header>

        <div className="px-3.5 pb-2">
          <div className="grid grid-cols-7 text-center text-[0.58rem] font-semibold text-[#a3a3a3]">
            {weekdayLabels.map((weekday) => (
              <span key={weekday} className="py-1">
                {weekday}
              </span>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-y-1 text-center">
            {Array.from({ length: monthStartBlankCount }).map((_, index) => (
              <span key={`blank-${index}`} aria-hidden />
            ))}
            {dateOptions.map((option) => {
              const selected = option.date === selectedDateOption.date;
              return (
                <button
                  key={option.date}
                  type="button"
                  onClick={() => onSelectDate(option.date)}
                  className={cn(
                    "mx-auto flex size-8 items-center justify-center rounded-full text-[0.8rem] font-medium transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                    selected ? "bg-[#7dd3fc] font-bold text-[#0f172a]" : "text-[#171717] hover:bg-[#f1f5f9]",
                  )}
                  aria-label={`${option.date} ${option.weekday}\uc694\uc77c`}
                >
                  {option.day}
                </button>
              );
            })}
          </div>
        </div>

        <div className="border-t border-[#ededed] px-3.5 py-2.5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-semibold text-[#303030]">Time</span>
            <button
              type="button"
              onClick={() => {
                onSelectStartTime(null);
                onSelectEndTime(null);
              }}
              className={cn(
                "rounded-full px-2.5 py-1 text-[0.68rem] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                hasTimeRange ? "bg-[#f4f4f5] text-[#71717a] hover:bg-[#e9e9ec]" : "bg-[#fff0ee] text-[#f06f6b]",
              )}
            >
              {hasTimeRange ? `${selectedStartTime} ~ ${selectedEndTime}` : "\uc2dc\uac04 \uc9c0\uc815 \uc548 \ud568"}
            </button>
          </div>

          <div className="mt-2 grid gap-1.5">
            <TimeChipRow
              label="\uc2dc\uc791"
              selectedTime={selectedStartTime}
              options={startTimeOptions}
              onSelect={(time) => {
                onSelectStartTime(time);
                if (!selectedEndTime || time >= selectedEndTime) {
                  onSelectEndTime("21:00");
                }
              }}
            />
            <TimeChipRow
              label="\uc885\ub8cc"
              selectedTime={selectedEndTime}
              options={endTimeOptions}
              onSelect={(time) => {
                if (selectedStartTime && time <= selectedStartTime) return;
                onSelectEndTime(time);
              }}
            />
          </div>
        </div>

        <div className="px-3.5 pb-3">
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex h-9 w-full items-center justify-center rounded-lg bg-[#f06f6b] text-xs font-semibold text-white transition-colors hover:bg-[#e86460] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </section>
  );
}

type TimeChipRowProps = {
  label: string;
  selectedTime: string | null;
  options: string[];
  onSelect: (time: string) => void;
};

function TimeChipRow({ label, selectedTime, options, onSelect }: TimeChipRowProps) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-7 shrink-0 text-[0.65rem] font-semibold text-[#8a8a8a]">{label}</span>
      <div className="flex min-w-0 flex-1 gap-1 overflow-x-auto pb-0.5">
        {options.map((time) => {
          const selected = time === selectedTime;
          return (
            <button
              key={time}
              type="button"
              onClick={() => onSelect(time)}
              className={cn(
                "shrink-0 rounded-md px-2 py-1 text-[0.68rem] font-medium transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                selected ? "bg-[#fff0ee] text-[#f06f6b]" : "bg-[#fafafa] text-[#5f5f5f] hover:bg-[#f1f1f1]",
              )}
            >
              {time}
            </button>
          );
        })}
      </div>
    </div>
  );
}