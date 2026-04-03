import { useQuery } from "@tanstack/react-query";

import { api } from "@/shared/api/axios";
import { queryKeys } from "@/shared/lib/queryKeys";

export type CourseSummary = {
  id: string;
  title: string;
  placeCount: number;
};

export function useCourseListQuery(filters?: { savedOnly?: boolean }) {
  return useQuery({
    queryKey: queryKeys.courses.list(filters),
    queryFn: async () => {
      const { data } = await api.get<CourseSummary[]>("/courses", { params: filters });
      return data;
    },
  });
}

export function useCourseDetailQuery(courseId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.courses.detail(courseId ?? ""),
    queryFn: async () => {
      if (!courseId) throw new Error("courseId is required");
      const { data } = await api.get(`/courses/${courseId}`);
      return data;
    },
    enabled: Boolean(courseId),
  });
}
