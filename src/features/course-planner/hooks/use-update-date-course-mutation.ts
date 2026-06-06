import { useMutation, useQueryClient } from "@tanstack/react-query";

import { dateCourseApi } from "@/features/course-planner/api/date-course-api";
import { dateCourseQueryKeys } from "@/features/course-planner/query-keys";

type UpdateDateCourseMutationVariables = {
  roomId: string;
  dateCourseId: string;
  courseName: string;
  roomPlaceIds: number[];
};

export function useUpdateDateCourseMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      roomId,
      dateCourseId,
      courseName,
      roomPlaceIds,
    }: UpdateDateCourseMutationVariables) =>
      dateCourseApi.updateDateCourse(roomId, dateCourseId, {
        courseName,
        roomPlaceIds,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: dateCourseQueryKeys.all });
    },
  });
}
