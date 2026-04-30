import { AlertCircle, ArrowLeft, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import { cn } from "@/lib/utils";

import type { SavedCourse } from "./mypage-mock-data";
import { SavedCourseCard } from "./SavedCourseCard";

type SavedCourseListPageProps = {
  courses: SavedCourse[];
  onBack: () => void;
  onSelectCourse: (course: SavedCourse) => void;
};

type CourseFilter = "all" | "room" | "date";
type FilterPopup = Exclude<CourseFilter, "all"> | null;

const rooms = ["친구와의 방", "연인의 방", "남친구와의 방", "친구 4, 친구 5, 친구 6..."];
const aprilDates = Array.from({ length: 30 }, (_, index) => index + 1);

function formatCount(count: number) {
  return count > 999 ? "999+" : String(count);
}

function formatDateLabel(date: number | null) {
  return date ? `2025.04.${String(date).padStart(2, "0")}` : "날짜";
}

export function SavedCourseListPage({ courses, onBack, onSelectCourse }: SavedCourseListPageProps) {
  const [selectedFilter, setSelectedFilter] = useState<CourseFilter>("all");
  const [openPopup, setOpenPopup] = useState<FilterPopup>(null);
  const [selectedRooms, setSelectedRooms] = useState<string[]>([rooms[1]]);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);

  const visibleCourses = useMemo(() => {
    if (selectedFilter === "date" && selectedDate === 26) {
      return [];
    }

    if (selectedFilter === "date" && selectedDate) {
      return courses.slice(0, 4);
    }

    if (selectedFilter === "room" && selectedRooms.length === 0) {
      return [];
    }

    if (selectedFilter === "room") {
      return courses.slice(0, 4);
    }

    return courses;
  }, [courses, selectedDate, selectedFilter, selectedRooms.length]);

  const handleSelectAll = () => {
    setSelectedFilter("all");
    setOpenPopup(null);
  };

  const handleToggleRoom = (room: string) => {
    setSelectedFilter("room");
    setSelectedRooms((current) =>
      current.includes(room) ? current.filter((item) => item !== room) : [...current, room],
    );
  };

  const handleSelectDate = (date: number) => {
    setSelectedFilter("date");
    setSelectedDate(date);
    setOpenPopup(null);
  };

  return (
    <main className="bg-background min-h-0 flex-1 overflow-y-auto pb-28">
      <header className="sticky top-0 z-20 bg-white pt-[max(1rem,env(safe-area-inset-top))] shadow-[0_1px_0_rgb(0_0_0_/_0.06)]">
        <div className="flex h-12 items-center px-5">
          <button
            type="button"
            onClick={onBack}
            className="touch-target-min -ml-3 flex items-center justify-center rounded-full"
          >
            <ArrowLeft className="size-5 text-[#222222]" aria-hidden />
            <span className="sr-only">마이페이지로 돌아가기</span>
          </button>
          <h1 className="flex-1 text-center text-base font-bold text-[#111111]">
            저장된 데이트 코스
          </h1>
          <span className="w-14 text-right text-xs font-semibold text-[#555555]">
            총 {formatCount(visibleCourses.length)}개
          </span>
        </div>

        <div className="relative flex gap-2 overflow-visible px-5 pb-3">
          <button
            type="button"
            onClick={handleSelectAll}
            className={cn(
              "flex h-8 shrink-0 items-center rounded-full border px-4 text-xs font-semibold transition-colors",
              selectedFilter === "all"
                ? "border-[#e6e6e6] bg-[#eeeeee] text-[#111111]"
                : "border-[#e5e5e5] bg-white text-[#222222] active:bg-[#f7f7f7]",
            )}
          >
            전체
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setSelectedFilter("room");
                setOpenPopup((current) => (current === "room" ? null : "room"));
              }}
              className={cn(
                "flex h-8 shrink-0 items-center gap-1 rounded-full border px-4 text-xs font-semibold transition-colors",
                selectedFilter === "room"
                  ? "border-[#e6e6e6] bg-[#eeeeee] text-[#111111]"
                  : "border-[#e5e5e5] bg-white text-[#222222] active:bg-[#f7f7f7]",
              )}
            >
              방
              <ChevronDown className="size-3" aria-hidden />
            </button>

            {openPopup === "room" ? (
              <div className="absolute top-10 left-0 z-30 w-52 rounded-lg border border-[#e8e8e8] bg-white py-2 shadow-[0_8px_24px_rgb(0_0_0_/_0.12)]">
                {rooms.map((room) => {
                  const checked = selectedRooms.includes(room);
                  return (
                    <label
                      key={room}
                      className="flex h-8 cursor-pointer items-center gap-2 px-3 text-xs font-medium text-[#222222]"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleToggleRoom(room)}
                        className="size-3 accent-[#111111]"
                      />
                      <span className="truncate">{room}</span>
                    </label>
                  );
                })}
              </div>
            ) : null}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setSelectedFilter("date");
                setOpenPopup((current) => (current === "date" ? null : "date"));
              }}
              className={cn(
                "flex h-8 shrink-0 items-center gap-1 rounded-full border px-4 text-xs font-semibold transition-colors",
                selectedFilter === "date"
                  ? "border-[#e6e6e6] bg-[#eeeeee] text-[#111111]"
                  : "border-[#e5e5e5] bg-white text-[#222222] active:bg-[#f7f7f7]",
              )}
            >
              {formatDateLabel(selectedDate)}
              <ChevronDown className="size-3" aria-hidden />
            </button>

            {openPopup === "date" ? (
              <div className="absolute top-10 left-[-4.5rem] z-30 w-72 rounded-xl border border-[#e8e8e8] bg-white p-4 shadow-[0_10px_28px_rgb(0_0_0_/_0.14)]">
                <div className="flex items-center justify-between">
                  <strong className="text-sm font-bold text-[#222222]">April 2025</strong>
                  <div className="flex gap-3 text-[#2684ff]">
                    <ChevronLeft className="size-4" aria-hidden />
                    <ChevronRight className="size-4" aria-hidden />
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-7 gap-y-3 text-center text-[0.65rem] font-semibold text-[#9a9a9a]">
                  {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
                    <span key={day}>{day}</span>
                  ))}
                </div>
                <div className="mt-3 grid grid-cols-7 gap-y-2 text-center text-xs font-medium text-[#222222]">
                  {aprilDates.map((date) => (
                    <button
                      key={date}
                      type="button"
                      onClick={() => handleSelectDate(date)}
                      className={cn(
                        "mx-auto flex size-7 items-center justify-center rounded-full",
                        selectedDate === date
                          ? "bg-[#dff1ff] font-bold text-[#1687e8]"
                          : "active:bg-[#f3f3f3]",
                      )}
                    >
                      {date}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <section className="px-5 pt-4">
        {visibleCourses.length > 0 ? (
          <div className="space-y-2">
            {visibleCourses.map((course) => (
              <SavedCourseCard key={course.id} course={course} onSelect={onSelectCourse} />
            ))}
          </div>
        ) : (
          <div className="flex min-h-[26rem] flex-col items-center justify-center text-center">
            <span className="flex size-11 items-center justify-center rounded-full bg-[#777777] text-white">
              <AlertCircle className="size-5" aria-hidden />
            </span>
            <p className="mt-4 text-sm font-medium text-[#8a8a8a]">
              해당하는 데이트 코스가 없습니다.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
