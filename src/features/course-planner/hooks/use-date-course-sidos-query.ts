import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import {
  dateCourseApi,
  type DateCourseRegionFilterOption,
} from "@/features/course-planner/api/date-course-api";
import { dateCourseQueryKeys } from "@/features/course-planner/query-keys";

const ONE_DAY_MS = 1000 * 60 * 60 * 24;

type UseDateCourseSidosQueryOptions = {
  roomId: string | null;
  enabled?: boolean;
  queryOptions?: Omit<
    UseQueryOptions<
      DateCourseRegionFilterOption[],
      Error,
      DateCourseRegionFilterOption[],
      ReturnType<typeof dateCourseQueryKeys.sidos>
    >,
    "queryKey" | "queryFn" | "enabled"
  >;
};

export function useDateCourseSidosQuery({
  roomId,
  enabled = true,
  queryOptions,
}: UseDateCourseSidosQueryOptions) {
  return useQuery({
    queryKey: dateCourseQueryKeys.sidos(roomId ?? ""),
    queryFn: () => {
      if (!roomId) {
        throw new Error("roomId is required");
      }

      return dateCourseApi.listDateCourseSidos(roomId);
    },
    staleTime: ONE_DAY_MS,
    gcTime: ONE_DAY_MS,
    retry: 1,
    enabled: enabled && Boolean(roomId),
    ...(queryOptions ?? {}),
  });
}
