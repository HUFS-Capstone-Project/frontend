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
    <section className="bg-background px-4 pt-1 pb-5">
      <h1 className="text-foreground text-lg font-bold">맞춤 데이트코스 확인하기</h1>
      <p className="text-muted-foreground mt-2 text-sm leading-5">
        마음에 드는 코스를 선택해서 장소 정보를 확인해보세요.
      </p>

      <div className="mt-6 grid gap-3">
        {courses.map((course) => {
          const selected = course.id === selectedCourseId;
          return (
            <button
              key={course.id}
              type="button"
              onClick={() => onSelectCourse(course.id)}
              className={cn(
                "focus-visible:ring-ring/50 flex h-12 items-center justify-between rounded-lg border px-4 text-left transition-colors focus-visible:ring-3 focus-visible:outline-none",
                selected
                  ? "border-primary bg-primary/10"
                  : "border-border bg-background hover:bg-muted/35",
              )}
            >
              <span>
                <span className="text-foreground block text-sm font-semibold">{course.title}</span>
                <span className="text-muted-foreground mt-0.5 block text-xs">
                  {course.description}
                </span>
              </span>
              <ChevronRight className="text-muted-foreground size-4" aria-hidden />
            </button>
          );
        })}
      </div>
    </section>
  );
}
