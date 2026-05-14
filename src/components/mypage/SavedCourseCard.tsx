import { ChevronRight, Heart, UsersRound } from "lucide-react";

import { cn } from "@/lib/utils";
import type { SavedCourse } from "@/shared/types/course";

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
        "flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-left",
        "active:bg-muted/45 transition-colors",
        className,
      )}
    >
      <span className="bg-brand-coral-soft text-primary flex size-9 shrink-0 items-center justify-center rounded-full">
        {isFriendCourse ? (
          <span className="text-[0.65rem] font-semibold">친구</span>
        ) : (
          <Icon className="size-3.5 fill-current" aria-hidden />
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className="text-foreground block truncate text-[0.8rem] font-semibold">
          {course.title}
        </span>
        <span className="text-muted-foreground mt-0.5 block truncate text-[0.66rem] font-medium">
          {course.executedAtLabel}
        </span>
      </span>

      <ChevronRight className="text-muted-foreground/55 size-4 shrink-0" aria-hidden />
    </button>
  );
}
