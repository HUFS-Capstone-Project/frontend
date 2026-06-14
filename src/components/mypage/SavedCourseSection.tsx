import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import type { SavedCourse } from "@/shared/types/course";

import { SavedCourseCard } from "./SavedCourseCard";

const PREVIEW_COUNT = 2;

type SavedCourseSectionProps = {
  courses: SavedCourse[];
  isLoading?: boolean;
  onOpenFullList: () => void;
  onSelectCourse: (course: SavedCourse) => void;
};

export function SavedCourseSection({
  courses,
  isLoading = false,
  onOpenFullList,
  onSelectCourse,
}: SavedCourseSectionProps) {
  const previewCourses = courses.slice(0, PREVIEW_COUNT);
  const hasCourses = !isLoading && courses.length > 0;

  return (
    <section className="bg-card border-border/40 mt-4 rounded-[1.4rem] border px-4 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
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

      {isLoading ? (
        <div className="mt-3 space-y-1" aria-label="저장된 데이트 코스를 불러오는 중">
          {Array.from({ length: PREVIEW_COUNT }, (_, index) => (
            <div
              key={`course-preview-skeleton-${index}`}
              className="flex items-center gap-3 py-2.5"
            >
              <div className="bg-muted/65 size-9 shrink-0 animate-pulse rounded-full" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="bg-muted/65 h-3.5 w-[48%] animate-pulse rounded-md" />
                <div className="bg-muted/45 h-3 w-[72%] animate-pulse rounded-md" />
              </div>
              <div className="bg-muted/45 size-4 shrink-0 animate-pulse rounded-full" />
            </div>
          ))}
        </div>
      ) : hasCourses ? (
        <div className="divide-border/35 mt-3 divide-y">
          {previewCourses.map((course) => (
            <SavedCourseCard key={course.id} course={course} onSelect={onSelectCourse} />
          ))}
        </div>
      ) : (
        <div className="border-border/60 bg-muted/15 mt-3 flex min-h-28 flex-col items-center justify-center rounded-xl border border-dashed px-4 text-center">
          <p className="text-foreground text-xs font-semibold">아직 저장한 데이트코스가 없어요</p>
          <p className="text-muted-foreground mt-1 text-[0.7rem] leading-relaxed font-medium">
            코스를 만들면 이곳에 차곡차곡 모아둘게요
          </p>
        </div>
      )}
    </section>
  );
}
