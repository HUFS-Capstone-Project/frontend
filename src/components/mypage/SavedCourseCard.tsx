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
        "border-border bg-card flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left",
        "active:bg-brand-coral-soft transition-colors",
        className,
      )}
    >
      <span className="bg-brand-coral-soft text-primary flex size-10 shrink-0 items-center justify-center rounded-full">
        {isFriendCourse ? (
          <span className="text-[0.65rem] font-semibold">친구</span>
        ) : (
          <Icon className="size-4 fill-current" aria-hidden />
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className="text-foreground block truncate text-[0.82rem] font-semibold">
          {course.title}
        </span>
        <span className="text-muted-foreground mt-1 block truncate text-[0.68rem] font-medium">
          {course.executedAtLabel}
        </span>
      </span>

      <ChevronRight className="text-foreground size-4 shrink-0" aria-hidden />
    </button>
  );
}
