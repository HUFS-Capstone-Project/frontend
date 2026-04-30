import { ChevronRight, Heart, UsersRound } from "lucide-react";

import { cn } from "@/lib/utils";

import type { SavedCourse } from "./mypage-mock-data";

type SavedCourseCardProps = {
  course: SavedCourse;
  onSelect?: (course: SavedCourse) => void;
  className?: string;
};

export function SavedCourseCard({ course, onSelect, className }: SavedCourseCardProps) {
  const isFriendCourse = course.badgeLabel === "친구";
  const Icon = isFriendCourse ? UsersRound : Heart;

  return (
    <button
      type="button"
      onClick={() => onSelect?.(course)}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border border-[#e8e8e8] bg-white px-3 py-3 text-left",
        "transition-colors active:bg-[#fff2f1]",
        className,
      )}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#ffe1df] text-[#ef7773]">
        {isFriendCourse ? (
          <span className="text-[0.65rem] font-semibold">친구</span>
        ) : (
          <Icon className="size-4 fill-current" aria-hidden />
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-[0.82rem] font-semibold text-[#222222]">
          {course.title}
        </span>
        <span className="mt-1 block truncate text-[0.68rem] font-medium text-[#777777]">
          {course.executedAtLabel}
        </span>
      </span>

      <ChevronRight className="size-4 shrink-0 text-[#222222]" aria-hidden />
    </button>
  );
}
