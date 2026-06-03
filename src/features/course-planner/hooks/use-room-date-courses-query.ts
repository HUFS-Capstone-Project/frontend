import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import {
  dateCourseApi,
  type DateCourseListResponse,
  type SavedRoomDateCourseItemResponse,
} from "@/features/course-planner/api/date-course-api";
import { dateCourseQueryKeys } from "@/features/course-planner/query-keys";

const DEFAULT_PAGE = 0;
const DEFAULT_LIMIT = 100;

type UseRoomDateCoursesQueryOptions = {
  roomId?: string | null;
  page?: number;
  limit?: number;
  enabled?: boolean;
  queryOptions?: Omit<
    UseQueryOptions<
      DateCourseListResponse<SavedRoomDateCourseItemResponse>,
      Error,
      DateCourseListResponse<SavedRoomDateCourseItemResponse>,
      ReturnType<typeof dateCourseQueryKeys.roomList>
    >,
    "queryKey" | "queryFn" | "enabled"
  >;
};

export function useRoomDateCoursesQuery({
  roomId,
  page = DEFAULT_PAGE,
  limit = DEFAULT_LIMIT,
  enabled = true,
  queryOptions,
}: UseRoomDateCoursesQueryOptions) {
  const resolvedRoomId = roomId ?? "";

  return useQuery({
    queryKey: dateCourseQueryKeys.roomList(resolvedRoomId, page, limit),
    queryFn: () => dateCourseApi.listRoomDateCourses(resolvedRoomId, { page, limit }),
    staleTime: 1000 * 60,
    retry: 1,
    enabled: enabled && Boolean(roomId),
    ...(queryOptions ?? {}),
  });
}
