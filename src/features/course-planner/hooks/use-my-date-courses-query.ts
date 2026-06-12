import {
  type InfiniteData,
  useInfiniteQuery,
  type UseInfiniteQueryOptions,
} from "@tanstack/react-query";

import {
  dateCourseApi,
  type DateCourseCursorListResponse,
  type MySavedDateCourseItemResponse,
} from "@/features/course-planner/api/date-course-api";
import { dateCourseQueryKeys } from "@/features/course-planner/query-keys";

const DEFAULT_LIMIT = 20;

type UseMyDateCoursesQueryOptions = {
  limit?: number;
  enabled?: boolean;
  queryOptions?: Omit<
    UseInfiniteQueryOptions<
      DateCourseCursorListResponse<MySavedDateCourseItemResponse>,
      Error,
      InfiniteData<DateCourseCursorListResponse<MySavedDateCourseItemResponse>, string | null>,
      ReturnType<typeof dateCourseQueryKeys.myList>,
      string | null
    >,
    "queryKey" | "queryFn" | "enabled" | "initialPageParam" | "getNextPageParam"
  >;
};

export function useMyDateCoursesQuery({
  limit = DEFAULT_LIMIT,
  enabled = true,
  queryOptions,
}: UseMyDateCoursesQueryOptions = {}) {
  return useInfiniteQuery<
    DateCourseCursorListResponse<MySavedDateCourseItemResponse>,
    Error,
    InfiniteData<DateCourseCursorListResponse<MySavedDateCourseItemResponse>, string | null>,
    ReturnType<typeof dateCourseQueryKeys.myList>,
    string | null
  >({
    queryKey: dateCourseQueryKeys.myList(limit),
    queryFn: ({ pageParam }) => dateCourseApi.listMyDateCourses({ limit, cursor: pageParam }),
    initialPageParam: null,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.nextCursor : undefined),
    staleTime: 1000 * 60,
    retry: 1,
    enabled,
    ...(queryOptions ?? {}),
  });
}
