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

export function CourseResultPanel({ courses, selectedCourseId, onSelectCourse }: CourseResultPanelProps) {
  return (
    <section className="relative z-20 -mt-9 rounded-t-[28px] bg-white px-4 pb-7 pt-7 shadow-[0_-16px_40px_rgba(15,23,42,0.08)]">
      <div className="mx-auto mb-6 h-1 w-14 rounded-full bg-[#d9d9d9]" />

      <h1 className="text-lg font-bold text-[#171717]">맞춤 데이트코스 확인하기</h1>
      <p className="mt-2 text-sm leading-5 text-[#71717a]">
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
                "flex h-12 items-center justify-between rounded-lg border px-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                selected
                  ? "border-[#f06f6b] bg-[#fff0ee]"
                  : "border-[#dedede] bg-white hover:bg-[#fafafa]",
              )}
            >
              <span>
                <span className="block text-sm font-semibold text-[#171717]">{course.title}</span>
                <span className="mt-0.5 block text-xs text-[#71717a]">{course.description}</span>
              </span>
              <ChevronRight className="size-4 text-[#52525b]" aria-hidden />
            </button>
          );
        })}
      </div>
    </section>
  );
}
