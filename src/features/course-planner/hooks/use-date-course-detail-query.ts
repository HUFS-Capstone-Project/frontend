import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import {
  dateCourseApi,
  type DateCourseDetailResponse,
} from "@/features/course-planner/api/date-course-api";
import { dateCourseQueryKeys } from "@/features/course-planner/query-keys";

type UseDateCourseDetailQueryOptions = {
  roomId?: string | null;
  dateCourseId?: string | null;
  enabled?: boolean;
  queryOptions?: Omit<
    UseQueryOptions<
      DateCourseDetailResponse,
      Error,
      DateCourseDetailResponse,
      ReturnType<typeof dateCourseQueryKeys.detail>
    >,
    "queryKey" | "queryFn" | "enabled"
  >;
};

export function useDateCourseDetailQuery({
  roomId,
  dateCourseId,
  enabled = true,
  queryOptions,
}: UseDateCourseDetailQueryOptions) {
  const resolvedRoomId = roomId ?? "";
  const resolvedDateCourseId = dateCourseId ?? "";

  return useQuery({
    queryKey: dateCourseQueryKeys.detail(resolvedRoomId, resolvedDateCourseId),
    queryFn: () => dateCourseApi.getDateCourseDetail(resolvedRoomId, resolvedDateCourseId),
    staleTime: 1000 * 60,
    retry: 1,
    enabled: enabled && Boolean(roomId) && Boolean(dateCourseId),
    ...(queryOptions ?? {}),
  });
}
