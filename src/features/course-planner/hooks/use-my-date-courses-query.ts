import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import {
  dateCourseApi,
  type DateCourseListResponse,
  type MySavedDateCourseItemResponse,
} from "@/features/course-planner/api/date-course-api";
import { dateCourseQueryKeys } from "@/features/course-planner/query-keys";

const DEFAULT_PAGE = 0;
const DEFAULT_LIMIT = 100;

type UseMyDateCoursesQueryOptions = {
  page?: number;
  limit?: number;
  enabled?: boolean;
  queryOptions?: Omit<
    UseQueryOptions<
      DateCourseListResponse<MySavedDateCourseItemResponse>,
      Error,
      DateCourseListResponse<MySavedDateCourseItemResponse>,
      ReturnType<typeof dateCourseQueryKeys.myList>
    >,
    "queryKey" | "queryFn" | "enabled"
  >;
};

export function useMyDateCoursesQuery({
  page = DEFAULT_PAGE,
  limit = DEFAULT_LIMIT,
  enabled = true,
  queryOptions,
}: UseMyDateCoursesQueryOptions = {}) {
  return useQuery({
    queryKey: dateCourseQueryKeys.myList(page, limit),
    queryFn: () => dateCourseApi.listMyDateCourses({ page, limit }),
    staleTime: 1000 * 60,
    retry: 1,
    enabled,
    ...(queryOptions ?? {}),
  });
}
