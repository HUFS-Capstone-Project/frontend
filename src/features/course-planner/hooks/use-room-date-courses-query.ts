import {
  type InfiniteData,
  useInfiniteQuery,
  type UseInfiniteQueryOptions,
} from "@tanstack/react-query";

import {
  dateCourseApi,
  type DateCourseCursorListResponse,
  type SavedRoomDateCourseItemResponse,
} from "@/features/course-planner/api/date-course-api";
import { dateCourseQueryKeys } from "@/features/course-planner/query-keys";

const DEFAULT_LIMIT = 20;

type UseRoomDateCoursesQueryOptions = {
  roomId?: string | null;
  limit?: number;
  enabled?: boolean;
  queryOptions?: Omit<
    UseInfiniteQueryOptions<
      DateCourseCursorListResponse<SavedRoomDateCourseItemResponse>,
      Error,
      InfiniteData<DateCourseCursorListResponse<SavedRoomDateCourseItemResponse>, string | null>,
      ReturnType<typeof dateCourseQueryKeys.roomList>,
      string | null
    >,
    "queryKey" | "queryFn" | "enabled" | "initialPageParam" | "getNextPageParam"
  >;
};

export function useRoomDateCoursesQuery({
  roomId,
  limit = DEFAULT_LIMIT,
  enabled = true,
  queryOptions,
}: UseRoomDateCoursesQueryOptions) {
  const resolvedRoomId = roomId ?? "";

  return useInfiniteQuery<
    DateCourseCursorListResponse<SavedRoomDateCourseItemResponse>,
    Error,
    InfiniteData<DateCourseCursorListResponse<SavedRoomDateCourseItemResponse>, string | null>,
    ReturnType<typeof dateCourseQueryKeys.roomList>,
    string | null
  >({
    queryKey: dateCourseQueryKeys.roomList(resolvedRoomId, limit),
    queryFn: ({ pageParam }) =>
      dateCourseApi.listRoomDateCourses(resolvedRoomId, { limit, cursor: pageParam }),
    initialPageParam: null,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.nextCursor : undefined),
    staleTime: 1000 * 60,
    retry: 1,
    enabled: enabled && Boolean(roomId),
    ...(queryOptions ?? {}),
  });
}
