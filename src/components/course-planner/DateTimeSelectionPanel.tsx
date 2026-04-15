import { CalendarDays, ChevronLeft } from "lucide-react";

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

const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
const monthLabel = "April 2026";
const dateOptions = Array.from({ length: 14 }, (_, index) => {
  const day = 14 + index;
  const date = `2026.04.${String(day).padStart(2, "0")}`;
  const weekday = weekdays[new Date(2026, 3, day).getDay()];
  return { date, day, weekday };
});
const timeOptions = ["11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"];

export function getDateTimeDisplayValue(selection: DateTimeSelection | null) {
  if (!selection) return "";
  if (!selection.startTime || !selection.endTime) {
    return `${selection.date} ${selection.weekday}요일`;
  }
  return `${selection.date} ${selection.weekday}요일 ${selection.startTime} ~ ${selection.endTime}`;
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
  const selectedDateOption = dateOptions.find((option) => option.date === selectedDate) ?? dateOptions[0];
  const hasTimeRange = selectedStartTime != null && selectedEndTime != null;

  return (
    <section className="relative z-20 -mt-9 rounded-t-[28px] bg-white px-4 pb-7 pt-5 shadow-[0_-16px_40px_rgba(15,23,42,0.08)]">
      <div className="mx-auto mb-4 h-1 w-14 rounded-full bg-[#d9d9d9]" />

      <header className="flex items-center gap-2">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex size-8 items-center justify-center rounded-full text-[#52525b] transition-colors hover:bg-[#f4f4f5] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          aria-label="날짜 및 시간 설정 닫기"
        >
          <ChevronLeft className="size-4" aria-hidden />
        </button>
        <h1 className="text-base font-bold text-[#171717]">날짜 및 시간 설정</h1>
      </header>

      <div className="mt-5 rounded-2xl border border-[#eeeeee] bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-[#171717]">{monthLabel}</p>
            <p className="mt-1 text-xs text-[#9ca3af]">오늘 이후 날짜만 선택할 수 있어요</p>
          </div>
          <CalendarDays className="size-5 text-[#f06f6b]" aria-hidden />
        </div>

        <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[0.7rem] font-semibold text-[#a1a1aa]">
          {weekdays.map((weekday) => (
            <span key={weekday}>{weekday}</span>
          ))}
        </div>

        <div className="mt-2 grid grid-cols-7 gap-1">
          {dateOptions.map((option) => {
            const selected = option.date === selectedDateOption.date;
            return (
              <button
                key={option.date}
                type="button"
                onClick={() => onSelectDate(option.date)}
                className={cn(
                  "flex aspect-square items-center justify-center rounded-full text-sm transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  selected ? "bg-[#f06f6b] font-bold text-white" : "text-[#171717] hover:bg-[#fff0ee]",
                )}
                aria-label={`${option.date} ${option.weekday}요일`}
              >
                {option.day}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#171717]">시간 설정</h2>
          <button
            type="button"
            onClick={() => {
              onSelectStartTime(null);
              onSelectEndTime(null);
            }}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold transition-colors",
              hasTimeRange ? "bg-[#f4f4f5] text-[#71717a]" : "bg-[#fff0ee] text-[#f06f6b]",
            )}
          >
            시간 지정 안 함
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <TimeColumn
            label="시작"
            selectedTime={selectedStartTime}
            options={timeOptions.slice(0, -1)}
            onSelect={(time) => {
              onSelectStartTime(time);
              if (!selectedEndTime || time >= selectedEndTime) {
                onSelectEndTime("21:00");
              }
            }}
          />
          <TimeColumn
            label="종료"
            selectedTime={selectedEndTime}
            options={timeOptions.slice(1)}
            onSelect={(time) => {
              if (selectedStartTime && time <= selectedStartTime) return;
              onSelectEndTime(time);
            }}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={onConfirm}
        className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-lg bg-[#f06f6b] text-sm font-semibold text-white transition-colors hover:bg-[#e86460] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {hasTimeRange
          ? `${selectedDateOption.date} ${selectedStartTime} ~ ${selectedEndTime} 설정하기`
          : `${selectedDateOption.date} 설정하기`}
      </button>
    </section>
  );
}

type TimeColumnProps = {
  label: string;
  selectedTime: string | null;
  options: string[];
  onSelect: (time: string) => void;
};

function TimeColumn({ label, selectedTime, options, onSelect }: TimeColumnProps) {
  return (
    <div className="rounded-2xl border border-[#eeeeee] bg-[#fafafa] p-2">
      <p className="px-2 py-1 text-xs font-semibold text-[#71717a]">{label}</p>
      <div className="mt-1 grid max-h-44 gap-1 overflow-y-auto pr-1">
        {options.map((time) => {
          const selected = time === selectedTime;
          return (
            <button
              key={time}
              type="button"
              onClick={() => onSelect(time)}
              className={cn(
                "h-9 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                selected ? "bg-[#fff0ee] text-[#f06f6b]" : "bg-white text-[#52525b] hover:bg-[#f4f4f5]",
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
