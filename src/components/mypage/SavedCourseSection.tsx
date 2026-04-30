import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

import type { SavedCourse } from "./mypage-mock-data";
import { SavedCourseCard } from "./SavedCourseCard";

const PREVIEW_COUNT = 3;

type SavedCourseSectionProps = {
  courses: SavedCourse[];
  onOpenFullList: () => void;
  onSelectCourse: (course: SavedCourse) => void;
};

export function SavedCourseSection({
  courses,
  onOpenFullList,
  onSelectCourse,
}: SavedCourseSectionProps) {
  const previewCourses = courses.slice(0, PREVIEW_COUNT);
  const hasCourses = courses.length > 0;

  return (
    <section className="mt-6">
      <div className={cn("flex items-center gap-3", hasCourses && "justify-between")}>
        <h2 className="text-foreground min-w-0 shrink text-base font-semibold tracking-tight">
          저장된 데이트 코스
        </h2>
        {hasCourses ? (
          <button
            type="button"
            onClick={onOpenFullList}
            className="text-muted-foreground/50 hover:text-muted-foreground touch-target-min inline-flex shrink-0 items-center gap-0.5 rounded-md px-1 py-1 text-xs font-semibold transition-colors"
          >
            더보기
            <ChevronRight className="size-3.5" aria-hidden />
          </button>
        ) : null}
      </div>

      {hasCourses ? (
        <div className="mt-3 space-y-2">
          {previewCourses.map((course) => (
            <SavedCourseCard key={course.id} course={course} onSelect={onSelectCourse} />
          ))}
        </div>
      ) : (
        <div className="text-muted-foreground border-border/60 bg-muted/15 mt-4 flex min-h-40 items-center justify-center rounded-xl border border-dashed text-xs font-medium">
          데이트 코스를 저장해보세요!
        </div>
      )}
    </section>
  );
}
