import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import {
  dateCourseApi,
  type DateCourseRegionFilterOption,
} from "@/features/course-planner/api/date-course-api";
import { dateCourseQueryKeys } from "@/features/course-planner/query-keys";

const ONE_DAY_MS = 1000 * 60 * 60 * 24;

type UseDateCourseSigungusQueryOptions = {
  roomId: string | null;
  sidoCode: string | null;
  enabled?: boolean;
  queryOptions?: Omit<
    UseQueryOptions<
      DateCourseRegionFilterOption[],
      Error,
      DateCourseRegionFilterOption[],
      ReturnType<typeof dateCourseQueryKeys.sigungus>
    >,
    "queryKey" | "queryFn" | "enabled"
  >;
};

export function useDateCourseSigungusQuery({
  roomId,
  sidoCode,
  enabled = true,
  queryOptions,
}: UseDateCourseSigungusQueryOptions) {
  const resolvedSidoCode = sidoCode?.trim() ?? "";

  return useQuery({
    queryKey: dateCourseQueryKeys.sigungus(roomId ?? "", resolvedSidoCode),
    queryFn: () => {
      if (!roomId || resolvedSidoCode.length === 0) {
        throw new Error("roomId and sidoCode are required");
      }

      return dateCourseApi.listDateCourseSigungus(roomId, resolvedSidoCode);
    },
    staleTime: ONE_DAY_MS,
    gcTime: ONE_DAY_MS,
    retry: 1,
    enabled: enabled && Boolean(roomId) && resolvedSidoCode.length > 0,
    ...(queryOptions ?? {}),
  });
}
