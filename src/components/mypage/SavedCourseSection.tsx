import type { SavedCourse } from "./mypage-mock-data";
import { SavedCourseCard } from "./SavedCourseCard";

type SavedCourseSectionProps = {
  courses: SavedCourse[];
  visibleCount: number;
  onShowMore: () => void;
  onShowAll: () => void;
  onSelectCourse: (course: SavedCourse) => void;
};

export function SavedCourseSection({
  courses,
  visibleCount,
  onShowMore,
  onShowAll,
  onSelectCourse,
}: SavedCourseSectionProps) {
  const visibleCourses = courses.slice(0, visibleCount);
  const hasCourses = courses.length > 0;
  const hasHiddenCourses = visibleCount < courses.length;
  const actionLabel = hasHiddenCourses ? "5개 더보기" : "코스 전체보기";

  return (
    <section className="mt-6">
      <h2 className="text-sm font-semibold text-[#111111]">저장된 데이트 코스</h2>

      {hasCourses ? (
        <>
          <div className="mt-3 space-y-2">
            {visibleCourses.map((course) => (
              <SavedCourseCard key={course.id} course={course} onSelect={onSelectCourse} />
            ))}
          </div>

          <button
            type="button"
            onClick={hasHiddenCourses ? onShowMore : onShowAll}
            className="mt-3 flex h-9 w-full items-center justify-center rounded-lg border border-[#e8e8e8] bg-white text-xs font-semibold text-[#222222] active:bg-[#f7f7f7]"
          >
            {actionLabel}
            <span className="ml-1 text-sm">⌄</span>
          </button>
        </>
      ) : (
        <div className="flex min-h-[16rem] items-center justify-center text-xs font-medium text-[#9a9a9a]">
          데이트 코스를 저장해보세요!
        </div>
      )}
    </section>
  );
}
