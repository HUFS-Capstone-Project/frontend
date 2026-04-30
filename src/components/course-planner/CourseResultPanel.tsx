import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

export type CourseOption = {
  id: string;
  title: string;
  description: string;
};

type CourseResultPanelProps = {
  courses: CourseOption[];
  selectedCourseId: string;
  onSelectCourse: (courseId: string) => void;
};

export function CourseResultPanel({
  courses,
  selectedCourseId,
  onSelectCourse,
}: CourseResultPanelProps) {
  return (
    <section className="bg-background px-6 pt-8 pb-0">
      <h1 className="text-foreground text-[1.25rem] leading-tight font-semibold tracking-[-0.01em]">
        맞춤 데이트코스 확인하기
      </h1>
      <p className="text-muted-foreground mt-1.5 text-[0.75rem] leading-snug">
        마음에 드는 코스를 선택해서 장소 정보를 확인해보세요.
      </p>

      <div className="mt-6 grid gap-4 pb-1">
        {courses.map((course) => {
          const selected = course.id === selectedCourseId;
          return (
            <button
              key={course.id}
              type="button"
              onClick={() => onSelectCourse(course.id)}
              className={cn(
                "focus-visible:ring-ring/50 flex min-h-20 w-full gap-3 rounded-xl border px-4 py-4 text-left transition-colors focus-visible:ring-3 focus-visible:outline-none",
                selected
                  ? "border-primary bg-primary/10 shadow-sm"
                  : "border-border bg-background hover:bg-muted/40",
              )}
            >
              <div className="min-w-0 flex-1">
                <span className="text-foreground block text-[1rem] leading-snug font-medium">
                  {course.title}
                </span>
                <span className="text-muted-foreground mt-1.5 block text-[0.75rem] leading-snug">
                  {course.description}
                </span>
              </div>
              <ChevronRight
                className={cn(
                  "size-5 shrink-0 self-center",
                  selected ? "text-primary" : "text-muted-foreground",
                )}
                aria-hidden
              />
            </button>
          );
        })}
      </div>
    </section>
  );
}
