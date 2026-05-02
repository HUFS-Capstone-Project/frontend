import { useCallback, useMemo } from "react";

import { COURSE_OPTIONS, getCourseStopsMock } from "@/shared/mocks/course-mocks";
import type { CourseOption, CourseStop } from "@/shared/types/course";

type UseCoursePlannerCoursesResult = {
  courses: CourseOption[];
  defaultCourseId: string | null;
  getCourseStops: (courseId: string | null) => CourseStop[];
};

export function useCoursePlannerCourses(): UseCoursePlannerCoursesResult {
  const courses = useMemo(() => COURSE_OPTIONS, []);
  const defaultCourseId = courses[0]?.id ?? null;

  const getCourseStops = useCallback(
    (courseId: string | null) => getCourseStopsMock(courseId ?? defaultCourseId ?? ""),
    [defaultCourseId],
  );

  return {
    courses,
    defaultCourseId,
    getCourseStops,
  };
}
